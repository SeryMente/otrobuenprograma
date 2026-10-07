import json
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CANON = ROOT / "assets/data/story-experience-canon.json"
SOURCE = ROOT / "assets/data/relato-ogp-phase3.json"
DATA = ROOT / "assets/data/relato-ogp-experience.json"
JS = ROOT / "assets/js/story-v3.js"
SW = ROOT / "sw.js"

def load(p):
    return json.loads(p.read_text(encoding="utf-8"))

def norm(value):
    value = str(value or "").lower()
    value = unicodedata.normalize("NFD", value)
    value = "".join(ch for ch in value if unicodedata.category(ch) != "Mn")
    for ch in "«»“”¿¡.,;:!?()":
        value = value.replace(ch, "")
    return value

def phrase_tokens(value):
    return [norm(x) for x in str(value).split() if norm(x)]

def find_phrase(words, phrase):
    tokens = phrase_tokens(phrase)
    normalized = [norm(w["word"]) for w in words]
    for i in range(0, len(normalized) - len(tokens) + 1):
        if normalized[i:i + len(tokens)] == tokens:
            return True
    return False

canon = load(CANON)
source = load(SOURCE)
data = load(DATA)

assert canon["status"] == "CANONICAL_EXECUTABLE_ARCHITECTURE"
assert canon["segmentation"]["decision"] == "RECOMMEND_49"
assert canon["segmentation"]["recommendedCount"] == 49
assert canon["segmentation"]["acceptableBand"] == [46, 52]
assert len(canon["segmentation"]["proposedSegments"]) == 49
assert canon["source"]["currentTrainingSegments"] == 20
assert canon["source"]["totalTimedWords"] == 2206

assert source["model"]["segments"] == 20
assert len(source["segments"]) == 20
assert source["sourceAudio"]["duration"] == 1391.304
assert source["sourceAudio"]["path"] == "assets/audio/relato-ogp-v015.mp3"

assert data["version"] == "1.0-experience-canon-49"
assert data["model"]["segments"] == 49
assert data["model"]["phaseSegmentCounts"] == {"I": 6, "II": 8, "III": 9, "IV": 7, "V": 19}
assert data["sourceAudio"]["path"] == source["sourceAudio"]["path"]
assert data["sourceAudio"]["sha256"] == source["sourceAudio"]["sha256"]
assert data["sourceAudio"]["duration"] == source["sourceAudio"]["duration"]
assert len(data["segments"]) == 49

segments = data["segments"]
ids = [s["id"] for s in segments]
assert ids == [f"{i:02d}" for i in range(1, 50)]
assert sum(s["wordCount"] for s in segments) == 2206
assert all(s["wordCount"] > 0 for s in segments)
assert all(s["duration"] > 0 for s in segments)

for previous, current in zip(segments, segments[1:]):
    assert previous["masterEnd"] == current["masterStart"], (previous["id"], current["id"])
assert segments[0]["masterStart"] == 0
assert segments[-1]["masterEnd"] == 1391.304

seen = set()
for s in segments:
    assert "audio" not in s, f"Editorial segment {s['id']} reintroduced physical audio coupling"
    assert "audioPath" not in s
    assert s["words"]
    for word in s["words"]:
        key = (word["sourceSegment"], word["sourceIndex"])
        assert key not in seen, f"Duplicated source word {key}"
        seen.add(key)
assert len(seen) == 2206

source_by_id = {str(s["id"]): s for s in source["segments"]}
for e in canon["segmentation"]["proposedSegments"]:
    assert e["id"] in ids
    for r in e["sources"]:
        s = source_by_id[str(r["sourceSegment"])]
        assert 0 <= r["startWord"] <= r["endWord"] < len(s["words"])

rich = {str(x["segment"]): x for x in canon["richTranscript"]["segments49"]}
assert set(rich) == set(ids)
for s in segments:
    entry = rich[s["id"]]
    assert find_phrase(s["words"], entry["strong"]), f"strong phrase missing: {s['id']}"
    assert find_phrase(s["words"], entry["underline"]), f"underline phrase missing: {s['id']}"

for path in (JS, SW):
    text = path.read_text(encoding="utf-8")
    assert "segment-01.mp3" not in text
    assert "s.audio" not in text
assert "assets/data/relato-ogp-experience.json" in JS.read_text(encoding="utf-8")
assert "instrumento-v1.19.0-experience-canon-49-20261007" in SW.read_text(encoding="utf-8")
assert "assets/data/relato-ogp-experience.json" in SW.read_text(encoding="utf-8")

print("STORY_EXPERIENCE_49_QA=PASSED")
print(json.dumps({
    "segments": len(segments),
    "words": len(seen),
    "duration": segments[-1]["masterEnd"],
    "phaseSegmentCounts": data["model"]["phaseSegmentCounts"],
    "meanSegmentSeconds": data["metrics"]["meanSegmentSeconds"],
    "medianSegmentSeconds": data["metrics"]["medianSegmentSeconds"],
    "p90SegmentSeconds": data["metrics"]["p90SegmentSeconds"],
    "maxSegmentSeconds": data["metrics"]["maxSegmentSeconds"]
}, ensure_ascii=False))