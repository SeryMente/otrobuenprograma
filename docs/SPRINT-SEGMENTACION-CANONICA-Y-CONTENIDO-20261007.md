# Sprint Â· SegmentaciÃ³n canÃ³nica, transcripciÃ³n y contenido complementario

**Proyecto:** Otro Gran Programa (OGP)
**Repositorio canÃ³nico:** https://github.com/SeryMente/otrogranprograma
**URL pÃºblica canÃ³nica:** https://serymente.github.io/otrogranprograma/
**Objeto canÃ³nico:** `assets/data/story-experience-canon.json`
**Dataset ejecutable:** `assets/data/relato-ogp-experience.json`

## DecisiÃ³n final

El modelo de aprendizaje de 20 segmentos deja de tratarse como nÃºmero normativo. DespuÃ©s de una segunda auditorÃ­a semÃ¡ntica y temporal, este corpus queda recomendado en **49 segmentos editoriales**, con una banda operativa de **46â€“52**.

El nÃºmero no se fija por simetrÃ­a de fases ni por un objetivo visual. Resulta de aplicar, en este orden, atomicidad semÃ¡ntica, continuidad discursiva, no-recuento de ideas repetidas, editabilidad y viabilidad temporal.

La primera propuesta de 36 quedÃ³ descartada antes de convertirse en arquitectura ejecutable porque contenÃ­a una unidad de aproximadamente 120 segundos que mezclaba varias ideas. Esa correcciÃ³n es parte de la trazabilidad de la decisiÃ³n y queda documentada para evitar que una versiÃ³n intermedia vuelva a confundirse con el canon.

## Evidencia de partida

El audio maestro es `assets/audio/relato-ogp-v015.mp3`, con una duraciÃ³n de **1,391.304 s (23:11)** y **2,206 palabras temporizadas**.

El baseline histÃ³rico de Fase 3 conserva **20 segmentos fÃ­sicos** y su timing forzado. Ese archivo no se reescribe: se trata como evidencia fuente inmutable.

El nuevo dataset editorial contiene:

- **49 segmentos**
- Fase I: **6**
- Fase II: **8**
- Fase III: **9**
- Fase IV: **7**
- Fase V: **19**
- media: **28.394 s**
- mediana: **26.642 s**
- P90: **53.278 s**
- mÃ¡ximo: **61.721 s**
- palabras cubiertas: **2,206 / 2,206**, sin duplicados
- cobertura temporal: **0.000â€“1,391.304 s**, sin huecos ni solapamientos editoriales

Existe un Ãºnico segmento por encima de 60 s. Se conserva porque la unidad conceptual de la escala espiritual sigue siendo indivisible sin producir un corte artificial; la decisiÃ³n se basa en el contenido, no en el cronÃ³metro.

## Criterio canÃ³nico de segmentaciÃ³n

1. Cada segmento declara una **idea comunicativa preponderante Ãºnica**.
2. Una idea repetida no crea un segmento adicional sÃ³lo por reaparecer.
3. Una frontera heredada puede cruzarse cuando la misma proposiciÃ³n continÃºa inmediatamente.
4. Una oraciÃ³n no equivale automÃ¡ticamente a una idea.
5. Una oraciÃ³n con dos proposiciones independientes sÃ­ puede dividirse, incluso sin punto final, cuando existe una pausa temporal utilizable.
6. El corte debe preservar una lectura natural y no puede inventarse para acomodar una animaciÃ³n.
7. Cada segmento debe poder sustraerse, sustituirse o reordenarse sin fabricar otro archivo de audio.
8. El audio maestro permanece Ãºnico.

### Casos decisivos

La frase que denomina el proyecto y la definiciÃ³n posterior de la enseÃ±anza espiritual son dos actos comunicativos distintos.

La reiteraciÃ³n del objetivo de competir con el programa de doce pasos queda subordinada a la idea dominante de gratitud cuando aparece dentro de ese bloque.

La escala de lo dual/no dual se mantiene como una construcciÃ³n continua, pero se evita crear una unidad excesivamente larga que mezcle indiscriminadamente metÃ¡fora, escala y consecuencias.

En la secciÃ³n final, la primera respuesta, la segunda respuesta, la convivencia de mentalidades, la distinciÃ³n y la implicaciÃ³n educativa se separan porque son afirmaciones editoriales diferentes, aunque pertenezcan al mismo arco discursivo.

## Arquitectura temporal

