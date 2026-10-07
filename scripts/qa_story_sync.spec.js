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

async function loadAndPauseSegment(page, id) {
  const segmentButton = page.locator('.story-micro-segment[data-segment="' + id + '"]');
  await segmentButton.click();
  await page.waitForFunction((segmentId) => {
    const a = document.querySelector(".story-audio");
    const active = document.querySelector(".story-stop.is-active");
    return !!a &&
      !!active &&
      active.dataset.segment === String(segmentId) &&
      a.readyState >= 1 &&
      Number.isFinite(a.duration);
  }, id);
  await page.evaluate(() => document.querySelector(".story-audio").pause());
  await page.waitForFunction(() => {
    const a = document.querySelector(".story-audio");
    return !!a && a.paused;
  });
}

async function seekAndRead(page, targetTime, expectedSegment) {
  return page.evaluate(async ({ targetTime, expectedSegment }) => {
    const a = document.querySelector(".story-audio");
    if (!a) return { ok: false, reason: "no-audio" };

    a.pause();
    a.currentTime = targetTime;
    const deadline = performance.now() + 650;
    while (performance.now() < deadline) {
      const current = Number(a.currentTime);
      const active = document.querySelector(".story-stop.is-active .story-word.is-current");
      const stable = Math.abs(current - targetTime) <= 0.08;
      if (stable && active && String(active.dataset.segment) === String(expectedSegment)) break;
      await new Promise((r) => requestAnimationFrame(r));
    }

    const active = document.querySelector(".story-stop.is-active .story-word.is-current");
    const current = Number(a.currentTime);
    return {
      ok: true,
      expectedSegment: String(expectedSegment),
      observedSegment: active ? String(active.dataset.segment) : null,
      observedWord: active ? Number(active.dataset.word) : null,
      currentTime: Number.isFinite(current) ? Number(current.toFixed(3)) : null,
      timeErrorMs: Number.isFinite(current) ? Number(Math.abs(current - targetTime).toFixed(3)) * 1000 : null,
      paused: a.paused,
      seekStable: Number.isFinite(current) && Math.abs(current - targetTime) <= 0.08
    };
  }, { targetTime, expectedSegment });
}

test("F4 deterministic sampled word mapping benchmark", async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.locator("#relato-sonoro").scrollIntoViewIfNeeded();

  const timing = JSON.parse(fs.readFileSync(timingPath, "utf8"));
  const samples = [];

  for (const seg of timing.segments) {
    const words = seg.words || [];
    const indices = [...new Set([
      0,
      Math.floor(words.length * 0.2),
      Math.floor(words.length * 0.4),
      Math.floor(words.length * 0.6),
      Math.floor(words.length * 0.8),
      Math.max(0, words.length - 1)
    ])].filter((i) => i >= 0 && i < words.length).sort((a,b) => a-b);

    await loadAndPauseSegment(page, String(seg.id));

    for (const index of indices) {
      const word = words[index];
      const targetTime = (Number(word.start) + Number(word.end)) / 2;
      const observed = await seekAndRead(page, targetTime, String(seg.id));
      samples.push({
        segment: String(seg.id),
        expected: index,
        observed: observed.observedSegment === String(seg.id) ? observed.observedWord : null,
        observedSegment: observed.observedSegment,
        currentTime: observed.currentTime,
        timeErrorMs: observed.timeErrorMs,
        seekStable: observed.seekStable === true
      });
    }
  }

  const unstableSeeks = samples.filter((s) => !s.seekStable);
  const missed = samples.filter((s) => s.observed === null);
  const wrong = samples.filter((s) => s.observed !== null && s.observed !== s.expected);
  const correct = samples.filter((s) => s.observed === s.expected);
  const report = {
    benchmark: "F4 deterministic seek benchmark",
    metric: "runtime_word_mapping",
    samples: samples.length,
    correct: correct.length,
    missed: missed.length,
    wrong: wrong.length,
    correctRatePct: Number((correct.length / samples.length * 100).toFixed(4)),
    M10_wrong_word_rate_pct: Number((wrong.length / samples.length * 100).toFixed(4)),
    M11_missed_word_rate_pct: Number((missed.length / samples.length * 100).toFixed(4)),
    M13_seek_stability_pct: Number(((samples.length - unstableSeeks.length) / samples.length * 100).toFixed(4)),
    wrongExamples: wrong.slice(0, 20),
    missedExamples: missed.slice(0, 20),
    probeTimeErrorMsP95: Number(percentile(samples.map((s) => Number(s.timeErrorMs) || 0), 0.95).toFixed(3)),
    unstableSeekExamples: unstableSeeks.slice(0, 20)
  };

  fs.mkdirSync(path.dirname("test-results/story-sync-deterministic-benchmark.json"), { recursive: true });
  fs.writeFileSync(
    "test-results/story-sync-deterministic-benchmark.json",
    JSON.stringify(report, null, 2)
  );

  console.log("STORY_SYNC_DETERMINISTIC_BENCHMARK=" + JSON.stringify(report));

  expect(wrong.length, JSON.stringify(wrong.slice(0, 10))).toBe(0);
  expect(missed.length, JSON.stringify(missed.slice(0, 10))).toBe(0);
  expect(unstableSeeks.length, JSON.stringify(unstableSeeks.slice(0, 10))).toBe(0);
});

