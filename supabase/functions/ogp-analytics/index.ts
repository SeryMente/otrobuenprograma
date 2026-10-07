import { createClient } from 'npm:@supabase/supabase-js@2';

const ALLOWED_ORIGIN = 'https://serymente.github.io';
const MAX_BODY_BYTES = 32_768;
const MAX_EVENTS = 10;
const MAX_STRING = 512;
const EVENT_NAMES = new Set([
  'page_view',
  'session_start',
  'engagement',
  'cta_click',
  'conversion',
]);

type IncomingEvent = {
  event_name: string;
  path: string;
  referrer?: string | null;
  campaign_source?: string | null;
  campaign_medium?: string | null;
  campaign_name?: string | null;
  campaign_content?: string | null;
  campaign_term?: string | null;
  visitor_id?: string | null;
  session_id?: string | null;
  user_id?: string | null;
  country?: string | null;
  region?: string | null;
  device_class?: string | null;
  browser_family?: string | null;
  os_family?: string | null;
  viewport_class?: string | null;
  language?: string | null;
  timezone?: string | null;
  consent_analytics: boolean;
  consent_marketing?: boolean;
  schema_version?: string;
  ga?: {
    client_id?: string;
    session_id?: string;
    engagement_time_msec?: number;
  } | null;
};

function corsHeaders(origin: string | null): HeadersInit {
  return {
    'Access-Control-Allow-Origin': origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : 'null',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(origin),
  });
}

function cleanString(value: unknown, max = MAX_STRING): string | null {
  if (typeof value !== 'string') return null;
  const s = value.trim();
  return s ? s.slice(0, max) : null;
}

function cleanUuid(value: unknown): string | null {
  const s = cleanString(value, 64);
  if (!s) return null;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)
    ? s
    : null;
}

function normaliseEvent(raw: IncomingEvent) {
  if (!raw || typeof raw !== 'object') throw new Error('invalid event');
  const event_name = cleanString(raw.event_name, 64);
  const path = cleanString(raw.path, 512);

  if (!event_name || !EVENT_NAMES.has(event_name)) throw new Error('invalid event_name');
  if (!path || !path.startsWith('/')) throw new Error('invalid path');
  if (raw.consent_analytics !== true) throw new Error('analytics consent required');

  return {
    event_name,
    path,
    referrer: cleanString(raw.referrer),
    campaign_source: cleanString(raw.campaign_source, 128),
    campaign_medium: cleanString(raw.campaign_medium, 128),
    campaign_name: cleanString(raw.campaign_name, 128),
    campaign_content: cleanString(raw.campaign_content, 128),
    campaign_term: cleanString(raw.campaign_term, 128),
    visitor_id: cleanUuid(raw.visitor_id),
    session_id: cleanUuid(raw.session_id),
    user_id: cleanString(raw.user_id, 256),
    country: cleanString(raw.country, 64),
    region: cleanString(raw.region, 128),
    device_class: cleanString(raw.device_class, 32),
    browser_family: cleanString(raw.browser_family, 64),
    os_family: cleanString(raw.os_family, 64),
    viewport_class: cleanString(raw.viewport_class, 32),
    language: cleanString(raw.language, 32),
    timezone: cleanString(raw.timezone, 64),
    consent_analytics: true,
    consent_marketing: raw.consent_marketing === true,
    schema_version: cleanString(raw.schema_version, 16) ?? '1',
  };
}

async function forwardToGa4(events: IncomingEvent[]) {
  const measurementId = Deno.env.get('GA4_MEASUREMENT_ID');
  const apiSecret = Deno.env.get('GA4_API_SECRET');

  if (!measurementId || !apiSecret) return { forwarded: false, reason: 'GA4 not configured' };

  const clientId = events.find((e) => e.ga?.client_id)?.ga?.client_id
    ?? crypto.randomUUID();

  const payloadEvents = events.map((e) => ({
    name: e.event_name,
    params: {
      page_location: e.path,
      page_referrer: e.referrer ?? undefined,
      session_id: e.ga?.session_id ?? e.session_id ?? undefined,
      engagement_time_msec: e.ga?.engagement_time_msec ?? undefined,
      campaign_source: e.campaign_source ?? undefined,
      campaign_medium: e.campaign_medium ?? undefined,
      campaign_name: e.campaign_name ?? undefined,
    },
  }));

  const url =
    'https://www.google-analytics.com/mp/collect' +
    `?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      events: payloadEvents,
    }),
  });

  return { forwarded: response.ok, status: response.status };
}

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const secretKeysRaw = Deno.env.get('SUPABASE_SECRET_KEYS');

if (!supabaseUrl || !secretKeysRaw) {
  throw new Error('Supabase server configuration is incomplete');
}

const secretKeys = JSON.parse(secretKeysRaw);
const secretKey = secretKeys.default;

if (!secretKey) {
  throw new Error('Supabase default secret key is missing');
}

const supabaseAdmin = createClient(supabaseUrl, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (origin !== ALLOWED_ORIGIN) {
    return json({ error: 'origin_not_allowed' }, 403, origin);
  }

  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405, origin);
  }

  const contentLength = Number(req.headers.get('content-length') ?? '0');
  if (contentLength > MAX_BODY_BYTES) {
    return json({ error: 'payload_too_large' }, 413, origin);
  }

  try {
    const body = await req.json();

    const events: IncomingEvent[] =
      Array.isArray(body) ? body : Array.isArray(body?.events) ? body.events : [body];

    if (events.length < 1 || events.length > MAX_EVENTS) {
      return json({ error: 'invalid_event_count' }, 400, origin);
    }

    const normalized = events.map(normaliseEvent);

    const { error } = await supabaseAdmin
      .from('analytics_events')
      .insert(normalized);

    if (error) {
      console.error('analytics insert failed', error);
      return json({ error: 'storage_failed' }, 500, origin);
    }

    // Forwarding is best-effort. Own storage remains the source of truth.
    let ga = { forwarded: false as boolean, reason: 'not attempted' as string };
    try {
      ga = await forwardToGa4(events);
    } catch (error) {
      console.error('GA4 forwarding failed', error);
      ga = { forwarded: false, reason: 'forwarding_error' };
    }

    return json({ accepted: normalized.length, ga }, 202, origin);
  } catch (error) {
    console.error('analytics request failed', error);
    return json({ error: 'invalid_request' }, 400, origin);
  }
});
