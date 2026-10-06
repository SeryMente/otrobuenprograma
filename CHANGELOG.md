# Changelog - Instrumento de comunicacion - Proyecto Vital

## [v1.6.1] - 2026-10-06 - Corrección visual móvil post-publicación

### Corregido
- Corregida la desviación visual de la ficha del autor en 320×568 y 390×844: la fotografía deja de ocupar un bloque vertical de 126×200 px y pasa a una composición apaisada 16:9 de 126 px de ancho.
- Liberado el hero móvil de la restricción artificial de una sola línea; el título recupera una composición editorial multilínea y queda contenido sin overflow.
- Ajustado el encuadre de la fotografía a 60% 40% sobre el recurso público existente.
- Endurecida la suite E2E para validar ratio de fotografía, wrapping del hero y captura de cada viewport probado.

### Calidad
- Corrección visual registrada en `docs/PLAN-F3-MOVIL-20261006.md`.
- Se mantiene la publicación de GitHub Pages como superficie canónica; esta corrección no introduce dependencias ni cambia el contenido editorial.


## [v1.6.0] - 2026-10-06 - Experiencia móvil F3

### Cambiado
- Unificada la navegación móvil en una barra superior esbelta con marca, Proyectos, Cuentas y Autor.
- Al desplazarse, la barra completa se colapsa a un activador táctil discreto; el activador abre una navegación de pantalla completa con solo esas tres rutas y cierre.
- Rediseñada la ficha del autor con orden profesional, firma editorial, formación compacta y matrícula UAG 5125461.
- Ajustada la fotografía del autor a una composición más vertical y centrada.
- Sustituido el hero redundante por «Otro Gran Programa, una propuesta» y el subtítulo acordado.
- Retirada la superficie pública de Glosa.
- Incorporado un micro-rail móvil persistente de 5 fases × 4 segmentos, independiente de la columna narrativa.
- Consolidado el transporte narrativo móvil y el intento de autoplay inmediato audible con recuperación honesta ante bloqueo del navegador.
- Preservada la composición de escritorio de tres columnas.
- Añadido contrato E2E Playwright para 7 tamaños móviles, navegación/foco, rail, desktop y audio.

### Calidad
- Gate estático GitHub Actions: PASSED.
- Gate E2E GitHub Actions: PASSED.
- E2E local en RDC nueva: 11/11 passed en 22.1 s.
- Plan canónico persistido en `docs/PLAN-F3-MOVIL-20261006.md`, incluyendo checkpoints CP-05 y CP-06.

## [v1.5.4] - 2026-10-06 - Corrección responsive móvil

### Corregido
- Incorporada explícitamente la hoja de estilos story-v3.css que corresponde a los controles generados por el relato sonoro.
- Corregido el reproductor en pantallas de hasta 430 px: deja de aplicar un ancho artificialmente reducido y usa el ancho móvil disponible.
- Rehecha la composición de entrada móvil: la fotografía del autor permanece centrada, contenida y prioritaria, pero la ficha deja de consumir una pantalla completa.
- El hero móvil deja de centrar verticalmente todo el conjunto y pasa a una composición superior y compacta para que foto, identidad y comienzo de la propuesta convivan en el primer viewport.
- Añadida prueba estructural específica para detectar la regresión de responsive móvil.
- Ajustado el reproductor sticky para que no quede oculto detrás de la barra de navegación móvil.

## [v1.5.3] - 2026-10-06 - Ficha de autor móvil

### Cambiado
- Rehecha la ficha visible del autor para la experiencia móvil: fotografía prioritaria, centrada y de tamaño contenido al entrar.
- Sustituido el texto editorial secundario por una ficha compacta con lema, oficio, actividad profesional, formación y contacto.
- Actualizados el lema a «Patria pendiente, lo que deviene aún.» y los datos de oficio/formación proporcionados para la edición pública.
- Bump de caché de la hoja de estilos y del Service Worker para que la nueva composición móvil sustituya la anterior.

## [v1.5.2] - 2026-10-06 - Limpieza de superficie publica

### Corregido
- Retirado el aviso automatico de instalacion PWA que aparecia al abrir el instrumento.
- Retirados los estilos CSS y el codigo JavaScript asociados exclusivamente a ese aviso.
- Conservada la PWA: manifest, Service Worker, soporte offline e instalacion manual desde los controles del navegador siguen disponibles.
- Invalidada la cache publica para que la limpieza sea visible inmediatamente tras la actualizacion.

