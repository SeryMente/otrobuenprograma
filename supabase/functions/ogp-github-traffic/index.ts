import { createClient } from 'npm:@supabase/supabase-js@2';

const OWNER = 'SeryMente';
const REPO = 'otrogranprograma';
const GITHUB_API = `https://api.github.com/repos/${OWNER}/${REPO}/traffic`;
const API_VERSION = '2026-03-10';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function requiredSecret(name: string): string {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

async function githubGet(path: string, token: string) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': API_VERSION,
      'User-Agent': 'OGP-Traffic-Collector',
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub ${response.status}: ${detail.slice(0, 400)}`);
  }
  return response.json();
}

function requireCollectorToken(req: Request) {
  const expected = requiredSecret('GITHUB_TRAFFIC_COLLECTOR_TOKEN');
  const supplied = req.headers.get('x-ogp-collector-token');
  if (!supplied || supplied !== expected) throw new Error('collector_auth_failed');
}

function toDailyMap(items: Array<{ timestamp: string; count: number; uniques: number }>) {
  return items.reduce<Record<string, { count: number; uniques: number }>>((map, item) => {
    const date = item.timestamp.slice(0, 10);
    map[date] = { count: Number(item.count || 0), uniques: Number(item.uniques || 0) };
    return map;
  }, {});
}

const supabaseUrl = requiredSecret('SUPABASE_URL');
const secretKeysRaw = requiredSecret('SUPABASE_SECRET_KEYS');
const secretKeys = JSON.parse(secretKeysRaw);
const secretKey = secretKeys.default;
if (!secretKey) throw new Error('Supabase default secret key is missing');

const admin = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  try {
    requireCollectorToken(req);

    const githubToken = requiredSecret('GITHUB_TRAFFIC_TOKEN');
    const [views, clones, referrers, paths] = await Promise.all([
      githubGet('/views?per=day', githubToken),
      githubGet('/clones?per=day', githubToken),
      githubGet('/popular/referrers', githubToken),
      githubGet('/popular/paths', githubToken),
    ]);

    const viewsByDay = toDailyMap(views.views || []);
    const clonesByDay = toDailyMap(clones.clones || []);
    const dates = new Set([...Object.keys(viewsByDay), ...Object.keys(clonesByDay)]);

    const rows = [...dates].sort().map((date) => ({
      traffic_date: date,
      views_total: viewsByDay[date]?.count || 0,
      views_unique: viewsByDay[date]?.uniques || 0,
      clones_total: clonesByDay[date]?.count || 0,
      clones_unique: clonesByDay[date]?.uniques || 0,
      referrers: Array.isArray(referrers) ? referrers : [],
      popular_paths: Array.isArray(paths) ? paths : [],
      fetched_at: new Date().toISOString(),
      schema_version: '1',
    }));

    if (!rows.length) return json({ ok: true, archived: 0 });

    const { error } = await admin.from('github_traffic_daily').upsert(rows, { onConflict: 'traffic_date' });
    if (error) {
      console.error('traffic archive failed', error);
      return json({ error: 'storage_failed' }, 500);
    }

    return json({ ok: true, archived: rows.length, from: rows[0].traffic_date, to: rows[rows.length - 1].traffic_date });
  } catch (error) {
    console.error('traffic collector failed', error);
    if (error instanceof Error && error.message === 'collector_auth_failed') return json({ error: 'forbidden' }, 403);
    return json({ error: 'collector_failed' }, 500);
  }
});
