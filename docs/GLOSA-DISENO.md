# Glosa - diseno de la capa de comentario por elemento

## Que es

Glosa convierte cada elemento marcado del documento en algo *comentable*. Inspirada en la anotacion estilo W3C (anclas estables), pero arranca local y anonima.

## Selector de elementos glosables

`glosa.js` define un `SELECTOR` con las clases/elementos que reciben pin de glosa. En v0.9 se amplio para incluir los nodos de la linea de tiempo:

```
.welcome, .summary, section[id] > p.lead, .card, .frame, .ethos, .jewel, .trajectory, .author, .tl-node
```

## Anclas

Cada elemento glosable recibe un `data-anchor` estable. Las glosas se guardan contra ese ancla, no contra la posicion, para sobrevivir cambios de maquetacion.

## Modelo de dato (localStorage)

Clave: `glosa:instrumento-pv-v1`. Registro:

```json
{ "id": "...", "anchor": "...", "text": "...", "author": "...", "authorId": "...", "ts": "ISO", "quote": "..." }
```

Identidad anonima local: `glosa-anon-id`, `glosa-name`.

## Hoy vs futuro

- **Hoy (local):** las glosas viven en el navegador del visitante. Privadas a ese dispositivo.
- **F4 (backend):** `glosa.storage = 'supabase'` -> glosas compartidas entre visitantes, con moderacion opcional (`moderation`, `requireApproval`).

## F4 · backend compartido

Con `glosa.storage = "supabase"`, `assets/js/backend.js` crea o recupera una sesion anonima y `glosa.js` usa el adaptador remoto para leer y publicar glosas compartidas. Las glosas locales previas se intentan sincronizar una sola vez por `client_id`; si el backend falla, el registro local se conserva.

## Honestidad

No se simula comunidad: mientras el backend no este configurado o disponible, la seccion "Voces que acompanan" permanece en modo local. Nada de "X personas comentaron" si no es real.
