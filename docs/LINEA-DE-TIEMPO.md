# Linea de tiempo viva

## Que es

Una cronologia narrada de los hitos del proyecto, en tres hilos paralelos: **CoMind** (la protesis), **Otro Buen Programa** y **el instrumento mismo**. Cada hito lleva estado (Hecho / En curso / Por venir), fecha, detalle tecnico y una linea de *Sentido* que explica por que importa.

## Fuente de datos

- **Canonica/legible:** `assets/data/timeline.json`.
- **De render:** copia inline en `index.html` dentro de `<script type="application/json" id="tl-data">`.

Se usa la copia inline para render **sincrono** (sin esperar `fetch`, funciona offline desde el primer pintado) y para que `glosa.js` -que corre despues- encuentre los nodos `.tl-node` ya en el DOM.

## Como anadir un hito

1. Edita `assets/data/timeline.json` (fuente canonica).
2. Refleja el cambio en el bloque `#tl-data` de `index.html`.
3. Estados validos: `hecho`, `encurso`, `porvenir`. Sub-hitos opcionales en `sub: [{k,estado,t}]`.

## Render

`timeline.js` lee `#tl-data`, construye los hilos y nodos, marca el dot por estado y monta filtros (Todos / Hecho / En curso / Por venir). Sin JS, el `<noscript>` muestra una lista legible: progressive enhancement puro.

## Los 11 hitos (v0.9)

Hilo CoMind: 1 taller montado, 2 esqueleto, 3 segundo cerebro al bolsillo (A1-A5), 4 prueba contra la realidad, 5 de guardar a entender. Hilo OBP: 6 vacio documentado, 7 premisa a prueba, 8 comunicacion institucional. Hilo instrumento: 9 documento vivo, 10 como crecer sin romperse, 11 las capas que vienen.
