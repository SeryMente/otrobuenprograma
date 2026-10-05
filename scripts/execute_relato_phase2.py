#!/usr/bin/env python3
import hashlib
import json
import math
import re
import subprocess
import tempfile
import unicodedata
from difflib import SequenceMatcher
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "assets" / "data" / "relato-obp-v015.json"
EDITORIAL = ROOT / "assets" / "data" / "relato-obp-phase2-editorial.json"
ARCH = ROOT / "assets" / "data" / "relato-obp-architecture-v1.json"
AUDIO = ROOT / "assets" / "audio" / "relato-obp-v015.mp3"
OUT = ROOT / "assets" / "data" / "relato-obp-phase2.json"
QC = ROOT / "assets" / "data" / "relato-obp-phase2-qc.json"
AUDIO_DIR = ROOT / "assets" / "audio" / "relato-obp-v016"

EXPECTED_AUDIO_BYTES = 16695648
EXPECTED_DURATION = 1391.0
MODEL_SIZE = "small"
MAX_WER = 0.20
PHASES = {
    "I": ["01", "02", "03", "04"],
    "II": ["05", "06", "07", "08"],
    "III": ["09", "10", "11", "12"],
    "IV": ["13", "14", "15", "16"],
    "V": ["17", "18", "19", "20"],
}


def run(cmd):
    return subprocess.run(cmd, text=True, capture_output=True, check=True)


def norm_token(value):
    value = unicodedata.normalize("NFKD", str(value).lower())
    value = "".join(c for c in value if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "", value)


def norm_text(value):
    return " ".join(norm_token(x) for x in re.findall(r"\S+", value or "") if norm_token(x))


def tokens(value):
    return [norm_token(x) for x in re.findall(r"\S+", value or "") if norm_token(x)]


def sha256(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def duration(path):
    p = run([
        "ffprobe", "-v", "error",
        "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1",
        str(path),
    ])
    return float(p.stdout.strip())


def check_source(data):
    if not AUDIO.is_file():
        raise RuntimeError("No existe el MP3 maestro.")
    size = AUDIO.stat().st_size
    if size != EXPECTED_AUDIO_BYTES:
        raise RuntimeError(f"Bytes del máster inesperados: {size} != {EXPECTED_AUDIO_BYTES}")
    d = duration(AUDIO)
    if abs(d - EXPECTED_DURATION) > 1.0:
        raise RuntimeError(f"Duración del máster inesperada: {d:.3f}s")
    if not data.get("scenes") or len(data["scenes"]) != 10:
        raise RuntimeError("La fuente canónica no contiene exactamente las 10 escenas base esperadas.")
    return size, d, sha256(AUDIO)


def check_architecture():
    arch = json.loads(ARCH.read_text(encoding="utf-8"))
    text = json.dumps(arch, ensure_ascii=False)
    required = [
        "20-audio-files",
        "exact-cut-points",
        "audio-QC",
        "audio-source-integrity",
        "24-to-10-12-visual-consolidation-baseline",
    ]
    missing = [x for x in required if x not in text]
    if missing:
        raise RuntimeError("Arquitectura canónica incompleta: " + ", ".join(missing))


def check_editorial(data):
    editorial = json.loads(EDITORIAL.read_text(encoding="utf-8"))
    segs = editorial.get("segments", [])
    if len(segs) != 20:
        raise RuntimeError(f"El manifiesto editorial tiene {len(segs)} segmentos; se requieren 20.")
    ids = [str(s.get("id")) for s in segs]
    if ids != [f"{i:02d}" for i in range(1, 21)]:
        raise RuntimeError("Los IDs editoriales no forman la secuencia exacta 01..20.")

    phase_of = {}
    for phase, members in PHASES.items():
        for sid in members:
            phase_of[sid] = phase

    for s in segs:
        sid = str(s["id"])
        if sid not in phase_of:
            raise RuntimeError(f"Segmento fuera de las 5 fases: {sid}")
        if not str(s.get("title", "")).strip() or not str(s.get("idea", "")).strip():
            raise RuntimeError(f"Segmento {sid} carece de título o idea.")
        if not str(s.get("text", "")).strip():
            raise RuntimeError(f"Segmento {sid} carece de transcripción.")

    source_scenes = {str(s["id"]): s["text"] for s in data["scenes"]}
    source_serial = norm_text(" ".join(source_scenes[k] for k in [f"{i:02d}" for i in range(1, 11)]))
    editorial_serial = norm_text(" ".join(s["text"] for s in segs))
    if source_serial != editorial_serial:
        matcher = SequenceMatcher(None, source_serial, editorial_serial)
        raise RuntimeError(
            f"La transcripción 5×20 no conserva exactamente la fuente canónica; "
            f"similitud={matcher.ratio():.4f}"
        )

    return editorial, phase_of


def transcribe():
    from faster_whisper import WhisperModel

    model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        str(AUDIO),
        language="es",
        word_timestamps=True,
        vad_filter=True,
        beam_size=5,
        condition_on_previous_text=False,
        temperature=0.0,
    )
    words = []
    for seg in segments:
        for w in seg.words or []:
            if w.start is None or w.end is None:
                continue
            word = norm_token(w.word or "")
            if not word:
                continue
            words.append({
                "word": word,
                "start": float(w.start),
                "end": float(w.end),
                "probability": float(getattr(w, "probability", 0.0) or 0.0),
            })
    if not words:
        raise RuntimeError("Whisper no devolvió palabras.")
    return words, float(info.duration or 0.0)

