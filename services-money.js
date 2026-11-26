/* STAGED: Services page money tabs (Services | Packages | Prices & requests). Not published until approved. */
(function () {
  "use strict";
  var root = document.documentElement;
  var anchor = document.querySelector(".pf-services");
  if (!anchor || document.getElementById("pf-mtabs")) return;
  function en() { return root.lang === "en"; }
  function mk(tag, cls, ar, enTxt) {
    var e = document.createElement(tag); if (cls) e.className = cls;
    if (ar != null) { e.textContent = ar; if (enTxt != null) { e.setAttribute("data-en", enTxt); e.setAttribute("data-ar", ar); } }
    return e;
  }
  var css = document.createElement("style");
  css.textContent = [
    'html:not([data-view="services"]) .pf-mtabs,html:not([data-view="services"]) .pf-mpane{display:none!important}',
    '.pf-mpane{display:none}',
    'html[data-view="services"][data-mtab="1"] .pf-mpane-1,html[data-view="services"][data-mtab="2"] .pf-mpane-2,html[data-view="services"][data-mtab="3"] .pf-mpane-3{display:block}',
    'html[data-view="services"][data-mtab="2"] .pf-services,html[data-view="services"][data-mtab="2"] #pf-brief,html[data-view="services"][data-mtab="2"] #pf-receive,html[data-view="services"][data-mtab="3"] .pf-services,html[data-view="services"][data-mtab="3"] #pf-brief,html[data-view="services"][data-mtab="3"] #pf-receive{display:none!important}',
    '.pf-mtabs{display:flex;gap:8px;padding:18px 16px 4px;max-width:1100px;margin:0 auto;position:sticky;top:56px;z-index:5}',
    '.pf-mtab{flex:1;padding:11px 6px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(10,10,12,.82);color:#f4efe6;font:600 14px/1.2 inherit;font-family:inherit;cursor:pointer;backdrop-filter:blur(8px)}',
    '.pf-mtab[aria-selected="true"]{background:#f6c434;color:#17130a;border-color:#f6c434}',
    '.pf-mpane{padding:14px 16px 40px;max-width:1100px;margin:0 auto;color:#f4efe6}',
    '.pf-mh{font-size:22px;margin:10px 0 6px}',
    '.pf-mp{opacity:.8;font-size:14px;line-height:1.7;margin:0 0 14px}',
    '.pf-mgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}',
    '.pf-mcard{border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:16px;background:rgba(255,255,255,.04)}',
    '.pf-mcard h3{margin:0 0 6px;font-size:17px}',
    '.pf-mcard p{margin:0 0 10px;font-size:13.5px;opacity:.8;line-height:1.6}',
    '.pf-mprice{display:block;font-weight:800;font-size:20px;color:#f6c434}',
    '.pf-mprice small{font-size:12px;font-weight:600;opacity:.85;margin-inline-start:4px}',
    '.pf-mrow{display:flex;flex-wrap:wrap;gap:10px;margin:16px 0}',
    '.pf-mnote{margin-top:14px;font-size:12.5px;opacity:.7;line-height:1.7}',
    '.pf-mbtn{padding:12px 18px;border-radius:999px;border:1px solid rgba(246,196,52,.6);background:transparent;color:#f6c434;font-weight:700;font-size:15px;font-family:inherit;cursor:pointer;text-decoration:none;display:inline-block}',
    '.pf-mbtn-solid{background:#f6c434;color:#17130a}',
    '#pf-svc-cs .pf-menu{flex-wrap:wrap}'
  ].join("\n");
  document.head.appendChild(css);

  var tabs = mk("div", "pf-mtabs"); tabs.id = "pf-mtabs"; tabs.setAttribute("role", "tablist");
  var defs = [["الخدمات", "Services"], ["الباقات", "Packages"], ["الأسعار والطلبات", "Prices & requests"]];
  defs.forEach(function (d, i) {
    var b = mk("button", "pf-mtab", d[0], d[1]); b.type = "button"; b.setAttribute("role", "tab"); b.setAttribute("data-t", String(i + 1));
    b.addEventListener("click", function () { setTab(i + 1); });
    tabs.appendChild(b);
  });
  anchor.parentNode.insertBefore(tabs, anchor);
  function setTab(n, keepScroll) {
    root.setAttribute("data-mtab", String(n));
    tabs.querySelectorAll(".pf-mtab").forEach(function (b) { b.setAttribute("aria-selected", b.getAttribute("data-t") === String(n) ? "true" : "false"); });
    if (!keepScroll) { var y = tabs.getBoundingClientRect().top + window.scrollY - 60; window.scrollTo({ top: Math.max(0, y), behavior: "smooth" }); }
  }

  function card(ar, en2, dAr, dEn, price, pAr, pEn) {
    var c = mk("div", "pf-mcard");
    c.appendChild(mk("h3", "", ar, en2));
    if (dAr) c.appendChild(mk("p", "", dAr, dEn));
    var p = mk("span", "pf-mprice");
    var s = mk("small", "", pAr, pEn);
    p.appendChild(document.createTextNode(price + " ")); p.appendChild(mk("span", "", "ج.م", "EGP")); if (pAr) p.appendChild(s);
    c.appendChild(p);
    return c;
  }
  function pane(n) { var s = document.createElement("section"); s.className = "pf-mpane pf-mpane-" + n; return s; }

  /* tab 1 marker: the existing sections are tab 1 */
  var p1 = pane(1); p1.style.cssText = "padding:0;height:0"; anchor.parentNode.insertBefore(p1, anchor);

  /* tab 2: packages */
  var p2 = pane(2);
  p2.appendChild(mk("h2", "pf-mh", "الباقات", "Packages"));
  p2.appendChild(mk("p", "pf-mp", "باقات جاهزة بسعر أوضح لو شغلك متكرر. لو عايز حاجة مختلفة اطلب عرض سعر.", "Ready-made packages with clearer pricing for recurring work. Need something different? Request a quote."));
  var g2 = mk("div", "pf-mgrid");
  [
    ["باقة سوشيال ٨ تصميمات", "Social, 8 designs", "هوية موحدة وقوالب لحسابك كل شهر.", "A consistent look and templates for your account, monthly.", "1,500"],
    ["باقة سوشيال ١٢ تصميم", "Social, 12 designs", "للحسابات النشيطة.", "For active accounts.", "2,200"],
    ["باقة سوشيال ٢٠ تصميم + ستوريز", "Social, 20 designs + stories", "تغطية كاملة للشهر.", "Full monthly coverage.", "3,500"],
    ["شعار + إرشادات مختصرة", "Logo + brief guidelines", "شعار كامل وألوان وخطوط وصفحة استخدام.", "Complete logo, colors, fonts and a usage page.", "3,500"],
    ["هوية كاملة", "Full visual identity", "شعار وكارت وورق مراسلات وسوشيال.", "Logo, business card, stationery and social.", "6,500"],
    ["باقة مونتاج ٨ ريلز", "Editing, 8 reels", "ريلز شهرية بنفس الستايل.", "Monthly reels in one consistent style.", "4,500"]
  ].forEach(function (x) { g2.appendChild(card(x[0], x[1], x[2], x[3], x[4], "ابتداءً من", "from")); });
  p2.appendChild(g2);
  p2.appendChild(mk("p", "pf-mnote", "الأسعار بالجنيه المصري وبتتأكد بعرض سعر قبل البدء.", "Prices are in Egyptian pounds and confirmed with a quote before we start."));
  anchor.parentNode.insertBefore(p2, anchor);

  /* tab 3: prices and requests */
  var p3 = pane(3);
  p3.appendChild(mk("h2", "pf-mh", "الأسعار والطلبات", "Prices & requests"));
  p3.appendChild(mk("p", "pf-mp", "أسعار البداية لكل خدمة. السعر النهائي بيتحدد حسب المطلوب.", "Starting prices for each service. The final price depends on what you need."));
  var g3 = mk("div", "pf-mgrid");
  [
    ["هويات بصرية وشعارات", "Visual identities & logos", "1,500"],
    ["أغلفة كتب (إلكتروني)", "Book covers (e-book)", "250"],
    ["أغلفة كتب (طباعة)", "Book covers (print)", "450"],
    ["غلاف بعمل فني مخصص", "Custom artwork cover", "700"],
    ["سوشيال ميديا (بوست واحد)", "Social media (single post)", "250"],
    ["مطبوعات (كارت شخصي)", "Print (business card)", "350"],
    ["مونتاج فيديو (ريل بسيط)", "Video editing (simple reel)", "450"],
    ["تصوير فيديو", "Video shooting", "3,500"]
  ].forEach(function (x) { g3.appendChild(card(x[0], x[1], "", "", x[2], "ابتداءً من", "from")); });
  p3.appendChild(g3);
  p3.appendChild(mk("p", "pf-mnote", "تصوير الفيديو بيختلف سعره حسب المعدات المطلوبة.", "Video shooting varies with the equipment required."));
  var row = mk("div", "pf-mrow");
  function gotoBrief(quote) {
    var f = document.getElementById("pf-brief-form");
    var flag = document.getElementById("bf-quote-flag");
    if (f && !flag) { flag = document.createElement("input"); flag.type = "hidden"; flag.id = "bf-quote-flag"; flag.name = "نوع الطلب"; f.appendChild(flag); }
    if (flag) { flag.value = quote ? "طلب عرض سعر" : ""; flag.disabled = !quote; }
    setTab(1, true);
    var b = document.getElementById("pf-brief");
    var t = b && b.querySelector(".pf-casetoggle");
    if (t && t.getAttribute("aria-expanded") === "false") t.click();
    setTimeout(function () { if (b) window.scrollTo({ top: b.getBoundingClientRect().top + window.scrollY - 70, behavior: "smooth" }); }, 120);
  }
  var q = mk("button", "pf-mbtn pf-mbtn-solid", "اطلب عرض سعر لخدمتك", "Request a quote for your service"); q.type = "button"; q.id = "pf-quote-btn";
  q.addEventListener("click", function () { gotoBrief(true); });
  row.appendChild(q);
  p3.appendChild(row);
  anchor.parentNode.insertBefore(p3, anchor);

  /* client-services block stays where it is (visible under all tabs); open its menu and add a Quote button */
  function csSetup() {
    var cs = document.getElementById("pf-svc-cs"); if (!cs) return;
    var m = cs.querySelector(".pf-menu"), b = cs.querySelector(".pf-cs-btn:not(.pf-rights-btn)");
    if (m && m.hidden && b && !cs.getAttribute("data-mopened")) { cs.setAttribute("data-mopened", "1"); b.click(); }
    if (m && !cs.querySelector("#pf-cs-quote")) {
      var qb = mk("button", "pf-pill pf-pill-gold", "اطلب عرض سعر", "Request a quote"); qb.style.flexBasis = "100%"; qb.type = "button"; qb.id = "pf-cs-quote";
      qb.addEventListener("click", function () { gotoBrief(true); });
      m.appendChild(qb);
    }
  }
  csSetup(); setTimeout(csSetup, 300);

  /* quote button at the end of the brief form */
  var form = document.getElementById("pf-brief-form");
  if (form && !document.getElementById("bf-quote-end")) {
    var qe = mk("button", "pf-mbtn", "أو اطلب عرض سعر بدل الحجز", "Or request a quote instead of booking"); qe.type = "button"; qe.id = "bf-quote-end"; qe.style.cssText = "margin-top:10px;width:100%";
    qe.addEventListener("click", function () {
      var flag = document.getElementById("bf-quote-flag");
      if (!flag) { flag = document.createElement("input"); flag.type = "hidden"; flag.id = "bf-quote-flag"; flag.name = "نوع الطلب"; form.appendChild(flag); }
      flag.value = "طلب عرض سعر"; flag.disabled = false;
      if (form.requestSubmit) form.requestSubmit(); else form.dispatchEvent(new Event("submit", { cancelable: true }));
    });
    var sub = form.querySelector(".pf-bf-submit"); if (sub) sub.parentNode.insertBefore(qe, sub.nextSibling);
  }

  /* quote request button also under the packages */
  var qp = mk("div", "pf-mrow"); var q2 = mk("button", "pf-mbtn pf-mbtn-solid", "اطلب عرض سعر", "Request a quote"); q2.type = "button"; q2.addEventListener("click", function () { gotoBrief(true); });
  qp.appendChild(q2); p2.appendChild(qp);

  var start = parseInt(new URLSearchParams(location.search).get("mtab") || "1", 10) || 1;
  window.addEventListener("hashchange", function () { var h = location.hash.slice(1); if (h === "pf-brief" || h === "pf-receive" || h === "services") setTab(1, true); });
  setTab(start, true);
  function applyLang() {
    if (!en()) return;
    document.querySelectorAll("#pf-mtabs [data-en], .pf-mpane [data-en], #bf-quote-end, #pf-svc-cs [data-en]").forEach(function (el) {
      var t = el.getAttribute("data-en"); if (t == null) return;
      if (el.getAttribute("data-ar") == null && /[\u0600-\u06FF]/.test(el.innerHTML)) el.setAttribute("data-ar", el.innerHTML);
      el.innerHTML = t;
    });
  }
  csSetup(); applyLang(); setTimeout(applyLang, 400); setTimeout(applyLang, 1200);
})();
