from pathlib import Path
import subprocess, json, sys

ROOT = Path(r"C:\Users\MantenimientoRCI\Desktop\OGP - Otro Gran Programa")
if not ROOT.exists():
    raise SystemExit("Repositorio local no existe")

# Start from canonical main and isolate this preparation branch.
subprocess.run(["git","-C",str(ROOT),"fetch","origin","main"],check=True)
subprocess.run(["git","-C",str(ROOT),"checkout","-B","prep/identity-sprint-attention-20261007","origin/main"],check=True)

protected = {
    "assets/data/relato-ogp-phase2-editorial.json",
    "assets/data/relato-ogp-phase2-qc.json",
    "assets/data/relato-ogp-phase2.json",
    "assets/data/relato-ogp-phase3.json",
    "assets/data/relato-ogp-v015.json",
    "assets/data/story-word-timing.json",
}
extensions = {".md",".html",".js",".css",".json",".py",".txt",".webmanifest",".yml",".yaml",".xml"}

def rb(path, pairs):
    b = path.read_bytes()
    o = b
    for old, new in pairs:
        b = b.replace(old.encode("utf-8"), new.encode("utf-8"))
    if b != o:
        path.write_bytes(b)

base_pairs = [
    ("https://github.com/SeryMente/otrogranprograma","https://github.com/SeryMente/otrogranprograma"),
    ("https://serymente.github.io/otrogranprograma/","https://serymente.github.io/otrogranprograma/"),
    ("otrogranprograma","otrogranprograma"),
    ("relato-ogp","relato-ogp"),
    ("OGP","OGP"),
]
tech_pairs = [
    ("ogp-", "ogp-"),
    ("ogp_", "ogp_"),
    ('id="ogp"', 'id="ogp"'),
    ("id='ogp'", "id='ogp'"),
    ('data-ogp-', 'data-ogp-'),
    ("__ogp", "__ogp"),
]

for p in ROOT.rglob("*"):
    if not p.is_file() or p.suffix.lower() not in extensions:
        continue
    rel = p.relative_to(ROOT).as_posix()
    pairs = base_pairs + tech_pairs
    if rel not in protected:
        pairs = pairs + [("Otro Gran Programa","Otro Gran Programa")]
    rb(p, pairs)

# Protected source data: preserve literal spoken words/text; only metadata, labels and paths change.
for p in (ROOT/"assets/data").glob("relato-ogp-*.json"):
    rb(p, [
        ('"spokenWorkingName": "Otro Gran Programa"','"spokenWorkingName": "Otro Gran Programa"'),
        ('"title": "QuÃƒÂ© es Otro Gran Programa"','"title": "QuÃƒÂ© es Otro Gran Programa"'),
        ('"title": "Otro Gran Programa"','"title": "Otro Gran Programa"'),
        ('"displayName": "Otro Gran Programa"','"displayName": "Otro Gran Programa"'),
        ('"sourceAudio": "assets/audio/relato-ogp-v015.mp3"','"sourceAudio": "assets/audio/relato-ogp-v015.mp3"'),
        ('"sourceTranscript": "assets/data/relato-ogp-v015.json"','"sourceTranscript": "assets/data/relato-ogp-v015.json"'),
        ('"editorialSource": "assets/data/relato-ogp-phase2-editorial.json"','"editorialSource": "assets/data/relato-ogp-phase2-editorial.json"'),
        ('"transcriptSource": "assets/data/relato-ogp-v015.json"','"transcriptSource": "assets/data/relato-ogp-v015.json"'),
    ])

# story timing references the master audio path; do not touch word tokens.
rb(ROOT/"assets/data/story-word-timing.json", [
    ('"sourceAudio": "assets/audio/relato-ogp-v015.mp3"','"sourceAudio": "assets/audio/relato-ogp-v015.mp3"'),
    ('"sourcePhase2": "assets/data/relato-ogp-phase2.json"','"sourcePhase2": "assets/data/relato-ogp-phase2.json"'),
])

# Rename technical paths.
moves = [
    ("assets/audio/relato-ogp-v015.mp3","assets/audio/relato-ogp-v015.mp3"),
    ("assets/audio/relato-ogp-v016","assets/audio/relato-ogp-v016"),
]
for src,dst in moves:
    if (ROOT/src).exists():
        subprocess.run(["git","-C",str(ROOT),"mv",src,dst],check=True)
for p in list((ROOT/"assets/data").glob("relato-ogp-*.json")):
    subprocess.run(["git","-C",str(ROOT),"mv",str(p),str(p.with_name(p.name.replace("relato-ogp","relato-ogp")))],check=True)

