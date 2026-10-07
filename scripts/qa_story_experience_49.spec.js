const { test, expect } = require("@playwright/test");
const fs = require("fs");
const path = require("path");

const URL = process.env.SYNC_BENCHMARK_URL || "http://127.0.0.1:4173/";
const DATA = JSON.parse(fs.readFileSync(path.join(process.cwd(), "assets/data/relato-ogp-experience.json"), "utf8"));

test("canonical 49-segment experience renders with variable phase counts", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".story-word");
  await expect(page.locator(".story-stop")).toHaveCount(49);
  await expect(page.locator(".story-micro-phase")).toHaveCount(5);
  await expect(page.locator(".story-micro-segment")).toHaveCount(49);
  const counts = await page.locator(".story-micro-phase").evaluateAll((nodes) =>
    nodes.map((n) => n.querySelectorAll(".story-micro-segment").length)
  );
  expect(counts).toEqual([6, 8, 9, 7, 19]);
});

test("canonical runtime uses one master audio and preserves source identity", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".story-word");
  await expect(page.locator(".story-audio")).toHaveCount(1);
  const result = await page.evaluate(() => {
    const audio = document.querySelector(".story-audio");
    return {
      src: audio.currentSrc || audio.src,
      duration: Number(audio.duration),
      segmentAudioAttributes: [...document.querySelectorAll(".story-stop")].flatMap((card) =>
        [...card.querySelectorAll("[data-play-segment]")].map((button) => button.getAttribute("data-audio"))
      )
    };
  });
  expect(result.src).toContain("assets/audio/relato-ogp-v015.mp3");
  expect(result.duration).toBeCloseTo(DATA.sourceAudio.duration, 2);
  expect(result.segmentAudioAttributes.some(Boolean)).toBe(false);
});

test("selected editorial windows seek inside their canonical master-clock interval", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(URL, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(".story-word");
  for (const id of ["01", "21", "49"]) {
    const expected = DATA.segments.find((s) => s.id === id);
    await page.evaluate((segmentId) => {
      const control = document.querySelector(`[data-sync-segment-control="${segmentId}"]`);
      if (!control) throw new Error(`Missing segment control ${segmentId}`);
      control.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, id);
    await page.waitForFunction((segmentId) => {
      const active = document.querySelector('[data-sync-active-segment="true"]');
      const audio = document.querySelector(".story-audio");
      return active?.dataset.syncSegmentId === segmentId && audio && audio.readyState >= 1;
    }, id);
    const observed = await page.evaluate(() => Number(document.querySelector(".story-audio").currentTime));
    expect(observed).toBeGreaterThanOrEqual(expected.masterStart - 0.15);
    expect(observed).toBeLessThanOrEqual(expected.masterEnd + 0.15);
  }
});