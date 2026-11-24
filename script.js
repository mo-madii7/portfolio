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

/* ---- 3. Language toggle (AR <-> EN) ---- */
/* ---- Testimonials: clamp long reviews with bilingual read more ---- */
(function () {
  var texts = Array.prototype.slice.call(document.querySelectorAll(".pf-testi-text"));
  texts.forEach(function (t) {
    t.classList.add("clamped");
    if (t.scrollHeight <= t.clientHeight + 4) { t.classList.remove("clamped"); return; }
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pf-testi-more";
    btn.setAttribute("data-en", "Read more");
    btn.textContent = "\u0627\u0642\u0631\u0623 \u0627\u0644\u0645\u0632\u064a\u062f";
    t.parentNode.insertBefore(btn, t.nextSibling);
    btn.addEventListener("click", function () {
      var expanded = !t.classList.contains("clamped");
      var en = document.documentElement.lang === "en";
      if (expanded) {
        t.classList.add("clamped");
        btn.setAttribute("data-en", "Read more");
        btn.setAttribute("data-ar", "\u0627\u0642\u0631\u0623 \u0627\u0644\u0645\u0632\u064a\u062f");
      } else {
        t.classList.remove("clamped");
        btn.setAttribute("data-en", "Show less");
        btn.setAttribute("data-ar", "\u0623\u0638\u0647\u0631 \u0623\u0642\u0644");
      }
      btn.textContent = en ? btn.getAttribute("data-en") : btn.getAttribute("data-ar");
    });
  });
})();

(function () {
  var KEY = "pf-lang";
  var btn = document.getElementById("pf-lang-toggle");
  var els = Array.prototype.slice.call(document.querySelectorAll("[data-en]"));
  els.forEach(function (el) { el.setAttribute("data-ar", el.innerHTML); });
  var phEls = Array.prototype.slice.call(document.querySelectorAll("[data-en-ph]"));
  phEls.forEach(function (el) { el.setAttribute("data-ar-ph", el.getAttribute("placeholder") || ""); });
  var TITLE = { ar: document.title, en: "Mohamad Madih | Graphic designer & video editor" };
  var metaDesc = document.querySelector('meta[name="description"]');
  var DESC = { ar: metaDesc ? metaDesc.getAttribute("content") : "", en: "Mohamad Madih's portfolio, graphic designer and video editor: visual identities, book covers, social media, print and video editing. Every project is a full case study." };
  var main = document.querySelector("main.file-card");

  function setLang(lang) {
    var en = lang === "en";
    els.forEach(function (el) { el.innerHTML = en ? el.getAttribute("data-en") : el.getAttribute("data-ar"); });
    phEls.forEach(function (el) { el.setAttribute("placeholder", en ? el.getAttribute("data-en-ph") : el.getAttribute("data-ar-ph")); });
    document.documentElement.lang = en ? "en" : "ar";
    document.documentElement.dir = en ? "ltr" : "rtl";
    if (main) { main.setAttribute("dir", en ? "ltr" : "rtl"); main.setAttribute("lang", en ? "en" : "ar"); }
    document.title = en ? TITLE.en : TITLE.ar;
    if (metaDesc) metaDesc.setAttribute("content", en ? DESC.en : DESC.ar);
    if (btn) btn.textContent = en ? "عربي" : "EN";
    try { localStorage.setItem(KEY, lang); } catch (e) {}
  }
  var start = "ar";
  try {
    var q = new URLSearchParams(location.search).get("lang");
    start = q === "en" ? "en" : (localStorage.getItem(KEY) || "ar");
  } catch (e) {}
  setLang(start);
  if (btn) btn.addEventListener("click", function () {
    setLang(document.documentElement.lang === "en" ? "ar" : "en");
  });
})();

