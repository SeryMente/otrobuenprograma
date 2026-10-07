(function(){
'use strict';
var mount=document.getElementById('relato-sonoro');if(!mount)return;
var V='v1.6.2-20261006';
var ROOT=(location.hostname==='serymente.github.io')?'/otrobuenprograma/':'/';
var MOBILE=window.matchMedia&&window.matchMedia('(max-width:820px)').matches;
var URL_DATA=ROOT+'assets/data/relato-obp-phase3.json';
var VIS=[['welcome','Escuchar antes de interpretar'],['currents','Lo que ya existe y lo que se abre'],['relationship','La relación como campo'],['forgiveness','Perdón como práctica'],['scale','Una posición distinta'],['inclusion','Una pertenencia más amplia'],['dabrowski','Conflicto y desarrollo'],['structures','Cuando la estructura resiste'],['minds','Dos respuestas posibles'],['closing','Una propuesta que se integra']];
var STORY_TITLE="una iniciativa para revolucionar la manera en la que aliviaremos la disfunción familiar para nuestros hijos y sus hijos también.";
function esc(v){return String(v==null?'':v).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function fmt(t){t=Number(t);if(!Number.isFinite(t)||t<0)return'0:00';var s=Math.round(t);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');}
function asset(path){return ROOT+String(path||'').replace(/^\/+/,'');}
function art(k,title,id){
var W='#f7fbff',P='#b7caf2',A='#efb45f',B='#24499d',D='#0e1832',body;
if(k==='relationship')body='<g stroke="'+P+'" stroke-width="3" opacity=".72"><path d="M90 120 220 70l100 130 120-85 90 105-78 120-142-45-112 88z"/><path d="m220 70-10 310m110-180 120 135M90 120l28 260"/></g><circle class="art-pulse" cx="320" cy="200" r="48" fill="none" stroke="'+A+'" stroke-width="4"/>';
else if(k==='forgiveness')body='<circle cx="220" cy="210" r="72" fill="'+W+'" opacity=".10"/><circle cx="380" cy="210" r="72" fill="'+A+'" opacity=".18"/><path class="art-draw" d="M140 214C190 160 225 165 265 214s75 52 115 0 70-49 80 0" fill="none" stroke="'+W+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="620" stroke-dashoffset="620"/>';
else if(k==='scale')body='<g fill="'+W+'" opacity=".9"><path d="M95 325h54v-55H95z"/><path d="M165 325h68v-96h-68z"/><path d="M250 325h80V175h-80z"/><path d="M348 325h100V120H348z"/><path d="M466 325h44V78h-44z"/></g><path class="art-draw" d="M70 345H528" stroke="'+A+'" stroke-width="6" stroke-linecap="round" stroke-dasharray="458" stroke-dashoffset="458"/>';
else if(k==='inclusion')body='<g stroke="'+P+'" stroke-width="3" opacity=".65"><path d="M300 75v260"/><path d="M170 205h260"/><path d="M208 113l184 184"/><path d="m392 113-184 184"/></g><circle class="art-pulse" cx="300" cy="205" r="54" fill="none" stroke="'+A+'" stroke-width="4"/>';
else if(k==='dabrowski')body='<path class="art-draw" d="M300 345V85m0 52-82-43m82 88 92-55M300 220l-108 73m108-44 111 65" fill="none" stroke="'+W+'" stroke-width="7" stroke-linecap="round" stroke-dasharray="460" stroke-dashoffset="460"/><circle cx="300" cy="220" r="21" fill="'+A+'"/>';
else if(k==='structures')body='<path d="M105 238h390" stroke="'+W+'" opacity=".18" stroke-width="2"/><path class="art-draw" d="M300 118v184" stroke="'+A+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="184" stroke-dashoffset="184"/><circle cx="300" cy="210" r="54" fill="'+W+'" opacity=".08" stroke="'+A+'" stroke-width="3"/>';
else if(k==='minds')body='<circle cx="190" cy="216" r="76" fill="'+W+'" opacity=".16"/><circle cx="410" cy="216" r="76" fill="'+A+'" opacity=".20"/><path d="M262 216h76" stroke="'+W+'" stroke-width="4" stroke-dasharray="12 10"/>';
else if(k==='closing')body='<path d="M64 318C146 246 192 316 255 261s91-84 142-20 86 22 143-42" fill="none" stroke="'+W+'" opacity=".78" stroke-width="5"/><circle class="art-pulse" cx="257" cy="262" r="45" fill="none" stroke="'+A+'" stroke-width="3"/><circle cx="257" cy="262" r="12" fill="'+A+'"/>';
else if(k==='currents')body='<path d="M-20 128C108 52 215 203 344 124S529 70 620 126" fill="none" stroke="'+W+'" opacity=".12" stroke-width="54"/><path class="art-draw" d="M-10 304C126 235 215 359 347 284S531 224 616 307" fill="none" stroke="'+A+'" stroke-width="17" stroke-linecap="round" stroke-dasharray="790" stroke-dashoffset="790"/><circle class="art-float" cx="438" cy="277" r="23" fill="'+W+'"/>';
else body='<circle class="art-pulse" cx="300" cy="210" r="118" fill="none" stroke="'+A+'" stroke-width="2"/><circle cx="300" cy="210" r="82" fill="'+W+'" opacity=".08"/><path d="M198 224c30-54 69-82 113-82 54 0 91 26 111 78" fill="none" stroke="'+W+'" stroke-width="5" stroke-linecap="round"/><circle cx="224" cy="250" r="30" fill="'+W+'" opacity=".86"/><circle cx="376" cy="250" r="30" fill="'+W+'" opacity=".46"/><path d="M246 256h108" stroke="'+A+'" stroke-width="5" stroke-linecap="round"/>';
var words=k==='relationship'?'la relación':k==='forgiveness'?'perdón':k==='scale'?'MÁS NO DUAL':k==='minds'?'DOS RESPUESTAS':k==='dabrowski'?'conflicto moral':k==='closing'?'reconocer · comprender · integrar':'';
return '<svg viewBox="0 0 600 430" role="img" aria-label="'+esc(title)+'"><defs><linearGradient id="g'+esc(id)+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+B+'"/><stop offset="1" stop-color="'+D+'"/></linearGradient></defs><rect width="600" height="430" fill="url(#g'+esc(id)+')"/>'+body+(words?'<text x="300" y="385" text-anchor="middle" fill="'+W+'" font-family="Georgia" font-size="26">'+esc(words)+'</text>':'')+'</svg><div class="story-art-title">'+esc(title)+'</div>';
}
function buildRail(segs){
var groups={},order=[];
segs.forEach(function(s){var phase=String(s.phase||'');if(!groups[phase]){groups[phase]=[];order.push(phase);}groups[phase].push(s);});
order.sort(function(a,b){return Number(groups[a][0].id)-Number(groups[b][0].id);});
if(order.length!==5)throw new Error('El roadmap requiere cinco etapas.');
order.forEach(function(p){groups[p].sort(function(a,b){return Number(a.id)-Number(b.id);});if(groups[p].length!==4)throw new Error('Cada etapa requiere cuatro segmentos.');});
var html='<nav class="story-micro-rail" aria-label="Roadmap y controles de la experiencia"><div class="story-micro-controls" aria-label="Controles de audio"><button class="story-micro-prev" type="button" aria-label="Fragmento anterior" title="Anterior">←</button><button class="story-micro-play" type="button" aria-label="Reproducir" title="Reproducir" aria-controls="relato-sonoro">▶</button><button class="story-micro-next" type="button" aria-label="Siguiente fragmento" title="Siguiente">→</button></div><div class="story-micro-progress" role="progressbar" aria-label="Progreso del fragmento" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div><div class="story-micro-meta"><span class="story-micro-time">0:00</span><span class="story-micro-status" role="status" aria-live="polite">Preparando…</span></div><ol>';
order.forEach(function(p){var items=groups[p];html+='<li class="story-micro-phase" data-phase="'+esc(p)+'"><button class="story-micro-phase-label" type="button" data-segment="'+esc(items[0].id)+'" aria-label="Sección '+esc(p)+', segmento '+esc(items[0].id)+'">'+esc(p)+'</button><div class="story-micro-segments">';items.forEach(function(s){html+='<button class="story-micro-segment" type="button" data-segment="'+esc(s.id)+'" aria-label="Segmento '+esc(s.id)+', sección '+esc(p)+'"><span aria-hidden="true"></span></button>';});html+='</div></li>';});
html+='</ol><button class="story-micro-play" type="button" aria-label="Reproducir" title="Reproducir" aria-controls="relato-sonoro">▶</button></nav>';return html;
}
function render(data){
var segs=(data.segments||[]).slice().sort(function(a,b){return Number(a.id)-Number(b.id);});
if(segs.length!==20)throw new Error('No se pudo preparar el relato.');
mount.innerHTML='<div class="story-rail">'+segs.map(function(s,i){var v=VIS[Math.floor(i/2)];return '<article class="story-stop" id="story-stop-'+esc(s.id)+'" data-segment="'+esc(s.id)+'"><div class="story-copy"><h2>'+esc(s.title)+'</h2><p class="story-transcript" aria-label="Texto hablado">'+s.words.map(function(w,j){return '<button class="story-word" type="button" data-segment="'+esc(s.id)+'" data-word="'+j+'">'+esc(w.word)+'</button> ';}).join('')+'</p></div><div class="story-art">'+art(v[0],v[1],s.id)+'</div><div class="story-segment-meta"><button type="button" data-play-segment="'+esc(s.id)+'">Escuchar este fragmento</button></div></article>';}).join('')+'</div>'+buildRail(segs)+'<button class="story-return-overlay" type="button" hidden>Volver a la narración</button><audio class="story-audio" preload="auto" playsinline></audio><div class="obp-qr-autoplay-hint" role="status">El sonido está listo. Este navegador necesita un toque para comenzar.<button type="button">Iniciar experiencia</button></div>';
var audio=mount.querySelector('.story-audio'),prev=mount.querySelector('.story-micro-prev'),next=mount.querySelector('.story-micro-next'),play=mount.querySelector('.story-micro-play'),microProgress=mount.querySelector('.story-micro-progress'),microTime=mount.querySelector('.story-micro-time'),status=mount.querySelector('.story-micro-status'),hint=mount.querySelector('.obp-qr-autoplay-hint'),rail=mount.querySelector('.story-micro-rail'),returnOverlay=mount.querySelector('.story-return-overlay');
var cards=[].slice.call(mount.querySelectorAll('.story-stop')),railPhaseButtons=[].slice.call(mount.querySelectorAll('.story-micro-phase-label')),railSegmentButtons=[].slice.call(mount.querySelectorAll('.story-micro-segment'));
var cur=0,widx=-1,follow=true,advance=true,playing=false,manual=0,lastScroll=0,gestureRecovery=false,suppressFollowUntil=0,scrollY0=window.scrollY||0,scrollT0=Date.now(),intenseOverlayTimer=0,rafId=0,lastPaintedWord=-2;window.__ogpSyncDiagnostics={version:'v1.7.0-20261007',transitions:[],frames:0,currentWord:-1};
audio.preload='auto';audio.autoplay=true;audio.setAttribute('autoplay','');
function current(){return segs[cur];}
function syncMicroPlay(){if(!play)return;play.textContent=playing?'Ⅱ':'▶';play.setAttribute('aria-label',playing?'Pausar':'Reproducir');play.title=playing?'Pausar':'Reproducir';}
function hideReturnOverlay(){if(!returnOverlay)return;returnOverlay.hidden=true;if(intenseOverlayTimer){clearTimeout(intenseOverlayTimer);intenseOverlayTimer=0;}}
function showReturnOverlay(){if(!returnOverlay||!playing||!follow)return;returnOverlay.hidden=false;if(intenseOverlayTimer)clearTimeout(intenseOverlayTimer);intenseOverlayTimer=setTimeout(function(){returnOverlay.hidden=true;intenseOverlayTimer=0;},7000);}
function releaseFollowForMotion(intense){var nowTs=Date.now();manual=nowTs+(intense?1100:650);suppressFollowUntil=nowTs+(intense?5000:900);if(intense)showReturnOverlay();}
function returnToNarration(){if(!returnOverlay)return;hideReturnOverlay();suppressFollowUntil=0;manual=Date.now()+900;var target=widx>=0?cards[cur].querySelector('[data-word="'+widx+'"]'):null;if(!target)target=cards[cur];if(target)target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'center'});}
function clearGestureRecovery(){if(!gestureRecovery)return;gestureRecovery=false;document.removeEventListener('pointerdown',recoverFromGesture,true);document.removeEventListener('touchstart',recoverFromGesture,true);document.removeEventListener('keydown',recoverFromGesture,true);}
function installGestureRecovery(){if(gestureRecovery)return;gestureRecovery=true;document.addEventListener('pointerdown',recoverFromGesture,true);document.addEventListener('touchstart',recoverFromGesture,true);document.addEventListener('keydown',recoverFromGesture,true);}
function recoverFromGesture(){clearGestureRecovery();start('first-gesture');}
function paintRail(){
var id=String(current().id);
railSegmentButtons.forEach(function(b){var n=String(b.dataset.segment);b.classList.toggle('is-current',n===id);b.classList.toggle('is-past',Number(n)<Number(id));b.setAttribute('aria-current',n===id?'true':'false');});
railPhaseButtons.forEach(function(b){var target=String(b.dataset.segment),group=b.closest('.story-micro-phase'),first=Number(target),last=first+3,currentId=Number(id),active=currentId>=first&&currentId<=last;if(group)group.classList.toggle('is-current',active);b.setAttribute('aria-current',active?'true':'false');});
}
function paint(){cards.forEach(function(c,i){c.classList.toggle('is-active',i===cur);c.setAttribute('aria-current',i===cur?'true':'false');});if(prev)prev.disabled=cur===0;if(next)next.disabled=cur===segs.length-1;paintRail();}
function paintWords(){if(lastPaintedWord===widx)return;var bs=cards[cur].querySelectorAll('.story-word');bs.forEach(function(b,i){b.classList.toggle('is-past',i<widx);b.classList.toggle('is-current',i===widx);});lastPaintedWord=widx;window.__ogpSyncDiagnostics.currentWord=widx;}
function resolveWordIndex(t){var ws=current().words||[],lo=0,hi=ws.length-1,hit=-1;while(lo<=hi){var m=(lo+hi)>>1;if(t<Number(ws[m].start))hi=m-1;else lo=m+1,hit=m;}if(hit>=0&&t>=Number(ws[hit].end))return -1;return hit;}
function setWordIndex(nextIndex,t){if(nextIndex===widx)return;var from=widx;widx=nextIndex;paintWords();window.__ogpSyncDiagnostics.transitions.push({segment:String(current().id),from:from,to:nextIndex,audioTime:Number(t)||0,performanceTime:performance.now()});if(window.__ogpSyncDiagnostics.transitions.length>10000)window.__ogpSyncDiagnostics.transitions.shift();if(nextIndex>=0&&follow&&playing){var n=Date.now();if(n>manual&&n>suppressFollowUntil&&n-lastScroll>900){var el=cards[cur].querySelector('[data-word="'+nextIndex+'"]');if(el){lastScroll=n;el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'center'});}}}}
function load(i,go,scroll){cur=Math.max(0,Math.min(segs.length-1,i));widx=-1;var s=current();audio.autoplay=true;audio.src=asset(s.audio)+'?v='+V;audio.load();now.textContent=s.title;status.textContent='Fragmento listo.';paint();paintWords();if(scroll){var el=document.getElementById('story-stop-'+s.id);if(el)el.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'center'});}if(go)start('segment-change');}
function start(reason){
if(!audio.src)return;
var p;
try{p=audio.play();}catch(e){p=Promise.reject(e);}
if(p&&p.then)p.then(function(){playing=true;mount.classList.add('is-playing');play.textContent='Ⅱ';play.setAttribute('aria-label','Pausar');status.textContent=reason==='first-gesture'?'Reproduciendo.':'Reproduciendo esta parte.';syncMicroPlay();clearGestureRecovery();if(hint)hint.classList.remove('is-visible');}).catch(function(err){playing=false;mount.classList.remove('is-playing');play.textContent='▶';play.setAttribute('aria-label','Reproducir');syncMicroPlay();if(err&&err.name==='NotAllowedError'){status.textContent='El navegador bloqueó el inicio automático. El audio está listo.';if(hint)hint.classList.add('is-visible');installGestureRecovery();}else{status.textContent='No se pudo iniciar el audio todavía.';}});
}
function update(){
var s=current(),d=Number(audio.duration)||Number(s.audioDuration)||0,t=Number(audio.currentTime)||0,r=d?Math.max(0,Math.min(1,t/d)):0;
if(microProgress){microProgress.style.setProperty('--progress',(r*100)+'%');microProgress.parentElement.setAttribute('aria-valuenow',String(Math.round(r*100)));}
if(microTime)microTime.textContent=fmt(t);
setWordIndex(resolveWordIndex(t),t);window.__ogpSyncDiagnostics.frames++;
}
function visualClock(){
if(!playing){rafId=0;return;}
update();rafId=requestAnimationFrame(visualClock);
}
function startVisualClock(){if(!rafId)rafId=requestAnimationFrame(visualClock);}
function stopVisualClock(){if(rafId){cancelAnimationFrame(rafId);rafId=0;}}