### No incluido
- No se agrega backend, Supabase ni nuevas capacidades de comunicacion en este ciclo.


## [v1.5.1] - 2026-10-06 - Cierre técnico de la edición pública

### Corregido
- Eliminados del CSS público los estilos y reservas de espacio del roadmap que ya no forma parte de la interfaz.
- Eliminadas referencias residuales de construcción en los selectores específicos de la experiencia pública.
- Nueva versión explícita de los recursos narrativos y nuevo namespace del Service Worker para impedir que una sesión vieja conserve la edición anterior.
- Reparado el pipeline de segmentación de Fase 2: importación de `os` y saneamiento del bloque de configuración de Whisper.
- Reparado el pipeline de forced alignment: instalación explícita de `ffmpeg` antes de ejecutar WhisperX.
- Añadida una prueba automática del contrato de edición pública para detectar regresiones de nomenclatura técnica y roadmap.

### Nota de estado
La sincronización palabra-voz certificada sigue siendo un esfuerzo independiente: este cierre no declara completado el forced alignment ni modifica el hecho de que los artefactos narrativos actuales pueden seguir en estado preliminar hasta que el pipeline de alineamiento pase su gate.

## [v1.5] - 2026-10-05 - Edición pública

### Cambiado
- Se retiraron de la interfaz pública las referencias de proceso y construcción: fases, segmentos como etiquetas técnicas, roadmap, timing, máster, composiciones maestras, conteos internos, build y versionado visible.
- El relato ahora se presenta como una pieza pública terminada, centrada en la propuesta, la voz y la lectura.
- La navegación permanece disponible de forma discreta mediante reproducción, avance y retroceso.
- Invalidación explícita de caché para los recursos narrativos de v1.5.

## [v1.4] - 2026-10-05 - Roadmap móvil

### Cambiado
- El roadmap lateral móvil deja de mostrar simultáneamente los 20 segmentos y pasa a un rail compacto de cinco fases.
- La fase activa conserva visible su segmento actual y despliega sus cuatro segmentos en un panel contextual bajo demanda.
- Se amplían las áreas táctiles de los segmentos y se evita que el roadmap ocupe casi toda la altura del viewport.
- Se conserva la navegación completa Fase → Segmento en escritorio.
- Invalidación explícita de caché para los recursos narrativos de v1.4.

### Corregido
- Solapamiento visual del roadmap con el reproductor y el contenido narrativo en móviles de 360–412 px.
- Exceso de altura del rail y compresión de los controles en pantallas pequeñas.

## [v1.3] - 2026-10-05 - Experiencia móvil QR

### Anadido
- Portada de entrada con autor destacado y nombre oficial: Otro Gran Programa — Iniciativa de Bienestar Social.
- Activación automática de la experiencia narrativa al cargar desde QR en móvil, con desplazamiento al primer segmento y tentativa de reproducción automática.
- Fallback visible para navegadores que bloquean el autoplay de audio.
- Roadmap Fase → Segmento convertido en navegación vertical persistente en el borde derecho, con adaptación específica para móvil.
- Composición responsive del hero y ficha del autor para pantallas pequeñas.
- Invalidación explícita de caché para los recursos narrativos de v1.3.

### Cambiado
- La identidad visible del sitio deja de presentar a Khora como título principal de la experiencia.
- La experiencia narrativa pasa a priorizar móvil/QR como contexto de entrada.

## [v1.2] - 2026-10-05 - Fase 3 narrativa

### Anadido
- Modelo narrativo de 5 Fases × 20 segmentos.
- Motor narrativo definitivo con reproducción segmentada, anterior/siguiente, autoavance, seguimiento controlado y navegación por palabra.
- Roadmap jerárquico Fase → Segmento.
- Transcripción como contenido primario y contexto/visual como contenido complementario.
- 10 composiciones visuales maestras reutilizables.
- Gate QA estructural para impedir estados narrativos proporcionales o incompletos.
- Workflow reproducible de forced alignment con WhisperX.

### Cambiado
- index.html utiliza la experiencia narrativa de Fase 3 y sello v1.2.
- Service Worker actualizado para invalidar la caché anterior y precargar los artefactos de Fase 3.
- La implementación pública deja de depender del player de Fase 2.



Formato inspirado en Keep a Changelog. Fechas en America/Mexico_City.

## [v0.10] - 2026-06-11 - *Temas + modo dev*

