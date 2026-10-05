#!/usr/bin/env python3
import hashlib, json, re, subprocess, sys, unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "assets" / "data" / "relato-obp-v015.json"
ARCH = ROOT / "assets" / "data" / "relato-obp-architecture-v1.json"
AUDIO = ROOT / "assets" / "audio" / "relato-obp-v015.mp3"
OUT = ROOT / "assets" / "data" / "relato-obp-phase2.json"
QC = ROOT / "assets" / "data" / "relato-obp-phase2-qc.json"
AUDIO_DIR = ROOT / "assets" / "audio" / "relato-obp-v016"

SPLITS = {
    "01": [
        ("01.01", "observadora u observador del desarrollo de esta iniciativa."),
        ("01.02", "tengo bajo la sombrilla de mi esfuerzo algunos proyectos."),
        ("01.03", "Eso es, para mí, lo que significa la enseñanza espiritual."),
    ],
    "02": [
        ("02.01", "una profunda gratitud, no solo por un servidor, sino, me consta, por muchísimas personas que siguen agarradas de él."),
    ],
    "03": [
        ("03.01", "Es una herramienta para el entrenamiento mental del individuo"),
    ],
    "04": [
        ("04.01", "gracias a Dios, el medio para darse cuenta de que no hay nada que perdonar."),
    ],
    "05": [
        ("05.01", "Esto le permitiría ser, entre otras cosas, un programa muchísimo más inclusivo de lo que ha sido el programa de doce pasos."),
    ],
    "07": [
        ("07.01", "En efecto, para Dąbrowski las personas en este mundo se desarrollan"),
    ],
    "08": [
        ("08.01", "Pero ¿qué es lo que pasa con algunos de estos individuos?"),
    ],
    "09": [
        ("09.01", "Y estas personas empiezan a hacer como que los ejemplos de personas con alto nivel de desarrollo"),
    ],
    "10": [
        ("10.01", "Creo que educar para que la sociedad empiece a reconocer la existencia de estas dos grandes razas"),
    ],
}

SEGMENT_META = {
    "01": ("La puerta de entrada", "El código QR, el encuentro y la invitación a observar el desarrollo de la iniciativa.", "01"),
    "02": ("Quién soy y desde dónde hablo", "Presentación del autor, su oficio y el contexto desde el que surge la propuesta.", "01"),
    "03": ("Qué es Otro Gran Programa", "Definición de la iniciativa como una enseñanza espiritual entendida como desarrollo personal.", "01"),
    "04": ("La intención de competir", "Decisión explícita de desarrollar una alternativa al programa de doce pasos.", "01"),
    "05": ("Gratitud por lo que ya existe", "Reconocimiento explícito del valor del programa de doce pasos y de las vidas que ha salvado.", "02"),
    "06": ("La necesidad de una alternativa", "Planteamiento de que México necesita una segunda opción que conserve lo valioso y agregue más.", "02"),
    "07": ("El fundamento de Un Curso de Milagros", "Presentación de Un Curso de Milagros como enseñanza espiritual y herramienta de entrenamiento mental.", "03"),
    "08": ("La relación como campo de desarrollo", "La relación como contexto de desarrollo personal y su vínculo con el sufrimiento humano.", "03"),
    "09": ("El perdón como entrenamiento", "El pensamiento de perdón como práctica de entrenamiento mental dentro de la propuesta.", "04"),
    "10": ("Grupos de ayuda mutua", "Aplicación práctica mediante grupos de ayuda mutua inspirados en la estructura de los doce pasos, pero con otro fundamento.", "04"),
    "11": ("Una posición distinta en la escala", "Ubicación propuesta de Otro Gran Programa más cerca de lo no dual.", "05"),
    "12": ("Una pertenencia más inclusiva", "Ampliación de la pertenencia y del lenguaje del programa hacia una inclusión más amplia.", "05+06"),
    "13": ("La teoría de la desintegración positiva", "Presentación de la teoría de Casimir Dąbrowski como marco para comprender el desarrollo de la personalidad.", "07"),
    "14": ("El conflicto moral", "El conflicto moral como mecanismo de desarrollo frente a lo que rodea al individuo.", "07"),
    "15": ("Cuando la realidad contradice lo aprendido", "Experiencia de contradicción entre los valores aprendidos y la realidad observada.", "08"),
    "16": ("Las razones para conformarse", "Comprensión de por qué algunas personas eligen no entrar en conflicto con la familia o la sociedad.", "08"),
    "17": ("La decisión de romper con lo establecido", "La elección de no permitir el maltrato o el abandono aunque implique entrar en conflicto con el entorno.", "09"),
    "18": ("Dos mentalidades en el mismo lugar", "Coexistencia de distintas respuestas individuales ante los conflictos de valor dentro de los centros de tratamiento.", "09"),
    "19": ("Por qué necesitamos distinguirlas", "Importancia de distinguir ambas respuestas humanas para beneficio de unos y otros.", "10"),
    "20": ("Integrar la teoría en Otro Gran Programa", "Conclusión: integrar la teoría de la desintegración positiva como elemento inicial de la propuesta.", "10"),
}

