# Otro Gran Programa — Sprint F4
## v1.7.0 · Sincronización narrativa palabra-voz + integración del transporte en el roadmap

**Ciclo:** F4-20261007
**Proyecto:** Otro Gran Programa (OGP)
**Conversación:** CONV-ACTUAL
**Base canónica:** v1.6.2 · `2d6cdfdfb45b996b5ab7eb386c6bc120bddc454d`
**URL canónica:** https://github.com/SeryMente/otrogranprograma
**URL pública:** https://serymente.github.io/otrogranprograma/
**Estado:** PLANIFICACIÓN — sin cambios de producto
**Versión objetivo:** v1.7.0
**Sprint precedente:** F3 · v1.6.2

---

## 1. Propósito del sprint

F4 tiene dos objetivos inseparables:

1. corregir la integración visual que todavía no coincide con la expectativa del cierre de F3;
2. convertir la sincronización palabra-voz en un sistema medido, reproducible e iterativo hasta alcanzar un nivel de precisión operacional extremadamente estricto.

La regla de F4 será:

> **La voz es el reloj maestro. La palabra resaltada debe corresponder a la palabra que está siendo pronunciada, no a una estimación del tiempo transcurrido.**

No se aceptará volver a un timing proporcional, interpolado o ajustado manualmente sin evidencia de audio.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

---

## 2. Retroalimentación y delta del sprint F3

F3/v1.6.2 se considera técnicamente cerrado, pero **visualmente no quedó completamente alineado con la expectativa**. Este delta queda documentado para que F4 lo use como entrada obligatoria y no repita los mismos errores.

### 2.1 Jerarquía del encabezado

Expectativa:
- la ficha del autor va primero;
- debajo de la información del autor debe aparecer **Otro Gran Programa** como título;
- inmediatamente debajo debe aparecer el subtítulo largo;
- título y subtítulo pertenecen a la misma composición visual, dentro del mismo recuadro/contenedor;
- no debe existir una separación que haga parecer que el subtítulo pertenece a otra sección.

Resultado observado al cierre de F3:
- el título y el subtítulo todavía no están integrados con la jerarquía visual esperada;
- parte del contenido quedó fuera del recuadro;
- la relación autor → título → subtítulo todavía puede percibirse como tres piezas.

### 2.2 Reproductor fuera de lugar

Expectativa:
- no debe existir un reproductor horizontal inmediatamente debajo del subtítulo;
- el transporte de audio debe vivir integrado en la navegación lateral.

Resultado observado:
- el reproductor horizontal sigue apareciendo debajo del subtítulo.

### 2.3 Roadmap como transporte narrativo

Expectativa:
- el roadmap lateral derecho debe asumir la función de transporte mínimo;
- el usuario debe poder identificar reproducción/pausa y progreso desde esa misma superficie;
- el audio deja de competir con el contenido como una barra independiente.

Resultado observado:
- el micro-roadmap existe;
- contiene play/pause;
- pero el reproductor principal continúa ocupando una superficie independiente.

### 2.4 Regresión funcional que F3 tuvo que reparar

Durante F3 apareció una regresión donde el contenido posterior a la experiencia sonora parecía haber desaparecido. El contenido no había sido borrado: el motor genérico `.reveal` dependía accidentalmente de `glosa.js` para recibir la clase `.in`.

La corrección separó correctamente el motor de revelado de Glosa y restauró:
- Khora;
- Cuentas Claras;
- transparencia;
- contenidos posteriores a la experiencia sonora.

Esta incidencia queda registrada como **error de acoplamiento entre módulos**. F4 debe conservar la regla de que ningún módulo opcional puede ser requisito indirecto para la visibilidad del contenido estructural.

### 2.5 Regla de proceso incorporada

Desde F4, cada sprint deberá comenzar revisando:
- retroalimentación del sprint inmediatamente anterior;
- deltas anteriores aún no resueltos;
- decisiones/canones de sprints históricos que puedan afectar el alcance actual.

La aceptación no se basará únicamente en «el código funciona». Se comparará explícitamente:

**expectativa documentada → implementación → evidencia → delta → corrección.**

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

---

## 3. Objetivo visual F4

### 3.1 Composición de entrada

Orden canónico:

**Autor → Otro Gran Programa → subtítulo**

Todo debe percibirse como una sola composición editorial coherente.

El texto exacto del subtítulo se conserva:

> una iniciativa para revolucionar la manera en la que aliviaremos la disfunción familiar para nuestros hijos y sus hijos también.