function percentile(values, p) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const k = (s.length - 1) * p;
  const f = Math.floor(k);
  const c = Math.ceil(k);
  return f === c ? s[f] : s[f] + (s[c] - s[f]) * (k - f);
}

test("F4 runtime word clock benchmark at 1x", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.locator("#relato-sonoro").scrollIntoViewIfNeeded();

  await loadAndPauseSegment(page, "04");

  await page.evaluate(() => {
    const a = document.querySelector(".story-audio");
    a.pause();
    a.currentTime = 0;
    a.playbackRate = 1;
    window.__ogpSyncDiagnostics.transitions.length = 0;
    window.__ogpSyncDiagnostics.frames = 0;
  });

  await page.locator(".story-micro-play").click();
  await page.waitForTimeout(15000);
  await page.evaluate(() => document.querySelector(".story-audio").pause());

  const result = await page.evaluate(async () => {
    const timing = await fetch("assets/data/story-word-timing.json", { cache: "no-store" }).then((r) => r.json());
    const seg = timing.segments.find((s) => String(s.id) === "04");
    const starts = Object.fromEntries(seg.words.map((w) => [String(w.index), Number(w.start)]));
    const transitions = (window.__ogpSyncDiagnostics.transitions || [])
      .filter((t) => String(t.segment) === "04" && Number(t.to) >= 0)
      .map((t) => ({
        index: Number(t.to),
        errorMs: Math.max(0, Number((Number(t.audioTime) - Number(starts[String(t.to)])) * 1000))
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
      frames: Number(window.__ogpSyncDiagnostics.frames || 0),
      M9_visual_latency_ms_p50: Number(pct(errors, .50).toFixed(3)),
      M9_visual_latency_ms_p95: Number(pct(errors, .95).toFixed(3)),
      M9_visual_latency_ms_p99: Number(pct(errors, .99).toFixed(3)),
      M9_visual_latency_ms_max: Number(Math.max(0, ...errors).toFixed(3)),
      M12_word_transition_monotonicity_pct: monotonic ? 100 : 0
    };
  });

  fs.mkdirSync(path.dirname("test-results/story-sync-runtime-benchmark.json"), { recursive: true });
  fs.writeFileSync("test-results/story-sync-runtime-benchmark.json", JSON.stringify(result, null, 2));
  console.log("STORY_SYNC_RUNTIME_BENCHMARK=" + JSON.stringify(result));

  expect(result.transitions).toBeGreaterThan(12);
  expect(result.M9_visual_latency_ms_p95).toBeLessThanOrEqual(50);
  expect(result.M12_word_transition_monotonicity_pct).toBe(100);
});
