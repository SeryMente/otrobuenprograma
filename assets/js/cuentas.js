/* ===================================================================
   cuentas.js  -  Cuentas claras: transparencia + donativos (sin backend)
   - El numero CLABE vive estatico en el HTML (visible aunque falle JS).
   - Aqui: copiar CLABE y render del resumen, tablero de necesidades y
     libro mayor a partir de dos archivos versionados en el repo:
       assets/data/necesidades.json  |  assets/data/movimientos.json
   - Robusto: si falla la carga (p.ej. file://), avisa con la ruta.
   =================================================================== */
(function(){
  var fmt;
  try{ fmt=new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN',maximumFractionDigits:2}); }
  catch(e){ fmt={format:function(n){return '$'+(Number(n)||0).toFixed(2);}}; }
  function money(n){ n=Number(n); if(!isFinite(n)) n=0; return fmt.format(n); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function $(id){ return document.getElementById(id); }
  function num(v){ v=Number(v); return isFinite(v)?v:0; }
  function sum(arr,key){ var t=0; (arr||[]).forEach(function(o){ t+=num(o[key]); }); return t; }

  /* ---------- copiar CLABE ---------- */
  function initCopy(){
    var box=document.querySelector('.cc-clabe'); if(!box) return;
    var btn=$('cc-copy'); if(!btn) return;
    btn.addEventListener('click',function(){
      var raw=(box.getAttribute('data-clabe')||'').replace(/\D/g,'');
      if(!raw) return;
      var ok=function(){ var t='Copiar CLABE'; btn.textContent='CLABE copiada'; btn.classList.add('done'); setTimeout(function(){ btn.textContent=t; btn.classList.remove('done'); },2000); };
      var fb=function(){ try{ var ta=document.createElement('textarea'); ta.value=raw; ta.setAttribute('readonly',''); ta.style.position='absolute'; ta.style.left='-9999px'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); ok(); }catch(e){} };
      if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(raw).then(ok,fb); } else fb();
    });
  }

  /* ---------- carga ---------- */
  function load(url){ return fetch(url,{cache:'no-cache'}).then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); }); }

  /* ---------- resumen ---------- */
  function renderResumen(nec,mov){
    var box=$('cuentas-resumen'); if(!box) return;
    var ingresos=sum(mov.ingresos,'monto'), egresos=sum(mov.egresos,'monto'), saldo=ingresos-egresos;
    var lista=nec.necesidades||[];
    var cubiertas=lista.filter(function(n){return n.estado==='cubierta';}).length;
    var stat=function(n,l){ return '<div class="cc-stat"><div class="cc-stat-n">'+n+'</div><div class="cc-stat-l">'+l+'</div></div>'; };
    box.innerHTML=stat(money(ingresos),'Recaudado')+stat(money(egresos),'Gastado, con evidencia')+stat(money(saldo),'Saldo disponible')+stat(cubiertas+' / '+lista.length,'Necesidades cubiertas');
  }

  /* ---------- necesidades ---------- */
  function renderNeeds(nec){
    var box=$('cuentas-necesidades'); if(!box) return;
    var lista=(nec.necesidades||[]).slice();
    if(!lista.length){ box.innerHTML='<p class="cc-empty">Aun no se publican necesidades.</p>'; return; }
    var ord={alta:0,media:1,baja:2};
    lista.sort(function(a,b){ return (ord[a.prioridad]==null?9:ord[a.prioridad])-(ord[b.prioridad]==null?9:ord[b.prioridad]); });
    var html=lista.map(function(n){
      var costo=num(n.costo), rec=num(n.recaudado);
      var pct=costo>0?Math.min(100,Math.round(rec/costo*100)):0;
      var costoTxt=costo>0?money(costo):'Por definir';
      var cat=(n.categoria==='avanzada')?'<span class="cc-tag adv">Avanzada</span>':'<span class="cc-tag bas">Basica</span>';
      var est=esc(n.estado||'pendiente');
      return '<article class="cc-need '+est+'">'+
        '<div class="cc-need-top">'+cat+'<span class="cc-est '+est+'">'+est+'</span></div>'+
        '<h4>'+esc(n.titulo)+'</h4>'+
        (n.descripcion?'<p>'+esc(n.descripcion)+'</p>':'')+
        '<div class="cc-bar"><i style="width:'+pct+'%"></i></div>'+
        '<div class="cc-need-foot"><span>'+money(rec)+' de '+costoTxt+'</span><span>'+(costo>0?pct+'%':'')+'</span></div>'+
      '</article>';
    }).join('');
    box.innerHTML='<div class="cc-needs-grid">'+html+'</div>';
  }

  /* ---------- libro mayor ---------- */
  function renderLedger(mov){
    var box=$('cuentas-libro'); if(!box) return;
    var ing=(mov.ingresos||[]).map(function(o){
      return '<tr><td>'+esc(o.fecha)+'</td><td>'+esc(o.origen||'Anonimo')+'</td><td class="cc-r">'+money(o.monto)+'</td><td>'+esc(o.referencia||'')+'</td></tr>';
    }).join('')||'<tr><td class="cc-none" colspan="4">Aun no se registran ingresos.</td></tr>';
    var egr=(mov.egresos||[]).map(function(o){
      var ev=o.comprobante?'<a href="'+esc(o.comprobante)+'" target="_blank" rel="noopener">ver comprobante</a>':'<span class="cc-pend">pendiente</span>';
      return '<tr><td>'+esc(o.fecha)+'</td><td>'+esc(o.concepto||'')+'</td><td class="cc-r">'+money(o.monto)+'</td><td>'+ev+'</td></tr>';
    }).join('')||'<tr><td class="cc-none" colspan="4">Aun no se registran egresos.</td></tr>';
    box.innerHTML=
      '<div class="cc-ledger-block"><div class="cc-ledger-h">Ingresos</div><div class="cc-table-wrap"><table class="cc-table"><thead><tr><th>Fecha</th><th>Origen</th><th class="cc-r">Monto</th><th>Referencia</th></tr></thead><tbody>'+ing+'</tbody></table></div></div>'+
      '<div class="cc-ledger-block"><div class="cc-ledger-h">Egresos</div><div class="cc-table-wrap"><table class="cc-table"><thead><tr><th>Fecha</th><th>Concepto</th><th class="cc-r">Monto</th><th>Evidencia</th></tr></thead><tbody>'+egr+'</tbody></table></div></div>'+
      (mov.nota?'<p class="cc-ledger-note">'+esc(mov.nota)+'</p>':'');
  }

  function fail(){
    [['cuentas-necesidades','assets/data/necesidades.json'],['cuentas-libro','assets/data/movimientos.json']].forEach(function(p){
      var box=$(p[0]); if(box) box.innerHTML='<p class="cc-empty">No se pudieron cargar los datos ahora. Se pueden consultar directamente en <code>'+p[1]+'</code> dentro del repositorio del proyecto.</p>';
    });
  }

  function init(){
    initCopy();
    if(!$('cuentas-necesidades')&&!$('cuentas-libro')) return;
    Promise.all([load('assets/data/necesidades.json'),load('assets/data/movimientos.json')])
      .then(function(d){ var nec=d[0]||{}, mov=d[1]||{}; renderResumen(nec,mov); renderNeeds(nec); renderLedger(mov); })
      .catch(function(){ fail(); });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
