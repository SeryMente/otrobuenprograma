/* ===================================================================
   assets/js/presence.js - Pulso: estado al dia + cascada de presencia
   F4: backend Supabase opcional, buzon persistente y chat Realtime.
   Si el backend no esta configurado, conserva el fallback local vigente.
   =================================================================== */
(function(){
  'use strict';
  var CONF=(window.INSTRUMENT_CONFIG||{});
  var P=(CONF.pulso||{});
  if(P.enabled===false) return;
  var mount=document.getElementById('pulso-mount');
  if(!mount) return;

  function esc(s){return(s||'').replace(/[&<>\\\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\\\"':'&quot;'}[c];});}
  function fmtFecha(iso){try{return new Date(iso+'T12:00:00').toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'});}catch(e){return iso;}}
  function fmtHora(iso){try{return new Date(iso).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});}catch(e){return '';}}
  function idLocal(){try{var k='pulso-anon-id',v=localStorage.getItem(k);if(!v){v='local-'+Math.random().toString(36).slice(2,9);localStorage.setItem(k,v);}return v;}catch(e){return 'local';}}

  var est=P.estado||{},chat=P.chat||{},pres=P.presence||{};
  var messenger=(chat.messenger||'').trim();
  var backend=window.INSTRUMENT_BACKEND||null;
  var backendOn=false,liveActive=false,thread=[],unsubscribe=function(){};
  var form,liveBtn,threadEl,statusEl,sendBtn;

  var BKEY='pulso-buzon-v1';
  function readLocal(){try{return JSON.parse(localStorage.getItem(BKEY)||'[]');}catch(e){return [];}}
  function saveLocal(a){try{localStorage.setItem(BKEY,JSON.stringify(a));}catch(e){}}

  function renderThread(){
    if(!threadEl)return;
    if(!thread.length){
      threadEl.innerHTML='<div class="pulso-thread-empty">'+(liveActive?'Aqui aparecera la conversacion en vivo.':'Aqui apareceran tus mensajes y las respuestas cuando el backend este conectado.')+'</div>';
      return;
    }
    threadEl.innerHTML=thread.map(function(m){
      var mine=m.sender_role==='visitor';
      return '<div class="pulso-msg '+(mine?'mine':'theirs')+'"><div class="pulso-msg-body">'+esc(m.body)+'</div><div class="pulso-msg-meta">'+(mine?'Tu':'Victor')+' · '+fmtHora(m.created_at||m.ts)+'</div></div>';
    }).join('');
    threadEl.scrollTop=threadEl.scrollHeight;
  }

  function renderLocal(){
    var a=readLocal(),target=document.getElementById('pulso-sent');
    if(!target)return;
    if(!a.length){target.hidden=true;return;}
    target.hidden=false;
    target.innerHTML='<span class="pulso-sent-t">Mensajes de este navegador ('+a.length+'):</span>'+
      a.slice(-3).reverse().map(function(m){return '<div class="pulso-sent-i">“'+esc(m.text.slice(0,120))+(m.text.length>120?'…':'')+'”</div>';}).join('');
  }

  function render(){
    var directOn=!liveActive&&!!messenger;
    var presenceClass=liveActive?'live':'async';
    var presenceLabel=liveActive?'En vivo ahora':(pres.label||'Respondo en diferido');
    var primaryLabel=liveActive?'Hablar en vivo':(directOn?(chat.messengerLabel||'Escribirme por Messenger'):(chat.liveLabel||'Chat en vivo (proximamente)'));
    var buttonDisabled=!(liveActive||directOn);
    var cascadeNow=liveActive?'Ahora: chat humano en vivo.':(backendOn?'Ahora: buzon conectado; tu mensaje queda en servidor.':'Ahora: chat directo por Messenger (te escribo en cuanto pueda).');
    var formLabel=liveActive?'Conversacion en vivo':'Buzon · escribe y te leo en cuanto pueda';
    var hint=backendOn?'Queda guardado en el backend y puedes volver a esta conversacion.':'Modo local (sin backend): se guarda en este navegador hasta encender el envio real.';

    mount.innerHTML=
      '<div class="pulso-grid">'+
        '<div class="pulso-estado"><div class="pulso-kicker"><span class="pulso-beat" aria-hidden="true"></span> Estado al dia · '+esc(fmtFecha(est.fecha||''))+'</div><p class="pulso-texto">'+esc(est.texto||'')+'</p><p class="pulso-foot">Se actualiza a diario. Es la cara presente de como me levanto.</p></div>'+
        '<div class="pulso-chat">'+
          '<div class="pulso-presence '+presenceClass+'"><span class="pdot"></span> '+esc(presenceLabel)+'</div>'+
          '<p class="pulso-presence-detail">'+esc(liveActive?'Puedes escribirme aqui y la respuesta llegara sin recargar la pagina.':(pres.detail||''))+'</p>'+
          '<div class="pulso-cascade">'+
            '<button type="button" id="pulso-live-btn" class="pulso-live" '+(buttonDisabled?'disabled':'')+'>'+((liveActive?'💬 ':'')+esc(primaryLabel))+'</button>'+
            '<div class="pulso-fallbacks"><span class="pf">'+esc(cascadeNow)+'</span><span class="pf">Respaldo 1: buzon asincrono (tu mensaje no se pierde).</span><span class="pf">Respaldo 2: asistente IA (cuando no hay nadie).</span></div>'+
          '</div>'+
          (chat.buzon!==false?
            '<div class="pulso-conversation">'+
              (backendOn?'<div id="pulso-thread" class="pulso-thread" aria-live="polite"></div>':'')+
              '<form class="pulso-buzon" id="pulso-buzon">'+
                '<label for="pulso-msg">'+esc(formLabel)+'</label>'+
                '<textarea id="pulso-msg" maxlength="1200" placeholder="Tu mensaje…" aria-label="Tu mensaje para el autor"></textarea>'+
                '<div class="pulso-row"><span class="pulso-hint">'+esc(hint)+'</span><button type="submit">Enviar</button></div>'+
                '<div class="pulso-sent" id="pulso-sent" hidden></div>'+
                '<div class="pulso-status" id="pulso-status" aria-live="polite"></div>'+
              '</form>'+
            '</div>':'')+
        '</div>'+
      '</div>';

    liveBtn=document.getElementById('pulso-live-btn');
    form=document.getElementById('pulso-buzon');
    threadEl=document.getElementById('pulso-thread');
    statusEl=document.getElementById('pulso-status');
    sendBtn=form&&form.querySelector('button[type="submit"]');

    if(liveBtn){
      if(directOn)liveBtn.addEventListener('click',function(){window.open(messenger,'_blank','noopener');});
      else if(liveActive)liveBtn.addEventListener('click',function(){var ta=document.getElementById('pulso-msg');if(ta)ta.focus();});
    }
    if(form){form.addEventListener('submit',send);if(!backendOn)renderLocal();else renderThread();}
  }

  function addThread(m){
    if(!m)return;
    if(thread.some(function(x){return x.id===m.id;}))return;
    thread.push(m);
    thread.sort(function(a,b){return new Date(a.created_at||0)-new Date(b.created_at||0);});
    renderThread();
  }

  async function loadBackend(){
    if(!backend||!backend.ready)return;
    var ok=await backend.ready;
    if(!ok)return;
    backendOn=true;
    liveActive=chat.live===true;
    try{thread=await backend.listChat();}catch(e){thread=[];backendOn=false;}
    if(backendOn){
      unsubscribe=backend.subscribeChat(function(m){addThread(m);},function(state){
        if(state==='SUBSCRIBED'&&statusEl)statusEl.textContent=liveActive?'Conectado al chat en vivo.':'Buzon conectado.';
      });
    }
    render();
    if(statusEl)statusEl.textContent=liveActive?'Conectado al chat en vivo.':'Buzon conectado.';
  }

  async function send(ev){
    ev.preventDefault();
    var ta=document.getElementById('pulso-msg'),t=(ta&&ta.value||'').trim();
    if(!t){if(ta)ta.focus();return;}
    t=t.slice(0,1200);
    if(sendBtn)sendBtn.disabled=true;
    try{
      if(backendOn&&backend){
        var saved=await backend.sendChat(t,liveActive?'live':'async');
        addThread(saved);ta.value='';
        if(statusEl)statusEl.textContent=liveActive?'Mensaje enviado.':'Mensaje guardado en el buzon.';
      }else{
        var a=readLocal();a.push({text:t,ts:new Date().toISOString(),id:idLocal()+'-'+Date.now()});saveLocal(a);ta.value='';renderLocal();
        if(statusEl)statusEl.textContent='Guardado en este navegador.';
      }
    }catch(e){
      var b=readLocal();b.push({text:t,ts:new Date().toISOString(),id:idLocal()+'-'+Date.now()});saveLocal(b);ta.value='';renderLocal();
      if(statusEl)statusEl.textContent='Backend no disponible; guardado en este navegador.';
    }finally{if(sendBtn)sendBtn.disabled=false;}
  }

  render();
  if(backend&&backend.ready)loadBackend();
  window.addEventListener('beforeunload',function(){try{unsubscribe();}catch(e){}});
})();