# Remove old tracked path spellings if any remain after rename transformations.
strategy = """# Sprint Ã‚Â· AtenciÃƒÂ³n audiovisual por correspondencia inmediata

**Proyecto:** Otro Gran Programa  
**Repositorio canÃƒÂ³nico:** https://github.com/SeryMente/otrogranprograma  
**URL pÃƒÂºblica canÃƒÂ³nica:** https://serymente.github.io/otrogranprograma/  
**Estado:** estrategia endurecida; pendiente de ejecuciÃƒÂ³n

## Necesidad subyacente

La necesidad no es volver la experiencia artificialmente "adictiva". Es lograr que escuchar y mirar se perciban como **una sola seÃƒÂ±al temporal**, con una recompensa inmediata por comprobar que voz y palabra visual coinciden. La persona debe poder anticipar el siguiente cambio, comprobarlo y seguir escuchando porque el seguimiento resulta claro, continuo y satisfactorio.

La hipÃƒÂ³tesis de hacer que la intensidad visual siga la intensidad de la voz es ÃƒÂºtil, pero insuficiente por sÃƒÂ­ sola: volumen no equivale a importancia y demasiada reactividad puede convertirse en ruido. El diseÃƒÂ±o se endurece en este orden:

1. **Continuidad temporal:** nunca debe parecer que la correspondencia desaparece durante una pausa breve.
2. **Correspondencia prosÃƒÂ³dica:** la energÃƒÂ­a vocal modula la presencia visual de manera suave y estable.
3. **Seguimiento gratificante:** la progresiÃƒÂ³n visual dentro de cada palabra hace perceptible el "acierto" de tiempo real.

## EstÃƒÂ¡ndar final

- Exactitud: **M10 = 0%, M11 = 0%, M12 = 100%, M13 = 100%**.
- Latencia: **M9 P95 Ã¢â€°Â¤ 10 ms** como objetivo de producto; **Ã¢â€°Â¤ 5 ms** como excelencia.
- Continuidad: sin huecos perceptibles durante silencios breves.
- Prosodia: seÃƒÂ±al acÃƒÂºstica suavizada Ã¢â€ â€™ presencia visual; sin parpadeo ni jitter.
- Legibilidad: el estÃƒÂ­mulo nunca compite con el texto.
- No distracciÃƒÂ³n: la animaciÃƒÂ³n existe para reforzar el seguimiento.
- ValidaciÃƒÂ³n: A/B con escucha real; no basta con que "se vea bonito".
- Evidencia: cada iteraciÃƒÂ³n registra nÃƒÂºmeros, delta, decisiÃƒÂ³n, commit y publicaciÃƒÂ³n.

## IteraciÃƒÂ³n 1 Ã‚Â· Continuidad visual

Eliminar el encendido/apagado entre palabras. La palabra activa conserva el foco; las palabras reciÃƒÂ©n pronunciadas dejan una estela breve. En una pausa corta, la ÃƒÂºltima palabra permanece como ancla visual y la transiciÃƒÂ³n anticipa la siguiente sin inventar contenido.

**Gate:** exactitud intacta y continuidad perceptual superior a la versiÃƒÂ³n actual.

## IteraciÃƒÂ³n 2 Ã‚Â· Correspondencia prosÃƒÂ³dica

Calcular una envolvente acÃƒÂºstica suavizada y trasladarla a luminancia/glow/presencia. La respuesta tendrÃƒÂ¡ attack/release, lÃƒÂ­mites y suavizado para evitar jitter. MÃƒÂ¡s energÃƒÂ­a vocal aumenta presencia; menos energÃƒÂ­a la reduce, pero no la elimina.

**Gate:** correlaciÃƒÂ³n acÃƒÂºstico-visual fuerte, jitter bajo, legibilidad intacta.

## IteraciÃƒÂ³n 3 Ã‚Â· Seguimiento gratificante

Introducir una progresiÃƒÂ³n intrapalabra sutil durante el intervalo real de cada palabra. El avance visual confirma al oyente que la correspondencia continÃƒÂºa acertando. El bucle perceptual buscado es:

**escuchar Ã¢â€ â€™ ver coincidir Ã¢â€ â€™ anticipar Ã¢â€ â€™ comprobar Ã¢â€ â€™ continuar**

**Gate:** mejora de preferencia y/o permanencia frente a la versiÃƒÂ³n previa en una comparaciÃƒÂ³n A/B, sin degradar ningÃƒÂºn gate tÃƒÂ©cnico.

## DecisiÃƒÂ³n

**MEJORA:** publicar.  
**FUNCIONAL SIN MEJORA:** no promover; registrar.  
**FALLA:** corregir dentro del mismo ciclo; no publicar.

## OperaciÃƒÂ³n

**CAMBIO Ã¢â€ â€™ BENCHMARK Ã¢â€ â€™ NÃƒÅ¡MEROS Ã¢â€ â€™ DELTA Ã¢â€ â€™ DECISIÃƒâ€œN Ã¢â€ â€™ EVIDENCIA Ã¢â€ â€™ LIVE**

No se ejecuta una iteraciÃƒÂ³n posterior mientras la actual no haya terminado.

## LÃƒÂ­mite de diseÃƒÂ±o

La meta es sostener **atenciÃƒÂ³n voluntaria, comprensiÃƒÂ³n y continuidad de escucha** mediante una correspondencia audiovisual excelente. No se diseÃƒÂ±an mecanismos para explotar compulsiones, ansiedad o dependencia del estÃƒÂ­mulo.

## Fidelidad sonora

Las fuentes de transcripciÃƒÂ³n conservan literalmente las palabras realmente pronunciadas. Esa conservaciÃƒÂ³n es evidencia de audio, no branding. Los metadatos, rutas, identificadores y superficies de comunicaciÃƒÂ³n sÃƒÂ­ deben usar exclusivamente **Otro Gran Programa / OGP**.
"""
(ROOT/"docs/SPRINT-ATENCION-AUDIOVISUAL-20261007.md").write_text(strategy,encoding="utf-8")