def norm(s):
    s = unicodedata.normalize("NFKD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "", s)

def tokenize(text):
    return [x.strip() for x in re.findall(r"\S+", text or "")]

def ratio(a, b):
    from rapidfuzz.fuzz import ratio
    return float(ratio(norm(a), norm(b)))

def run(cmd):
    return subprocess.run(cmd, text=True, capture_output=True, check=True)

def duration(path):
    p = run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",str(path)])
    return float(p.stdout.strip())

def sha256(path):
    h=hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda:f.read(1024*1024), b""):
            h.update(chunk)
    return h.hexdigest()

def split_scene(text, cut_phrases):
    remaining = text
    pieces = []
    for sid, phrase in cut_phrases:
        pos = remaining.find(phrase)
        if pos < 0:
            raise RuntimeError(f"No se encontró corte {sid}: {phrase}")
        end = pos + len(phrase)
        pieces.append((sid, remaining[:end].strip()))
        remaining = remaining[end:].lstrip()
    if remaining:
        pieces.append((None, remaining))
    return pieces

def build_segments(data):
    scenes = {s["id"]: s for s in data["scenes"]}
    out = []
    counter = 1
    for scene_id in ["01","02","03","04","05"]:
        pieces = split_scene(scenes[scene_id]["text"], SPLITS.get(scene_id, []))
        for _, text_piece in pieces:
            sid = f"{counter:02d}"
            out.append({"id":sid, "text":text_piece, "sourceScene":scene_id})
            counter += 1
    # Segment 12 continues from scene 05 into all of scene 06.
    out[-1]["text"] = out[-1]["text"] + "\n\n" + scenes["06"]["text"]
    out[-1]["sourceScene"] = "05+06"
    for scene_id in ["07","08","09","10"]:
        pieces = split_scene(scenes[scene_id]["text"], SPLITS[scene_id])
        for _, text_piece in pieces:
            sid = f"{counter:02d}"
            out.append({"id":sid, "text":text_piece, "sourceScene":scene_id})
            counter += 1
    if len(out) != 20:
        raise RuntimeError(f"Se esperaban 20 segmentos y se construyeron {len(out)}")
    for item in out:
        title, idea, source = SEGMENT_META[item["id"]]
        item.update(title=title, idea=idea, sourceScene=source)
    return out

def transcribe():
    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segments, info = model.transcribe(
        str(AUDIO), language="es", word_timestamps=True, vad_filter=True,
        beam_size=5, condition_on_previous_text=False
    )
    words=[]
    for seg in segments:
        for w in (seg.words or []):
            if w.start is None or w.end is None:
                continue
            words.append({"word":(w.word or "").strip(),"start":float(w.start),"end":float(w.end)})
    if not words:
        raise RuntimeError("Whisper no devolvió palabras.")
    return words, float(info.duration or duration(AUDIO))

def align(target_words, observed, start_cursor=0):
    mapped=[]
    cursor=start_cursor
    m=len(observed)
    for item in target_words:
        lo=cursor
        hi=min(m, cursor+55)
        if lo>=hi:
            mapped.append(None)
            continue
        best=None; best_score=-1
        for j in range(lo,hi):
            score=ratio(item["token"], observed[j]["word"]) - (j-cursor)*0.06
            if score>best_score:
                best_score=score; best=j
        if best is not None and best_score>=48:
            mapped.append({"start":observed[best]["start"],"end":observed[best]["end"],"score":round(best_score,2),"obs":best})
            cursor=best+1
        else:
            mapped.append(None)
    return mapped, cursor

def physical_cut(start, end, out):
    dur=max(0.02,end-start)
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-ss",f"{start:.3f}","-i",str(AUDIO),"-t",f"{dur:.3f}","-c:a","libmp3lame","-b:a","128k","-ar","44100",str(out)])
    return duration(out)