El título visual será:

> Otro Gran Programa

No se agregará «una propuesta» al título.

No habrá:
- subtítulo flotando fuera del contenedor;
- duplicación del título;
- reproductor horizontal inmediatamente debajo;
- elementos que visualmente parezcan pertenecer a una sección distinta.

### 3.2 Transporte narrativo integrado

El reproductor horizontal actual se considera una interfaz transitoria y debe eliminarse como superficie independiente.

El roadmap lateral derecho será la superficie persistente mínima para:
- play/pause;
- estado de reproducción;
- progreso narrativo;
- fase actual;
- segmento actual;
- salto a segmento/fase.

El transporte debe conservar accesibilidad aunque su representación visual sea mínima.

No se esconderán funcionalidades detrás de gestos no evidentes.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

---

## 4. Problema de sincronización: estado real

El repositorio contiene actualmente:

- 20 segmentos;
- 2,206 palabras;
- 1,391.304 segundos de audio maestro;
- segmentos derivados en `assets/audio/relato-ogp-v016/`.

Sin embargo, el artefacto publicado `assets/data/story-word-timing.json` declara explícitamente:

- `status: editorial-word-timing-preliminary`;
- `method: ... target word counts and ... durations`;
- `proportionalTiming: true`.

Esto significa que **la fuente pública de timing no cumple todavía el contrato de sincronización exacta**.

Existe además un script `scripts/build_story_timing.py` que ya contempla WhisperX/CTC forced alignment y una workflow `.github/workflows/exact-story-timing.yml`.

Conclusión:

> F4 no parte de cero; parte de una arquitectura parcialmente preparada, pero debe reemplazar el timing proporcional publicado por un artefacto de alineamiento físico verificable y por un reloj de reproducción que no dependa únicamente de `timeupdate`.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

---

## 5. Estrategia canónica de sincronización

### 5.1 Cadena de verdad

Orden obligatorio:

**Audio maestro → segmentación física → transcript canónico → forced alignment → timing palabra/voz → reloj de reproducción → highlight visual**

No se permitirá:

**duración total → repartir tiempo entre palabras → interpolar → asumir sincronización.**

### 5.2 Generación de timestamps

El pipeline de generación deberá:

1. cargar el audio físico del segmento;
2. cargar el transcript canónico correspondiente;
3. ejecutar forced alignment real;
4. devolver `start` y `end` por palabra;
5. validar orden, duración y correspondencia textual;
6. registrar metadatos del alineador;
7. producir un artefacto versionado;
8. ejecutar benchmark antes de permitir promoción.

### 5.3 No habrá sustituto silencioso

Si WhisperX falla:
- el workflow falla;
- se conserva el último artefacto certificado;
- no se genera automáticamente timing proporcional para «salir del paso».

Un fallo de alineamiento será visible como fallo del pipeline, no transformado en una falsa aprobación.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

---

## 6. Corrección del reloj en navegador

El timing offline por sí solo no garantiza sincronización perceptual.

La implementación actual escucha:

`audio.timeupdate → update() → paintWords()`

Ese evento no ofrece una cadencia suficientemente fina para tratarlo como reloj visual de alta precisión.

F4 deberá introducir un segundo nivel:

### Reloj maestro
- `audio.currentTime` sigue siendo la referencia temporal.

### Reloj visual
- mientras el audio reproduce, el highlight se actualizará mediante `requestAnimationFrame`;
- `timeupdate` quedará como respaldo y como sincronización fuera de reproducción;
- el algoritmo usará búsqueda binaria sobre `start`/ `end` para obtener la palabra activa;
- la palabra activa se determinará por intervalo, no solo por «último start menor o igual al tiempo».

### Regla de transición

Para una palabra `w`:

`w.start <= currentTime < w.end`

Cuando exista un intervalo de silencio entre palabras, se definirá explícitamente una política de continuidad para evitar que el highlight salte a una palabra incorrecta.

### Scroll

La sincronización visual y el seguimiento de pantalla se desacoplarán:

- el reloj puede actualizar el highlight a 60 Hz;
- el scroll automático será independiente y más lento;
- se mantendrá el comportamiento de F3: scroll moderado acompaña; scroll intenso libera el seguimiento y muestra el retorno a narración.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

---

## 7. Benchmark: batería de indicadores

El sprint no se considerará exitoso por inspección subjetiva. Cada iteración debe generar métricas comparables.

### 7.1 Integridad del dato

**M1 — Cobertura**
- 2,206 palabras con timestamps;
- objetivo: 100%.

