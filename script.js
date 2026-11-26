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
      status.textContent = m.ok; status.className = "pf-bf-status ok"; if (window.pfTrack) window.pfTrack("brief-sent");
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
    /* partners strip runs as a non-stop one-direction train: no hover pause, no manual drag/swipe */
    var train = scroller.classList.contains("pf-partners-grid") || scroller.classList.contains("pf-feat-strip");
    var spd = train ? 65 : SPEED; /* partners strip runs a bit faster per client request */
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
        /* clones never pass through the reveal observer: force them revealed so they never stay blurred/hidden */
        if (k.classList) k.classList.add("pf-in");
        k.querySelectorAll(".pf-rv").forEach(function (x) { x.classList.add("pf-in"); });
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
    if (!train) {
      ["pointerdown", "wheel", "touchstart"].forEach(function (ev) {
        scroller.addEventListener(ev, interact, { passive: true });
      });
      hoverTarget.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hovered = true; });
      hoverTarget.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hovered = false; });
    }
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
      var running = !reduceMotion && L > 0 && visible && (train || (!paused && !hovered)) && !document.hidden &&
        !document.body.classList.contains("lb-lock") && !videoPlaying();
      if (running) {
        pos += spd * dt;
        if (pos >= L) pos -= L;
        scroller.scrollLeft = pos;
      } else if (train) {
        /* train strip ignores external scroll shifts and snaps back to its own position */
        if (L > 0) { pos = pos % L; scroller.scrollLeft = pos; }
      } else {
        pos = scroller.scrollLeft;
      }
      if (L > 0) {
        /* swiping past either end wraps into the duplicate set */
        if (scroller.scrollLeft >= L) { scroller.scrollLeft -= L; pos = scroller.scrollLeft; }
        else if (scroller.scrollLeft <= 0 && !running && pos <= 0) { scroller.scrollLeft = L - 1; pos = L - 1; }
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
  /* featured projects: extra picks, then run the same flowing strip as the other sections */
  (function () {
    var fs = document.querySelector(".pf-feat-strip");
    if (!fs) return;
    var extra = [
      ["#pf-case-03", "images/3WY6PZNG.jpg", "عيادة د. محمد فاروق: توعية طبية", "Dr. Mohamed Farouk Clinic: health awareness", ""],
      ["#pf-case-05", "images/X5UN6OZS.jpg", "دار الرقيم: ما بين الآن وكان", "Dar Al-Raqeem: Between Now and Then", ""],
      ["#pf-case-07", "images/KRPZPZEP.jpg", "الهلال الأحمر: ورشة الخيام", "Red Crescent: Tent Workshop", ""],
      ["#pf-case-07", "images/JTHA57T2.jpg", "الصندوق: اليوم العالمي للإقلاع عن التدخين", "The Fund: World No Tobacco Day", ""],
      ["#pf-case-08", "images/OPT2CES4.jpg", "غلاف كتاب: بوابة نيكسارا", "Book cover: Nexara Gate", " pf-feat-wide"],
      ["#pf-case-08", "images/IPDBP5VW.jpg", "غلاف كتاب: وميض في نفق العمر", "Book cover: A Flash in Life's Tunnel", " pf-feat-wide"]
    ];
    extra.forEach(function (e) {
      var a = document.createElement("a");
      a.className = "pf-feat-card" + e[4];
      a.href = e[0];
      var im = document.createElement("img");
      im.src = e[1]; im.alt = e[2]; im.loading = "lazy";
      var sp = document.createElement("span");
      sp.setAttribute("data-en", e[3]); sp.textContent = e[2];
      a.appendChild(im); a.appendChild(sp);
      fs.appendChild(a);
    });
    ticker(fs, fs);
  })();
  document.querySelectorAll(".pf-vid-grid, .pf-testi-grid, .pf-sgrid, .pf-partners-grid").forEach(function (strip) { ticker(strip, strip); });
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

/* ---- 8b. Page views (home / works / services / videos / about), hero menus, nav state ---- */
(function () {
  var root = document.documentElement;
  function viewFor(h) {
    if (h === "works" || /^pf-case-/.test(h)) return "works";
    if (h === "services" || h === "pf-brief" || h === "pf-receive") return "services";
    if (h === "videos" || h === "pf-vid") return "videos";
    if (h === "about" || h === "pf-novels" || h === "pf-articles") return "about";
    return "home";
  }
  function markNav() {
    var v = root.getAttribute("data-view");
    document.querySelectorAll(".pf-nav-links a").forEach(function (a) {
      a.classList.toggle("on", a.getAttribute("data-view") === v);
    });
  }
  function route(initial) {
    var h = location.hash ? location.hash.slice(1) : "";
    var v = viewFor(h);
    root.setAttribute("data-view", v);
    markNav();
    var pageHash = h === "" || h === "home" || h === "works" || h === "services" || h === "videos" || h === "about";
    if (pageHash) { if (!initial) window.scrollTo(0, 0); return; }
    var el = document.getElementById(h);
    if (el) setTimeout(function () { el.scrollIntoView({ block: "start" }); }, 30);
  }
  window.addEventListener("hashchange", function () { route(false); });
  route(true);

  function toggleMenu(btn, menu) {
    if (!btn || !menu) return;
    btn.addEventListener("click", function () {
      var open = menu.hidden;
      menu.hidden = !open;
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  toggleMenu(document.getElementById("pf-work-btn"), document.getElementById("pf-work-menu"));
  toggleMenu(document.getElementById("pf-cs-btn"), document.getElementById("pf-cs-menu"));

  var acv = document.getElementById("pf-about-cv"), cv = document.getElementById("pf-cv-btn");
  if (acv && cv) acv.addEventListener("click", function (e) { e.preventDefault(); cv.click(); });
})();

/* ---- 10. Three-line menu, testimonials always open ---- */
(function () {
  var ts = document.getElementById("pf-testi");
  if (ts) { ts.classList.add("open"); var tb = ts.querySelector(".pf-casetoggle"); if (tb) tb.setAttribute("aria-expanded", "true"); if (window.pfSetupTestiClamp) window.pfSetupTestiClamp(); }
  var btn = document.getElementById("pf-menu-btn"), panel = document.getElementById("pf-menu-panel");
  if (!btn || !panel) return;
  function close() { panel.hidden = true; btn.setAttribute("aria-expanded", "false"); }
  btn.addEventListener("click", function (e) { e.stopPropagation(); var o = panel.hidden; if (o) { var r = btn.getBoundingClientRect(); var w = Math.min(300, window.innerWidth); var l = Math.max(0, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w)); panel.style.left = l + "px"; panel.style.right = "auto"; } panel.hidden = !o; btn.setAttribute("aria-expanded", o ? "true" : "false"); });
  document.addEventListener("click", function (e) { if (!panel.hidden && !panel.contains(e.target)) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  panel.addEventListener("click", function (e) {
    var el = e.target.closest("a,button"); if (!el) return;
    var act = el.getAttribute("data-act");
    close();
    if (act === "cv") { var cv = document.getElementById("pf-cv-btn"); if (cv) cv.click(); }
    else if (act === "cs") {
      if (location.hash && location.hash !== "#home") location.hash = "#home";
      setTimeout(function () {
        var b = document.getElementById("pf-cs-btn"), m = document.getElementById("pf-cs-menu");
        if (b) { if (m && m.hidden) b.click(); b.scrollIntoView({ block: "center" }); }
      }, 120);
    }
  });
})();

/* ---- 11. Client services block at the end of the Services page ---- */
(function () {
  var brief = document.getElementById("pf-brief"), srcMenu = document.getElementById("pf-cs-menu"), srcPanel = document.getElementById("pf-pay-panel");
  if (!brief || !srcMenu || !srcPanel || document.getElementById("pf-svc-cs")) return;
  var sec = document.createElement("section");
  sec.className = "pf-svc-cs"; sec.id = "pf-svc-cs";
  var btn = document.createElement("button");
  btn.type = "button"; btn.className = "pf-cs-btn"; btn.setAttribute("aria-expanded", "false");
  btn.setAttribute("data-en", 'Client services <span class="pf-caret">▾</span>');
  btn.innerHTML = 'خدمات العملاء <span class="pf-caret">▾</span>';
  var menu = srcMenu.cloneNode(true); menu.removeAttribute("id"); menu.hidden = true;
  var pay = menu.querySelector("#pf-pay-btn"); if (pay) pay.removeAttribute("id");
  var panel = srcPanel.cloneNode(true); panel.removeAttribute("id"); panel.hidden = true;
  var walBtn = panel.querySelector("#pf-wal-btn"), wal = panel.querySelector("#pf-wal");
  if (walBtn) walBtn.removeAttribute("id"); if (wal) { wal.removeAttribute("id"); wal.hidden = true; }
  function tg(b, p) { b.addEventListener("click", function () { var o = p.hidden; p.hidden = !o; b.setAttribute("aria-expanded", o ? "true" : "false"); }); }
  tg(btn, menu); if (pay) tg(pay, panel); if (walBtn && wal) tg(walBtn, wal);
  panel.querySelectorAll(".pf-pay-copy").forEach(function (c) {
    c.addEventListener("click", function () {
      var v = c.getAttribute("data-copy");
      var d = function () { c.textContent = document.documentElement.lang === "en" ? "Copied" : "تم النسخ"; setTimeout(function () { c.textContent = document.documentElement.lang === "en" ? "Copy" : "نسخ"; }, 1500); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(v).then(d, d);
      else { var a = document.createElement("textarea"); a.value = v; document.body.appendChild(a); a.select(); try { document.execCommand("copy"); } catch (e) {} document.body.removeChild(a); d(); }
    });
  });
  var wrap = document.createElement("div"); wrap.className = "pf-pay";
  wrap.appendChild(panel);
  sec.appendChild(btn); sec.appendChild(menu); sec.appendChild(wrap);
  brief.parentNode.insertBefore(sec, brief.nextSibling);
})();

/* novel covers: tap to reveal release news */
(function () {
  document.querySelectorAll(".pf-novel").forEach(function (b) {
    b.addEventListener("click", function () {
      var on = b.classList.toggle("on");
      b.setAttribute("aria-expanded", on ? "true" : "false");
    });
  });
})();

/* public site-visit counter (own service, shown within seconds): one count per browser per 24h on page load; opens/browsers, not unique people; hidden if unknown */
(function () {
  var API = "https://portfolio-likes.mohamad-madih-20.workers.dev";
  var DAY = 86400000;
  window.pfSeen = function (k) { try { var t = parseInt(localStorage.getItem("pf_v_" + k), 10); return !isNaN(t) && Date.now() - t < DAY && Date.now() >= t; } catch (e) { return !!(window.pfMem && window.pfMem[k]); } };
  window.pfMark = function (k) { try { localStorage.setItem("pf_v_" + k, String(Date.now())); } catch (e) { (window.pfMem = window.pfMem || {})[k] = 1; } };
  var box = document.getElementById("pf-views"), num = document.getElementById("pf-views-num");
  if (!box || !num || !window.fetch) return;
  var lab = box.querySelector("span[data-en]");
  if (lab) { lab.setAttribute("data-en", "Site visits"); lab.textContent = "\u0632\u064a\u0627\u0631\u0627\u062a \u0627\u0644\u0645\u0648\u0642\u0639"; }
  function ok(r) { if (!r.ok) throw new Error("x"); return r.json(); }
  function show() {
    return fetch(API + "/counts?items=site-visits").then(ok).then(function (d) {
      var n = d && d.views ? d.views["site-visits"] : null;
      if (typeof n === "number") { num.textContent = String(n); box.hidden = false; }
    });
  }
  var step = window.pfSeen("site-visits") ? Promise.resolve() :
    fetch(API + "/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item: "site-visits" }) }).then(ok).then(function () { window.pfMark("site-visits"); });
  step.catch(function () {}).then(show).catch(function () {});
})();

/* GoatCounter click events: anonymous counts of opens (CV, WhatsApp, links, cases, novels); the brief counts only when it was really sent */
(function () {
  function slug(x) { return String(x || "").replace(/\s+/g, " ").trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, "-").replace(/^-|-$/g, "").slice(0, 40); }
  window.pfTrack = function (name) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "click-" + name, title: name, event: true }); } catch (e) {}
    try { if (window.pfCountView) window.pfCountView(name); } catch (e) {}
  };
  document.addEventListener("click", function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var a = t.closest("a[href]");
    if (a) {
      var h = a.getAttribute("href") || "";
      if (/wa\.me|whatsapp\.com/i.test(h)) return window.pfTrack("whatsapp");
      if (/behance\.net/i.test(h)) return window.pfTrack("behance");
      if (/linkedin\.com/i.test(h)) return window.pfTrack("linkedin");
      if (/facebook\.com/i.test(h)) return window.pfTrack("facebook");
      if (/instagram\.com/i.test(h)) return window.pfTrack("instagram");
      if (/^mailto:/i.test(h)) return window.pfTrack("email");
      if (/ipn\.eg/i.test(h)) return window.pfTrack("instapay");
    }
    if (t.closest("#pf-cv-btn")) return window.pfTrack("cv-open");
    var nv = t.closest(".pf-novel");
    if (nv) {
      if (!nv.classList.contains("on")) { var all = document.querySelectorAll(".pf-novel"); window.pfTrack("novel-open-" + (Array.prototype.indexOf.call(all, nv) + 1)); }
      return;
    }
    var tg = t.closest(".pf-casetoggle");
    if (tg) {
      var sec = tg.closest(".pf-case, .pf-collapsible");
      if (sec && !sec.classList.contains("open")) {
        var ti = sec.querySelector(".pf-casetitle");
        window.pfTrack("work-open-" + (sec.id || slug(ti && (ti.getAttribute("data-en") || ti.textContent))));
      }
    }
  }, true);
  if (/[?&]sent=1/.test(location.search)) { var tries = 0, iv = setInterval(function () { if (window.goatcounter && window.goatcounter.count) { clearInterval(iv); window.pfTrack("brief-sent"); } else if (++tries > 30) clearInterval(iv); }, 200); }
})();

/* Per-item strip under each work and novel: opens (own service, live) and, when the likes service is configured, undoable likes. Counts are opens/browsers, not unique people. */
(function () {
  var GC = "https://mo-madih.goatcounter.com/counter/";
  var LIKES_API = "https://portfolio-likes.mohamad-madih-20.workers.dev"; /* set to the likes service URL when it is live; empty = no heart is shown */
  var EYE = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
  var HEART = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/></svg>';
  var st = document.createElement("style");
  st.textContent = ".pf-meta{display:flex;align-items:center;gap:16px;margin-top:14px;padding:8px 0;border-top:1px solid currentColor;border-top-color:rgba(127,127,127,.28);font-size:13px;line-height:1;opacity:.85}" +
    ".pf-meta-i{display:inline-flex;align-items:center;gap:6px;color:inherit}.pf-meta-i[hidden]{display:none}" +
    ".pf-meta button.pf-meta-i{background:none;border:0;padding:4px 2px;font:inherit;color:inherit;cursor:pointer;border-radius:8px}" +
    ".pf-meta button.pf-meta-i:focus-visible{outline:2px solid currentColor;outline-offset:2px}" +
    ".pf-meta button.pf-meta-i[aria-pressed=true] svg{fill:#e0556b;stroke:#e0556b}" +
    ".pf-meta button.pf-meta-i[disabled]{opacity:.5;cursor:default}" +
    ".pf-vid-card .pf-meta{margin-top:10px;padding:8px 4px 0}" +
    ".pf-novel-cell{display:flex;flex-direction:column}.pf-novel-cell .pf-meta{margin-top:8px;padding-inline:4px;color:#efe6d2}";
  document.head.appendChild(st);

  var items = []; /* {key, event, host, eye, num, btn, lnum} */
  function make(key, eventName, host, label) {
    label = label || "عدد مرات الفتح / Opens";
    var m = document.createElement("div"); m.className = "pf-meta";
    var eye = document.createElement("span"); eye.className = "pf-meta-i"; eye.hidden = true;
    eye.setAttribute("aria-label", label); eye.title = label;
    eye.innerHTML = EYE + '<span class="pf-meta-n"></span>'; eye.setAttribute("data-k", key);
    m.appendChild(eye);
    var it = { key: key, event: eventName, eye: eye, num: eye.lastChild, btn: null, lnum: null, liked: false };
    if (LIKES_API) {
      var b = document.createElement("button"); b.type = "button"; b.className = "pf-meta-i"; b.hidden = true; b.setAttribute("aria-pressed", "false");
      b.setAttribute("aria-label", "إعجاب / Like"); b.title = "إعجاب / Like";
      b.innerHTML = HEART + '<span class="pf-meta-n"></span>'; b.setAttribute("data-k", key);
      m.appendChild(b); it.btn = b; it.lnum = b.lastChild;
    }
    host.appendChild(m); items.push(it);
  }
  var cases = document.querySelectorAll(".pf-case, .pf-collapsible");
  Array.prototype.forEach.call(cases, function (sec) {
    if (!sec.id) return;
    var host = sec.querySelector(".pf-casehead-text"); if (!host) return;
    make("work-" + sec.id, "work-open-" + sec.id, host);
  });
  Array.prototype.forEach.call(document.querySelectorAll(".pf-novel"), function (nv, i) {
    var cell = document.createElement("div"); cell.className = "pf-novel-cell";
    nv.parentNode.insertBefore(cell, nv); cell.appendChild(nv);
    make("novel-" + (i + 1), "novel-open-" + (i + 1), cell);
  });
  /* videos and reels: strip under each card (clones of the loop share the original's counts); the eye counts plays (first play per page load) */
  var playLabel = "عدد مرات التشغيل / Plays";
  function vkey(card, kind) {
    var v = card.querySelector("video"); var s = v ? (v.getAttribute("src") || (v.querySelector("source") || {}).src || v.currentSrc || "") : "";
    var n = s.split("/").pop().split("?")[0].replace(/\.[a-z0-9]+$/i, "").toLowerCase().replace(/^[0-9]+[-_]*/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    if (kind === "reel") n = n.replace(/^reel-/, "").replace(/-reel$/, "");
    return n ? kind + "-" + n : "";
  }
  [["pf-vg-videos-body", "video"], ["pf-vg-reels-body", "reel"]].forEach(function (g) {
    var body = document.getElementById(g[0]); if (!body) return;
    Array.prototype.forEach.call(body.querySelectorAll(".pf-vid-card"), function (card) {
      var k = vkey(card, g[1]); if (!k) return;
      make(k, "play-" + k, card, playLabel);
      if (card.getAttribute("data-clone")) { var bt = card.querySelector(".pf-meta button"); if (bt) bt.tabIndex = -1; }
    });
  });
  var played = {};
  document.addEventListener("play", function (e) {
    var card = e.target && e.target.closest && e.target.closest(".pf-vid-card"); if (!card) return;
    var k = vkey(card, card.closest("#pf-vg-reels-body") ? "reel" : "video"); if (!k || played[k]) return;
    played[k] = 1; if (window.pfTrack) window.pfTrack("play-" + k);
  }, true);
  if (!items.length || !window.fetch) return;

  var S = {}; /* key -> { opens: number|null, likes: number|null, liked: bool, busy: bool } ; DOM copies made later by the loop tickers are repainted from here */
  items.forEach(function (i) { S[i.key] = S[i.key] || { opens: null, likes: null, liked: false, busy: false }; });
  function paint(key) {
    var st = S[key]; if (!st) return;
    Array.prototype.forEach.call(document.querySelectorAll('.pf-meta [data-k]'), function (el) {
      if (el.getAttribute("data-k") !== key) return;
      var n = el.querySelector(".pf-meta-n");
      if (el.tagName === "BUTTON") {
        if (st.likes === null) return;
        n.textContent = String(st.likes); el.hidden = false; el.setAttribute("aria-pressed", st.liked ? "true" : "false"); el.disabled = st.busy;
      } else if (st.opens !== null) { n.textContent = String(st.opens); el.hidden = false; }
    });
  }
  function paintAll() { Object.keys(S).forEach(paint); }
  /* the loop tickers add more clone sets later; repaint so every copy shows the live numbers and works */
  if (window.MutationObserver) {
    var tmr = null;
    Array.prototype.forEach.call(document.querySelectorAll(".pf-vid-grid"), function (g) {
      new MutationObserver(function () { clearTimeout(tmr); tmr = setTimeout(paintAll, 80); }).observe(g, { childList: true });
    });
  }

  /* opens/plays: counted by the likes service (live within seconds); one count per browser per item per 24h */
  window.pfCountView = function (name) {
    var key = null, m;
    if ((m = /^work-open-(.+)$/.exec(name))) key = "work-" + m[1]; else if ((m = /^novel-open-(\d+)$/.exec(name))) key = "novel-" + m[1]; else if ((m = /^play-(.+)$/.exec(name))) key = m[1];
    if (!key || !S[key] || !LIKES_API || (window.pfSeen && window.pfSeen(key))) return;
    fetch(LIKES_API + "/view", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ item: key }) })
      .then(function (r) { if (!r.ok) throw new Error("v"); return r.json(); })
      .then(function (d) { if (window.pfMark) window.pfMark(key); if (typeof d.count === "number") { S[key].opens = d.count; paint(key); } })
      .catch(function () {});
  };

  if (!LIKES_API) return;
  var TK = "pf_voter_token";
  function token() {
    var t = null; try { t = localStorage.getItem(TK); } catch (e) {}
    if (t) return Promise.resolve(t);
    return fetch(LIKES_API + "/token", { method: "POST" }).then(function (r) { if (!r.ok) throw new Error("t"); return r.json(); }).then(function (d) {
      try { localStorage.setItem(TK, d.token); } catch (e) {} return d.token;
    });
  }
  function auth(t) { return t ? { Authorization: "Bearer " + t } : {}; }
  function note(btn) {
    var p = btn.parentNode, m = p.querySelector(".pf-meta-msg");
    if (!m) { m = document.createElement("span"); m.className = "pf-meta-msg"; m.setAttribute("role", "status"); m.style.cssText = "font-size:12px;opacity:.85;margin-inline-start:8px"; p.appendChild(m); }
    m.textContent = "\u062d\u0627\u0648\u0644 \u0644\u0627\u062d\u0642\u064b\u0627 / Try again later";
    clearTimeout(m._t); m._t = setTimeout(function () { m.textContent = ""; }, 4000);
  }
  var saved = null; try { saved = localStorage.getItem(TK); } catch (e) {}
  var uniq = Object.keys(S);
  for (var ci = 0; ci < uniq.length; ci += 15) (function (chunk) { /* the service answers up to 20 keys per request */
    fetch(LIKES_API + "/counts?items=" + encodeURIComponent(chunk.join(",")), { headers: auth(saved) }).then(function (r) { if (!r.ok) throw new Error("c"); return r.json(); }).then(function (d) {
      chunk.forEach(function (k) { if (d.views && typeof d.views[k] === "number") { S[k].opens = d.views[k]; paint(k); } if (typeof d.counts[k] === "number") { S[k].likes = d.counts[k]; S[k].liked = (d.mine || []).indexOf(k) > -1; paint(k); } });
    }).catch(function () {});
  })(uniq.slice(ci, ci + 15));
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest && e.target.closest(".pf-meta button[data-k]"); if (!b) return;
    var key = b.getAttribute("data-k"), st = S[key]; if (!st || st.busy || st.likes === null) return;
    var want = !st.liked, prev = st.likes, was = st.liked;
    st.busy = true; st.likes = Math.max(0, prev + (want ? 1 : -1)); st.liked = want; paint(key);
    token().then(function (t) {
      return fetch(LIKES_API + "/like", { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, auth(t)), body: JSON.stringify({ item: key, liked: want }) });
    }).then(function (r) { if (!r.ok) throw new Error("l"); return r.json(); }).then(function (d) { st.likes = d.count; st.liked = d.liked; })
      .catch(function () { st.likes = prev; st.liked = was; note(b); }).then(function () { st.busy = false; paint(key); });
  });
})();

