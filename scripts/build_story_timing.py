#!/usr/bin/env python3
import json, re, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PHASE2 = ROOT / "assets" / "data" / "relato-obp-phase2.json"
OUT_TIMING = ROOT / "assets" / "data" / "story-word-timing.json"
OUT_PHASE3 = ROOT / "assets" / "data" / "relato-obp-phase3.json"

VISUALS = [
    ("welcome", "Escuchar antes de interpretar"),
    ("currents", "Lo que ya existe y lo que se abre"),
    ("relationship", "La relación como campo"),
    ("forgiveness", "Perdón como práctica"),
    ("scale", "Una posición distinta"),
    ("inclusion", "Una pertenencia más amplia"),
    ("dabrowski", "Conflicto y desarrollo"),
    ("structures", "Cuando la estructura resiste"),
    ("minds", "Dos respuestas posibles"),
    ("closing", "Una propuesta que se integra"),
]

def normalize(word):
    s = unicodedata.normalize("NFKD", word.lower())
    return "".join(c for c in s if not unicodedata.combining(c))

def tokens(text):
    return re.findall(r"\S+", text)

def validate(segment, words):
    target = [normalize(x) for x in tokens(segment["text"])]
    if len(target) != len(words):
        raise RuntimeError(f"Segmento {segment['id']}: conteo canónico {len(target)} != alineado {len(words)}")
    last = -1.0
    for i, (want, got) in enumerate(zip(target, words)):
        if normalize(str(got.get("word", "")).strip()) != want:
            raise RuntimeError(f"Segmento {segment['id']}: discrepancia de palabra {i+1}")
        start = float(got["start"])
        end = float(got["end"])
        if not (start >= 0 and end > start and start >= last):
            raise RuntimeError(f"Segmento {segment['id']}: timestamps inválidos en palabra {i+1}")
        last = end

def main():
    try:
        import torch
        import whisperx
    except Exception as exc:
        raise RuntimeError("WhisperX/PyTorch no disponible") from exc

    data = json.loads(PHASE2.read_text(encoding="utf-8"))
    segments = data.get("segments", [])
    if len(segments) != 20:
        raise RuntimeError("Se requieren exactamente 20 segmentos.")

    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(json.dumps({"phase":"Fase 3","step":"load-align-model","device":device}, ensure_ascii=False), flush=True)
    model_a, metadata = whisperx.load_align_model(language_code="es", device=device)

    timing_segments = []
    total = 0

    for s in segments:
        audio_path = ROOT / s["audio"]
        if not audio_path.exists():
            raise RuntimeError(f"Falta audio {s['id']}: {audio_path}")
        print(json.dumps({"segment":s["id"],"step":"align"}, ensure_ascii=False), flush=True)
        audio = whisperx.load_audio(str(audio_path))
        result = whisperx.align(
            [{"start":0.0,"end":float(s["audioDuration"]),"text":s["text"]}],
            model_a, metadata, audio, device,
            return_char_alignments=False
        )
        aligned = []
        for part in result.get("segments") or []:
            aligned.extend(part.get("words") or [])
        validate(s, aligned)

        local = []
        for i, w in enumerate(aligned):
            local.append({
                "index": i,
                "word": str(w["word"]).strip(),
                "start": round(float(w["start"]), 3),
                "end": round(float(w["end"]), 3),
            })
        total += len(local)
        timing_segments.append({"id":s["id"],"phase":s["phase"],"words":local})

    timing = {
        "version": 1,
        "phase": "Fase 3",
        "status": "forced-alignment-certified",
        "method": "WhisperX CTC forced alignment against canonical segment transcript and segment audio",
        "sourceAudio": "assets/audio/relato-obp-v015.mp3",
        "sourcePhase2": "assets/data/relato-obp-phase2.json",
        "segments": timing_segments,
        "wordCount": total,
        "proportionalTiming": False,
        "interpolation": False,
    }
    OUT_TIMING.write_text(json.dumps(timing, ensure_ascii=False, indent=2), encoding="utf-8")

    phase3_segments = []
    for i, s in enumerate(segments):
        visual_key, visual_title = VISUALS[i // 2]
        phase3_segments.append({
            **s,
            "visualKey": visual_key,
            "visualTitle": visual_title,
            "context": s["idea"],
            "words": timing_segments[i]["words"],
        })

    phase3 = {
        "version": "1.0-phase3",
        "phase": "Fase 3",
        "status": "timing-and-narrative-model-certified",
        "displayName": data["displayName"],
        "spokenWorkingName": data["spokenWorkingName"],
        "sourceAudio": data["sourceAudio"],
        "model": {
            "phases": 5,
            "segments": 20,
            "oneIdeaPerSegment": True,
            "primaryContent": "transcript",
            "visualMasterCompositions": 10,
            "timingArtifact": "assets/data/story-word-timing.json",
            "wordClock": "audio-derived forced alignment",
            "proportionalTiming": False,
        },
        "segments": phase3_segments,
    }
    OUT_PHASE3.write_text(json.dumps(phase3, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"status":"passed","segments":20,"words":total}, ensure_ascii=False), flush=True)

if __name__ == "__main__":
    main()
# F3 gate trigger: strict forced alignment only.
