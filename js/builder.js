/* ═══════════════════════════════════════════════════════
   ACHUTA HANDMADE — build your own
   layered part-image configurator · filters · build codes
   Catalogue lives in js/parts-data.js
   ═══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var CATS = [
    { id: "case",     name: "Case",         thumb: "t-case" },
    { id: "movement", name: "Movement",     thumb: "t-mov" },
    { id: "dial",     name: "Dial",         thumb: "t-dial" },
    { id: "handset",  name: "Handset",      thumb: "t-hands" },
    { id: "seconds",  name: "Seconds hand", thumb: "t-sec" }
  ];

  /* default = the watch from the films */
  var state = { case: 0, movement: 0, dial: 0, handset: 0, seconds: 0 };
  var filters = { case: null, movement: null, dial: null, handset: null, seconds: null };

  function part(cat) { return PARTS[cat][state[cat]]; }

  /* ── preview stack ───────────────────────────────── */
  function applyPreview() {
    document.getElementById("ly-case").src = part("case").img;
    document.getElementById("ly-dial").src = part("dial").img;
    document.getElementById("ly-hands").src = part("handset").img;
    document.getElementById("ly-sec").src = part("seconds").img;

    var mov = part("movement");
    var ovls = mov.overlays || [];
    [0, 1].forEach(function (i) {
      var img = document.getElementById("ly-ovl" + (i + 1));
      if (ovls[i]) { img.src = ovls[i]; img.style.display = ""; }
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
  var VERSION = 2;

  function digits(s) { return [VERSION].concat(CATS.map(function (c) { return s[c.id]; })); }
  function checksum(ds) {
    var sum = 0;
    for (var i = 0; i < ds.length; i++) sum += ds[i] * (i + 3);
    return sum % 30;
  }
  function encode(s) {
    var ds = digits(s);
    var chars = ds.map(function (d) { return ALPHA[d]; }).join("") + ALPHA[checksum(ds)];
    return "AH-" + chars.slice(0, 3) + "-" + chars.slice(3);
  }
  function decode(str) {
    if (!str) return { err: "Enter a code." };
    var raw = String(str).toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (raw.slice(0, 2) === "AH") raw = raw.slice(2);
    if (raw.length === 10) return { err: "That looks like a code from the previous builder — ask us and we’ll translate it." };
    if (raw.length !== 7) return { err: "A build code has 7 characters after AH." };
    var ds = [];
    for (var i = 0; i < 7; i++) {
      var v = ALPHA.indexOf(raw[i]);
      if (v < 0) return { err: "Unrecognized character “" + raw[i] + "”." };
      ds.push(v);
    }
    var payload = ds.slice(0, 6), check = ds[6];
    if (checksum(payload) !== check) return { err: "That code doesn’t check out — one character may be mistyped." };
    if (payload[0] !== VERSION) return { err: "This code is from a different builder version." };
    var s = {};
    for (var c = 0; c < CATS.length; c++) {
      var val = payload[c + 1];
      if (val >= PARTS[CATS[c].id].length) return { err: "That code doesn’t match the current parts list." };
      s[CATS[c].id] = val;
    }
    return { state: s };
  }

  /* ── apply everything ────────────────────────────── */
  function apply() {
    applyPreview();

    CATS.forEach(function (cat) {
      var cur = document.getElementById("cur-" + cat.id);
      if (cur) cur.textContent = part(cat.id).name;
      var cards = document.querySelectorAll('[data-cat="' + cat.id + '"][data-i]');
      for (var i = 0; i < cards.length; i++)
        cards[i].setAttribute("aria-pressed", String(+cards[i].getAttribute("data-i") === state[cat.id]));
    });

    var code = encode(state);
    document.getElementById("build-code").textContent = code;

    var lines = CATS.map(function (c) {
      var p = part(c.id);
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
        '<div class="cat-head"><span class="cat-name">' + cat.name +
        ' <span class="cat-count">' + parts.length + '</span></span>' +
        '<span class="cat-current" id="cur-' + cat.id + '"></span></div>';

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
      sec.appendChild(chips);

      /* part cards */
      var grid = document.createElement("div");
      grid.className = "grid";
      parts.forEach(function (p, i) {
        var b = document.createElement("button");
        b.type = "button"; b.className = "card";
        b.setAttribute("data-cat", cat.id);
        b.setAttribute("data-i", i);
        b.setAttribute("data-tags", (p.tags || []).join("|"));
        b.setAttribute("aria-pressed", "false");
        b.innerHTML =
          '<span class="card-thumb ' + cat.thumb + '" style="background-image:url(\'' + p.img + '\')"></span>' +
          '<span class="card-name">' + p.name + '</span>' +
          '<span class="card-vendor">' + p.vendor + (p.note ? " · " + p.note : "") + '</span>';
        b.addEventListener("click", function () { state[cat.id] = i; apply(); });
        grid.appendChild(b);
      });
      sec.appendChild(grid);
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

    if (location.hash && location.hash.length > 4) {
      var r = decode(location.hash.slice(1));
      if (r.state) state = r.state;
    }
  }

  buildUI();
  initActions();
  syncSweep();
  apply();
})();
