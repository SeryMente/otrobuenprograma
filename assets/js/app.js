/* ===================================================================
   assets/js/app.js - Cableado v0.9 + F4
   1) Registro del service worker.
   2) Boton instalar.
   3) Voces compartidas cuando el backend esta disponible; local si no.
   =================================================================== */
(function(){
  'use strict';
  var CONF=(window.INSTRUMENT_CONFIG||{});

  if((CONF.pwa||{}).enabled!==false && 'serviceWorker' in navigator){
    window.addEventListener('load',function(){
      var p=(CONF.pwa&&CONF.pwa.swPath)||'sw.js';
      navigator.serviceWorker.register(p).catch(function(e){console.warn('[pwa] SW no registrado:',e);});
    });
  }

  var deferred=null,DKEY='pwa:dismissed-v1';
  function dismissedRecently(){try{var t=+localStorage.getItem(DKEY)||0;return(Date.now()-t)<1000*60*60*24*14;}catch(e){return false;}}
  function showInstallPrompt(){
    if(document.querySelector('.pwa-prompt'))return;
    var c=document.createElement('div');c.className='pwa-prompt';c.setAttribute('role','dialog');c.setAttribute('aria-label','Instalar aplicacion');
    c.innerHTML="<span class='pwa-ico' aria-hidden='true'>↓</span><div class='pwa-txt'><b>Instalar esta app</b>Acceso directo y uso sin conexion, sin tiendas.</div><button type='button' class='pwa-yes'>Instalar</button><button type='button' class='pwa-no' aria-label='Ahora no'>Ahora no</button>";
    document.body.appendChild(c);requestAnimationFrame(function(){c.classList.add('show');});
    function close(remember){c.classList.remove('show');if(remember){try{localStorage.setItem(DKEY,Date.now());}catch(e){}}setTimeout(function(){c.remove();},420);}
    c.querySelector('.pwa-yes').addEventListener('click',function(){if(deferred){deferred.prompt();if(deferred.userChoice&&deferred.userChoice.finally){deferred.userChoice.finally(function(){deferred=null;});}}close(false);});
    c.querySelector('.pwa-no').addEventListener('click',function(){close(true);});
  }
  window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;if(dismissedRecently())return;setTimeout(showInstallPrompt,900);});
  window.addEventListener('appinstalled',function(){deferred=null;var p=document.querySelector('.pwa-prompt');if(p){p.classList.remove('show');setTimeout(function(){p.remove();},420);}});

  var V=(CONF.voces||{});
  if(V.enabled!==false){
    var mount=document.getElementById('voces-mount');
    if(mount){
      var SKEY='glosa:instrumento-pv-v1';
      function localRead(){try{return JSON.parse(localStorage.getItem(SKEY)||'[]');}catch(e){return [];}}
      function esc(s){return(s||'').replace(/[&<>\\\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\\\"':'&quot;'}[c];});}
      function fmt(iso){try{return new Date(iso).toLocaleDateString('es-MX',{day:'numeric',month:'short'});}catch(e){return '';}}
      function renderData(all,remote){
        var items=(all||[]).slice().reverse().slice(0,(V.max||8));
        if(!items.length){
          mount.innerHTML='<div class="voces-empty">Aun no hay voces. Cuando alguien glose un elemento del documento, su voz aparecera aqui. <b>Inaugura la primera</b> con la pestana «Glosa».</div>';
          return;
        }
        mount.innerHTML='<div class="voces-wall">'+items.map(function(r){
          return '<figure class="voz"><blockquote>'+esc((r.text||'').slice(0,240))+((r.text||'').length>240?'…':'')+'</blockquote><figcaption><span class="voz-who">'+esc(r.author||'Anonimo')+'</span><span class="voz-when">'+fmt(r.created_at||r.ts)+'</span></figcaption></figure>';
        }).join('')+'</div>'+
        (remote?'<p class="voces-note">Comunidad conectada: estas voces son compartidas entre visitantes.</p>':'<p class="voces-note">Modo local (sin backend): por ahora ves las voces de este navegador.</p>');
      }
      async function render(){
        var b=window.INSTRUMENT_BACKEND;
        if(b&&b.isReady()){
          try{renderData(await b.listGlosas(),true);return;}catch(e){}
        }
        renderData(localRead(),false);
      }
      render();
      window.addEventListener('instrument-backend-status',function(e){if(e.detail&&e.detail.ready)render();});
      document.addEventListener('visibilitychange',function(){if(!document.hidden)render();});
    }
  }
})();