# F4 · Backend del instrumento

## Alcance

F4 implementa únicamente la transición ya definida para el instrumento:

- **Pulso:** conversación humana con persistencia y Realtime.
- **Buzón:** el mismo formulario deja de depender de almacenamiento local cuando el backend está configurado y guarda el mensaje en servidor.
- **Glosa:** las anotaciones pasan a ser compartidas entre visitantes.
- **Sesión:** identidad anónima de Supabase para que cada visitante vea solamente su propia conversación.

No entra en F4: asistente IA, WhatsApp, OAuth social ni un panel administrativo nuevo.

## Arquitectura

index.html
→ SDK Supabase
→ assets/js/backend.js
→ glosa.js / presence.js / app.js

El cliente usa una publishable/anon key en el navegador; nunca se debe publicar una service_role key. Las tablas están protegidas con Row Level Security.

## Puesta en marcha

### 1. Crear/configurar el proyecto Supabase

Crear un proyecto Supabase y habilitar **Anonymous Sign-Ins**.

El usuario anónimo se trata como authenticated en las Data APIs y las políticas RLS pueden distinguirlo mediante la afirmación is_anonymous.

### 2. Aplicar la migración

Ejecutar una sola vez en el SQL Editor:

    supabase/migrations/20261006_f4_communication.sql

La migración crea:

- public.pulso_chat_messages
- public.glosas_compartidas
- función public.is_pulso_operator()
- índices
- RLS
- publicación Realtime del chat

### 3. Configurar el operador

La respuesta humana se identifica mediante app_metadata.role = "operator" en el usuario de Supabase que atenderá el canal.

La asignación de app_metadata es una operación administrativa y debe hacerse desde un entorno seguro con privilegios de administrador; nunca con la clave pública del navegador.

### 4. Configurar el sitio

En la copia privada/de despliegue de assets/js/config.js, completar:

    backend: {
      provider: "supabase",
      supabaseUrl: "https://<proyecto>.supabase.co",
      supabasePublishableKey: "<publishable-key>"
    },
    auth: {
      anonymous: true,
      google: false,
      facebook: false,
      tiktok: false
    },

Mantener pulso.chat.live = false mientras la operación humana no esté lista. Cuando el operador ya pueda atender el canal, cambiarlo a true.

Para que Glosa use el backend:

    glosa: {
      storage: "supabase",
      identity: "anon",
      moderation: false,
      requireApproval: false
    },

### 5. Seguridad operativa

No colocar service_role ni otras claves secretas en index.html, config.js público, GitHub o el navegador.

Supabase recomienda proteger las tablas expuestas con RLS y limitar los grants por rol. Para Anonymous Sign-Ins recomienda además una defensa anti-abuso como CAPTCHA/Turnstile en producción.

### 6. Qué debe comprobarse

Con backend configurado:

1. Un visitante obtiene una sesión anónima persistente.
2. El buzón inserta una fila en pulso_chat_messages.
3. El visitante puede leer solamente sus propios mensajes.
4. Un operador autorizado puede leer la conversación y responder.
5. Con pulso.chat.live = true, nuevas respuestas llegan por Realtime sin recargar.
6. Una Glosa publicada aparece para otros visitantes.
7. Con backend apagado/no configurado, el sitio conserva el comportamiento local actual.

## Fuera de alcance

Este ciclo no activa:

- asistente IA;
- login de Google/Facebook/TikTok;
- WhatsApp;
- push;
- sincronización en segundo plano;
- un panel administrativo privado.

El objetivo es cerrar la transición de zero-backend a backend real sin rediseñar la interfaz.
