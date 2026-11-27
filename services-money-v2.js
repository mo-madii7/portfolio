/* STAGED: Services page money tabs (Services | Packages | Prices & requests). Not published until approved. */
(function () {
  "use strict";
  var root = document.documentElement;
  var anchor = document.querySelector(".pf-services");
  var title = anchor && anchor.querySelector(".pf-shead-title");
  if (!anchor || !title || document.getElementById("pf-mbar")) return;
  function en() { return root.lang === "en"; }
  function mk(tag, cls, ar, enTxt) {
    var e = document.createElement(tag); if (cls) e.className = cls;
    if (ar != null) { e.textContent = ar; if (enTxt != null) { e.setAttribute("data-en", enTxt); e.setAttribute("data-ar", ar); } }
    return e;
  }
  var css = document.createElement("style");
  css.textContent = [
    '.pf-mbar{display:flex;align-items:center;flex-wrap:wrap;gap:10px 12px}',
    '.pf-mbar .pf-shead-title{margin:0}',
    '.pf-mbtns{display:flex;gap:8px;flex-wrap:wrap}',
    '.pf-mtog{padding:8px 14px;border-radius:999px;border:1px solid rgba(246,196,52,.6);background:transparent;color:#f6c434;font:700 13.5px/1.2 inherit;font-family:inherit;cursor:pointer}',
    '.pf-mtog[aria-expanded="true"]{background:#f6c434;color:#17130a}',
    '.pf-mpanel{margin:14px 0 6px}.pf-mpanel[hidden]{display:none}',
    '.pf-mh{font-size:20px;margin:6px 0 6px}',
    '.pf-mp{opacity:.8;font-size:14px;line-height:1.7;margin:0 0 14px}',
    '.pf-mgrid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}',
    '.pf-mcard{border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:16px;background:rgba(255,255,255,.04)}',
    '.pf-mcard h3{margin:0 0 6px;font-size:17px}',
    '.pf-mcard p.pf-mx{font-size:12.5px;opacity:.65}',
    '.pf-mcard p{margin:0 0 10px;font-size:13.5px;opacity:.8;line-height:1.6}',
    '.pf-mprice{display:block;font-weight:800;font-size:20px;color:#f6c434}',
    '.pf-mprice small{font-size:12px;font-weight:600;opacity:.85;margin-inline-end:6px}',
    '.pf-mnote{margin-top:14px;font-size:12.5px;opacity:.7;line-height:1.7}',
    '.pf-mgh{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;background:none;border:0;border-top:1px solid rgba(255,255,255,.12);color:inherit;font-family:inherit;font-size:14px;font-weight:800;letter-spacing:.02em;padding:14px 0 0;margin:22px 0 10px;text-align:start;cursor:pointer;opacity:.85}',
    '.pf-mgh:first-of-type{margin-top:8px;padding-top:0;border-top:0}',
    '.pf-mgch{flex:0 0 auto;width:9px;height:9px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);opacity:.7;transition:transform .2s}',
    '.pf-mgh[aria-expanded="true"] .pf-mgch{transform:rotate(-135deg)}',
    '@media(max-width:640px){.pf-mgrid.pf-mgclosed{display:none}}',
    '@media(min-width:641px){.pf-mgh{cursor:default}.pf-mgch{display:none}}',
    '.pf-mrow{margin:16px 0 4px}',
    '.pf-mhl{outline:2px solid #f6c434;box-shadow:0 0 0 6px rgba(246,196,52,.18);transition:box-shadow .3s}',
    '.pf-scard[data-mk]{cursor:pointer}',
    '@media(min-width:641px){.pf-mpanel{padding-inline:max(48px,calc((100% - 1240px)/2));box-sizing:border-box;margin:22px 0 30px}.pf-mgrid{grid-template-columns:repeat(2,1fr);gap:16px}.pf-mcard{padding:20px}.pf-mh{font-size:24px}.pf-mp{max-width:46em}}',
    '@media(min-width:900px){.pf-mgrid.pf-mg4{grid-template-columns:repeat(4,1fr)}.pf-mgrid.pf-mg3{grid-template-columns:repeat(3,1fr)}}',
    '.pf-mbtn{padding:12px 18px;border-radius:999px;border:0;background:#f6c434;color:#17130a;font-weight:700;font-size:15px;font-family:inherit;text-decoration:none;display:inline-block}'
  ].join("\n");
  document.head.appendChild(css);

  var bar = mk("div", "pf-mbar"); bar.id = "pf-mbar";
  title.parentNode.insertBefore(bar, title); bar.appendChild(title);
  var btns = mk("div", "pf-mbtns"); bar.appendChild(btns);
  var panel = mk("div", "pf-mpanel"); panel.hidden = true; panel.id = "pf-mpanel";
  var head2 = anchor.querySelector(".pf-shead"); head2.parentNode.insertBefore(panel, head2.nextSibling);

  function card(ar, en2, dAr, dEn, price, pAr, pEn, xAr, xEn) {
    var c = mk("div", "pf-mcard");
    c.appendChild(mk("h3", "", ar, en2));
    if (dAr) c.appendChild(mk("p", "", dAr, dEn));
    if (xAr) c.appendChild(mk("p", "pf-mx", xAr, xEn));
    var p = mk("span", "pf-mprice");
    if (price) { p.appendChild(mk("small", "", pAr, pEn)); p.appendChild(document.createTextNode(price + " ")); p.appendChild(mk("span", "", "ج.م", "EGP")); }
    else { p.textContent = "—"; p.setAttribute("data-en", "—"); p.setAttribute("data-ar", "—"); }
    c.appendChild(p);
    return c;
  }
  function group(w, hAr, hEn, items, idx) {
    var head = document.createElement("button");
    head.type = "button"; head.className = "pf-mgh";
    head.setAttribute("aria-expanded", "true");
    head.appendChild(mk("span", "pf-mgl", hAr, hEn));
    var ch = mk("span", "pf-mgch"); ch.setAttribute("aria-hidden", "true"); head.appendChild(ch);
    var g = mk("div", "pf-mgrid pf-mg4"); g.id = "pf-mg-" + idx;
    head.setAttribute("aria-controls", g.id);
    items.forEach(function (x) {
      var cc = card(x[0], x[1], "", "", x[2], "ابتداءً من", "from");
      if (x[3]) cc.setAttribute("data-k", x[3]);
      g.appendChild(cc);
    });
    head.addEventListener("click", function () {
      if (!MQ.matches) return;
      var open = head.getAttribute("aria-expanded") === "true";
      head.setAttribute("aria-expanded", open ? "false" : "true");
      g.classList.toggle("pf-mgclosed", open);
    });
    w.appendChild(head); w.appendChild(g);
  }
  var MQ = window.matchMedia("(max-width: 640px)");
  function foldDefaults() {
    var heads = panel.querySelectorAll(".pf-mgh");
    for (var i = 0; i < heads.length; i++) {
      var h = heads[i], g = document.getElementById(h.getAttribute("aria-controls"));
      var open = !MQ.matches || i === 0;
      h.setAttribute("aria-expanded", open ? "true" : "false");
      if (g) g.classList.toggle("pf-mgclosed", !open);
    }
  }
  if (MQ.addEventListener) MQ.addEventListener("change", foldDefaults); else if (MQ.addListener) MQ.addListener(foldDefaults);
  function quoteBtn() {
    var a = mk("a", "pf-mbtn", "اطلب عرض سعر", "Request a quote"); a.href = "quote/"; a.removeAttribute("target"); a.removeAttribute("rel");
    var r = mk("div", "pf-mrow"); r.appendChild(a); return r;
  }
  var KEYS = ["id", "bk", "bk", "bk", "so", "pr", "ve", "vs"];
  function build(kind) {
    var w = document.createElement("div");
    if (kind === 1) {
      w.appendChild(mk("h2", "pf-mh", "الباقات", "Packages"));
      w.appendChild(mk("p", "pf-mp", "باقات جاهزة بسعر أوضح لو شغلك متكرر. لو عايز حاجة مختلفة اطلب عرض سعر.", "Ready-made packages with clearer pricing for recurring work. Need something different? Request a quote."));
      var g2 = mk("div", "pf-mgrid pf-mg3");
  [
    ["باقة سوشيال ٨ تصميمات", "Social, 8 designs", "هوية موحدة وقوالب لحسابك كل شهر.", "A consistent look and templates for your account, monthly.", "1,500", "٨ تصاميم لشهر واحد، شكل موحد وقوالب. ٥ أيام شغل. PNG/JPG. جولتا تعديل، والجولة الواحدة ممكن تشمل كذا تعديل مجمّعين في دفعة واحدة. الملفات المصدرية (المفتوحة للتعديل) غير مشمولة وتُحتسب بشكل منفصل.", "8 designs for one month, shared look and templates. 5 working days. PNG/JPG. Two revision rounds, and one round can include several changes sent together in one batch. Source (editable) files are not included and are priced separately."],
    ["باقة سوشيال ١٢ تصميم", "Social, 12 designs", "للحسابات النشيطة.", "For active accounts.", "2,200", "١٢ تصميم، نفس الشروط. ٧ أيام شغل. PNG/JPG. جولتا تعديل، والجولة الواحدة ممكن تشمل كذا تعديل مجمّعين في دفعة واحدة. الملفات المصدرية (المفتوحة للتعديل) غير مشمولة وتُحتسب بشكل منفصل.", "12 designs, same terms. 7 working days. PNG/JPG. Two revision rounds, and one round can include several changes sent together in one batch. Source (editable) files are not included and are priced separately."],
    ["باقة سوشيال ٢٠ تصميم + ستوريز", "Social, 20 designs + stories", "تغطية كاملة للشهر.", "Full monthly coverage.", "3,500", "٢٠ تصميم بالستوريز، نفس الشروط. ١٠ أيام شغل. PNG/JPG. جولتا تعديل، والجولة الواحدة ممكن تشمل كذا تعديل مجمّعين في دفعة واحدة. الملفات المصدرية (المفتوحة للتعديل) غير مشمولة وتُحتسب بشكل منفصل.", "20 designs including stories, same terms. 10 working days. PNG/JPG. Two revision rounds, and one round can include several changes sent together in one batch. Source (editable) files are not included and are priced separately."],
    ["شعار + إرشادات مختصرة", "Logo + brief guidelines", "شعار كامل وألوان وخطوط وصفحة استخدام.", "Complete logo, colors, fonts and a usage page.", "3,500", "اتجاهين للوجو، ألوان وخطوط ودليل استخدام صفحة. ٧ أيام شغل. PNG وSVG وPDF. جولتا تعديل، والجولة الواحدة ممكن تشمل كذا تعديل مجمّعين في دفعة واحدة. الملفات المصدرية (المفتوحة للتعديل) غير مشمولة وتُحتسب بشكل منفصل.", "Two logo directions, colors, fonts and a one-page usage guide. 7 working days. PNG, SVG and PDF. Two revision rounds, and one round can include several changes sent together in one batch. Source (editable) files are not included and are priced separately."],
    ["هوية كاملة", "Full visual identity", "شعار وكارت وورق مراسلات وسوشيال.", "Logo, business card, stationery and social.", "6,500", "لوجو وكارت وأوراق مراسلات وسوشيال. ١٤ يوم شغل. PNG وSVG وPDF وملفات طباعة. جولتا تعديل، والجولة الواحدة ممكن تشمل كذا تعديل مجمّعين في دفعة واحدة. الملفات المصدرية (المفتوحة للتعديل) غير مشمولة وتُحتسب بشكل منفصل.", "Logo, business card, stationery and social set. 14 working days. PNG, SVG, PDF and print-ready files. Two revision rounds, and one round can include several changes sent together in one batch. Source (editable) files are not included and are priced separately."],
    ["باقة مونتاج ٨ ريلز", "Editing, 8 reels", "ريلز شهرية بنفس الستايل.", "Monthly reels in one consistent style.", "4,500", "٨ ريلز بستايل واحد، والعميل بيجيب اللقطات. ٧ أيام شغل. MP4 1080 طولي. جولتا تعديل، والجولة الواحدة ممكن تشمل كذا تعديل مجمّعين في دفعة واحدة. الملفات المصدرية (المفتوحة للتعديل) غير مشمولة وتُحتسب بشكل منفصل.", "8 reels in one style, client supplies the footage. 7 working days. MP4 1080p vertical. Two revision rounds, and one round can include several changes sent together in one batch. Source (editable) files are not included and are priced separately."]
  ].forEach(function (x) { g2.appendChild(card(x[0], x[1], x[2], x[3], x[4], "ابتداءً من", "from", x[5], x[6])); });
      w.appendChild(g2);
      w.appendChild(mk("p", "pf-mnote", "الأسعار بالجنيه المصري وبتتأكد بعرض سعر قبل البدء.", "Prices are in Egyptian pounds and confirmed with a quote before we start."));
    } else {
      w.appendChild(mk("h2", "pf-mh", "الأسعار والطلبات", "Prices & requests"));
      w.appendChild(mk("p", "pf-mp", "أسعار البداية لكل خدمة. السعر النهائي بيتحدد حسب المطلوب.", "Starting prices for each service. The final price depends on what you need."));
      group(w, "الهوية والأغلفة", "Identity & covers", [
        ["هويات بصرية وشعارات", "Visual identities & logos", "1,500", "id"],
        ["أغلفة كتب (إلكتروني)", "Book covers (e-book)", "250", "bk"],
        ["أغلفة كتب (طباعة)", "Book covers (print)", "450", "bk"],
        ["غلاف بعمل فني مخصص", "Custom artwork cover", "700", "bk"]
      ], 0);
      group(w, "مطبوعات", "Print", [
        ["كارت شخصي", "Business card", "350", "pr"],
        ["فلاير", "Flyer", "300", "pr"],
        ["بروشور", "Brochure", "600", "pr"],
        ["بوستر", "Poster", "350", "pr"],
        ["بنر", "Banner", "400", "pr"],
        ["رول أب", "Roll-up banner", "500", "pr"],
        ["مينيو", "Menu", "700", "pr"],
        ["ستيكر أو ليبل منتج", "Sticker or product label", "300", "pr"],
        ["باكدج علبة", "Box packaging", "800", "pr"],
        ["ورق مراسلات (ترويسة وختم)", "Letterhead & stamp", "600", "pr"],
        ["تيشيرت أو يونيفورم", "T-shirt or uniform", "350", "pr"],
        ["مج أو هدية دعائية", "Mug or promo gift", "300", "pr"],
        ["كارت دعوة", "Invitation card", "250", "pr"],
        ["شهادة", "Certificate", "250", "pr"]
      ], 1);
      group(w, "سوشيال ميديا", "Social media", [
        ["بوست واحد", "Single post", "250", "so"],
        ["كاروسيل", "Carousel", "450", "so"],
        ["غلاف وصورة بروفايل", "Cover & profile picture", "250", "so"],
        ["بنر إعلاني للويب", "Web banner", "250", "so"],
        ["قالب سوشيال", "Social template", "400", "so"]
      ], 2);
      group(w, "مونتاج فيديو", "Video editing", [
        ["ريل بسيط", "Simple reel", "450", "ve"],
        ["مونتاج يوتيوب", "YouTube editing", "600", "ve"]
      ], 3);
      group(w, "بريزنتيشن وإنفوجرافيك", "Presentation & infographic", [
        ["عرض تقديمي", "Presentation", "700", ""],
        ["إنفوجرافيك", "Infographic", "500", ""]
      ], 4);
      group(w, "تصوير فيديو", "Video shooting", [
        ["تصوير فيديو", "Video shooting", "3,500", "vs"]
      ], 5);
      w.appendChild(mk("p", "pf-mnote", "تصوير الفيديو بيختلف سعره حسب المعدات المطلوبة.", "Video shooting varies with the equipment required."));
    }
    w.appendChild(quoteBtn());
    return w;
  }
  var cur = 0, bs = [];
  [["الباقات", "Packages"], ["الأسعار والطلبات", "Prices & requests"]].forEach(function (d, i) {
    var b = mk("button", "pf-mtog", d[0], d[1]); b.type = "button"; b.setAttribute("aria-expanded", "false");
    b.addEventListener("click", function () {
      if (cur === i + 1) { cur = 0; panel.hidden = true; } else { cur = i + 1; panel.innerHTML = ""; panel.appendChild(build(cur)); panel.hidden = false; applyLang(); foldDefaults(); }
      bs.forEach(function (x, j) { x.setAttribute("aria-expanded", cur === j + 1 ? "true" : "false"); });
    });
    bs.push(b); btns.appendChild(b);
  });
  function applyLang() {
    if (!en()) return;
    bar.querySelectorAll("[data-en]").forEach(function (el) { el.innerHTML = el.getAttribute("data-en"); });
    panel.querySelectorAll("[data-en]").forEach(function (el) { el.innerHTML = el.getAttribute("data-en"); });
  }
  /* tap a service card: open Prices & requests and highlight its price card(s). Ticker itself untouched. */
  var MAP = [["هويات بصرية", "id"], ["أغلفة كتب", "bk"], ["سوشيال", "so"], ["مطبوعات", "pr"], ["مونتاج", "ve"], ["تصوير", "vs"]];
  function keyOf(card) {
    var n = card.querySelector(".pf-scard-name"); var t = n ? (n.getAttribute("data-ar") || n.textContent) : "";
    for (var i = 0; i < MAP.length; i++) if (t.indexOf(MAP[i][0]) > -1) return MAP[i][1];
    return null;
  }
  function tag() { anchor.querySelectorAll(".pf-scard").forEach(function (c) { if (keyOf(c)) c.setAttribute("data-mk", "1"); }); }
  tag(); setTimeout(tag, 500);
  anchor.addEventListener("click", function (e) {
    var c = e.target.closest && e.target.closest(".pf-scard"); if (!c) return;
    var k = keyOf(c); if (!k) return;
    if (cur !== 2) bs[1].click();
    var hits = panel.querySelectorAll('[data-k="' + k + '"]');
    hits.forEach(function (x) {
      var g = x.parentNode; if (!g || !g.id) return;
      var h = panel.querySelector('.pf-mgh[aria-controls="' + g.id + '"]');
      if (h) h.setAttribute("aria-expanded", "true");
      g.classList.remove("pf-mgclosed");
    });
    panel.querySelectorAll(".pf-mhl").forEach(function (x) { x.classList.remove("pf-mhl"); });
    hits.forEach(function (x) { x.classList.add("pf-mhl"); });
    if (hits[0]) setTimeout(function () { window.scrollTo({ top: hits[0].getBoundingClientRect().top + window.scrollY - 90, behavior: "smooth" }); }, 80);
    setTimeout(function () { hits.forEach(function (x) { x.classList.remove("pf-mhl"); }); }, 3500);
  });
  applyLang(); setTimeout(applyLang, 400);
  var st = parseInt(new URLSearchParams(location.search).get("mopen") || "0", 10);
  if (st && bs[st - 1]) bs[st - 1].click();
  foldDefaults();
})();
