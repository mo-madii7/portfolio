(function () {
  "use strict";
  var API = "https://portfolio-deliver.mohamad-madih-20.workers.dev";
  var KEY = "pf-lang";
  function $(id) { return document.getElementById(id); }
  function en() { return document.documentElement.lang === "en"; }
  function T(a, e) { return en() ? e : a; }
  function nf(n) { return Number(n).toLocaleString(en() ? "en-US" : "ar-EG"); }
  var S = null, last = null;

  function fillServices() {
    var sel = $("qt-service"), cur = sel.value;
    sel.innerHTML = "";
    Object.keys(S).forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = en() ? S[k].en : S[k].ar; sel.appendChild(o); });
    if (cur && S[cur]) sel.value = cur;
    fillTypes();
  }
  function fillTypes() {
    var svc = S[$("qt-service").value], sel = $("qt-type"), cur = sel.value;
    sel.innerHTML = "";
    svc.types.forEach(function (t) { var o = document.createElement("option"); o.value = t.k; o.textContent = en() ? t.en : t.ar; sel.appendChild(o); });
    if (cur && svc.types.some(function (t) { return t.k === cur; })) sel.value = cur;
    $("qt-qty-wrap").hidden = !svc.qty;
    if (!svc.qty) $("qt-qty").value = 1;
    hint();
  }
  function hint() {
    var svc = S[$("qt-service").value], t = svc.types.filter(function (x) { return x.k === $("qt-type").value; })[0];
    $("qt-from").textContent = t ? T("ابتداءً من ", "From ") + nf(t.p) + " " + T("ج.م", "EGP") + (t.review ? T(" · السعر النهائي بعد مراجعتي", " · final price after my review") : "") : "";
  }
  function labels() {
    $("qt-urgent-t").textContent = T("مستعجل (رسوم استعجال ٣٠٪)", "Urgent (30% rush fee)");
    $("qt-dl").textContent = T("حمّل عرض السعر PDF", "Download quote PDF");
    $("qt-dl2").textContent = T("PDF English", "PDF بالعربي");
    $("qt-name").setAttribute("aria-label", T("اسمك", "Your name"));
  }

  var statics = [].slice.call(document.querySelectorAll("[data-en]"));
  statics.forEach(function (e) { e._ar = e.tagName === "TITLE" ? e.textContent : e.innerHTML; });
  function applyLang(l) {
    var e2 = l === "en";
    document.documentElement.lang = l; document.documentElement.dir = e2 ? "ltr" : "rtl";
    statics.forEach(function (e) { var v = e2 ? e.getAttribute("data-en") : e._ar; if (e.tagName === "TITLE") e.textContent = v; else e.innerHTML = v; });
    $("dv-lang").textContent = e2 ? "AR" : "EN";
    labels(); if (S) fillServices();
    if (last) showDone(last);
    try { localStorage.setItem(KEY, l); } catch (x) {}
  }
  $("dv-lang").addEventListener("click", function () { applyLang(en() ? "ar" : "en"); });
  try { if (localStorage.getItem(KEY) === "en") document.documentElement.lang = "en"; } catch (x) {}
  if (en()) applyLang("en"); else labels();

  fetch(API + "/api/quote-options").then(function (r) { return r.json(); }).then(function (j) { S = j.services; fillServices(); })
    .catch(function () { showErr(T("مش قادر أحمّل الخدمات. جرّب تاني.", "Could not load the services. Try again.")); });
  ["qt-name", "qt-contact", "qt-need"].forEach(function (k) {
    $(k).addEventListener("input", function () {
      this.classList.remove("qt-bad");
      if (!document.querySelector(".qt-bad")) showErr("");
    });
  });
  $("qt-service").addEventListener("change", fillTypes);
  $("qt-type").addEventListener("change", hint);

  function showErr(m) { $("qt-err-t").textContent = m; $("qt-err").hidden = !m; }
  function download(q, lang) {
    return window.MMInv.render(q, lang).then(function (r) {
      var a = document.createElement("a"); a.href = URL.createObjectURL(r.blob); a.download = q.invoice_no + (lang === "en" ? "-en" : "") + ".pdf";
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 8000);
    });
  }
  function showDone(res) {
    $("qt-form").hidden = true; $("qt-done").hidden = false;
    if (res.status === "quote") {
      var q = res.quote;
      $("qt-done-h").textContent = T("عرض السعر جاهز: ", "Your quote is ready: ") + q.invoice_no;
      $("qt-done-b").textContent = T("نزّل الـPDF من الزرار تحت. وطلبك وصلني كمان.", "Download the PDF below. I also received your request.");
      var L = $("qt-lines"); L.innerHTML = "";
      q.items.forEach(function (it) { var d = document.createElement("div"); var a = document.createElement("span"), b = document.createElement("b"); a.textContent = (en() && it.name_en) ? it.name_en : it.name; b.textContent = nf(it.price) + " " + T("ج.م", "EGP"); d.appendChild(a); d.appendChild(b); L.appendChild(d); });
      $("qt-total").textContent = T("الإجمالي ", "Total ") + nf(q.amount) + " " + T("ج.م", "EGP");
      $("qt-quote").hidden = false;
      $("qt-dl").onclick = function () { download(q, en() ? "en" : "ar"); };
      $("qt-dl2").onclick = function () { download(q, en() ? "ar" : "en"); };
    } else {
      $("qt-done-h").textContent = T("طلبك وصل", "Request received");
      $("qt-done-b").textContent = T("طلبك محتاج مراجعة مني. هراجعه وأرد عليك بعرض السعر على الرقم أو الإيميل اللي كتبته. رقم الطلب: ", "Your request needs my personal review. I will check it and reply with your quote on the number or email you gave. Reference: ") + res.ref;
      $("qt-quote").hidden = true;
    }
  }
  function mail(res, f) {
    var d = new FormData();
    var ref = res.status === "quote" ? res.quote.invoice_no : "REVIEW-" + res.ref;
    d.append("_subject", (res.status === "quote" ? "Quote sent: " : "Quote needs review: ") + ref + " - " + f.client);
    d.append("_template", "table"); d.append("_captcha", "false");
    d.append("status", res.status === "quote" ? "Quote generated and given to the client" : "NEEDS YOUR REVIEW (saved as a draft in admin > docs)");
    d.append("reference", ref); d.append("client", f.client); d.append("contact", f.contact);
    d.append("service", res.meta.service); d.append("type", res.meta.type); d.append("quantity", res.meta.qty);
    d.append("urgent", res.meta.urgent ? "yes" : "no"); d.append("needed", f.need); d.append("notes", f.notes || "-");
    var items = (res.status === "quote" ? res.quote.items : res.items);
    d.append("lines", items.map(function (i) { return (i.name_en || i.name) + ": " + i.price; }).join(" | "));
    d.append("total_EGP", res.status === "quote" ? res.quote.amount : res.total);
    return fetch("https://formsubmit.co/ajax/mohamad.madih.20@gmail.com", { method: "POST", headers: { "Accept": "application/json" }, body: d }).catch(function () {});
  }
  $("qt-form").addEventListener("submit", function (e) {
    e.preventDefault(); showErr("");
    var f = { service: $("qt-service").value, type: $("qt-type").value, client: $("qt-name").value.trim(), contact: $("qt-contact").value.trim(), need: $("qt-need").value.trim(), notes: $("qt-notes").value.trim(), qty: Number($("qt-qty").value) || 1, urgent: $("qt-urgent").checked, website: $("qt-hp").value };
    var miss = [];
    if (f.client.length < 2) miss.push("qt-name");
    if (f.contact.length < 5) miss.push("qt-contact");
    if (f.need.length < 3) miss.push("qt-need");
    if (miss.length) {
      var oneMsg = {
        "qt-name": T("اكتب اسمك في خانة (اسمك) عشان نكمل.", "Add your name in the (Your name) field to continue."),
        "qt-contact": T("اكتب رقم واتساب أو إيميل صحيح في خانة (وسيلة التواصل) عشان نكمل.", "Add a valid WhatsApp number or email in the (Contact) field to continue."),
        "qt-need": T("اكتب في خانة (محتاج إيه بالظبط؟) تفاصيل المشروع عشان نكمل.", "Write your project details in the (What do you need exactly?) field to continue.")
      };
      var names = { "qt-name": T("اسمك", "name"), "qt-contact": T("وسيلة التواصل", "contact"), "qt-need": T("محتاج إيه بالظبط؟", "what you need") };
      showErr(miss.length === 1 ? oneMsg[miss[0]] : T("اكمل الحقول دي عشان نكمل: ", "Fill in these fields to continue: ") + miss.map(function (k) { return names[k]; }).join(T("، ", ", ")));
      miss.forEach(function (k) { $(k).classList.add("qt-bad"); });
      var first = $(miss[0]);
      first.scrollIntoView({ block: "center", behavior: "smooth" });
      first.focus({ preventScroll: true });
      return;
    }
    var go = $("qt-go"); go.disabled = true;
    fetch(API + "/api/quote-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) })
      .then(function (r) { return r.json().then(function (j) { return { s: r.status, j: j }; }); })
      .then(function (r) {
        if (r.s === 429) { showErr(T("طلبات كتير. جرّب تاني بعد ساعة.", "Too many requests. Try again in an hour.")); return; }
        if (r.s !== 200) { showErr(T("حصلت مشكلة. راجع البيانات وجرّب تاني.", "Something went wrong. Check the details and try again.")); return; }
        last = r.j; showDone(r.j); mail(r.j, f);
        if (r.j.status === "quote") download(r.j.quote, en() ? "en" : "ar").catch(function () {});
      })
      .catch(function () { showErr(T("حصلت مشكلة في الاتصال. جرّب تاني.", "Connection problem. Try again.")); })
      .then(function () { go.disabled = false; });
  });
})();
