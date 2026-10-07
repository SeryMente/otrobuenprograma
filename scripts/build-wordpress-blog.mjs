#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../", import.meta.url)));
const OUTPUT_DIR = resolve(ROOT, process.env.BLOG_OUTPUT_DIR || "blog");
const MEDIA_DIR = join(OUTPUT_DIR, "assets", "media");
const SOURCE = (process.env.WORDPRESS_BASE_URL || "").replace(/\/$/, "");
const PUBLIC_BASE = (process.env.BLOG_PUBLIC_BASE_URL ||
  "https://serymente.github.io/otrogranprograma/blog/").replace(/\/$\/, "");

if (!SOURCE) {
  console.error("BLOG_BUILD_ERROR: WORDPRESS_BASE_URL is required.");
  process.exit(2);
}

const imageCache = new Map();

function htmlEscape(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function decodeEntities(value = "") {
  return String(value)
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripTags(value = "") {
  return decodeEntities(String(value).replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value = "") {
  return decodeEntities(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "entrada";
}

function safeFileName(urlString) {
  const u = new URL(urlString);
  const raw = basename(u.pathname) || "image";
  const extension = extname(raw).toLowerCase() || ".bin";
  const stem = raw.slice(0, raw.length - extension.length)
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(0, 90) || "image";
  const hash = createHash("sha256").update(urlString).digest("hex").slice(0, 10);
  return stem + "-" + hash + extension;
}

function normalizeRemoteUrl(value) {
  if (!value) return null;
  if (value.startsWith("//")) return "https:" + value;
  if (/^https?:\/\//i.test(value)) return value;
  return null;
}

function sanitizeHtml(html = "") {
  return String(html)
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "")
    .replace(/\s+on[a-z]+\s*=\s*(".*?"|'.*?'|[^\s>]+)/gi, "");
}

async function downloadImage(urlString) {
  const url = normalizeRemoteUrl(urlString);
  if (!url) return null;
  if (imageCache.has(url)) return imageCache.get(url);

  const filename = safeFileName(url);
  const outputPath = join(MEDIA_DIR, filename);
  await mkdir(MEDIA_DIR, { recursive: true });

  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    console.warn("BLOG_MEDIA_SKIP:", response.status, url);
    imageCache.set(url, null);
    return null;
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(outputPath, bytes);
  imageCache.set(url, filename);
  return filename;
}

async function rewriteImages(html, fromDirectory) {
  const source = sanitizeHtml(html);

  const withSrc = await replaceAsync(
    source,
    /(<img\b[^>]*\bsrc\s*=\s*["'])([^"']+)(["'][^>]*>)/gi,
    async (_, prefix, url, suffix) => {
      const filename = await downloadImage(url);
      if (!filename) return prefix + url + suffix;
      return prefix + relative(fromDirectory, join(MEDIA_DIR, filename)).replaceAll("\\", "/") + suffix;
    }
  );

  return replaceAsync(
    withSrc,
    /(<img\b[^>]*\bsrcset\s*=\s*["'])([^"']+)(["'][^>]*>)/gi,
    async (_, prefix, srcset, suffix) => {
      const candidates = [];
      for (const candidate of srcset.split(",")) {
        const parts = candidate.trim().split(/\s+/);
        const filename = await downloadImage(parts[0]);
        if (filename) {
          parts[0] = relative(fromDirectory, join(MEDIA_DIR, filename)).replaceAll("\\", "/");
        }
        candidates.push(parts.join(" "));
      }
      return prefix + candidates.join(", ") + suffix;
    }
  );
}

async function replaceAsync(text, regex, replacer) {
  const matches = [];
  text.replace(regex, (...args) => {
    matches.push(args);
    return args[0];
  });

  if (!matches.length) return text;

  let output = "";
  let cursor = 0;
  for (const args of matches) {
    const full = args[0];
    const index = args[args.length - 2];
    output += text.slice(cursor, index);
    output += await replacer(...args);
    cursor = index + full.length;
  }
  output += text.slice(cursor);
  return output;
}

async function fetchJson(path, query = {}) {
  const url = new URL(SOURCE + path);
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, String(value)));
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`WordPress API ${response.status} at ${url}: ${body.slice(0, 300)}`);
  }
  return { data: await response.json(), headers: response.headers };
}