/* ---- 4. Brief form: per-category questions + email delivery ---- */
(function () {
  var form = document.getElementById("pf-brief-form");
  if (!form) return;
  var sel = document.getElementById("bf-cat");
  var sets = Array.prototype.slice.call(form.querySelectorAll(".pf-bf-cat"));
  var status = document.getElementById("pf-bf-status");

  function syncCat() {
    var v = sel.value;
    sets.forEach(function (fs) {
      var on = fs.getAttribute("data-cat") === v;
      fs.classList.toggle("on", on);
      fs.querySelectorAll("input,select,textarea").forEach(function (f) { f.disabled = !on; });
    });
  }
  sets.forEach(function (fs) {
    fs.querySelectorAll("input,select,textarea").forEach(function (f) { f.disabled = true; });
  });
  sel.addEventListener("change", syncCat);
  try {
    var qc = new URLSearchParams(location.search).get("cat");
    if (qc && sets.some(function (fs) { return fs.getAttribute("data-cat") === qc; })) {
      sel.value = qc;
    }
  } catch (e) {}
  syncCat();

  var MSG = {
    ar: { sending: "بيبعت...", ok: "وصل! البريف اتبعت لمحمد على إيميله، وهيرد عليك قريب.", err: "حصلت مشكلة في الإرسال. جرّب تاني، أو ابعت تفاصيلك واتساب.", required: "املأ اسمك ووسيلة التواصل ونوع الخدمة الأول." },
    en: { sending: "Sending...", ok: "Done! Your brief reached Mohamad's email, and he will reply soon.", err: "Something went wrong sending. Try again, or send your details on WhatsApp.", required: "Please fill your name, contact and service type first." }
  };

  try {
    if (new URLSearchParams(location.search).get("sent") === "1") {
      var en0 = document.documentElement.lang === "en";
      status.textContent = en0 ? MSG.en.ok : MSG.ar.ok;
      status.className = "pf-bf-status ok";
      history.replaceState(null, "", location.pathname + "#pf-brief");
    }
  } catch (e) {}

  function classicPost(data) {
    var f = document.createElement("form");
    f.method = "POST";
    f.action = "https://formsubmit.co/mohamad.madih.20@gmail.com";
    f.style.display = "none";
    data.append("_next", location.origin + location.pathname + "?sent=1#pf-brief");
    data.forEach(function (v, k) {
      var i = document.createElement("input");
      i.type = "hidden"; i.name = k; i.value = v;
      f.appendChild(i);
    });
    document.body.appendChild(f);
    f.submit();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var en = document.documentElement.lang === "en";
    var m = en ? MSG.en : MSG.ar;
    if (!form.reportValidity || !form.checkValidity()) {
      status.textContent = m.required; status.className = "pf-bf-status err";
      if (form.reportValidity) form.reportValidity();
      return;
    }
    status.textContent = m.sending; status.className = "pf-bf-status";
    var data = new FormData(form);
    data.append("_template", "table");
    data.append("_captcha", "false");
    data.append("_subject", (en ? "New brief: " : "بريف جديد من الموقع: ") + sel.options[sel.selectedIndex].text + " — " + (data.get("الاسم") || ""));
    var ctrl = null, timer = null;
    try {
      if (window.AbortController) {
        ctrl = new AbortController();
        timer = setTimeout(function () { ctrl.abort(); }, 12000);
      }
    } catch (e) {}
    fetch("https://formsubmit.co/ajax/mohamad.madih.20@gmail.com", {
      method: "POST",
      headers: { "Accept": "application/json" },
      body: data,
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      if (timer) clearTimeout(timer);
      if (!r.ok) throw new Error("bad");
      return r.json();
    }).then(function () {
      status.textContent = m.ok; status.className = "pf-bf-status ok";
      form.reset(); syncCat();
    }).catch(function () {
      if (timer) clearTimeout(timer);
      classicPost(data);
    });
  });
})();

