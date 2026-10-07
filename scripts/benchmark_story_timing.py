#!/usr/bin/env python3
# F4 S1 promotion-retry trigger: timing promotion is commit-before-rebase.
import argparse, json, math, re, statistics, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHASE2 = ROOT / "assets" / "data" / "relato-obp-phase2.json"
DEFAULT_TIMING = ROOT / "assets" / "data" / "story-word-timing.json"

def normalize(word):
    s = unicodedata.normalize("NFKD", word.lower())
    return "".join(c for c in s if not unicodedata.combining(c))

def tokens(text):
    return re.findall(r"\S+", text or "")

def pct(num, den):
    return round((num / den * 100.0), 4) if den else 0.0

def percentile(values, p):
    if not values:
        return 0.0
    values = sorted(values)
    k = (len(values) - 1) * p
    f = math.floor(k)
    c = math.ceil(k)
    if f == c:
        return values[int(k)]
    return values[f] + (values[c] - values[f]) * (k - f)

def proportional_words(segment):
    ws = tokens(segment["text"])
    duration = float(segment["audioDuration"])
    if not ws:
        return []
    span = duration / len(ws)
    return [{"start": i * span, "end": (i + 1) * span} for i in range(len(ws))]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--timing", default=str(DEFAULT_TIMING))
    ap.add_argument("--output", default="artifacts/benchmark-story-timing.json")
    ap.add_argument("--require-certified", action="store_true")
    args = ap.parse_args()

    phase2 = json.loads(PHASE2.read_text(encoding="utf-8"))
    timing = json.loads(Path(args.timing).read_text(encoding="utf-8"))
    canonical = {str(s["id"]): s for s in phase2["segments"]}
    aligned = {str(s["id"]): s for s in timing.get("segments", [])}

    canonical_words = sum(len(tokens(s.get("text", ""))) for s in phase2["segments"])
    timing_words = sum(len(s.get("words", [])) for s in aligned.values())
    text_matches = 0
    text_total = 0
    valid_intervals = 0
    monotonic_pairs = 0
    total_pairs = 0
    duration_values = []
    confidence_values = []
    proportional_deviation = []

    for sid, s in canonical.items():
        expected = tokens(s.get("text", ""))
        got = aligned.get(sid, {}).get("words", [])
        text_total += len(expected)
        for want, item in zip(expected, got):
            if normalize(want) == normalize(str(item.get("word", ""))):
                text_matches += 1
            try:
                start = float(item["start"])
                end = float(item["end"])
                if start >= 0 and end > start and end <= float(s["audioDuration"]) + 0.075:
                    valid_intervals += 1
                duration_values.append(end - start)
                if "score" in item:
                    try:
                        confidence_values.append(float(item["score"]))
                    except (TypeError, ValueError):
                        pass
            except (KeyError, TypeError, ValueError):
                pass
        for a, b in zip(got, got[1:]):
            total_pairs += 1
            try:
                if float(b["start"]) >= float(a["end"]):
                    monotonic_pairs += 1
            except (KeyError, TypeError, ValueError):
                pass
        prop = proportional_words(s)
        for i, item in enumerate(got[:len(prop)]):
            try:
                proportional_deviation.append(abs(float(item["start"]) - prop[i]["start"]) * 1000.0)
                proportional_deviation.append(abs(float(item["end"]) - prop[i]["end"]) * 1000.0)
            except (KeyError, TypeError, ValueError):
                pass

    status = timing.get("status")
    certified = status == "forced-alignment-certified" and timing.get("proportionalTiming") is False
    if args.require_certified and not certified:
        raise SystemExit("CERTIFICATION_REQUIRED_BUT_TIMING_IS_NOT_CERTIFIED")

    result = {
        "schemaVersion": 1,
        "version": "v1.7.0-20261007",
        "timingStatus": status,
        "method": timing.get("method"),
        "certified": certified,
        "suite": {
            "segments": len(canonical),
            "canonicalWords": canonical_words,
            "timingWords": timing_words,
        },
        "metrics": {
            "M1_coverage_pct": pct(timing_words, canonical_words),
            "M2_text_integrity_pct": pct(text_matches, text_total),
            "M3_monotonicity_pct": pct(monotonic_pairs, total_pairs),
            "M4_valid_interval_pct": pct(valid_intervals, timing_words),
            "M5_proportional_boundary_deviation_ms_p50": round(percentile(proportional_deviation, .50), 3),
            "M6_proportional_boundary_deviation_ms_p95": round(percentile(proportional_deviation, .95), 3),
            "M7_word_duration_ms_p95": round(percentile([v * 1000.0 for v in duration_values], .95), 3),
            "M8_alignment_score_p10": round(percentile(confidence_values, .10), 5) if confidence_values else None,
            "M8_alignment_score_coverage_pct": pct(len(confidence_values), timing_words),
        },
        "notes": {
            "M5_M6": "Comparative deviation from proportional timing; not an absolute ground-truth error.",
            "absoluteAlignmentReference": "Independent human/phonetic gold annotations are required to claim absolute onset/offset error.",
            "runtimeMetrics": ["M9_visual_latency_ms", "M10_wrong_word_rate_pct", "M11_missed_word_rate_pct", "M12_word_transition_monotonicity_pct"],
        },
    }

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False))

if __name__ == "__main__":
    main()
