/* OGP Analytics — privacy-first first-party telemetry.
 * Opt-in by default. No raw IP, MAC, or hardware fingerprint collection.
 */
(function () {
  "use strict";

  const DEFAULTS = {
    enabled: false,
    endpoint: "",
    consentKey: "ogp.analytics.consent.v1",
    visitorKey: "ogp.analytics.visitor_id.v1",
    sessionKey: "ogp.analytics.session_id.v1",
    sessionMaxAgeMs: 30 * 60 * 1000,
    maxQueue: 20,
    debug: false
  };

  const config = Object.assign({}, DEFAULTS, window.OGP_ANALYTICS_CONFIG || {});
  const state = {
    consent: null,
    visitorId: null,
    sessionId: null,
    queue: [],
    initialized: false,
    lastVisibilityTs: Date.now()
  };

  function log() {
    if (config.debug && window.console) {
      console.debug("[OGP analytics]", ...arguments);
    }
  }

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    throw new Error("crypto.randomUUID is required for OGP analytics");
  }

  function readJSON(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function writeJSON(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (_) {
      // Storage may be disabled; analytics can still work for the current page.
    }
  }

  function remove(key) {
    try { localStorage.removeItem(key); } catch (_) {}
  }

  function getConsent() {
    const value = readJSON(config.consentKey);
    if (!value || typeof value !== "object") return null;
    return {
      analytics: value.analytics === true,
      marketing: value.marketing === true,
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null
    };
  }

  function setConsent(value) {
    const consent = {
      analytics: value.analytics === true,
      marketing: value.marketing === true,
      updatedAt: new Date().toISOString()
    };

    writeJSON(config.consentKey, consent);
    state.consent = consent;

    if (consent.analytics) {
      ensureIdentity();
      bindCtas();
      drainQueue();
      track("page_view");
      startEngagementTracking();
    } else {
      state.queue.length = 0;
      state.visitorId = null;
      state.sessionId = null;
      remove(config.visitorKey);
      remove(config.sessionKey);
    }

    emit("consent_change", consent);
    return consent;
  }

  function ensureIdentity() {
    if (!state.consent?.analytics) return;

    let visitor = readJSON(config.visitorKey);
    if (!visitor || typeof visitor.id !== "string") {
      visitor = { id: uuid(), createdAt: Date.now() };
      writeJSON(config.visitorKey, visitor);
    }
    state.visitorId = visitor.id;

    const now = Date.now();
    let session = readJSON(config.sessionKey);
    if (
      !session ||
      typeof session.id !== "string" ||
      !Number.isFinite(session.lastSeen) ||
      now - session.lastSeen > config.sessionMaxAgeMs
    ) {
      session = { id: uuid(), lastSeen: now };
      trackInternalSessionStart = true;
    } else {
      session.lastSeen = now;
      trackInternalSessionStart = false;
    }

    writeJSON(config.sessionKey, session);
    state.sessionId = session.id;

    if (trackInternalSessionStart) {
      send(buildEvent("session_start"));
    }
  }

  let trackInternalSessionStart = false;

  function classifyDevice() {
    const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (width < 768) return "mobile";
    if (width < 1200) return "tablet";
    return "desktop";
  }

  function classifyBrowser() {
    const ua = navigator.userAgent || "";
    if (/Edg\//i.test(ua)) return "edge";
    if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) return "chrome";
    if (/Firefox\//i.test(ua)) return "firefox";
    if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return "safari";
    return "other";
  }

  function classifyOS() {
    const ua = navigator.userAgent || "";
    if (/Windows/i.test(ua)) return "windows";
    if (/Android/i.test(ua)) return "android";
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
    if (/Mac OS X/i.test(ua)) return "macos";
    if (/Linux/i.test(ua)) return "linux";
    return "other";
  }

  function classifyViewport() {
    const width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    if (width < 480) return "xs";
    if (width < 768) return "sm";
    if (width < 1200) return "md";
    if (width < 1600) return "lg";
    return "xl";
  }

  function campaignParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      campaign_source: params.get("utm_source"),
      campaign_medium: params.get("utm_medium"),
      campaign_name: params.get("utm_campaign"),
      campaign_content: params.get("utm_content"),
      campaign_term: params.get("utm_term")
    };
  }

  function buildEvent(name, extra) {
    return Object.assign({
      event_name: name,
      path: window.location.pathname,
      referrer: document.referrer || null,
      ...campaignParams(),
      visitor_id: state.consent?.analytics ? state.visitorId : null,
      session_id: state.consent?.analytics ? state.sessionId : null,
      country: null,
      region: null,
      device_class: classifyDevice(),
      browser_family: classifyBrowser(),
      os_family: classifyOS(),
      viewport_class: classifyViewport(),
      language: navigator.language || null,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || null,
      consent_analytics: state.consent?.analytics === true,
      consent_marketing: state.consent?.marketing === true,
      schema_version: "1"
    }, extra || {});
  }

  function send(event) {
    if (!state.consent?.analytics) return false;

    if (!config.endpoint) {
      state.queue.push(event);
      if (state.queue.length > config.maxQueue) state.queue.shift();
      log("queued", event);
      return true;
    }

    return fetch(config.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: [event] }),
      keepalive: true
    }).then(function (response) {
      if (!response.ok) throw new Error("analytics endpoint " + response.status);
      return response;
    }).catch(function (error) {
      log("send failed", error);
      return null;
    });
  }

  function drainQueue() {
    if (!config.endpoint || !state.consent?.analytics || !state.queue.length) return;
    const queued = state.queue.splice(0, state.queue.length);
    queued.forEach(send);
  }

  function track(name, extra) {
    if (!state.consent?.analytics) return null;
    ensureIdentity();
    const event = buildEvent(name, extra);
    send(event);
    return event;
  }

  function startEngagementTracking() {
    if (state.engagementStarted) return;
    state.engagementStarted = true;

    let maxScroll = 0;
    let lastSent = 0;

    function maybeScroll() {
      const documentHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        1
      );
      const viewportBottom = window.scrollY + window.innerHeight;
      const pct = Math.min(100, Math.round((viewportBottom / documentHeight) * 100));
      const threshold = Math.floor(pct / 25) * 25;
      if (threshold >= 25 && threshold > maxScroll) {
        maxScroll = threshold;
        track("engagement", { scroll_depth: threshold });
      }
    }

    function flushTime() {
      const now = Date.now();
      const seconds = Math.max(0, Math.round((now - state.lastVisibilityTs) / 1000));
      state.lastVisibilityTs = now;
      if (seconds >= 5 && now - lastSent >= 5000) {
        lastSent = now;
        track("engagement", { active_seconds: seconds });
      }
    }

    window.addEventListener("scroll", maybeScroll, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") flushTime();
      else state.lastVisibilityTs = Date.now();
    });
    window.addEventListener("beforeunload", flushTime);
    window.setInterval(function () {
      if (document.visibilityState === "visible") flushTime();
    }, 15000);
  }

  function bindCtas() {
    if (state.ctaBound) return;
    state.ctaBound = true;
    document.addEventListener("click", function (event) {
      const target = event.target.closest("a,button");
      if (!target || !state.consent?.analytics) return;

      const destination = target.href || target.getAttribute("data-destination");
      if (!destination) return;

      const label = (target.getAttribute("aria-label") || target.textContent || "")
        .trim()
        .replace(/\s+/g, " ")
        .slice(0, 160);

      if (
        target.matches("[data-analytics-cta]") ||
        target.closest("[data-analytics-cta]")
      ) {
        track("cta_click", {
          cta: label || "unlabeled",
          destination: String(destination).slice(0, 512)
        });
      }
    });
  }

  function emit(type, detail) {
    try {
      window.dispatchEvent(new CustomEvent("ogp:analytics", {
        detail: { type: type, ...detail }
      }));
    } catch (_) {}
  }

  function renderConsentBanner() {
    if (getConsent() !== null || document.getElementById("ogp-analytics-consent")) return;

    const banner = document.createElement("aside");
    banner.id = "ogp-analytics-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Preferencias de privacidad");
    banner.innerHTML =
      '<div style="position:fixed;left:16px;right:16px;bottom:16px;z-index:2147483647;max-width:760px;margin:auto;padding:16px;background:#fff;border:1px solid #777;box-shadow:0 8px 30px rgba(0,0,0,.18);font:14px/1.45 system-ui,sans-serif;color:#111">' +
      '<strong>Privacidad y analítica</strong>' +
      '<p style="margin:.5em 0">Podemos usar analítica estadística para entender las visitas y mejorar OGP. Es opcional y no incluye direcciones MAC ni una huella de hardware. Puedes rechazarla.</p>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button type="button" data-ogp-consent="reject">Rechazar</button>' +
      '<button type="button" data-ogp-consent="accept">Aceptar analítica</button>' +
      '</div></div>';

    banner.addEventListener("click", function (event) {
      const choice = event.target.getAttribute("data-ogp-consent");
      if (!choice) return;
      setConsent({
        analytics: choice === "accept",
        marketing: false
      });
      banner.remove();
    });

    document.body.appendChild(banner);
  }

  function init() {
    if (state.initialized) return;
    state.initialized = true;
    state.consent = getConsent();

    if (state.consent?.analytics) {
      ensureIdentity();
      bindCtas();
      track("page_view");
      startEngagementTracking();
      drainQueue();
    } else if (state.consent === null && config.enabled) {
      renderConsentBanner();
      bindCtas();
    }
  }

  window.OGPAnalytics = {
    init: init,
    track: track,
    getConsent: function () { return state.consent; },
    setConsent: setConsent,
    reset: function () {
      setConsent({ analytics: false, marketing: false });
      remove(config.consentKey);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();