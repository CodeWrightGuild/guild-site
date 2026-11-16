/* Aegis-Anti-Cheat logo: a scanning shield in the middle, Minecraft-style items orbiting around it.
   Use anywhere:  <span class="aegis-logo" role="img" aria-label="Aegis-Anti-Cheat logo"></span>
   Include once:  <script src="aegis-logo.js" defer></script>      (it fills every .aegis-logo it finds)
   Size it with font-size (the logo is 1em x 1em):  .aegis-logo{font-size:180px}
   The items use the real 16x16 PNG textures in the /items folder (sword, axe, mace, spear, totem, lava, crystal, gapple,
   pearl, chorus). If a PNG fails to load, that item falls back to the built-in pixel sprite. Set USE_IMAGES = false to
   always use the built-in sprites.
   Spin speed is driven from JS (not CSS animation-duration) so hovering speeds the rings up smoothly instead of restarting them. */
(function () {
  'use strict';
  var me = document.currentScript;
  var BASE = me && me.src ? me.src.replace(/[^\/]*(\?.*)?$/, '') : '';   /* items/ is looked up next to this script, whichever page loads it */
  var USE_IMAGES = true;
  var PAL = {"k":"#18161c","n":"#3a343c","N":"#5f5660","m":"#8e828e","w":"#58381c","W":"#80562c","g":"#d4a01c","G":"#fad646","Y":"#fff4aa","y":"#ffb028","O":"#ec600c","i":"#686c74","I":"#b0b4bc","s":"#828892","c":"#34e4d0","C":"#befff6","P":"#6e1e96","M":"#be46d2","F":"#ffe6ff","H":"#ffffff","p":"#9630b4","r":"#56381e","B":"#966838","b":"#b4844a","l":"#3c8c32","L":"#6ec850","d":"#0c3c34","e":"#1a7864","E":"#32aa8c","f":"#5ad2aa","h":"#beffe6","u":"#6e3282","U":"#a66aba","Q":"#dcbee6","q":"#824696","a":"#503c28"};
  var SPR = {"sword":[".............kk.","............knNk","...........kNnnk","..........kNmnk.",".........kNmnk..","........kNmnk...",".......kNmnk....","..kk..kmmnk.....",".kgGkkmnnk......",".kggGmnnk.......","..kggGnk........","..kWwgGk........",".kWwkggGk.......","kWwk.kggGk......","Wwk...kkk.......","ggk............."],"mace":[".......knkNNknk.",".......knnnnnnk.","......knnmmNNnk.","......kNnmcCNnNk","......kNnNNnNnNk",".......knNNNnnnk",".......knnnnnnk.",".......knWNNknk.","......kwWkkk.k..",".....kwWk.......","....kwWk........","...kwWk.........","..kwWk..........",".kwWk...........","kggk............",".kk............."],"axe":["..........kkkk..","........kkNNmmk.",".......knNmmNNNk","......knmmNNNNNk","......knnmmNnnnk","......knnnnnnnnk","......knnnnnnnnk",".......kkNWknnnk",".......kwWNnNNk.","......kwWkkNkk..",".....kwWk..kNk..","....kwWk....k...","...kwWk.........","..kwWk..........",".kwWk...........","kggk............"],"lava":[".....kiiiik.....","....kikkkkik....","...kikkkkkkik...","..kiiiiiiiiiik..","..kiiYYYYYYiik..","..kiOYYYOOyyik..","..kiOOOOOyyOik..","..kiOOyyyOOOik..","..kiOyOOOOOOik..","..kissIIIIIIik..","..kissIIIIIsik..","..kissIIIIIIik..","..kisssssssIik..","..kiIIIIIIIIik..","...kkkkkkkkkk...","................"],"spear":["..............km","...........kkkmk","..........kmmmNk",".........kNmmnk.",".........knmnmk.","........kgGnNk..","........kwgknk..",".......kwWkgk...","......kwWk.k....",".....kwWk.......","....kwWk........","...kwWk.........","..kwWk..........","kkwWk...........","wwWk............","ggk............."],"crystal":[".......kk.......","......kPPk......",".....kPPPPk.....",".....kPMMPk.....","....kPMFMMPk....","...kPPMFFPPPk...","...kPpMHFMpPk...","..kPMMFHFFMMPk..","..kPPMFFFFMPPk..","...kPpMFFMpPk...","....kPMMFMPk....","....kPPMMPPk....",".....kPMMPk.....","......kPPk......","......kPPk......",".......kk......."],"shield":["..kkkkkkkkkkkk..",".kIIIIIIIIIIIIk.",".kIBBBBBBBBBBIk.",".kIBmbbbbbbbBIk.",".kIBmBBBBBBBBIk.",".kIBmbbIIbbbBIk.",".kIBmbbiibbbBIk.",".kIBbbbiibbbBIk.",".kIBBBBiiBBBBIk.","..kIBbbiibbBIk..","...kIBbbbbBIk...","....kIBbbBIk....",".....kIBBIk.....","......kIIk......",".......kk.......","................"],"gapple":["................",".........kkk....","........kwllkk..",".....kkkwlLlllk.","....kgggwllllk..","...kggGGwGggk...","..kgGYYGGGGGgk..","..kgGYYGGGGGgk..",".kgGGYGGGGGGGgk.",".kgGgGGGGGGGGgk.","..kGGGGGGGGGGk..","..kgGGGGGGGggk..","..kgGGGGGGgggk..","...kggGGGgggk...","....kkggggkk....","......kkkk......"],"pearl":["................",".....kkkkkk.....","....kddddddk....","...kdeeeeeedk...","..kdeeeeeeeedk..",".kdehhEEeeeeedk.",".kdehEfeeeeeedk.",".kdeeeeeEEefedk.",".kdeeeeeeeeEedk.",".kdeeEeeeeEdedk.",".kdeeeEeedfeedk.","..kdeeefeEdedk..","...kdeeeeeedk...","....kddddddk....",".....kkkkkk.....","................"],"chorus":["........kkk.....",".......kLllk....","......kaallk....","....kkaaakkk....","...kuuuaauuuk...","..kuUQUUUUUUuk..","..kuUQQQUqqUuk..","..kuUQQQUqqUuk..","..kuUQQQUUUquk..","..kuUUUUUQQQuk..","..kuUUqqUQQQuk..","..kuUUqqUQQQuk..","..kuUUUUUUUUuk..","...kuuuuuuuuk...","....kkkkkkkk....","................"]};
  SPR.totem = SPR.shield;   /* fallback art if items/totem.png is missing */
  var OUTER = ['sword', 'axe', 'mace', 'spear', 'totem', 'lava'];     /* big ring, turns clockwise */
  var INNER = ['crystal', 'gapple', 'pearl', 'chorus'];                  /* small ring, turns the other way */

  function sprite(name) {
    if (USE_IMAGES) return '<img src="' + BASE + 'items/' + name + '.png" alt="" draggable="false" data-n="' + name + '">';
    return svgSprite(name);
  }
  function svgSprite(name) {
    var rows = SPR[name], out = '';
    for (var y = 0; y < 16; y++) {
      var x = 0;
      while (x < 16) {
        var c = rows[y].charAt(x);
        if (c === '.') { x++; continue; }
        var x2 = x; while (x2 + 1 < 16 && rows[y].charAt(x2 + 1) === c) x2++;
        out += '<rect x="' + x + '" y="' + y + '" width="' + (x2 - x + 1) + '" height="1" fill="' + PAL[c] + '"/>';
        x = x2 + 1;
      }
    }
    return '<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + out + '</svg>';
  }

  function ring(names, cls) {
    var n = names.length, h = '<span class="ag-ring ' + cls + '">';
    for (var i = 0; i < n; i++) h += '<span class="ag-it" style="--a:' + Math.round(360 / n * i) + 'deg"><span class="ag-sp">' + sprite(names[i]) + '</span></span>';
    return h + '</span>';
  }

  var shield =
    '<svg class="ag-core" viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
    '<defs><linearGradient id="agG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent-3,#2fb06c)"/><stop offset="1" stop-color="var(--accent,#0e7a4e)"/></linearGradient></defs>' +
    '<path d="M32 4 55 12v18c0 15-9.5 25-23 30C18.5 55 9 45 9 30V12z" fill="url(#agG)" stroke="var(--accent,#0e7a4e)" stroke-width="2" stroke-linejoin="round"/>' +
    '<path d="M32 9.5 50 15.5v14c0 12.5-7.5 20.500-18 25-10.500-4.500-18-12.5-18-25v-14z" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.2"/>' +
    '<g fill="none" stroke="var(--on-accent,#fff)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="32" cy="30" r="10"/><path d="M32 16v6M32 38v6M18 30h6M40 30h6"/><path d="m27.5 30.5 3.2 3.2 6-6.5" stroke-width="2.6"/></g></svg>';

  function build(el) {
    if (el.getAttribute('data-ready')) return;
    el.setAttribute('data-ready', '1');
    el.innerHTML =
      '<span class="ag-track t1"></span><span class="ag-track t2"></span>' +
      '<span class="ag-radar"></span>' + ring(OUTER, 'out') + ring(INNER, 'in') + shield;
    track(el);
  }

  /* ───────── spin driver ─────────
     Both rings keep one angle each (--ro / --ri on the logo). Hovering only changes how fast the angle advances, and the speed
     eases toward its target, so nothing ever jumps or restarts. (The old CSS changed animation-duration on hover, which
     re-maps the animation's progress and made the rings snap back.) */
  var logos = [], raf = 0, last = 0;
  var BASE_OUT = 360 / 26, BASE_IN = 360 / 20, FAST = 2.9;     /* degrees per second at rest, and the hover speed-up */
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  function track(el) {
    var L = { el: el, ro: Math.random() * 360, ri: Math.random() * 360, k: 1, goal: 1, vis: true, hot: 0 };
    logos.push(L);
    var zone = el.closest('.card,.own,.more-item,.dlg-logo,.hero-logo') || el;
    function on() { L.hot++; L.goal = FAST; }
    function off() { L.hot = Math.max(0, L.hot - 1); if (!L.hot) L.goal = 1; }
    zone.addEventListener('mouseenter', function () { L.hot = 1; L.goal = FAST; });
    zone.addEventListener('mouseleave', function () { L.hot = 0; L.goal = 1; });
    zone.addEventListener('focusin', on);
    zone.addEventListener('focusout', off);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { L.vis = es[es.length - 1].isIntersecting; }).observe(el);
    }
    paint(L);
    if (!reduce && !raf) raf = requestAnimationFrame(tick);
  }
  function paint(L) {
    L.el.style.setProperty('--ro', L.ro.toFixed(2) + 'deg');
    L.el.style.setProperty('--ri', L.ri.toFixed(2) + 'deg');
  }
  function tick(t) {
    var dt = last ? Math.min(0.1, (t - last) / 1000) : 0.016; last = t;
    var ease = 1 - Math.exp(-dt * 5);                          /* ~0.2 s to settle on the new speed */
    for (var i = logos.length - 1; i >= 0; i--) {
      var L = logos[i];
      if (!L.el.isConnected) { logos.splice(i, 1); continue; }
      L.k += (L.goal - L.k) * ease;
      if (!L.vis || document.hidden) continue;
      L.ro = (L.ro + BASE_OUT * L.k * dt) % 360;
      L.ri = (L.ri + BASE_IN * L.k * dt) % 360;
      paint(L);
    }
    raf = logos.length ? requestAnimationFrame(tick) : 0;
    if (!raf) last = 0;
  }

  var css =
    '.aegis-logo{--ag-a:var(--accent,#0e7a4e);position:relative;display:inline-block;width:1em;height:1em;font-size:180px;flex:none;vertical-align:middle;line-height:0}' +
    '.aegis-logo *{box-sizing:border-box}' +
    '.ag-track{position:absolute;border-radius:50%;border:1px dashed color-mix(in srgb,var(--ag-a) 38%,transparent);left:50%;top:50%}' +
    '.ag-track.t1{width:.8em;height:.8em;margin:-.4em 0 0 -.4em}' +
    '.ag-track.t2{width:.52em;height:.52em;margin:-.26em 0 0 -.26em;border-style:solid;border-color:color-mix(in srgb,var(--ag-a) 22%,transparent)}' +
    '.ag-radar{position:absolute;left:50%;top:50%;width:.52em;height:.52em;margin:-.26em 0 0 -.26em;border-radius:50%;' +
      'background:conic-gradient(from 0deg,transparent 0 250deg,color-mix(in srgb,var(--ag-a) 55%,transparent) 360deg);' +
      '-webkit-mask:radial-gradient(circle,transparent 24%,#000 25%);mask:radial-gradient(circle,transparent 24%,#000 25%);animation:ag-spin 3.2s linear infinite}' +
    '.ag-core{position:absolute;left:50%;top:50%;width:.28em;height:.28em;margin:-.14em 0 0 -.14em;filter:drop-shadow(0 .02em .04em rgba(0,0,0,.35));animation:ag-pulse 3.2s ease-in-out infinite}' +
    '.ag-ring{position:absolute;inset:0;will-change:transform}' +
    '.ag-ring.out{transform:rotate(var(--ro,0deg))}' +
    '.ag-ring.in{transform:rotate(calc(-1 * var(--ri,0deg)))}' +
    '.ag-it{position:absolute;left:50%;top:50%;width:.2em;height:.2em;margin:-.1em 0 0 -.1em;' +
      'transform:rotate(var(--a)) translateY(-.4em) rotate(calc(-1 * var(--a)))}' +
    '.ag-ring.in .ag-it{width:.15em;height:.15em;margin:-.075em 0 0 -.075em;transform:rotate(var(--a)) translateY(-.26em) rotate(calc(-1 * var(--a)))}' +
    '.ag-sp{display:block;width:100%;height:100%;filter:drop-shadow(0 .012em .02em rgba(0,0,0,.4))}' +
    '.ag-ring.out .ag-sp{transform:rotate(calc(-1 * var(--ro,0deg)))}' +
    '.ag-ring.in .ag-sp{transform:rotate(var(--ri,0deg))}' +
    '.ag-sp svg,.ag-sp img{display:block;width:100%;height:100%;image-rendering:crisp-edges;image-rendering:pixelated}' +
    '@keyframes ag-spin{to{transform:rotate(360deg)}}' +
    '@keyframes ag-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}' +
    '@media (prefers-reduced-motion:reduce){.ag-radar,.ag-core{animation:none!important}}';

  function init() {
    if (!document.getElementById('ag-style')) {
      var st = document.createElement('style'); st.id = 'ag-style'; st.textContent = css; document.head.appendChild(st);
    }
    Array.prototype.forEach.call(document.querySelectorAll('.aegis-logo'), build);
  }
  /* an item texture that fails to load swaps itself for the built-in pixel sprite */
  document.addEventListener('error', function (e) {
    var im = e.target;
    if (!im || im.tagName !== 'IMG' || !im.getAttribute('data-n') || !SPR[im.getAttribute('data-n')]) return;
    var holder = document.createElement('span'); holder.innerHTML = svgSprite(im.getAttribute('data-n'));
    if (im.parentNode && holder.firstChild) im.parentNode.replaceChild(holder.firstChild, im);
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.AegisLogo = { init: init };
})();
