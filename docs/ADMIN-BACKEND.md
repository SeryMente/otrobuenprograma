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

1. Crear el proyecto Supabase.
2. Ejecutar la migración `supabase/migrations/20261007153000_backend_foundation.sql`.
3. Crear el primer usuario en Authentication > Users.
4. Desde una sesión administrativa de SQL Editor ejecutar:

```sql
select public.bootstrap_admin_by_email('CORREO-DEL-ADMIN');
```

La función de bootstrap no está disponible para los roles `anon` ni `authenticated`.

El inicio de sesión de la consola utiliza `signInWithPassword` de Supabase Auth.

## Seguridad

- RLS en todas las tablas expuestas.
- `is_admin()` como función `security definer` con `search_path` fijado.
- El navegador nunca recibe secretos.
- Los eventos analíticos no contienen MAC, IP cruda ni fingerprint de hardware.
- El dashboard usa funciones agregadas para el resumen.
- El inspector de eventos está limitado por RLS al rol admin.

## GitHub Traffic

Se creó `github_traffic_daily` para conservar snapshots diarios de tráfico.

La siguiente fase añadirá un collector server-side que consulte la API de Traffic del repositorio `SeryMente/otrogranprograma`. Esto evitará depender exclusivamente de la ventana histórica limitada de GitHub.

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
