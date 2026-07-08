/* ═══════════════════════════════════════════════════════
   ACHUTA HANDMADE — build your own
   live SVG configurator + checksummed build codes
   ═══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var CX = 210, CY = 280;

  /* ── parts catalogue ─────────────────────────────── */
  var METALS = [
    { key: "rose",  label: "Rose gold",  g: "url(#g-rose)",  hi: "url(#g-rose-hi)",  css: "linear-gradient(135deg,#eab88f,#b87a52 55%,#d9a173)" },
    { key: "gold",  label: "Yellow gold",g: "url(#g-gold)",  hi: "url(#g-gold-hi)",  css: "linear-gradient(135deg,#f2d692,#c09441 55%,#e5c26e)" },
    { key: "steel", label: "Steel",      g: "url(#g-steel)", hi: "url(#g-steel-hi)", css: "linear-gradient(135deg,#f0f1f3,#a4a7ad 55%,#d9dbdf)" },
    { key: "onyx",  label: "Onyx",       g: "url(#g-onyx)",  hi: "url(#g-onyx-hi)",  css: "linear-gradient(135deg,#565658,#1d1d1f 55%,#414144)" }
  ];
  var DIALS = [
    { key: "salmon", label: "Salmon",        base: "#dcae94", text: "#3a2d24", tick: "rgba(58,45,36,.6)",   css: "#dcae94" },
    { key: "blue",   label: "Midnight blue", base: "#22406b", text: "#eae3d4", tick: "rgba(255,255,255,.45)", css: "#22406b" },
    { key: "noir",   label: "Noir",          base: "#16181c", text: "#eae3d4", tick: "rgba(255,255,255,.4)",  css: "#16181c" },
    { key: "forest", label: "Forest",        base: "#1e4032", text: "#eae3d4", tick: "rgba(255,255,255,.4)",  css: "#1e4032" },
    { key: "ivory",  label: "Ivory",         base: "#eae2d0", text: "#2e2a22", tick: "rgba(48,42,34,.55)",   css: "#eae2d0" }
  ];
  var SECONDS = [
    { key: "rose",   label: "Rose gold · thin", c: "#c98a5f", css: "#c98a5f" },
    { key: "gold",   label: "Gold · thin",      c: "#cfa54e", css: "#cfa54e" },
    { key: "silver", label: "Silver · thin",    c: "#d6d9dd", css: "#d6d9dd" },
    { key: "signal", label: "Signal red",       c: "#b3382e", css: "#b3382e" }
  ];
  var INDICES = [
    { key: "silver", label: "Silver applied", g: "url(#g-steel)", css: "linear-gradient(135deg,#f0f1f3,#a4a7ad)" },
    { key: "gold",   label: "Gold applied",   g: "url(#g-gold)",  css: "linear-gradient(135deg,#f2d692,#c09441)" },
    { key: "rose",   label: "Rose applied",   g: "url(#g-rose)",  css: "linear-gradient(135deg,#eab88f,#b87a52)" }
  ];
  var STRAPS = [
    { key: "bracelet", label: "Integrated bracelet", css: "linear-gradient(135deg,#d9d9dc,#8f8f94)" },
    { key: "noir",     label: "Leather · noir",      c: "#1d1713", css: "#1d1713" },
    { key: "cognac",   label: "Leather · cognac",    c: "#7a4526", css: "#7a4526" }
  ];
  var DATES = [
    { key: "date",   label: "With date",  css: "linear-gradient(135deg,#f2efe8 48%,#1d1d1f 52%)" },
    { key: "nodate", label: "No date",    css: "#33302b" }
  ];

  var CATS = [
    { id: "case",    name: "Case",        opts: METALS },
    { id: "bezel",   name: "Bezel",       opts: METALS },
    { id: "dial",    name: "Dial",        opts: DIALS },
    { id: "hands",   name: "Hands",       opts: METALS },
    { id: "seconds", name: "Seconds hand",opts: SECONDS },
    { id: "indices", name: "Indices",     opts: INDICES },
    { id: "strap",   name: "Bracelet / strap", opts: STRAPS },
    { id: "date",    name: "Date window", opts: DATES }
  ];

  /* default = the watch from the films */
  var state = { case: 0, bezel: 0, dial: 0, hands: 0, seconds: 0, indices: 0, strap: 0, date: 0 };

  /* ── svg helpers ─────────────────────────────────── */
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function octagon(cx, cy, R) {
    var pts = [];
    for (var i = 0; i < 8; i++) {
      var a = (22.5 + i * 45) * Math.PI / 180;
      pts.push((cx + R * Math.cos(a)).toFixed(1) + "," + (cy + R * Math.sin(a)).toFixed(1));
    }
    return pts.join(" ");
  }

  /* ── build the watch ─────────────────────────────── */
  var W = {}; // element refs
  function buildWatch() {
    var root = document.getElementById("w-root");

    /* straps / bracelet (behind case) */
    W.bracelet = el("g", {}, root);
    W.bracelet.topLinks = []; W.bracelet.ctrLinks = [];
    [-1, 1].forEach(function (dir) {
      for (var r = 0; r < 6; r++) {
        var t = r / 5;
        var Wrow = 148 - t * 32;
        var y = dir < 0 ? (CY - 116 - 24 - r * 27) : (CY + 116 + r * 27);
        var seam = el("rect", { x: CX - Wrow / 2, y: y, width: Wrow, height: 24, rx: 5, fill: "#000", opacity: .55 }, W.bracelet);
        var ow = Wrow * 0.29, cw = Wrow * 0.34;
        var l = el("rect", { x: CX - Wrow / 2, y: y, width: ow, height: 24, rx: 5 }, W.bracelet);
        var c = el("rect", { x: CX - cw / 2, y: y - (dir < 0 ? -2 : 2) * 0 + 2, width: cw, height: 20, rx: 4 }, W.bracelet);
        var rr = el("rect", { x: CX + Wrow / 2 - ow, y: y, width: ow, height: 24, rx: 5 }, W.bracelet);
        W.bracelet.topLinks.push(l, rr); W.bracelet.ctrLinks.push(c);
      }
    });

    /* leather straps */
    W.leather = el("g", {}, root);
    W.leatherPaths = [];
    W.stitches = [];
    [[-1, CY - 112, 8], [1, CY + 112, 552]].forEach(function (cfg) {
      var yNear = cfg[1], yFar = cfg[2];
      var p = el("path", {
        d: "M " + (CX - 62) + " " + yNear +
           " L " + (CX + 62) + " " + yNear +
           " L " + (CX + 46) + " " + yFar +
           " Q " + CX + " " + (yFar + (cfg[0] < 0 ? -10 : 10)) + " " + (CX - 46) + " " + yFar + " Z",
        stroke: "rgba(0,0,0,.5)", "stroke-width": 1
      }, W.leather);
      var s = el("path", {
        d: "M " + (CX - 52) + " " + (yNear + cfg[0] * 8) + " L " + (CX - 40) + " " + (yFar - cfg[0] * 6) +
           " M " + (CX + 52) + " " + (yNear + cfg[0] * 8) + " L " + (CX + 40) + " " + (yFar - cfg[0] * 6),
        stroke: "rgba(234,227,214,.4)", "stroke-width": 1, "stroke-dasharray": "3 4", fill: "none"
      }, W.leather);
      W.leatherPaths.push(p); W.stitches.push(s);
    });

    /* crown (behind case edge) */
    W.crown = el("g", {}, root);
    el("rect", { x: CX + 108, y: CY - 11, width: 26, height: 22, rx: 6, "class": "metal-case" }, W.crown);
    for (var cr = 0; cr < 4; cr++)
      el("rect", { x: CX + 112 + cr * 5.4, y: CY - 11, width: 2, height: 22, fill: "rgba(0,0,0,.35)" }, W.crown);

    /* case */
    W.casePoly = el("polygon", { points: octagon(CX, CY, 126), stroke: "rgba(0,0,0,.55)", "stroke-width": 1.5, "stroke-linejoin": "round" }, root);
    el("polygon", { points: octagon(CX, CY, 126), fill: "none", stroke: "rgba(255,255,255,.12)", "stroke-width": 1, "stroke-linejoin": "round" }, root);

    /* bezel */
    W.bezelPoly = el("polygon", { points: octagon(CX, CY, 102), stroke: "rgba(0,0,0,.5)", "stroke-width": 1.2, "stroke-linejoin": "round" }, root);
    el("polygon", { points: octagon(CX, CY, 102), fill: "none", stroke: "rgba(255,255,255,.16)", "stroke-width": .8, "stroke-linejoin": "round" }, root);

    /* bezel screws — steel, like the films */
    var slotAngles = [15, 80, 40, 120, 60, 150, 100, 30];
    for (var i = 0; i < 8; i++) {
      var a = (22.5 + i * 45) * Math.PI / 180;
      var sx = CX + 102 * Math.cos(a) * 0.92, sy = CY + 102 * Math.sin(a) * 0.92;
      var hex = [];
      for (var h = 0; h < 6; h++) {
        var ha = (h * 60) * Math.PI / 180;
        hex.push((sx + 6.4 * Math.cos(ha)).toFixed(1) + "," + (sy + 6.4 * Math.sin(ha)).toFixed(1));
      }
      el("polygon", { points: hex.join(" "), fill: "url(#g-steel)", stroke: "rgba(0,0,0,.6)", "stroke-width": .8 }, root);
      el("line", {
        x1: sx - 4.2 * Math.cos(slotAngles[i] * Math.PI / 180), y1: sy - 4.2 * Math.sin(slotAngles[i] * Math.PI / 180),
        x2: sx + 4.2 * Math.cos(slotAngles[i] * Math.PI / 180), y2: sy + 4.2 * Math.sin(slotAngles[i] * Math.PI / 180),
        stroke: "#2a2a2c", "stroke-width": 1.6, "stroke-linecap": "round"
      }, root);
    }

    /* chapter ring + dial */
    el("circle", { cx: CX, cy: CY, r: 86, fill: "#0d0c0b" }, root);
    W.dial = el("circle", { cx: CX, cy: CY, r: 80 }, root);
    el("circle", { cx: CX, cy: CY, r: 80, fill: "url(#tap)", "clip-path": "url(#clip-dial)" }, root);
    el("circle", { cx: CX, cy: CY, r: 80, fill: "url(#g-dialshade)" }, root);

    /* minute track */
    W.ticks = [];
    for (var m = 0; m < 60; m++) {
      var ma = m * 6 * Math.PI / 180;
      var big = m % 5 === 0;
      var r1 = big ? 72.5 : 75.5, r2 = 79;
      W.ticks.push(el("line", {
        x1: CX + r1 * Math.sin(ma), y1: CY - r1 * Math.cos(ma),
        x2: CX + r2 * Math.sin(ma), y2: CY - r2 * Math.cos(ma),
        "stroke-width": big ? 1.5 : .8
      }, root));
    }

    /* applied indices (skip 12 → doubled; 3 handled with date) */
    W.indexRects = []; W.index3 = null;
    for (var hr = 1; hr <= 12; hr++) {
      var ang = hr * 30;
      var g = el("g", { transform: "rotate(" + ang + " " + CX + " " + CY + ")" }, root);
      function baton(px, grp) {
        var b = el("rect", { x: px - 3.4, y: CY - 280 + (CY - 72), width: 6.8, height: 21, rx: 2, stroke: "rgba(0,0,0,.4)", "stroke-width": .6 }, grp);
        el("rect", { x: px - 1.2, y: CY - 280 + (CY - 68.6), width: 2.4, height: 14.2, rx: 1.1, fill: "#efe9dc" }, grp);
        return b;
      }
      if (hr === 12) { W.indexRects.push(baton(CX - 4.6, g), baton(CX + 4.6, g)); }
      else {
        var b = baton(CX, g);
        W.indexRects.push(b);
        if (hr === 3) W.index3 = g;
      }
    }

    /* dial text */
    W.logo1 = el("text", { x: CX, y: CY - 32, "text-anchor": "middle", "font-family": "Cormorant Garamond, Georgia, serif", "font-size": 14.5, "font-weight": 500, "letter-spacing": 2.2 }, root);
    W.logo1.textContent = "ACHUTA";
    W.logo2 = el("text", { x: CX, y: CY - 22, "text-anchor": "middle", "font-family": "Jost, sans-serif", "font-size": 5.6, "font-weight": 400, "letter-spacing": 3.4 }, root);
    W.logo2.textContent = "HANDMADE";
    W.auto = el("text", { x: CX, y: CY + 46, "text-anchor": "middle", "font-family": "Jost, sans-serif", "font-size": 6.4, "font-weight": 400, "letter-spacing": 2.6 }, root);
    W.auto.textContent = "AUTOMATIC";

    /* date at 3 */
    W.date = el("g", {}, root);
    W.dateFrame = el("rect", { x: CX + 46, y: CY - 8.5, width: 21, height: 17, rx: 2, fill: "#f2efe8", "stroke-width": 1.6 }, W.date);
    var dt = el("text", { x: CX + 56.5, y: CY + 4, "text-anchor": "middle", "font-family": "Jost, sans-serif", "font-size": 10, fill: "#22201d" }, W.date);
    dt.textContent = "28";

    /* hands — 10:08:34 */
    W.hour = el("g", { transform: "rotate(304.3 " + CX + " " + CY + ")" }, root);
    W.hourBody = el("path", { d: "M " + (CX - 3.5) + " " + CY + " L " + (CX - 2.6) + " " + (CY - 46) + " L " + CX + " " + (CY - 51) + " L " + (CX + 2.6) + " " + (CY - 46) + " L " + (CX + 3.5) + " " + CY + " Z", stroke: "rgba(0,0,0,.4)", "stroke-width": .7 }, W.hour);
    el("rect", { x: CX - 1.1, y: CY - 42, width: 2.2, height: 24, rx: 1, fill: "#efe9dc" }, W.hour);

    W.min = el("g", { transform: "rotate(51.4 " + CX + " " + CY + ")" }, root);
    W.minBody = el("path", { d: "M " + (CX - 3.1) + " " + CY + " L " + (CX - 2.2) + " " + (CY - 66) + " L " + CX + " " + (CY - 71) + " L " + (CX + 2.2) + " " + (CY - 66) + " L " + (CX + 3.1) + " " + CY + " Z", stroke: "rgba(0,0,0,.4)", "stroke-width": .7 }, W.min);
    el("rect", { x: CX - 1, y: CY - 62, width: 2, height: 34, rx: 1, fill: "#efe9dc" }, W.min);

    W.sec = el("g", { transform: "rotate(204 " + CX + " " + CY + ")" }, root);
    W.secLine = el("line", { x1: CX, y1: CY + 16, x2: CX, y2: CY - 72, "stroke-width": 1.5, "stroke-linecap": "round" }, W.sec);
    W.secTail = el("circle", { cx: CX, cy: CY + 11, r: 3.4 }, W.sec);

    W.pinion = el("circle", { cx: CX, cy: CY, r: 4.4, stroke: "rgba(0,0,0,.45)", "stroke-width": .8 }, root);
    el("circle", { cx: CX, cy: CY, r: 1.6, fill: "#1c1a18" }, root);

    /* sapphire sheen */
    el("ellipse", { cx: CX - 26, cy: CY - 30, rx: 72, ry: 42, transform: "rotate(-28 " + (CX - 26) + " " + (CY - 30) + ")", fill: "url(#g-glass)", "clip-path": "url(#clip-dial)" }, root);
  }

  /* ── apply state → svg + ui ──────────────────────── */
  function apply() {
    var mc = METALS[state.case], mb = METALS[state.bezel], mh = METALS[state.hands];
    var d = DIALS[state.dial], sc = SECONDS[state.seconds], ix = INDICES[state.indices];

    W.casePoly.setAttribute("fill", mc.g);
    W.crown.querySelector(".metal-case").setAttribute("fill", mc.g);
    W.bezelPoly.setAttribute("fill", mb.g);

    var isBracelet = state.strap === 0;
    W.bracelet.style.display = isBracelet ? "" : "none";
    W.leather.style.display = isBracelet ? "none" : "";
    if (isBracelet) {
      W.bracelet.topLinks.forEach(function (r) { r.setAttribute("fill", mc.g); });
      W.bracelet.ctrLinks.forEach(function (r) { r.setAttribute("fill", mc.hi); });
    } else {
      W.leatherPaths.forEach(function (p) { p.setAttribute("fill", STRAPS[state.strap].c); });
    }

    W.dial.setAttribute("fill", d.base);
    W.ticks.forEach(function (t) { t.setAttribute("stroke", d.tick); });
    W.logo1.setAttribute("fill", d.text);
    W.logo2.setAttribute("fill", d.text);
    W.auto.setAttribute("fill", d.text);

    W.indexRects.forEach(function (r) { r.setAttribute("fill", ix.g); });
    W.dateFrame.setAttribute("stroke", ix.g === "url(#g-steel)" ? "#9a9da3" : (ix.g === "url(#g-gold)" ? "#c09441" : "#b87a52"));

    var withDate = state.date === 0;
    W.date.style.display = withDate ? "" : "none";
    if (W.index3) W.index3.style.display = withDate ? "none" : "";

    W.hourBody.setAttribute("fill", mh.g);
    W.minBody.setAttribute("fill", mh.g);
    W.secLine.setAttribute("stroke", sc.c);
    W.secTail.setAttribute("fill", sc.c);
    W.pinion.setAttribute("fill", mh.g);

    /* ui */
    CATS.forEach(function (cat) {
      var cur = document.getElementById("cur-" + cat.id);
      if (cur) cur.textContent = cat.opts[state[cat.id]].label;
      var btns = document.querySelectorAll('[data-cat="' + cat.id + '"]');
      for (var i = 0; i < btns.length; i++) btns[i].setAttribute("aria-pressed", String(+btns[i].getAttribute("data-i") === state[cat.id]));
    });

    var code = encode(state);
    document.getElementById("build-code").textContent = code;
    var body = "ACHUTA HANDMADE — commission request%0D%0A%0D%0ABuild code: " + code + "%0D%0A%0D%0A" +
      CATS.map(function (c) { return c.name + ": " + c.opts[state[c.id]].label; }).join("%0D%0A") +
      "%0D%0AMovement: Seiko NH35 · automatic%0D%0A";
    document.getElementById("send-commission").setAttribute("href",
      "mailto:commissions@achutahandmade.com?subject=" + encodeURIComponent("Commission — " + code) + "&body=" + body);

    if (history.replaceState) history.replaceState(null, "", "#" + code);
  }

  /* ── build code encode / decode ──────────────────── */
  var ALPHA = "23456789ABCDEFGHJKMNPQRSTVWXYZ"; // 30 unambiguous chars
  var VERSION = 1;

  function digits(s) { return [VERSION].concat(CATS.map(function (c) { return s[c.id]; })); }
  function checksum(ds) {
    var sum = 0;
    for (var i = 0; i < ds.length; i++) sum += ds[i] * (i + 3);
    return sum % 30;
  }
  function encode(s) {
    var ds = digits(s);
    var chars = ds.map(function (d) { return ALPHA[d]; }).join("") + ALPHA[checksum(ds)];
    return "AH-" + chars.slice(0, 5) + "-" + chars.slice(5);
  }
  function decode(str) {
    if (!str) return { err: "Enter a code." };
    var raw = String(str).toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (raw.slice(0, 2) === "AH") raw = raw.slice(2);
    if (raw.length !== 10) return { err: "A build code has 10 characters after AH." };
    var ds = [];
    for (var i = 0; i < 10; i++) {
      var v = ALPHA.indexOf(raw[i]);
      if (v < 0) return { err: "Unrecognized character “" + raw[i] + "”." };
      ds.push(v);
    }
    var payload = ds.slice(0, 9), check = ds[9];
    if (checksum(payload) !== check) return { err: "That code doesn’t check out — one character may be mistyped." };
    if (payload[0] !== VERSION) return { err: "This code is from a different builder version." };
    var s = {};
    for (var c = 0; c < CATS.length; c++) {
      var val = payload[c + 1];
      if (val >= CATS[c].opts.length) return { err: "That code doesn’t match the current parts list." };
      s[CATS[c].id] = val;
    }
    return { state: s };
  }

  /* ── configurator ui ─────────────────────────────── */
  function buildUI() {
    var host = document.getElementById("categories");
    CATS.forEach(function (cat) {
      var div = document.createElement("div");
      div.className = "cat";
      div.innerHTML =
        '<div class="cat-head"><span class="cat-name">' + cat.name + '</span>' +
        '<span class="cat-current" id="cur-' + cat.id + '"></span></div>';
      var opts = document.createElement("div");
      opts.className = "opts";
      cat.opts.forEach(function (o, i) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "opt";
        b.setAttribute("data-cat", cat.id);
        b.setAttribute("data-i", i);
        b.setAttribute("aria-pressed", "false");
        b.innerHTML = '<i class="sw" style="background:' + o.css + '"></i><span>' + o.label + "</span>";
        b.addEventListener("click", function () { state[cat.id] = i; apply(); });
        opts.appendChild(b);
      });
      div.appendChild(opts);
      host.appendChild(div);
    });
  }

  /* ── copy / load ─────────────────────────────────── */
  function initActions() {
    var note = document.getElementById("copied-note");
    var noteT;
    document.getElementById("copy-code").addEventListener("click", function () {
      var code = document.getElementById("build-code").textContent;
      function ok() {
        note.textContent = "Copied — " + code;
        clearTimeout(noteT); noteT = setTimeout(function () { note.textContent = ""; }, 3200);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(ok, function () { fallback(); });
      } else fallback();
      function fallback() {
        var t = document.createElement("textarea");
        t.value = code; document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); ok(); } catch (e) { note.textContent = code; }
        document.body.removeChild(t);
      }
    });

    var msg = document.getElementById("load-msg");
    function tryLoad(val) {
      var r = decode(val);
      if (r.err) { msg.textContent = r.err; msg.className = "load-msg err"; return false; }
      state = r.state;
      apply();
      msg.textContent = "Build loaded — every part set exactly as commissioned.";
      msg.className = "load-msg ok";
      return true;
    }
    document.getElementById("load-code").addEventListener("click", function () {
      tryLoad(document.getElementById("code-input").value);
    });
    document.getElementById("code-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") tryLoad(this.value);
    });

    /* deep link: builder.html#AH-XXXXX-XXXXX */
    if (location.hash && location.hash.length > 4) {
      var r = decode(location.hash.slice(1));
      if (r.state) state = r.state;
    }
  }

  buildWatch();
  buildUI();
  initActions();
  apply();
})();
