# Blog estático · Ser y Mente

Ruta pública objetivo:

`https://serymente.github.io/otrogranprograma/blog/`

Este directorio es el destino del artefacto generado por:

`scripts/build-wordpress-blog.mjs`

No se considera fuente editorial. Los HTML, JSON, RSS, sitemap y medios aquí generados son una **copia publicable** del WordPress histórico.

## Flujo

1. Definir `WORDPRESS_BASE_URL` en el entorno local de construcción.
2. Ejecutar `node scripts/build-wordpress-blog.mjs`.
3. Revisar el artefacto generado.
4. Publicar el contenido generado en GitHub Pages.
5. Verificar rutas, imágenes, metadatos y enlaces internos.

La fuente WordPress no se incrusta en este repositorio y ningún secreto debe guardarse aquí.