if(play)play.addEventListener('click',function(){if(audio.paused)start('manual');else audio.pause();});
if(prev)prev.addEventListener('click',function(){if(cur>0){manual=Date.now()+1200;load(cur-1,true,true);}});
if(next)next.addEventListener('click',function(){if(cur<segs.length-1){manual=Date.now()+1200;load(cur+1,true,true);}});
if(returnOverlay)returnOverlay.addEventListener('click',returnToNarration);

mount.querySelectorAll('[data-play-segment]').forEach(function(b){b.addEventListener('click',function(){var i=segs.findIndex(function(s){return String(s.id)===String(b.dataset.playSegment);});if(i>=0)load(i,true,true);});});
railPhaseButtons.forEach(function(b){b.addEventListener('click',function(){var i=segs.findIndex(function(s){return String(s.id)===String(b.dataset.segment);});if(i>=0){manual=Date.now()+1200;load(i,true,true);}});});
railSegmentButtons.forEach(function(b){b.addEventListener('click',function(){var i=segs.findIndex(function(s){return String(s.id)===String(b.dataset.segment);});if(i>=0){manual=Date.now()+1200;load(i,true,true);}});});
mount.querySelectorAll('.story-word').forEach(function(b){b.addEventListener('click',function(){var i=segs.findIndex(function(s){return String(s.id)===String(b.dataset.segment);}),wi=Number(b.dataset.word);if(i<0)return;if(i!==cur)load(i,false,true);var w=segs[i].words[wi];if(w){audio.currentTime=Number(w.start);manual=Date.now()+1200;start('word');update();}});});
audio.addEventListener('loadedmetadata',function(){if(status)status.textContent='Fragmento listo · '+fmt(audio.duration);update();syncMicroPlay();});
audio.addEventListener('timeupdate',update);
audio.addEventListener('seeking',update);
audio.addEventListener('seeked',update);
audio.addEventListener('play',function(){playing=true;mount.classList.add('is-playing');syncMicroPlay();if(hint)hint.classList.remove('is-visible');clearGestureRecovery();startVisualClock();});
audio.addEventListener('pause',function(){playing=false;mount.classList.remove('is-playing');syncMicroPlay();stopVisualClock();});
audio.addEventListener('ended',function(){playing=false;stopVisualClock();if(advance&&cur<segs.length-1)load(cur+1,true,true);else if(status)status.textContent='Fin de la experiencia.';});
audio.addEventListener('error',function(){playing=false;stopVisualClock();syncMicroPlay();if(status)status.textContent='No se pudo cargar el audio de la experiencia.';if(hint)hint.classList.remove('is-visible');clearGestureRecovery();});
if(hint){var hintBtn=hint.querySelector('button');if(hintBtn)hintBtn.addEventListener('click',function(){hint.classList.remove('is-visible');start('manual');});}
function handleMotionScroll(){var y=window.scrollY||document.documentElement.scrollTop||0,nowTs=Date.now(),dy=Math.abs(y-scrollY0),dt=Math.max(16,nowTs-scrollT0),velocity=dy/dt;if(dy>0){var intense=dy>=120||(dt<=120&&dy>=60)||(velocity>=1.5&&dy>=45);releaseFollowForMotion(intense);}scrollY0=y;scrollT0=nowTs;}
window.addEventListener('scroll',handleMotionScroll,{passive:true});
window.addEventListener('wheel',function(e){var d=Math.abs(Number(e.deltaY)||0);if(d>=70)releaseFollowForMotion(true);else if(d>4)releaseFollowForMotion(false);},{passive:true});
window.addEventListener('touchmove',function(e){var t=e.touches&&e.touches[0],d=t&&window.__obpLastTouchY!=null?Math.abs(t.clientY-window.__obpLastTouchY):0;if(t)window.__obpLastTouchY=t.clientY;if(d>=24)releaseFollowForMotion(d>=70);},{passive:true});
window.addEventListener('touchend',function(){window.__obpLastTouchY=null;},{passive:true});
load(0,false,false);paint();syncMicroPlay();
if('IntersectionObserver' in window){
var storyObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){mount.classList.toggle('is-in-story',entry.isIntersecting);});},{rootMargin:'-20% 0px -20% 0px',threshold:0.01});
storyObserver.observe(mount);
}else mount.classList.add('is-in-story');
if(MOBILE)start('initial-autoplay');
}
fetch(URL_DATA+'?v='+V,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('No se pudo cargar los datos del relato.');return r.json();}).then(render).catch(function(e){mount.innerHTML='<div class="story-error"><strong>No se pudo cargar la experiencia sonora.</strong><p>'+esc(e.message)+'</p></div>';});
})();