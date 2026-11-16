/* Aegis-Anti-Cheat plan data, shared by the dashboard (and anything else that needs to know what a tier includes).
   Mirrors TIERS / FEATURES in aegis-anti-cheat.html: if you change a price, a tier or a feature there, change it here too.
   Each feature row = [label, [value per tier], [optional bracket tag per tier]];  "\u2713" = included, "" = not included. */
(function () {
  "use strict";
  var TIERS = [
    {
      "name": "Starter",
      "price": 20,
      "tagline": "Small servers",
      "color": "#34e0b8",
      "shape": "tetra"
    },
    {
      "name": "Standard",
      "price": 55,
      "tagline": "Growing servers",
      "color": "#5aa9ff",
      "shape": "octa"
    },
    {
      "name": "Plus",
      "price": 90,
      "tagline": "Busy servers",
      "color": "#b48cff",
      "shape": "cube"
    },
    {
      "name": "Network",
      "price": 115,
      "tagline": "Server networks",
      "color": "#ffb347",
      "shape": "icosa"
    }
  ];
  var FEATURES = [
    ["Servers per licence",["1 server","2 servers","5 servers","10 servers"],[]],
    ["Full detection, all cheats",["✓","✓","✓","✓"],["60s","45s","30s","Instant"]],
    ["Alert-only and auto-punish modes",["✓","✓","✓","✓"],[]],
    ["Sensitivity presets and thresholds",["✓","✓","✓","✓"],[]],
    ["In-game and Discord alerts",["✓","✓","✓","✓"],[]],
    ["Log retention",["7 days","30 days","90 days","Custom"],[]],
    ["Staff review tools and flag history",["Basic","✓","✓","✓"],[]],
    ["Evidence replays or clips",["","","✓","✓"],["","","","AI-view"]],
    ["Web dashboard and stats",["","","✓","✓"],[]],
    ["Per-check tuning and exemptions",["","","✓","✓"],[]],
    ["API and webhooks",["","","✓","✓"],[]],
    ["Multi-server management, shared flags",["","","","✓"],[]],
    ["Support",["Community","Ticket","Priority","Dedicated"],[]]
  ];

  function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
  function tierIndex(name) {
    var n = norm(name);
    for (var i = 0; i < TIERS.length; i++) if (n.indexOf(norm(TIERS[i].name)) > -1) return i;
    return -1;
  }
  function row(label) { for (var i = 0; i < FEATURES.length; i++) if (FEATURES[i][0] === label) return FEATURES[i]; return null; }

  /* Headline perks for a tier (what the customer actually gets in numbers). */
  function perks(i) {
    var r = function (l) { var f = row(l); return f ? f[1][i] : ""; };
    var det = row("Full detection, all cheats");
    return [
      { name: "Servers per licence", value: r("Servers per licence") },
      { name: "Verdict time", value: det && det[2][i] ? (det[2][i] === "Instant" ? "Instant" : "Within " + det[2][i]) : "" },
      { name: "Log retention", value: r("Log retention") },
      { name: "Support", value: r("Support") }
    ].filter(function (p) { return p.value; });
  }

  /* Every feature split into what this tier includes and what it doesn't. */
  function features(i) {
    var yes = [], no = [];
    FEATURES.forEach(function (f) {
      var v = f[1][i], tag = f[2] && f[2][i] || "";
      if (v === "") { no.push({ label: f[0], firstTier: f[1].findIndex(function (x) { return x !== ""; }) }); return; }
      var detail = v === "\u2713" ? "" : v;
      if (tag) detail = detail ? detail + " \u00b7 " + tag : tag;
      yes.push({ label: f[0], detail: detail });
    });
    return { yes: yes, no: no };
  }

  window.AegisData = {
    tiers: TIERS, features: FEATURES, tierIndex: tierIndex, perks: perks, featureList: features,
    tier: function (name) { var i = tierIndex(name); return i < 0 ? null : { index: i, def: TIERS[i], perks: perks(i), features: features(i) }; }
  };
})();
