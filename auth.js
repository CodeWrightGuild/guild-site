/* Codewright Guild — site-wide account system (sign in, profile, products).
   Include on any page with:  <script src="auth.js" defer></script>
   It adds the Log in / Sign up buttons to the nav (or the profile avatar once signed in). */
(function () {
  'use strict';

  /* ───────── CONFIG (same values as the Aegis checkout page) ───────── */
  /* No fixed server address: tunnels.js reads tunnels.json (written by payserver) and picks a live tunnel. */
  var me = document.currentScript;
  var TUNNELS_SRC = me && me.src ? me.src.replace(/auth\.js(\?.*)?$/, 'tunnels.js') : 'tunnels.js';
  var tunP = null;
  function loadTunnels() {
    if (window.Tunnels) return Promise.resolve();
    if (!tunP) tunP = new Promise(function (ok, no) {
      var sc = document.createElement('script');
      sc.src = TUNNELS_SRC; sc.onload = ok; sc.onerror = function () { tunP = null; no(new Error('tunnels.js not found')); };
      document.head.appendChild(sc);
    });
    return tunP;
  }
  function api(role, path, body) { return loadTunnels().then(function () { return Tunnels.fetch(role, path, body); }); }
  loadTunnels().catch(function () {});

  var GOOGLE_CLIENT_ID = '373430665290-8ur1mmnvi6ei73ic3gsbmajm7eopgbb3.apps.googleusercontent.com';
  var STORE_KEY = 'cw-account';

  /* ───────── helpers ───────── */
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }

  /* ───────── session (kept in localStorage so it survives refreshes and other pages) ───────── */
  var acct = null; /* {session, email, name, picture} */
  try { acct = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch (e) { acct = null; }
  if (acct && !acct.session) acct = null;

  function saveAcct() {
    try {
      if (acct) localStorage.setItem(STORE_KEY, JSON.stringify(acct));
      else localStorage.removeItem(STORE_KEY);
    } catch (e) {}
  }

  /* Google's ID token is a JWT. We only read name/picture from it for display; the server is what verifies it. */
  function jwtClaims(jwt) {
    try {
      var p = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      while (p.length % 4) p += '=';
      return JSON.parse(decodeURIComponent(Array.prototype.map.call(atob(p), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')));
    } catch (e) { return {}; }
  }

  /* ───────── styles (uses the site's own theme variables) ───────── */
  var css = '\
.cw-auth{display:flex;align-items:center;gap:8px}\
.cw-auth .btn{padding:9px 16px;font-size:13.5px;border-radius:10px}\
.cw-avatar{width:38px;height:38px;border-radius:50%;border:1px solid var(--line);background:var(--grad);color:var(--on-accent);\
  font-weight:700;font-size:15px;display:grid;place-items:center;cursor:pointer;padding:0;overflow:hidden;font-family:inherit;\
  transition:transform .2s var(--ease),border-color .2s,box-shadow .25s}\
.cw-avatar:hover{transform:translateY(-1px);border-color:var(--accent);box-shadow:var(--glow)}\
.cw-avatar img{width:100%;height:100%;object-fit:cover;display:block}\
dialog.cw-dlg{margin:auto;padding:0;border:1px solid var(--line);border-radius:18px;background:var(--card-bg);color:var(--ink);\
  width:min(460px,94vw);max-height:92vh;overflow:auto;box-shadow:var(--shadow)}\
dialog.cw-dlg.wide{width:min(640px,94vw)}\
dialog.cw-dlg::backdrop{background:rgba(2,10,6,.62);backdrop-filter:blur(6px)}\
.cw-x{position:absolute;top:12px;right:14px;width:34px;height:34px;border-radius:10px;border:1px solid var(--line);background:transparent;\
  color:var(--muted);font-size:20px;line-height:1;cursor:pointer;display:grid;place-items:center;transition:all .2s}\
.cw-x:hover{color:var(--ink);border-color:var(--accent)}\
.cw-body{padding:34px 30px 28px;position:relative}\
.cw-body h2{font-size:22px;letter-spacing:-.01em;margin-bottom:6px;padding-right:36px}\
.cw-sub{color:var(--muted);font-size:14px;margin-bottom:22px}\
.cw-host{min-height:44px;margin-bottom:10px;display:flex;justify-content:center}\
.cw-prov{width:100%;margin:0 0 10px;color:#fff!important;border:0}\
.cw-msg{min-height:20px;font-size:13.5px;color:var(--muted);margin-top:8px}\
.cw-msg.err{color:var(--bad)}\
.cw-fine{font-size:12px;color:var(--muted);margin-top:14px;line-height:1.5}\
.cw-fine a{color:var(--accent)}\
.cw-head{display:flex;align-items:center;gap:14px;margin-bottom:20px;padding-right:40px}\
.cw-head .cw-avatar{width:48px;height:48px;cursor:default;flex:none}\
.cw-head .cw-avatar:hover{transform:none;box-shadow:none;border-color:var(--line)}\
.cw-who b{display:block;font-size:16px}\
.cw-who span{display:block;font-size:13px;color:var(--muted);word-break:break-all}\
.cw-tabs{display:flex;gap:4px;border-bottom:1px solid var(--line);margin-bottom:18px}\
.cw-tab{background:none;border:0;border-bottom:2px solid transparent;color:var(--muted);font-weight:600;font-size:14px;font-family:inherit;\
  padding:10px 14px;cursor:pointer;margin-bottom:-1px;transition:color .15s,border-color .15s}\
.cw-tab:hover{color:var(--ink)}\
.cw-tab[aria-selected="true"]{color:var(--accent);border-bottom-color:var(--accent)}\
.cw-list{display:grid;gap:10px}\
.cw-dashlink{margin-left:auto;align-self:center;font-size:13.5px;font-weight:600;color:var(--accent);text-decoration:none;padding:6px 4px}\
.cw-dashlink:hover{text-decoration:underline}\
.cw-prod{display:flex;align-items:center;gap:14px;width:100%;text-align:left;font-family:inherit;color:inherit;cursor:pointer;\
  background:var(--paper-2);border:1px solid var(--line);border-radius:14px;padding:14px 16px;transition:all .22s var(--ease)}\
.cw-prod:hover{border-color:var(--accent);transform:translateY(-2px);box-shadow:var(--shadow)}\
.cw-mark{flex:none;width:44px;height:44px;border-radius:12px;background:var(--grad);color:var(--on-accent);display:grid;place-items:center;\
  font:800 18px \"Iowan Old Style\",Georgia,serif}\
.cw-prod .t{flex:1;min-width:0}\
.cw-prod .t b{display:block;font-size:15px}\
.cw-prod .t span{display:block;font-size:12.5px;color:var(--muted)}\
.cw-pill{font-size:11.5px;font-weight:700;padding:3px 10px;border-radius:99px;background:var(--accent-soft);color:var(--accent)}\
.cw-empty{text-align:center;padding:30px 10px;color:var(--muted);font-size:14px}\
.cw-empty a{color:var(--accent);font-weight:600}\
.cw-back{background:none;border:0;color:var(--muted);cursor:pointer;font-weight:600;font-size:13px;font-family:inherit;padding:0;margin-bottom:14px}\
.cw-back:hover{color:var(--accent)}\
.cw-kv{display:grid;grid-template-columns:auto 1fr;gap:8px 18px;font-size:14px;margin:14px 0}\
.cw-kv dt{color:var(--muted)}\
.cw-kv dd{margin:0;word-break:break-all}\
.cw-soon{border:1px dashed var(--line);border-radius:12px;padding:16px;color:var(--muted);font-size:13.5px;text-align:center}\
.cw-out{margin-top:6px}\
@media (max-width:760px){.cw-auth .btn{padding:8px 12px;font-size:13px}.cw-auth .cw-signup{display:none}}\
';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ───────── nav buttons / avatar ───────── */
  var slot = document.createElement('div'); slot.className = 'cw-auth'; slot.id = 'cw-auth';

  function initial() {
    var n = (acct && (acct.name || acct.email)) || '?';
    return n.trim().charAt(0).toUpperCase();
  }
  function avatarInner() {
    return acct && acct.picture
      ? '<img src="' + esc(acct.picture) + '" alt="" referrerpolicy="no-referrer">'
      : esc(initial());
  }

  function renderNav() {
    if (acct) {
      slot.innerHTML = '<button class="cw-avatar" type="button" aria-label="Open your profile" aria-haspopup="dialog">' + avatarInner() + '</button>';
      $('.cw-avatar', slot).addEventListener('click', openProfile);
    } else {
      slot.innerHTML =
        '<button class="btn btn-ghost cw-login" type="button">Log in</button>' +
        '<button class="btn btn-primary cw-signup" type="button">Sign up</button>';
      $('.cw-login', slot).addEventListener('click', function () { openLogin('login'); });
      $('.cw-signup', slot).addEventListener('click', function () { openLogin('signup'); });
    }
    try { window.dispatchEvent(new CustomEvent('cw-auth')); } catch (e) {}   /* lets pages such as dashboard.html react to sign-in / sign-out */
  }

  /* ───────── login dialog ───────── */
  var loginDlg = null, gsiInit = false, gsiP = null;

  function loadGsi() {
    if (window.google && google.accounts && google.accounts.id) return Promise.resolve();
    if (!gsiP) gsiP = new Promise(function (ok, no) {
      var sc = document.createElement('script');
      sc.src = 'https://accounts.google.com/gsi/client'; sc.async = true; sc.defer = true;
      sc.onload = ok; sc.onerror = function () { gsiP = null; no(); };
      document.head.appendChild(sc);
    });
    return gsiP;
  }

  function buildLogin() {
    loginDlg = document.createElement('dialog');
    loginDlg.className = 'cw-dlg';
    loginDlg.setAttribute('aria-labelledby', 'cw-login-title');
    loginDlg.innerHTML =
      '<div class="cw-body">' +
      '<button class="cw-x" type="button" aria-label="Close">&times;</button>' +
      '<h2 id="cw-login-title"></h2><p class="cw-sub" id="cw-login-sub"></p>' +
      '<div class="cw-host" id="cw-g-host"></div>' +
      '<p class="cw-msg" id="cw-msg" role="status"></p>' +
      '<p class="cw-fine">We only receive your name and verified email from Google, never your password. See our <a href="privacy.html">privacy policy</a>.</p>' +
      '</div>';
    document.body.appendChild(loginDlg);
    $('.cw-x', loginDlg).addEventListener('click', function () { loginDlg.close(); });
    loginDlg.addEventListener('click', function (e) { if (e.target === loginDlg) loginDlg.close(); });
  }

  function setMsg(t, err) { var m = $('#cw-msg'); if (m) { m.textContent = t || ''; m.className = 'cw-msg' + (err ? ' err' : ''); } }

  function onGoogle(resp) {
    if (!resp || !resp.credential) { setMsg('Google sign-in was cancelled.', true); return; }
    setMsg('Signing you in\u2026');
    var claims = jwtClaims(resp.credential);
    api('perks', '/api/login', { provider: 'google', value: resp.credential }).then(function (r) {
      if (!r.ok) { var e = new Error('http'); e.status = r.status; throw e; }
      return r.json();
    }).then(function (o) {
        acct = { session: o.session, email: o.email, name: claims.name || '', picture: claims.picture || '' };
        saveAcct(); renderNav();
        loginDlg.close();
        if (!window.CW_NO_PROFILE_ON_LOGIN) openProfile();
      })
      .catch(function (e) {
        console.error('[cw-auth] /api/login failed', e);
        if (e && e.status) {
          setMsg('The server rejected the sign-in (error ' + e.status + '). Make sure your Google account has a verified email, then try again.', true);
        } else {
          var none = e && e.tried && !e.tried.length;
          setMsg(none
            ? 'No Codewright server is listed right now. Please try again in a few minutes.'
            : 'Can\u2019t reach the Codewright server right now (it may be offline, or blocking this site). Please try again later.', true);
        }
      });
  }

  function openLogin(mode) {
    if (!loginDlg) buildLogin();
    var signup = mode === 'signup';
    $('#cw-login-title').textContent = signup ? 'Create your account' : 'Welcome back';
    $('#cw-login-sub').textContent = signup
      ? 'Sign up with Google to buy and manage your Codewright Guild products.'
      : 'Log in to see the products you own.';
    setMsg('');
    var host = $('#cw-g-host'); host.innerHTML = '';
    if (!loginDlg.open) loginDlg.showModal();
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.indexOf('YOUR_') === 0) { host.innerHTML = '<p class="cw-sub">Sign-in is not switched on yet.</p>'; return; }
    loadGsi().then(function () {
      if (!gsiInit) {
        google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onGoogle, auto_select: false, cancel_on_tap_outside: true });
        gsiInit = true;
      }
      var w = Math.max(200, Math.min(400, Math.round(host.clientWidth || 320)));
      google.accounts.id.renderButton(host, {
        type: 'standard', theme: isDark() ? 'filled_black' : 'outline', size: 'large',
        text: signup ? 'signup_with' : 'signin_with', shape: 'rectangular', logo_alignment: 'left', width: w
      });
    }).catch(function () {
      host.innerHTML = '<p class="cw-sub">Could not load Google sign-in. Check your connection or ad-blocker and try again.</p>';
    });
  }

  /* ───────── profile dialog (Products / Account tabs) ───────── */
  var profDlg = null, purchases = null;

  function signOut() {
    acct = null; purchases = null; saveAcct();
    try { if (window.google && google.accounts && google.accounts.id) google.accounts.id.disableAutoSelect(); } catch (e) {}
    if (profDlg) profDlg.close();
    renderNav();
  }

  function buildProfile() {
    profDlg = document.createElement('dialog');
    profDlg.className = 'cw-dlg wide';
    profDlg.setAttribute('aria-label', 'Your profile');
    document.body.appendChild(profDlg);
    profDlg.addEventListener('click', function (e) { if (e.target === profDlg) profDlg.close(); });
  }

  function openProfile() {
    if (!acct) { openLogin('login'); return; }
    if (!profDlg) buildProfile();
    profDlg.innerHTML =
      '<div class="cw-body">' +
      '<button class="cw-x" type="button" aria-label="Close">&times;</button>' +
      '<div class="cw-head"><span class="cw-avatar">' + avatarInner() + '</span>' +
      '<div class="cw-who"><b>' + esc(acct.name || 'Your account') + '</b><span>' + esc(acct.email) + '</span></div></div>' +
      '<div class="cw-tabs" role="tablist">' +
      '<button class="cw-tab" role="tab" data-tab="products" aria-selected="true">Products</button>' +
      '<button class="cw-tab" role="tab" data-tab="account" aria-selected="false">Account</button>' +
      '<a class="cw-dashlink" href="dashboard.html">Dashboard &rarr;</a></div>' +
      '<div id="cw-pane"></div></div>';
    $('.cw-x', profDlg).addEventListener('click', function () { profDlg.close(); });
    Array.prototype.forEach.call(profDlg.querySelectorAll('.cw-tab'), function (t) {
      t.addEventListener('click', function () { showTab(t.getAttribute('data-tab')); });
    });
    if (!profDlg.open) profDlg.showModal();
    showTab('products');
  }

  function showTab(name) {
    Array.prototype.forEach.call(profDlg.querySelectorAll('.cw-tab'), function (t) {
      t.setAttribute('aria-selected', String(t.getAttribute('data-tab') === name));
    });
    if (name === 'account') renderAccount(); else renderProducts();
  }

  function renderAccount() {
    $('#cw-pane', profDlg).innerHTML =
      '<dl class="cw-kv"><dt>Email</dt><dd>' + esc(acct.email) + '</dd><dt>Sign-in</dt><dd>Google</dd></dl>' +
      '<button class="btn btn-ghost cw-out" type="button">Sign out</button>';
    $('.cw-out', profDlg).addEventListener('click', signOut);
  }

  /* Expected server reply for POST /api/purchases {credential}:
       { "purchases": [ { "product":"Aegis-Anti-Cheat", "tier":"Plus", "date":"2026-11-14", "order":"5O190127TN364715T", "status":"paid" } ] }
     (field names are tolerant; see normalise()) */
  function normalise(p) {
    return {
      product: p.product || p.name || 'Product',
      tier: p.tier || p.plan || '',
      date: p.date || p.purchased_at || p.created || '',
      order: p.order || p.order_id || p.id || '',
      amount: p.amount || '',
      status: p.status || 'paid'
    };
  }

  function loadPurchases() {
    return api('perks', '/api/purchases', { credential: acct.session }).then(function (r) {
      if (r.status === 401) { var e = new Error('expired'); e.expired = true; throw e; }
      if (r.status === 404) return { purchases: [], pending: true };  /* server endpoint not built yet */
      if (!r.ok) throw new Error('server');
      return r.json();
    }).then(function (o) { return { list: (o.purchases || []).map(normalise).reverse(), pending: !!o.pending }; });
  }

  function renderProducts() {
    var pane = $('#cw-pane', profDlg);
    pane.innerHTML = '<p class="cw-empty">Loading your products\u2026</p>';
    var p = purchases ? Promise.resolve(purchases) : loadPurchases();
    p.then(function (res) {
      purchases = res;
      if (!res.list.length) {
        pane.innerHTML = '<div class="cw-empty">You haven\u2019t bought anything yet.<br><a href="aegis-anti-cheat.html">Browse Aegis-Anti-Cheat &rarr;</a></div>';
        return;
      }
      pane.innerHTML = '<div class="cw-list">' + res.list.map(function (x, i) {
        return '<button class="cw-prod" type="button" data-i="' + i + '"><span class="cw-mark">' + esc(x.product.charAt(0).toUpperCase()) + '</span>' +
          '<span class="t"><b>' + esc(x.product) + '</b><span>' + esc(x.tier ? x.tier + ' tier' : 'Purchased') + (x.date ? ' \u00b7 ' + esc(x.date) : '') + '</span></span>' +
          '<span class="cw-pill">' + esc(x.status) + '</span></button>';
      }).join('') + '</div>';
      Array.prototype.forEach.call(pane.querySelectorAll('.cw-prod'), function (b) {
        b.addEventListener('click', function () { renderDetail(res.list[+b.getAttribute('data-i')]); });
      });
    }).catch(function (e) {
      if (e && e.expired) { signOut(); openLogin('login'); setMsg('Your session expired. Please log in again.', true); return; }
      pane.innerHTML = '<p class="cw-empty">Couldn\u2019t load your products right now. Please try again in a moment.</p>';
    });
  }

  /* Detail view — placeholder for the next step (features + purchase info). */
  function renderDetail(x) {
    var pane = $('#cw-pane', profDlg);
    pane.innerHTML =
      '<button class="cw-back" type="button">&larr; All products</button>' +
      '<h2 style="font-size:20px">' + esc(x.product) + '</h2>' +
      '<dl class="cw-kv">' +
      (x.tier ? '<dt>Tier</dt><dd>' + esc(x.tier) + '</dd>' : '') +
      (x.date ? '<dt>Purchased</dt><dd>' + esc(x.date) + '</dd>' : '') +
      (x.amount ? '<dt>Paid</dt><dd>' + esc(x.amount) + '</dd>' : '') +
      (x.order ? '<dt>Order ID</dt><dd>' + esc(x.order) + '</dd>' : '') +
      '<dt>Status</dt><dd>' + esc(x.status) + '</dd></dl>' +
      '<div class="cw-soon">Feature list and licence details coming soon.</div>';
    $('.cw-back', pane).addEventListener('click', renderProducts);
  }

  window.CWAuth = { get user() { return acct; }, signOut: signOut, openLogin: openLogin, openProfile: openProfile };

  /* ───────── mount ───────── */
  function mount() {
    var host = $('.nav-auth-slot') || $('.nav-right');
    if (!host) return;
    host.appendChild(slot);
    renderNav();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();

  /* keep tabs in sync if the user signs out in another tab */
  window.addEventListener('storage', function (e) {
    if (e.key !== STORE_KEY) return;
    try { acct = JSON.parse(e.newValue || 'null'); } catch (x) { acct = null; }
    purchases = null; renderNav();
  });
})();