/* ---- 11. Proximity glow: a button warms up gradually as the mouse comes near it (desktop mouse only) ---- */
(function () {
  document.querySelectorAll(".pf-wrapmarq-track img").forEach(function (i) { i.loading = "eager"; });
  var ok = false;
  try { ok = window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  if (!ok) return;
  var SEL = ".pf-pill,.pf-casetoggle,.pf-cs-btn,.pf-vidgroup-toggle,.pf-icon,.pf-pay-copy,.pf-feat-all,#pf-lang-toggle,.pf-nav-links a";
  var R = 120; /* px: how far from the button the glow starts */
  var items = [], mx = -9999, my = -9999, raf = 0;
  function collect() { items = Array.prototype.slice.call(document.querySelectorAll(SEL)).map(function (el) { return { el: el, cur: 0, tgt: 0 }; }); }
  collect();
  function frame() {
    raf = 0;
    var busy = false, vh = window.innerHeight;
    for (var i = 0; i < items.length; i++) {
      var it = items[i], r = it.el.getBoundingClientRect();
      if (r.width && r.bottom > -R && r.top < vh + R) {
        var dx = Math.max(r.left - mx, 0, mx - r.right), dy = Math.max(r.top - my, 0, my - r.bottom);
        var d = Math.sqrt(dx * dx + dy * dy), p = d >= R ? 0 : 1 - d / R;
        it.tgt = p * p * (3 - 2 * p); /* smoothstep: soft start, full at the edge */
      } else it.tgt = 0;
      it.cur += (it.tgt - it.cur) * 0.2;
      if (Math.abs(it.tgt - it.cur) < 0.004) it.cur = it.tgt; else busy = true;
      if (it.cur > 0.01) {
        if (!it.on) { it.el.classList.add("pf-px"); it.on = true; }
        it.el.style.setProperty("--prox", it.cur.toFixed(3));
      } else if (it.on) { it.el.classList.remove("pf-px"); it.el.style.removeProperty("--prox"); it.on = false; }
    }
    if (busy) raf = requestAnimationFrame(frame);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(frame); }
  window.addEventListener("pointermove", function (e) {
    if (e.pointerType && e.pointerType !== "mouse") return;
    mx = e.clientX; my = e.clientY; kick();
  }, { passive: true });
  document.documentElement.addEventListener("pointerleave", function () { mx = my = -9999; kick(); });
  window.addEventListener("scroll", function () { if (mx > -9000) kick(); }, { passive: true });
  window.addEventListener("load", collect);
})();

/* ---- 12. CSS marquees: repeat the content until one half of the track is wider than the strip, so the 50% loop never shows an empty edge (v=2026-11-26f) ---- */
(function () {
  function fill(t) {
    if (!t.__n) {
      var n0 = t.children.length;
      if (n0 < 2 || n0 % 2) return;
      t.__n = n0 / 2;
    }
    var n = t.__n, kids = t.children, c = t.parentElement.clientWidth;
    if (c < 50) return;
    var setW = Math.abs(kids[n].getBoundingClientRect().left - kids[0].getBoundingClientRect().left);
    if (!(setW > 5)) return;
    var need = 2 * Math.max(1, Math.ceil((c + 4) / setW)), have = Math.round(kids.length / n);
    for (var s = have; s < need; s++) {
      for (var i = 0; i < n; i++) {
        var k = kids[i].cloneNode(true);
        k.setAttribute("aria-hidden", "true");
        if (k.tagName === "IMG") k.loading = "eager";
        t.appendChild(k);
      }
    }
  }
  function all() { document.querySelectorAll(".pf-marquee-track, .pf-wrapmarq-track").forEach(fill); }
  all();
  window.addEventListener("load", all);
  var rt = 0;
  window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(all, 150); });
  if ("ResizeObserver" in window) {
    var ro = new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(all, 60); });
    document.querySelectorAll(".pf-marquee, .pf-wrapmarq").forEach(function (m) { ro.observe(m); });
  }
})();

