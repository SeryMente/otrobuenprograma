const { test, expect } = require("@playwright/test");
const {
  sampleIndices,
  selectorFromTemplate,
  chooseRuntimeSegment,
  normalizeTiming,
  mappingReport
} = require("./lib/sync-benchmark");

test("generic sync engine is independent of segment count and identifiers", () => {
  const timing = normalizeTiming({
    segments: [
      {
        id: "intro",
        words: [
          { word: "Uno", start: 0, end: 0.4 },
          { word: "dos", start: 0.5, end: 0.9 }
        ]
      },
      {
        id: "scene-X",
        words: Array.from({ length: 7 }, (_, i) => ({
          word: "w" + i,
          start: i,
          end: i + 0.5
        }))
      },
      {
        id: "replacement-2026",
        words: Array.from({ length: 3 }, (_, i) => ({
          word: "z" + i,
          start: i * 2,
          end: i * 2 + 0.75
        }))
      }
    ]
  });

  expect(timing).toHaveLength(3);
  expect(timing.map((s) => s.id)).toEqual(["intro", "scene-X", "replacement-2026"]);
  expect(sampleIndices(timing[0].words, 6)).toEqual([0, 1]);
  expect(sampleIndices(timing[1].words, 4).length).toBe(4);
  expect(sampleIndices(timing[2].words, 6).length).toBe(3);
  expect(selectorFromTemplate('[data-sync-segment-control="{id}"]', "scene-X"))
    .toBe('[data-sync-segment-control="scene-X"]');
  expect(chooseRuntimeSegment(timing, "max-word-count").id).toBe("scene-X");

  const report = mappingReport([
    { correct: true, wrong: false, missed: false, seekStable: true, seekEvent: true, timeErrorMs: 0 },
    { correct: false, wrong: true, missed: false, seekStable: true, seekEvent: true, timeErrorMs: 12 },
    { correct: false, wrong: false, missed: true, seekStable: true, seekEvent: true, timeErrorMs: 20 }
  ]);

  expect(report.samples).toBe(3);
  expect(report.correctRatePct).toBeCloseTo(33.3333, 4);
  expect(report.wrongWordRatePct).toBeCloseTo(33.3333, 4);
  expect(report.missedWordRatePct).toBeCloseTo(33.3333, 4);
  expect(report.seekStabilityPct).toBe(100);
});
