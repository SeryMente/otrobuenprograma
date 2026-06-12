/* ===================================================================
   assets/js/presence.js  -  Pulso: estado al dia + cascada de presencia
   (v0.9, zero-backend honesto)
   - Estado al dia: se lee de config.pulso.estado (editable a mano).
   - Senal de presencia: honesta. Sin backend NO hay "en vivo" real;
     se muestra el modo async ("escribe y te leo en cuanto pueda").
   - Cascada de chat: live (proximamente, requiere backend) ->
     buzon asincrono (local hoy) -> IA proxy (placeholder).
   - PWA: el chat se instala con el sitio (ver app.js).
   =================================================================== */
(function(){
  'use strict';
  var CONF=(window.INSTRUMENT_CONFIG||{});
  var P=(CONF.pulso||{});
  if(P.enabled===false) return;
  var mount=document.getElementById('pulso-mount');
  if(!mount) return;

  function esc(s){ return (s||'').replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c];}); }
  function fmtFecha(iso){ try{ return new Date(iso+'T12:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'}); }catch(e){ return iso; } }

  var est=P.estado||{}, chat=P.chat||{}, pres=P.presence||{};
  var liveOn = chat.live===true;

  // --- Buzon asincrono local (respaldo 1) ---
  var BKEY='pulso-buzon-v1';
  function readBuzon(){ try{return JSON.parse(localStorage.getItem(BKEY)||'[]');}catch(e){return [];} }
  function saveBuzon(a){ try{localStorage.setItem(BKEY,JSON.stringify(a));}catch(e){} }

  var html=''+
    '<div class="pulso-grid">'+
      '<div class="pulso-estado">'+
        '<div class="pulso-kicker"><span class="pulso-beat" aria-hidden="true"></span> Estado al dia &middot; '+esc(fmtFecha(est.fecha||''))+'</div>'+
        '<p class="pulso-texto">'+esc(est.texto||'')+'</p>'+
        '<p class="pulso-foot">Se actualiza a diario. Es la cara presente de como me levanto.</p>'+
      '</div>'+
      '<div class="pulso-chat">'+
        '<div class="pulso-presence '+(liveOn?'live':'async')+'"><span class="pdot"></span> '+esc(liveOn?'En vivo ahora':(pres.label||'Respondo en diferido'))+'</div>'+
        '<p class="pulso-presence-detail">'+esc(pres.detail||'')+'</p>'+
        '<div class="pulso-cascade">'+
          '<button type="button" class="pulso-live" '+(liveOn?'':'disabled')+' title="'+(liveOn?'Abrir chat en vivo':'Requiere backend (proximamente)')+'">'+
            '\uD83D\uDCAC '+esc(liveOn?'Hablar en vivo':(chat.liveLabel||'Chat en vivo (proximamente)'))+'</button>'+
          '<div class="pulso-fallbacks">'+
            '<span class="pf">Objetivo: chat en vivo estilo WhatsApp, personalizado.</span>'+
            '<span class="pf">Respaldo 1: buzon asincrono (tu mensaje no se pierde).</span>'+
            '<span class="pf">Respaldo 2: asistente IA (cuando no hay nadie).</span>'+
          '</div>'+
        '</div>'+
        ( chat.buzon!==false ?
        '<form class="pulso-buzon" id="pulso-buzon">'+
          '<label for="pulso-msg">Buzon &middot; escribe y te leo en cuanto pueda</label>'+
          '<textarea id="pulso-msg" maxlength="1200" placeholder="Tu mensaje\u2026" aria-label="Tu mensaje para el autor"></textarea>'+
          '<div class="pulso-row"><span class="pulso-hint">Modo local (sin backend): se guarda en este navegador hasta encender el envio real.</span><button type="submit">Enviar al buzon</button></div>'+
          '<div class="pulso-sent" id="pulso-sent" hidden></div>'+
        '</form>' : '' )+
      '</div>'+
    '</div>';

  mount.innerHTML=html;

  var form=document.getElementById('pulso-buzon');
  if(form){
    var sent=document.getElementById('pulso-sent');
    function renderSent(){
      var a=readBuzon();
      if(!a.length){ sent.hidden=true; return; }
      sent.hidden=false;
      sent.innerHTML='<span class="pulso-sent-t">En tu buzon local ('+a.length+'):</span>'+
        a.slice(-3).reverse().map(function(m){ return '<div class="pulso-sent-i">\u201C'+esc(m.text.slice(0,120))+(m.text.length>120?'\u2026':'')+'\u201D</div>'; }).join('');
    }
    form.addEventListener('submit',function(ev){
      ev.preventDefault();
      var ta=document.getElementById('pulso-msg');
      var t=(ta.value||'').trim(); if(!t){ ta.focus(); return; }
      var a=readBuzon(); a.push({text:t.slice(0,1200), ts:new Date().toISOString()}); saveBuzon(a);
      ta.value=''; renderSent();
    });
    renderSent();
  }
})();
