# Chat - cascada de presencia

Decision (2026-06-11): el chat es una **cascada de presencia**, no una sola cosa.

## Los tres niveles

1. **Objetivo - chat en vivo, estilo WhatsApp, personalizado.**
   - Es la meta: presencia humana real. "Forzar" (invitar fuerte) a usar el instrumento como canal.
   - EXIGE backend (mensajeria en tiempo real, sesiones). Estado v0.9: `config.pulso.chat.live = false` (boton visible pero deshabilitado, etiqueta "proximamente").

2. **Respaldo 1 - buzon asincrono.**
   - "Tu mensaje no se pierde." Hoy es **local** (`localStorage`, clave `pulso-buzon-v1`): el visitante escribe y queda guardado en su navegador.
   - F4: el mismo formulario envia a backend/email sin cambiar la UI.

3. **Respaldo 2 - asistente IA proxy.**
   - Cuando no hay nadie despierto, una IA responde con contexto del proyecto. EXIGE backend/API. Estado v0.9: `config.pulso.chat.ia = false` (placeholder).

## Por que cascada

Presencia 24/7 humana es imposible de sostener para una persona. La cascada da una respuesta honesta a cada hora del dia: si estoy, en vivo; si no, buzon; si urge contexto, IA. La PWA permite que el chat se instale en el celular del usuario.

## Migracion de trafico

Hosting temporal en Codespaces/Pages -> dominio `.com`. Los enlaces de Bitly se mantienen migrables para no perder trafico al cambiar de dominio.
