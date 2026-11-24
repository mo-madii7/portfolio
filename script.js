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
    if (btn.__orig) btn = btn.__orig;
    var wrap = btn.closest(".file-photos");
    group = Array.prototype.slice.call(wrap.querySelectorAll(".file-photo-zoom:not([data-clone])"));
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

window.pfOpenTesti = function (textEl) {
  var m = document.getElementById("pf-tm");
  if (!m) {
    m = document.createElement("div");
    m.id = "pf-tm";
    m.className = "pf-tm";
    m.innerHTML = '<div class="pf-tm-card"><button type="button" class="pf-tm-close" aria-label="Close">\u2715</button><div class="pf-tm-who"></div><p class="pf-tm-text"></p></div>';
    document.body.appendChild(m);
    m.addEventListener("click", function (e) {
      if (e.target === m || e.target.closest(".pf-tm-close")) {
        m.classList.remove("open");
        document.body.classList.remove("lb-lock");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && m.classList.contains("open")) {
        m.classList.remove("open");
        document.body.classList.remove("lb-lock");
      }
    });
  }
  var card = textEl.closest(".pf-testi-card");
  m.querySelector(".pf-tm-who").textContent = card && card.querySelector(".pf-testi-who") ? card.querySelector(".pf-testi-who").textContent : "";
  m.querySelector(".pf-tm-text").textContent = textEl.textContent;
  m.classList.add("open");
  document.body.classList.add("lb-lock");
};
window.pfSetupTestiClamp = function () {
  var texts = Array.prototype.slice.call(document.querySelectorAll(".pf-testi-text"));
  texts.forEach(function (t) {
    var old = t.parentNode.querySelector(".pf-testi-more");
    if (old) old.remove();
    t.classList.remove("clamped");
    t.classList.add("clamped");
    if (t.scrollHeight <= t.clientHeight + 4) { t.classList.remove("clamped"); return; }
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pf-testi-more";
    btn.setAttribute("data-en", "Read more");
    btn.setAttribute("data-ar", "\u0627\u0642\u0631\u0623 \u0627\u0644\u0645\u0632\u064a\u062f");
    btn.textContent = document.documentElement.lang === "en" ? "Read more" : btn.getAttribute("data-ar");
    t.parentNode.insertBefore(btn, t.nextSibling);
    btn.addEventListener("click", function () { window.pfOpenTesti(t); });
  });
};
window.pfSetupTestiClamp();

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
    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (!el.getAttribute("data-ar")) el.setAttribute("data-ar", el.innerHTML);
      el.innerHTML = en ? el.getAttribute("data-en") : el.getAttribute("data-ar");
    });
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
      var banner = document.createElement("div");
      banner.className = "pf-bf-status ok pf-bf-sentbanner";
      banner.setAttribute("role", "status");
      banner.textContent = en0 ? MSG.en.ok : MSG.ar.ok;
      new MutationObserver(function () { banner.textContent = document.documentElement.lang === "en" ? MSG.en.ok : MSG.ar.ok; }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
      var tw = form.closest("section, .pf-brief, .pf-collapsible");
      var tg = tw && tw.querySelector(".pf-casetoggle-wrap");
      if (tg && tg.parentNode) tg.parentNode.insertBefore(banner, tg); else form.parentNode.insertBefore(banner, form);
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
      if (open && sec.id === "pf-testi" && window.pfSetupTestiClamp) window.pfSetupTestiClamp();
    });
  });
  /* Sections always start closed; only a click opens them (the one exception: showing the sent-brief confirmation) */
  var h = location.hash ? location.hash.slice(1) : "";
  var sent = false;
  try { sent = new URLSearchParams(location.search).get("sent") === "1"; } catch (e) {}
  var target = null; /* never auto-open; the sent confirmation is shown outside the closed panel (section 4) */
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
  var h = "";
  var t = null;
  if (t && t.classList && t.classList.contains("pf-vidgroup")) {
    t.classList.add("open");
    var b = t.querySelector(".pf-vidgroup-toggle");
    if (b) b.setAttribute("aria-expanded", "true");
  }
})();