async function fetchAllPosts() {
  const posts = [];
  let page = 1;

  while (true) {
    const { data, headers } = await fetchJson("/wp-json/wp/v2/posts", {
      page,
      per_page: 100,
      _embed: 1,
      orderby: "date",
      order: "desc"
    });

    posts.push(...data);

    const totalPages = Number(headers.get("x-wp-totalpages") || page);
    if (page >= totalPages) break;
    page += 1;
  }

  return posts;
}

function getFeaturedImage(post) {
  return post?._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;
}

function getTerms(post) {
  const groups = post?._embedded?.["wp:term"] || [];
  const terms = groups.flat().filter(Boolean);
  return terms.map(term => ({
    taxonomy: term.taxonomy,
    name: stripTags(term.name || ""),
    slug: term.slug || ""
  }));
}

function articlePath(slug) {
  return join(OUTPUT_DIR, "posts", slug, "index.html");
}

async function renderPost(post, indexByLink) {
  const slug = slugify(post.slug || post.title?.rendered || String(post.id));
  const outputPath = articlePath(slug);
  const outputDir = resolve(outputPath, "..");
  await mkdir(outputDir, { recursive: true });

  let content = post.content?.rendered || "";
  content = await rewriteImages(content, outputDir);

  for (const [remote, localSlug] of indexByLink.entries()) {
    content = content.replaceAll(remote, PUBLIC_BASE + "posts/" + localSlug + "/");
  }

  const title = stripTags(post.title?.rendered || "Sin título");
  const excerpt = stripTags(post.excerpt?.rendered || "");
  const published = post.date ? new Date(post.date) : null;
  const modified = post.modified ? new Date(post.modified) : null;
  const featured = getFeaturedImage(post);

  let featuredHtml = "";
  if (featured) {
    const local = await downloadImage(featured);
    if (local) {
      featuredHtml = `<img class="hero-image" src="${relative(outputDir, join(MEDIA_DIR, local)).replaceAll("\\", "/")}" alt="${htmlEscape(title)}">`;
    }
  }

  const canonical = PUBLIC_BASE + "posts/" + slug + "/";
  const dateLabel = published && !Number.isNaN(published.valueOf())
    ? published.toISOString().slice(0, 10)
    : "";

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${htmlEscape(title)} · Ser y Mente</title>
<meta name="description" content="${htmlEscape(excerpt.slice(0, 155))}">
<link rel="canonical" href="${htmlEscape(canonical)}">
<link rel="stylesheet" href="../../assets/blog.css">
</head>
<body>
<header class="site-header">
  <a class="brand" href="../../">Ser y Mente</a>
  <a class="back" href="../../">Blog</a>
</header>
<main class="article">
  <p class="eyebrow">Ser y Mente · Blog</p>
  <h1>${htmlEscape(title)}</h1>
  ${dateLabel ? `<p class="date">${htmlEscape(dateLabel)}</p>` : ""}
  ${featuredHtml}
  <article class="content">${content}</article>
</main>
<footer><a href="../../">Volver al blog</a></footer>
</body>
</html>
`;

  await writeFile(outputPath, html, "utf8");

  return {
    id: post.id,
    slug,
    url: canonical,
    link: post.link,
    title,
    excerpt,
    date: post.date || null,
    modified: post.modified || null,
    categories: getTerms(post).filter(t => t.taxonomy === "category").map(t => t.name),
    tags: getTerms(post).filter(t => t.taxonomy === "post_tag").map(t => t.name)
  };
}

function renderIndex(items) {
  const cards = items.map(item => `
<article class="card">
  <p class="date">${htmlEscape(item.date ? item.date.slice(0, 10) : "")}</p>
  <h2><a href="posts/${htmlEscape(item.slug)}/">${htmlEscape(item.title)}</a></h2>
  <p>${htmlEscape(item.excerpt)}</p>
  <a class="read" href="posts/${htmlEscape(item.slug)}/">Leer →</a>
</article>`).join("\n");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Blog · Ser y Mente</title>
<meta name="description" content="Archivo editorial de Ser y Mente.">
<link rel="stylesheet" href="assets/blog.css">
</head>
<body>
<header class="site-header">
  <div>
    <p class="eyebrow">Ser y Mente</p>
    <h1>Blog</h1>
  </div>
  <span class="status">sitio estático</span>
</header>
<main class="listing">
  <p class="intro">Ensayos, ideas y recursos sobre salud mental, psicoterapia y vida humana.</p>
  <section class="grid">${cards || "<p>El archivo aún no contiene entradas publicadas.</p>"}</section>
</main>
<footer>Ser y Mente</footer>
</body>
</html>
`;
}