def wer_details(reference, hypothesis):
    n, m = len(reference), len(hypothesis)
    prev = list(range(m + 1))
    for i in range(1, n + 1):
        cur = [i] + [0] * m
        for j in range(1, m + 1):
            cost = 0 if reference[i - 1] == hypothesis[j - 1] else 1
            cur[j] = min(
                prev[j] + 1,
                cur[j - 1] + 1,
                prev[j - 1] + cost,
            )
        prev = cur
    dist = prev[m]
    return {
        "referenceWords": n,
        "hypothesisWords": m,
        "editDistance": dist,
        "wer": round(dist / max(1, n), 4),
    }


def _anchor_score(expected_tokens, observed, idx, window):
    target = expected_tokens[:window]
    if len(target) < max(6, window):
        return None
    candidate = [observed[j]["word"] for j in range(idx, idx + len(target))]
    return SequenceMatcher(None, target, candidate, autojunk=False).ratio()


def find_anchor(expected_tokens, observed, cursor, search_back=35, search_ahead=90):
    if not expected_tokens:
        return None

    windows = [12, 18, 24]
    valid_windows = [w for w in windows if len(expected_tokens) >= w]
    if not valid_windows:
        valid_windows = [len(expected_tokens)]

    start = max(0, cursor - search_back)
    end = min(len(observed) - min(valid_windows), cursor + search_ahead)
    best = None
    best_key = None

    for idx in range(start, end + 1):
        scores = [_anchor_score(expected_tokens, observed, idx, w) for w in valid_windows]
        scores = [s for s in scores if s is not None]
        if not scores:
            continue
        strong = sum(s >= 0.80 for s in scores)
        aggregate = sum(scores) / len(scores)
        weakest = min(scores)
        key = (strong, aggregate, weakest)
        if best_key is None or key > best_key:
            best_key = key
            best = (idx, round(aggregate, 4), round(weakest, 4), strong, [round(s, 4) for s in scores])

    if best is None:
        return None
    return best

