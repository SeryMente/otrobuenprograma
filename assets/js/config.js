/* ===================================================================
   Instrumento de comunicacion - Proyecto Vital - configuracion de plataforma
   ARRANQUE ZERO-BACKEND CON TRANSICION SEAMLESS.
   Unica pieza que se toca para encender capacidades futuras (Supabase + login + chat).
   La UI no cambia: lee de aqui a traves de adaptadores.
   =================================================================== */
window.INSTRUMENT_CONFIG = {
  version: "v0.14",

  theme: {
    published: "cobalto",
    devCombo: "alt+shift+d",
    themes: ["cobalto", "piedra", "marmol", "brutalismo", "amanecer"]
  },

  glosa: {
    enabled: true,
    storage: "supabase",
    identity: "anon",
    moderation: false,
    requireApproval: false
  },

  timeline: {
    enabled: true,
    source: "inline",
    commentable: true
  },

  pulso: {
    enabled: true,
    estado: {
      fecha: "2026-06-13",
      texto: "Reestructura editorial del instrumento: seis secciones auditadas parte por parte, de borrador a documento con intencion, y empaquetada la v0.12 lista para publicar. Hoy el latido es: el documento se ordena para poder crecer."
    },
    chat: {
      live: false,
      liveLabel: "Chat en vivo (proximamente)",
      buzon: true,
      ia: false,
      messenger: "https://m.me/tu.freewillman2",
      messengerLabel: "Escribirme por Messenger",
      whatsapp: ""
    },
    presence: {
      mode: "async",
      label: "Ahora respondo en diferido",
      detail: "No hay nadie despierto 24/7: tu mensaje no se pierde y se responde en cuanto sea posible."
    }
  },

  voces: { enabled: true, max: 8 },
  pwa: { enabled: true, swPath: "sw.js" },

  backend: {
    provider: "supabase",
    supabaseUrl: "",
    supabasePublishableKey: "",
    supabaseAnonKey: ""
  },

  auth: {
    anonymous: true,
    google: false,
    facebook: false,
    tiktok: false
  },

  features: { bitacora: false, estadoActual: true, galeria: false }
};
