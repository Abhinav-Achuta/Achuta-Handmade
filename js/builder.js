/* ═══════════════════════════════════════════════════════
   ACHUTA HANDMADE — build your own
   layered part-image configurator · filters · build codes
   Catalogue lives in js/parts-data.js
   ═══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var CATS = [
    { id: "case",     name: "Case",         thumb: "t-case" },
    { id: "band",     name: "Band / bracelet", thumb: "t-band" },
    { id: "movement", name: "Movement",     thumb: "t-mov" },
    { id: "dial",     name: "Dial",         thumb: "t-dial" },
    { id: "handset",  name: "Handset",      thumb: "t-hands" },
    { id: "seconds",  name: "Seconds hand", thumb: "t-sec" },
    { id: "datewheel", name: "Date wheel",  thumb: "t-dw" }
  ];

  /* default = the watch from the films */
  var state = { case: 0, band: 0, movement: 0, dial: 0, handset: 0, seconds: 5, datewheel: 0 };
  var filters = { case: null, band: null, movement: null, dial: null, handset: null, seconds: null, datewheel: null };

  function part(cat) { return PARTS[cat][state[cat]]; }

  /* ── compatibility engine ────────────────────────────
     Rules live entirely in parts-data.js:
     specs / accepts {min,max,equals,oneOf} / compatible / incompatible */
  function ruleText(owner, key, cons, val) {
    var unit = /_mm$/.test(key) ? " mm" : "";
    var label = key.replace(/_mm$/, "").replace(/_/g, " ");
    if (cons.max != null && val > cons.max) return owner.name + " fits " + label + "s ≤ " + cons.max + unit + " — this is " + val + unit;
    if (cons.min != null && val < cons.min) return owner.name + " needs " + label + " ≥ " + cons.min + unit + " — this is " + val + unit;
    if (cons.equals != null && val !== cons.equals) return owner.name + " needs " + label + " = " + cons.equals + unit;
    if (cons.oneOf && cons.oneOf.indexOf(val) < 0) return owner.name + " needs " + label + ": " + cons.oneOf.join(" / ");
    return null;
  }
  function oneWay(S, P, pCat) {
    if (S.accepts && P.specs) {
      for (var key in S.accepts) {
        if (P.specs[key] == null) continue;            /* undeclared spec → unconstrained */
        var r = ruleText(S, key, S.accepts[key], P.specs[key]);
        if (r) return r;
      }
    }
    if (S.compatible && S.compatible[pCat] && S.compatible[pCat].indexOf(P.id) < 0)
      return "Not offered with " + S.name;
    if (S.incompatible && S.incompatible[pCat] && S.incompatible[pCat].indexOf(P.id) >= 0)
      return "Not compatible with " + S.name;
    return null;
  }
  function compatReason(pCat, P, sCat, S) {
    return oneWay(S, P, pCat) || oneWay(P, S, sCat);
  }
  /* reason P can't join the current selection (null = compatible) */
  function conflictWithSelection(pCat, P) {
    for (var c = 0; c < CATS.length; c++) {
      var sCat = CATS[c].id;
      if (sCat === pCat) continue;
      var r = compatReason(pCat, P, sCat, part(sCat));
      if (r) return r;
    }
    return null;
  }
  /* conflicts inside the current selection itself (used after code loads) */
  function selectionConflicts() {
    var out = [];
    for (var a = 0; a < CATS.length; a++)
      for (var b = a + 1; b < CATS.length; b++) {
        var r = compatReason(CATS[a].id, part(CATS[a].id), CATS[b].id, part(CATS[b].id));
        if (r) out.push(r);
      }
    return out;
  }
  function refreshCompat() {
    CATS.forEach(function (cat) {
      var cards = document.querySelectorAll('.card[data-cat="' + cat.id + '"]');
      for (var i = 0; i < cards.length; i++) {
        var why = cards[i].querySelector(".card-why");
        if (i === state[cat.id]) {                      /* the selected part is never greyed */
          cards[i].classList.remove("is-off");
          cards[i].removeAttribute("aria-disabled");
          why.textContent = "";
          continue;
        }
        var reason = conflictWithSelection(cat.id, PARTS[cat.id][i]);
        cards[i].classList.toggle("is-off", !!reason);
        if (reason) { cards[i].setAttribute("aria-disabled", "true"); cards[i].setAttribute("title", reason); }
        else { cards[i].removeAttribute("aria-disabled"); cards[i].removeAttribute("title"); }
        why.textContent = reason || "";
      }
    });
  }

  /* ── preview stack (z-order from LAYERS, per-part override) ── */
  function secondsImg() {
    var sp = part("seconds");
    if (sp.matchesHandset) return part("handset").includedSeconds || PARTS.seconds[0].img;
    return sp.img;
  }
  function z(catKey, p) { return (p && p.layer != null) ? p.layer : LAYERS[catKey]; }
  function setLayer(id, catKey) {
    var p = part(catKey), img = document.getElementById(id);
    img.src = p.img;
    img.style.zIndex = z(catKey, p);
  }
  function applyPreview() {
    setLayer("ly-case", "case");
    setLayer("ly-band", "band");
    setLayer("ly-mov", "movement");
    setLayer("ly-dial", "dial");
    setLayer("ly-hands", "handset");
    document.getElementById("ly-sec").src = secondsImg();
    document.getElementById("sec-rot").style.zIndex = z("seconds", part("seconds"));

    var mov = part("movement");
    var dw = part("datewheel");
    var ovls = (mov.windows || []).map(function (w) {
      if (w === "gmt") return { src: "parts/ovl-gmt.png", z: LAYERS.gmt };
      var s = dw.imgs && dw.imgs[w];
      return s ? { src: s, z: (dw.layer != null ? dw.layer : LAYERS.window) } : null;
    }).filter(Boolean);
    [0, 1].forEach(function (i) {
      var img = document.getElementById("ly-ovl" + (i + 1));
      if (ovls[i]) { img.src = ovls[i].src; img.style.zIndex = ovls[i].z; img.style.display = ""; }
      else { img.removeAttribute("src"); img.style.display = "none"; }
    });

    /* beat rate follows the movement (NH3x = 6 beats/sec) */
    var bps = mov.bps || 6;
    document.getElementById("sec-rot").style.animationTimingFunction = "steps(" + (60 * bps) + ")";

    document.getElementById("stage-spec").textContent = mov.name + " — " + mov.spec;
  }

  /* start the sweep at the real current second, like a watch on the wrist */
  function syncSweep() {
    var now = new Date();
    var t = now.getSeconds() + now.getMilliseconds() / 1000;
    document.getElementById("sec-rot").style.animationDelay = (-t).toFixed(3) + "s";
  }

  /* ── build code (v2) ─────────────────────────────── */
  var ALPHA = "23456789ABCDEFGHJKMNPQRSTVWXYZ"; // 30 unambiguous chars
  /* every code version and its category order — APPEND-ONLY.
     When you add a category: copy the last line, add the new id at the
     end, bump VERSION. Older codes keep loading (new picks default 0). */
  var HISTORY = {
    2: ["case", "movement", "dial", "handset", "seconds"],
    3: ["case", "movement", "dial", "handset", "seconds", "datewheel"],
    4: ["case", "movement", "dial", "handset", "seconds", "datewheel", "band"]
  };
  var VERSION = 4;

  function digits(s) { return [VERSION].concat(HISTORY[VERSION].map(function (id) { return s[id]; })); }
  function checksum(ds) {
    var sum = 0;
    for (var i = 0; i < ds.length; i++) sum += ds[i] * (i + 3);
    return sum % 30;
  }
  function encode(s) {
    var ds = digits(s);
    var chars = ds.map(function (d) { return ALPHA[d]; }).join("") + ALPHA[checksum(ds)];
    var mid = Math.floor(chars.length / 2);
    return "AH-" + chars.slice(0, mid) + "-" + chars.slice(mid);
  }
  function decode(str) {
    if (!str) return { err: "Enter a code." };
    var raw = String(str).toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (raw.slice(0, 2) === "AH") raw = raw.slice(2);
    if (raw.length < 4) return { err: "That code is too short." };
    var ver = ALPHA.indexOf(raw[0]);
    if (ver === 1) return { err: "That looks like a code from the previous builder — ask us and we’ll translate it." };
    var order = HISTORY[ver];
    if (!order) return { err: "This code is from a different builder version." };
    var need = order.length + 2;                     /* version + picks + checksum */
    if (raw.length !== need) return { err: "A v" + ver + " build code has " + need + " characters after AH." };
    var ds = [];
    for (var i = 0; i < need; i++) {
      var v = ALPHA.indexOf(raw[i]);
      if (v < 0) return { err: "Unrecognized character “" + raw[i] + "”." };
      ds.push(v);
    }
    var payload = ds.slice(0, need - 1), check = ds[need - 1];
    if (checksum(payload) !== check) return { err: "That code doesn’t check out — one character may be mistyped." };
    var s = {};
    CATS.forEach(function (c) { s[c.id] = 0; });     /* categories newer than the code default to first part */
    for (var c = 0; c < order.length; c++) {
      var val = payload[c + 1];
      if (!PARTS[order[c]] || val >= PARTS[order[c]].length) return { err: "That code doesn’t match the current parts list." };
      s[order[c]] = val;
    }
    return { state: s };
  }

  /* ── apply everything ────────────────────────────── */
  function apply() {
    applyPreview();
    refreshCompat();

    CATS.forEach(function (cat) {
      var cur = document.getElementById("cur-" + cat.id);
      if (cur) cur.textContent = part(cat.id).name;
      var cards = document.querySelectorAll('[data-cat="' + cat.id + '"][data-i]');
      for (var i = 0; i < cards.length; i++)
        cards[i].setAttribute("aria-pressed", String(+cards[i].getAttribute("data-i") === state[cat.id]));
    });

    var code = encode(state);
    document.getElementById("build-code").textContent = code;

    var incThumb = document.querySelector('.card[data-cat="seconds"] .thumb-dynamic');
    if (incThumb) incThumb.style.backgroundImage = "url('" + (part("handset").includedSeconds || PARTS.seconds[0].img) + "')";

    var lines = CATS.map(function (c) {
      var p = part(c.id);
      if (p.matchesHandset) return c.name + ": " + p.name + " — matches " + part("handset").name;
      return c.name + ": " + p.name + " (" + p.vendor + ")";
    });
    var body = "ACHUTA HANDMADE — commission request%0D%0A%0D%0ABuild code: " + code + "%0D%0A%0D%0A" +
      lines.join("%0D%0A") + "%0D%0A";
    document.getElementById("send-commission").setAttribute("href",
      "mailto:commissions@achutahandmade.com?subject=" + encodeURIComponent("Commission — " + code) + "&body=" + body);

    if (history.replaceState) history.replaceState(null, "", "#" + code);
  }

  /* ── catalogue ui with filters ───────────────────── */
  function buildUI() {
    var host = document.getElementById("categories");
    CATS.forEach(function (cat) {
      var parts = PARTS[cat.id];
      var sec = document.createElement("section");
      sec.className = "cat";
      sec.innerHTML =
        '<div class="cat-head">' +
        '<button type="button" class="cat-toggle" aria-expanded="true" aria-controls="body-' + cat.id + '">' +
        '<i class="caret" aria-hidden="true"></i>' +
        '<span class="cat-name">' + cat.name + ' <span class="cat-count">' + parts.length + '</span></span>' +
        '</button>' +
        '<span class="cat-current" id="cur-' + cat.id + '"></span></div>' +
        '<div class="cat-body" id="body-' + cat.id + '"><div class="cat-body-inner"></div></div>';
      var inner = sec.querySelector(".cat-body-inner");
      var tog = sec.querySelector(".cat-toggle");
      tog.addEventListener("click", function () {
        var collapsed = sec.classList.toggle("is-collapsed");
        tog.setAttribute("aria-expanded", String(!collapsed));
        inner.inert = collapsed;                 /* hidden parts leave the tab order */
      });

      /* filter chips from the union of tags */
      var tags = [];
      parts.forEach(function (p) { (p.tags || []).forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); }); });
      var chips = document.createElement("div");
      chips.className = "chips";
      function chip(label, tag) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "chip"; b.textContent = label;
        b.setAttribute("data-cat", cat.id);
        b.setAttribute("aria-pressed", String(filters[cat.id] === tag));
        b.addEventListener("click", function () {
          filters[cat.id] = tag;
          var all = chips.querySelectorAll(".chip");
          for (var i = 0; i < all.length; i++) all[i].setAttribute("aria-pressed", "false");
          b.setAttribute("aria-pressed", "true");
          filterCards();
        });
        chips.appendChild(b);
        return b;
      }
      chip("All", null).setAttribute("aria-pressed", "true");
      tags.forEach(function (t) { chip(t, t); });
      inner.appendChild(chips);

      /* part cards */
      var grid = document.createElement("div");
      grid.className = "grid";
      var ordered = parts.map(function (p, i) { return { p: p, i: i }; });
      ordered.sort(function (a, b) { return ((b.p.featured ? 1 : 0) - (a.p.featured ? 1 : 0)) || (a.i - b.i); });
      ordered.forEach(function (o) {
        var p = o.p, i = o.i;
        var b = document.createElement("button");
        b.type = "button"; b.className = "card";
        b.setAttribute("data-cat", cat.id);
        b.setAttribute("data-i", i);
        b.setAttribute("data-tags", (p.tags || []).join("|"));
        b.setAttribute("aria-pressed", "false");
        b.innerHTML =
          '<span class="card-thumb ' + cat.thumb + (p.matchesHandset ? ' thumb-dynamic' : '') + '" style="background-image:url(\'' + p.img + '\')"></span>' +
          '<span class="card-name">' + p.name + '</span>' +
          '<span class="card-vendor">' + p.vendor + (p.note ? " · " + p.note : "") + '</span>' +
          '<span class="card-why"></span>';
        b.addEventListener("click", function () {
          if (b.classList.contains("is-off")) return;   /* greyed = not selectable */
          state[cat.id] = i; apply();
        });
        grid.appendChild(b);
      });
      inner.appendChild(grid);
      host.appendChild(sec);
    });

    function filterCards() {
      CATS.forEach(function (cat) {
        var f = filters[cat.id];
        var cards = document.querySelectorAll('.card[data-cat="' + cat.id + '"]');
        for (var i = 0; i < cards.length; i++) {
          var show = !f || cards[i].getAttribute("data-tags").split("|").indexOf(f) >= 0;
          cards[i].style.display = show ? "" : "none";
        }
      });
    }
  }

  /* ── copy / load / deep link ─────────────────────── */
  function initActions() {
    var note = document.getElementById("copied-note");
    var noteT;
    document.getElementById("copy-code").addEventListener("click", function () {
      var code = document.getElementById("build-code").textContent;
      function ok() {
        note.textContent = "Copied — " + code;
        clearTimeout(noteT); noteT = setTimeout(function () { note.textContent = ""; }, 3200);
      }
      function fallback() {
        var t = document.createElement("textarea");
        t.value = code; document.body.appendChild(t); t.select();
        try { document.execCommand("copy"); ok(); } catch (e) { note.textContent = code; }
        document.body.removeChild(t);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(code).then(ok, fallback);
      } else fallback();
    });

    var msg = document.getElementById("load-msg");
    function tryLoad(val) {
      var r = decode(val);
      if (r.err) { msg.textContent = r.err; msg.className = "load-msg err"; return false; }
      state = r.state;
      apply();
      var conflicts = selectionConflicts();
      if (conflicts.length) {
        msg.textContent = "Build loaded as commissioned — heads-up: " + conflicts[0] + ".";
        msg.className = "load-msg err";
      } else {
        msg.textContent = "Build loaded — every part set exactly as commissioned.";
        msg.className = "load-msg ok";
      }
      return true;
    }
    document.getElementById("load-code").addEventListener("click", function () {
      tryLoad(document.getElementById("code-input").value);
    });
    document.getElementById("code-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") tryLoad(this.value);
    });

    if (location.hash && location.hash.length > 4) {
      var r = decode(location.hash.slice(1));
      if (r.state) state = r.state;
    }
  }

  buildUI();
  initActions();
  syncSweep();
  apply();

  /* owner hook: tweak PARTS in the console, then ACHUTA.refresh() */
  window.ACHUTA = {
    parts: PARTS,
    refresh: apply,
    getState: function () { var s = {}; for (var k in state) s[k] = state[k]; return s; }
  };
})();
