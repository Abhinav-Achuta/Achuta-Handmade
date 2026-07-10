/* ACHUTA HANDMADE — mobile nav menu */
(function () {
  "use strict";
  var btn = document.querySelector(".nav-more");
  var extra = document.getElementById("nav-extra");
  if (!btn || !extra) return;
  function setOpen(open) {
    extra.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", String(open));
  }
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    setOpen(!extra.classList.contains("open"));
  });
  document.addEventListener("click", function (e) {
    if (extra.classList.contains("open") && !extra.contains(e.target)) setOpen(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setOpen(false);
  });
  extra.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });
})();

/* ── wordmark lockup: justify HANDMADE exactly under ACHUTA ──
   H starts under the first A, E ends under the last A, equal gaps.
   Measured, not guessed: works whatever font actually loads. */
(function () {
  "use strict";
  var mark = document.querySelector(".head-mark");
  var sub = mark && mark.querySelector(".head-mark-sub");
  if (!mark || !sub) return;

  function topLineWidth() {
    var r = document.createRange();
    r.selectNodeContents(mark);
    r.setEndBefore(sub);
    var ls = parseFloat(getComputedStyle(mark).letterSpacing) || 0;
    return r.getBoundingClientRect().width - ls;   /* strip trailing tracking */
  }
  function justify() {
    if (!sub.dataset.justified) {
      var txt = sub.textContent;
      sub.textContent = "";
      txt.split("").forEach(function (ch) {
        var s = document.createElement("span");
        s.textContent = ch;
        sub.appendChild(s);
      });
      sub.style.display = "flex";
      sub.style.justifyContent = "space-between";
      sub.style.letterSpacing = "0";
      sub.style.textIndent = "0";
      sub.dataset.justified = "1";
    }
    sub.style.width = topLineWidth().toFixed(2) + "px";
  }
  justify();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(justify);
})();