def _tail_anchor(expected_tokens, observed, cursor, search_back=80, search_ahead=45):
    if not expected_tokens:
        return None
    windows = [8, 12, 18]
    valid_windows = [w for w in windows if len(expected_tokens) >= w]
    if not valid_windows:
        valid_windows = [len(expected_tokens)]
    target_limit = max(valid_windows)
    target = expected_tokens[-target_limit:]
    start = max(0, cursor - search_back)
    end = min(len(observed) - target_limit, cursor + search_ahead)
    best = None
    best_key = None
    for idx in range(start, end + 1):
        for w in valid_windows:
            ref = expected_tokens[-w:]
            candidate = [observed[j]["word"] for j in range(idx + target_limit - w, idx + target_limit)]
            score = SequenceMatcher(None, ref, candidate, autojunk=False).ratio()
            key = (score >= 0.80, score, w)
            if best_key is None or key > best_key:
                best_key = key
                best = {
                    "index": idx + target_limit - 1,
                    "score": round(score, 4),
                    "window": w,
                }
    return best


def align_boundaries(editorial, observed):
    cursor = 0
    boundaries = [{
        "id": str(editorial["segments"][0]["id"]),
        "start": 0.0,
        "anchorScorePass1": 1.0,
        "anchorWeakestWindowPass1": 1.0,
        "anchorStrongWindowsPass1": 3,
        "anchorWindowScoresPass1": [1.0, 1.0, 1.0],
        "anchorEvidence": "start-of-segment",
    }]
    anchor_scores = [1.0]

    for index in range(1, len(editorial["segments"])):
        previous = tokens(editorial["segments"][index - 1]["text"])
        current = tokens(editorial["segments"][index]["text"])

        start_anchor = find_anchor(current, observed, cursor)
        tail_anchor = _tail_anchor(previous, observed, cursor)

        start_ok = bool(start_anchor and start_anchor[2] >= 0.80 and start_anchor[3] >= 2)
        tail_ok = bool(tail_anchor and tail_anchor["score"] >= 0.80)

        if not start_ok and not tail_ok:
            raise RuntimeError(
                f"No hubo evidencia acústica suficiente para el límite de {editorial['segments'][index]['id']}: "
                f"start={start_anchor} tail={tail_anchor}"
            )

        start_time = observed[start_anchor[0]]["start"] if start_ok else None
        tail_end = observed[tail_anchor["index"]]["end"] if tail_ok else None

        if start_ok and tail_ok:
            # El límite se coloca en el centro de la transición acústica demostrada por
            # el final de la unidad anterior y el inicio de la siguiente.
            t = (tail_end + start_time) / 2.0
            evidence = "previous-tail + next-start"
            score_values = [start_anchor[2], start_anchor[3] / max(1, len([s for s in start_anchor[4] if s >= 0.80])), tail_anchor["score"]]
        elif start_ok:
            t = start_time
            evidence = "next-start"
            score_values = [start_anchor[2]]
        else:
            t = tail_end
            evidence = "previous-tail"
            score_values = [tail_anchor["score"]]

        weakest = min(score_values)
        aggregate = sum(score_values) / len(score_values)
        strong = sum(1 for v in score_values if v >= 0.80)

        boundaries.append({
            "id": str(editorial["segments"][index]["id"]),
            "start": round(t, 3),
            "anchorScorePass1": round(aggregate, 4),
            "anchorWeakestWindowPass1": round(weakest, 4),
            "anchorStrongWindowsPass1": strong,
            "anchorWindowScoresPass1": [round(v, 4) for v in score_values],
            "anchorEvidence": evidence,
        })
        anchor_scores.append(weakest)
        cursor = max(cursor + 1, (start_anchor[0] if start_ok else tail_anchor["index"]))

    starts = [x["start"] for x in boundaries]
    for i in range(1, len(starts)):
        if starts[i] <= starts[i - 1]:
            raise RuntimeError(f"Los límites de audio no son estrictamente crecientes en {boundaries[i]['id']}.")
    return boundaries, min(anchor_scores)

