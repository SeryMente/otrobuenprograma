# Changelog - Instrumento de comunicacion - Proyecto Vital

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