**M2 — Integridad textual**
- palabra alineada = palabra canónica normalizada;
- objetivo: 100%.

**M3 — Monotonía**
- `start >= previous end` o una excepción explícitamente documentada;
- objetivo: 100% de secuencia válida.

**M4 — Duración**
- `end > start` para toda palabra;
- objetivo: 100%.

### 7.2 Calidad del alineamiento

**M5 — Error de onset**
- `|predictedStart - referenceStart|`;
- reportar mediana, P90, P95, P99 y máximo.

**M6 — Error de offset**
- `|predictedEnd - referenceEnd|`;
- reportar mediana, P90, P95, P99 y máximo.

**M7 — Error de duración**
- diferencia absoluta entre duración alineada y duración de referencia.

**M8 — Word error / asociación incorrecta**
- porcentaje de palabras en las que el intervalo de audio corresponde a otra palabra;
- objetivo operativo: 0% en el conjunto de certificación.

### 7.3 Calidad del motor visual

**M9 — Latencia de highlight**
- tiempo entre la frontera temporal de la palabra y el cambio visual efectivo;
- medir P50/P95/P99;
- objetivo de trabajo: P95 ≤ 50 ms en Chromium.

**M10 — Wrong-word rate**
- porcentaje de frames auditados en los que la palabra resaltada no corresponde a la palabra hablada;
- objetivo operativo: 0% en el conjunto de certificación.

**M11 — Missed-word rate**
- palabras pronunciadas sin llegar a estado `is-current`;
- objetivo: 0%.

**M12 — Continuidad**
- cambio de palabra monotónico y sin regresiones durante reproducción 1.0×;
- objetivo: 100%.

### 7.4 Robustez

Repetir los indicadores visuales al menos en:
- Chromium desktop;
- Chromium móvil/emulación;
- scroll pasivo;
- scroll intenso;
- pausa/reanudación;
- salto a palabra;
- salto a segmento;
- siguiente/anterior.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

---

## 8. Conjunto de certificación

Para evitar que una media global oculte errores locales se utilizarán dos conjuntos:

### A. Suite completa
Las 2,206 palabras.

Sirve para:
- integridad;
- monotonía;
- cobertura;
- distribución de confianza;
- regresión.

### B. Gold set de estrés
Muestra estratificada por:
- los 20 segmentos;
- palabras muy cortas;
- palabras largas;
- puntuación;
- pausas;
- secuencias rápidas;
- cambios bruscos de ritmo;
- principio y final de segmento.

Inicialmente:
- mínimo 10 palabras por segmento;
- 200 palabras objetivo;
- ampliar automáticamente el conjunto con todos los outliers.

La certificación final no podrá apoyarse únicamente en el promedio global.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

---

## 9. Iteraciones previstas

F4 será un bucle controlado. No se declarará terminado al primer alineamiento que «parezca mejor».

### Iteración S0 — Baseline
Medir:
- timing proporcional vigente;
- latencia actual con `timeupdate`;
- tasa estimada de wrong-word;
- distribución de duraciones por palabra.

Salida:
`benchmark-baseline.json`

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

### Iteración S1 — Forced alignment puro
Generar timestamps con WhisperX sobre los 20 segmentos.

Salida:
- `story-word-timing.json` v2;
- reporte de alineamiento;
- métricas M1–M8.

Criterio:
- mejora cuantificable respecto a S0.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

### Iteración S2 — Calibración de alineamiento
Revisar outliers:
- palabras de baja confianza;
- puntuación;
- números/abreviaturas;
- cambios de locución;
- palabras que producen intervalos anómalos.

No se ajustarán timestamps manualmente sin registrar la causa y el origen de evidencia.

Salida:
- nueva versión de timing;
- benchmark comparativo S1 → S2.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

### Iteración S3 — Reloj visual de alta frecuencia
Sustituir la dependencia primaria de `timeupdate` por `requestAnimationFrame`.

Medir M9–M12.

Salida:
- benchmark de runtime;
- evidencia de reproducciones completas.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

### Iteración S4 — Casos difíciles
Atacar únicamente los segmentos/palabras que fallen los umbrales.

Regla:
- no reescribir lo que ya funciona;
- toda modificación debe demostrar mejora o se revierte.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

### Iteración S5 — Certificación
Ejecutar:
- suite completa;
- gold set;
- E2E;
- auditoría visual;
- no-regresión del resto del sitio.

Solo después:
- promover timing a canónico;
- publicar v1.7.0.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

