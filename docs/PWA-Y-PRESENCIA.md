# PWA y presencia

## PWA (instalable + offline) - REAL, sin backend

- `manifest.webmanifest`: nombre, iconos, `display: standalone`, `theme_color`, `start_url`. Hace el sitio instalable en el movil ("Agregar a pantalla de inicio").
- `sw.js`: Service Worker con precache del app-shell. Estrategia:
  - **Navegacion:** network-first con fallback a cache (fresco con red, disponible sin red).
  - **Estaticos:** cache-first con revalidacion en segundo plano.
- `app.js`: registra el SW al cargar y muestra el boton *Instalar* solo si el navegador dispara `beforeinstallprompt` (honesto: no promete instalacion donde no se puede).

Requisito: origen seguro (https o localhost). GitHub Pages sirve https, asi que la instalacion funciona en produccion.

## Lo que la PWA NO hace sin backend

- **Push notifications:** requieren servidor de push -> F4.
- **Background sync:** requiere backend -> F4.

No se registran esas APIs para no fingir capacidades.

## Senal de presencia (honesta)

Sin backend no existe "en linea ahora" real. La senal por defecto es **async**: "escribe y te leo en cuanto pueda". El indicador `.pulso-presence.async` lo deja claro. Cuando se encienda el backend, `config.pulso.chat.live = true` activa el modo `live` con punto verde real.