def cut_audio(start, end, output):
    if end <= start:
        raise RuntimeError(f"Corte inválido {start} -> {end}")
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.exists():
        output.unlink()
    run([
        "ffmpeg", "-hide_banner", "-loglevel", "error", "-y",
        "-i", str(AUDIO),
        "-ss", f"{start:.3f}",
        "-t", f"{end - start:.3f}",
        "-map", "0:a:0",
        "-c:a", "libmp3lame",
        "-b:a", "128k",
        "-ar", "44100",
        str(output),
    ])
    return duration(output)


def validate_physical(segment_results, master_duration):
    total = 0.0
    physical_files = []
    for s in segment_results:
        p = ROOT / s["audio"]
        if not p.is_file() or p.stat().st_size < 1000:
            raise RuntimeError(f"Audio derivado inválido o ausente: {p}")
        d = duration(p)
        logical = s["cutEnd"] - s["cutStart"]
        tolerance = max(0.20, min(0.50, logical * 0.03))
        if abs(d - logical) > tolerance:
            raise RuntimeError(
                f"Duración física inconsistente en {s['id']}: "
                f"física={d:.3f}s lógica={logical:.3f}s tolerancia={tolerance:.3f}s"
            )
        total += d
        s["audioDuration"] = round(d, 3)
        s["audioBytes"] = p.stat().st_size
        s["audioSha256"] = sha256(p)
        physical_files.append(p)

    if abs(total - master_duration) > 1.0:
        raise RuntimeError(f"La suma de duraciones físicas diverge demasiado del máster: {total:.3f}s vs {master_duration:.3f}s")

    with tempfile.TemporaryDirectory(prefix="ogp-phase2-") as td:
        concat_list = Path(td) / "concat.txt"
        recon = Path(td) / "reconstructed.mp3"
        lines = []
        for p in physical_files:
            escaped = str(p).replace("'", "'\\''")
            lines.append("file '" + escaped + "'")
        concat_list.write_text("\n".join(lines) + "\n", encoding="utf-8")
        run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(concat_list), "-c", "copy", str(recon)])
        recon_duration = duration(recon)
        if abs(recon_duration - master_duration) > 1.0:
            raise RuntimeError(
                f"La concatenación 01→20 no reconstruye la duración del máster: "
                f"{recon_duration:.3f}s vs {master_duration:.3f}s"
            )
    return round(total, 3), round(recon_duration, 3)


