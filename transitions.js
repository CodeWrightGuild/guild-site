/* Smooth page transitions for the whole site. Load it in the <head> of every page, before anything else:
     <script src="transitions.js"></script>

   Browsers with cross-page View Transitions (Chrome / Edge / Safari 18.2+): pages cross-fade, and the Aegis logo glides from
   where you clicked it to where it sits on the next page.
   Other browsers (Firefox): the page fades out a touch before it navigates, and the next page fades in.
   For in-page changes (e.g. the dashboard's product view) use  CWTransition.run(function(){ ...change the DOM... }). */
(function () {
  'use strict';
  var NAME = 'aegis-logo';
  var xdoc = 'PageRevealEvent' in window;                                  /* cross-document view transitions available? */
  var sdoc = typeof document.startViewTransition === 'function';          /* same-document ones? */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var css =
    '@view-transition{navigation:auto}' +
    '::view-transition-old(root){animation:cw-vt-out .3s cubic-bezier(.4,0,1,1) both}' +
    '::view-transition-new(root){animation:cw-vt-in .55s cubic-bezier(.2,.7,.2,1) .04s both}' +
    '@keyframes cw-vt-out{to{opacity:0;transform:scale(.985)}}' +
    '@keyframes cw-vt-in{from{opacity:0;transform:scale(1.012)}}' +
    '::view-transition-group(' + NAME + '){animation-duration:.75s;animation-timing-function:cubic-bezier(.2,.8,.2,1)}' +
    '::view-transition-old(' + NAME + '),::view-transition-new(' + NAME + '){height:100%;width:100%;object-fit:contain}' +
    /* fallback for browsers without View Transitions */
    '@keyframes cw-enter{from{opacity:0;transform:translateY(6px) scale(.992)}to{opacity:1;transform:none}}' +
    'html.cw-fallback body{animation:cw-enter .45s cubic-bezier(.2,.7,.2,1) both!important}' +
    'html.cw-leaving body{opacity:0;transform:scale(.985);transition:opacity .26s cubic-bezier(.4,0,1,1),transform .26s cubic-bezier(.4,0,1,1)}' +
    '@media (prefers-reduced-motion:reduce){::view-transition-group(*),::view-transition-old(*),::view-transition-new(*){animation:none!important}' +
    'html.cw-fallback body{animation:none!important}html.cw-leaving body{transition:none}}';
  var st = document.createElement('style'); st.id = 'cw-vt-style'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
  if (!xdoc) document.documentElement.classList.add('cw-fallback');

  /* the logo to morph: the one inside whatever was clicked, else the first one on the page */
  var lastZone = null;
  document.addEventListener('pointerdown', function (e) {
    var z = e.target.closest ? e.target.closest('.card,.own,.more-item,a,button') : null;
    lastZone = z; 
  }, true);
  function pickLogo() {
    var z = lastZone && lastZone.closest ? (lastZone.closest('.card,.own,.more-item') || lastZone) : null;
    var l = z && z.querySelector ? z.querySelector('.aegis-logo') : null;
    return l || document.querySelector('.aegis-logo');
  }
  function clearNames() {
    Array.prototype.forEach.call(document.querySelectorAll('.aegis-logo'), function (l) { l.style.viewTransitionName = ''; });
  }
  function toAegis(url) { return /aegis-anti-cheat/i.test(String(url || '')); }

  /* leaving a page: tag the logo that should fly */
  window.addEventListener('pageswap', function (e) {
    if (!e.viewTransition || reduce) return;
    var dest = e.activation && e.activation.entry && e.activation.entry.url;
    if (location.pathname.indexOf('aegis-anti-cheat') > -1) return;      /* the Aegis page names its own logo in CSS */
    if (toAegis(dest)) { clearNames(); var l = pickLogo(); if (l) l.style.viewTransitionName = NAME; }
  });
  /* arriving: if the logo on this page isn't named in CSS, clear stray names from a restored page */
  window.addEventListener('pagereveal', function (e) {
    if (!e.viewTransition) return;
    e.viewTransition.finished.then(clearNames, clearNames);
  });

  /* fallback: fade the page out, then go */
  if (!xdoc && !reduce) {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a[href]') : null;
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.origin !== location.origin) return;
      if (u.pathname === location.pathname && u.search === location.search) return;   /* in-page anchors etc. */
      e.preventDefault();
      document.documentElement.classList.add('cw-leaving');
      setTimeout(function () { location.href = u.href; }, 260);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) document.documentElement.classList.remove('cw-leaving'); });
  }

  window.CWTransition = {
    /* run a DOM change inside a view transition (or just run it where unsupported) */
    run: function (change, opts) {
      opts = opts || {};
      if (!sdoc || reduce) { change(); return Promise.resolve(); }
      var logo = opts.logo || null;
      if (logo) logo.style.viewTransitionName = NAME;
      var vt = document.startViewTransition(function () { change(); if (opts.logoAfter) { if (logo) logo.style.viewTransitionName = ''; var n = typeof opts.logoAfter === 'function' ? opts.logoAfter() : opts.logoAfter; if (n) n.style.viewTransitionName = NAME; } });
      var done = function () { if (logo) logo.style.viewTransitionName = ''; clearNames(); };
      vt.finished.then(done, done);
      return vt.finished;
    },
    NAME: NAME
  };
})();
