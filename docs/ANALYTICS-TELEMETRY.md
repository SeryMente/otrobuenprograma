# Telemetría de analytics y privacidad — OGP

## Estado

Propuesta de arquitectura para `SeryMente/otrogranprograma`.

Rama: `feat/analytics-telemetry`

Objetivo: medir tráfico y conversión del sitio público sin convertir OGP en un sistema de seguimiento invasivo.

## 1. Separación fundamental

OGP tendrá dos fuentes de telemetría:

1.**GitHub-native**: tráfico del repositorio, clones, vistas, visitantes únicos y referidores que GitHub expone en sus métricas de tráfico. GitHub limita esta telemetría a los últimos 14 días.
2. **Web propia**: eventos del sitio publicado en GitHub Pages, enviados a un backend propio y, opcionalmente, replicados a GA4 mediante Measurement Protocol.

No se intentará instrumentar la página `github.com/SeryMente/otrogranprograma`; GitHub controla ese HTML. La instrumentación propia corresponde al sitio GitHub Pages:

`https://serymente.github.io/otrogranprograma/`

## 2. Identidad de visitante

No se usará una huella de hardware como identificador primario.

### Permitido

- `visitor_id`: UUID aleatorio de primera parte, creado al comenzar la analítica bajo consentimiento tácito cuando resulte aplicable o tras una aceptación expresa.
- `session_id`: UUID efímero con expiración corta.
- `user_id`: solamente cuando exista autenticación explícita y el usuario haya aceptado su uso para analítica.
- Preferencias y señales de producto necesarias para análisis: página, evento, campaña, referrer, idioma, zona horaria declarada por el navegador, viewport y capacidades generales.

### No recolectar

- Dirección MAC: no está disponible de forma ordinaria para JavaScript de una página web pública ni debe intentarse obtener mediante técnicas indirectas.
- Dirección IPv4/IPv6 pública en el navegador: no debe exponerse al cliente ni almacenarse como atributo permanente de visitante.
- Fingerprinting exhaustivo de hardware/software: no usar combinaciones de fuentes/fonts/plugins/APIs/red que intenten identificar persistentemente a una persona o dispositivo.
- Identificadores de publicidad de terceros ni técnicas de evasión de controles de privacidad.

### Tratamiento de IP

El backend necesariamente puede observar una IP de origen como parte de la conexión HTTP. Debe procesarla únicamente para seguridad/antiabuso y, cuando sea necesario para analítica geográfica gruesa, derivar una categoría agregada y descartar la IP cruda.

Para deduplicación o seguridad se puede usar, como máximo, un HMAC con secreto rotatorio y retención corta; nunca publicar ni enviar la IP cruda a GA4 como identificador.

## 3. Consentimiento y aviso de privacidad

La instrumentación debe diseñarse bajo minimización, finalidad, transparencia, proporcionalidad y seguridad.

Para el tratamiento first-party de medición estadística de OGP, el sitio adopta **consentimiento tácito por defecto cuando jurídicamente resulte aplicable**. Esto significa que la analítica se activa sin un banner de aceptación interactivo después de poner a disposición el aviso de privacidad simplificado. El sitio ofrece simultáneamente un mecanismo visible y persistente de oposición que detiene nuevos eventos e identificadores.

El sitio debe disponer de:

- aviso de privacidad simplificado disponible antes del tratamiento;
- vínculo al aviso integral;
- separación entre analítica estadística first-party y marketing/publicidad;
- mecanismo sencillo de oposición y revocación;
- registro local de la elección/oposición;
- retención definida por categoría de dato;
- procedimiento para solicitudes de derechos ARCO.

El aviso simplificado identifica al responsable, domicilio, categorías de datos y finalidades, e indica dónde consultar el aviso integral. La analítica no se recorta por defecto: conserva rutas, referrer, UTM, visitor/session UUID, dispositivo y navegador en categorías, idioma, zona horaria, scroll, tiempo activo y CTA/conversión conforme al esquema del backend.

**Nota jurídica de alcance:** la modalidad tácita no se debe extender automáticamente a datos sensibles, finalidades que exijan consentimiento expreso o terceros/marketing cuando la legislación aplicable requiera una base distinta. Este diseño es México-first y no pretende resolver por sí solo requisitos de otras jurisdicciones.

Este documento es una especificación técnica; no sustituye una revisión jurídica profesional aplicable a OGP.

## 4. Eventos mínimos

### `page_view`

- timestamp
- ruta/página
- referrer
- UTM source / medium / campaign / content / term
- visitor_id (solo con consentimiento)
- session_id
- viewport
- idioma
- zona horaria
- user-agent normalizado en categorías

### `session_start`

Mismos metadatos mínimos más una marca de nueva sesión.

