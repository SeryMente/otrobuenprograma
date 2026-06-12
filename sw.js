/* ===================================================================
   sw.js  -  Service Worker (v0.9)
   Estrategia honesta y conservadora:
   - Precache del cascaron (app shell) -> abre sin conexion (PWA real).
   - Navegaciones: network-first con fallback a cache (contenido fresco
     cuando hay red; disponible offline cuando no).
   - Estaticos: stale-while-revalidate.
   No hay push ni sync en segundo plano: eso EXIGE backend (F4+).
   =================================================================== */
var VERSION='instrumento-v0.10';
var SHELL=[
  '.',
  'index.html',
  'manifest.webmanifest',
  'assets/css/instrument.css',
  'assets/css/additions.css',
  'assets/css/themes.css',
  'assets/js/config.js',
  'assets/js/theme.js',
  'assets/js/timeline.js',
  'assets/js/glosa.js',
  'assets/js/presence.js',
  'assets/js/app.js',
  'assets/data/timeline.json',
  'assets/img/icon-192.png',
  'assets/img/icon-512.png',
  'assets/img/apple-touch-icon.png'
];

self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(VERSION).then(function(c){
    return Promise.all(SHELL.map(function(u){ return c.add(u).catch(function(){}); }));
  }));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==VERSION;}).map(function(k){return caches.delete(k);}));
  }).then(function(){ return self.clients.claim(); }));
});

self.addEventListener('fetch',function(e){
  var req=e.request;
  if(req.method!=='GET') return;
  var url=new URL(req.url);
  if(url.origin!==location.origin) return;

  if(req.mode==='navigate'){
    e.respondWith(
      fetch(req).then(function(res){
        var copy=res.clone(); caches.open(VERSION).then(function(c){c.put(req,copy);});
        return res;
      }).catch(function(){ return caches.match(req).then(function(r){ return r||caches.match('index.html'); }); })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function(cached){
      var net=fetch(req).then(function(res){
        var copy=res.clone(); caches.open(VERSION).then(function(c){c.put(req,copy);});
        return res;
      }).catch(function(){ return cached; });
      return cached||net;
    })
  );
});
