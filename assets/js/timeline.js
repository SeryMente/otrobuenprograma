/* ===================================================================
   assets/js/timeline.js  -  Linea de tiempo viva (v0.9)
   Render SINCRONO desde JSON inline (#tl-data) -> offline-trivial y
   disponible antes de glosa.js (que correra despues y anclara cada nodo).
   Progressive enhancement: el <noscript> ya muestra una lista legible;
   si algo falla, no se toca nada de lo que ya existe.
   =================================================================== */
(function(){
  'use strict';
  var CONF=(window.INSTRUMENT_CONFIG||{});
  var T=(CONF.timeline||{});
  if(T.enabled===false) return;
  var mount=document.getElementById('tl-mount');
  if(!mount) return;

  function getData(){
    try{
      var node=document.getElementById('tl-data');
      if(node) return JSON.parse(node.textContent);
    }catch(e){ console.warn('[timeline] no se pudo leer #tl-data',e); }
    return null;
  }
  var data=getData();
  if(!data||!data.hilos){ return; } // el <noscript> / fallback se queda

  var BADGE={hecho:{c:'ok',t:'Hecho'},encurso:{c:'now',t:'En curso'},porvenir:{c:'next',t:'Por venir'}};
  function esc(s){ return (s||'').replace(/[&<>\"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c];}); }
  function badge(estado){ var b=BADGE[estado]||BADGE.porvenir; return '<span class="tl-badge '+b.c+'">'+b.t+'</span>'; }

  function subHtml(sub){
    if(!sub||!sub.length) return '';
    return '<ul class="tl-sub">'+sub.map(function(s){
      return '<li class="'+(s.estado||'')+'"><span class="tl-sub-k">'+esc(s.k)+'</span> '+esc(s.t)+'</li>';
    }).join('')+'</ul>';
  }

  function nodeHtml(h){
    var html='<article class="tl-node" data-tl="'+h.n+'">';
    html+='<div class="tl-dot '+( (BADGE[h.estado]||{}).c )+'"></div>';
    html+='<div class="tl-card">';
    html+='<div class="tl-head"><span class="tl-n">'+(h.n<10?'0'+h.n:h.n)+'</span>'+badge(h.estado)+'<span class="tl-date">'+esc(h.fecha||'')+'</span></div>';
    if(h.fase) html+='<div class="tl-fase">'+esc(h.fase)+'</div>';
    html+='<h3 class="tl-title">'+esc(h.titulo)+'</h3>';
    if(h.detalle) html+='<p class="tl-detalle">'+esc(h.detalle)+'</p>';
    html+=subHtml(h.sub);
    if(h.sentido) html+='<p class="tl-sentido"><span>Sentido</span> '+esc(h.sentido)+'</p>';
    if(h.evidenciaViva) html+='<p class="tl-evidencia">'+esc(h.evidenciaViva)+'</p>';
    html+='</div></article>';
    return html;
  }

  function hiloHtml(hilo){
    var html='<div class="tl-hilo" data-hilo="'+esc(hilo.id)+'">';
    html+='<div class="tl-hilo-head"><span class="tl-hilo-tipo">'+(hilo.tipo==='persona'?'Persona':'Proyecto')+'</span><h3>'+esc(hilo.nombre)+'</h3></div>';
    if(hilo.origen) html+='<p class="tl-origen">'+esc(hilo.origen)+'</p>';
    html+='<div class="tl-line">'+hilo.hitos.map(nodeHtml).join('')+'</div>';
    html+='</div>';
    return html;
  }

  var out='';
  data.hilos.forEach(function(h){ out+=hiloHtml(h); });
  mount.innerHTML=out;
  mount.classList.add('tl-ready');

  // Filtros por estado (mejora; sin JS la lista completa se ve igual)
  var bar=document.getElementById('tl-filters');
  if(bar){
    bar.addEventListener('click',function(ev){
      var b=ev.target.closest('button[data-f]'); if(!b) return;
      var f=b.getAttribute('data-f');
      bar.querySelectorAll('button').forEach(function(x){x.classList.toggle('on',x===b);});
      mount.querySelectorAll('.tl-node').forEach(function(n){
        var dot=n.querySelector('.tl-dot');
        var cls=dot?dot.className:'';
        var show = f==='all' || cls.indexOf(f)>-1;
        n.style.display=show?'':'none';
      });
    });
  }
})();
