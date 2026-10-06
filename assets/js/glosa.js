/* ===================================================================
   Instrumento de comunicacion · Proyecto Vital
   assets/js/glosa.js  ·  v0.8
   1) Comportamientos base de v0.7 (preservados verbatim).
   2) Capa Glosa: anotacion por bloque, ZERO-BACKEND, anonima, local,
      detras de adaptadores (almacenamiento + identidad). Progressive
      enhancement: si esto falla, el documento se lee perfecto.
   =================================================================== */

/* ---------- 1) BASE v0.7 (verbatim) ---------- */
(function(){
  var bar=document.getElementById('bar');
  var toTop=document.getElementById('toTop');
  function onScroll(){
    var h=document.documentElement;
    var max=h.scrollHeight-h.clientHeight;
    var p=max>0?(h.scrollTop||document.body.scrollTop)/max:0;
    if(bar) bar.style.width=(p*100)+'%';
    if(toTop){ if((h.scrollTop||document.body.scrollTop)>600){toTop.classList.add('show');}else{toTop.classList.remove('show');} }
  }
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  if(toTop) toTop.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});

  var reveals=document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    },{rootMargin:'0px 0px -8% 0px',threshold:0.08});
    reveals.forEach(function(el){io.observe(el);});
  } else { reveals.forEach(function(el){el.classList.add('in');}); }

  var navLinks=Array.prototype.slice.call(document.querySelectorAll('.nav a'));
  if('IntersectionObserver' in window && navLinks.length){
    var spy=new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){
          var id='#'+e.target.id;
          navLinks.forEach(function(a){
            var on=a.getAttribute('href')===id;
            a.classList.toggle('active',on);
            if(on){a.setAttribute('aria-current','true');}else{a.removeAttribute('aria-current');}
          });
        }
      });
    },{rootMargin:'-45% 0px -50% 0px', threshold:0});
    navLinks.forEach(function(a){var el=document.querySelector(a.getAttribute('href')); if(el) spy.observe(el);});
  }

  var f=document.getElementById('fecha');
  if(f){ try{ f.textContent=new Date().toLocaleDateString('es-MX',{day:'numeric',month:'long',year:'numeric'}); }catch(err){ f.textContent=new Date().toISOString().slice(0,10); } }
})();

