# Blog estático de Ser y Mente

## Propósito

Esta rama incorpora el puente de migración del blog histórico de Ser y Mente desde WordPress/Divi hacia un artefacto estático publicable bajo:

`https://serymente.github.io/otrogranprograma/blog/`

El contenido fuente permanece fuera de este repositorio. El exportador toma WordPress como fuente editorial y produce HTML, JSON, RSS, sitemap y activos locales para el sitio estático.

## Arquitectura

```
WordPress + Divi
      |
      | REST API (build-time)
      v
scripts/build-wordpress-blog.mjs
      |
      +--> blog/index.html
      +--> blog/posts/<slug>/index.html
      +--> blog/data/posts.json
      +--> blog/assets/media/*
      +--> blog/sitemap.xml
      +--> blog/feed.xml
      |
      v
GitHub Pages
```

No se consulta WordPress desde el navegador del visitante. La dependencia de WordPress es exclusivamente de construcción.

## Ejecución

Con Node.js 20+:

```powershell
$env:WORDPRESS_BASE_URL="https://tu-wordpress.example"
$env:BLOG_PUBLIC_BASE_URL="https://serymente.github.io/otrogranprograma/blog/"
node scripts/build-wordpress-blog.mjs
```

El exportador falla de forma explícita si `WORDPRESS_BASE_URL` no está definido.

## Política de fidelidad

Se conserva como fuente de verdad el HTML renderizado por WordPress para el cuerpo de cada entrada, pero se eliminan elementos ejecutables `<script>` y atributos inline de eventos (`onclick`, `onload`, etc.).

Las imágenes se descargan localmente y las referencias de imágenes remotas se reemplazan por rutas relativas dentro del artefacto estático.

Los enlaces internos hacia entradas importadas se normalizan a `/blog/posts/<slug>/` cuando puede identificarse el permalink de WordPress.

## Política de seguridad

El HTML de la entrada no se trata como código ejecutable de confianza. El exportador elimina scripts y manejadores de eventos antes de escribir el resultado.

No se almacenan credenciales de WordPress en el repositorio. La URL de origen entra por variable de entorno en el proceso de build.

## Estado

- ✅ GitHub Pages ya existe para OGP.
- ✅ Rama aislada creada: `feat/blog-static-ser-y-mente-20261007`.
- ✅ Exportador build-time creado.
- ⏳ Falta solamente identificar la instalación histórica de WordPress/Divi o disponer de una exportación de WordPress (WXR/XML) para poblar el blog real.
- ⛔ No se toca `main` desde esta rama.

## Criterio de cierre

La migración se considera lista cuando una ejecución del exportador produce el blog, los activos no dependen del servidor WordPress y las rutas principales pasan una revisión visual y de enlaces sobre GitHub Pages.