---

## 10. GitHub Actions: infraestructura del ciclo

La ejecución será compatible con GitHub Actions sin depender de una GPU local.

### 10.1 Separación de workflows

Se propone separar responsabilidades:

**A. Generate**
- instala WhisperX;
- ejecuta alignment;
- produce artefactos candidatos.

**B. Benchmark**
- valida el candidato;
- calcula métricas M1–M12;
- genera reporte;
- sube artefactos.

**C. Promotion**
- solo después de pasar los gates;
- reemplaza el timing canónico;
- activa la suite completa;
- publica.

No se debe auto-confirmar una nueva sincronización por el mero hecho de que el script terminó.

### 10.2 Robustez frente a bloqueos

La workflow actual usa:

- runner `ubuntu-latest`;
- timeout finito;
- instalación de WhisperX;
- commit automático.

F4 deberá reducir el riesgo de atasco mediante:

- cache de pip;
- cache del modelo Hugging Face;
- timeout ampliado según evidencia;
- `cancel-in-progress: false` para jobs largos de alineamiento;
- `workflow_dispatch` como vía de recuperación manual;
- artefactos intermedios para poder inspeccionar la etapa en la que falló;
- logs estructurados por segmento;
- evitar commits automáticos durante la fase de benchmark.

El commit a `main` será una operación de promoción, no un efecto secundario del cálculo.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

---

## 11. Artefactos canónicos de F4

Al finalizar el sprint deben existir, como mínimo:

- `assets/data/story-word-timing.json` con estado certificado;
- esquema/metadatos del aligner;
- benchmark completo;
- benchmark baseline;
- reporte de outliers;
- script de benchmark;
- workflow de generación;
- workflow de benchmark;
- gate de no-regresión;
- documentación F4 actualizada.

Se preservarán las versiones anteriores para poder comparar resultados.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

---

## 12. Criterios de aceptación v1.7.0

### UI
- «Otro Gran Programa» aparece debajo de la información del autor;
- el subtítulo aparece inmediatamente debajo;
- ambos pertenecen al mismo contenedor visual;
- no existe reproductor horizontal debajo del subtítulo;
- el transporte de reproducción está integrado en el roadmap lateral derecho;
- play/pause es accesible;
- fase/segmento/progreso son identificables desde el roadmap;
- Khora, Cuentas Claras y el resto del contenido continúan visibles.

### Sync
- cero timing proporcional;
- cero interpolación como fuente primaria;
- 2,206/2,206 palabras cubiertas;
- transcript 100% consistente;
- timestamps válidos 100%;
- benchmark completo reproducible;
- mejora cuantificable frente a baseline;
- P95 de latencia visual ≤ 50 ms en Chromium como objetivo de certificación;
- 0% wrong-word y 0% missed-word en gold set;
- sin regresión de segmento, pausa, salto o scroll.

### Proceso
- feedback de F3 integrado en el plan;
- cada iteración deja evidencia;
- cada iteración es comparable con la anterior;
- ninguna modificación se conserva si no demuestra mejora.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

---

## 13. Definición operativa de «perfección»

«Perfección» no se usará como una impresión subjetiva.

En F4 significa:

> **La palabra resaltada corresponde al intervalo de voz correcto, el desfase permanece por debajo del umbral certificado, no existen palabras omitidas ni palabras incorrectas en el conjunto de certificación y el comportamiento se mantiene estable durante la navegación.**

Los umbrales pueden endurecerse durante el sprint, nunca relajarse para aprobar una versión.

La certificación final deberá distinguir:
- exactitud del alineamiento offline;
- precisión temporal del runtime;
- precisión perceptual del highlight.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

---

## 14. Orden de implementación

1. Corregir la composición Autor → Título → Subtítulo.
2. Retirar el reproductor horizontal del flujo.
3. Integrar el transporte mínimo en el roadmap derecho.
4. Construir baseline de sincronización.
5. Reemplazar timing proporcional por forced alignment.
6. Introducir reloj visual `requestAnimationFrame`.
7. Ejecutar benchmark completo.
8. Iterar sobre outliers.
9. Endurecer gates.
10. Certificar y publicar v1.7.0.

Cada etapa debe producir evidencia antes de comprometer la siguiente.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma

---

## 15. Regla permanente incorporada desde este sprint

Antes de iniciar cualquier sprint futuro:

**revisar feedback + delta + errores + gates del sprint anterior y los precedentes relevantes.**

La retroalimentación no será un comentario informal fuera del sistema; será una entrada versionada al siguiente plan.

