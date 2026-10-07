const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const {
  percentile,
  sampleIndices,
  selectorFromTemplate,
  chooseRuntimeSegment,
  normalizeTiming,
  mappingReport
} = require("./lib/sync-benchmark");

const CONFIG = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "scripts", "sync-benchmark.config.json"), "utf8")
);
const URL = process.env.SYNC_BENCHMARK_URL || CONFIG.site.url;
const timingPath = path.join(process.cwd(), CONFIG.timing.path);

function selector(template, id) {
  return selectorFromTemplate(template, id);
}

async function loadAndPauseSegment(page, id) {
  await page.locator(selector(CONFIG.dom.segmentControlSelector, id)).click();
  await page.waitForFunction(
    ({ activeSelector, audioSelector, id }) => {
      const active = document.querySelector(activeSelector);
      const audio = document.querySelector(audioSelector);
      return !!active &&
        active.dataset.syncSegmentId === String(id) &&
        !!audio &&
        audio.readyState >= 3 &&
        Number.isFinite(audio.duration) &&
        audio.seekable.length > 0;
    },
    {
      activeSelector: CONFIG.dom.activeSegmentSelector,
      audioSelector: CONFIG.dom.audioSelector,
      id: String(id)
    },
    { timeout: 15000 }
  );
  await page.evaluate((audioSelector) => {
    const audio = document.querySelector(audioSelector);
    audio.pause();
  }, CONFIG.dom.audioSelector);
}

async function isolateCurrentMedia(page) {
  if (CONFIG.media.mode !== "blob") return;

  await page.evaluate(async (audioSelector) => {
    const audio = document.querySelector(audioSelector);
    if (!audio) throw new Error("Sync contract: audio element not found.");

    const src = audio.currentSrc || audio.src;
    if (!src) throw new Error("Sync contract: active audio has no source.");

    const response = await fetch(src, { cache: "no-store" });
    if (!response.ok) throw new Error("Sync contract: audio fetch failed.");

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    if (window.__syncBenchmarkObjectUrl) {
      URL.revokeObjectURL(window.__syncBenchmarkObjectUrl);
    }
    window.__syncBenchmarkObjectUrl = url;

    audio.pause();
    audio.src = url;
    audio.load();

    await new Promise((resolve, reject) => {
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("Sync contract: isolated audio could not be decoded."));
      };
      const cleanup = () => {
        audio.removeEventListener("loadedmetadata", onReady);
        audio.removeEventListener("error", onError);
      };
      audio.addEventListener("loadedmetadata", onReady, { once: true });
      audio.addEventListener("error", onError, { once: true });
    });
  }, CONFIG.dom.audioSelector);

  await page.waitForFunction(
    (audioSelector) => {
      const audio = document.querySelector(audioSelector);
      return !!audio && audio.readyState >= 3 && audio.seekable.length > 0;
    },
    CONFIG.dom.audioSelector
  );
}

