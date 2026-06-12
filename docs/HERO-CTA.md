# Hero / Llamado a la accion (wide screen)

Bloque de apertura a pantalla completa cuyo unico trabajo es **invitar a interactuar**: que quien llega no solo lea, sino que deje su voz, recorra el camino y escriba.

## Decisiones de diseno

- **Wide-screen, full-bleed.** La seccion rompe el ancho editorial (`--maxw:880px`) a `100vw` con `margin-left:calc(50% - 50vw)`; el texto sigue alineado a la reticula de 880px.
- **Altura:** `clamp(460px, 86vh, 840px)` — domina la primera pantalla sin tragarse el resto del documento. En movil baja a `80vh`.
- **Jerarquia de CTA (de mayor a menor compromiso):**
  1. `Deja tu voz` (primario, lima) -> `#voces`.
  2. `Recorre el camino` (fantasma) -> `#camino` (la linea de tiempo).
  3. `Pulso de hoy` (enlace) -> `#pulso`.
- **Mensaje:** encarna el concepto de marca "la obra que se completa con el lector" / "el intervalo, lo relacional".

## Fondo: generativo en CSS (sin dependencias)

El fondo NO depende de ninguna imagen externa. Se compone por capas:

- Gradiente base cobalto profundo (`::before`).
- Constelacion de puntos (`.hero-stars`) — metafora de las "voces que acompañan"; algunos puntos en lima de marca.
- Reticula tenue tipo blueprint (`.hero-grid`) — guiño al origen en Codespaces/ingenieria.
- Resplandor lima (`.hero-glow`).

Motivo de la decision: el entorno de build no tiene salida a internet, y montar un *hotlink* a un CDN externo sin verificar rompe el modo **offline de la PWA** y la regla de **no-regresion**. El fondo generativo es robusto, rapido, accesible y 100% offline.

## Gancho opcional de foto libre (`--hero-img`)

Si se quiere una textura fotografica, **no hace falta tocar el HTML**. Basta con:

1. Descargar una imagen de licencia libre (ver abajo) y guardarla como `assets/img/hero.jpg`.
2. Añadir una linea en `:root` (en `assets/css/instrument.css` o al inicio de `additions.css`):

```css
:root{ --hero-img:url('assets/img/hero.jpg'); }
```

La foto entra por `.hero-bg::after` con `mix-blend-mode:soft-light` (duotono automatico hacia la paleta) y opacidad `.55`, de modo que se integra al cobalto en vez de competir. Si la variable no esta definida, simplemente no aparece — sin romper nada.

### Imagenes libres recomendadas (Unsplash License, gratuitas)

Encontradas en la busqueda; todas "Free to use under the Unsplash License" (NO confundir con Unsplash+ de pago):

- **Mapa topografico azul con lineas brillantes** — `unsplash.com/photos/L5BTvO8eEyQ` (sobrio, dualiza limpio a cobalto; evoca "el camino que se levanta").
- **Cielo en degradado al amanecer (panoramico)** — Lucas Gallone, `unsplash.com/photos/T86bARnzPBQ` (amanecer = levantarse).
- **Campo de estrellas azul sobre negro** — `unsplash.com/photos/CdkWsmdKInk` (refuerza la constelacion de voces).

Al publicar con foto, dar credito al autor (Unsplash License lo agradece aunque no lo exige).

## Accesibilidad y rendimiento

- Texto blanco sobre cobalto profundo: contraste AA.
- Las capas decorativas van en `aria-hidden='true'`.
- Toda animacion (deriva de estrellas, pulso del punto, rebote del scroll) esta detras de `@media (prefers-reduced-motion: no-preference)`.
- Cero peso de red: el fondo es CSS puro.
- **Sin JS tambien funciona:** el hero no lleva la clase `reveal`, asi que es visible aunque el JavaScript falle (progressive enhancement).
