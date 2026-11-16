/* Aegis-Anti-Cheat logo: a scanning shield in the middle, Minecraft-style items orbiting around it.
   Use anywhere:  <span class="aegis-logo" role="img" aria-label="Aegis-Anti-Cheat logo"></span>
   Include once:  <script src="aegis-logo.js" defer></script>      (it fills every .aegis-logo it finds)
   Size it with font-size (the logo is 1em x 1em):  .aegis-logo{font-size:180px}
   The items are original 16x16 pixel sprites defined below as character maps; to use real PNG icons instead,
   put them in an /items folder and set  USE_IMAGES = true  (files: sword.png, mace.png, axe.png, lava.png, spear.png,
   crystal.png, shield.png, gapple.png, pearl.png, chorus.png). */
(function () {
  'use strict';
  var USE_IMAGES = false;
  var PAL = {"k":"#18161c","n":"#3a343c","N":"#5f5660","m":"#8e828e","w":"#58381c","W":"#80562c","g":"#d4a01c","G":"#fad646","Y":"#fff4aa","y":"#ffb028","O":"#ec600c","i":"#686c74","I":"#b0b4bc","s":"#828892","c":"#34e4d0","C":"#befff6","P":"#6e1e96","M":"#be46d2","F":"#ffe6ff","H":"#ffffff","p":"#9630b4","r":"#56381e","B":"#966838","b":"#b4844a","l":"#3c8c32","L":"#6ec850","d":"#0c3c34","e":"#1a7864","E":"#32aa8c","f":"#5ad2aa","h":"#beffe6","u":"#6e3282","U":"#a66aba","Q":"#dcbee6","q":"#824696","a":"#503c28"};
  var SPR = {"sword":[".............kk.","............knNk","...........kNnnk","..........kNmnk.",".........kNmnk..","........kNmnk...",".......kNmnk....","..kk..kmmnk.....",".kgGkkmnnk......",".kggGmnnk.......","..kggGnk........","..kWwgGk........",".kWwkggGk.......","kWwk.kggGk......","Wwk...kkk.......","ggk............."],"mace":[".......knkNNknk.",".......knnnnnnk.","......knnmmNNnk.","......kNnmcCNnNk","......kNnNNnNnNk",".......knNNNnnnk",".......knnnnnnk.",".......knWNNknk.","......kwWkkk.k..",".....kwWk.......","....kwWk........","...kwWk.........","..kwWk..........",".kwWk...........","kggk............",".kk............."],"axe":["..........kkkk..","........kkNNmmk.",".......knNmmNNNk","......knmmNNNNNk","......knnmmNnnnk","......knnnnnnnnk","......knnnnnnnnk",".......kkNWknnnk",".......kwWNnNNk.","......kwWkkNkk..",".....kwWk..kNk..","....kwWk....k...","...kwWk.........","..kwWk..........",".kwWk...........","kggk............"],"lava":[".....kiiiik.....","....kikkkkik....","...kikkkkkkik...","..kiiiiiiiiiik..","..kiiYYYYYYiik..","..kiOYYYOOyyik..","..kiOOOOOyyOik..","..kiOOyyyOOOik..","..kiOyOOOOOOik..","..kissIIIIIIik..","..kissIIIIIsik..","..kissIIIIIIik..","..kisssssssIik..","..kiIIIIIIIIik..","...kkkkkkkkkk...","................"],"spear":["..............km","...........kkkmk","..........kmmmNk",".........kNmmnk.",".........knmnmk.","........kgGnNk..","........kwgknk..",".......kwWkgk...","......kwWk.k....",".....kwWk.......","....kwWk........","...kwWk.........","..kwWk..........","kkwWk...........","wwWk............","ggk............."],"crystal":[".......kk.......","......kPPk......",".....kPPPPk.....",".....kPMMPk.....","....kPMFMMPk....","...kPPMFFPPPk...","...kPpMHFMpPk...","..kPMMFHFFMMPk..","..kPPMFFFFMPPk..","...kPpMFFMpPk...","....kPMMFMPk....","....kPPMMPPk....",".....kPMMPk.....","......kPPk......","......kPPk......",".......kk......."],"shield":["..kkkkkkkkkkkk..",".kIIIIIIIIIIIIk.",".kIBBBBBBBBBBIk.",".kIBmbbbbbbbBIk.",".kIBmBBBBBBBBIk.",".kIBmbbIIbbbBIk.",".kIBmbbiibbbBIk.",".kIBbbbiibbbBIk.",".kIBBBBiiBBBBIk.","..kIBbbiibbBIk..","...kIBbbbbBIk...","....kIBbbBIk....",".....kIBBIk.....","......kIIk......",".......kk.......","................"],"gapple":["................",".........kkk....","........kwllkk..",".....kkkwlLlllk.","....kgggwllllk..","...kggGGwGggk...","..kgGYYGGGGGgk..","..kgGYYGGGGGgk..",".kgGGYGGGGGGGgk.",".kgGgGGGGGGGGgk.","..kGGGGGGGGGGk..","..kgGGGGGGGggk..","..kgGGGGGGgggk..","...kggGGGgggk...","....kkggggkk....","......kkkk......"],"pearl":["................",".....kkkkkk.....","....kddddddk....","...kdeeeeeedk...","..kdeeeeeeeedk..",".kdehhEEeeeeedk.",".kdehEfeeeeeedk.",".kdeeeeeEEefedk.",".kdeeeeeeeeEedk.",".kdeeEeeeeEdedk.",".kdeeeEeedfeedk.","..kdeeefeEdedk..","...kdeeeeeedk...","....kddddddk....",".....kkkkkk.....","................"],"chorus":["........kkk.....",".......kLllk....","......kaallk....","....kkaaakkk....","...kuuuaauuuk...","..kuUQUUUUUUuk..","..kuUQQQUqqUuk..","..kuUQQQUqqUuk..","..kuUQQQUUUquk..","..kuUUUUUQQQuk..","..kuUUqqUQQQuk..","..kuUUqqUQQQuk..","..kuUUUUUUUUuk..","...kuuuuuuuuk...","....kkkkkkkk....","................"]};
  var OUTER = ['sword', 'axe', 'mace', 'spear', 'shield', 'lava'];     /* big ring, turns clockwise */
  var INNER = ['crystal', 'gapple', 'pearl', 'chorus'];                  /* small ring, turns the other way */

  function sprite(name) {
    if (USE_IMAGES) return '<img src="items/' + name + '.png" alt="" style="image-rendering:pixelated">';
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
    '.ag-ring{position:absolute;inset:0;animation:ag-spin 26s linear infinite}' +
    '.ag-ring.in{animation-duration:20s;animation-direction:reverse}' +
    '.ag-it{position:absolute;left:50%;top:50%;width:.2em;height:.2em;margin:-.1em 0 0 -.1em;' +
      'transform:rotate(var(--a)) translateY(-.4em) rotate(calc(-1 * var(--a)))}' +
    '.ag-ring.in .ag-it{width:.15em;height:.15em;margin:-.075em 0 0 -.075em;transform:rotate(var(--a)) translateY(-.26em) rotate(calc(-1 * var(--a)))}' +
    '.ag-sp{display:block;width:100%;height:100%;animation:ag-spin 26s linear infinite reverse;filter:drop-shadow(0 .012em .02em rgba(0,0,0,.4))}' +
    '.ag-ring.in .ag-sp{animation-duration:20s;animation-direction:normal}' +
    '.ag-sp svg,.ag-sp img{display:block;width:100%;height:100%}' +
    '.aegis-logo:hover .ag-ring{animation-duration:9s}.aegis-logo:hover .ag-ring.in{animation-duration:7s}' +
    '.aegis-logo:hover .ag-sp{animation-duration:9s}.aegis-logo:hover .ag-ring.in .ag-sp{animation-duration:7s}' +
    '.card:hover .ag-ring,.card:focus-within .ag-ring{animation-duration:9s}.card:hover .ag-ring.in,.card:focus-within .ag-ring.in{animation-duration:7s}' +
    '.card:hover .ag-sp,.card:focus-within .ag-sp{animation-duration:9s}.card:hover .ag-ring.in .ag-sp,.card:focus-within .ag-ring.in .ag-sp{animation-duration:7s}' +
    '@keyframes ag-spin{to{transform:rotate(360deg)}}' +
    '@keyframes ag-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}' +
    '@media (prefers-reduced-motion:reduce){.ag-ring,.ag-sp,.ag-radar,.ag-core{animation:none!important}}';

  function init() {
    if (!document.getElementById('ag-style')) {
      var st = document.createElement('style'); st.id = 'ag-style'; st.textContent = css; document.head.appendChild(st);
    }
    Array.prototype.forEach.call(document.querySelectorAll('.aegis-logo'), build);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.AegisLogo = { init: init };
})();
