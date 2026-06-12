/* ===================================================================
   theme.js  -  Cambiador de tema en MODO DEV (update 2, 2026-06-11).
   ADITIVO y progressive enhancement:
   - El publico ve UN solo tema: el de <html data-theme="..."> (o config).
   - No hay UI visible para el visitante normal.
   - El DESARROLLADOR abre el panel con una combinacion de teclas
     (config.theme.devCombo, por defecto Alt+Shift+D) o con la URL
     ...#dev-temas (util en movil sin teclado).
   - Previsualiza cualquier tema en vivo; la eleccion se guarda SOLO en
     este navegador (localStorage), no afecta a nadie mas.
   - "Fijar para publicacion" entrega la unica linea a editar en index.html
     (GitHub Pages es estatico: publicar = commit + push de esa linea).
   =================================================================== */
(function(){
  'use strict';
  var CONF=(window.INSTRUMENT_CONFIG||{});
  var T=(CONF.theme||{});
  var THEMES=T.themes||['cobalto','piedra','marmol','brutalismo','amanecer'];
  var LABELS={cobalto:'Cobalto nocturno',piedra:'Piedra y brasa',marmol:'Marmol y tinta',brutalismo:'Brutalismo sobrio',amanecer:'Acero y amanecer'};
  var root=document.documentElement;
  var PUBLISHED=root.getAttribute('data-theme')||T.published||'cobalto';
  var PREVKEY='instrumento-tema-preview';
  var panel=null;

  function apply(t){ if(t && THEMES.indexOf(t)>=0){ root.setAttribute('data-theme',t); } }
  function current(){ return root.getAttribute('data-theme')||PUBLISHED; }

  // La previsualizacion local ya la aplica un script en <head> (sin parpadeo);
  // re-confirmamos por robustez.
  try{ var p=localStorage.getItem(PREVKEY); if(p) apply(p); }catch(e){}

  /* ---- desbloqueo del modo dev ---- */
  var combo=String(T.devCombo||'alt+shift+d').toLowerCase().split('+');
  var needAlt=combo.indexOf('alt')>=0, needShift=combo.indexOf('shift')>=0,
      needCtrl=combo.indexOf('ctrl')>=0||combo.indexOf('control')>=0,
      needMeta=combo.indexOf('meta')>=0||combo.indexOf('cmd')>=0,
      comboKey=combo[combo.length-1];
  document.addEventListener('keydown',function(e){
    if(!!e.altKey===needAlt && !!e.shiftKey===needShift && !!e.ctrlKey===needCtrl &&
       !!e.metaKey===needMeta && String(e.key||'').toLowerCase()===comboKey){
      e.preventDefault(); toggle();
    }
  });
  var h=String(location.hash||'').toLowerCase();
  if(h==='#dev-temas'||h==='#temas-dev'){ window.addEventListener('load',function(){ setTimeout(open,150); }); }

  function toggle(){ panel?close():open(); }
  function close(){ if(panel){ panel.remove(); panel=null; } }

  function esc(s){ return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  function open(){
    if(panel) return;
    var cur=current();
    panel=document.createElement('div');
    panel.className='temadev';
    panel.setAttribute('role','dialog');
    panel.setAttribute('aria-label','Modo dev: cambiador de temas');
    var opts=THEMES.map(function(t){
      return '<button class="temadev-opt'+(t===cur?' on':'')+'" data-t="'+esc(t)+'">'+
        '<span class="temadev-sw sw-'+esc(t)+'"></span>'+esc(LABELS[t]||t)+
        (t===PUBLISHED?' <em>publicado</em>':'')+'</button>';
    }).join('');
    panel.innerHTML=
      '<div class="temadev-head"><b>Modo dev &middot; Temas</b><button class="temadev-x" aria-label="Cerrar">&times;</button></div>'+
      '<p class="temadev-note">Solo t&uacute; ves esto. Previsualiza un tema en vivo; el p&uacute;blico no cambia hasta que <b>fijes la publicaci&oacute;n</b>.</p>'+
      '<div class="temadev-list">'+opts+'</div>'+
      '<div class="temadev-foot">'+
        '<button class="temadev-fijar">Fijar para publicaci&oacute;n&hellip;</button>'+
        '<button class="temadev-reset">Volver al publicado</button>'+
      '</div>'+
      '<div class="temadev-pub" hidden></div>';
    document.body.appendChild(panel);

    panel.querySelector('.temadev-x').onclick=close;
    Array.prototype.forEach.call(panel.querySelectorAll('.temadev-opt'),function(b){
      b.onclick=function(){ var t=b.getAttribute('data-t'); apply(t); try{localStorage.setItem(PREVKEY,t);}catch(e){} mark(); };
    });
    panel.querySelector('.temadev-reset').onclick=function(){
      try{localStorage.removeItem(PREVKEY);}catch(e){} apply(PUBLISHED); mark();
      var pb=panel.querySelector('.temadev-pub'); pb.hidden=true;
    };
    panel.querySelector('.temadev-fijar').onclick=function(){ showPublish(current()); };
  }

  function mark(){
    if(!panel) return;
    var cur=current();
    Array.prototype.forEach.call(panel.querySelectorAll('.temadev-opt'),function(b){
      b.classList.toggle('on', b.getAttribute('data-t')===cur);
    });
  }

  function showPublish(t){
    var pb=panel.querySelector('.temadev-pub'); pb.hidden=false;
    var tag="<html lang='es' data-theme='"+t+"'>";
    pb.innerHTML='<p>Para publicar <b>'+esc(LABELS[t]||t)+'</b> de cara a todos, haz <u>una</u> edici&oacute;n en <code>index.html</code> y s&uacute;bela (commit + push):</p>'+
      '<pre>'+esc(tag)+'</pre>'+
      '<button class="temadev-copy">Copiar etiqueta</button>'+
      '<p class="temadev-hint">Opcional: en <code>assets/js/config.js</code> deja <code>theme.published:"'+esc(t)+'"</code> para que coincida.</p>';
    var cp=pb.querySelector('.temadev-copy');
    cp.onclick=function(){
      try{ if(navigator.clipboard){ navigator.clipboard.writeText(tag); } }catch(e){}
      cp.textContent='Copiado \u2713'; setTimeout(function(){ cp.textContent='Copiar etiqueta'; },1500);
    };
  }
})();
