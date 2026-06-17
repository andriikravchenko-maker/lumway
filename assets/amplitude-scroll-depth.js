(function () {
  'use strict';

  var MILESTONES = [25, 50, 75, 90, 100];
  var POLL_MS = 150;
  var POLL_MAX = 400;
  var TICK_MS = 750;

  var fired = Object.create(null);
  var trackFn = null;
  var pending = [];
  var ticking = false;
  var lastScrollTarget = null;

  function resolveAmplitudeTrack() {
    var amp = window.amplitude;
    if (!amp) return null;
    if (typeof amp.track === 'function') return amp.track.bind(amp);
    if (amp.default && typeof amp.default.track === 'function') {
      return amp.default.track.bind(amp.default);
    }
    if (typeof amp.getInstance === 'function') {
      try {
        var inst = amp.getInstance();
        if (inst && typeof inst.logEvent === 'function') {
          return function (name, props) {
            inst.logEvent(name, props);
          };
        }
      } catch (e) {}
    }
    return null;
  }

  function flushPending() {
    while (pending.length && trackFn) {
      var item = pending.shift();
      try {
        trackFn('scroll_depth', item);
      } catch (e) {}
    }
  }

  function setTrackFn(fn) {
    if (trackFn || !fn) return;
    trackFn = fn;
    flushPending();
  }

  function emit(percent, page) {
    var payload = { percent: percent, page: page };
    if (trackFn) {
      try {
        trackFn('scroll_depth', payload);
      } catch (e) {}
    } else {
      pending.push(payload);
    }
  }

  function scrollPercent() {
    var doc = document.documentElement;
    var body = document.body;
    var scrollTop = window.scrollY != null ? window.scrollY : window.pageYOffset;
    if (!scrollTop && doc) scrollTop = doc.scrollTop;
    if (!scrollTop && body) scrollTop = body.scrollTop;

    var docHeight = Math.max(
      body ? body.scrollHeight : 0,
      body ? body.offsetHeight : 0,
      doc ? doc.scrollHeight : 0,
      doc ? doc.offsetHeight : 0,
      doc ? doc.clientHeight : 0
    );
    var winH = window.innerHeight || (doc && doc.clientHeight) || 0;
    var maxScroll = docHeight - winH;
    if (maxScroll <= 0) return 100;
    return Math.min(100, Math.round((scrollTop / maxScroll) * 100));
  }

  function scrollPercentForElement(el) {
    if (!el || el.nodeType !== 1) return 0;
    var range = el.scrollHeight - el.clientHeight;
    if (range <= 0) return 0;
    return Math.min(100, Math.round((el.scrollTop / range) * 100));
  }

  function flush() {
    var p = scrollPercent();
    if (lastScrollTarget && lastScrollTarget !== document && lastScrollTarget !== document.documentElement) {
      p = Math.max(p, scrollPercentForElement(lastScrollTarget));
    }
    var path = window.location.pathname || '/';
    for (var i = 0; i < MILESTONES.length; i++) {
      var m = MILESTONES[i];
      if (p >= m && !fired[m]) {
        fired[m] = true;
        emit(m, path);
      }
    }
  }

  function onScroll(e) {
    if (e && e.target) lastScrollTarget = e.target;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      flush();
    });
  }

  function bindScroll() {
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    if (window.visualViewport) {
      window.visualViewport.addEventListener('scroll', onScroll, { passive: true });
      window.visualViewport.addEventListener('resize', onScroll, { passive: true });
    }
    setInterval(flush, TICK_MS);
  }

  function waitAmplitude() {
    var n = 0;
    (function poll() {
      var t = resolveAmplitudeTrack();
      if (t) {
        setTrackFn(t);
        flush();
        return;
      }
      if (++n < POLL_MAX) setTimeout(poll, POLL_MS);
    })();
  }

  function start() {
    bindScroll();
    waitAmplitude();
    flush();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  window.addEventListener('load', function () {
    var t = resolveAmplitudeTrack();
    if (t) setTrackFn(t);
    flush();
  });
})();
