/* ═══════════════════════════════════════════════════════
   ACHUTA HANDMADE — scroll engine
   native scroll + lerped virtual value → buttery scrubbing
   ═══════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var LERP = REDUCED ? 1 : 0.085;          // smoothing factor (Lenis-style)
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  var SEQS = {
    hero:  { path: "seq/hero/f_",  count: 193 },
    macro: { path: "seq/macro/f_", count: 193 },
    expl:  { path: "seq/expl/f_",  count: 193 }
  };

  function pad(n) { return ("0000" + n).slice(-4); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ── sequence loading ─────────────────────────────── */
  function makeSeq(cfg) {
    return { imgs: new Array(cfg.count), ok: new Array(cfg.count), count: cfg.count, path: cfg.path, loaded: 0 };
  }
  Object.keys(SEQS).forEach(function (k) { SEQS[k] = makeSeq(SEQS[k]); });

  function loadSeq(seq, onEach, onDone) {
    var i = 0, active = 0, CONC = 10, finished = 0;
    function next() {
      while (active < CONC && i < seq.count) {
        (function (idx) {
          active++; i++;
          var img = new Image();
          img.onload = img.onerror = function (e) {
            active--;
            finished++;
            if (e.type === "load") { seq.ok[idx] = true; seq.loaded++; }
            if (onEach) onEach(finished, seq.count);
            if (finished === seq.count) { if (onDone) onDone(); }
            else next();
          };
          img.src = seq.path + pad(idx + 1) + ".webp";
          seq.imgs[idx] = img;
        })(i);
      }
    }
    next();
  }

  function nearestFrame(seq, idx) {
    if (seq.ok[idx]) return seq.imgs[idx];
    for (var d = 1; d < seq.count; d++) {
      if (idx - d >= 0 && seq.ok[idx - d]) return seq.imgs[idx - d];
      if (idx + d < seq.count && seq.ok[idx + d]) return seq.imgs[idx + d];
    }
    return null;
  }

  /* ── smooth scroll value ──────────────────────────── */
  var targetY = window.scrollY || 0;
  var smoothY = targetY;
  var vh = window.innerHeight;
  var docMax = 1;

  /* ── scrub sections ───────────────────────────────── */
  function ScrubSection(sectionId, canvasId, seqKey) {
    this.el = document.getElementById(sectionId);
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.seq = SEQS[seqKey];
    this.top = 0; this.range = 1;
    this.notes = [].slice.call(this.el.querySelectorAll("[data-show]")).map(function (n) {
      var r = n.getAttribute("data-show").split(",").map(parseFloat);
      return { el: n, a: r[0], b: r[1], c: r[2], d: r[3], last: -1 };
    });
    this.lastF = -1;
    this.measure();
  }
  ScrubSection.prototype.measure = function () {
    var r = this.el.getBoundingClientRect();
    this.top = r.top + (window.scrollY || 0);
    this.range = Math.max(1, this.el.offsetHeight - vh);
    var c = this.canvas;
    var w = c.clientWidth, h = c.clientHeight;
    if (w && h) { c.width = Math.round(w * DPR); c.height = Math.round(h * DPR); }
    this.lastF = -1; // force redraw
  };
  ScrubSection.prototype.progress = function () {
    return clamp((smoothY - this.top) / this.range, 0, 1);
  };
  ScrubSection.prototype.visible = function () {
    var y = smoothY;
    return y > this.top - vh * 1.2 && y < this.top + this.el.offsetHeight + vh * 0.2;
  };
  ScrubSection.prototype.drawCover = function (img, alpha) {
    var ctx = this.ctx, cw = this.canvas.width, ch = this.canvas.height;
    var iw = img.naturalWidth, ih = img.naturalHeight;
    if (!iw || !ih) return;
    var s = Math.max(cw / iw, ch / ih);
    var dw = iw * s, dh = ih * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    ctx.globalAlpha = 1;
  };
  ScrubSection.prototype.render = function () {
    if (!this.visible()) return;
    var p = this.progress();
    var f = p * (this.seq.count - 1);
    var key = Math.round(f * 500);
    if (key !== this.lastF) {
      this.lastF = key;
      var i0 = Math.floor(f);
      var i1 = Math.min(i0 + 1, this.seq.count - 1);
      var mix = f - i0;
      var imgA = nearestFrame(this.seq, i0);
      if (imgA) {
        this.ctx.fillStyle = "#060504";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCover(imgA, 1);
        if (mix > 0.001 && i1 !== i0 && this.seq.ok[i1]) {
          this.drawCover(this.seq.imgs[i1], mix);
        }
      }
    }
    for (var n = 0; n < this.notes.length; n++) {
      var note = this.notes[n];
      var o = 0, ty = 0;
      if (p <= note.a) { o = 0; ty = 26; }
      else if (p < note.b) { var t = (p - note.a) / (note.b - note.a); o = t; ty = 26 * (1 - t); }
      else if (p <= note.c) { o = 1; ty = 0; }
      else if (p < note.d) { var t2 = (p - note.c) / (note.d - note.c); o = 1 - t2; ty = -26 * t2; }
      else { o = 0; ty = -26; }
      var okey = Math.round(o * 200) * 1000 + Math.round(ty);
      if (okey !== note.last) {
        note.last = okey;
        note.el.style.opacity = o.toFixed(3);
        note.el.style.transform = "translateY(" + ty.toFixed(1) + "px)";
      }
    }
  };

  /* ── gold dust (hero only) ────────────────────────── */
  function Dust(canvasId, heroSection) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.hero = heroSection;
    this.parts = [];
    this.resize();
    var N = REDUCED ? 0 : 64;
    for (var i = 0; i < N; i++) this.parts.push(this.spawn(true));
  }
  Dust.prototype.resize = function () {
    this.canvas.width = Math.round(this.canvas.clientWidth * DPR);
    this.canvas.height = Math.round(this.canvas.clientHeight * DPR);
  };
  Dust.prototype.spawn = function (anywhere) {
    var w = this.canvas.width, h = this.canvas.height;
    return {
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: (Math.random() * 1.4 + 0.4) * DPR,
      vy: -(Math.random() * 0.16 + 0.05) * DPR,
      vx: (Math.random() - 0.5) * 0.08 * DPR,
      ph: Math.random() * Math.PI * 2,
      sp: Math.random() * 0.012 + 0.004,
      o: Math.random() * 0.5 + 0.15
    };
  };
  Dust.prototype.render = function (t) {
    if (REDUCED) return;
    if (!this.hero.visible()) return;
    var ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);
    for (var i = 0; i < this.parts.length; i++) {
      var p = this.parts[i];
      p.ph += p.sp;
      p.x += p.vx + Math.sin(p.ph) * 0.12 * DPR;
      p.y += p.vy;
      if (p.y < -12 || p.x < -12 || p.x > w + 12) this.parts[i] = this.spawn(false);
      var tw = 0.55 + 0.45 * Math.sin(p.ph * 2.1);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      ctx.fillStyle = "rgba(216,178,128," + (p.o * tw).toFixed(3) + ")";
      ctx.fill();
    }
  };

  /* ── boot ─────────────────────────────────────────── */
  var scrubs, dust, heroUI, heroTitleWrap, header, pageBar, preloader, preFill, prePct;

  function measureAll() {
    vh = window.innerHeight;
    docMax = Math.max(1, document.documentElement.scrollHeight - vh);
    scrubs.forEach(function (s) { s.measure(); });
    dust.resize();
  }

  function frame(t) {
    targetY = window.scrollY || 0;
    smoothY += (targetY - smoothY) * LERP;
    if (Math.abs(targetY - smoothY) < 0.05) smoothY = targetY;

    for (var i = 0; i < scrubs.length; i++) scrubs[i].render();
    dust.render(t);

    // hero title fades out over first 14% of hero scrub
    var hp = scrubs[0].progress();
    var hOp = clamp(1 - hp / 0.14, 0, 1);
    heroUI.style.opacity = hOp.toFixed(3);
    heroUI.style.transform = "translateY(" + (-hp * 130).toFixed(1) + "px)";
    heroUI.style.visibility = hOp <= 0 ? "hidden" : "visible";

    // chrome
    if (smoothY > vh * 0.7) header.classList.add("on");
    else header.classList.remove("on");
    pageBar.style.transform = "scaleX(" + clamp(smoothY / docMax, 0, 1).toFixed(4) + ")";

    sweepReveals();
    requestAnimationFrame(frame);
  }

  function revealObserver() {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // reveal when entering view, or if already scrolled past (anchor jumps)
        if (e.isIntersecting || e.boundingClientRect.top < 0) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });
    pendingReveals = [].slice.call(document.querySelectorAll(".reveal"));
    pendingReveals.forEach(function (el) { io.observe(el); });
  }

  /* fallback sweep — instant jumps can skip IO callbacks entirely */
  var pendingReveals = [];
  var sweepTick = 0;
  function sweepReveals() {
    if (++sweepTick % 12 !== 0 || !pendingReveals.length) return;
    for (var i = pendingReveals.length - 1; i >= 0; i--) {
      var r = pendingReveals[i].getBoundingClientRect();
      if (r.top < vh * 0.94) {
        pendingReveals[i].classList.add("is-in");
        pendingReveals.splice(i, 1);
      }
    }
  }

  function init() {
    heroUI = document.getElementById("hero-ui");
    heroTitleWrap = document.getElementById("hero-title");
    header = document.getElementById("site-head");
    pageBar = document.getElementById("page-progress");
    preloader = document.getElementById("preloader");
    preFill = document.getElementById("pre-fill");
    prePct = document.getElementById("pre-pct");

    scrubs = [
      new ScrubSection("hero", "c-hero", "hero"),
      new ScrubSection("macro", "c-macro", "macro"),
      new ScrubSection("build", "c-expl", "expl")
    ];
    dust = new Dust("c-dust", scrubs[0]);
    measureAll();

    var rT;
    window.addEventListener("resize", function () {
      clearTimeout(rT); rT = setTimeout(measureAll, 120);
    });
    window.addEventListener("load", measureAll);

    revealObserver();
    requestAnimationFrame(frame);

    // hero frames gate the reveal; the rest stream in behind it
    loadSeq(SEQS.hero, function (done, total) {
      var p = done / total;
      preFill.style.transform = "scaleX(" + p.toFixed(3) + ")";
      prePct.textContent = Math.round(p * 100);
    }, function () {
      preloader.classList.add("done");
      document.body.classList.add("in");
      scrubs[0].lastF = -1; // repaint with real frame
      loadSeq(SEQS.macro, null, function () {
        scrubs[1].lastF = -1;
        loadSeq(SEQS.expl, null, function () { scrubs[2].lastF = -1; });
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