/* ---- 13. Works filters + global site search; montage headings made truly inert (v=2026-11-26p) ---- */
(function () {
  function norm(s) { return (s || "").toLowerCase().replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ئ/g, "").replace(/ؤ/g, "و").replace(/ة/g, "ه").replace(/\s+/g, " ").trim(); }
  function curEn() { return document.documentElement.lang === "en"; }

  /* montage group headings: strip the collapse listener and drop from tab order (visually unchanged) */
  document.querySelectorAll(".pf-vidgroup-toggle").forEach(function (btn) {
    var clone = btn.cloneNode(true);
    clone.setAttribute("tabindex", "-1");
    clone.setAttribute("aria-disabled", "true");
    btn.parentNode.replaceChild(clone, btn);
  });

  /* Works page: project/client search + category chips */
  var cases = Array.prototype.slice.call(document.querySelectorAll("section.pf-case"));
  cases.forEach(function (sec) {
    var t = sec.querySelector(".pf-casetitle"), s = sec.querySelector(".pf-casesub");
    sec.__hay = norm([(t && t.textContent) || "", (t && t.getAttribute("data-en")) || "", (s && s.textContent) || "", (s && s.getAttribute("data-en")) || ""].join(" "));
  });
  var wfInput = document.getElementById("pf-wf-search");
  var wfChips = Array.prototype.slice.call(document.querySelectorAll(".pf-wf-chip"));
  var wfEmpty = document.getElementById("pf-wf-empty");
  var wfCat = "all";
  function applyWorksFilter() {
    var q = norm(wfInput ? wfInput.value : "");
    var shown = 0;
    cases.forEach(function (sec) {
      var show = (wfCat === "all" || sec.getAttribute("data-cat") === wfCat) && (!q || sec.__hay.indexOf(q) !== -1);
      sec.classList.toggle("pf-filtered-out", !show);
      if (show) shown++;
    });
    if (wfEmpty) wfEmpty.hidden = shown !== 0;
  }
  function resetWorksFilter() {
    wfCat = "all";
    if (wfInput) wfInput.value = "";
    wfChips.forEach(function (c) { c.classList.toggle("on", c.getAttribute("data-cat") === "all"); });
    applyWorksFilter();
  }
  if (wfInput) wfInput.addEventListener("input", applyWorksFilter);
  wfChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      wfCat = chip.getAttribute("data-cat") || "all";
      wfChips.forEach(function (c) { c.classList.toggle("on", c === chip); });
      applyWorksFilter();
    });
  });

  /* Global site search: works, novels, services, videos, sections */
  var KINDS = { work: ["عمل", "Work"], novel: ["رواية", "Novel"], service: ["خدمة", "Service"], video: ["فيديو", "Video"], section: ["قسم", "Section"] };
  var index = [];
  function push(kind, hash, el, sub) {
    if (!el || el.closest("[data-clone]")) return;
    index.push({ kind: kind, hash: hash, ar: el.textContent.trim(), en: el.getAttribute("data-en") || el.textContent.trim(), subAr: sub ? sub.textContent.trim() : "", subEn: sub ? (sub.getAttribute("data-en") || sub.textContent.trim()) : "" });
  }
  cases.forEach(function (sec) { push("work", "#" + sec.id, sec.querySelector(".pf-casetitle"), sec.querySelector(".pf-casesub")); });
  document.querySelectorAll(".pf-novel").forEach(function (n) { push("novel", "#pf-novels", n.querySelector(".pf-novel-name"), null); });
  document.querySelectorAll(".pf-scard").forEach(function (c) { push("service", "#services", c.querySelector(".pf-scard-name"), c.querySelector(".pf-scard-detail")); });
  document.querySelectorAll(".pf-vid-card").forEach(function (v) { push("video", "#videos", v.querySelector(".pf-vid-client"), v.querySelector(".pf-vid-kind")); });
  [["#pf-novels"], ["#pf-about"], ["#pf-testi"], ["#pf-partners"], ["#pf-contact"], ["#pf-articles"], ["#pf-brief"], ["#pf-receive"]].forEach(function (p) {
    var sec = document.querySelector(p[0]); if (!sec) return;
    push("section", p[0], sec.querySelector(".pf-contact-title, .pf-contact-kicker, h2, h3"), null);
  });

  function wireSearch(input, box) {
    if (!input || !box) return;
    var items = [];
    function render() {
      var q = norm(input.value);
      box.innerHTML = "";
      items = [];
      if (!q) { box.hidden = true; return; }
      var en = curEn();
      items = index.filter(function (it) { return norm(it.ar + " " + it.en + " " + it.subAr + " " + it.subEn).indexOf(q) !== -1; }).slice(0, 8);
      if (!items.length) {
        var d = document.createElement("div");
        d.className = "pf-gsearch-empty";
        d.textContent = en ? "No results" : "لا توجد نتائج";
        box.appendChild(d);
        box.hidden = false;
        return;
      }
      items.forEach(function (it) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "pf-gsearch-item";
        var k = document.createElement("span");
        k.className = "pf-gsearch-kind";
        k.textContent = KINDS[it.kind][en ? 1 : 0];
        var t = document.createElement("span");
        t.className = "pf-gsearch-title";
        t.textContent = en ? it.en : it.ar;
        b.appendChild(k);
        b.appendChild(t);
        b.addEventListener("click", function () { go(it); });
        box.appendChild(b);
      });
      box.hidden = false;
    }
    function go(it) {
      box.hidden = true;
      input.value = "";
      if (it.hash.indexOf("#pf-case-") === 0) {
        var sec = document.querySelector(it.hash);
        if (sec && sec.classList.contains("pf-filtered-out")) resetWorksFilter();
      }
      var panel = document.getElementById("pf-menu-panel");
      if (panel && !panel.hidden) { panel.hidden = true; var mb = document.getElementById("pf-menu-btn"); if (mb) mb.setAttribute("aria-expanded", "false"); }
      input.blur();
      if (location.hash === it.hash) {
        var el = document.getElementById(it.hash.slice(1));
        if (el) el.scrollIntoView({ block: "start" });
      } else {
        location.hash = it.hash;
      }
    }
    input.addEventListener("input", render);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); if (items.length && !box.hidden) go(items[0]); }
      if (e.key === "Escape") { box.hidden = true; input.blur(); }
    });
    document.addEventListener("click", function (e) { if (!box.hidden && !box.contains(e.target) && e.target !== input) box.hidden = true; });
    if ("MutationObserver" in window) new MutationObserver(function () { if (!box.hidden) render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
  wireSearch(document.getElementById("pf-gsearch-input"), document.getElementById("pf-gsearch-results"));
  wireSearch(document.getElementById("pf-menu-search"), document.getElementById("pf-menu-search-results"));
})();

/* ---- 14. Mobile search affordance: icon beside language toggle expands the nav search (v=2026-11-26q) ---- */
(function () {
  var btn = document.getElementById("pf-search-btn");
  var box = document.querySelector(".pf-gsearch");
  var input = document.getElementById("pf-gsearch-input");
  if (!btn || !box || !input) return;
  var root = document.documentElement;
  function open() { root.classList.add("pf-search-open"); btn.setAttribute("aria-expanded", "true"); setTimeout(function () { input.focus(); }, 60); }
  function close() { root.classList.remove("pf-search-open"); btn.setAttribute("aria-expanded", "false"); }
  btn.addEventListener("click", function (e) { e.stopPropagation(); if (root.classList.contains("pf-search-open")) close(); else open(); });
  input.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
  document.addEventListener("click", function (e) { if (root.classList.contains("pf-search-open") && !box.contains(e.target) && e.target !== btn && !btn.contains(e.target)) close(); });
  box.addEventListener("click", function (e) { if (e.target.closest(".pf-gsearch-item")) close(); });
})();