El runtime ya no carga un MP3 distinto por segmento.

La relaciÃ³n canÃ³nica es:

`audio maestro + masterStart + masterEnd + palabras con coordenadas globales`

Las fronteras editoriales se calculan como el punto medio entre el final de la Ãºltima palabra del segmento anterior y el comienzo de la primera palabra del segmento siguiente. AsÃ­, la secuencia de ventanas cubre exactamente `[0, duraciÃ³n]`.

Esto separa tres capas:

**Contenido:** texto e idea.
**SegmentaciÃ³n:** ventana editorial.
**Audio:** un Ãºnico recurso maestro.

Por esta razÃ³n, eliminar o reemplazar un segmento no obliga a regenerar o dividir el MP3.

## TranscripciÃ³n enriquecida

Cada uno de los 49 segmentos tiene como mÃ¡ximo:

- una frase fuerte en **negritas**
- una frase relacional/consecuencial <u>subrayada</u>

El resaltado se calcula sobre las palabras ya temporizadas. No altera timestamps, orden ni reloj.

El contrato visual es deliberadamente escaso: el Ã©nfasis sirve para localizar la idea mientras se escucha, no para convertir la transcripciÃ³n en una superficie saturada.

## Contenido complementario: Procedural First

La decisiÃ³n es **PROCEDURAL_FIRST**.

Orden arquitectÃ³nico:

**1. HTML/CSS/SVG.**
Escenas paramÃ©tricas, locales, reproducibles y versionables.

**2. Web Animations API.**
CoreografÃ­a temporal de entradas, salidas y transiciones.

**3. Canvas.**
SÃ³lo cuando una escena necesite realmente un conjunto elevado de primitivas mÃ³viles.

**4. `<video>` HTML5.**
ExcepciÃ³n para movimientos grabados cuyo valor supere claramente al procedural; siempre corto, mudo y autocontenido.

**5. Raster estÃ¡tico.**
ExcepciÃ³n documental, no soluciÃ³n por defecto.

La primera biblioteca procedural del runtime reutiliza una gramÃ¡tica finita: emergencia, continuidad/corriente, relaciÃ³n, perdÃ³n, escala, inclusiÃ³n, conflicto/estructura, elecciÃ³n, evidencia e integraciÃ³n. Los 49 segmentos seleccionan un `visualKey` semÃ¡ntico; el renderer puede reutilizar una misma gramÃ¡tica con parÃ¡metros distintos.

Las animaciones deben favorecer `transform` y `opacity`, pausar cuando la experiencia no estÃ© visible y respetar `prefers-reduced-motion`.

Referencias tÃ©cnicas mantenidas en el canon:

- https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Animation_performance_and_frame_rate
- https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@property
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion

## Branding

La identidad operativa y editorial es **Otro Gran Programa (OGP)**.

`Otro Buen Programa` y `OBP` no deben aparecer como marca, rutas, identificadores o instrumentaciÃ³n.

ExcepciÃ³n probatoria: si una persona realmente pronuncia `Otro Buen Programa` en el audio, la transcripciÃ³n debe conservar esa evidencia literal. No se reescribe una palabra hablada para resolver branding.

## QA y gobernanza

El baseline de 20 segmentos continÃºa siendo verificable mediante su propia herramienta histÃ³rica. La nueva experiencia se valida mediante un contrato especÃ­fico que comprueba:

- nÃºmero exacto de segmentos y distribuciÃ³n por fase
- cobertura Ãºnica de las 2,206 palabras
- monotonicidad y continuidad de `masterStart/masterEnd`
- coincidencia con la duraciÃ³n del audio maestro
- existencia y localizaciÃ³n de los marcadores rich
- prohibiciÃ³n de dependencias editoriales a `segment-XX.mp3`
- ausencia de restos del hardcode de cuatro segmentos por fase
- sintaxis JavaScript

La baterÃ­a de sincronizaciÃ³n genÃ©rica continÃºa siendo independiente del contenido. La prueba perceptual A/B no se declara aprobada por pruebas automÃ¡ticas: requiere observaciÃ³n humana real.

## Estado

**CANONICAL EXECUTABLE ARCHITECTURE**

La regla de persistencia es obligatoria: cualquier cambio de nÃºmero de segmentos, frontera semÃ¡ntica, contrato de transcripciÃ³n, branding o gramÃ¡tica visual se registra primero en `assets/data/story-experience-canon.json` y despuÃ©s se implementa.