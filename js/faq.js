/* ACHUTA HANDMADE — FAQ accordions */
(function () {
  "use strict";
  var items = [].slice.call(document.querySelectorAll(".q"));
  items.forEach(function (q) {
    var head = q.querySelector(".q-head");
    var inner = q.querySelector(".q-body-inner");
    inner.inert = true;                              /* closed answers leave the tab order */
    head.addEventListener("click", function () {
      var open = q.classList.toggle("is-open");
      head.setAttribute("aria-expanded", String(open));
      inner.inert = !open;
    });
  });
  /* deep links: faq.html#q-how opens that question (also on hash change) */
  function openFromHash() {
    if (!location.hash) return;
    var target = document.querySelector(location.hash);
    if (target && target.classList.contains("q") && !target.classList.contains("is-open")) {
      target.querySelector(".q-head").click();
      target.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();
