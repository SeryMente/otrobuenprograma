(function () {
  'use strict';

  var mount = document.getElementById('relato-sonoro');
  if (!mount) return;
  var DATA_URL = 'assets/data/relato-obp-v015.json';

  function esc(v) {
    return String(v).replace(/[&<>"]/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];
    });
  }
  function tokens(t) { return t.match(/\S+(?:\s+|$)/g) || []; }
  function plain(t) { return t.replace(/\s+$/, ''); }
  function pauseWeight(t) {
    var w = plain(t);
    if (/[.!?]$/.test(w)) return .46;
    if (/[;:]$/.test(w)) return .30;
    if (/[,—–-]$/.test(w)) return .17;
    return .045;
  }
  function stamp(sec) {
    if (!Number.isFinite(sec)) return '0:00';
    var s = Math.max(0, Math.round(sec));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2,'0');
  }
  function slug(v) {
    return String(v).toLowerCase().replace(/[^a-z0-9áéíóúüñ]+/gi,'-').replace(/^-|-$/g,'');
  }
  function art(type,title) {
    var blue='#24499d',dark='#0e1832',amber='#efb45f',white='#f8fbff',pale='#b7caf2';
    var b='';
    if(type==='welcome') b='<circle class="art-pulse" cx="300" cy="210" r="118" fill="none" stroke="'+amber+'" stroke-width="2"/><circle cx="300" cy="210" r="82" fill="'+white+'" opacity=".08"/><path d="M198 224c30-54 69-82 113-82 54 0 91 26 111 78" fill="none" stroke="'+white+'" stroke-width="5" stroke-linecap="round"/><circle cx="224" cy="250" r="30" fill="'+white+'" opacity=".86"/><circle cx="376" cy="250" r="30" fill="'+white+'" opacity=".46"/><path d="M246 256h108" stroke="'+amber+'" stroke-width="5" stroke-linecap="round"/><text x="300" y="116" text-anchor="middle" fill="'+white+'" font-family="Georgia" font-size="34">escuchar</text><text x="300" y="330" text-anchor="middle" fill="'+pale+'" font-family="monospace" font-size="14" letter-spacing="2">QR · VOZ · INVITACIÓN</text>';
    else if(type==='currents') b='<path d="M-20 128C108 52 215 203 344 124S529 70 620 126" fill="none" stroke="'+white+'" opacity=".12" stroke-width="54"/><path class="art-draw" d="M-10 304C126 235 215 359 347 284S531 224 616 307" fill="none" stroke="'+amber+'" stroke-width="17" stroke-linecap="round" stroke-dasharray="790" stroke-dashoffset="790"/><circle class="art-float" cx="438" cy="277" r="23" fill="'+white+'"/><text x="42" y="80" fill="'+pale+'" font-family="monospace" font-size="13">LO QUE YA EXISTE</text><text x="430" y="374" fill="'+white+'" font-family="Georgia" font-size="26">otra posibilidad</text>';
    else if(type==='relationship') b='<g stroke="'+pale+'" stroke-width="3" opacity=".72"><path d="M96 114 228 72l93 128 122-86 92 112-76 120-143-47-111 85-109-132z"/><path d="m228 72-12 309m105-181 123 136M96 114l24 269m223-101 199 15"/></g><g fill="'+white+'"><circle cx="96" cy="114" r="13"/><circle cx="228" cy="72" r="17"/><circle cx="321" cy="200" r="23"/><circle cx="443" cy="114" r="13"/><circle cx="535" cy="226" r="18"/><circle cx="459" cy="346" r="13"/><circle cx="316" cy="299" r="15"/><circle cx="128" cy="384" r="12"/></g><circle class="art-pulse" cx="321" cy="200" r="47" fill="none" stroke="'+amber+'" stroke-width="3"/><text x="300" y="54" text-anchor="middle" fill="'+white+'" font-family="Georgia" font-size="28">la relación</text>';
    else if(type==='forgiveness') b='<circle cx="214" cy="211" r="70" fill="'+white+'" opacity=".09"/><circle cx="386" cy="211" r="70" fill="'+amber+'" opacity=".18"/><path class="art-draw" d="M140 214C186 164 218 164 260 214s74 50 116 0 74-50 84 0" fill="none" stroke="'+white+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="620" stroke-dashoffset="620"/><path d="M224 316c24-20 52-29 76-29s52 9 76 29" fill="none" stroke="'+amber+'" stroke-width="5" stroke-linecap="round"/><text x="300" y="112" text-anchor="middle" fill="'+white+'" font-family="Georgia" font-size="40">perdón</text>';
    else if(type==='scale') b='<g fill="'+white+'" opacity=".9"><path d="M98 322h52V270h-52z"/><path d="M166 322h66V228h-66z"/><path d="M250 322h82V176h-82z"/><path d="M350 322h98V122h-98z"/><path d="M466 322h44V76h-44z"/></g><path class="art-draw" d="M70 343H528" stroke="'+amber+'" stroke-width="6" stroke-linecap="round" stroke-dasharray="458" stroke-dashoffset="458"/><text x="83" y="386" fill="'+pale+'" font-family="monospace" font-size="12">MÁS DUAL</text><text x="418" y="386" fill="'+white+'" font-family="monospace" font-size="12">MÁS NO DUAL</text>';
    else if(type==='inclusion') b='<g stroke="'+pale+'" stroke-width="3" opacity=".65"><path d="M300 77v258"/><path d="M171 206h258"/><path d="M209 115l182 182"/><path d="m391 115-182 182"/></g><circle cx="300" cy="206" r="82" fill="'+white+'" opacity=".08"/><circle class="art-pulse" cx="300" cy="206" r="52" fill="none" stroke="'+amber+'" stroke-width="4"/><g fill="'+white+'"><circle cx="300" cy="100" r="18"/><circle cx="300" cy="312" r="18"/><circle cx="194" cy="206" r="18"/><circle cx="406" cy="206" r="18"/><circle cx="225" cy="131" r="16"/><circle cx="375" cy="281" r="16"/></g><text x="300" y="367" text-anchor="middle" fill="'+white+'" font-family="Georgia" font-size="26">todoabarcador</text>';
    else if(type==='dabrowski') b='<path class="art-draw" d="M300 344V86m0 52-82-43m82 90 92-55M300 220l-108 73m108-44 111 65" fill="none" stroke="'+white+'" stroke-width="7" stroke-linecap="round" stroke-dasharray="460" stroke-dashoffset="460"/><circle cx="300" cy="220" r="21" fill="'+amber+'"/><text x="300" y="58" text-anchor="middle" fill="'+white+'" font-family="Georgia" font-size="27">conflicto moral</text><text x="50" y="389" fill="'+pale+'" font-family="monospace" font-size="12">DĄBROWSKI · DESARROLLO</text>';
    else if(type==='structures') b='<g font-family="monospace" font-size="17" fill="'+white+'"><text x="48" y="92">mamá</text><text x="440" y="105">sociedad</text><text x="72" y="350">“no es cierto”</text><text x="374" y="326">“no es para tanto”</text></g><path d="M105 238h390" stroke="'+white+'" opacity=".2" stroke-width="2"/><path class="art-draw" d="M300 118v184" stroke="'+amber+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="184" stroke-dashoffset="184"/><circle cx="300" cy="210" r="54" fill="'+white+'" opacity=".08" stroke="'+amber+'" stroke-width="3"/><text x="300" y="224" text-anchor="middle" fill="'+white+'" font-family="Georgia" font-size="23">¿y si no?</text>';
    else if(type==='minds') b='<circle cx="190" cy="216" r="76" fill="'+white+'" opacity=".16"/><circle cx="410" cy="216" r="76" fill="'+amber+'" opacity=".2"/><path d="M262 216h76" stroke="'+white+'" stroke-width="4" stroke-dasharray="12 10"/><text x="190" y="222" text-anchor="middle" fill="'+white+'" font-family="Georgia" font-size="23">conformidad</text><text x="410" y="222" text-anchor="middle" fill="'+white+'" font-family="Georgia" font-size="23">ruptura</text><text x="300" y="94" text-anchor="middle" fill="'+white+'" font-family="monospace" font-size="13">DOS MENTALIDADES</text>';
    else b='<path d="M64 318C146 246 192 316 255 261s91-84 142-20 86 22 143-42" fill="none" stroke="'+white+'" opacity=".78" stroke-width="5"/><circle class="art-pulse" cx="257" cy="262" r="45" fill="none" stroke="'+amber+'" stroke-width="3"/><circle cx="257" cy="262" r="12" fill="'+amber+'"/><g fill="'+white+'"><circle cx="126" cy="286" r="7"/><circle cx="194" cy="286" r="6"/><circle cx="340" cy="220" r="7"/><circle cx="478" cy="220" r="6"/><circle cx="546" cy="184" r="8"/></g><text x="300" y="105" text-anchor="middle" fill="'+white+'" font-family="Georgia" font-size="30">reconocer · comprender · desarrollar</text>';

    return '<div class="story-art-note">Ilustración editorial · estación</div><svg viewBox="0 0 600 430" role="img" aria-label="'+esc(title)+'"><defs><linearGradient id="bg-'+slug(title)+'" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+blue+'"/><stop offset="1" stop-color="'+dark+'"/></linearGradient></defs><rect width="600" height="430" fill="url(#bg-'+slug(title)+')"/>'+b+'</svg><div class="story-art-title">'+esc(title)+'</div>';
  }

  function build(data) {
    var scenes=(data.scenes||[]).slice(0,10);
    mount.innerHTML='<div class="story-intro"><div class="story-kicker"><span class="story-live"></span> Otro Buen Programa · relato sonoro</div><h1>La historia comienza con una voz.</h1><p class="story-dek">Escucha, lee y recorre una conversación que propone abrir una segunda posibilidad.</p><div class="story-meta"><span>10 estaciones</span><span>23:11 de voz</span><span>transcripción editorial</span></div><div class="story-auto-note">En móvil se intenta reproducir al abrir; si el navegador bloquea el sonido, el primer toque lo inicia.</div></div><div class="story-player" aria-label="Reproductor del relato"><button class="story-play" type="button" aria-label="Reproducir" title="Reproducir"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg></button><div class="story-player-main"><div class="story-player-line"><strong class="story-now">Preparando la narración</strong><span class="story-time">0:00 / '+stamp(data.duration)+'</span></div><div class="story-wave" role="slider" tabindex="0" aria-label="Posición del audio" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="story-bars" aria-hidden="true">'+Array.from({length:34},function(_,i){return '<i style="--i:'+i+'"></i>';}).join('')+'</div><span class="story-progress"></span></div></div><button class="story-follow-toggle" type="button" aria-pressed="true">Seguir voz</button><div class="story-chapters">'+scenes.map(function(s,i){return '<button type="button" data-chapter="'+i+'" aria-label="Ir a estación '+s.id+'"><span>'+s.id+'</span></button>';}).join('')+'</div><div class="story-status" role="status">Audio en preparación…</div></div><div class="story-rail">'+scenes.map(function(s,i){return '<article class="story-stop" id="story-stop-'+i+'" data-scene="'+i+'"><div class="story-copy"><span class="story-label">'+esc(s.label)+'</span><h2>'+esc(s.title)+'</h2><p class="story-transcript">'+tokens(s.text).map(function(t,j){return '<button class="story-word" type="button" data-word="'+j+'">'+esc(plain(t))+'</button> ';}).join('')+'</p></div><div class="story-node" aria-hidden="true">'+esc(s.id)+'</div><div class="story-art">'+art(s.art,s.title)+'</div></article>';}).join('')+'</div><div class="story-end"><p>La conversación termina aquí por ahora.</p><span>El resto del documento continúa debajo.</span></div><audio class="story-audio" preload="metadata" playsinline></audio>';

    var audio=mount.querySelector('.story-audio'),playBtn=mount.querySelector('.story-play'),followBtn=mount.querySelector('.story-follow-toggle'),status=mount.querySelector('.story-status'),nowLabel=mount.querySelector('.story-now'),timeLabel=mount.querySelector('.story-time'),wave=mount.querySelector('.story-wave'),progress=mount.querySelector('.story-progress'),stops=Array.prototype.slice.call(mount.querySelectorAll('.story-stop')),chapters=Array.prototype.slice.call(mount.querySelectorAll('.story-chapters button'));
    var follow=true,playing=false,userTouched=false,activeScene=-1,activeWord=-1,timing=[],duration=Number(data.duration)||1391,sourceTried=false,fallbackUsed=false;

    function makeTiming() {
      var items=[],total=0;
      scenes.forEach(function(s,si){tokens(s.text).forEach(function(t,wi){var weight=1+pauseWeight(t)*2.4;total+=weight;items.push({scene:si,word:wi,weight:weight});});});
      var c=0;timing=items.map(function(x){var start=c;c+=duration*x.weight/total;return {scene:x.scene,word:x.word,start:start,end:c};});
    }
    function hitAt(t){var lo=0,hi=timing.length-1,ans=null;while(lo<=hi){var m=(lo+hi)>>1;if(timing[m].start<=t){ans=timing[m];lo=m+1;}else hi=m-1;}return ans&&t<=ans.end+0.25?ans:null;}
    function sceneAt(t){var h=hitAt(t);return h?h.scene:-1;}
    function renderState() {
      var d=Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:duration,t=audio.currentTime||0,p=d?Math.max(0,Math.min(1,t/d)):0;
      progress.style.width=(p*100)+'%';wave.setAttribute('aria-valuenow',String(Math.round(p*100)));timeLabel.textContent=stamp(t)+' / '+stamp(d);
      var h=hitAt(t);if(!h)return;
      if(h.scene!==activeScene){
        activeScene=h.scene;nowLabel.textContent=scenes[h.scene].title;
        stops.forEach(function(s,i){s.classList.toggle('is-active',i===h.scene);});
        chapters.forEach(function(c,i){c.classList.toggle('is-active',i===h.scene);c.setAttribute('aria-current',i===h.scene?'true':'false');});
        if(follow&&playing&&userTouched===false){var target=stops[h.scene];if(target)target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth',block:'center'});}
      }
      if(h.word!==activeWord||h.scene!==activeScene){
        mount.querySelectorAll('.story-word.is-current').forEach(function(x){x.classList.remove('is-current');});
        var current=stops[h.scene]&&stops[h.scene].querySelector('[data-word="'+h.word+'"]');if(current)current.classList.add('is-current');
        activeWord=h.word;
      }
      stops.forEach(function(s,si){s.querySelectorAll('.story-word').forEach(function(w,i){w.classList.toggle('is-past',si===h.scene&&i<h.word);});});
      if(playing){mount.style.setProperty('--audio-level',(0.55+0.45*Math.abs(Math.sin(t*5.7)*Math.cos(t*1.33))).toFixed(3));}
    }
    function setPlaying(v){playing=v;mount.classList.toggle('is-playing',v);playBtn.setAttribute('aria-label',v?'Pausar':'Reproducir');playBtn.innerHTML=v?'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>':'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>';}
    function showFallback(){if(fallbackUsed||!data.fallbackAudio)return false;fallbackUsed=true;audio.src=data.fallbackAudio;audio.load();status.textContent='Usando la copia de respaldo del audio.';return true;}
    function tryPlay(){var p=audio.play();if(p&&p.catch)p.catch(function(){setPlaying(false);status.textContent='El navegador bloqueó el sonido automático. Toca reproducir para iniciar.';});}
    function seek(t){var d=timelineDuration();if(!Number.isFinite(d))return;audio.currentTime=Math.max(0,Math.min(d,t));renderState();}
    function timelineDuration(){return Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:duration;}

    playBtn.addEventListener('click',function(){userTouched=true;if(audio.paused)tryPlay();else audio.pause();});
    followBtn.addEventListener('click',function(){follow=!follow;followBtn.setAttribute('aria-pressed',String(follow));followBtn.textContent=follow?'Seguir voz':'Pausar seguimiento';});
    wave.addEventListener('click',function(e){var r=wave.getBoundingClientRect();seek(((e.clientX-r.left)/r.width)*timelineDuration());});
    wave.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();seek(audio.currentTime+5);}else if(e.key==='ArrowLeft'){e.preventDefault();seek(audio.currentTime-5);}else if(e.key==='Home'){e.preventDefault();seek(0);}else if(e.key==='End'){e.preventDefault();seek(timelineDuration());}});
    chapters.forEach(function(btn,i){btn.addEventListener('click',function(){var h=timing.find(function(x){return x.scene===i;});if(h){userTouched=true;seek(h.start);tryPlay();}});});
    stops.forEach(function(stop,si){stop.querySelectorAll('.story-word').forEach(function(btn){btn.addEventListener('click',function(){var wi=Number(btn.getAttribute('data-word')),h=timing.find(function(x){return x.scene===si&&x.word===wi;});if(h){userTouched=true;seek(h.start);tryPlay();}});});});
    audio.addEventListener('loadedmetadata',function(){if(Number.isFinite(audio.duration)&&audio.duration>0){duration=audio.duration;makeTiming();status.textContent='Audio listo · '+stamp(duration)+' · 10 estaciones.';}renderState();});
    audio.addEventListener('timeupdate',renderState);
    audio.addEventListener('play',function(){setPlaying(true);status.textContent='Reproduciendo. La voz guía el recorrido.';});
    audio.addEventListener('pause',function(){setPlaying(false);});
    audio.addEventListener('ended',function(){setPlaying(false);status.textContent='Fin de la grabación.';});
    audio.addEventListener('error',function(){if(!showFallback()){setPlaying(false);status.textContent='No se pudo cargar el audio. La transcripción sigue disponible.';}else tryPlay();});
    window.addEventListener('pointerdown',function(){userTouched=true;if(audio.paused&&!playing)tryPlay();},{passive:true});
    var io=new IntersectionObserver(function(entries){if(playing)return;entries.forEach(function(e){if(e.isIntersecting&&e.intersectionRatio>.5){setScenePreview(Number(e.target.getAttribute('data-scene')));}});},{threshold:[.5,.72]});
    function setScenePreview(i){if(i<0)return;stops.forEach(function(s,j){s.classList.toggle('is-active',j===i);});chapters.forEach(function(c,j){c.classList.toggle('is-active',j===i);c.setAttribute('aria-current',j===i?'true':'false');});activeScene=i;activeWord=-1;nowLabel.textContent=scenes[i].title;}
    stops.forEach(function(s){io.observe(s);});
    makeTiming();audio.src=data.audio;audio.load();renderState();tryPlay();
  }

  fetch(DATA_URL,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error('data');return r.json();}).then(build).catch(function(){mount.innerHTML='<div class="story-error"><strong>No se pudo cargar el relato.</strong><p>La página inferior permanece disponible.</p></div>';});
})();