---

## 16. Estado de salida de esta planeación

**v1.6.2 permanece como versión canónica publicada.**

**v1.7.0 queda definido como objetivo de F4.**

No se considera iniciada la implementación de producto hasta que el plan sea el punto de referencia del sprint.

**Última versión publicada:** v1.6.2 — Reparación de regresión de contenido y narrativa móvil.

**URL pública:** https://serymente.github.io/otrogranprograma/
**URL del repositorio:** https://github.com/SeryMente/otrogranprograma


## 17. Checkpoint operativo F4-S0 · control publicado

**Fecha:** 2026-10-07
**Commit de publicación:** 525418c94eee3f23d8b97381897aabfa55ef7188
**URL pública:** https://serymente.github.io/otrogranprograma/
**Resultado:** GitHub Pages desplegado correctamente; baseline S0 persistido en docs/evidence/F4-S0-BASELINE.md.

S0 se considera un checkpoint de control, no una mejora certificada de sincronización. La fuente de timing continúa siendo provisional/proporcional hasta que S1 produzca un artefacto forced-aligned y sus métricas superen el baseline.

## 18. Escalamiento de exigencia · nivel +10

A partir de este punto la barra de calidad queda elevada diez niveles. Una iteración solo puede llamarse **mejora significativa** cuando exista evidencia comparativa contra el baseline o contra la iteración inmediatamente anterior, no cuando la interfaz simplemente parezca más fluida.

Reglas adicionales:
- ningún fallback proporcional puede sustituir silenciosamente al forced alignment;
- ningún timing candidato puede promocionarse sin benchmark reproducible;
- cada mejora significativa debe generar un checkpoint público y una entrada persistente en este plan;
- la URL pública debe acompañar cada checkpoint publicado;
- los umbrales solo pueden endurecerse durante el sprint, nunca relajarse para convertir un fallo en aprobación.
## 19. S1 · forced alignment obtenido — candidato significativo

**Run:** https://github.com/SeryMente/otrogranprograma/actions/runs/37561377683  
**Fecha:** 2026-10-07  
**Resultado técnico:** alignment exitoso; benchmark exitoso; gate narrativo exitoso; promoción fallida únicamente por rechazo de fast-forward durante un push concurrente.

### Métricas S1 obtenidas
- M1 cobertura: 100.0% (2,206/2,206).
- M2 integridad textual: 100.0%.
- M3 monotonía: 100.0%.
- M4 intervalos válidos: 100.0%.
- M5 desviación de fronteras respecto del timing proporcional: P50 4,192.622 ms.
- M6 desviación de fronteras respecto del timing proporcional: P95 14,938.081 ms.
- M7 duración de palabra: P95 700 ms.
- M8 score de alineamiento: P10 0.6005; cobertura 100%.

**Interpretación:** S1 constituye una mejora técnica significativa porque sustituye el reloj proporcional por CTC forced alignment basado en el audio físico y transcript canónico. No se declara todavía perfección ni error absoluto: M5/M6 son comparativos contra el baseline proporcional y M9–M12 todavía requieren certificación runtime.

**Corrección de promoción:** el siguiente run preservará ambos JSON como artefactos antes de cualquier push y hará rebase contra origin/main antes de promover, evitando repetir el fallo de concurrencia.

**URL pública de referencia actual:** https://serymente.github.io/otrogranprograma/
## 20. Checkpoint público S1 · forced alignment certificado

**Commit:** https://github.com/SeryMente/otrogranprograma/commit/194ff69068f1a5e0e376e8af2c1f4c0f1b28666a
**URL pública:** https://serymente.github.io/otrogranprograma/
**Estado:** PUBLICADO

S1 reemplazó el timing proporcional por alineamiento WhisperX CTC contra el audio físico y el transcript canónico. El artefacto `assets/data/story-word-timing.json` contiene 2,206 palabras y quedó marcado `forced-alignment-certified` con `proportionalTiming: false`.

### Evidencia S1
- M1 cobertura: 100.0%.
- M2 integridad textual: 100.0%.
- M3 monotonía: 100.0%.
- M4 intervalos válidos: 100.0%.
- M8 alignment score P10: 0.6005; cobertura 100.0%.
- M5/M6 muestran una separación sustantiva respecto al reloj proporcional: P50 4,192.622 ms y P95 14,938.081 ms en fronteras comparativas.

