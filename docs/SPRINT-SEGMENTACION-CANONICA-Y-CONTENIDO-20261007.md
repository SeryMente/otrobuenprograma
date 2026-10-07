# Sprint · Segmentación canónica y contenido complementario

**Proyecto:** Otro Gran Programa (OGP)
**Repositorio canónico:** https://github.com/SeryMente/otrogranprograma
**URL pública canónica:** https://serymente.github.io/otrogranprograma/
**Objeto canónico:** `assets/data/story-experience-canon.json`

## Decisión

El modelo de aprendizaje de 20 segmentos deja de tratarse como número normativo. Para este corpus se recomienda **36 segmentos editoriales**, con una banda operativa de **32–40**.

36 no es un número mágico: es el resultado de aplicar atomicidad semántica, continuidad discursiva, no-recuento de ideas repetidas, editabilidad y utilidad temporal/visual.

## Por qué 20 ya no es suficiente como canon

El audio tiene 1,391.304 s (23:11) y 2,206 palabras temporizadas. Con 20 segmentos, la media ronda 69.6 s por segmento. Esa escala sirve para aprender el instrumento, pero fuerza a convivir dentro de la misma unidad ideas que después queremos poder ilustrar, enfatizar, sustraer o sustituir independientemente.

## Criterio canónico de segmentación

1. Cada segmento tiene una **idea preponderante única**.
2. Una idea repetida en distintos puntos no crea nuevos segmentos; se clasifica como tema secundario o contaminación retórica.
3. Una idea puede atravesar una frontera heredada cuando su continuidad discursiva es inmediata y no aparece otra idea dominante entre medio.
4. Una oración no equivale automáticamente a una idea: varias oraciones pueden desarrollar una misma proposición.
5. La visualización no puede dictar dónde cortar el discurso.
6. La unidad debe seguir siendo editable sin romper el reloj maestro.

## Resultado del análisis

El diseño propuesto conserva las cinco fases existentes, pero permite cantidades variables de segmentos por fase. La distribución resultante es aproximadamente **6 / 5 / 8 / 5 / 12**.

El resultado mantiene una unidad media cercana a 36 s y unos 61 términos por segmento. Hay unidades deliberadamente cortas cuando la idea es autónoma y deliberadamente largas cuando dividirlas produciría una fragmentación artificial.

### Ejemplos decisivos

El bloque que dice qué se ha denominado `Otro Gran Programa` se separa de la definición posterior de enseñanza espiritual como desarrollo personal: son dos actos comunicativos distintos.

La repetición del objetivo de competir con el programa de doce pasos dentro del bloque de gratitud no crea otro segmento de competencia: queda subordinada a la idea dominante de gratitud.

La continuidad entre `escala de lo no dual` y su reafirmación inmediata en el siguiente bloque se trata como una sola construcción conceptual.

Del mismo modo, la explicación de que los valores aprendidos contradicen la realidad y generan conflicto se mantiene unida aunque cruce la frontera heredada entre los segmentos 16 y 17.

## Transcripción y branding

El nombre canónico de la iniciativa es **Otro Gran Programa (OGP)**. No se debe usar `Otro Buen Programa` ni `OBP` como marca.

La excepción es probatoria: si una persona realmente pronunció `Otro Buen Programa`, la transcripción debe conservar esa forma porque forma parte del audio. Si no fue pronunciado, se normaliza a `Otro Gran Programa`.

La auditoría del corpus canónico actual no encontró `Otro Buen Programa` ni `OBP` en la transcripción o en el artefacto de timing.

## Formato enriquecido

La legibilidad se mejora mediante énfasis escaso a nivel de palabra: una frase semántica puede ir en **negritas** y una relación/consecuencia en <u>subrayado</u>. El formato no modifica ningún timestamp ni dato de sincronización.

El contrato fija como máximo una frase fuerte y una frase subrayada por segmento del baseline, evitando convertir toda la transcripción en ruido cromático o tipográfico.

## Contenido complementario

La decisión arquitectónica es **procedural-first**. El proyecto no debe depender de cuotas de generación de imágenes.

### Prioridad tecnológica

**1. HTML/CSS/SVG procedural.** Es la opción por defecto: reproducible, versionable, liviana y paramétrica.

**2. Web Animations API.** Útil para coreografiar entradas, salidas y movimientos sincronizados con el reloj de audio; es una API ampliamente disponible. citeturn188572search2turn188572search4

**3. Canvas.** Solo para escenas que realmente necesiten muchos elementos móviles. La potencia no debe pagarse con jitter o CPU innecesaria.

**4. `<video>` HTML5.** Debe reservarse para casos en que un movimiento grabado aporte más que una escena procedural. El video será mudo, corto, autocontenido y optimizado.

**5. Raster estático.** Solo cuando el valor documental de una imagen concreta supere claramente al visual procedural.

MDN señala que la animación web puede construirse con SVG, JavaScript/canvas, CSS y `<video>`, y que el coste depende de las propiedades animadas y del tipo de medio; para la fluidez conviene privilegiar propiedades eficientes y una carga controlada. citeturn188572search0turn188572search1

También se mantendrá una versión respetuosa con `prefers-reduced-motion`, porque la animación no debe convertirse en una barrera de accesibilidad. citeturn188572search7turn188572search4

### Gramática visual

Se reutilizará una biblioteca pequeña de gramáticas visuales: emergencia, continuum, relación, tensión, inclusión, elección, evidencia e integración. La variación vendrá de los parámetros semánticos del segmento, no de fabricar una ilustración completamente nueva para cada uno.

## Arquitectura temporal recomendada

El audio maestro sigue siendo el reloj único. Los futuros 36 segmentos deberán almacenar `masterStart` y `masterEnd` y derivar de ahí todos los eventos visuales. No se crearán 36 copias de audio solo para satisfacer la segmentación editorial.

Esto desacopla tres cosas que antes estaban acopladas: **contenido**, **segmentación editorial** y **archivo de audio**.

## Próximo ciclo

El objeto canónico ya contiene el mapa exacto de las 36 unidades propuestas y una instrucción explícita de reanudación.

El siguiente ciclo de implementación debe migrar el runtime a ese modelo de 36 segmentos, adaptar el roadmap a cantidades variables, conservar el benchmark de sincronización y después construir la primera biblioteca procedural de visuales.

El objetivo perceptual seguirá siendo: **oír → localizar → confirmar → anticipar → seguir**.

## Regla de persistencia

Cada cambio futuro que modifique el número de segmentos, una frontera semántica, el contrato de formato, la política de branding o la arquitectura visual debe actualizar primero `assets/data/story-experience-canon.json`. El código no debe volver a convertirse en la única fuente de verdad.

**Estado:** CANONICAL DESIGN BASELINE · listo para continuación de implementación.
