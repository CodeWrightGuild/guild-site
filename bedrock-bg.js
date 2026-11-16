/* Animated Bedrock background, built from the real bedrock block texture (items/bedrock.png).
   Slowly drifting stone, a wandering teal light, a vignette and a few floating motes of void dust.

     BedrockBG.mount();                                   full-page, fixed behind everything (z-index 0)
     BedrockBG.mount(element, { dim: .5 });               fills a positioned element instead (e.g. a banner)
     var bg = BedrockBG.mount(...);  bg.destroy();        remove it again

   Options:  dim (0-1, how dark the stone is, default .55)   glow (light colour, default #34e0b8)
             speed (drift, default 1)   scale (px per texture pixel, default 4)   parallax (mouse, default true for full-page) */
(function () {
  'use strict';
  var me = document.currentScript;
  var BASE = me && me.src ? me.src.replace(/[^\/]*(\?.*)?$/, '') : '';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── texture (falls back to generated noise if the PNG is missing) ── */
  var tex = null, waiting = [];
  function ready(fn) { if (tex) fn(); else waiting.push(fn); }
  function setTex(t) { tex = t; waiting.splice(0).forEach(function (f) { f(); }); }
  (function load() {
    var im = new Image();
    im.onload = function () { setTex(im); };
    im.onerror = function () {
      var c = document.createElement('canvas'); c.width = c.height = 16;
      var x = c.getContext('2d'), d = x.createImageData(16, 16), i, v, seed = 7;
      for (i = 0; i < 256; i++) { seed = (seed * 1103515245 + 12345) & 0x7fffffff; v = 40 + (seed % 70); d.data[i * 4] = d.data[i * 4 + 1] = d.data[i * 4 + 2] = v; d.data[i * 4 + 3] = 255; }
      x.putImageData(d, 0, 0); setTex(c);
    };
    im.src = BASE + 'items/bedrock.png';
  })();

  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

  function mount(target, opts) {
    opts = opts || {};
    var page = !target;
    var host = target || document.body;
    var dim = opts.dim == null ? .55 : opts.dim, glow = opts.glow || '#34e0b8', speed = opts.speed == null ? 1 : opts.speed;
    var px = opts.scale || 4, parallax = opts.parallax == null ? page : opts.parallax;

    var cv = document.createElement('canvas');
    cv.setAttribute('aria-hidden', 'true');
    cv.className = 'bedrock-bg';
    cv.style.cssText = (page ? 'position:fixed;' : 'position:absolute;') + 'inset:0;width:100%;height:100%;z-index:' + (page ? 0 : 0) +
      ';pointer-events:none;opacity:0;transition:opacity .9s ease;image-rendering:pixelated';
    if (page) host.insertBefore(cv, host.firstChild); else { host.insertBefore(cv, host.firstChild); }
    var ctx = cv.getContext('2d', { alpha: false });

    var W = 0, H = 0, dpr = 1, P = 0, pat = null, dead = false, raf = 0, vis = true;
    var mx = 0, my = 0, tmx = 0, tmy = 0;
    var motes = [], rnd = rng(1337);
    var t0 = performance.now();

    function build() {
      if (!tex) return;
      var cell = Math.round(16 * px * dpr), N = 12;
      P = cell * N;
      var off = document.createElement('canvas'); off.width = off.height = P;
      var o = off.getContext('2d'); o.imageSmoothingEnabled = false;
      var r = rng(99), i, j, q;
      for (i = 0; i < N; i++) for (j = 0; j < N; j++) {          /* every block gets a random flip/turn like in the game, plus a little shade */
        o.save();
        o.translate(i * cell + cell / 2, j * cell + cell / 2);
        o.rotate((Math.floor(r() * 4)) * Math.PI / 2);
        if (r() < .5) o.scale(-1, 1);
        o.drawImage(tex, -cell / 2, -cell / 2, cell, cell);
        o.restore();
        q = (r() - .5) * .34;
        o.fillStyle = q > 0 ? 'rgba(255,255,255,' + q * .35 + ')' : 'rgba(0,0,0,' + (-q) + ')';
        o.fillRect(i * cell, j * cell, cell, cell);
        o.fillStyle = 'rgba(0,0,0,.28)';                           /* thin seams so the blocks read as blocks */
        o.fillRect(i * cell, j * cell, cell, Math.max(1, dpr));
        o.fillRect(i * cell, j * cell, Math.max(1, dpr), cell);
      }
      pat = ctx.createPattern(off, 'repeat');
    }

    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = page ? { width: innerWidth, height: innerHeight } : host.getBoundingClientRect();
      W = Math.max(1, Math.round(r.width * dpr)); H = Math.max(1, Math.round(r.height * dpr));
      cv.width = W; cv.height = H;
      var n = Math.round(Math.min(46, Math.max(14, (r.width * r.height) / 28000)));
      motes = [];
      for (var i = 0; i < n; i++) motes.push({ x: rnd(), y: rnd(), s: .6 + rnd() * 1.6, v: .008 + rnd() * .02, ph: rnd() * 6.28, a: .25 + rnd() * .5 });
      build(); frame(performance.now());
    }

    function frame(now) {
      if (dead || !pat) return;
      var t = (now - t0) / 1000 * (reduce ? 0 : speed);
      mx += (tmx - mx) * .06; my += (tmy - my) * .06;
      var ox = (t * 9 * dpr + mx * 26 * dpr) % P, oy = (t * 5 * dpr + my * 18 * dpr) % P;

      ctx.setTransform(1, 0, 0, 1, -ox, -oy);
      ctx.fillStyle = pat; ctx.fillRect(ox, oy, W, H);
      ctx.setTransform(1, 0, 0, 1, 0, 0);

      ctx.fillStyle = 'rgba(3,7,9,' + dim + ')'; ctx.fillRect(0, 0, W, H);                      /* darken */

      var gx = W * (.5 + .34 * Math.sin(t * .13) + mx * .06), gy = H * (.46 + .26 * Math.cos(t * .09) + my * .06);   /* wandering light */
      var gr = Math.max(W, H) * .55, g = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      g.addColorStop(0, rgba(glow, .20 + .03 * Math.sin(t * 1.3))); g.addColorStop(.45, rgba(glow, .06)); g.addColorStop(1, rgba(glow, 0));
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.globalCompositeOperation = 'source-over';

      var v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .25, W / 2, H / 2, Math.max(W, H) * .78);   /* vignette */
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.62)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = glow;                                                                        /* motes of void dust */
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.y -= m.v * (reduce ? 0 : speed) * .016; if (m.y < -.02) { m.y = 1.02; m.x = rnd(); }
        var a = m.a * (.55 + .45 * Math.sin(t * 1.6 + m.ph));
        ctx.globalAlpha = a * .6; var s = Math.max(1, Math.round(m.s * dpr));
        ctx.fillRect(Math.round((m.x + Math.sin(t * .2 + m.ph) * .01) * W), Math.round(m.y * H), s, s);
      }
      ctx.globalAlpha = 1;
    }
    function rgba(hex, a) {
      var h = hex.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&');
      return 'rgba(' + parseInt(h.substr(0, 2), 16) + ',' + parseInt(h.substr(2, 2), 16) + ',' + parseInt(h.substr(4, 2), 16) + ',' + a + ')';
    }

    function loop(now) {
      if (dead) return;
      if (vis && !document.hidden) frame(now);
      raf = requestAnimationFrame(loop);
    }

    function onMove(e) { tmx = e.clientX / innerWidth - .5; tmy = e.clientY / innerHeight - .5; }
    var ro = null, io = null;
    ready(function () {
      if (dead) return;
      size();
      requestAnimationFrame(function () { cv.style.opacity = '1'; });
      if (!reduce) raf = requestAnimationFrame(loop);
      if (page) addEventListener('resize', size); else if (window.ResizeObserver) { ro = new ResizeObserver(size); ro.observe(host); }
      if (parallax && !reduce) addEventListener('pointermove', onMove, { passive: true });
      if (!page && 'IntersectionObserver' in window) { io = new IntersectionObserver(function (es) { vis = es[es.length - 1].isIntersecting; }); io.observe(host); }
    });

    return {
      canvas: cv,
      destroy: function () {
        dead = true; cancelAnimationFrame(raf);
        removeEventListener('resize', size); removeEventListener('pointermove', onMove);
        if (ro) ro.disconnect(); if (io) io.disconnect();
        cv.style.opacity = '0'; setTimeout(function () { if (cv.parentNode) cv.parentNode.removeChild(cv); }, 700);
      }
    };
  }

  window.BedrockBG = { mount: mount };
})();
