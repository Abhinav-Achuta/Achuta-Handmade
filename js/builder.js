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
  function normCons(c) {
    if (Array.isArray(c)) return { oneOf: c };         /* accepts:{k:["a","b"]}  */
    if (c !== null && typeof c !== "object") return { equals: c }; /* accepts:{k:"royal-oak"} */
    return c;
  }
  function oneWay(S, P, pCat) {
    if (S.accepts && P.specs) {
      for (var key in S.accepts) {
        if (P.specs[key] == null) continue;            /* undeclared spec → unconstrained */
        var r = ruleText(S, key, normCons(S.accepts[key]), P.specs[key]);
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
  function lintRules() {
    var declared = {};                                  /* spec key -> {catId:true} */
    CATS.forEach(function (cat) {
      PARTS[cat.id].forEach(function (p) {
        if (p.specs) for (var k in p.specs) (declared[k] = declared[k] || {})[cat.id] = true;
      });
    });
    CATS.forEach(function (cat) {
      PARTS[cat.id].forEach(function (p) {
        if (p.accepts) for (var k in p.accepts) {
          var cons = p.accepts[k];
          if (cons !== null && typeof cons === "object" && !Array.isArray(cons)) {
            var known = ["min", "max", "equals", "oneOf"];
            var bad = Object.keys(cons).filter(function (ck) { return known.indexOf(ck) < 0; });
            if (bad.length) console.warn('[ACHUTA builder] "' + p.name + '" accepts:{' + k + ':{' + bad.join(",") + ':…}} — unknown comparator(s). Use min / max / equals / oneOf (e.g. { equals: "royal-oak" } or the shorthand "royal-oak"). This rule is being IGNORED.');
          }
          if (PARTS[k]) console.warn('[ACHUTA builder] "' + p.name + '" has accepts:{' + k + ':…} but "' + k + '" is a CATEGORY name. accepts matches SPEC names — for "only these parts" use compatible:{' + k + ':["part-id"]} instead.');
          else if (!declared[k]) console.warn('[ACHUTA builder] "' + p.name + '" accepts "' + k + '" but no part anywhere declares specs:{' + k + ':…} — nothing will grey out. Add that spec to the target parts, or use compatible:/incompatible: lists.');
          else CATS.forEach(function (c2) {
            if (!declared[k][c2.id]) return;
            var missing = PARTS[c2.id].filter(function (q) { return !q.specs || q.specs[k] == null; }).map(function (q) { return q.name; });
            if (missing.length) console.info('[ACHUTA builder] heads-up: these ' + c2.name.toLowerCase() + ' parts have no specs:{' + k + '} so "' + p.name + '" will never grey them: ' + missing.join(", ") + '. Add the spec, or switch to compatible:{' + c2.id + ':[…]}.');
          });
        }
        ["compatible", "incompatible"].forEach(function (kind) {
          if (p[kind]) for (var c in p[kind]) {
            if (!PARTS[c]) { console.warn('[ACHUTA builder] "' + p.name + '" ' + kind + ':{' + c + '} — no such category. Categories: ' + CATS.map(function (x) { return x.id; }).join(", ")); return; }
            (p[kind][c] || []).forEach(function (id) {
              if (!PARTS[c].some(function (q) { return q.id === id; }))
                console.warn('[ACHUTA builder] "' + p.name + '" ' + kind + ':{' + c + '} lists unknown part id "' + id + '". Known ids: ' + PARTS[c].map(function (q) { return q.id; }).join(", "));
            });
          }
        });
      });
    });
  }

  /* card registry: one entry per rendered card; groups list several part indices */
  var CARDREG = {};
  function updateCards() {
    CATS.forEach(function (cat) {
      var parts = PARTS[cat.id], sel = state[cat.id];
      var reasons = parts.map(function (p, i) {
        return i === sel ? null : conflictWithSelection(cat.id, p);   /* selected never greys */
      });
      (CARDREG[cat.id] || []).forEach(function (reg) {
        var el = reg.el;
        var selectedHere = reg.members.indexOf(sel) >= 0;
        var activeIdx = selectedHere ? sel : reg.members[0];
        var active = parts[activeIdx];
        el.setAttribute("data-i", activeIdx);
        el.setAttribute("aria-pressed", String(selectedHere));
        /* variant groups: refresh face + dots */
        if (reg.members.length > 1) {
          el.querySelector(".card-price").textContent = priceChip(active);
          el.querySelector(".card-name").textContent = active.name;
          el.querySelector(".card-vendor").textContent = active.vendor + (active.note ? " · " + active.note : "");
          if (!el.querySelector(".thumb-dynamic"))
            el.querySelector(".card-thumb").style.backgroundImage = "url('" + active.img + "')";
          reg.dots.forEach(function (dot) {
            var di = +dot.getAttribute("data-i");
            dot.setAttribute("aria-pressed", String(di === sel));
            var r = reasons[di];
            dot.classList.toggle("is-off", !!r);
            if (r) dot.setAttribute("title", r); else dot.removeAttribute("title");
          });
        }
        /* grey the card when every part it represents conflicts */
        var allOff = reg.members.every(function (i) { return !!reasons[i]; });
        var why = reasons[activeIdx] && reg.members.every(function (i) { return !!reasons[i]; })
          ? reasons[activeIdx] : (allOff ? reasons[reg.members[0]] : null);
        el.classList.toggle("is-off", allOff);
        if (allOff) { el.setAttribute("aria-disabled", "true"); el.setAttribute("title", why || ""); }
        else { el.removeAttribute("aria-disabled"); el.removeAttribute("title"); }
        el.querySelector(".card-why").textContent = allOff ? (why || "") : (reg.members.length === 1 && reasons[reg.members[0]] ? reasons[reg.members[0]] : "");
      });
    });
  }
  function refreshCompat() { updateCards(); }

  /* ── preview stack (z-order from LAYERS, per-part override) ── */
  function fmtPrice(v) { return (typeof PRICING !== "undefined" ? PRICING.currency : "$") + v; }
  function priceChip(p) {
    if (p.price == null) return "";
    return p.price === 0 ? "Included" : fmtPrice(p.price);
  }
  function priceOf(catId) {
    var p = part(catId);
    if (p.matchesHandset) return 0;                 /* included seconds costs nothing */
    return p.price || 0;
  }
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
  var MINI = null;   /* mirror imgs for the mobile mini-bar, built at init */
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

    /* mirror every layer into the mobile mini-bar */
    if (MINI) ["ly-case", "ly-band", "ly-mov", "ly-dial", "ly-ovl1", "ly-ovl2", "ly-hands", "ly-sec"].forEach(function (id) {
      var srcEl = document.getElementById(id), m = MINI[id];
      if (!m) return;
      if (srcEl.getAttribute("src") && srcEl.style.display !== "none") {
        m.src = srcEl.src;
        m.style.display = "";
        m.style.zIndex = srcEl.style.zIndex || getComputedStyle(srcEl.parentElement === m.parentElement ? srcEl : srcEl).zIndex;
        if (id !== "ly-sec") m.style.zIndex = srcEl.style.zIndex;
      } else { m.removeAttribute("src"); m.style.display = "none"; }
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
    });

    var total = 0;
    CATS.forEach(function (c) { total += priceOf(c.id); });
    var totalEl = document.getElementById("est-total");
    if (totalEl) totalEl.textContent = fmtPrice(total);
    var mt = document.getElementById("mini-total");
    if (mt) mt.textContent = fmtPrice(total);
    var noteEl = document.getElementById("est-note");
    if (noteEl && typeof PRICING !== "undefined") noteEl.textContent = PRICING.note;

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
      lines.join("%0D%0A") +
      "%0D%0A%0D%0AEstimated parts total: " + fmtPrice(total) + " (parts only)%0D%0A";
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
      CARDREG[cat.id] = [];

      /* colour-variant groups: parts sharing p.group render as ONE card with dots */
      var seenGroup = {};
      var units = [];
      ordered.forEach(function (o) {
        if (o.p.group) {
          if (seenGroup[o.p.group]) { seenGroup[o.p.group].members.push(o.i); return; }
          var u = { members: [o.i], group: o.p.group };
          seenGroup[o.p.group] = u; units.push(u);
        } else units.push({ members: [o.i] });
      });

      units.forEach(function (u) {
        var first = parts[u.members[0]];
        var tags = [];
        u.members.forEach(function (i) { (parts[i].tags || []).forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); }); });

        var b = document.createElement(u.members.length > 1 ? "div" : "button");
        if (u.members.length === 1) b.type = "button"; else { b.setAttribute("role", "button"); b.tabIndex = 0; }
        b.className = "card" + (u.members.length > 1 ? " card--group" : "");
        b.setAttribute("data-cat", cat.id);
        b.setAttribute("data-i", u.members[0]);
        b.setAttribute("data-tags", tags.join("|"));
        b.setAttribute("aria-pressed", "false");
        var dotsHtml = "";
        if (u.members.length > 1) {
          dotsHtml = '<span class="dots" aria-label="Colour options">' + u.members.map(function (i) {
            return '<button type="button" class="dot" data-i="' + i + '" aria-pressed="false" aria-label="' +
              parts[i].name + '" style="background:' + (parts[i].swatch || parts[i].css || "#888") + '"></button>';
          }).join("") + "</span>";
        }
        b.innerHTML =
          '<span class="card-price">' + priceChip(first) + '</span>' +
          '<span class="card-thumb ' + cat.thumb + (first.matchesHandset ? ' thumb-dynamic' : '') + '" style="background-image:url(\'' + first.img + '\')"></span>' +
          '<span class="card-name">' + first.name + '</span>' +
          '<span class="card-vendor">' + first.vendor + (first.note ? " · " + first.note : "") + '</span>' +
          dotsHtml +
          '<span class="card-why"></span>';

        function choose(i) {
          if (b.classList.contains("is-off")) return;
          state[cat.id] = i; apply();
        }
        b.addEventListener("click", function (e) {
          var dot = e.target.closest ? e.target.closest(".dot") : null;
          if (dot) {
            if (dot.classList.contains("is-off")) return;
            choose(+dot.getAttribute("data-i"));
            return;
          }
          choose(+b.getAttribute("data-i"));            /* card body = active variant */
        });
        if (u.members.length > 1) b.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(+b.getAttribute("data-i")); }
        });

        CARDREG[cat.id].push({ el: b, members: u.members, dots: [].slice.call(b.querySelectorAll(".dot")) });
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
    window.addEventListener("hashchange", function () {
      if (location.hash.length > 4) {
        var r = decode(location.hash.slice(1));
        if (r.state) { state = r.state; apply(); }
      }
    });
  }

  /* ── mobile mini-bar ─────────────────────────────── */
  function initMiniBar() {
    var bar = document.getElementById("mini-bar");
    var host = document.getElementById("mini-stack");
    if (!bar || !host) return;
    MINI = {};
    ["ly-band", "ly-mov", "ly-dial", "ly-ovl1", "ly-ovl2", "ly-hands", "ly-sec", "ly-case"].forEach(function (id) {
      var img = document.createElement("img");
      img.className = "mini-layer" + (id === "ly-sec" ? " mini-sec" : "");
      img.alt = "";
      host.appendChild(img);
      MINI[id] = img;
    });
    bar.hidden = false;
    var stage = document.querySelector(".stage");
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { bar.classList.toggle("on", !e.isIntersecting); });
    }, { threshold: 0.05 });
    io.observe(stage);
    document.getElementById("mini-view").addEventListener("click", function () {
      stage.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ── my builds (this browser) ────────────────────── */
  var SAVE_KEY = "achuta-builds-v1";
  function storageOK() {
    try { localStorage.setItem("__t", "1"); localStorage.removeItem("__t"); return true; }
    catch (e) { return false; }
  }
  function getSaved() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) || "[]"); } catch (e) { return []; }
  }
  function priceForState(s) {
    var t = 0;
    CATS.forEach(function (c) {
      var p = PARTS[c.id][s[c.id]];
      if (p && !p.matchesHandset) t += p.price || 0;
    });
    return t;
  }
  function renderSaved() {
    var list = document.getElementById("saved-list");
    var empty = document.getElementById("saved-empty");
    if (!list) return;
    var builds = getSaved();
    list.innerHTML = "";
    empty.style.display = builds.length ? "none" : "";
    builds.forEach(function (bld) {
      var r = decode(bld.code);
      var row = document.createElement("div");
      row.className = "saved-row";
      var when = new Date(bld.ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
      var price = r.state ? fmtPrice(priceForState(r.state)) : "—";
      row.innerHTML =
        '<span class="saved-name">' + bld.name + '</span>' +
        '<span class="saved-meta">' + bld.code + " · " + when + " · " + price + "</span>" +
        '<span class="saved-actions">' +
        '<button type="button" class="btn btn--ghost saved-load">Load</button>' +
        '<button type="button" class="saved-del" aria-label="Delete ' + bld.name + '">✕</button></span>';
      row.querySelector(".saved-load").addEventListener("click", function () {
        var res = decode(bld.code);
        if (res.state) {
          state = res.state; apply();
          var msg = document.getElementById("load-msg");
          msg.textContent = "“" + bld.name + "” loaded.";
          msg.className = "load-msg ok";
        }
      });
      row.querySelector(".saved-del").addEventListener("click", function () {
        persistSaved(getSaved().filter(function (x) { return x.code !== bld.code; }));
      });
      list.appendChild(row);
    });
  }
  function persistSaved(builds) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(builds)); } catch (e) {}
    renderSaved();
  }
  function initSaved() {
    var box = document.getElementById("saved-box");
    var btn = document.getElementById("save-build");
    if (!box || !btn) return;
    if (!storageOK()) { box.style.display = "none"; btn.style.display = "none"; return; }
    btn.addEventListener("click", function () {
      var code = encode(state);
      var name = part("case").name + " · " + part("dial").name;
      var builds = getSaved().filter(function (x) { return x.code !== code; });
      builds.unshift({ code: code, name: name, ts: Date.now() });
      persistSaved(builds.slice(0, 8));
      var note = document.getElementById("copied-note");
      note.textContent = "Saved — " + name;
      setTimeout(function () { if (note.textContent.indexOf("Saved") === 0) note.textContent = ""; }, 3200);
    });
    renderSaved();
  }

  buildUI();
  initActions();
  initMiniBar();
  initSaved();
  syncSweep();
  apply();
  lintRules();

  /* owner hook: tweak PARTS in the console, then ACHUTA.refresh() */
  window.ACHUTA = {
    parts: PARTS,
    refresh: apply,
    getState: function () { var s = {}; for (var k in state) s[k] = state[k]; return s; }
  };
})();
