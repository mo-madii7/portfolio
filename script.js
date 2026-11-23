(function () {
  "use strict";

  /* ---- 1. Reveal on scroll ---- */
  var items = document.querySelectorAll(".pf-rv");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("pf-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("pf-in"); });
  }

  /* ---- 2. Lightbox for project images ---- */
  var lb = document.createElement("div");
  lb.className = "lb";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", "عرض الصورة");
  lb.innerHTML =
    '<button class="lb-close" aria-label="إغلاق">\u2715</button>' +
    '<button class="lb-prev" aria-label="السابق">\u203A</button>' +
    '<img alt="">' +
    '<button class="lb-next" aria-label="التالي">\u2039</button>' +
    '<span class="lb-count"></span>';
  document.body.appendChild(lb);

  var big = lb.querySelector("img"), count = lb.querySelector(".lb-count");
  var group = [], index = 0, lastFocus = null;

  function show(i) {
    index = (i + group.length) % group.length;
    var img = group[index].querySelector("img");
    big.src = img.currentSrc || img.src;
    big.alt = img.alt || "";
    count.textContent = (index + 1) + " / " + group.length;
  }
  function open(btn) {
    var wrap = btn.closest(".file-photos");
    group = Array.prototype.slice.call(wrap.querySelectorAll(".file-photo-zoom"));
    lastFocus = btn;
    lb.classList.toggle("lb-single", group.length < 2);
    show(group.indexOf(btn));
    lb.classList.add("open");
    document.body.classList.add("lb-lock");
    lb.querySelector(".lb-close").focus();
  }
  function close() {
    lb.classList.remove("open");
    document.body.classList.remove("lb-lock");
    big.removeAttribute("src");
    if (lastFocus) lastFocus.focus();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest(".file-photo-zoom");
    if (b) { open(b); return; }
    if (!lb.classList.contains("open")) return;
    if (e.target.closest(".lb-close") || e.target === lb) close();
    else if (e.target.closest(".lb-prev")) show(index + 1);   /* RTL: right arrow = previous */
    else if (e.target.closest(".lb-next")) show(index - 1);
  });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(index - 1);
    else if (e.key === "ArrowRight") show(index + 1);
  });

  /* touch swipe */
  var x0 = null;
  lb.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (x0 === null || group.length < 2) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(index + (dx > 0 ? 1 : -1));
    x0 = null;
  });
})();
