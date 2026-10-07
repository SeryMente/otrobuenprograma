#!/usr/bin/env python3
"""Generic timing-artifact benchmark.

The benchmark is driven by a config file. It has no knowledge of a project's
name, segment count, audio file names, language, or segment numbering scheme.
"""

import argparse
import json
import math
import re
import statistics
import unicodedata
from pathlib import Path


def normalize(value):
    text = unicodedata.normalize("NFKD", str(value).lower())
    return "".join(c for c in text if not unicodedata.combining(c))


def tokens(text):
    return re.findall(r"\S+", text or "")


def percentile(values, p):
    values = sorted(v for v in values if math.isfinite(v))
    if not values:
        return 0.0
    k = (len(values) - 1) * p
    f, c = math.floor(k), math.ceil(k)
    if f == c:
        return values[int(k)]
    return values[f] + (values[c] - values[f]) * (k - f)


def percentage(num, den):
    return round(num / den * 100.0, 4) if den else None


def proportional_words(segment):
    words = tokens(segment.get("text", ""))
    duration = float(segment.get("audioDuration", 0) or 0)
    if not words or duration <= 0:
        return []
    span = duration / len(words)
    return [{"start": i * span, "end": (i + 1) * span} for i in range(len(words))]


def load_config(path):
    config = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(config, dict):
        raise SystemExit("SYNC_BENCHMARK_CONFIG_INVALID")
    return config


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="scripts/sync-benchmark.config.json")
    parser.add_argument("--timing", default=None)
    parser.add_argument("--canonical", default=None)
    parser.add_argument("--output", default="test-results/benchmark-sync-timing.json")
    parser.add_argument("--require-certified", action="store_true")
    args = parser.parse_args()

    config = load_config(args.config)
    timing_path = Path(args.timing or config["timing"]["path"])
    canonical_path = Path(args.canonical or config.get("canonical", {}).get("path", ""))

    timing = json.loads(timing_path.read_text(encoding="utf-8"))
    segments = timing.get("segments", [])
    if not isinstance(segments, list) or not segments:
        raise SystemExit("SYNC_BENCHMARK_TIMING_HAS_NO_SEGMENTS")

    certified = timing.get("status") == "forced-alignment-certified" and timing.get("proportionalTiming") is False
    if args.require_certified and not certified:
        raise SystemExit("SYNC_BENCHMARK_CERTIFICATION_REQUIRED")

    canonical = None
    if canonical_path and canonical_path.exists():
        source = json.loads(canonical_path.read_text(encoding="utf-8"))
        canonical = {str(s["id"]): s for s in source.get("segments", [])}

    timing_segments = {str(s["id"]): s for s in segments}
    timing_words = sum(len(s.get("words", [])) for s in segments)

    valid_intervals = 0
    monotonic_pairs = 0
    total_pairs = 0
    duration_values = []
    scores = []
    text_matches = 0
    text_total = 0
    proportional_deviation = []
    canonical_words = None

    for segment in segments:
        sid = str(segment["id"])
        words = segment.get("words", [])
        canonical_segment = canonical.get(sid) if canonical else None

        if canonical_segment is not None:
            expected = tokens(canonical_segment.get("text", ""))
            text_total += len(expected)
            canonical_words = (canonical_words or 0) + len(expected)
            for want, item in zip(expected, words):
                if normalize(want) == normalize(item.get("word", "")):
                    text_matches += 1

        audio_duration = None
        if canonical_segment is not None and canonical_segment.get("audioDuration") is not None:
            audio_duration = float(canonical_segment["audioDuration"])
        elif segment.get("audioDuration") is not None:
            audio_duration = float(segment["audioDuration"])

        for item in words:
            try:
                start = float(item["start"])
                end = float(item["end"])
                valid = start >= 0 and end > start
                if audio_duration is not None:
                    valid = valid and end <= audio_duration + 0.075
                if valid:
                    valid_intervals += 1
                duration_values.append(end - start)
            except (KeyError, TypeError, ValueError):
                pass
            if item.get("score") is not None:
                try:
                    scores.append(float(item["score"]))
                except (TypeError, ValueError):
                    pass

        for first, second in zip(words, words[1:]):
            total_pairs += 1
            try:
                if float(second["start"]) >= float(first["end"]):
                    monotonic_pairs += 1
            except (KeyError, TypeError, ValueError):
                pass

        if canonical_segment is not None:
            proportional = proportional_words(canonical_segment)
            for index, item in enumerate(words[:len(proportional)]):
                try:
                    proportional_deviation.append(abs(float(item["start"]) - proportional[index]["start"]) * 1000.0)
                    proportional_deviation.append(abs(float(item["end"]) - proportional[index]["end"]) * 1000.0)
                except (KeyError, TypeError, ValueError):
                    pass

    result = {
        "schemaVersion": 1,
        "benchmark": "generic-sync-timing-benchmark",
        "timingSource": str(timing_path),
        "canonicalSource": str(canonical_path) if canonical else None,
        "certified": certified,
        "suite": {
            "segments": len(segments),
            "canonicalWords": canonical_words,
            "timingWords": timing_words,
        },
        "metrics": {
            "M1_coverage_pct": percentage(timing_words, canonical_words) if canonical_words is not None else None,
            "M2_text_integrity_pct": percentage(text_matches, text_total) if canonical else None,
            "M3_monotonicity_pct": percentage(monotonic_pairs, total_pairs),
            "M4_valid_interval_pct": percentage(valid_intervals, timing_words),
            "M5_proportional_boundary_deviation_ms_p50": round(percentile(proportional_deviation, 0.50), 3) if proportional_deviation else None,
            "M6_proportional_boundary_deviation_ms_p95": round(percentile(proportional_deviation, 0.95), 3) if proportional_deviation else None,
            "M7_word_duration_ms_p95": round(percentile([v * 1000.0 for v in duration_values], 0.95), 3),
            "M8_alignment_score_p10": round(percentile(scores, 0.10), 5) if scores else None,
            "M8_alignment_score_coverage_pct": percentage(len(scores), timing_words),
        },
        "contract": {
            "projectAgnostic": True,
            "dependsOnSegmentCount": False,
            "dependsOnSegmentIds": False,
            "dependsOnAudioNames": False,
            "dependsOnLanguage": False,
        },
        "notes": {
            "M5_M6": "Comparative deviation from proportional timing; not absolute ground-truth error.",
            "absoluteReference": "Independent human/phonetic gold annotations are required for absolute onset/offset claims.",
        },
    }

    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    main()
