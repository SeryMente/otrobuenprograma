# Temas del instrumento + modo dev

*Update 2 - 2026-06-11. Documento de diseno (agnostico de contenido).*

## Por que asi

El encargo: poder ver **todos** los temas y elegir, desde el propio sitio, cual se
publica de cara al publico - sin exponer esa eleccion al visitante. Y todo bajo la
regla de **no-regresion**: lo que ya gustaba (la version cobalto) es base intocable.

La clave tecnica es que `instrument.css` ya estaba construido con **tokens** CSS
(`var(--cobalt)`, `--ink`, `--lime`, ...). Por eso un tema no reescribe el CSS: solo
**sobrescribe esos tokens** en `html[data-theme="..."]`. El hero (que tenia colores
fijos) se tokenizo con *fallbacks identicos* a los actuales: si `themes.css` no
cargara, el hero se ve igual que antes.

## Arquitectura

- **`assets/css/themes.css`** - define los tokens nuevos en `:root` (por defecto =
  aspecto cobalto actual) y un bloque por tema (`html[data-theme="piedra"]`, etc.).
- **`<html data-theme="cobalto">`** en `index.html` = **fuente unica** del tema publico.
- **Script anti-parpadeo** en `<head>` - aplica la previsualizacion local del dev
  antes de pintar (evita el *flash* de tema).
- **`assets/js/theme.js`** - el cambiador en modo dev.
- **`config.js > theme`** - `published` (espejo del atributo), `devCombo`, `themes`.

## Los 5 temas

| id | nombre | caracter | luz |
|----|--------|----------|-----|
| `cobalto` | Cobalto nocturno | el actual, base | lima/blanco |
| `piedra` | Piedra y brasa | grafito calido, grave | brasa/oro |
| `marmol` | Marmol y tinta | marfil, tinta casi negra, monumental | acero frio |
| `brutalismo` | Brutalismo sobrio | concreto, todo monoespaciado, rejilla | azul electrico |
| `amanecer` | Acero y amanecer (heretico) | modo oscuro de acero | degradado de alba cobalto->ambar |

Todos son **candidatos** (no-dualidad): conviven hasta que una direccion resuene por
encima del resto. `amanecer` es el carril heretico/divergente.

## Modo dev (como verlos todos)

1. Abre el sitio publicado.
2. Pulsa **`Alt + Shift + D`** (o entra a `...#dev-temas` en movil sin teclado).
3. Aparece un panel abajo a la derecha: haz clic en cada tema para **previsualizarlo
   en vivo**. La eleccion se guarda **solo en tu navegador** (no afecta a nadie).
4. **"Volver al publicado"** descarta la previsualizacion.

> El visitante normal nunca ve el panel ni la previsualizacion: solo ve el tema
> publicado.

## Como publicar un tema (GitHub Pages es estatico)

No se puede "guardar desde el navegador": publicar = hacer **una** edicion y subirla.
En el panel, **"Fijar para publicacion..."** entrega la linea exacta:

```
<html lang='es' data-theme='NOMBRE'>
```

1. Edita esa linea (la primera con `<html ...>`) en `index.html`.
2. (Opcional) Deja `theme.published: "NOMBRE"` en `config.js` para que coincida.
3. `commit` + `push` -> GitHub Pages despliega -> hard-refresh.

## No-regresion / robustez

- El tema por defecto reproduce el aspecto previo **exactamente**.
- Los tokens del hero llevan *fallback* al valor original; si `themes.css` fallara,
  el documento se lee igual.
- El cambiador es progressive enhancement: sin JS, el sitio muestra el tema publicado
  y nada mas. No hay UI rota.
- `prefers-reduced-motion` respetado (sin transicion de color ni animacion del panel).

## Decisiones abiertas

- Convergencia: cual de los 5 se queda como definitivo (o si se mantiene el selector).
- Si en el futuro hay backend/login, el tema podria recordarse por usuario (hoy es
  local del navegador para el dev, y unico/publicado para el visitante).
