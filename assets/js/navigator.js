/* ===================================================================
   assets/js/navigator.js · v1.6.0
   Desktop: riel vertical de progreso.
   Mobile: responsabilidad delegada al shell superior y al relato.
   =================================================================== */
(function(){
  'use strict';
  var SECTIONS=[{id:'inicio',label:'Inicio'},{id:'pulso',label:'Pulso'},{id:'porque',label:'Por que'},{id:'proyectos',label:'Proyectos'},{id:'camino',label:'Camino'},{id:'cuentas',label:'Cuentas'},{id:'sumarse',label:'Sumarse'},{id:'fundamentos',label:'Fundamentos'},{id:'autor',label:'Autor'}];
  var items=SECTIONS.filter(function(s){return document.getElementById(s.id);});
  if(items.length<2)return;
  var rail=document.createElement('nav');rail.className='guide';rail.setAttribute('aria-label','Navegador del sitio');
  var ol='<ol class="guide-list">';
  items.forEach(function(s){ol+='<li class="guide-item" data-id="'+s.id+'"><a class="guide-link" href="#'+s.id+'"><span class="guide-dot" aria-hidden="true"></span><span class="guide-label">'+s.label+'</span></a></li>';});
  ol+='</ol>';rail.innerHTML=ol;document.body.appendChild(rail);
  var lis=Array.prototype.slice.call(rail.querySelectorAll('.guide-item')),current=-1;
  function setActive(idx){if(idx===current)return;current=idx;lis.forEach(function(li,i){li.classList.toggle('active',i===idx);li.classList.toggle('done',i<idx);var a=li.querySelector('.guide-link');if(i===idx)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});}
  var byId={};items.forEach(function(s,i){byId[s.id]=i;});
  if('IntersectionObserver' in window){
    var spy=new IntersectionObserver(function(entries){var best=null;entries.forEach(function(en){if(en.isIntersecting&&(!best||en.intersectionRatio>best.intersectionRatio))best=en;});if(best&&byId[best.target.id]!=null)setActive(byId[best.target.id]);},{rootMargin:'-45% 0px -50% 0px',threshold:[0,0.01,0.25,0.5]});
    items.forEach(function(s){var el=document.getElementById(s.id);if(el)spy.observe(el);});
  }else{
    window.addEventListener('scroll',function(){var y=(document.documentElement.scrollTop||document.body.scrollTop)+window.innerHeight*.4,idx=0;for(var i=0;i<items.length;i++){var el=document.getElementById(items[i].id);if(el&&el.offsetTop<=y)idx=i;}setActive(idx);},{passive:true});
  }
  setActive(0);
})();