function renderCss() {
  return `:root{color-scheme:light;--ink:#171717;--muted:#666;--paper:#f7f5ef;--line:#d8d3c7}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.7 Georgia,serif}
.site-header{display:flex;justify-content:space-between;gap:24px;align-items:end;max-width:1000px;margin:0 auto;padding:48px 24px 28px;border-bottom:1px solid var(--line)}
.brand,.site-header a{color:inherit;text-decoration:none}
.brand{font-weight:700;letter-spacing:.02em}
.site-header h1{font-size:clamp(2rem,5vw,4.2rem);line-height:1;margin:0}
.eyebrow,.date,.status{font:12px/1.3 ui-monospace,SFMono-Regular,Menlo,monospace;text-transform:uppercase;letter-spacing:.08em}
.eyebrow,.date,.status{color:var(--muted)}
.listing,.article{max-width:1000px;margin:0 auto;padding:48px 24px 80px}
.intro{max-width:700px;font-size:1.2rem}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:22px;margin-top:36px}
.card{padding:24px;border:1px solid var(--line);background:#fff}
.card h2{font-size:1.5rem;line-height:1.2;margin:.4rem 0 1rem}
.card h2 a,.read{color:inherit}
.article h1{max-width:820px;font-size:clamp(2.2rem,6vw,5rem);line-height:1.05;margin:.3rem 0}
.content{max-width:760px;font-size:1.08rem}
.content img{max-width:100%;height:auto}
.content iframe{max-width:100%}
.hero-image{display:block;max-width:100%;height:auto;margin:28px 0 40px}
.back{font-size:.9rem}
footer{max-width:1000px;margin:0 auto;padding:24px;border-top:1px solid var(--line);color:var(--muted);font:13px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace}
@media(max-width:620px){.site-header{padding-top:28px;flex-direction:column;align-items:flex-start}.listing,.article{padding-top:32px}}
`;
}

function renderFeed(items) {
  const channelItems = items.slice(0, 20).map(item => `
<item>
<title>${escapeXml(item.title)}</title>
<link>${escapeXml(item.url)}</link>
<guid isPermaLink="true">${escapeXml(item.url)}</guid>
<description>${escapeXml(item.excerpt)}</description>
<pubDate>${item.date ? new Date(item.date).toUTCString() : new Date().toUTCString()}</pubDate>
</item>`).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>Ser y Mente · Blog</title>
<link>${escapeXml(PUBLIC_BASE)}</link>
<description>Archivo editorial de Ser y Mente.</description>
${channelItems}
</channel></rss>`;
}

function renderSitemap(items) {
  const urls = [PUBLIC_BASE, ...items.map(item => item.url)];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `<url><loc>${escapeXml(url)}</loc></url>`).join("\n")}
</urlset>`;
}

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function main() {
  console.log("BLOG_BUILD_SOURCE:", SOURCE);
  const posts = await fetchAllPosts();
  console.log("BLOG_POSTS_FETCHED:", posts.length);

  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });
  await mkdir(MEDIA_DIR, { recursive: true });

  await writeFile(join(OUTPUT_DIR, "assets", "blog.css"), renderCss(), "utf8");

  const indexByLink = new Map();
  for (const post of posts) {
    indexByLink.set(post.link, slugify(post.slug || post.title?.rendered || String(post.id)));
  }

  const items = [];
  for (const post of posts) {
    items.push(await renderPost(post, indexByLink));
  }

  await writeFile(join(OUTPUT_DIR, "data.json"), JSON.stringify(items, null, 2), "utf8");
  await writeFile(join(OUTPUT_DIR, "index.html"), renderIndex(items), "utf8");
  await writeFile(join(OUTPUT_DIR, "feed.xml"), renderFeed(items), "utf8");
  await writeFile(join(OUTPUT_DIR, "sitemap.xml"), renderSitemap(items), "utf8");
  await writeFile(join(OUTPUT_DIR, "robots.txt"), "User-agent: *\nAllow: /\n", "utf8");

  console.log("BLOG_BUILD_DONE:", items.length, "posts");
  console.log("BLOG_OUTPUT:", OUTPUT_DIR);
}

main().catch(error => {
  console.error("BLOG_BUILD_ERROR:", error?.stack || error);
  process.exit(1);
});