async function seekAndRead(page, segmentId, wordIndex, word) {
  return page.evaluate(
    async ({ activeSegmentSelector, audioSelector, currentWordSelector, seekToleranceMs, stableFrames, segmentId, wordIndex, targetTime }) => {
      const audio = document.querySelector(audioSelector);
      if (!audio) return { ok: false, reason: "audio-missing" };

      const seekToleranceSec = seekToleranceMs / 1000;
      const seekableEnd = audio.seekable.length ? audio.seekable.end(audio.seekable.length - 1) : -1;
      if (seekableEnd + 0.001 < targetTime) {
        return {
          ok: false,
          reason: "target-not-seekable",
          seekEvent: false,
          seekStable: false,
          currentTime: Number(audio.currentTime.toFixed(3)),
          timeErrorMs: Math.round(Math.abs(audio.currentTime - targetTime) * 1000),
          observedSegment: null,
          observedWord: null
        };
      }

      audio.pause();
      let seekEvent = false;
      const seekPromise = new Promise((resolve) => {
        const onSeeked = () => {
          seekEvent = true;
          audio.removeEventListener("seeked", onSeeked);
          resolve();
        };
        audio.addEventListener("seeked", onSeeked, { once: true });
        setTimeout(() => {
          audio.removeEventListener("seeked", onSeeked);
          resolve();
        }, 2000);
      });

      audio.currentTime = targetTime;
      await seekPromise;

      const deadline = performance.now() + 1500;
      let stable = 0;
      while (performance.now() < deadline) {
        const currentTime = Number(audio.currentTime);
        const activeSegment = document.querySelector(activeSegmentSelector);
        const currentWord = document.querySelector(currentWordSelector);
        const sameSegment = activeSegment &&
          String(activeSegment.dataset.syncSegmentId) === String(segmentId);
        const sameTime = Number.isFinite(currentTime) &&
          Math.abs(currentTime - targetTime) <= seekToleranceSec;

        if (sameSegment && sameTime) stable += 1;
        else stable = 0;

        if (stable >= stableFrames) break;
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }

      const activeSegment = document.querySelector(activeSegmentSelector);
      const currentWord = document.querySelector(currentWordSelector);
      const currentTime = Number(audio.currentTime);

      return {
        ok: true,
        seekEvent,
        seekStable: Number.isFinite(currentTime) &&
          Math.abs(currentTime - targetTime) <= seekToleranceSec,
        currentTime: Number.isFinite(currentTime) ? Number(currentTime.toFixed(3)) : null,
        timeErrorMs: Number.isFinite(currentTime) ? Number((Math.abs(currentTime - targetTime) * 1000).toFixed(3)) : null,
        observedSegment: currentWord ? String(currentWord.closest("[data-sync-segment-id]")?.dataset.syncSegmentId || currentWord.dataset.segment || "") : null,
        observedWord: currentWord ? Number(currentWord.dataset.syncWordIndex ?? currentWord.dataset.word) : null,
        expectedWord: Number(wordIndex),
        expectedSegment: String(segmentId)
      };
    },
    {
      activeSegmentSelector: CONFIG.dom.activeSegmentSelector,
      audioSelector: CONFIG.dom.audioSelector,
      currentWordSelector: CONFIG.dom.currentWordSelector,
      seekToleranceMs: CONFIG.sampling.seekToleranceMs,
      stableFrames: CONFIG.sampling.stableFrames,
      segmentId: String(segmentId),
      wordIndex,
      targetTime: (Number(word.start) + Number(word.end)) / 2
    }
  );
}

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
    const hero = document.querySelector(".ogp-hero");
    return [...hero.children].map((el) => ({
      cls: el.className,
      text: el.textContent.trim().slice(0, 80)
    }));
  });
  expect(order[0].cls).toContain("ogp-author-card");
  expect(order[1].cls).toContain("ogp-hero-copy");
  await expect(page.locator("#ogp-title")).toHaveText("Otro Gran Programa");
  await expect(page.locator(".ogp-hero-dek")).toHaveText(
    "una iniciativa para revolucionar la manera en la que aliviaremos la disfunción familiar para nuestros hijos y sus hijos también."
  );
});

test("generic sync benchmark — deterministic mapping", async ({ page }) => {
  test.setTimeout(180000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });

  const timing = normalizeTiming(JSON.parse(fs.readFileSync(timingPath, "utf8")));
  const samples = [];

  for (const segment of timing) {
    const indices = sampleIndices(segment.words, CONFIG.sampling.pointsPerSegment);
    await loadAndPauseSegment(page, segment.id);
    await isolateCurrentMedia(page);

    for (const index of indices) {
      const word = segment.words[index];
      const result = await seekAndRead(page, segment.id, index, word);
      const observedSegment = result.observedSegment;
      const observedWord = Number.isFinite(result.observedWord) ? result.observedWord : null;
      const correct = result.ok &&
        result.seekStable &&
        observedSegment === String(segment.id) &&
        observedWord === index;
      samples.push({
        segment: String(segment.id),
        expected: index,
        observed: observedWord,
        observedSegment,
        currentTime: result.currentTime,
        timeErrorMs: result.timeErrorMs,
        seekStable: result.seekStable === true,
        seekEvent: result.seekEvent === true,
        correct,
        wrong: !!result.ok && result.seekStable === true && observedSegment === String(segment.id) && observedWord !== index,
        missed: !correct && !(result.ok && result.seekStable === true && observedSegment === String(segment.id))
      });
    }
  }

  const metrics = mappingReport(samples);
  const report = {
    schemaVersion: 1,
    benchmark: "generic-sync-benchmark",
    metric: "runtime_word_mapping",
    contract: CONFIG.dom,
    timingSource: CONFIG.timing.path,
    mediaMode: CONFIG.media.mode,
    sampling: CONFIG.sampling,
    metrics: {
      ...metrics,
      M10_wrong_word_rate_pct: metrics.wrongWordRatePct,
      M11_missed_word_rate_pct: metrics.missedWordRatePct,
      M13_seek_stability_pct: metrics.seekStabilityPct
    },
    wrongExamples: samples.filter((s) => s.wrong).slice(0, 20),
    missedExamples: samples.filter((s) => s.missed).slice(0, 20)
  };

  fs.mkdirSync(path.dirname("test-results"), { recursive: true });
  fs.writeFileSync(
    "test-results/sync-benchmark-deterministic.json",
    JSON.stringify(report, null, 2)
  );

  console.log("SYNC_BENCHMARK_DETERMINISTIC=" + JSON.stringify(report));

  expect(metrics.wrongWordRatePct).toBe(0);
  expect(metrics.missedWordRatePct).toBe(0);
  expect(metrics.seekStabilityPct).toBe(100);
});

