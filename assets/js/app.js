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

  /* ---------- 2) Instalacion PWA: aviso automatico al abrir (pide permiso) ---------- */
  /* Honesto: el navegador NO permite instalar sin un gesto del usuario; por eso, sin
     boton en el menu, mostramos sola una tarjeta que pide permiso para instalar. */
  var deferred=null, DKEY='pwa:dismissed-v1';
  function dismissedRecently(){
    try{ var t=+localStorage.getItem(DKEY)||0; return (Date.now()-t) < 1000*60*60*24*14; }catch(e){ return false; }
  }
  function showInstallPrompt(){
    if(document.querySelector('.pwa-prompt')) return;
    var c=document.createElement('div');
    c.className='pwa-prompt'; c.setAttribute('role','dialog'); c.setAttribute('aria-label','Instalar aplicacion');
    c.innerHTML="<span class='pwa-ico' aria-hidden='true'>\u2b07</span>"+
      "<div class='pwa-txt'><b>Instalar esta app</b>Acceso directo y uso sin conexion, sin tiendas.</div>"+
      "<button type='button' class='pwa-yes'>Instalar</button>"+
      "<button type='button' class='pwa-no' aria-label='Ahora no'>Ahora no</button>";
    document.body.appendChild(c);
    requestAnimationFrame(function(){ c.classList.add('show'); });
    function close(remember){ c.classList.remove('show'); if(remember){ try{localStorage.setItem(DKEY,Date.now());}catch(e){} } setTimeout(function(){ c.remove(); },420); }
    c.querySelector('.pwa-yes').addEventListener('click',function(){
      if(deferred){ deferred.prompt(); if(deferred.userChoice&&deferred.userChoice.finally){ deferred.userChoice.finally(function(){ deferred=null; }); } }
      close(false);
    });
    c.querySelector('.pwa-no').addEventListener('click',function(){ close(true); });
  }
  window.addEventListener('beforeinstallprompt',function(e){
    e.preventDefault(); deferred=e;
    if(dismissedRecently()) return;
    setTimeout(showInstallPrompt, 900);
  });
  window.addEventListener('appinstalled',function(){ deferred=null; var p=document.querySelector('.pwa-prompt'); if(p){ p.classList.remove('show'); setTimeout(function(){ p.remove(); },420); } });

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