identity = """# Identidad canÃƒÂ³nica Ã‚Â· Otro Gran Programa

**Nombre oficial:** Otro Gran Programa  
**AcrÃƒÂ³nimo:** OGP  
**Repositorio:** https://github.com/SeryMente/otrogranprograma  
**URL pÃƒÂºblica:** https://serymente.github.io/otrogranprograma/

Toda superficie de comunicaciÃƒÂ³n, documentaciÃƒÂ³n, cÃƒÂ³digo identificable, URL interna, nombre tÃƒÂ©cnico, ID y ruta debe usar la identidad nueva.

### ExcepciÃƒÂ³n

El corpus de audio/transcripciÃƒÂ³n conserva literalmente lo pronunciado en el audio. Esa cadena es dato fuente y no se modifica por motivos de branding.
"""
(ROOT/"docs/IDENTIDAD-CANONICA-20261007.md").write_text(identity,encoding="utf-8")

readme=ROOT/"README.md"
b=readme.read_bytes()

subprocess.run(["git","-C",str(ROOT),"add","-A"],check=True)

old=[]
for pat in ["Otro Gran Programa","OGP","otrogranprograma","https://github.com/SeryMente/otrogranprograma","https://serymente.github.io/otrogranprograma"]:
    r=subprocess.run(["git","-C",str(ROOT),"grep","-n","-I","-F",pat,"--",
        ":!assets/data/relato-ogp-phase2-editorial.json",
        ":!assets/data/relato-ogp-phase2-qc.json",
        ":!assets/data/relato-ogp-phase2.json",
        ":!assets/data/relato-ogp-phase3.json",
        ":!assets/data/relato-ogp-v015.json",
        ":!assets/data/story-word-timing.json"
    ],text=True,capture_output=True)
    if r.stdout.strip(): old.append(r.stdout.strip())

paths=[x for x in subprocess.check_output(["git","-C",str(ROOT),"ls-files"],text=True).splitlines() if "obp" in x.lower() or "otrogranprograma" in x.lower()]

print("OLD_SURFACE_NON_SOURCE=NONE" if not old else "\n".join(old))
print("OLD_PATHS=NONE" if not paths else "\n".join(paths))

# Verify metadata fields no longer use old branding; spoken text locations are counted separately.
bad_meta=[]
spoken_count=0
for p in sorted((ROOT/"assets/data").glob("relato-ogp-*.json")):
    try:
        d=json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:
        bad_meta.append((p.as_posix(),str(e)))
        continue
    def walk(x,key=""):
        global spoken_count
        if isinstance(x,dict):
            for k,v in x.items():
                if isinstance(v,str) and "Otro Gran Programa" in v:
                    if k in ("text","word"):
                        spoken_locations.append(key+"."+k)
                    else:
                        bad_meta.append((p.name,key+"."+k))
                elif isinstance(v,(dict,list)):
                    walk(v,key+"."+k if key else k)
        elif isinstance(x,list):
            for i,v in enumerate(x): walk(v,f"{key}[{i}]")
    spoken_locations=[]
    walk(d)
    spoken_count += len(spoken_locations)

print("SPOKEN_SOURCE_OCCURRENCES="+str(spoken_count))
print("METADATA_OLD=NONE" if not bad_meta else str(bad_meta))
print("REMOTE="+subprocess.check_output(["git","-C",str(ROOT),"remote","get-url","origin"],text=True).strip())
print("STATUS:")
print(subprocess.check_output(["git","-C",str(ROOT),"status","--short"],text=True))
print("STAT:")
print(subprocess.check_output(["git","-C",str(ROOT),"diff","--cached","--stat"],text=True))