test("generic sync benchmark — runtime clock at configured rate", async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });

  const timing = normalizeTiming(JSON.parse(fs.readFileSync(timingPath, "utf8")));
  const segment = chooseRuntimeSegment(timing, CONFIG.runtime.segmentStrategy);
  if (!segment || segment.words.length < 2) {
    throw new Error("Runtime benchmark requires a segment with at least two timed words.");
  }

  await loadAndPauseSegment(page, segment.id);

  await page.evaluate(
    ({ audioSelector, playbackRate }) => {
      const audio = document.querySelector(audioSelector);
      audio.pause();
      audio.currentTime = 0;
      audio.playbackRate = playbackRate;
      window.__ogpSyncDiagnostics.transitions.length = 0;
      window.__ogpSyncDiagnostics.frames = 0;
    },
    { audioSelector: CONFIG.dom.audioSelector, playbackRate: CONFIG.runtime.playbackRate }
  );

  await page.locator(CONFIG.dom.playControlSelector).click();
  const durationMs = Math.max(1000, Number(CONFIG.runtime.durationSec) * 1000);
  await page.waitForTimeout(durationMs);
  await page.evaluate((audioSelector) => document.querySelector(audioSelector)?.pause(), CONFIG.dom.audioSelector);

  const result = await page.evaluate(
    ({ timingSegments, segmentId, currentWordSelector }) => {
      const segment = timingSegments.find((s) => String(s.id) === String(segmentId));
      const starts = Object.fromEntries(segment.words.map((w) => [String(w.index), Number(w.start)]));
      const transitions = (window.__ogpSyncDiagnostics.transitions || [])
        .filter((t) => String(t.segment) === String(segmentId) && Number(t.to) >= 0)
        .map((t) => ({
          index: Number(t.to),
          errorMs: Math.max(0, (Number(t.audioTime) - Number(starts[String(t.to)])) * 1000),
          performanceTime: Number(t.performanceTime) || null
        }));

      const errors = transitions.map((t) => t.errorMs);
      const monotonic = transitions.every((t, i, arr) => i === 0 || t.index > arr[i - 1].index);
      const percentileLocal = (values, p) => {
        if (!values.length) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const k = (sorted.length - 1) * p;
        const f = Math.floor(k);
        const c = Math.ceil(k);
        return f === c ? sorted[f] : sorted[f] + (sorted[c] - sorted[f]) * (k - f);
      };

      return {
        segment: String(segmentId),
        transitions: transitions.length,
        frames: Number(window.__ogpSyncDiagnostics.frames || 0),
        currentWordPresent: !!document.querySelector(currentWordSelector),
        M9_visual_latency_ms_p50: Number(percentileLocal(errors, .5).toFixed(3)),
        M9_visual_latency_ms_p95: Number(percentileLocal(errors, .95).toFixed(3)),
        M9_visual_latency_ms_p99: Number(percentileLocal(errors, .99).toFixed(3)),
        M9_visual_latency_ms_max: Number(Math.max(0, ...errors).toFixed(3)),
        M12_word_transition_monotonicity_pct: monotonic ? 100 : 0
      };
    },
    {
      timingSegments: timing,
      segmentId: String(segment.id),
      currentWordSelector: CONFIG.dom.currentWordSelector
    }
  );

  fs.mkdirSync(path.dirname("test-results"), { recursive: true });
  fs.writeFileSync(
    "test-results/sync-benchmark-runtime.json",
    JSON.stringify(result, null, 2)
  );

  console.log("SYNC_BENCHMARK_RUNTIME=" + JSON.stringify(result));

  const expectedTransitions = Math.min(
    Number(CONFIG.runtime.minTransitions),
    Math.max(1, segment.words.length - 1)
  );

  expect(result.transitions).toBeGreaterThanOrEqual(expectedTransitions);
  expect(result.M9_visual_latency_ms_p95).toBeLessThanOrEqual(50);
  expect(result.M12_word_transition_monotonicity_pct).toBe(100);
});


