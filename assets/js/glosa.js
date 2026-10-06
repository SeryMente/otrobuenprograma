/* ===================================================================
   Instrumento de comunicacion · Proyecto Vital
   assets/js/glosa.js · v0.9 + F4
   Glosa: anotacion por bloque, anonima, con almacenamiento local de
   respaldo y adaptador Supabase cuando el backend esta configurado.
   =================================================================== */

/* ---------- 1) BASE v0.7 (verbatim) ---------- */
(function(){
  var bar=document.getElementById('bar');
  var toTop=document.getElementById('toTop');
  function onScroll(){ var h=document.documentElement; var max=h.scrollHeight-h.clientHeight; var p=max>0?(h.scrollTop||document.body.scrollTop)/max:0; if(bar) bar.style.width=(p*100)+'%'; if(toTop){ if((h.scrollTop||document.body.scrollTop)>600){toTop.classList.add('show');}else{toTop.classList.remove('show');} } }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  if(toTop) toTop.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
  var reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){ var io=new IntersectionObserver(function(entries){ entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{rootMargin:'0px 0px -8% 0px',threshold:0.08}); reveals.forEach(function(el){io.observe(el);}); } else { reveals.forEach(function(el){el.classList.add('in');}); }
  var navLinks=Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  if('IntersectionObserver' in window && navLinks.length){ var spy=new IntersectionObserver(function(entries){ entries.forEach(function(e){ if(e.isIntersecting){ var id='#'+e.target.id; navLinks.forEach(function(a){ var on=a.getAttribute('href')===id; a.classList.toggle('active',on); if(on){a.setAttribute('aria-current','true');}else{a.removeAttribute('aria-current');} }); } }); },{rootMargin:'-45% 0px -50% 0px', threshold:0}); navLinks.forEach(function(a){var el=document.querySelector(a.getAttribute('href')); if(el) spy.observe(el);}); }
  var f=document.getElementById('fecha');
  if(f){ try{ f.textContent=new Date().toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'}); }catch(err){ f.textContent=new Date().toISOString().slice(0,10); } }
})();

/* ---------- 2) CAPA GLOSA ---------- */
(function(){
  'use strict';
  document.documentElement.classList.add('js');
  var CONF=(window.INSTRUMENT_CONFIG||{});
  var G=(CONF.glosa||{});
  if(G.enabled===false) return;

  var SITE='instrumento-pv-v1';
  var SKEY='glosa:'+SITE;
  var SYNCKEY='glosa:remote-synced-v1';

  function readLocal(){ try{return JSON.parse(localStorage.getItem(SKEY)||'[]');}catch(e){return [];} }
  function persistLocal(a){ try{localStorage.setItem(SKEY,JSON.stringify(a));}catch(e){} }
  function readSynced(){ try{return JSON.parse(localStorage.getItem(SYNCKEY)||'[]');}catch(e){return [];} }
  function persistSynced(a){ try{localStorage.setItem(SYNCKEY,JSON.stringify(a));}catch(e){} }

  var LocalStore={
    name:'local',
    list:function(){ return readLocal(); },
    add:function(rec){ var a=readLocal(); a.push(rec); persistLocal(a); return rec; }
  };

  var backend=window.INSTRUMENT_BACKEND||null;
  var remoteOn=false;
  var remoteItems=null;
  var statusEl=null;

  function all(){ return remoteOn && remoteItems ? remoteItems : LocalStore.list(); }

  async function refreshRemote(){
    if(!remoteOn || !backend) return;
    try{
      remoteItems=await backend.listGlosas();
      renderList(); renderPins();
    }catch(e){
      remoteOn=false;
      if(statusEl){statusEl.textContent='No se pudo leer la comunidad; se mantiene el respaldo local.';}
    }
  }

  async function syncLocal(){
    if(!remoteOn || !backend) return;
    var synced=readSynced();
    var changed=false;
    for(const rec of LocalStore.list()){
      if(synced.indexOf(rec.id)>=0) continue;
      try{
        await backend.addGlosa(rec);
        synced.push(rec.id);
        changed=true;
      }catch(e){
        /* Duplicados o errores transitorios no rompen la lectura local. */
      }
    }
    if(changed) persistSynced(synced);
  }

  var Identity={
    current:function(){
      var id;
      try{
        id=localStorage.getItem('glosa-anon-id');
        if(!id){id='anon-'+Math.random().toString(36).slice(2,9);localStorage.setItem('glosa-anon-id',id);}
      }catch(e){id='anon-local';}
      var name='';
      try{name=(localStorage.getItem('glosa-name')||'').trim();}catch(e){}
      return { id:id, name:name||'Anonimo', mode:'anon' };
    },
    setName:function(n){ try{localStorage.setItem('glosa-name',(n||'').trim());}catch(e){} }
  };

  var SELECTOR='.welcome, .summary, section[id] > p.lead, .card, .frame, .ethos, .jewel, .trajectory, .author, .tl-node';
  var byAnchor={};
  function sectionOf(el){ var sec=el.closest('section[id]'); return sec?sec.id:'doc'; }
  function quoteOf(el){ return (el.textContent||'').replace(/\s+/g,' ').trim().slice(0,90); }
  var counters={};
  Array.prototype.slice.call(document.querySelectorAll(SELECTOR)).forEach(function(el){
    if(el.closest('.glosa-panel')) return;
    var sec=sectionOf(el); counters[sec]=(counters[sec]||0)+1;
    var anchor=sec+'#'+el.tagName.toLowerCase()+counters[sec];
    el.setAttribute('data-anchor',anchor); el.classList.add('glosa-able'); byAnchor[anchor]={el:el, quote:quoteOf(el)};
  });

  function esc(s){ return (s||'').replace(/[&<>\\\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\\\"':'&quot;'}[c];}); }
  function fmt(iso){ try{ var d=new Date(iso); return d.toLocaleDateString('es-MX',{day:'numeric',month:'short'})+' '+d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}); }catch(e){ return iso||''; } }
  function normalized(r){ return {id:r.id||r.client_id,anchor:r.anchor,text:r.text,author:r.author||'Anonimo',authorId:r.authorId||r.author_id,ts:r.ts||r.created_at,quote:r.quote||''}; }
  function notesFor(a){ return all().filter(function(r){return r.anchor===a;}); }
  function counts(){ var m={}; all().forEach(function(r){ m[r.anchor]=(m[r.anchor]||0)+1; }); return m; }

  var panel,backdrop,listEl,ctxEl,formText,nameInput,tabBtn,sendBtn,currentAnchor=null;

  function renderPins(){
    var c=counts();
    document.querySelectorAll('.glosa-pin').forEach(function(p){p.remove();});
    Object.keys(byAnchor).forEach(function(anchor){
      var el=byAnchor[anchor].el; if(!el||!el.isConnected) return;
      var n=c[anchor]||0; var b=document.createElement('button');
      b.type='button'; b.className='glosa-pin'+(n>0?' has':'');
      b.setAttribute('aria-label','Glosar este bloque'+(n>0?(' ('+n+' nota'+(n>1?'s':'')+')'):''));
      b.innerHTML='＋ glosar'+(n>0?' <span class="n">'+n+'</span>':'');
      b.addEventListener('click',function(ev){ev.stopPropagation();open(anchor);});
      el.appendChild(b);
    });
  }

  function noteHtml(raw,orphan){
    var r=normalized(raw);
    return '<div class="glosa-note'+(orphan?' orphan':'')+'">'+
      '<div><span class="who">'+esc(r.author)+'</span><span class="when">'+fmt(r.ts)+'</span></div>'+
      (r.quote?'<div class="q">“'+esc(r.quote)+'…”</div>':'')+
      '<p class="body">'+esc(r.text)+'</p></div>';
  }

  function renderList(){
    var allItems=all(); var html='';
    if(currentAnchor){
      var meta=byAnchor[currentAnchor];
      ctxEl.innerHTML='Glosando: <b>'+esc(currentAnchor)+'</b>'+(meta?'<br>“'+esc(meta.quote)+'…”':'');
      var ns=notesFor(currentAnchor);
      html+=ns.length?ns.map(function(r){return noteHtml(r);}).join(''):'<div class="glosa-empty">Aun no hay glosas en este bloque. Puedes ser quien la inaugure.</div>';
    }else{
      ctxEl.innerHTML=(remoteOn?'Todas las glosas compartidas':'Todas las glosas de este navegador')+' ('+allItems.length+').';
      var live=allItems.filter(function(r){return byAnchor[r.anchor];});
      var orphan=allItems.filter(function(r){return !byAnchor[r.anchor];});
      html+=live.length?live.map(function(r){return noteHtml(r);}).join(''):'<div class="glosa-empty">Aun no hay glosas. Pasa el cursor sobre un bloque y pulsa «＋ glosar».</div>';
      if(orphan.length){ html+='<div class="glosa-sec-title">Glosas sin ancla (preservadas)</div>'+orphan.map(function(r){return noteHtml(r,true);}).join(''); }
    }
    listEl.innerHTML=html;
  }

  async function submit(){
    var text=(formText.value||'').trim(); if(!text){formText.focus();return;}
    if(text.length>1200) text=text.slice(0,1200);
    Identity.setName(nameInput.value);
    var who=Identity.current();
    var anchor=currentAnchor||'doc#general'; var meta=byAnchor[anchor];
    var rec={id:'g-'+Date.now()+'-'+Math.random().toString(36).slice(2,6),anchor:anchor,text:text,author:who.name,authorId:who.id,ts:new Date().toISOString(),quote:meta?meta.quote:''};
    if(sendBtn) sendBtn.disabled=true;
    try{
      if(remoteOn && backend){
        var saved=await backend.addGlosa(rec);
        if(!remoteItems) remoteItems=[];
        remoteItems.push(saved);
        LocalStore.add(rec);
        formText.value='';
        if(statusEl) statusEl.textContent='Publicada para la comunidad.';
      }else{
        LocalStore.add(rec);
        formText.value='';
        if(statusEl) statusEl.textContent='Guardada en este navegador.';
      }
      renderList(); renderPins();
    }catch(e){
      LocalStore.add(rec);
      formText.value='';
      if(statusEl) statusEl.textContent='Backend no disponible; guardada en este navegador.';
      renderList(); renderPins();
    }finally{
      if(sendBtn) sendBtn.disabled=false;
    }
  }

  function open(anchor){currentAnchor=anchor;renderList();backdrop.classList.add('open');panel.classList.add('open');setTimeout(function(){if(formText)formText.focus();},120);}
  function close(){panel.classList.remove('open');backdrop.classList.remove('open');}

  function setBanner(connected){
    if(!statusEl) return;
    if(connected) statusEl.textContent='Comunidad conectada: las glosas se comparten.';
    else statusEl.textContent='Modo local: tus glosas viven en este navegador hasta conectar el backend.';
  }

  function build(){
    backdrop=document.createElement('div'); backdrop.className='glosa-backdrop'; backdrop.addEventListener('click',close);
    panel=document.createElement('aside'); panel.className='glosa-panel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','true'); panel.setAttribute('aria-label','Glosa: comentarios');
    panel.innerHTML=
      '<header><h4>Glosa</h4><button class="glosa-x" aria-label="Cerrar">×</button></header>'+
      '<div class="glosa-scroll">'+
        '<div class="glosa-banner"><b id="glosa-status">Modo local</b><span class="glosa-state">Tus glosas se guardan en este navegador hasta conectar el backend.</span><br>Anonimo + anti-spam · identidad social: fuera de F4.</div>'+
        '<div class="glosa-id"><input type="text" id="glosa-name" placeholder="Tu nombre (opcional)" maxlength="40" aria-label="Tu nombre"><div class="glosa-oauth"><button type="button" disabled title="Fuera de F4">Google</button><button type="button" disabled title="Fuera de F4">Facebook</button></div></div>'+
        '<div class="glosa-ctx" id="glosa-ctx"></div>'+
        '<div id="glosa-list"></div>'+
      '</div>'+
      '<div class="glosa-form"><textarea id="glosa-text" placeholder="Escribe tu glosa…" aria-label="Texto de la glosa"></textarea><div class="row"><span class="hint">Se amable. La moderacion avanzada llega despues.</span><button type="button" class="send">Publicar</button></div></div>';
    document.body.appendChild(backdrop); document.body.appendChild(panel);
    listEl=panel.querySelector('#glosa-list'); ctxEl=panel.querySelector('#glosa-ctx'); formText=panel.querySelector('#glosa-text'); nameInput=panel.querySelector('#glosa-name'); sendBtn=panel.querySelector('.send');
    statusEl=panel.querySelector('.glosa-state'); nameInput.value=(localStorage.getItem('glosa-name')||'');
    nameInput.addEventListener('change',function(){Identity.setName(nameInput.value);});
    panel.querySelector('.glosa-x').addEventListener('click',close); sendBtn.addEventListener('click',submit);
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&panel.classList.contains('open'))close();});
    tabBtn=document.createElement('button'); tabBtn.type='button'; tabBtn.className='glosa-tab'; tabBtn.textContent='Glosa'; tabBtn.setAttribute('aria-label','Abrir todas las glosas'); tabBtn.addEventListener('click',function(){open(null);}); document.body.appendChild(tabBtn);
  }

  build();
  renderPins();
  renderList();
  if(backend && backend.ready){
    backend.ready.then(async function(ok){
      if(!ok) return;
      remoteOn=true;
      setBanner(true);
      await syncLocal();
      await refreshRemote();
    });
  }
})();