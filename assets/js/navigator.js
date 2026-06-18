/* ===================================================================
   assets/js/navigator.js  -  Navegador guia permanente (v0.13, aditivo)
   Un riel de progreso SIEMPRE visible que orienta al usuario:
   - Escritorio: riel vertical de puntos a la izquierda, con la seccion
     activa resaltada y las ya recorridas marcadas. La etiqueta activa
     se muestra siempre; al pasar el cursor se revela el indice completo.
   - Movil/tablet: pildora fija abajo  -> "Estas en X / Siguiente: Y".
   Mejora progresiva: si falla, el documento y el menu de arriba siguen
   funcionando perfecto. Zero-backend, sin dependencias.
   =================================================================== */
(function(){
  'use strict';

  /* Orden canonico de las secciones. Solo se muestran las que existan. */
  var SECTIONS=[
    {id:'inicio',     label:'Inicio'},
    {id:'pulso',      label:'Pulso'},
    {id:'porque',     label:'Por que'},
    {id:'proyectos',  label:'Proyectos'},
    {id:'camino',     label:'Camino'},
    {id:'cuentas',    label:'Cuentas'},
    {id:'sumarse',    label:'Sumarse'},
    {id:'fundamentos',label:'Fundamentos'},
    {id:'autor',      label:'Autor'}
  ];
  var items=SECTIONS.filter(function(s){ return document.getElementById(s.id); });
  if(items.length<2) return;

  /* ---------- Riel vertical (escritorio) ---------- */
  var rail=document.createElement('nav');
  rail.className='guide';
  rail.setAttribute('aria-label','Navegador del sitio');
  var ol='<ol class="guide-list">';
  items.forEach(function(s){
    ol+='<li class="guide-item" data-id="'+s.id+'">'+
          '<a class="guide-link" href="#'+s.id+'">'+
            '<span class="guide-dot" aria-hidden="true"></span>'+
            '<span class="guide-label">'+s.label+'</span>'+
          '</a>'+
        '</li>';
  });
  ol+='</ol>';
  rail.innerHTML=ol;
  document.body.appendChild(rail);
  var lis=Array.prototype.slice.call(rail.querySelectorAll('.guide-item'));

  /* ---------- Pildora guia (movil/tablet) ---------- */
  var pill=document.createElement('div');
  pill.className='guide-pill';
  pill.setAttribute('aria-label','Guia de navegacion');
  pill.innerHTML=
    '<button type="button" class="gp-prev" aria-label="Seccion anterior">\u2191</button>'+
    '<div class="gp-now"><span class="gp-k">Estas en</span><span class="gp-t"></span></div>'+
    '<button type="button" class="gp-next">Siguiente <span class="gp-next-t"></span> \u2193</button>';
  document.body.appendChild(pill);
  var nowT=pill.querySelector('.gp-t');
  var nextBtn=pill.querySelector('.gp-next');
  var nextT=pill.querySelector('.gp-next-t');
  var prevBtn=pill.querySelector('.gp-prev');

  function go(id){ var el=document.getElementById(id); if(el) el.scrollIntoView({behavior:'smooth',block:'start'}); }

  var current=-1;
  function setActive(idx){
    if(idx===current) return;
    current=idx;
    lis.forEach(function(li,i){
      li.classList.toggle('active',i===idx);
      li.classList.toggle('done',i<idx);
      var a=li.querySelector('.guide-link');
      if(i===idx){ a.setAttribute('aria-current','true'); } else { a.removeAttribute('aria-current'); }
    });
    if(nowT) nowT.textContent=items[idx].label;
    if(idx<items.length-1){ nextBtn.style.visibility='visible'; nextBtn.dataset.target=items[idx+1].id; if(nextT) nextT.textContent=items[idx+1].label; }
    else { nextBtn.style.visibility='hidden'; }
    if(idx>0){ prevBtn.style.visibility='visible'; prevBtn.dataset.target=items[idx-1].id; }
    else { prevBtn.style.visibility='hidden'; }
  }

  /* Botones de la pildora */
  pill.addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b||!b.dataset.target) return;
    go(b.dataset.target);
  });

  /* Scrollspy: marca la seccion activa segun la posicion en pantalla. */
  var byId={}; items.forEach(function(s,i){ byId[s.id]=i; });
  if('IntersectionObserver' in window){
    var spy=new IntersectionObserver(function(entries){
      var best=null;
      entries.forEach(function(en){
        if(en.isIntersecting){
          if(!best || en.intersectionRatio>best.intersectionRatio) best=en;
        }
      });
      if(best){ var i=byId[best.target.id]; if(i!=null) setActive(i); }
    },{rootMargin:'-45% 0px -50% 0px',threshold:[0,0.01,0.25,0.5]});
    items.forEach(function(s){ var el=document.getElementById(s.id); if(el) spy.observe(el); });
  } else {
    /* Sin IO: estima por scroll. */
    var onScroll=function(){
      var y=(document.documentElement.scrollTop||document.body.scrollTop)+window.innerHeight*0.4;
      var idx=0;
      for(var i=0;i<items.length;i++){ var el=document.getElementById(items[i].id); if(el && el.offsetTop<=y) idx=i; }
      setActive(idx);
    };
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
  }

  setActive(0);
})();