test("I1 short pauses keep a visible continuity anchor without falsifying the active word", async ({ page }) => {
  test.setTimeout(30000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".story-word");

  const target = await page.evaluate(async (timingPath) => {
    const timing = await fetch(timingPath, { cache: "no-store" }).then((r) => r.json());
    const segments = timing.segments || timing;
    for (const segment of segments) {
      for (let i = 0; i < segment.words.length - 1; i += 1) {
        const a = segment.words[i];
        const b = segment.words[i + 1];
        const gapMs = (Number(b.start) - Number(a.end)) * 1000;
        if (gapMs >= 80 && gapMs <= 240) {
          return { segmentId: String(segment.id), wordIndex: i, time: Number(a.end) + Math.min(gapMs / 1000 / 2, 0.09) };
        }
      }
    }
    return null;
  }, CONFIG.timing.path);

  expect(target, "I1 benchmark requires at least one short inter-word pause").not.toBeNull();

  await loadAndPauseSegment(page, target.segmentId);
  await page.evaluate(
    ({ audioSelector, time }) => {
      const audio = document.querySelector(audioSelector);
      audio.currentTime = time;
      audio.pause();
    },
    { audioSelector: CONFIG.dom.audioSelector, time: target.time }
  );
  await page.waitForTimeout(100);

  const result = await page.evaluate(() => ({
    activeWords: document.querySelectorAll('[data-sync-current-word="true"]').length,
    anchors: document.querySelectorAll('[data-sync-continuity-anchor="true"]').length,
    anchorClass: document.querySelectorAll(".story-word.is-continuity-anchor").length,
    echoClass: document.querySelectorAll(".story-word.is-echo").length,
    maxGapMs: Number(window.__ogpSyncDiagnostics.maxContinuityGapMs || 0)
  }));

  expect(result.activeWords).toBe(0);
  expect(result.anchors).toBe(1);
  expect(result.anchorClass).toBe(1);
  expect(result.echoClass).toBeGreaterThanOrEqual(0);
  expect(result.maxGapMs).toBeLessThanOrEqual(240);
});


test("I2 prosody exposes a live smoothed energy signal during playback", async ({ page }) => {
  test.setTimeout(30000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".story-word");
  await page.locator(CONFIG.dom.playControlSelector).click();
  await page.waitForTimeout(1200);
  const result = await page.evaluate(() => ({
    ready: window.__ogpSyncDiagnostics?.prosodyReady === true,
    frames: Number(window.__ogpSyncDiagnostics?.prosodyFrames || 0),
    samples: Array.isArray(window.__ogpSyncDiagnostics?.prosodySamples)
      ? window.__ogpSyncDiagnostics.prosodySamples.length
      : 0,
    energy: Number(getComputedStyle(document.querySelector("#relato-sonoro")).getPropertyValue("--ogp-voice-energy"))
  }));
  expect(result.ready).toBe(true);
  expect(result.frames).toBeGreaterThan(10);
  expect(result.samples).toBeGreaterThan(0);
  expect(Number.isFinite(result.energy)).toBe(true);
  expect(result.energy).toBeGreaterThanOrEqual(0);
  expect(result.energy).toBeLessThanOrEqual(1);
  await page.evaluate((audioSelector) => document.querySelector(audioSelector)?.pause(), CONFIG.dom.audioSelector);
});

test("I3 intraword progress follows the real word interval", async ({ page }) => {
  test.setTimeout(30000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".story-word");

  const target = await page.evaluate(async (timingPath) => {
    const timing = await fetch(timingPath, { cache: "no-store" }).then((r) => r.json());
    const segments = timing.segments || timing;
    for (const segment of segments) {
      for (let i = 0; i < segment.words.length; i += 1) {
        const word = segment.words[i];
        const duration = Number(word.end) - Number(word.start);
        if (duration >= 0.45) {
          return {
            segmentId: String(segment.id),
            wordIndex: i,
            time: (Number(word.start) + Number(word.end)) / 2
          };
        }
      }
    }
    return null;
  }, CONFIG.timing.path);

  expect(target, "I3 benchmark requires a sufficiently long timed word").not.toBeNull();
  await loadAndPauseSegment(page, target.segmentId);
  await page.evaluate(
    ({ audioSelector, time }) => {
      const audio = document.querySelector(audioSelector);
      audio.currentTime = time;
      audio.pause();
    },
    { audioSelector: CONFIG.dom.audioSelector, time: target.time }
  );
  await page.waitForTimeout(100);

  const result = await page.evaluate(() => {
    const current = document.querySelector('.story-word[data-sync-current-word="true"]');
    return {
      current: current?.dataset.word ?? null,
      progress: current ? Number(current.style.getPropertyValue("--word-progress")) : null
    };
  });

  expect(result.current).toBe(String(target.wordIndex));
  expect(result.progress).toBeGreaterThan(0.2);
  expect(result.progress).toBeLessThan(0.8);
});