/* ---------- 2) CAPA GLOSA (v0.8, zero-backend) ---------- */
(function(){
  'use strict';
  document.documentElement.classList.add('js');
  var CONF=(window.INSTRUMENT_CONFIG||{});
  var G=(CONF.glosa||{});
  if(G.enabled===false) return;

  /* --- Adaptador de almacenamiento --- */
  var SITE='instrumento-pv-v1';
  var SKEY='glosa:'+SITE;
  function read(){ try{return JSON.parse(localStorage.getItem(SKEY)||'[]');}catch(e){return [];} }
  function persist(a){ try{localStorage.setItem(SKEY,JSON.stringify(a));}catch(e){} }
  var LocalStore={
    name:'local',
    list:function(){ return read(); },
    add:function(rec){ var a=read(); a.push(rec); persist(a); return rec; }
  };
  function pickStore(){
    if(G.storage && G.storage!=='local'){
      console.warn('[glosa] storage="'+G.storage+'" aun no disponible (requiere backend). Uso almacenamiento local.');
    }
    return LocalStore;
  }
  var store=pickStore();

  /* --- Adaptador de identidad --- */
  function anonId(){ var k='glosa-anon-id', v=localStorage.getItem(k); if(!v){ v='anon-'+Math.random().toString(36).slice(2,9); localStorage.setItem(k,v);} return v; }
  var Identity={
    current:function(){ return { id:anonId(), name:((localStorage.getItem('glosa-name')||'').trim()||'Anonimo'), mode:'anon' }; },
    setName:function(n){ localStorage.setItem('glosa-name',(n||'').trim()); }
  };
  if(G.identity && G.identity!=='anon'){ console.warn('[glosa] identity="'+G.identity+'" aun no disponible (requiere backend). Modo anonimo.'); }

  /* --- Anclaje de bloques --- */
  var SELECTOR='.welcome, .summary, section[id] > p.lead, .card, .frame, .ethos, .jewel, .trajectory, .author, .tl-node';
  var byAnchor={};
  function sectionOf(el){ var sec=el.closest('section[id]'); return sec?sec.id:'doc'; }
  function quoteOf(el){ return (el.textContent||'').replace(/\s+/g,' ').trim().slice(0,90); }
  var counters={};
  Array.prototype.slice.call(document.querySelectorAll(SELECTOR)).forEach(function(el){
    if(el.closest('.glosa-panel')) return;
    var sec=sectionOf(el);
    counters[sec]=(counters[sec]||0)+1;
    var anchor=sec+'#'+el.tagName.toLowerCase()+counters[sec];
    el.setAttribute('data-anchor',anchor);
    el.classList.add('glosa-able');
    byAnchor[anchor]={el:el, quote:quoteOf(el)};
  });

  /* --- Utilidades --- */
  function esc(s){ return (s||'').replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c];}); }
  function fmt(iso){ try{ var d=new Date(iso); return d.toLocaleDateString('es-MX',{day:'numeric',month:'short'})+' '+d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}); }catch(e){ return iso; } }
  function notesFor(a){ return store.list().filter(function(r){return r.anchor===a;}); }
  function counts(){ var m={}; store.list().forEach(function(r){ m[r.anchor]=(m[r.anchor]||0)+1; }); return m; }

  /* --- UI --- */
  var panel,backdrop,listEl,ctxEl,formText,nameInput,tabBtn,currentAnchor=null;

  function renderPins(){
    var c=counts();
    document.querySelectorAll('.glosa-pin').forEach(function(p){p.remove();});
    Object.keys(byAnchor).forEach(function(anchor){
      var el=byAnchor[anchor].el; if(!el||!el.isConnected) return;
      var n=c[anchor]||0;
      var b=document.createElement('button');
      b.type='button'; b.className='glosa-pin'+(n>0?' has':'');
      b.setAttribute('aria-label','Glosar este bloque'+(n>0?(' ('+n+' nota'+(n>1?'s':'')+')'):''));
      b.innerHTML='\uFF0B glosar'+(n>0?' <span class="n">'+n+'</span>':'');
      b.addEventListener('click',function(ev){ ev.stopPropagation(); open(anchor); });
      el.appendChild(b);
    });
  }

  function noteHtml(r,orphan){
    return '<div class="glosa-note'+(orphan?' orphan':'')+'">'+
      '<div><span class="who">'+esc(r.author)+'</span><span class="when">'+fmt(r.ts)+'</span></div>'+
      (r.quote?'<div class="q">\u201C'+esc(r.quote)+'\u2026\u201D</div>':'')+
      '<p class="body">'+esc(r.text)+'</p>'+
    '</div>';
  }

  function renderList(){
    var all=store.list();
    var html='';
    if(currentAnchor){
      var meta=byAnchor[currentAnchor];
      ctxEl.innerHTML='Glosando: <b>'+esc(currentAnchor)+'</b>'+(meta?'<br>\u201C'+esc(meta.quote)+'\u2026\u201D':'');
      var ns=notesFor(currentAnchor);
      html+=ns.length?ns.map(function(r){return noteHtml(r);}).join(''):'<div class="glosa-empty">Aun no hay glosas en este bloque. Puedes ser quien la inaugure.</div>';
    } else {
      ctxEl.innerHTML='Todas las glosas del documento ('+all.length+').';
      var live=all.filter(function(r){return byAnchor[r.anchor];});
      var orphan=all.filter(function(r){return !byAnchor[r.anchor];});
      html+= live.length?live.map(function(r){return noteHtml(r);}).join(''):'<div class="glosa-empty">Aun no hay glosas. Pasa el cursor sobre un bloque y pulsa \u00AB\uFF0B glosar\u00BB.</div>';
      if(orphan.length){
        html+='<div class="glosa-sec-title">Glosas sin ancla (preservadas)</div>';
        html+=orphan.map(function(r){return noteHtml(r,true);}).join('');
      }
    }
    listEl.innerHTML=html;
  }

  function submit(){
    var text=(formText.value||'').trim();
    if(!text){ formText.focus(); return; }
    if(text.length>1200) text=text.slice(0,1200);
    Identity.setName(nameInput.value);
    var who=Identity.current();
    var anchor=currentAnchor||'doc#general';
    var meta=byAnchor[anchor];
    store.add({ id:'g-'+Date.now()+'-'+Math.random().toString(36).slice(2,6), anchor:anchor, text:text, author:who.name, authorId:who.id, ts:new Date().toISOString(), quote: meta?meta.quote:'' });
    formText.value='';
    renderList(); renderPins();
  }

  function open(anchor){ currentAnchor=anchor; renderList(); backdrop.classList.add('open'); panel.classList.add('open'); setTimeout(function(){ if(formText) formText.focus(); },120); }
  function close(){ panel.classList.remove('open'); backdrop.classList.remove('open'); }

  function build(){
    backdrop=document.createElement('div'); backdrop.className='glosa-backdrop'; backdrop.addEventListener('click',close);
    panel=document.createElement('aside'); panel.className='glosa-panel'; panel.setAttribute('role','dialog'); panel.setAttribute('aria-modal','true'); panel.setAttribute('aria-label','Glosa: comentarios');
    panel.innerHTML=
      '<header><h4>Glosa</h4><button class="glosa-x" aria-label="Cerrar">\u00D7</button></header>'+
      '<div class="glosa-scroll">'+
        '<div class="glosa-banner"><b>Modo local (sin backend).</b> Tus glosas se guardan solo en este navegador. Cuando se encienda el backend y el inicio de sesion, se sincronizaran y se compartiran &mdash; sin tocar la interfaz.<br>Anonimo + anti-spam &middot; Google/Facebook: proximamente.</div>'+
        '<div class="glosa-id"><input type="text" id="glosa-name" placeholder="Tu nombre (opcional)" maxlength="40" aria-label="Tu nombre"><div class="glosa-oauth"><button type="button" disabled title="Requiere backend">Google</button><button type="button" disabled title="Requiere backend">Facebook</button></div></div>'+
        '<div class="glosa-ctx" id="glosa-ctx"></div>'+
        '<div id="glosa-list"></div>'+
      '</div>'+
      '<div class="glosa-form">'+
        '<textarea id="glosa-text" placeholder="Escribe tu glosa\u2026" aria-label="Texto de la glosa"></textarea>'+
        '<div class="row"><span class="hint">Se amable. La moderacion llega con el backend.</span><button type="button" class="send">Publicar</button></div>'+
      '</div>';
    document.body.appendChild(backdrop); document.body.appendChild(panel);
    listEl=panel.querySelector('#glosa-list');
    ctxEl=panel.querySelector('#glosa-ctx');
    formText=panel.querySelector('#glosa-text');
    nameInput=panel.querySelector('#glosa-name');
    nameInput.value=(localStorage.getItem('glosa-name')||'');
    nameInput.addEventListener('change',function(){ Identity.setName(nameInput.value); });
    panel.querySelector('.glosa-x').addEventListener('click',close);
    panel.querySelector('.send').addEventListener('click',submit);
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&panel.classList.contains('open')) close(); });

    tabBtn=document.createElement('button'); tabBtn.type='button'; tabBtn.className='glosa-tab'; tabBtn.textContent='Glosa'; tabBtn.setAttribute('aria-label','Abrir todas las glosas');
    tabBtn.addEventListener('click',function(){ open(null); });
    document.body.appendChild(tabBtn);
  }

  build();
  renderPins();
})();