/* ---- 7. Continuous flowing tickers: case photos, videos, reels, testimonials ---- */
(function () {
  var reduceMotion = false;
  try { reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var SPEED = 42; /* px per second */

  function ticker(scroller, hoverTarget) {
    var cards = Array.prototype.slice.call(scroller.children);
    if (cards.length < 2) return;
    scroller.classList.add("pf-strip");
    /* seamless loop: duplicated sets after the originals (more are added until the strip can scroll one full loop) */
    function addSet() {
      cards.forEach(function (c) {
        var k = c.cloneNode(true);
        k.setAttribute("data-clone", "1");
        k.setAttribute("aria-hidden", "true");
        k.__orig = c;
        k.querySelectorAll("button,a").forEach(function (x) { x.setAttribute("tabindex", "-1"); });
        scroller.appendChild(k);
      });
      if (window.pfSetupTestiClamp) window.pfSetupTestiClamp();
    }
    addSet();
    var first = cards[0], clone0 = scroller.children[cards.length];
    function loopLen() { return clone0.offsetLeft - first.offsetLeft; }

    var pos = 0, last = 0, paused = false, hovered = false, visible = false, idleTimer = null;
    function interact() {
      paused = true;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(function () { paused = false; }, 4000);
    }
    ["pointerdown", "wheel", "touchstart"].forEach(function (ev) {
      scroller.addEventListener(ev, interact, { passive: true });
    });
    hoverTarget.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hovered = true; });
    hoverTarget.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hovered = false; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0.25 }).observe(hoverTarget);
    } else { visible = true; }
    function videoPlaying() {
      var vs = scroller.querySelectorAll("video");
      for (var i = 0; i < vs.length; i++) if (!vs[i].paused && !vs[i].ended) return true;
      return false;
    }
    /* keep a swipe from opening the lightbox */
    var sx = null, moved = false;
    scroller.addEventListener("pointerdown", function (e) { sx = e.clientX; moved = false; }, { passive: true });
    scroller.addEventListener("pointermove", function (e) { if (sx !== null && Math.abs(e.clientX - sx) > 8) moved = true; }, { passive: true });
    scroller.addEventListener("pointerup", function () { sx = null; }, { passive: true });
    scroller.addEventListener("click", function (e) {
      if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; }
    }, true);

    function frame(t) {
      var dt = last ? Math.min(0.1, (t - last) / 1000) : 0;
      last = t;
      var L = loopLen();
      if (L > 0 && scroller.clientWidth > 0 && scroller.scrollWidth - scroller.clientWidth < L + 2 && scroller.children.length < cards.length * 8) addSet();
      var running = !reduceMotion && L > 0 && visible && !paused && !hovered && !document.hidden &&
        !document.body.classList.contains("lb-lock") && !videoPlaying();
      if (running) {
        pos += SPEED * dt;
        if (pos >= L) pos -= L;
        scroller.scrollLeft = pos;
      } else {
        pos = scroller.scrollLeft;
      }
      if (L > 0) {
        /* swiping past either end wraps into the duplicate set */
        if (scroller.scrollLeft >= L) { scroller.scrollLeft -= L; pos = scroller.scrollLeft; }
        else if (scroller.scrollLeft <= 0 && !running && pos <= 0) { scroller.scrollLeft = L; pos = L; }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  document.querySelectorAll(".file-photos").forEach(function (scroller) {
    if (scroller.querySelectorAll(".file-photo-zoom").length < 2) return;
    var wrap = document.createElement("div");
    wrap.className = "pf-carousel";
    scroller.parentNode.insertBefore(wrap, scroller);
    wrap.appendChild(scroller);
    ticker(scroller, wrap);
  });
  document.querySelectorAll(".pf-vid-grid, .pf-testi-grid, .pf-sgrid").forEach(function (strip) { ticker(strip, strip); });
  if (window.pfSetupTestiClamp) window.pfSetupTestiClamp();
})();

/* ---- 9. Brief budget slider (EGP, 0 to 500,000). Unset until the visitor touches it ---- */
(function () {
  var r = document.getElementById("bf-budget");
  if (!r) return;
  var num = document.getElementById("bf-budget-num");
  var val = document.getElementById("bf-budget-val");
  var out = document.getElementById("bf-budget-out");
  var open = document.getElementById("bf-budget-open");
  var MAX = 500000, cur = 0, touched = false;
  function fmt(n) { return Number(n).toLocaleString("en-US"); }
  function render() {
    var en = document.documentElement.lang === "en";
    var amount = fmt(cur);
    if (open.checked) {
      val.textContent = en ? "Not decided yet" : "لسه محددتش";
      out.value = "Not decided / مفتوح للاقتراحات"; out.disabled = false;
    } else if (touched) {
      val.textContent = amount + " " + (en ? "EGP" : "ج.م");
      out.value = amount + " EGP"; out.disabled = false;
    } else {
      val.textContent = en ? "Pick your budget" : "اختار ميزانيتك";
      out.value = ""; out.disabled = true;
    }
    r.disabled = num.disabled = open.checked;
    r.style.opacity = num.style.opacity = open.checked ? ".4" : "1";
    r.style.setProperty("--pct", (cur / MAX * 100) + "%");
  }
  r.value = 0; num.value = ""; 
  r.addEventListener("input", function () { touched = true; cur = Number(r.value) || 0; num.value = cur; render(); });
  num.addEventListener("input", function () {
    if (num.value === "") { touched = false; cur = 0; r.value = 0; render(); return; }
    touched = true;
    cur = Math.max(0, Math.min(MAX, Math.round(Number(num.value) || 0)));
    r.value = cur; render();
  });
  num.addEventListener("blur", function () { if (touched) num.value = cur; });
  open.addEventListener("change", render);
  new MutationObserver(render).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  render();
})();
