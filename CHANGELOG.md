# Changelog - Instrumento de comunicacion - Proyecto Vital

Formato inspirado en Keep a Changelog. Fechas en America/Mexico_City.

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
