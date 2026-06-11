/* ===================================================================
   Instrumento de comunicacion · Proyecto Vital — configuracion de plataforma
   ARRANQUE ZERO-BACKEND CON TRANSICION SEAMLESS.
   Esta es la unica pieza que se toca para encender capacidades futuras
   (Supabase + login). La UI no cambia: lee de aqui a traves de adaptadores.
   =================================================================== */
window.INSTRUMENT_CONFIG = {
  version: "v0.8",

  glosa: {
    enabled: true,        // la capa Glosa esta activa
    storage: "local",     // "local" (hoy, sin backend)  |  "supabase" (futuro)
    identity: "anon",     // "anon" (hoy)  |  "google" | "facebook" (futuro)
    moderation: false,    // pending/approved/hidden — requiere backend
    requireApproval: false
  },

  // --- TODO LO DEMAS, ANOTADO COMO PLACEHOLDER (requiere backend externo) ---
  backend: {
    provider: null,       // null = sin backend (GitHub Pages es estatico)
    supabaseUrl: "",      // <PLACEHOLDER> al encender Supabase
    supabaseAnonKey: ""   // <PLACEHOLDER> clave anon publica
  },
  auth: {
    google: false,        // <PLACEHOLDER> requiere backend + OAuth
    facebook: false,      // <PLACEHOLDER> requiere backend + OAuth
    tiktok: false         // fase posterior — no es plug-and-play
  },
  features: {
    bitacora: false,      // <PLACEHOLDER> seccion Avances/Bitacora dinamica
    estadoActual: false,  // <PLACEHOLDER> foto de estado que se actualiza
    galeria: false        // <PLACEHOLDER> galeria de avances
  }
};
