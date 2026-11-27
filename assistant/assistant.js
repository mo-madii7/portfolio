(function () {
  var API = "https://portfolio-deliver.mohamad-madih-20.workers.dev/api/assistant";
  var WA = "https://wa.me/201119072800";
  function en() { return document.documentElement.lang === "en"; }
  function T(a, e) { return en() ? e : a; }
  var tok = "";
  try { tok = localStorage.getItem("pf-ai-t") || ""; if (!tok) { tok = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); localStorage.setItem("pf-ai-t", tok); } } catch (e) { tok = Math.random().toString(36).slice(2, 12); }
  var css = document.createElement("style");
  css.textContent = [
    "#pf-ai-b{position:fixed;left:14px;bottom:20px;z-index:60;width:52px;height:52px;border-radius:50%;border:1px solid rgba(255,255,255,.25);background:#f5b321;color:#111;font:700 13px Alexandria,sans-serif;cursor:pointer;box-shadow:0 6px 20px rgba(0,0,0,.45)}",
    "#pf-ai-p{position:fixed;left:14px;bottom:82px;z-index:61;width:min(360px,calc(100vw - 28px));height:min(460px,calc(100vh - 150px));display:none;flex-direction:column;border-radius:16px;border:1px solid rgba(255,255,255,.18);background:#14110e;color:#f2ede4;font:14px/1.6 Alexandria,sans-serif;box-shadow:0 12px 36px rgba(0,0,0,.6);overflow:hidden}",
    "#pf-ai-p.o{display:flex}",
    "@media(max-width:640px){#pf-ai-b{left:24px;bottom:42px}#pf-ai-p{left:14px;bottom:104px;height:min(460px,calc(100vh - 180px))}html[lang=en] #pf-ai-b{left:auto;right:24px}html[lang=en] #pf-ai-p{left:auto;right:14px}}",
    "html[lang=en] #pf-ai-b{left:auto;right:14px}",
    "html[lang=en] #pf-ai-p{left:auto;right:14px}",
    "#pf-ai-h{padding:12px 14px;font-weight:700;border-bottom:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:center}",
    "#pf-ai-h button{background:none;border:0;color:inherit;font-size:20px;cursor:pointer;line-height:1}",
    "#pf-ai-m{flex:1;overflow:auto;scrollbar-width:thin;scrollbar-color:#555 transparent;padding:12px;display:flex;flex-direction:column;gap:8px}",
    ".pf-ai-x{max-width:88%;padding:8px 11px;border-radius:12px;white-space:pre-wrap;word-break:break-word}",
    ".pf-ai-u{align-self:flex-end;background:#f5b321;color:#111}",
    ".pf-ai-a{align-self:flex-start;background:rgba(255,255,255,.09)}",
    "#pf-ai-n{padding:6px 12px;font-size:11.5px;opacity:.6}",
    "#pf-ai-f{display:flex;gap:6px;padding:10px;border-top:1px solid rgba(255,255,255,.12)}",
    "#pf-ai-i{flex:1;min-width:0;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:#0c0a08;color:inherit;padding:9px;font:inherit}",
    "#pf-ai-s{border-radius:10px;border:0;background:#f5b321;color:#111;font-weight:700;padding:0 14px;cursor:pointer}",
    ".pf-ai-x a{color:inherit;text-decoration:underline}"
  ].join("");
  document.head.appendChild(css);
  var b = document.createElement("button"); b.id = "pf-ai-b"; b.type = "button"; b.textContent = "AI";
  var p = document.createElement("div"); p.id = "pf-ai-p"; p.setAttribute("role", "dialog");
  p.innerHTML = '<div id="pf-ai-h"><span></span><button type="button" aria-label="close">\u00d7</button></div><div id="pf-ai-m"></div><div id="pf-ai-n"></div><form id="pf-ai-f"><input id="pf-ai-i" maxlength="400" autocomplete="off"><button id="pf-ai-s" type="submit"></button></form>';
  document.body.appendChild(b); document.body.appendChild(p);
  var msgs = p.querySelector("#pf-ai-m"), inp = p.querySelector("#pf-ai-i"), form = p.querySelector("#pf-ai-f"), hist = [], busy = false, greeted = false;
  function labels() {
    p.querySelector("#pf-ai-h span").textContent = T("مساعد محمد", "Mohamad's assistant");
    p.querySelector("#pf-ai-s").textContent = T("إرسال", "Send");
    inp.placeholder = T("اكتب سؤالك...", "Type your question...");
    p.querySelector("#pf-ai-n").textContent = T("مساعد آلي بالذكاء الاصطناعي. الردود إرشادية وليست عرض سعر نهائي. لا تكتب بيانات شخصية.", "Automated AI assistant. Replies are guidance, not a final quote. Please do not type personal data.");
    b.setAttribute("aria-label", T("اسأل المساعد", "Ask the assistant"));
    p.setAttribute("dir", en() ? "ltr" : "rtl");
  }
  function add(cls, text, html) {
    var d = document.createElement("div"); d.className = "pf-ai-x " + cls;
    if (html) d.innerHTML = html; else d.textContent = text;
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; return d;
  }
  function fallback() {
    var q = en() ? "quote/" : "quote/";
    add("pf-ai-a", "", T('مش قادر أرد دلوقتي. تقدر تطلب عرض سعر من <a href="quote/">صفحة عرض السعر</a> أو تبعت لمحمد على <a href="' + WA + '" target="_blank" rel="noopener noreferrer">واتساب</a>.', 'I can\'t answer right now. You can get a quote on the <a href="quote/">quote page</a> or message Mohamad on <a href="' + WA + '" target="_blank" rel="noopener noreferrer">WhatsApp</a>.'));
  }
  function open() {
    labels(); p.classList.add("o");
    if (!greeted) { greeted = true; add("pf-ai-a", T("أهلاً! اسألني عن الخدمات والأسعار والباقات وطريقة الطلب والسياسات.", "Hi! Ask me about services, prices, packages, how to order, and policies.")); }
    setTimeout(function () { inp.focus(); }, 50);
  }
  b.addEventListener("click", function () { p.classList.contains("o") ? p.classList.remove("o") : open(); });
  p.querySelector("#pf-ai-h button").addEventListener("click", function () { p.classList.remove("o"); });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = inp.value.trim(); if (q.length < 2 || busy) return;
    inp.value = ""; add("pf-ai-u", q); busy = true;
    var wait = add("pf-ai-a", T("بيكتب...", "Typing..."));
    fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q: q, t: tok, h: hist.slice(-4) }) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        wait.remove();
        if (d && d.reply) { add("pf-ai-a", d.reply); hist.push({ r: "user", c: q }, { r: "assistant", c: d.reply }); }
        else fallback();
      })
      .catch(function () { wait.remove(); fallback(); })
      .then(function () { busy = false; });
  });
  try { new MutationObserver(labels).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] }); } catch (e) {}
  labels();
})();
