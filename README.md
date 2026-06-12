# Instrumento de comunicacion - Proyecto Vital

Documento vivo (sitio estatico) del Proyecto Vital. Tres hilos: **CoMind** (la protesis cognitiva), **Otro Buen Programa** (el esfuerzo hermano) y **el instrumento mismo** (esta obra).

**Version:** `v0.9` - *corte del diseno* (2026-06-11). Pasa de pagina editorial a laboratorio: Glosa, linea de tiempo viva, voces que acompanan, pulso (estado al dia + cascada de presencia) y PWA instalable.

## Principio rector

**Arranque zero-backend con transicion seamless.** Todo lo de la v0.9 corre 100% en el navegador, sin servidor. Las capacidades que exigen backend (chat en vivo 24/7, voces de todos los visitantes, login, push) estan *cableadas pero apagadas* en `assets/js/config.js`, listas para encenderse en la fase F4 sin reescribir la interfaz.

## Como correr en local

```bash
python3 -m http.server 8000
# abrir http://localhost:8000
```

En Codespaces: el mismo comando; usar el puerto reenviado. Para que la PWA y el Service Worker funcionen se requiere origen seguro (https o localhost).

## Estructura

```
index.html                 cascaron + contenido (anclas para Glosa)
manifest.webmanifest       identidad PWA (instalable)
sw.js                      service worker (offline, app-shell)
robots.txt / .nojekyll     publicacion GitHub Pages
assets/css/instrument.css  base v0.7/v0.8 (INTACTA - no-regresion)
assets/css/additions.css   capas v0.9 (pulso, timeline, mapa, voces, carta)
assets/js/config.js        unica palanca de capacidades (flags)
assets/js/timeline.js      render sincrono de la linea de tiempo
assets/js/glosa.js         capa Glosa (comentario por elemento)
assets/js/presence.js      pulso: estado + cascada de presencia/chat
assets/js/app.js           registro SW + boton instalar + voces
assets/data/timeline.json  fuente canonica de hitos
assets/img/*               iconos PWA
docs/*                     decisiones tecnicas y de diseno
```

## Orden de carga (importa)

`config.js` -> `timeline.js` (sincrono, antes de glosa para que existan los nodos) -> `glosa.js` -> `presence.js` -> `app.js`.

## No-regresion

`instrument.css` y el comportamiento base de `glosa.js` (barra de progreso, reveal, navspy, fecha, volver-arriba) NO se modifican salvo una linea del selector de Glosa para incluir los nodos de la linea de tiempo. Todo lo nuevo es aditivo.

Ver `docs/ARQUITECTURA.md` para el detalle completo.
