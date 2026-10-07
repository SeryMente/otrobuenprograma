# OGP · Backend y consola administrativa

## Arquitectura

El frontend público permanece temporalmente en GitHub Pages:

https://serymente.github.io/otrogranprograma/

El backend persistente es Supabase:

- Auth para identidad.
- Postgres para datos.
- RLS para autorización.
- Edge Functions para operaciones de servidor.
- Secretos de servidor para GA4 y futuras integraciones.

Supabase recomienda combinar Auth y Row Level Security; la autorización efectiva se aplica en Postgres y no se confía en la interfaz del navegador como frontera de seguridad.

## Consola

Ruta preliminar:

https://serymente.github.io/otrogranprograma/admin/

La consola contiene:

1. Resumen — métricas agregadas de 30 días y tendencia.
2. Tráfico — sitio OGP y archivo de GitHub Traffic.
3. Eventos — inspector de eventos recientes.
4. Integraciones — Supabase, GA4 y GitHub.
5. Acceso — sesión y rol.

La ruta /admin puede ser descubierta y cargar su shell estático. Los datos, funciones y permisos permanecen protegidos por Supabase Auth y RLS.

## Configuración pública

`assets/js/backend-config.js` contiene únicamente:

- URL pública de Supabase.
- publishable key.

No poner allí secret keys, service-role keys, contraseñas de base de datos ni GA4 API secrets.

## Crear el primer administrador

1. Abrir `/otrogranprograma/admin/primer-acceso.html`.
2. El correo `the.willfreeman@gmail.com` aparece fijado y la contraseña inicial se registra mediante `auth.signUp` directamente contra Supabase Auth.
3. Si Supabase exige confirmación de correo, confirmar el mensaje recibido.
4. Iniciar sesión en `/otrogranprograma/admin/`; para el primer acceso confirmado, la consola invoca `ogp-admin-claim`, que sólo puede promover ese correo y sólo mientras no exista ningún administrador.

El bootstrap SQL privado `private.bootstrap_admin_by_email` se conserva como mecanismo administrativo alternativo de recuperación y no se expone por PostgREST.

## Seguridad

- RLS en todas las tablas expuestas.
- El guard de administración (`private.is_admin()`) permanece fuera del esquema API expuesto.
- Las consultas agregadas públicas del dashboard son `SECURITY INVOKER` y quedan sujetas a RLS.
- El navegador nunca recibe secretos.
- Los eventos analíticos no contienen MAC, IP cruda ni fingerprint de hardware.
- El dashboard usa funciones agregadas para el resumen.
- El inspector de eventos está limitado por RLS al rol admin.

## GitHub Traffic

Se creó `github_traffic_daily` para conservar snapshots diarios de tráfico.

El collector server-side ya está desplegado que consulte la API de Traffic del repositorio `SeryMente/otrogranprograma`. Esto evitará depender exclusivamente de la ventana histórica limitada de GitHub.

## Migración a .com

El backend no depende del dominio de GitHub Pages. Para la migración futura se actualizarán Site URL / redirect URLs, CORS y el origen permitido de las Edge Functions; el modelo de datos y Auth permanecen.

## Despliegue

El flujo oficial de Supabase es enlazar el proyecto y desplegar las Edge Functions. El repositorio incluye `supabase/config.toml` y las funciones bajo `supabase/functions/`.

Referencias oficiales:

https://supabase.com/docs/guides/auth
https://supabase.com/docs/guides/database/postgres/row-level-security
https://supabase.com/docs/guides/functions/deploy
https://supabase.com/docs/guides/functions/secrets
https://supabase.com/docs/reference/javascript/auth-signinwithpassword

## Collector diario de GitHub

Secretos de la Edge Function:

- `GITHUB_TRAFFIC_TOKEN`: fine-grained personal access token limitado al repositorio `SeryMente/otrogranprograma`, con `Administration: read`.
- `GITHUB_TRAFFIC_COLLECTOR_TOKEN`: secreto interno aleatorio que autoriza al Cron a invocar el collector.

El collector consulta:

- `/traffic/views?per=day`
- `/traffic/clones?per=day`
- `/traffic/popular/referrers`
- `/traffic/popular/paths`

y archiva los datos diarios en `github_traffic_daily`.

Supabase Cron + pg_net puede invocar una Edge Function de forma programada. La recomendación actual de Supabase es guardar los secretos de invocación en Vault y utilizar Cron para el POST periódico.

Ejemplo de configuración posterior al aprovisionamiento:

```sql
select cron.schedule(
  'ogp-github-traffic-daily',
  '15 0 * * *',
  $$
    select net.http_post(
      url := (select decrypted_secret from vault.decrypted_secrets where name = 'ogp_project_url') || '/functions/v1/ogp-github-traffic',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-ogp-collector-token', (select decrypted_secret from vault.decrypted_secrets where name = 'ogp_collector_token')
      ),
      body := '{}'::jsonb
    )
  $$
);
```

El valor de `ogp_project_url` y `ogp_collector_token` se crean en Vault después de crear el proyecto.

El token de GitHub no se coloca en Vault para el Cron: es un secreto de la Edge Function (`GITHUB_TRAFFIC_TOKEN`).

## Primer acceso del administrador

La primera cuenta prevista para la consola es **the.willfreeman@gmail.com**. Para registrar la contraseña inicial existe la ruta controlada:

`/otrogranprograma/admin/primer-acceso.html`

El correo aparece fijado en la interfaz y la contraseña se captura únicamente mediante Supabase Auth con `auth.signUp`. OGP no almacena, transmite a su propio backend ni registra la contraseña.

Tras el alta, si el proyecto exige confirmación de correo, el titular debe confirmar el mensaje recibido. En el primer inicio de sesión confirmado, `ogp-admin-claim` reclama automáticamente el primer rol `admin` con las restricciones descritas.
