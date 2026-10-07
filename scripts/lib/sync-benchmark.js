"use strict";

/**
 * Generic synchronization benchmark primitives.
 * This module is intentionally agnostic to project name, audio count,
 * segment IDs, transcript language, and segment ordering.
 */

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].filter(Number.isFinite).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const k = (sorted.length - 1) * p;
  const f = Math.floor(k);
  const c = Math.ceil(k);
  return f === c ? sorted[f] : sorted[f] + (sorted[c] - sorted[f]) * (k - f);
}

function sampleIndices(words, pointsPerSegment = 6) {
  const count = words.length;
  if (!count) return [];
  const target = Math.max(2, Math.min(pointsPerSegment, count));
  if (target === 2) return [0, count - 1];

  const result = [];
  for (let i = 0; i < target; i += 1) {
    const ratio = i / (target - 1);
    result.push(Math.round(ratio * (count - 1)));
  }
  return [...new Set(result)];
}

function selectorFromTemplate(template, id) {
  return template.replaceAll("{id}", String(id));
}

function chooseRuntimeSegment(segments, strategy = "max-word-count") {
  if (!segments.length) return null;
  const score = (segment) => {
    const words = (segment.words || []).length;
    const duration = Number(segment.audioDuration) || 0;
    if (strategy === "max-duration") return duration;
    if (strategy === "max-density") return duration ? words / duration : 0;
    return words;
  };
  return [...segments].sort((a, b) => score(b) - score(a))[0];
}

function normalizeTiming(timing) {
  const segments = Array.isArray(timing?.segments) ? timing.segments : [];
  if (!segments.length) throw new Error("Timing artifact has no segments.");

  const seen = new Set();
  const normalized = segments.map((segment) => {
    const id = String(segment.id);
    if (seen.has(id)) throw new Error("Duplicate segment id: " + id);
    seen.add(id);

    const words = Array.isArray(segment.words) ? segment.words.map((word, index) => ({
      index: Number.isInteger(word.index) ? word.index : index,
      word: String(word.word ?? ""),
      start: Number(word.start),
      end: Number(word.end)
    })) : [];

    if (!words.length) throw new Error("Segment " + id + " has no words.");
    return { ...segment, id, words };
  });

  return normalized;
}

function mappingReport(samples) {
  const total = samples.length;
  const correct = samples.filter((s) => s.correct).length;
  const wrong = samples.filter((s) => s.wrong).length;
  const missed = samples.filter((s) => s.missed).length;
  const unstable = samples.filter((s) => !s.seekStable).length;
  return {
    samples: total,
    correct,
    wrong,
    missed,
    correctRatePct: Number((correct / total * 100).toFixed(4)),
    wrongWordRatePct: Number((wrong / total * 100).toFixed(4)),
    missedWordRatePct: Number((missed / total * 100).toFixed(4)),
    seekStabilityPct: Number(((total - unstable) / total * 100).toFixed(4)),
    seekEventRatePct: Number((samples.filter((s) => s.seekEvent).length / total * 100).toFixed(4)),
    probeTimeErrorMsP50: Number(percentile(samples.map((s) => Number(s.timeErrorMs)), 0.5).toFixed(3)),
    probeTimeErrorMsP95: Number(percentile(samples.map((s) => Number(s.timeErrorMs)), 0.95).toFixed(3)),
    probeTimeErrorMsP99: Number(percentile(samples.map((s) => Number(s.timeErrorMs)), 0.99).toFixed(3))
  };
}

module.exports = {
  percentile,
  sampleIndices,
  selectorFromTemplate,
  chooseRuntimeSegment,
  normalizeTiming,
  mappingReport
};
