/* ===================================================================
   assets/js/app.js  -  Cableado v0.9 (aditivo, no toca lo de v0.7/v0.8)
   1) Registro del service worker (PWA: instalable + offline).
   2) Boton "Instalar" (beforeinstallprompt) honesto: aparece solo si el
      navegador lo ofrece.
   3) Voces que acompanan: agrega las glosas locales en una seccion.
   =================================================================== */
(function(){
  'use strict';
  var CONF=(window.INSTRUMENT_CONFIG||{});

  /* ---------- 1) PWA: service worker ---------- */
  if((CONF.pwa||{}).enabled!==false && 'serviceWorker' in navigator){
    window.addEventListener('load',function(){
      var p=(CONF.pwa&&CONF.pwa.swPath)||'sw.js';
      navigator.serviceWorker.register(p).catch(function(e){ console.warn('[pwa] SW no registrado:',e); });
    });
  }

  /* ---------- 2) Boton instalar (solo si el navegador lo permite) ---------- */
  var deferred=null, btn=null;
  window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault(); deferred=e;
    btn=document.getElementById('pwa-install');
    if(btn){ btn.hidden=false; btn.addEventListener('click',function(){ btn.hidden=true; deferred.prompt(); deferred=null; }); }
  });

  /* ---------- 3) Voces que acompanan ---------- */
  var V=(CONF.voces||{});
  if(V.enabled!==false){
    var mount=document.getElementById('voces-mount');
    if(mount){
      var SKEY='glosa:instrumento-pv-v1';
      function read(){ try{return JSON.parse(localStorage.getItem(SKEY)||'[]');}catch(e){return [];} }
      function esc(s){ return (s||'').replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c];}); }
      function fmt(iso){ try{ return new Date(iso).toLocaleDateString('es-MX',{day:'numeric',month:'short'}); }catch(e){ return ''; } }
      function render(){
        var all=read().slice().reverse().slice(0,(V.max||8));
        var section=document.getElementById('voces');
        if(!all.length){
          mount.innerHTML='<div class="voces-empty">Aun no hay voces. Cuando alguien glose un elemento del documento, su voz aparecera aqui. <b>Inaugura la primera</b> con la pestana \u00ABGlosa\u00BB.</div>';
          return;
        }
        mount.innerHTML='<div class="voces-wall">'+all.map(function(r){
          return '<figure class="voz"><blockquote>'+esc(r.text.slice(0,240))+(r.text.length>240?'\u2026':'')+'</blockquote>'+
            '<figcaption><span class="voz-who">'+esc(r.author||'Anonimo')+'</span><span class="voz-when">'+fmt(r.ts)+'</span></figcaption></figure>';
        }).join('')+'</div>'+
        '<p class="voces-note">Modo local (sin backend): por ahora ves las voces de este navegador. La comunidad plena -voces de todos los visitantes- llega al encender el backend (F4).</p>';
      }
      render();
      // Re-render al volver a la pestana (por si se glosó algo)
      document.addEventListener('visibilitychange',function(){ if(!document.hidden) render(); });
    }
  }
})();
