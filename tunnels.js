/* tunnels.js - put next to your pages on GitHub Pages and load it BEFORE auth.js / your checkout code:
     <script src="tunnels.js"></script>

   payserver pushes tunnels.json to your repo every time the tunnels restart:
     {"v":1794857641,"updated":"...","pay":["https://a.trycloudflare.com", ...],"perks":["https://b.trycloudflare.com", ...]}

   Use it instead of a fixed API_BASE:
     const r  = await Tunnels.fetch('pay',   '/api/create-order', { tier, credential, currency });   // a Response
     const d  = await Tunnels.json('perks', '/api/perks',        { credential });                   // parsed JSON
     Tunnels.onChange(list => console.log('new tunnels', list));

   It re-reads tunnels.json every 30 s (and when the tab becomes visible again), so visitors who still have the old
   page open switch to the new links by themselves, with no reload. If a link stops answering it tries the next one,
   then re-reads tunnels.json and tries once more. */
(function () {
  'use strict';
  var MANIFEST = 'tunnels.json';      // path of the file on your site (relative to the page). Change if you put it in a folder.
  var POLL_MS = 30000;
  var data = null, listeners = [];

  function okUrl(u) { return typeof u === 'string' && /^https:\/\/[a-z0-9.-]+$/i.test(u); }
  function clean(d) {
    if (!d || !Array.isArray(d.pay) || !Array.isArray(d.perks)) return null;
    return { v: d.v, updated: d.updated, pay: d.pay.filter(okUrl), perks: d.perks.filter(okUrl) };
  }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  async function load() {
    try {
      var r = await fetch(MANIFEST + '?t=' + Date.now(), { cache: 'no-store' });   // ?t= gets around browser/CDN caches
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var d = clean(await r.json());
      if (!d) throw new Error('bad file');
      var changed = !data || d.v !== data.v;
      data = d;
      try { localStorage.setItem('tunnels', JSON.stringify(d)); } catch (e) {}
      if (changed) listeners.forEach(function (f) { try { f(d); } catch (e) {} });
    } catch (e) {
      if (!data) { try { data = clean(JSON.parse(localStorage.getItem('tunnels'))); } catch (e2) {} }   // last known links
    }
    return data;
  }

  // a tunnel that is down answers with a Cloudflare error (502/504/52x) or not at all; our own server never sends those
  function tunnelDown(status) { return status === 502 || status === 504 || (status >= 520 && status <= 530); }

  async function call(role, path, body) {
    var lastErr = new Error('no ' + role + ' tunnel available');
    for (var round = 0; round < 2; round++) {
      var d = (round === 0 && data) ? data : await load();
      var list = shuffle((d && d[role]) || []);
      for (var i = 0; i < list.length; i++) {
        try {
          var r = await fetch(list[i] + path, {
            method: body === undefined ? 'GET' : 'POST',
            headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body)
          });
          if (!tunnelDown(r.status)) return r;      // a real answer from payserver (even an error like 401): hand it back
          lastErr = new Error('tunnel down (' + r.status + ')');
        } catch (e) { lastErr = e; }                // network error: try the next tunnel
      }
    }
    throw lastErr;
  }

  window.Tunnels = {
    fetch: call,
    json: async function (role, path, body) { var r = await call(role, path, body); return r.json(); },
    url: async function (role) { var d = data || await load(); var l = (d && d[role]) || []; return l.length ? l[Math.floor(Math.random() * l.length)] : null; },
    onChange: function (f) { listeners.push(f); if (data) { try { f(data); } catch (e) {} } },
    reload: load,
    get current() { return data; }
  };

  load();
  setInterval(load, POLL_MS);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) load(); });
})();