### `engagement`

- tiempo de interacción por página
- profundidad de scroll por umbrales
- visibilidad aproximada
- salida/abandono

### `cta_click`

- CTA
- destino
- página de origen
- campaña asociada

### `conversion`

Eventos definidos por negocio: contacto, envío de formulario, apertura de recurso, donativo, suscripción, etc.

## 5. Backend propuesto

Aprovechar el diseño actual de OGP, que ya deja previsto `supabase` como proveedor futuro.

Flujo:

```
GitHub Pages
   |
   | HTTPS / JSON
   v
Supabase Edge Function
   |
   +--> tabla de eventos propios
   |
   +--> agregados diarios
   |
   +--> GA4 Measurement Protocol (opcional)
```

El cliente nunca recibe el secreto de GA4.

### Secretos

Guardar exclusivamente en secretos del backend:

- `GA4_MEASUREMENT_ID`
- `GA4_API_SECRET`

El Measurement Protocol de GA4 exige `measurement_id` y `api_secret`; Google indica expresamente que el `api_secret` debe permanecer confidencial y no exponerse en código cliente.

## 6. Modelo de datos inicial

### `analytics_events`

- `id`
- `occurred_at`
- `event_name`
- `path`
- `referrer`
- `campaign_source`
- `campaign_medium`
- `campaign_name`
- `visitor_id` nullable
- `session_id` nullable
- `user_id` nullable
- `country` nullable
- `region` nullable
- `device_class`
- `browser_family`
- `os_family`
- `viewport_class`
- `consent_analytics`
- `consent_marketing`
- `schema_version`

No almacenar en esta tabla:

- MAC
- IP cruda
- fingerprint crudo
- lista de fuentes instaladas
- plugins instalados
- identificadores ocultos del dispositivo

## 7. Retención

Propuesta inicial:

- eventos crudos: 90 días;
- tablas agregadas: 12 meses;
- consentimiento y auditoría: conservar mientras sea necesario para demostrar la elección y cumplimiento;
- cualquier identificador de seguridad derivado de IP: pocos días y con rotación.

La retención exacta debe fijarse según la finalidad y la política de privacidad final.

## 8. Métricas

Dashboard mínimo:

- visitantes únicos por día/semana/mes;
- sesiones;
- vistas;
- páginas de entrada/salida;
- engagement;
- campañas UTM;
- referrers;
- dispositivo/navegador a nivel agregado;
- conversiones por CTA;
- país/región a nivel agregado;
- comparación GitHub Traffic vs. sitio propio.

Importante: los visitantes únicos de GitHub y los visitantes únicos del sitio OGP no son métricas equivalentes y deben mostrarse separadas.

## 9. Concurrencia entre hilos

Este trabajo queda aislado en:

`feat/analytics-telemetry`

Regla operacional:

- no escribir directamente sobre `main`;
- no reutilizar ramas del otro hilo;
- no tocar `assets/css/instrument.css` salvo necesidad explícita;
- concentrar la primera implementación en `assets/js/analytics.js`, backend/infraestructura y documentación;
- integrar posteriormente mediante PR y resolver conflictos desde una sola rama integradora.

Si el otro hilo modifica `assets/js/config.js` simultáneamente, la integración deberá hacerse por diff/merge y no por sobrescritura.

## 10. Fases

### F1 — Base y consentimiento

Implementar gestor de consentimiento + eventos `page_view`, `session_start`, `cta_click`.

### F2 — Backend propio

Crear endpoint/Edge Function, validación de esquema, almacenamiento mínimo y rate limiting.

### F3 — GA4

Configurar `measurement_id` + `api_secret` como secretos y enviar eventos mediante Measurement Protocol.

### F4 — Dashboard

Agregar consultas agregadas y un panel operativo.

### F5 — Auditoría

Probar:

- rechazo de consentimiento;
- revocación;
- ausencia de identificadores persistentes sin consentimiento;
- no exposición del secreto;
- no almacenamiento de IP/MAC;
- límites de retención;
- eliminación/borrado de registros;
- trazabilidad de versiones del esquema.

## Referencias técnicas

- GitHub Repository Traffic API:
  https://docs.github.com/en/rest/metrics/traffic
- GitHub: Viewing traffic to a repository:
  https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-traffic-to-a-repository
- Google Analytics Measurement Protocol:
  https://developers.google.com/analytics/devguides/collection/protocol/ga4/reference
- Google Analytics: Sending events with Measurement Protocol:
  https://developers.google.com/analytics/devguides/collection/protocol/ga4/sending-events
- Ley Federal de Protección de Datos Personales en Posesión de los Particulares:
  https://www.diputados.gob.mx/LeyesBiblio/pdf/LFPDPPP.pdf