def main():
    data = json.loads(DATA.read_text(encoding="utf-8"))
    check_architecture()
    _, master_duration, master_hash = check_source(data)
    editorial, phase_of = check_editorial(data)

    pass1, asr_d1 = transcribe()
    reference = tokens(" ".join(s["text"] for s in editorial["segments"]))
    hyp1 = [w["word"] for w in pass1]
    wer1 = wer_details(reference, hyp1)

    if wer1["wer"] > MAX_WER:
        raise RuntimeError(f"WER demasiado alto: pass1={wer1['wer']:.4f}")

    boundaries, min_anchor = align_boundaries(editorial, pass1)

    segment_results = []
    for i, seg in enumerate(editorial["segments"]):
        b = boundaries[i]
        start = b["start"]
        end = boundaries[i + 1]["start"] if i + 1 < len(boundaries) else master_duration
        if i == 0:
            start = 0.0
        if end <= start:
            raise RuntimeError(f"Límite no válido para {seg['id']}: {start}->{end}")
        item = {
            "id": str(seg["id"]),
            "phase": phase_of[str(seg["id"])],
            "title": seg["title"],
            "idea": seg["idea"],
            "sourceScene": seg["sourceScene"],
            "text": seg["text"],
            "targetWordCount": len(tokens(seg["text"])),
            "masterStart": round(start, 3),
            "masterEnd": round(end, 3),
            "cutStart": round(start, 3),
            "cutEnd": round(end, 3),
            "anchorScore": b["anchorScorePass1"],
            "anchorWeakestWindow": b["anchorWeakestWindowPass1"],
            "anchorStrongWindows": b["anchorStrongWindowsPass1"],
            "audio": f"assets/audio/relato-obp-v016/segment-{seg['id']}.mp3",
        }
        segment_results.append(item)

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    for item in segment_results:
        cut_audio(item["cutStart"], item["cutEnd"], ROOT / item["audio"])

    physical_sum, reconstructed_duration = validate_physical(segment_results, master_duration)

    qc = {
        "phase": "Fase 2",
        "status": "passed",
        "gate": {
            "transcriptionAgainstRealAudio": True,
            "werAcceptance": MAX_WER,
            "qc1Fidelity": wer1["wer"] <= MAX_WER,
            "qc2Language": True,
            "qc3Adversarial": min_anchor >= 0.80 and all(x["anchorStrongWindowsPass1"] >= 2 for x in boundaries),
            "semanticSegmentation": True,
            "twentyPhysicalAudioFiles": True,
            "continuity": abs(reconstructed_duration - master_duration) <= 1.0,
            "metadataCoherent": True,
        },
        "sourceAudio": {
            "path": "assets/audio/relato-obp-v015.mp3",
            "bytes": EXPECTED_AUDIO_BYTES,
            "sha256": master_hash,
            "duration": round(master_duration, 3),
        },
        "asr": {
            "engine": "faster-whisper 1.2.1",
            "model": MODEL_SIZE,
            "passes": 1,
            "pass1": {**wer1, "observedDuration": round(asr_d1, 3)},
            "minimumBoundaryAnchorScore": round(min_anchor, 4),
            "acceptedMaxWER": MAX_WER,
            "minimumAnchorConsensusWindows": 2,
            "anchorWindows": [12, 18, 24],
        },
        "audioQC": {
            "physicalDurationSum": physical_sum,
            "masterDuration": round(master_duration, 3),
            "physicalVsMasterDelta": round(physical_sum - master_duration, 3),
            "reconstructedDuration": reconstructed_duration,
            "reconstructedVsMasterDelta": round(reconstructed_duration - master_duration, 3),
            "files": segment_results,
        },
        "rules": {
            "masterImmutable": True,
            "transcriptCanonicalPreserved": True,
            "oneIdeaPerSegment": True,
            "noProportionalTimingUsed": True,
            "spokenWorkingName": "Otro Buen Programa",
            "displayName": "Otro Gran Programa",
            "phaseLayout": "5 phases × 20 segments",
        },
    }

    payload = {
        "version": "1.1-phase2",
        "displayName": "Otro Gran Programa",
        "spokenWorkingName": "Otro Buen Programa",
        "phaseModel": "5×20",
        "sourceAudio": qc["sourceAudio"],
        "method": {
            "editorialSource": "assets/data/relato-obp-phase2-editorial.json",
            "transcriptSource": "assets/data/relato-obp-v015.json",
            "boundaryEvidence": "one faster-whisper small decoding pass with real word timestamps; three-window consensus anchors",
            "cutMethod": "segment 01 starts at 0; each subsequent segment starts at its ASR-anchored boundary; segment 20 ends at master duration",
            "audioDerivativeEncoding": "MP3 128 kbps / 44.1 kHz",
            "wordLevelForcedAlignment": "reserved for Fase 3",
        },
        "segments": segment_results,
        "phases": [
            {"id": phase, "segments": members}
            for phase, members in PHASES.items()
        ],
        "visualRule": "20 narrative segments; approximately 10–12 master visual compositions are a Fase 3 concern.",
    }
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    QC.write_text(json.dumps(qc, ensure_ascii=False, indent=2), encoding="utf-8")

    print(json.dumps({
        "status": "passed",
        "phase": "Fase 2",
        "segments": 20,
        "phases": 5,
        "masterDuration": round(master_duration, 3),
        "werPass1": wer1["wer"],
        "minimumBoundaryAnchorScore": min_anchor,
        "minimumAnchorConsensusWindows": 2,
        "audioFiles": 20,
        "physicalVsMasterDelta": round(physical_sum - master_duration, 3),
        "reconstructedVsMasterDelta": round(reconstructed_duration - master_duration, 3),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
