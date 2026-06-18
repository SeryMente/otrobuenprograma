/* ===================================================================
   Instrumento de comunicacion - Proyecto Vital - configuracion de plataforma
   ARRANQUE ZERO-BACKEND CON TRANSICION SEAMLESS.
   Unica pieza que se toca para encender capacidades futuras (Supabase + login + chat).
   La UI no cambia: lee de aqui a traves de adaptadores.
   =================================================================== */
window.INSTRUMENT_CONFIG = {
  version: "v0.13",

  // --- Temas (update 2): cambiador disponible en MODO DEV ---
  // El publico ve UN solo tema: el de <html data-theme="..."> (espejo de 'published').
  // El dev abre el panel con devCombo (Alt+Shift+D) o con la URL ...#dev-temas.
  theme: {
    published: "cobalto",   // tema de cara al publico (debe coincidir con <html data-theme>)
    devCombo: "alt+shift+d",
    themes: ["cobalto", "piedra", "marmol", "brutalismo", "amanecer"]
  },

  glosa: {
    enabled: true,        // capa Glosa activa
    storage: "local",     // "local" (hoy)  |  "supabase" (futuro, F4)
    identity: "anon",     // "anon" (hoy)  |  "google" | "facebook" (futuro)
    moderation: false,
    requireApproval: false
  },

  // --- Linea de tiempo viva (F5, datos locales, sin backend) ---
  timeline: {
    enabled: true,
    source: "inline",     // "inline" (lee #tl-data, offline-trivial)  |  "fetch" (assets/data/timeline.json)
    commentable: true     // cada nodo es anclable por Glosa
  },

  // --- Pulso: estado al dia + cascada de presencia/chat ---
  pulso: {
    enabled: true,
    // Estado al dia: se edita a mano (Codespaces) o, mas adelante, desde una fuente.
    estado: {
      fecha: "2026-06-13",
      texto: "Reestructura editorial del instrumento: seis secciones auditadas parte por parte, de borrador a documento con intencion, y empaquetada la v0.12 lista para publicar. Hoy el latido es: el documento se ordena para poder crecer."
    },
    // Cascada de presencia (decision 2026-06-11). Live chat EXIGE backend (F4+).
    chat: {
      live: false,                 // <PLACEHOLDER> chat en vivo estilo WhatsApp (objetivo) - requiere backend
      liveLabel: "Chat en vivo (proximamente)",
      buzon: true,                 // respaldo 1: buzon asincrono (local hoy, email/backend despues)
      ia: false,                   // <PLACEHOLDER> respaldo 2: asistente IA proxy - requiere backend
      messenger: "https://m.me/tu.freewillman2",  // chat directo via Facebook Messenger (sin backend)
      messengerLabel: "Escribirme por Messenger",
      whatsapp: ""                  // <PLACEHOLDER> enlace wa.me cuando se decida exponerlo
    },
    // Senal de presencia honesta (sin backend no hay "online" real).
    presence: {
      mode: "async",               // "async" = "escribe y te leo en cuanto pueda" | "live" (requiere backend)
      label: "Ahora respondo en diferido",
      detail: "No hay nadie despierto 24/7: tu mensaje no se pierde y se responde en cuanto sea posible."
    }
  },

  // --- Voces que acompanan (agrega las glosas en una seccion) ---
  voces: { enabled: true, max: 8 },

  // --- PWA: instalable + offline (client-side, sin backend) ---
  pwa: { enabled: true, swPath: "sw.js" },

  // --- TODO LO DEMAS, PLACEHOLDER (requiere backend externo) ---
  backend: { provider: null, supabaseUrl: "", supabaseAnonKey: "" },
  auth: { google: false, facebook: false, tiktok: false },
  features: { bitacora: false, estadoActual: true, galeria: false }
};
