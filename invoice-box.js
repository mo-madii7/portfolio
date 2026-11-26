/* Request-an-invoice box: delivery code first, WhatsApp as fallback */
(function () {
  "use strict";
  function en() { return document.documentElement.lang === "en"; }
  function T(a, e) { return en() ? e : a; }
  var box = null;
  function close() { if (box) { box.remove(); box = null; document.body.style.overflow = ""; } }
  function open(waHref) {
    close();
    box = document.createElement("div");
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
    box.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(5,10,25,.78);display:flex;align-items:center;justify-content:center;padding:18px";
    var card = document.createElement("div");
    card.dir = en() ? "ltr" : "rtl";
    card.style.cssText = "width:100%;max-width:380px;background:#0b1b3d;color:#fff;border:1px solid rgba(251,146,60,.5);border-radius:18px;padding:22px;font-family:inherit;box-shadow:0 20px 60px rgba(0,0,0,.5)";
    var h = document.createElement("div");
    h.textContent = T("عندك كود تسليم؟", "Have a delivery code?");
    h.style.cssText = "font-size:20px;font-weight:700;margin-bottom:6px";
    var p = document.createElement("div");
    p.textContent = T("ادخله هنا وهتلاقي فاتورتك في صفحة التسليم تحمّلها فورًا.", "Enter it here and you will find your invoice on the delivery page, ready to download.");
    p.style.cssText = "font-size:14px;opacity:.85;margin-bottom:14px;line-height:1.6";
    var inp = document.createElement("input");
    inp.type = "text"; inp.dir = "ltr"; inp.autocomplete = "off"; inp.autocapitalize = "characters"; inp.spellcheck = false;
    inp.placeholder = "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX";
    inp.setAttribute("aria-label", T("كود التسليم", "Delivery code"));
    inp.style.cssText = "width:100%;box-sizing:border-box;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;font-size:15px;letter-spacing:1px;margin-bottom:10px";
    var go = document.createElement("button");
    go.type = "button"; go.textContent = T("افتح صفحة التسليم", "Open delivery page");
    go.style.cssText = "width:100%;padding:12px;border-radius:12px;border:0;background:#f97316;color:#fff;font-weight:700;font-size:16px;cursor:pointer;font-family:inherit";
    var err = document.createElement("div");
    err.style.cssText = "color:#ffb1a3;font-size:13px;margin-top:8px;min-height:0";
    var wa = document.createElement("a");
    wa.href = waHref; wa.target = "_blank"; wa.rel = "noopener noreferrer";
    wa.textContent = T("مفيش كود؟ كلمني على واتساب", "No code? Message me on WhatsApp");
    wa.style.cssText = "display:block;text-align:center;margin-top:14px;color:#fdba74;font-size:14px;text-decoration:underline";
    var x = document.createElement("button");
    x.type = "button"; x.textContent = "✕"; x.setAttribute("aria-label", T("قفل", "Close"));
    x.style.cssText = "float:" + (en() ? "right" : "left") + ";background:none;border:0;color:#fff;font-size:20px;cursor:pointer;margin:-8px -6px 0";
    function submit() {
      var c = inp.value.trim();
      if (!c) { err.textContent = T("اكتب الكود الأول.", "Enter the code first."); return; }
      location.href = new URL("deliver/", location.href).href.split("?")[0] + "?code=" + encodeURIComponent(c);
    }
    go.addEventListener("click", submit);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
    x.addEventListener("click", close);
    box.addEventListener("click", function (e) { if (e.target === box) close(); });
    card.appendChild(x); card.appendChild(h); card.appendChild(p); card.appendChild(inp); card.appendChild(go); card.appendChild(err); card.appendChild(wa);
    box.appendChild(card); document.body.appendChild(box); document.body.style.overflow = "hidden";
    setTimeout(function () { inp.focus(); }, 50);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[data-en="Request an invoice"]') : null;
    if (!a) return;
    e.preventDefault(); e.stopPropagation();
    open(a.getAttribute("href"));
  }, true);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
})();
