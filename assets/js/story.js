(function () {
  'use strict';

  var mount = document.getElementById('relato-sonoro');
  if (!mount) return;

  var DATA_URL = 'assets/data/relato-ogp-phase2.json';
  var QC_URL = 'assets/data/relato-ogp-phase2-qc.json';
  var EDITORIAL_URL = 'assets/data/relato-ogp-phase2-editorial.json';
  var VERSION = '20261005-f2';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"]/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c];
    });
  }

  function time(sec) {
    sec = Number(sec);
    if (!Number.isFinite(sec) || sec < 0) return '—';
    var s = Math.round(sec);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function phaseFor(id) {
    var n = Number(id);
    if (n <= 4) return 'I';
    if (n <= 8) return 'II';
    if (n <= 12) return 'III';
    if (n <= 16) return 'IV';
    return 'V';
  }

  function loadJson(url) {
    return fetch(url + '?v=' + VERSION, {cache:'no-store'}).then(function (r) {
      if (!r.ok) throw new Error(url);
      return r.json();
    });
  }

  function render(data, qc) {
    var segments = Array.isArray(data.segments) ? data.segments.slice().sort(function (a,b) {
      return Number(a.id) - Number(b.id);
    }) : [];

    if (segments.length !== 20) throw new Error('Se esperaban 20 segmentos.');
    segments.forEach(function (s) {
      s.phase = s.phase || phaseFor(s.id);
    });

    var qcPassed = !!(qc && qc.status === 'passed' && qc.gate && Object.keys(qc.gate).every(function (k) {
      return qc.gate[k] === true;
    }));

    var phaseGroups = {
      I: segments.slice(0,4),
      II: segments.slice(4,8),
      III: segments.slice(8,12),
      IV: segments.slice(12,16),
      V: segments.slice(16,20)
    };

    mount.innerHTML =
      '<div class="story-intro">' +
        '<p class="story-kicker"><span class="story-live"></span> Otro Gran Programa · Fase 2</p>' +
        '<h1>La voz ya está dividida en veinte unidades reales.</h1>' +
        '<p class="story-dek">Cinco fases narrativas, veinte segmentos y veinte audios derivados del mismo máster de 23:11. Esta pantalla demuestra el resultado físico de la Fase 2; la sincronización palabra por palabra pertenece a la Fase 3.</p>' +
        '<div class="story-meta">' +
          '<span>5 fases</span><span>20 segmentos</span><span>20 audios independientes</span><span>23:11 máster</span>' +
          '<span>' + (qcPassed ? 'QC Fase 2 verificado' : 'QC Fase 2 pendiente') + '</span>' +
        '</div>' +
        '<p class="story-auto-note">Fuente canónica: MP3 maestro de GitHub Pages. Nombre visible: Otro Gran Programa. Nombre hablado conservado en la transcripción: Otro Gran Programa.</p>' +
      '</div>' +
      '<div class="story-player" aria-label="Reproductor de Fase 2">' +
        '<button class="story-play" type="button" aria-label="Reproducir segmento actual" title="Reproducir segmento actual">' +
          '<span aria-hidden="true">▶</span>' +
        '</button>' +
        '<div class="story-player-main">' +
          '<div class="story-player-line"><strong class="story-now">Selecciona un segmento</strong><span class="story-time">0:00 / 0:00</span></div>' +
          '<audio class="story-phase2-audio" preload="metadata" playsinline></audio>' +
        '</div>' +
        '<button class="story-follow-toggle" type="button" aria-pressed="false">Autoavance</button>' +
        '<div class="story-status" role="status">' + (qcPassed ? 'Fase 2: evidencia completa cargada.' : 'El resultado físico todavía no está certificado.') + '</div>' +
        '<div class="story-chapters" aria-label="Fases">' +
          Object.keys(phaseGroups).map(function (phase) {
            return '<button type="button" data-phase="' + phase + '"><span>F' + phase + '</span></button>';
          }).join('') +
        '</div>' +
        '<div class="story-segment-nav" aria-label="Segmentos">' +
          segments.map(function (s) {
            return '<button type="button" data-segment="' + esc(s.id) + '">' + esc(s.id) + '</button>';
          }).join('') +
        '</div>' +
      '</div>' +
      '<div class="story-phase-grid">' +
        Object.keys(phaseGroups).map(function (phase) {
          var first = phaseGroups[phase][0];
          return '<section class="story-phase" id="story-phase-' + phase + '">' +
            '<div class="story-phase-head">' +
              '<span class="story-label">Fase ' + phase + '</span>' +
              '<h2>' + esc(phase === 'I' ? 'La entrada' : phase === 'II' ? 'La alternativa' : phase === 'III' ? 'La propuesta' : phase === 'IV' ? 'El conflicto' : 'La distinción') + '</h2>' +
              '<p>Segmentos ' + esc(phaseGroups[phase][0].id) + '–' + esc(phaseGroups[phase][phaseGroups[phase].length - 1].id) + '</p>' +
            '</div>' +
            '<div class="story-segments">' +
              phaseGroups[phase].map(function (s) {
                return '<article class="story-segment" id="story-segment-' + esc(s.id) + '" data-segment="' + esc(s.id) + '">' +
                  '<div class="story-segment-head">' +
                    '<div><span class="story-label">Segmento ' + esc(s.id) + '</span><h3>' + esc(s.title) + '</h3></div>' +
                    '<span class="story-segment-phase">Fase ' + esc(s.phase) + '</span>' +
                  '</div>' +
                  '<p class="story-idea">' + esc(s.idea) + '</p>' +
                  '<div class="story-segment-proof">' +
                    '<span>Máster ' + esc(time(s.masterStart)) + ' → ' + esc(time(s.masterEnd)) + '</span>' +
                    '<span>Audio independiente</span>' +
                    '<span>' + esc(String(s.targetWordCount || '—')) + ' palabras canónicas</span>' +
                  '</div>' +
                  '<p class="story-segment-text">' + esc(s.text) + '</p>' +
                  '<button class="story-segment-play" type="button" data-play-segment="' + esc(s.id) + '">Reproducir este segmento</button>' +
                  '<code class="story-segment-source">' + esc(s.audio) + '</code>' +
                '</article>';
              }).join('') +
            '</div>' +
          '</section>';
        }).join('') +
      '</div>' +
      '<div class="story-end"><p>Fase 2 queda materializada en la experiencia pública.</p><span>La sincronización palabra por palabra y el motor narrativo definitivo se reservan para Fase 3.</span></div>';

    var audio = mount.querySelector('.story-phase2-audio');
    var playBtn = mount.querySelector('.story-play');
    var autoBtn = mount.querySelector('.story-follow-toggle');
    var now = mount.querySelector('.story-now');
    var timeLabel = mount.querySelector('.story-time');
    var status = mount.querySelector('.story-status');
    var segmentButtons = Array.prototype.slice.call(mount.querySelectorAll('[data-segment]'));
    var navButtons = Array.prototype.slice.call(mount.querySelectorAll('.story-segment-nav button'));
    var phaseButtons = Array.prototype.slice.call(mount.querySelectorAll('.story-chapters button'));
    var current = -1;
    var autoAdvance = false;

    function segmentIndex(id) {
      return segments.findIndex(function (s) { return String(s.id) === String(id); });
    }

    function active(id, scroll) {
      var idx = segmentIndex(id);
      if (idx < 0) return;
      current = idx;
      var s = segments[idx];
      audio.src = s.audio + '?v=' + VERSION;
      audio.load();
      now.textContent = 'Segmento ' + s.id + ' · ' + s.title;
      status.textContent = 'Cargado: ' + s.audio;
      navButtons.forEach(function (b) {
        var on = b.getAttribute('data-segment') === String(s.id);
        b.classList.toggle('is-active', on);
        if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      });
      segmentButtons.forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-segment') === String(s.id));
      });
      phaseButtons.forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-phase') === String(s.phase));
        b.setAttribute('aria-current', b.getAttribute('data-phase') === String(s.phase) ? 'true' : 'false');
      });
      if (scroll) {
        var card = document.getElementById('story-segment-' + s.id);
        if (card) card.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches ? 'auto' : 'smooth', block:'center'});
      }
    }

    function togglePlay() {
      if (current < 0) active('01', false);
      if (audio.paused) {
        audio.play().then(function () {
          playBtn.innerHTML = '<span aria-hidden="true">Ⅱ</span>';
          status.textContent = 'Reproduciendo segmento ' + segments[current].id + '.';
        }).catch(function () {
          status.textContent = 'El navegador bloqueó el inicio automático; pulsa reproducir otra vez.';
        });
      } else {
        audio.pause();
      }
    }

    navButtons.forEach(function (b) {
      b.addEventListener('click', function () { active(b.getAttribute('data-segment'), true); });
    });

    segmentButtons.forEach(function (b) {
      if (!b.classList.contains('story-segment')) return;
    });

    mount.querySelectorAll('[data-play-segment]').forEach(function (b) {
      b.addEventListener('click', function () {
        active(b.getAttribute('data-play-segment'), true);
        togglePlay();
      });
    });

    phaseButtons.forEach(function (b) {
      b.addEventListener('click', function () {
        var phase = b.getAttribute('data-phase');
        var first = phaseGroups[phase][0];
        active(first.id, true);
      });
    });

    playBtn.addEventListener('click', togglePlay);

    autoBtn.addEventListener('click', function () {
      autoAdvance = !autoAdvance;
      autoBtn.setAttribute('aria-pressed', String(autoAdvance));
      autoBtn.textContent = autoAdvance ? 'Autoavance activo' : 'Autoavance';
    });

    audio.addEventListener('loadedmetadata', function () {
      timeLabel.textContent = '0:00 / ' + time(audio.duration);
    });

    audio.addEventListener('timeupdate', function () {
      timeLabel.textContent = time(audio.currentTime) + ' / ' + time(audio.duration);
    });

    audio.addEventListener('play', function () {
      playBtn.innerHTML = '<span aria-hidden="true">Ⅱ</span>';
    });

    audio.addEventListener('pause', function () {
      playBtn.innerHTML = '<span aria-hidden="true">▶</span>';
    });

    audio.addEventListener('ended', function () {
      playBtn.innerHTML = '<span aria-hidden="true">▶</span>';
      if (!autoAdvance || current < 0 || current >= segments.length - 1) {
        status.textContent = 'Segmento terminado.';
        return;
      }
      active(segments[current + 1].id, false);
      audio.play().catch(function () {});
    });

    active('01', false);
  }

  Promise.all([loadJson(DATA_URL), loadJson(QC_URL)])
    .then(function (pair) { render(pair[0], pair[1]); })
    .catch(function () {
      loadJson(EDITORIAL_URL)
        .then(function (editorial) {
          render({
            version: editorial.version || 'editorial-preview',
            segments: (editorial.segments || []).map(function (s) {
              return {
                id:s.id, phase:phaseFor(s.id), title:s.title, idea:s.idea,
                sourceScene:s.sourceScene, text:s.text, targetWordCount:s.wordCount,
                masterStart:0, masterEnd:0, audio:''
              };
            })
          }, {status:'pending',gate:{},});
          var note = mount.querySelector('.story-status');
          if (note) note.textContent = 'Vista editorial de respaldo: los 20 audios físicos aún no están publicados.';
        })
        .catch(function () {
          mount.innerHTML = '<div class="story-error"><strong>No se pudo cargar la evidencia de Fase 2.</strong><p>El resto del sitio permanece disponible.</p></div>';
        });
    });
})();