Update 2 del dia. Se incorpora un sistema de temas seleccionable y un cambiador en modo dev. No-regresion: el tema por defecto (cobalto) reproduce exactamente el aspecto previo; instrument.css y el HTML no cambian de estructura (solo se tokenizaron hero y topbar con fallbacks identicos).

### Anadido
- **Sistema de temas** (`assets/css/themes.css`): 5 paletas seleccionables - **cobalto** (actual), **piedra** (grafito + brasa/oro), **marmol** (marfil + tinta + acero frio), **brutalismo** (concreto + mono + azul electrico) y **amanecer** (acero oscuro + degradado de alba cobalto->ambar). Cada tema sobrescribe SOLO tokens de `:root` (que instrument.css ya consumia) + tokens del hero.
- **Cambiador en modo dev** (`assets/js/theme.js`): oculto al publico; se abre con `Alt+Shift+D` (configurable) o con la URL `...#dev-temas`. Previsualiza cualquier tema en vivo (guardado local, solo en ese navegador) y entrega la unica linea a editar para publicar.
- `config.js` -> bloque `theme` (`published`, `devCombo`, `themes`).
- `docs/TEMAS.md`: diseno del sistema de temas y guia de publicacion.

### Cambiado
- `assets/css/instrument.css`: 1 cambio (token `--topbar-bg` con fallback al valor actual).
- `assets/css/additions.css`: hero tokenizado (bg, texto, degradado, acento, etc.) con fallbacks identicos a v0.9.1.
- `index.html`: `<html data-theme='cobalto'>`, script anti-parpadeo en `<head>`, link a `themes.css`, script `theme.js`, sello a v0.10.
- `sw.js`: cache `instrumento-v0.10` + precache de `themes.css` y `theme.js`.

## [v0.9] - 2026-06-11 - *Corte del diseno*

Cierre de la fase de diseno. El documento deja de ser pagina editorial y se vuelve laboratorio: se incorporan las capas decididas en el encuadre y se prepara el arranque de la siguiente version.

### Anadido
- **Linea de tiempo viva** (`timeline.js` + `assets/data/timeline.json`): 11 hitos en 3 hilos (CoMind, OBP, el instrumento), con estados Hecho / En curso / Por venir, sub-hitos (A1-A5) y glosa de *Sentido* por hito. Render sincrono desde JSON inline (offline-trivial) con fallback `<noscript>`.
- **Pulso** (`presence.js`): estado al dia editable + **cascada de presencia honesta**. Objetivo: chat en vivo estilo WhatsApp; respaldo 1: buzon asincrono (local hoy); respaldo 2: IA proxy (placeholder, requiere backend).
- **Voces que acompanan** (`app.js`): agrega las glosas locales en una seccion de muro.
- **El porque** (carta abierta): seccion con bandera *en redaccion* - la prosa final se escribira conforme al documento que rige el modo de redaccion en Notion (placeholder por ahora).
- **Mapa del proyecto**: SVG inline con los tres hilos y sus relaciones.
- **PWA real**: `manifest.webmanifest` + `sw.js` (app-shell, offline, network-first en navegacion) + iconos. Instalable en el movil. Boton *Instalar* honesto (solo si el navegador lo ofrece).
- **Senal de presencia A** integrada en el Pulso.
- `docs/` con 7 documentos de arquitectura y diseno.
- `robots.txt`, `.nojekyll`, workflows de Pages y de calidad.

### Cambiado
- `config.js` -> `v0.9` con flags nuevos: `timeline`, `pulso` (estado + chat cascade + presence), `voces`, `pwa`.
- `index.html`: nav ampliada (#pulso #porque #camino #mapa #voces), banner y sello a v0.9, orden de scripts.

### Sin cambios (no-regresion deliberada)
- `assets/css/instrument.css` (base intacta).
- Comportamiento base de `glosa.js` (solo se amplio el selector para incluir `.tl-node`).

### Pendiente (requiere backend, F4+)
- Chat en vivo 24/7, voces de todos los visitantes, login (Google/Facebook), push.
- Redaccion final de la carta abierta (sujeta al documento de estilo en Notion, en elaboracion).

## [v0.8] - 2026-06-10
- Refactor a multiarchivo (assets/css, assets/js), capa Glosa inicial, config de plataforma.

## [v0.7] - 2026-06
- Primera version editorial publicada en GitHub Pages.

## v0.9.1 - 2026-06-11
- Hero / llamado a la accion wide-screen al inicio (fondo generativo CSS, gancho --hero-img para foto libre opcional).
- Bump de cache del service worker (instrumento-v0.9.1).
