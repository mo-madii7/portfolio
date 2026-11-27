/* Request-an-invoice box: delivery code, invoice lookup (number + access code), WhatsApp as fallback */
(function () {
  "use strict";
  function en() { return document.documentElement.lang === "en"; }
  function T(a, e) { return en() ? e : a; }
  var box = null;
  var API = "https://portfolio-deliver.mohamad-madih-20.workers.dev";
  var BASE = (function () { try { return new URL(".", document.currentScript.src).href; } catch (e) { return ""; } })();
  function loadRenderer() {
    return new Promise(function (res, rej) {
      if (window.MMInv) return res();
      var sc = document.createElement("script");
      sc.src = BASE + "deliver/invoice-render.js?v=8"; sc.onload = function () { res(); }; sc.onerror = rej;
      document.head.appendChild(sc);
    });
  }
  function close() { if (box) { box.remove(); box = null; document.body.style.overflow = ""; } }
  function open(waHref) {
    close();
    box = document.createElement("div");
    box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
    box.style.cssText = "position:fixed;inset:0;z-index:99999;background:rgba(5,10,25,.78);display:flex;align-items:center;justify-content:center;padding:18px";
    var card = document.createElement("div");
    card.dir = en() ? "ltr" : "rtl";
    card.style.cssText = "width:100%;max-width:380px;max-height:92vh;overflow-y:auto;background:#0b1b3d;color:#fff;border:1px solid rgba(251,146,60,.5);border-radius:18px;padding:22px;font-family:inherit;box-shadow:0 20px 60px rgba(0,0,0,.5)";
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
    var hr = document.createElement("div");
    hr.style.cssText = "height:1px;background:rgba(255,255,255,.18);margin:18px 0 16px";
    var lh = document.createElement("div");
    lh.textContent = T("حمّل فاتورة جاهزة", "Download a ready invoice");
    lh.style.cssText = "font-size:17px;font-weight:700;margin-bottom:6px";
    var lp = document.createElement("div");
    lp.textContent = T("اكتب رقم الفاتورة زي ما هو مطبوع عليها.", "Enter the invoice number exactly as printed on it.");
    lp.style.cssText = "font-size:13px;opacity:.8;margin-bottom:10px;line-height:1.6";
    var fld = "width:100%;box-sizing:border-box;padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.08);color:#fff;font-size:15px;letter-spacing:1px;margin-bottom:8px;font-family:inherit";
    var ino = document.createElement("input");
    ino.type = "text"; ino.dir = "ltr"; ino.autocomplete = "off"; ino.autocapitalize = "characters"; ino.spellcheck = false; ino.maxLength = 40;
    ino.placeholder = "MM-2026-0001-XXXXXX"; ino.setAttribute("aria-label", T("رقم الفاتورة", "Invoice number")); ino.style.cssText = fld;
        var lgo = document.createElement("button");
    lgo.type = "button"; lgo.textContent = T("تحميل الفاتورة", "Download invoice");
    lgo.style.cssText = "width:100%;padding:12px;border-radius:12px;border:1px solid #f97316;background:transparent;color:#fdba74;font-weight:700;font-size:16px;cursor:pointer;font-family:inherit";
    var lerr = document.createElement("div");
    lerr.setAttribute("role", "status");
    lerr.style.cssText = "color:#ffb1a3;font-size:13px;margin-top:8px";
    var lok = document.createElement("div");
    lok.style.cssText = "margin-top:8px;display:flex;gap:8px;flex-wrap:wrap";
    function dl(inv, lang) {
      return loadRenderer().then(function () { return window.MMInv.render(inv, lang); }).then(function (r) {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(r.blob); a.download = inv.invoice_no + (lang === "en" ? "-en" : "") + ".pdf";
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 8000);
      });
    }
    function lookup() {
      lerr.textContent = ""; lok.innerHTML = "";
      var n = ino.value.trim(), c = "";
      if (!n) { lerr.textContent = T("اكتب رقم الفاتورة.", "Enter the invoice number."); return; }
      lgo.disabled = true;
      fetch(API + "/api/invoice-lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ no: n, code: c }) })
        .then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); })
        .then(function (r) {
          if (r.s === 429) { lerr.textContent = T("محاولات كتير. جرّب تاني بعد ساعة.", "Too many attempts. Try again in an hour."); return; }
          if (r.s !== 200) { lerr.textContent = T("رقم الفاتورة مش مظبوط.", "The invoice number is not correct."); return; }
          var inv = r.j, main = en() ? "en" : "ar", other = en() ? "ar" : "en";
          return dl(inv, main).then(function () {
            lerr.style.color = "#86efac"; lerr.textContent = T("الفاتورة اتحمّلت: ", "Invoice downloaded: ") + inv.invoice_no;
            var b = document.createElement("button"); b.type = "button";
            b.textContent = other === "en" ? "Download in English" : "حمّلها بالعربي";
            b.style.cssText = "background:none;border:0;color:#fdba74;text-decoration:underline;cursor:pointer;font-size:13px;font-family:inherit;padding:0";
            b.addEventListener("click", function () { dl(inv, other); });
            lok.appendChild(b);
          });
        })
        .catch(function () { lerr.style.color = "#ffb1a3"; lerr.textContent = T("حصلت مشكلة. جرّب تاني.", "Something went wrong. Try again."); })
        .then(function () { lgo.disabled = false; });
    }
    lgo.addEventListener("click", lookup);
        ino.addEventListener("keydown", function (e) { if (e.key === "Enter") lookup(); });
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
    card.appendChild(x); card.appendChild(h); card.appendChild(p); card.appendChild(inp); card.appendChild(go); card.appendChild(err); card.appendChild(hr); card.appendChild(lh); card.appendChild(lp); card.appendChild(ino); card.appendChild(lgo); card.appendChild(lerr); card.appendChild(lok); card.appendChild(wa);
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