/* ---- 5. Case studies: collapse behind "شاهد العمل" ---- */
(function () {
  var secs = Array.prototype.slice.call(document.querySelectorAll(".pf-case, .pf-collapsible"));
  secs.forEach(function (sec) {
    var btn = sec.querySelector(".pf-casetoggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var open = sec.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  var h = location.hash ? location.hash.slice(1) : "";
  var target = h && document.getElementById(h);
  if (target && target.classList && (target.classList.contains("pf-case") || target.classList.contains("pf-collapsible"))) {
    target.classList.add("open");
    var b = target.querySelector(".pf-casetoggle");
    if (b) b.setAttribute("aria-expanded", "true");
  }
})();

/* ---- 6. Video groups: collapse behind arrows ---- */
(function () {
  document.querySelectorAll(".pf-vidgroup-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var g = btn.closest(".pf-vidgroup");
      var open = g.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
  var h = location.hash ? location.hash.slice(1) : "";
  var t = h && document.getElementById(h);
  if (t && t.classList && t.classList.contains("pf-vidgroup")) {
    t.classList.add("open");
    var b = t.querySelector(".pf-vidgroup-toggle");
    if (b) b.setAttribute("aria-expanded", "true");
  }
})();

/* ---- 7. Case study photos: horizontal carousel, swipe + arrows + calm autoplay ---- */
(function () {
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  document.querySelectorAll(".file-photos").forEach(function (scroller) {
    var slides = Array.prototype.slice.call(scroller.querySelectorAll(".file-photo-zoom"));
    if (slides.length < 2) return;
    var wrap = document.createElement("div");
    wrap.className = "pf-carousel";
    scroller.parentNode.insertBefore(wrap, scroller);
    wrap.appendChild(scroller);
    var count = document.createElement("span");
    count.className = "pf-car-count";
    wrap.appendChild(count);

    function current() {
      var r = scroller.getBoundingClientRect();
      var mid = (r.left + r.right) / 2;
      var best = 0, bd = Infinity;
      slides.forEach(function (s, i) {
        var sr = s.getBoundingClientRect();
        var d = Math.abs((sr.left + sr.right) / 2 - mid);
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    }
    function go(i) {
      var n = slides.length;
      slides[((i % n) + n) % n].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }

    var raf = null;
    function sync() {
      var c = current();
      count.textContent = (c + 1) + " / " + slides.length;
      slides.forEach(function (s, i) { s.classList.toggle("pf-car-active", i === c); });
    }
    scroller.addEventListener("scroll", function () {
      if (raf) return;
      raf = requestAnimationFrame(function () { raf = null; sync(); });
    }, { passive: true });
    sync();

    /* pause autoplay while the visitor interacts, resume after a calm delay */
    var paused = false, hovered = false, idleTimer = null, visible = false;
    function interact() {
      paused = true;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { paused = false; }, 7000);
    }
    ["pointerdown", "wheel", "touchstart"].forEach(function (ev) {
      scroller.addEventListener(ev, interact, { passive: true });
    });
    wrap.addEventListener("mouseenter", function () { hovered = true; });
    wrap.addEventListener("mouseleave", function () { hovered = false; });
    if ("IntersectionObserver" in window) {
      var io2 = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.4 });
      io2.observe(wrap);
    }

    if (!reduceMotion) {
      setInterval(function () {
        if (paused || hovered || !visible || document.hidden) return;
        if (document.body.classList.contains("lb-lock")) return;
        go(current() + 1);
      }, 4000);
    }

    /* keep a swipe from opening the lightbox */
    var sx = null, moved = false;
    scroller.addEventListener("pointerdown", function (e) { sx = e.clientX; moved = false; }, { passive: true });
    scroller.addEventListener("pointermove", function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 8) moved = true; }, { passive: true });
    scroller.addEventListener("pointerup", function () { sx = null; }, { passive: true });
    scroller.addEventListener("click", function (e) {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    }, true);
  });
})();

/* ---- 8. Horizontal auto-moving strips: videos, reels, testimonials ---- */
(function () {
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  document.querySelectorAll(".pf-vid-grid, .pf-testi-grid").forEach(function (strip) {
    var cards = Array.prototype.slice.call(strip.children);
    if (cards.length < 2) return;
    strip.classList.add("pf-strip");

    function current() {
      var r = strip.getBoundingClientRect();
      var rtl = getComputedStyle(strip).direction === "rtl";
      var edge = rtl ? r.right : r.left;
      var best = 0, bd = Infinity;
      cards.forEach(function (c, i) {
        var cr = c.getBoundingClientRect();
        var d = Math.abs((rtl ? cr.right : cr.left) - edge);
        if (d < bd) { bd = d; best = i; }
      });
      return best;
    }
    function go(i) {
      var n = cards.length;
      cards[((i % n) + n) % n].scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
    }

    var paused = false, hovered = false, playing = false, idleTimer = null, visible = false;
    function interact() {
      paused = true;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { paused = false; }, 7000);
    }
    ["pointerdown", "wheel", "touchstart"].forEach(function (ev) {
      strip.addEventListener(ev, interact, { passive: true });
    });
    strip.addEventListener("mouseenter", function () { hovered = true; });
    strip.addEventListener("mouseleave", function () { hovered = false; });
    strip.querySelectorAll("video").forEach(function (v) {
      v.addEventListener("play", function () { playing = true; });
      v.addEventListener("pause", function () { playing = false; });
      v.addEventListener("ended", function () { playing = false; });
    });
    if ("IntersectionObserver" in window) {
      var io3 = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.3 });
      io3.observe(strip);
    } else { visible = true; }

    if (!reduceMotion) {
      setInterval(function () {
        if (paused || hovered || playing || !visible || document.hidden) return;
        if (document.body.classList.contains("lb-lock")) return;
        go(current() + 1);
      }, 3500);
    }
  });
})();
