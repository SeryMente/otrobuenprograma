#!/usr/bin/env python3
import json, re, subprocess, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "assets" / "data" / "relato-obp-v015.json"
AUDIO = ROOT / "assets" / "audio" / "relato-obp-v015.mp3"
OUT = ROOT / "assets" / "data" / "story-word-timing.json"

def normalize(s: str) -> str:
    s = unicodedata.normalize("NFKD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "", s)

def tokenize(text: str):
    return [re.sub(r"\s+$", "", x) for x in re.findall(r"\S+(?:\s+|$)", text)]

def ratio(a: str, b: str) -> float:
    na, nb = normalize(a), normalize(b)
    if not na or not nb:
        return 0.0
    if na == nb:
        return 100.0
    if na.startswith(nb) or nb.startswith(na):
        return 94.0
    from rapidfuzz.fuzz import ratio as rf_ratio
    return float(rf_ratio(na, nb))

def audio_duration(path: Path) -> float:
    p = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "default=noprint_wrappers=1:nokey=1", str(path)],
        text=True, capture_output=True, check=True
    )
    return float(p.stdout.strip())

def transcribe(path: Path):
    from faster_whisper import WhisperModel
    model = WhisperModel("tiny", device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        str(path),
        language="es",
        word_timestamps=True,
        vad_filter=True,
        beam_size=3,
        condition_on_previous_text=False,
    )
    words = []
    for seg in segments:
        for w in (seg.words or []):
            if w.start is None or w.end is None:
                continue
            words.append({
                "word": (w.word or "").strip(),
                "start": float(w.start),
                "end": float(w.end),
            })
    return words, float(info.duration or audio_duration(path))

def build():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    scenes = data["scenes"][:10]
    target = []
    for si, scene in enumerate(scenes):
        for wi, token in enumerate(tokenize(scene["text"])):
            target.append({"scene": si, "word": wi, "token": token})

    observed, duration = transcribe(AUDIO)
    if not observed:
        raise RuntimeError("Whisper no devolvió palabras.")

    # Ordered local alignment: the provided transcript is the authority;
    # Whisper supplies only the phonetic clock.
    mapped = [None] * len(target)
    cursor = 0
    m = len(observed)
    n = len(target)

    for i, item in enumerate(target):
        predicted = int(i * m / max(1, n))
        lo = max(cursor - 2, predicted - 18)
        hi = min(m, max(lo + 1, predicted + 34))
        best_idx, best_score = None, -1.0

        for j in range(lo, hi):
            score = ratio(item["token"], observed[j]["word"])
            # Gentle distance penalty prevents jumping forward to a later duplicate.
            score -= abs(j - predicted) * 0.12
            if j < cursor:
                score -= 3.0
            if score > best_score:
                best_idx, best_score = j, score

        if best_idx is not None and best_score >= 47:
            mapped[i] = {"start": observed[best_idx]["start"], "end": observed[best_idx]["end"]}
            cursor = best_idx + 1

    # Interpolate unmatched transcript words between trusted timestamps.
    matched = [i for i, x in enumerate(mapped) if x is not None]
    if not matched:
        raise RuntimeError("No se pudo alinear ninguna palabra.")

    for pos, i in enumerate(range(n)):
        if mapped[i] is not None:
            continue
        prev_i = matched[pos - 1] if pos and pos - 1 < len(matched) else None
        next_i = None
        for j in matched:
            if j > i:
                next_i = j
                break
        if prev_i is not None and next_i is not None:
            a, b = mapped[prev_i]["end"], mapped[next_i]["start"]
            span = next_i - prev_i
            mapped[i] = {
                "start": a + (b - a) * ((i - prev_i) / span),
                "end": a + (b - a) * ((i - prev_i + 1) / span),
            }
        elif next_i is not None:
            b = mapped[next_i]["start"]
            step = max(0.12, b / (next_i + 1))
            mapped[i] = {"start": max(0.0, b - step), "end": b}
        else:
            a = mapped[prev_i]["end"] if prev_i is not None else 0.0
            step = max(0.12, (duration - a) / max(1, n - (prev_i or 0)))
            mapped[i] = {"start": a, "end": min(duration, a + step)}

    # Clamp and guarantee monotonicity.
    last_end = 0.0
    output = []
    for item, tm in zip(target, mapped):
        start = max(last_end, min(duration, float(tm["start"])))
        end = max(start + 0.02, min(duration, float(tm["end"])))
        output.append({
            "scene": item["scene"],
            "word": item["word"],
            "start": round(start, 3),
            "end": round(end, 3),
        })
        last_end = start

    payload = {
        "version": 1,
        "method": "faster-whisper-tiny-es + ordered fuzzy alignment",
        "sourceAudio": "assets/audio/relato-obp-v015.mp3",
        "duration": round(duration, 3),
        "words": output,
        "matchedWords": len(matched),
        "targetWords": len(target),
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({
        "duration": payload["duration"],
        "matchedWords": payload["matchedWords"],
        "targetWords": payload["targetWords"],
        "coverage": round(payload["matchedWords"] / payload["targetWords"], 4),
        "output": str(OUT.relative_to(ROOT)),
    }, ensure_ascii=False))

if __name__ == "__main__":
    build()
