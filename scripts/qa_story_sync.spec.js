const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const URL = "http://127.0.0.1:4173/";
const timingPath = path.join(process.cwd(), "assets", "data", "story-word-timing.json");

test("F4 transport is embedded in the right roadmap", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await expect(page.locator(".story-player")).toHaveCount(0);
  await expect(page.locator(".story-micro-rail")).toHaveCount(1);
  await expect(page.locator(".story-micro-controls")).toHaveCount(1);
  await expect(page.locator(".story-micro-play")).toHaveCount(1);
  await expect(page.locator(".story-micro-prev")).toHaveCount(1);
  await expect(page.locator(".story-micro-next")).toHaveCount(1);
  await expect(page.locator(".story-micro-progress")).toHaveCount(1);
  await expect(page.locator(".story-micro-rail")).toHaveCSS("position", "fixed");
  await expect(page.locator(".story-micro-rail")).toHaveCSS("right", /px/);
});

test("F4 hero composition is Author then title then subtitle", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  const order = await page.evaluate(() => {
    const hero = document.querySelector(".obp-hero");
    return [...hero.children].map((el) => ({
      cls: el.className,
      text: el.textContent.trim().slice(0, 80)
    }));
  });
  expect(order[0].cls).toContain("obp-author-card");
  expect(order[1].cls).toContain("obp-hero-copy");
  await expect(page.locator("#obp-title")).toHaveText("Otro Gran Programa");
  await expect(page.locator(".obp-hero-dek")).toHaveText(
    "una iniciativa para revolucionar la manera en la que aliviaremos la disfunción familiar para nuestros hijos y sus hijos también."
  );
});

test("F4 sampled word mapping has zero wrong-word hits", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.locator("#relato-sonoro").scrollIntoViewIfNeeded();
  const timing = JSON.parse(fs.readFileSync(timingPath, "utf8"));
  const samples = [];

  for (const seg of timing.segments) {
    const words = seg.words || [];
    const indices = [...new Set([
      0,
      Math.floor(words.length * 0.125),
      Math.floor(words.length * 0.25),
      Math.floor(words.length * 0.375),
      Math.floor(words.length * 0.5),
      Math.floor(words.length * 0.625),
      Math.floor(words.length * 0.75),
      Math.max(0, words.length - 1)
    ])].filter((i) => i >= 0 && i < words.length).sort((a,b) => a-b);

    const segmentButton = page.locator('.story-micro-segment[data-segment="' + seg.id + '"]');
    await segmentButton.click();
    await page.waitForFunction(() => {
      const a = document.querySelector(".story-audio");
      return !!a && a.readyState >= 1 && Number.isFinite(a.duration);
    });

    await page.evaluate(() => document.querySelector(".story-audio").pause());

    for (const index of indices) {
      const word = words[index];
      const targetTime = Math.max(0, (Number(word.start) + Number(word.end)) / 2);
      await page.evaluate((t) => {
        const a = document.querySelector(".story-audio");
        a.pause();
        a.currentTime = t;
      }, targetTime);
      await page.waitForTimeout(24);

      const observed = await page.evaluate(() => {
        const active = document.querySelector(".story-stop.is-active .story-word.is-current");
        return active ? {
          segment: active.dataset.segment,
          word: Number(active.dataset.word)
        } : null;
      });

      samples.push({
        segment: String(seg.id),
        expected: index,
        observed: observed && observed.segment === String(seg.id) ? observed.word : null
      });
    }
  }

  const wrong = samples.filter((s) => s.observed !== s.expected);
  const report = {
    metric: "M10_wrong_word_rate_pct",
    samples: samples.length,
    wrong: wrong.length,
    wrongWordRatePct: Number((wrong.length / samples.length * 100).toFixed(4)),
    wrongExamples: wrong.slice(0, 20)
  };
  fs.mkdirSync(path.dirname("test-results/story-sync-runtime-benchmark.json"), { recursive: true });
  fs.writeFileSync("test-results/story-sync-runtime-benchmark.json", JSON.stringify(report, null, 2));

  console.log("STORY_SYNC_SAMPLE_BENCHMARK=" + JSON.stringify(report));
  expect(wrong.length, JSON.stringify(wrong.slice(0, 10))).toBe(0);
});

test("F4 runtime word clock measures highlight boundary latency", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.locator("#relato-sonoro").scrollIntoViewIfNeeded();

  await page.locator('.story-micro-segment[data-segment="01"]').click();
  await page.waitForFunction(() => {
    const a = document.querySelector(".story-audio");
    return !!a && a.readyState >= 1 && Number.isFinite(a.duration);
  });

  await page.evaluate(() => {
    const a = document.querySelector(".story-audio");
    a.pause();
    a.currentTime = 0;
    a.playbackRate = 8;
    window.__ogpSyncDiagnostics.transitions.length = 0;
  });
  await page.waitForTimeout(50);
  await page.locator(".story-micro-play").click();
  await page.waitForTimeout(4300);
  await page.evaluate(() => document.querySelector(".story-audio").pause());

  const result = await page.evaluate(async () => {
    const timing = await fetch("assets/data/story-word-timing.json", { cache: "no-store" }).then((r) => r.json());
    const seg = timing.segments.find((s) => String(s.id) === "01");
    const starts = Object.fromEntries(seg.words.map((w) => [String(w.index), Number(w.start)]));
    const transitions = (window.__ogpSyncDiagnostics.transitions || [])
      .filter((t) => String(t.segment) === "01" && Number(t.to) >= 0)
      .map((t) => ({
        index: Number(t.to),
        errorMs: Math.abs((Number(t.audioTime) - Number(starts[String(t.to)])) * 1000)
      }));
    const errors = transitions.map((t) => t.errorMs);
    const pct = (arr, p) => {
      if (!arr.length) return 0;
      const s = [...arr].sort((a,b) => a-b);
      const k = (s.length - 1) * p;
      const f = Math.floor(k), c = Math.ceil(k);
      return f === c ? s[f] : s[f] + (s[c] - s[f]) * (k - f);
    };
    const monotonic = transitions.every((t, i, a) => i === 0 || t.index > a[i - 1].index);
    return {
      transitions: transitions.length,
      M9_visual_latency_ms_p50: Number(pct(errors, .5).toFixed(3)),
      M9_visual_latency_ms_p95: Number(pct(errors, .95).toFixed(3)),
      M9_visual_latency_ms_max: Number(Math.max(0, ...errors).toFixed(3)),
      M12_word_transition_monotonicity_pct: monotonic ? 100 : 0
    };
  });

  fs.mkdirSync(path.dirname("test-results/story-sync-runtime-benchmark.json"), { recursive: true });
  fs.writeFileSync("test-results/story-sync-runtime-benchmark.json", JSON.stringify(result, null, 2));
  console.log("STORY_SYNC_RUNTIME_BENCHMARK=" + JSON.stringify(result));

  expect(result.transitions).toBeGreaterThan(5);
  expect(result.M9_visual_latency_ms_p95).toBeLessThanOrEqual(120);
  expect(result.M12_word_transition_monotonicity_pct).toBe(100);
});