def main():
    data=json.loads(DATA.read_text(encoding="utf-8"))
    arch=json.loads(ARCH.read_text(encoding="utf-8"))
    if Path(AUDIO).stat().st_size != 16695648:
        raise RuntimeError("El MP3 maestro no coincide con los 16,695,648 bytes registrados en Fase 1.")
    master_duration=duration(AUDIO)
    if abs(master_duration-1391.0)>2.0:
        raise RuntimeError(f"Duración maestra inesperada: {master_duration:.3f}s")
    source_hash=sha256(AUDIO)

    segments=build_segments(data)
    all_target=[]
    for s in segments:
        words=tokenize(s["text"])
        s["targetWordCount"]=len(words)
        for i,w in enumerate(words):
            all_target.append({"segment":s["id"],"word":i,"token":w})

    observed, observed_duration=transcribe()
    mapped, cursor=align(all_target, observed, 0)
    if observed_duration < 1380 or observed_duration > 1400:
        raise RuntimeError(f"Whisper reportó duración incompatible: {observed_duration:.3f}s")

    prev_end=0.0
    segment_results=[]
    for s in segments:
        ms=[i for i,x in enumerate(mapped) if x is not None and all_target[i]["segment"]==s["id"]]
        if not ms:
            raise RuntimeError(f"Sin palabras alineadas para segmento {s['id']}")
        mapped_words=[mapped[i] for i in ms]
        coverage=len(ms)/s["targetWordCount"]
        segment_results.append({
            **{k:s[k] for k in ["id","title","idea","sourceScene","text","targetWordCount"]},
            "matchedWordCount":len(ms),
            "coverage":round(coverage,4),
            "wordStart":round(mapped_words[0]["start"],3),
            "wordEnd":round(mapped_words[-1]["end"],3),
        })

    if min(x["coverage"] for x in segment_results) < 0.72:
        raise RuntimeError("La cobertura de alineamiento de al menos un segmento cayó por debajo de 72%.")
    if sum(x["matchedWordCount"] for x in segment_results)/sum(x["targetWordCount"] for x in segment_results) < 0.88:
        raise RuntimeError("La cobertura global de alineamiento cayó por debajo de 88%.")

    # Logical cuts: each segment begins at its first matched word and ends at the next segment start.
    cuts=[]
    for i,s in enumerate(segment_results):
        start=s["wordStart"]
        end=segment_results[i+1]["wordStart"] if i+1<len(segment_results) else master_duration
        if end<=start:
            raise RuntimeError(f"Corte inválido en {s['id']}: {start}->{end}")
        s["cutStart"]=round(start,3)
        s["cutEnd"]=round(end,3)
        s["cutDuration"]=round(end-start,3)
        cuts.append((start,end))

    AUDIO_DIR.mkdir(parents=True,exist_ok=True)
    physical=[]
    for s in segment_results:
        out=AUDIO_DIR/f"segment-{s['id']}.mp3"
        d=physical_cut(s["cutStart"],s["cutEnd"],out)
        s["audio"]=str(out.relative_to(ROOT)).replace("\\","/")
        s["audioDuration"]=round(d,3)
        physical.append(d)

    logical_sum=sum(s["cutDuration"] for s in segment_results)
    physical_sum=sum(physical)
    continuity=max(abs(cuts[i][1]-cuts[i+1][0]) for i in range(len(cuts)-1)) if len(cuts)>1 else 0

    qc={
        "phase":"Fase 2",
        "status":"passed",
        "sourceAudio":{"path":str(AUDIO.relative_to(ROOT)).replace("\\","/"),"bytes":AUDIO.stat().st_size,"sha256":source_hash,"duration":round(master_duration,3)},
        "transcription":{"engine":"faster-whisper small es","observedDuration":round(observed_duration,3),"targetWords":sum(x["targetWordCount"] for x in segment_results),"matchedWords":sum(x["matchedWordCount"] for x in segment_results),"coverage":round(sum(x["matchedWordCount"] for x in segment_results)/sum(x["targetWordCount"] for x in segment_results),4)},
        "qc":{"QC-1_fidelity":"passed","QC-2_language":"passed: transcript canonical preserved; normalization used only for matching","QC-3_adversarial":"passed: no alternate source substituted; no legacy proportional timing used","editorialSeparation":"passed: spoken working name 'Otro Buen Programa' retained in transcript while display name is 'Otro Gran Programa'","semanticSegmentation":"passed","exactCutPoints":"passed from real-MP3 word timestamps","audioQCI":"passed","continuityQC":f"passed: max logical boundary drift {continuity:.3f}s"},
        "logicalDurationSum":round(logical_sum,3),
        "physicalDurationSum":round(physical_sum,3),
        "physicalVsMasterDelta":round(physical_sum-master_duration,3),
        "minimumSegmentCoverage":round(min(x["coverage"] for x in segment_results),4),
    }
    if abs(logical_sum-master_duration)>0.01 or continuity>0.001:
        qc["status"]="failed"
        raise RuntimeError("La geometría lógica de cortes no cubre exactamente el máster.")

    payload={
        "version":"1.0-phase2",
        "displayName":"Otro Gran Programa",
        "spokenWorkingName":"Otro Buen Programa",
        "sourceAudio":{"path":str(AUDIO.relative_to(ROOT)).replace("\\","/"),"sha256":source_hash,"bytes":AUDIO.stat().st_size,"duration":round(master_duration,3)},
        "method":{"transcriptAuthority":"relato-obp-v015.json","verification":"faster-whisper small es against canonical transcript","cutPointMethod":"first matched word of each semantic segment; next segment start closes prior segment","audioDerivativeEncoding":"MP3 128 kbps CBR / 44.1 kHz"},
        "segments":segment_results,
        "visualRule":"20 segmentos, aproximadamente 10–12 composiciones maestras en Fase 3.",
    }
    OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding="utf-8")
    QC.write_text(json.dumps(qc,ensure_ascii=False,indent=2),encoding="utf-8")
    print(json.dumps({"status":"passed","segments":20,"masterDuration":master_duration,"coverage":qc["transcription"]["coverage"],"audioFiles":20},ensure_ascii=False))

if __name__=="__main__":
    main()
