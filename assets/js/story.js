(function () {
  'use strict';

  var mount = document.getElementById('relato-sonoro');
  if (!mount) return;

  var DATA_URL = 'assets/data/relato-obp-v015.json';

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[char];
    });
  }

  function tokenize(text) {
    return text.match(/\S+(?:\s+|$)/g) || [];
  }

  function wordPlain(token) {
    return token.replace(/\s+$/, '');
  }

  function pauseWeight(token) {
    var t = wordPlain(token);
    if (/[.!?]$/.test(t)) return 0.46;
    if (/[;:]$/.test(t)) return 0.30;
    if (/[,—–-]$/.test(t)) return 0.17;
    return 0.045;
  }

  function stamp(seconds) {
    if (!Number.isFinite(seconds)) return '0:00';
    var s = Math.max(0, Math.round(seconds));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function slug(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9áéíóúüñ]+/gi, '-').replace(/^-|-$/g, '');
  }

  function art(type, title) {
    var blue = '#24499d', dark = '#0e1832', amber = '#efb45f', coral = '#d35f50', white = '#f8fbff', pale = '#b7caf2';
    var body = '';

    if (type === 'welcome') {
      body =
        '<circle class="art-pulse" cx="300" cy="210" r="118" fill="none" stroke="' + amber + '" stroke-width="2" opacity=".65"/>' +
        '<circle cx="300" cy="210" r="82" fill="' + white + '" opacity=".08"/>' +
        '<path d="M198 224c30-54 69-82 113-82 54 0 91 26 111 78" fill="none" stroke="' + white + '" stroke-width="5" stroke-linecap="round"/>' +
        '<circle cx="224" cy="250" r="30" fill="' + white + '" opacity=".86"/><circle cx="376" cy="250" r="30" fill="' + white + '" opacity=".46"/>' +
        '<path d="M246 256h108" stroke="' + amber + '" stroke-width="5" stroke-linecap="round"/>' +
        '<text x="300" y="116" text-anchor="middle" fill="' + white + '" font-family="Georgia" font-size="34">escuchar</text>' +
        '<text x="300" y="330" text-anchor="middle" fill="' + pale + '" font-family="monospace" font-size="14" letter-spacing="2">QR · VOZ · INVITACIÓN</text>';
    } else if (type === 'currents') {
      body =
        '<path d="M-20 128C108 52 215 203 344 124S529 70 620 126" fill="none" stroke="' + white + '" opacity=".12" stroke-width="54"/>' +
        '<path class="art-draw" d="M-10 304C126 235 215 359 347 284S531 224 616 307" fill="none" stroke="' + amber + '" stroke-width="17" stroke-linecap="round" stroke-dasharray="790" stroke-dashoffset="790"/>' +
        '<circle class="art-float" cx="438" cy="277" r="23" fill="' + white + '"/>' +
        '<text x="42" y="80" fill="' + pale + '" font-family="monospace" font-size="13">LO QUE YA EXISTE</text>' +
        '<text x="430" y="374" fill="' + white + '" font-family="Georgia" font-size="26">otra posibilidad</text>';
    } else if (type === 'relationship') {
      body =
        '<g stroke="' + pale + '" stroke-width="3" opacity=".72"><path d="M96 114 228 72l93 128 122-86 92 112-76 120-143-47-111 85-109-132z"/><path d="m228 72-12 309m105-181 123 136M96 114l24 269m223-101 199 15"/></g>' +
        '<g fill="' + white + '"><circle cx="96" cy="114" r="13"/><circle cx="228" cy="72" r="17"/><circle cx="321" cy="200" r="23"/><circle cx="443" cy="114" r="13"/><circle cx="535" cy="226" r="18"/><circle cx="459" cy="346" r="13"/><circle cx="316" cy="299" r="15"/><circle cx="128" cy="384" r="12"/></g>' +
        '<circle class="art-pulse" cx="321" cy="200" r="47" fill="none" stroke="' + amber + '" stroke-width="3"/>' +
        '<text x="300" y="54" text-anchor="middle" fill="' + white + '" font-family="Georgia" font-size="28">la relación</text>';
    } else if (type === 'forgiveness') {
      body =
        '<circle cx="214" cy="211" r="70" fill="' + white + '" opacity=".09"/><circle cx="386" cy="211" r="70" fill="' + amber + '" opacity=".18"/>' +
        '<path class="art-draw" d="M140 214C186 164 218 164 260 214s74 50 116 0 74-50 84 0" fill="none" stroke="' + white + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="620" stroke-dashoffset="620"/>' +
        '<path d="M224 316c24-20 52-29 76-29s52 9 76 29" fill="none" stroke="' + amber + '" stroke-width="5" stroke-linecap="round"/>' +
        '<text x="300" y="112" text-anchor="middle" fill="' + white + '" font-family="Georgia" font-size="40">perdón</text>';
    } else if (type === 'scale') {
      body =
        '<g fill="' + white + '" opacity=".9">' +
        '<path d="M98 322h52V270h-52z"/><path d="M166 322h66V228h-66z"/><path d="M250 322h82V176h-82z"/><path d="M350 322h98V122h-98z"/><path d="M466 322h44V76h-44z"/>' +
        '</g>' +
        '<path class="art-draw" d="M70 343H528" stroke="' + amber + '" stroke-width="6" stroke-linecap="round" stroke-dasharray="458" stroke-dashoffset="458"/>' +
        '<text x="83" y="386" fill="' + pale + '" font-family="monospace" font-size="12">MÁS DUAL</text>' +
        '<text x="418" y="386" fill="' + white + '" font-family="monospace" font-size="12">MÁS NO DUAL</text>';
    } else if (type === 'inclusion') {
      body =
        '<g stroke="' + pale + '" stroke-width="3" opacity=".65"><path d="M300 77v258"/><path d="M171 206h258"/><path d="M209 115l182 182"/><path d="m391 115-182 182"/></g>' +
        '<circle cx="300" cy="206" r="82" fill="' + white + '" opacity=".08"/><circle class="art-pulse" cx="300" cy="206" r="52" fill="none" stroke="' + amber + '" stroke-width="4"/>' +
        '<g fill="' + white + '"><circle cx="300" cy="100" r="18"/><circle cx="300" cy="312" r="18"/><circle cx="194" cy="206" r="18"/><circle cx="406" cy="206" r="18"/><circle cx="225" cy="131" r="16"/><circle cx="375" cy="281" r="16"/></g>' +
        '<text x="300" y="367" text-anchor="middle" fill="' + white + '" font-family="Georgia" font-size="26">todoabarcador</text>';
    } else if (type === 'dabrowski') {
      body =
        '<path class="art-draw" d="M300 344V86m0 52-82-43m82 90 92-55M300 220l-108 73m108-44 111 65" fill="none" stroke="' + white + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="460" stroke-dashoffset="460"/>' +
        '<circle cx="300" cy="220" r="21" fill="' + amber + '"/>' +
        '<text x="300" y="58" text-anchor="middle" fill="' + white + '" font-family="Georgia" font-size="27">conflicto moral</text>' +
        '<text x="50" y="389" fill="' + pale + '" font-family="monospace" font-size="12">DĄBROWSKI · DESARROLLO</text>';
    } else if (type === 'structures') {
      body =
        '<g font-family="monospace" font-size="17" fill="' + white + '"><text x="48" y="92">mamá</text><text x="440" y="105">sociedad</text><text x="72" y="350">“no es cierto”</text><text x="374" y="326">“no es para tanto”</text></g>' +
        '<path d="M105 238h390" stroke="' + white + '" opacity=".2" stroke-width="2"/>' +
        '<path class="art-draw" d="M300 118v184" stroke="' + amber + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="184" stroke-dashoffset="184"/>' +
        '<circle cx="300" cy="210" r="54" fill="' + white + '" opacity=".08" stroke="' + amber + '" stroke-width="3"/>' +
        '<text x="300" y="224" text-anchor="middle" fill="' + white + '" font-family="Georgia" font-size="23">¿y si no?</text>';
    } else if (type === 'minds') {
      body =
        '<circle cx="190" cy="216" r="76" fill="' + white + '" opacity=".16"/><circle cx="410" cy="216" r="76" fill="' + amber + '" opacity=".20"/>' +
        '<path d="M262 216h76" stroke="' + white + '" stroke-width="4" stroke-dasharray="12 10"/>' +
        '<text x="190" y="222" text-anchor="middle" fill="' + white + '" font-family="Georgia" font-size="23">conformidad</text>' +
        '<text x="410" y="222" text-anchor="middle" fill="' + white + '" font-family="Georgia" font-size="23">ruptura</text>' +
        '<text x="300" y="94" text-anchor="middle" fill="' + white + '" font-family="monospace" font-size="13">DOS MENTALIDADES</text>';
    } else if (type === 'closing') {
      body =
        '<path d="M64 318C146 246 192 316 255 261s91-84 142-20 86 22 143-42" fill="none" stroke="' + white + '" opacity=".78" stroke-width="5"/>' +
        '<circle class="art-pulse" cx="257" cy="262" r="45" fill="none" stroke="' + amber + '" stroke-width="3"/>' +
        '<circle cx="257" cy="262" r="12" fill="' + amber + '"/>' +
        '<g fill="' + white + '"><circle cx="126" cy="286" r="7"/><circle cx="194" cy="286" r="6"/><circle cx="340" cy="220" r="7"/><circle cx="478" cy="220" r="6"/><circle cx="546" cy="184" r="8"/></g>' +
        '<text x="300" y="105" text-anchor="middle" fill="' + white + '" font-family="Georgia" font-size="32">reconocer · comprender · desarrollar</text>';
    }

    return (
      '<div class="story-art-note">Ilustración editorial · estación</div>' +
      '<svg viewBox="0 0 600 430" role="img" aria-label="' + escapeHtml(title) + '">' +
      '<defs><linearGradient id="bg-' + slug(title) + '" x1="0" y1="0" x2="1" y2="1"><stop stop-color="' + blue + '"/><stop offset="1" stop-color="' + dark + '"/></linearGradient></defs>' +
      '<rect width="600" height="430" fill="url(#bg-' + slug(title) + ')"/>' + body +
      '</svg><div class="story-art-title">' + escapeHtml(title) + '</div>'
    );
  }

  function build(data) {
    var scenes = data.scenes.slice(0, 10);
    mount.innerHTML =
      '<div class="story-intro">' +
        '<div class="story-kicker"><span class="story-live"></span> Otro Buen Programa · relato sonoro</div>' +
        '<h1>La historia comienza con una voz.</h1>' +
        '<p class="story-dek">Una conversación sobre una segunda posibilidad: escucha, lee y recorre la idea de arriba hacia abajo.</p>' +
        '<div class="story-meta"><span>10 estaciones</span><span>23:11 de voz</span><span>transcripción editorial</span></div>' +
        '<div class="story-auto-note">En móvil, un toque inicia el audio cuando el navegador bloquea la reproducción automática con sonido.</div>' +
      '</div>' +
      '<div class="story-player" aria-label="Reproductor del relato">' +
        '<button class="story-play" type="button" aria-label="Reproducir" title="Reproducir">' +
          '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>' +
        '</button>' +
        '<div class="story-player-main">' +
          '<div class="story-player-line"><strong class="story-now">Preparando la narración</strong><span class="story-time">0:00 / 23:11</span></div>' +
          '<div class="story-wave" role="slider" tabindex="0" aria-label="Posición del audio" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
            '<div class="story-bars" aria-hidden="true">' +
              Array.from({length: 34}, function(_, i){ return '<i style="--i:' + i + '"></i>'; }).join('') +
            '</div>' +
            '<span class="story-progress"></span>' +
          '</div>' +
        '</div>' +
        '<button class="story-follow-toggle" type="button" aria-pressed="true">Seguir voz</button>' +
        '<div class="story-chapters">' +
          scenes.map(function (s, i) {
            return '<button type="button" data-chapter="' + i + '" aria-label="Ir a estación ' + s.id + '"><span>' + s.id + '</span></button>';
          }).join('') +
        '</div>' +
        '<div class="story-status" role="status">Audio listo. Reproducción automática intentada; algunos móviles exigen un primer toque.</div>' +
      '</div>' +
      '<div class="story-rail">' +
        scenes.map(function (s, i) {
          var tokens = tokenize(s.text);
          return '<article class="story-stop" id="story-stop-' + i + '" data-scene="' + i + '">' +
            '<div class="story-copy">' +
              '<span class="story-label">' + escapeHtml(s.label) + '</span>' +
              '<h2>' + escapeHtml(s.title) + '</h2>' +
              '<p class="story-transcript" aria-label="Transcripción sincronizada">' +
                tokens.map(function (token, j) {
                  return '<button class="story-word" type="button" data-scene="' + i + '" data-word="' + j + '">' + escapeHtml(wordPlain(token)) + '</button>' + (/\s$/.test(token) ? ' ' : ' ');
                }).join('') +
              '</p>' +
            '</div>' +
            '<div class="story-node" aria-hidden="true">' + escapeHtml(s.id) + '</div>' +
            '<div class="story-art">' + art(s.art, s.title) + '</div>' +
          '</article>';
        }).join('') +
      '</div>' +
      '<div class="story-end">' +
        '<p>La propuesta termina aquí por ahora. El desarrollo empieza después.</p>' +
        '<span>El resto del documento continúa debajo.</span>' +
      '</div>' +
      '<audio class="story-audio" preload="metadata" playsinline></audio>';

    var audio = mount.querySelector('.story-audio');
    var playButton = mount.querySelector('.story-play');
    var followButton = mount.querySelector('.story-follow-toggle');
    var status = mount.querySelector('.story-status');
    var nowLabel = mount.querySelector('.story-now');
    var timeLabel = mount.querySelector('.story-time');
    var wave = mount.querySelector('.story-wave');
    var progress = mount.querySelector('.story-progress');
    var stops = Array.prototype.slice.call(mount.querySelectorAll('.story-stop'));
    var chapterButtons = Array.prototype.slice.call(mount.querySelectorAll('.story-chapters button'));
    var follow = true;
    var userInteractedAt = 0;
    var activeScene = -1;
    var activeWord = -1;
    var playing = false;
    var fallbackDuration = Number(data.duration) || 1391;
    var timing = [];
    var wordButtons = [];

    function timelineDuration() {
      return Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : fallbackDuration;
    }

    function makeTiming() {
      var all = [];
      var totalWeight = 0;

      scenes.forEach(function (scene, si) {
        var tokens = tokenize(scene.text);
        var local = tokens.map(function (token, wi) {
          var weight = 1 + pauseWeight(token) * 2.4;
          totalWeight += weight;
          return {scene: si, word: wi, token: wordPlain(token), weight: weight};
        });
        all.push(local);
      });

      var duration = timelineDuration();
      var cursor = 0;

      timing = [];
      all.forEach(function (local) {
        local.forEach(function (item) {
          var start = cursor;
          cursor += duration * item.weight / totalWeight;
          timing.push({
            scene: item.scene,
            word: item.word,
            start: start,
            end: cursor
          });
        });
      });

      if (cursor > 0 && duration !== timelineDuration()) {
        scaleTiming(duration);
      }
    }

    function scaleTiming(nextDuration) {
      var source = fallbackDuration || 1;
      var ratio = nextDuration / source;
      timing.forEach(function (item) {
        item.start *= ratio;
        item.end *= ratio;
      });
      fallbackDuration = nextDuration;
    }

    function findWordAt(time) {
      var lo = 0, hi = timing.length - 1, answer = null;
      while (lo <= hi) {
        var mid = (lo + hi) >> 1;
        if (timing[mid].start <= time) {
          answer = timing[mid];
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      if (answer && time <= answer.end) return answer;
      return answer && time >= answer.start ? answer : null;
    }

    function setActive(sceneIndex, wordIndex) {
      if (sceneIndex !== activeScene) {
        stops.forEach(function (stop, i) {
          stop.classList.toggle('is-active', i === sceneIndex);
        });
        chapterButtons.forEach(function (button, i) {
          button.classList.toggle('is-active', i === sceneIndex);
          button.setAttribute('aria-current', i === sceneIndex ? 'true' : 'false');
        });
        activeScene = sceneIndex;
        if (sceneIndex >= 0) {
          nowLabel.textContent = scenes[sceneIndex].title;
          if (follow && playing && Date.now() - userInteractedAt > 2800) {
            var target = wordIndex >= 0 ? stops[sceneIndex].querySelector('[data-word="' + wordIndex + '"]') : stops[sceneIndex];
            if (target && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
              target.scrollIntoView({behavior:'smooth', block:'center'});
            } else if (target) {
              target.scrollIntoView({behavior:'auto', block:'center'});
            }
          }
        }
      }

      if (wordIndex !== activeWord) {
        if (activeWord >= 0) {
          var old = mount.querySelector('.story-word.is-current');
          if (old) old.classList.remove('is-current');
        }
        if (sceneIndex >= 0 && wordIndex >= 0) {
          var current = stops[sceneIndex].querySelector('[data-word="' + wordIndex + '"]');
          if (current) current.classList.add('is-current');
        }
        activeWord = wordIndex;
      }

      stops.forEach(function (stop, si) {
        var buttons = stop.querySelectorAll('.story-word');
        for (var j = 0; j < buttons.length; j++) {
          buttons[j].classList.toggle('is-past', si === sceneIndex && j < wordIndex);
          if (si !== sceneIndex) buttons[j].classList.remove('is-past');
        }
      });
    }

    function updateProgress() {
      var d = timelineDuration();
      var t = audio.currentTime || 0;
      var p = d ? Math.max(0, Math.min(1, t / d)) : 0;
      progress.style.width = (p * 100) + '%';
      wave.setAttribute('aria-valuenow', String(Math.round(p * 100)));
      timeLabel.textContent = stamp(t) + ' / ' + stamp(d);

      var hit = findWordAt(t);
      if (hit) setActive(hit.scene, hit.word);

      if (playing) {
        var level = (0.55 + 0.45 * Math.abs(Math.sin(t * 5.7) * Math.cos(t * 1.33))).toFixed(3);
        mount.style.setProperty('--audio-level', level);
      }
    }

    function setPlaying(next) {
      playing = next;
      mount.classList.toggle('is-playing', next);
      playButton.setAttribute('aria-label', next ? 'Pausar' : 'Reproducir');
      playButton.innerHTML = next
        ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>'
        : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16l13-8z"/></svg>';
    }

    function failAudio(message) {
      status.textContent = message;
      setPlaying(false);
    }

    function tryPlay() {
      var promise = audio.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          status.textContent = 'Reproduciendo. La voz guía el recorrido.';
          setPlaying(true);
        }).catch(function () {
          status.textContent = 'El navegador bloqueó el sonido automático. Toca reproducir para iniciar.';
          setPlaying(false);
        });
      }
    }

    function seek(seconds) {
      if (!Number.isFinite(audio.duration)) return;
      audio.currentTime = Math.max(0, Math.min(audio.duration, seconds));
      updateProgress();
    }

    playButton.addEventListener('click', function () {
      userInteractedAt = Date.now();
      if (audio.paused) tryPlay(); else audio.pause();
    });

    followButton.addEventListener('click', function () {
      follow = !follow;
      followButton.setAttribute('aria-pressed', String(follow));
      followButton.textContent = follow ? 'Seguir voz' : 'Pausar seguimiento';
    });

    wave.addEventListener('click', function (event) {
      var rect = wave.getBoundingClientRect();
      var ratio = rect.width ? (event.clientX - rect.left) / rect.width : 0;
      seek(ratio * timelineDuration());
    });

    wave.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { event.preventDefault(); seek(audio.currentTime + 5); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); seek(audio.currentTime - 5); }
      if (event.key === 'Home') { event.preventDefault(); seek(0); }
      if (event.key === 'End') { event.preventDefault(); seek(timelineDuration()); }
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); if (audio.paused) tryPlay(); else audio.pause(); }
    });

    chapterButtons.forEach(function (button, index) {
      button.addEventListener('click', function () {
        var first = timing.find(function (item) { return item.scene === index; });
        if (!first) return;
        seek(first.start);
        userInteractedAt = Date.now();
        tryPlay();
      });
    });

    stops.forEach(function (stop, si) {
      stop.querySelectorAll('.story-word').forEach(function (button) {
        button.addEventListener('click', function () {
          var wi = Number(button.getAttribute('data-word'));
          var hit = timing.find(function (item) { return item.scene === si && item.word === wi; });
          if (!hit) return;
          seek(hit.start);
          userInteractedAt = Date.now();
          tryPlay();
        });
      });
    });

    var io = new IntersectionObserver(function (entries) {
      if (playing) return;
      entries.forEach(function (entry) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.48) {
          var sceneIndex = Number(entry.target.getAttribute('data-scene'));
          setActive(sceneIndex, -1);
        }
      });
    }, {threshold:[0.48,0.65]});

    stops.forEach(function (stop) { io.observe(stop); });

    function noteUserScroll() {
      userInteractedAt = Date.now();
    }
    window.addEventListener('wheel', noteUserScroll, {passive:true});
    window.addEventListener('touchmove', noteUserScroll, {passive:true});
    window.addEventListener('pointerdown', function () {
      if (!playing && audio.paused) tryPlay();
    }, {passive:true, once:false});

    audio.addEventListener('loadedmetadata', function () {
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        if (Math.abs(audio.duration - fallbackDuration) > 0.5) {
          var ratio = audio.duration / fallbackDuration;
          timing.forEach(function (item) {
            item.start *= ratio;
            item.end *= ratio;
          });
          fallbackDuration = audio.duration;
        }
        status.textContent = 'Audio listo · ' + stamp(audio.duration) + ' · 10 estaciones.';
      }
      updateProgress();
    });

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('play', function () { setPlaying(true); });
    audio.addEventListener('pause', function () { setPlaying(false); });
    audio.addEventListener('ended', function () {
      setPlaying(false);
      status.textContent = 'Fin de la grabación. Puedes volver a cualquier estación.';
      setActive(9, -1);
    });
    audio.addEventListener('error', function () {
      failAudio('No se pudo cargar el audio. La transcripción sigue disponible.');
    });

    audio.src = data.audio;
    audio.load();
    makeTiming();
    wordButtons = mount.querySelectorAll('.story-word');
    updateProgress();

    // Intento de autoplay; los navegadores con bloqueo quedan listos con el primer toque.
    tryPlay();
  }

  fetch(DATA_URL, {cache:'no-store'})
    .then(function (response) {
      if (!response.ok) throw new Error('data');
      return response.json();
    })
    .then(build)
    .catch(function () {
      mount.innerHTML = '<div class="story-error"><strong>No se pudo cargar el relato.</strong><p>La página inferior permanece disponible. Reintenta la carga para abrir la experiencia sonora.</p></div>';
    });
})();