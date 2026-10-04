# Arquitectura activa · Instrumento de comunicación

## Publicación vigente

- `index.html`: diseño editorial original, nombre visible Khora, sin bitácora ni mapa del proyecto.
- `transparencia.html`: instrumento financiero autónomo, embebido en `#cuentas` y disponible a pantalla completa.
- `libro-publico.json`: fuente única activa de registros financieros, necesidades, igualación, conciliación, asignaciones y correcciones.
- Los controles de selección y edición no están publicados en Pages. La copia de trabajo está en el área privada del autor y sus borradores no se publican automáticamente.

El panel verifica la estructura de los datos, identificadores únicos, fechas, montos enteros positivos en centavos y asignaciones que no excedan los ingresos o gastos relacionados. Una fuente inválida no produce totales ficticios. El cotejo con GitHub verifica coincidencia de datos, no saldo bancario.

`assets/js/cuentas.js`, `assets/data/movimientos.json` y `assets/data/necesidades.json` corresponden a la implementación anterior y no alimentan el panel activo. Se conservan como legado para el respaldo original. No deben actualizarse como un libro financiero paralelo.

Los comentarios, la glosa y el buzón de la arquitectura anterior eran almacenamiento local. No constituyen por sí mismos comentarios compartidos ni un servidor de edición privada. La autenticación del taller privado depende de Notion, no de un enlace secreto.

## Arquitectura histórica de referencia

Lo siguiente se conserva como registro anterior; no describe la fuente financiera vigente.

# Arquitectura - v0.9

## Filosofia

**Arranque zero-backend con transicion seamless.** El sitio es 100% estatico (HTML/CSS/JS) y se publica en GitHub Pages. Toda capacidad que exige servidor esta *cableada pero apagada* detras de banderas en `config.js`. Encender el backend (F4) no debe reescribir la interfaz, solo cambiar adaptadores de datos.

## Capas (de base a futuro)

1. **Cascaron editorial** (v0.7): contenido sobrio, tipografia, navegacion. Intacto.
2. **Plataforma** (`config.js`): unica palanca de capacidades.
3. **Glosa** (`glosa.js`): comentario por elemento, almacenamiento local hoy.
4. **Linea de tiempo** (`timeline.js`): hitos del proyecto, render sincrono.
5. **Pulso** (`presence.js`): estado al dia + cascada de presencia/chat.
6. **Voces** (`app.js`): agregacion de glosas.
7. **PWA** (`manifest` + `sw.js`): instalable + offline.

## Orden de carga

```
config.js  ->  timeline.js  ->  glosa.js  ->  presence.js  ->  app.js
```

- `config.js` primero: define el contrato de capacidades.
- `timeline.js` antes que `glosa.js`: inyecta los nodos `.tl-node` de forma sincrona para que Glosa pueda anclarlos.
- `glosa.js`: lee el DOM ya completo.
- `presence.js` y `app.js`: montan pulso y voces, registran el SW.

## No-regresion

`instrument.css` no se toca. `glosa.js` solo cambia una linea (el selector, +`.tl-node`). Todo lo demas vive en archivos nuevos. Asi un fallo en una capa nueva nunca rompe el documento base.

## Datos

- **Glosa / buzon / voces:** `localStorage` (claves `glosa:instrumento-pv-v1`, `pulso-buzon-v1`).
- **Timeline:** JSON inline (`#tl-data`) como fuente de render; `assets/data/timeline.json` como copia canonica/legible y para futuro `fetch`.

## Transicion a backend (F4)

Cambiar en `config.js`: `glosa.storage = 'supabase'`, `backend.provider = 'supabase'`, `pulso.chat.live/ia = true`, `auth.*`. Los modulos leen estas banderas; la UI no cambia.