### Límite declarado
S1 es una mejora significativa y publicada, pero no equivale todavía a perfección perceptual. El siguiente objetivo es medir M9–M12 en runtime y localizar cualquier palabra que el navegador pinte tarde, temprano, incorrectamente o no pinte.

## 21. S2 · calibración del reloj visual

S2 no cambiará todavía los timestamps offline. Su primera misión es auditar el runtime que consume el timing S1.

Objetivo inicial y estricto: demostrar que el highlight llega a la frontera temporal de cada palabra con baja latencia y sin seleccionar la palabra equivocada.

### Gates S2
- M9 P95 de latencia visual <= 50 ms como objetivo de certificación.
- M10 wrong-word rate = 0% en gold set.
- M11 missed-word rate = 0% en gold set.
- M12 monotonicidad de transición = 100%.

Solo después de superar estos gates se podrá declarar una mejora de runtime y publicar el siguiente checkpoint.


## 22. Baseline B1 congelado · benchmark cuantitativo reproducible

**Fecha:** 2026-10-07  
**Commit probado:** 7c8ffd52fdc4cdf1110391582819b62daa9f5ec9  
**Workflow:** https://github.com/SeryMente/otrogranprograma/actions/runs/37645750736  
**PR:** https://github.com/SeryMente/otrogranprograma/pull/17  
**Evidencia:** docs/evidence/F4-BASELINE-BENCHMARK-20261007.md  
**URL pública:** https://serymente.github.io/otrogranprograma/

B1 queda establecido como referencia cuantitativa para las siguientes iteraciones.

### Matriz B1

- M1: 100.0%.
- M2: 100.0%.
- M3: 100.0%.
- M4: 100.0%.
- M5 P50: 4,192.622 ms.
- M6 P95: 14,938.081 ms.
- M7 P95: 700.000 ms.
- M8 P10: 0.60050; cobertura 100.0%.
- M9 P50: 7.376 ms.
- M9 P95: 14.994 ms.
- M9 P99: 16.185 ms.
- M9 máximo: 16.483 ms.
- M10: 0.0000%.
- M11: 0.0000%.
- M12: 100.0%.
- M13: 100.0%.
- Seek events: 100.0%.
- Muestra determinista: 120 puntos.
- Transiciones runtime: 14.
- Frames runtime: 953.

### Regla de benchmark permanente

Toda iteración posterior deberá reportar los mismos indicadores antes de agregar otros.

Una mejora solo se reconoce cuando:
- conserva los gates ya aprobados;
- mejora al menos un indicador objetivo o reduce una brecha documentada;
- deja evidencia reproducible;
- publica el nuevo checkpoint.

No se rebajarán umbrales para convertir un resultado fallido en aprobado.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma


## 23. Contrato universal de benchmarking · portable entre proyectos

**Fecha:** 2026-10-07  
**Contrato:** Sync Benchmark Contract v1  
**Documento:** docs/architecture/SYNC-BENCHMARK-CONTRACT-v1.md  
**URL canónica:** https://github.com/SeryMente/otrogranprograma  
**URL pública:** https://serymente.github.io/otrogranprograma/

Se establece una separación permanente entre:

**motor universal de benchmark** → **adaptador de proyecto** → **datos del proyecto**.

### Componentes

- Motor JS: `scripts/lib/sync-benchmark.js`.
- Benchmark offline: `scripts/benchmark_sync_timing.py`.
- Configuración/adaptador OGP: `scripts/sync-benchmark.config.json`.
- Contrato DOM: atributos `data-sync-*`.

### Invariante

El benchmark no depende de:
- número de segmentos;
- IDs concretos;
- número de palabras;
- nombre de archivos;
- idioma;
- fases;
- orden histórico de los segmentos;
- proyecto OGP.

### Consecuencia

Una sustitución de audio, eliminación de segmentos, adición de segmentos, cambio de orden o creación de un proyecto completamente distinto debe resolverse cambiando datos/configuración/adaptador, no reescribiendo el motor de medición.

La matriz B1 continúa siendo específica de OGP. El **contrato de benchmarking** es la pieza reutilizable.

### Criterio de aceptación arquitectónica

El benchmark se considerará portable cuando:
1. descubra sus segmentos desde el timing artifact;
2. identifique cada observación por `segmentId + wordIndex`;
3. calcule las muestras según el tamaño real del segmento;
4. no utilice IDs o conteos codificados;
5. permita configurar selectores y fuentes sin modificar el motor;
6. genere métricas comparables para cualquier proyecto compatible con el contrato.

**Fase técnica:** https://github.com/SeryMente/otrogranprograma
