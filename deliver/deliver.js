/* استلام الأعمال — client delivery page */
(function () {
  "use strict";

  // Set to the deployed Worker URL at launch (same pattern as the likes worker).
  var API = "https://portfolio-deliver.mohamad-madih-20.workers.dev";

  var $ = function (id) { return document.getElementById(id); };
  var entry = $("dv-entry"), room = $("dv-room"), expired = $("dv-expired"), wrong = $("dv-wrong");
  var banner = $("dv-preview-banner");
  var codeInput = $("dv-code"), errBox = $("dv-entry-err"), errText = $("dv-entry-err-text");
  var countdownTimer = null;
  var KEY = "pf-lang";
  function isEn() { return document.documentElement.lang === "en"; }
  function T(ar, en) { return isEn() ? en : ar; }
  var lastRoom = null, lastErr = null;

  var EN_ERR = {
    "اكتب الكود الأول.": "Enter the code first.",
    "محاولات كتير غلط. استنى شوية وجرب تاني.": "Too many wrong attempts. Wait a little and try again.",
    "في مشكلة في الاتصال. جرب تاني بعد شوية.": "There is a connection problem. Try again in a moment."
  };
  function show(which) {
    entry.hidden = which !== "entry";
    room.hidden = which !== "room";
    expired.hidden = which !== "expired";
    wrong.hidden = which !== "wrong";
    if (which !== "room" && countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  }

  function entryError(msg) {
    lastErr = msg;
    errText.textContent = isEn() ? (EN_ERR[msg] || msg) : msg;
    errBox.hidden = false;
  }

  function fmtSize(bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + T(" ميجا", " MB");
    if (bytes >= 1024) return Math.round(bytes / 1024) + T(" كيلو", " KB");
    return bytes + T(" بايت", " B");
  }

  function tick(expiresAt) {
    var el = $("dv-count");
    function update() {
      var left = new Date(expiresAt).getTime() - Date.now();
      if (left <= 0) { show("expired"); return; }
      var s = Math.floor(left / 1000);
      var h = String(Math.floor(s / 3600)).padStart(2, "0");
      var m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
      var sec = String(s % 60).padStart(2, "0");
      el.textContent = h + ":" + m + ":" + sec;
    }
    update();
    countdownTimer = setInterval(update, 1000);
  }

  var fileState = "0";
  function fileUrl(code, name, inline) {
    return API + "/api/file?code=" + encodeURIComponent(code) +
      "&name=" + encodeURIComponent(name) + (inline ? "&inline=1" : "") +
      "&s=" + fileState;
  }

  function renderRoom(code, data) {
    lastRoom = { code: code, data: data };
    $("dv-project").textContent = data.project;
    $("dv-client").textContent = T("تسليمة خاصة بـ ", "Delivery for ") + data.client;
    $("dv-explain").textContent = data.explanation;
    var locked = !data.downloads_enabled;
    fileState = data.downloads_enabled ? "1" : "0";
    if (banner) banner.hidden = !locked;

    var facts = $("dv-facts");
    facts.innerHTML = "";
    [
      [T("العميل", "Client"), data.client],
      [T("المحتوى", "Contents"), data.files.length + (isEn() ? (data.files.length === 1 ? " file" : " files") : (data.files.length === 1 ? " ملف" : " ملفات")) + T(" — نسخ أصلية", " — original copies")],
      [T("إنشاء التسليمة", "Delivery created"), new Date(data.created_at).toLocaleString(isEn() ? "en-GB" : "ar-EG")],
    ].forEach(function (row) {
      var div = document.createElement("div");
      var dt = document.createElement("dt"); dt.textContent = row[0];
      var dd = document.createElement("dd"); dd.textContent = row[1];
      div.appendChild(dt); div.appendChild(dd);
      facts.appendChild(div);
    });

    var grid = $("dv-grid");
    grid.innerHTML = "";
    data.files.forEach(function (f) {
      var cell = document.createElement("figure");
      cell.className = "dv-cell";
      if (f.mime === "application/pdf") {
        var badge;
        if (locked) {
          badge = document.createElement("div");
          badge.className = "dv-pdf dv-pdf-locked";
          badge.textContent = T("PDF — بيتاح بعد تفعيل التحميل", "PDF — available once downloads are enabled");
        } else {
          badge = document.createElement("a");
          badge.className = "dv-pdf";
          badge.href = fileUrl(code, f.name, true);
          badge.target = "_blank";
          badge.rel = "noopener";
          badge.textContent = "PDF";
        }
        cell.appendChild(badge);
      } else {
        var img = document.createElement("img");
        img.src = fileUrl(code, f.name, true);
        img.alt = f.name;
        img.loading = "lazy";
        img.tabIndex = 0;
        img.setAttribute("role", "button");
        img.addEventListener("click", function () { openPreview(fileUrl(code, f.name, true), f.name); });
        img.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openPreview(fileUrl(code, f.name, true), f.name); }
        });
        cell.appendChild(img);
      }
      var cap = document.createElement("figcaption");
      if (locked) {
        cap.textContent = f.name + " (" + fmtSize(f.size) + ")" + T(" — معاينة فقط", " — preview only");
      } else {
        cap.textContent = f.name + " (" + fmtSize(f.size) + ") — ";
        var dl = document.createElement("a");
        dl.className = "dv-cell-dl";
        dl.href = fileUrl(code, f.name, false);
        dl.textContent = T("تحميل", "Download");
        cap.appendChild(dl);
      }
      cell.appendChild(cap);
      grid.appendChild(cell);
    });

    $("dv-download-all").hidden = locked;
    var dlHint = $("dv-dl-hint");
    if (dlHint) dlHint.hidden = locked;
    $("dv-download-all").onclick = function () {
      data.files.forEach(function (f, i) {
        setTimeout(function () {
          var a = document.createElement("a");
          a.href = fileUrl(code, f.name, false);
          a.download = f.name;
          document.body.appendChild(a);
          a.click();
          a.remove();
        }, i * 600);
      });
    };

    var invSec = $("dv-invoice");
    if (invSec) {
      invSec.hidden = !data.invoice_available;
      var ib = $("dv-invoice-btn");
      if (ib) ib.onclick = function () { makeInvoice(code); };
      var im = $("dv-invoice-msg"); if (im) im.hidden = true;
    }
    renderNotes(data.notes || []);
    tick(data.expires_at);
    show("room");
  }



  /* ---------- invoice (PDF built in the browser from delivery data) ---------- */
  var PAY = [
    ["InstaPay", "ipn.eg/S/moomadih.202/instapay/6M0zSZ"],
    ["Vodafone Cash", "01099033963"],
    ["Etisalat Cash", "01119072800"],
    ["WE Pay", "01515190759"]
  ];
  var stampImg = null;
  function loadStamp() {
    return new Promise(function (res) {
      if (stampImg) return res(stampImg);
      var im = new Image();
      im.onload = function () { stampImg = im; res(im); };
      im.onerror = function () { res(null); };
      im.src = "../images/5UPEZOA6.png";
    });
  }
  function drawStamp(x, cx, cy, img) {
    var R = 120, col = "#c2410c";
    x.save(); x.translate(cx, cy); x.rotate(-0.2); x.globalAlpha = 0.85;
    x.strokeStyle = col; x.lineWidth = 7; x.beginPath(); x.arc(0, 0, R, 0, Math.PI * 2); x.stroke();
    x.lineWidth = 2.5; x.beginPath(); x.arc(0, 0, R - 14, 0, Math.PI * 2); x.stroke();
    if (img) {
      x.globalCompositeOperation = "multiply";
      x.drawImage(img, 225, 245, 345, 300, -78, -78, 156, 135);
      x.globalCompositeOperation = "source-over";
    }
    x.direction = "ltr"; x.textAlign = "center"; x.fillStyle = col; x.font = "700 24px Alexandria, Arial, sans-serif";
    x.fillText("MO.MADII", 0, 82);
    x.font = "600 15px Alexandria, Arial, sans-serif"; x.fillText("DESIGN \u00B7 VIDEO", 0, -92);
    x.restore();
  }
  function invMsg(ar, en, bad) {
    var p = $("dv-invoice-msg"); if (!p) return;
    p.hidden = false; p.style.color = bad ? "#ffb1a3" : "";
    p.textContent = T(ar, en);
  }
  function jpegPdf(jpegBytes, w, h) {
    var enc = new TextEncoder(), parts = [], off = [], len = 0;
    function push(b) { if (typeof b === "string") b = enc.encode(b); parts.push(b); len += b.length; }
    function obj(n, body) { off[n] = len; push(n + " 0 obj\n"); push(body); push("\nendobj\n"); }
    push("%PDF-1.4\n");
    obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
    obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    obj(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>");
    off[4] = len; push("4 0 obj\n<< /Type /XObject /Subtype /Image /Width " + w + " /Height " + h + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jpegBytes.length + " >>\nstream\n"); push(jpegBytes); push("\nendstream\nendobj\n");
    var cs = "q 595.28 0 0 841.89 0 0 cm /Im0 Do Q";
    obj(5, "<< /Length " + cs.length + " >>\nstream\n" + cs + "\nendstream");
    var xref = len; push("xref\n0 6\n0000000000 65535 f \n");
    for (var i = 1; i <= 5; i++) push(String(off[i]).padStart(10, "0") + " 00000 n \n");
    push("trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF");
    var out = new Uint8Array(len), p = 0;
    parts.forEach(function (b) { out.set(b, p); p += b.length; });
    return new Blob([out], { type: "application/pdf" });
  }
  function drawInvoice(inv, stamp) {
    var en = isEn(), W = 1240, H = 1754, M = 90;
    var c = document.createElement("canvas"); c.width = W; c.height = H;
    var x = c.getContext("2d");
    x.fillStyle = "#ffffff"; x.fillRect(0, 0, W, H);
    var FONT = "Alexandria, 'Noto Sans Arabic', Arial, sans-serif";
    x.direction = en ? "ltr" : "rtl";
    var start = en ? M : W - M, end = en ? W - M : M;
    x.textAlign = en ? "left" : "right";
    function nf(n) { return Number(n).toLocaleString(en ? "en-US" : "ar-EG"); }
    function df(s) { return new Date(s).toLocaleDateString(en ? "en-GB" : "ar-EG", { year: "numeric", month: "long", day: "numeric" }); }
    function txt(s, X, Y, size, wt, col, al) {
      x.font = wt + " " + size + "px " + FONT; x.fillStyle = col;
      x.textAlign = al || (en ? "left" : "right"); x.fillText(s, X, Y);
    }
    var other = function (al) { return al === "left" ? "right" : "left"; };
    x.fillStyle = "#0b1b3d"; x.fillRect(0, 0, W, 250);
    x.fillStyle = "#f97316"; x.fillRect(0, 250, W, 8);
    txt(T("فاتورة", "INVOICE"), start, 150, 76, 700, "#ffffff");
    txt("Mo.Madii", end, 118, 44, 700, "#fb923c", en ? "right" : "left");
    txt(T("محمد مديح · مصمم جرافيك ومونتير", "Mohamad Madih · Graphic designer & video editor"), end, 168, 24, 400, "#cbd5e1", en ? "right" : "left");
    var y = 340, lab = "#64748b", ink = "#0b1b3d";
    function pair(l, v, Y, X, al) { txt(l, X, Y, 24, 400, lab, al); txt(v, X, Y + 42, 32, 600, ink, al); }
    pair(T("رقم الفاتورة", "Invoice no."), inv.invoice_no, y, start);
    pair(T("تاريخ الإصدار", "Issue date"), df(inv.issued_at), y, end, en ? "right" : "left");
    y += 130;
    pair(T("العميل", "Billed to"), inv.client, y, start);
    pair(T("تاريخ التسليم", "Delivery date"), df(inv.delivery_date), y, end, en ? "right" : "left");
    y += 130;
    (function () {
      var pj = inv.project || "", mw = W - 2 * M;
      x.font = "600 32px " + FONT;
      while (pj.length > 4 && x.measureText(pj).width > mw) pj = pj.slice(0, -2);
      if (pj !== inv.project) pj += "…";
      pair(T("المشروع", "Project"), pj, y, start);
    })();
    y += 150;
    x.fillStyle = "#f1f5f9"; x.fillRect(M, y, W - 2 * M, 70);
    txt(T("الخدمة", "Service"), start, y + 46, 26, 600, ink);
    txt(T("المبلغ (جنيه مصري)", "Amount (EGP)"), end, y + 46, 26, 600, ink, en ? "right" : "left");
    y += 70;
    var items = (inv.items && inv.items.length) ? inv.items : [{ name: inv.project, price: inv.amount }];
    x.font = "500 30px " + FONT;
    items.slice(0, 12).forEach(function (it) {
      var nm = (en && it.name_en) ? it.name_en : it.name, lines = [], cur = "";
      nm.split(" ").forEach(function (w) {
        var t = cur ? cur + " " + w : w;
        if (x.measureText(t).width > 700 && cur) { lines.push(cur); cur = w; } else cur = t;
      });
      if (cur) lines.push(cur);
      lines = lines.slice(0, 2);
      lines.forEach(function (l, i) { txt(l, start, y + 56 + i * 42, 30, 500, ink); });
      txt(nf(it.price), end, y + 56, 30, 600, it.price < 0 ? "#15803d" : ink, en ? "right" : "left");
      y += 30 + lines.length * 42 + 22;
      x.fillStyle = "#eef2f7"; x.fillRect(M, y, W - 2 * M, 2);
      y += 6;
    });
    y += 20;
    x.fillStyle = "#e2e8f0"; x.fillRect(M, y, W - 2 * M, 3);
    y += 90;
    txt(T("الإجمالي المستحق", "Total due"), start, y, 34, 600, ink);
    txt(nf(inv.amount) + " " + T("ج.م", "EGP"), end, y, 52, 700, "#c2410c", en ? "right" : "left");
    y += 120;
    var boxH = 110 + PAY.length * 52;
    x.fillStyle = "#fff7ed"; x.fillRect(M, y, W - 2 * M, boxH);
    txt(T("طرق الدفع", "Payment methods"), start + (en ? 30 : -30), y + 60, 30, 700, "#9a3412");
    PAY.forEach(function (p, i) {
      var yy = y + 120 + i * 52;
      txt(p[0], start + (en ? 30 : -30), yy, 26, 500, ink);
      x.direction = "ltr";
      txt(p[1], end + (en ? -30 : 30), yy, 26, 500, ink, en ? "right" : "left");
      x.direction = en ? "ltr" : "rtl";
    });
    y += boxH + 70;
    drawStamp(x, en ? W - M - 140 : M + 140, y + 30, stamp);
    y += 400;
    txt(T("للاستفسار: واتساب 01119072800", "Questions: WhatsApp 01119072800"), start, y, 26, 400, lab);
    txt(T("شكرًا لتعاملك معنا", "Thank you for your business"), start, y + 50, 26, 400, lab);
    return c;
  }
  function makeInvoice(code) {
    var btn = $("dv-invoice-btn"); btn.disabled = true;
    invMsg("بيجهّز الفاتورة…", "Preparing the invoice…", false);
    fetch(API + "/api/invoice?code=" + encodeURIComponent(code)).then(function (r) {
      if (r.status === 403) { invMsg("الفاتورة لسه مش جاهزة.", "The invoice is not ready yet.", true); return null; }
      if (r.status === 410) { show("expired"); return null; }
      if (r.status === 429) { invMsg("محاولات كتير. استنى شوية.", "Too many attempts. Wait a little.", true); return null; }
      if (!r.ok) throw new Error("bad");
      return r.json();
    }).then(function (inv) {
      if (!inv) return;
      return Promise.all([Promise.resolve(document.fonts && document.fonts.load("600 30px Alexandria", "فاتورة Invoice")).catch(function () {}), loadStamp()]).then(function (r) {
        var st = r[1];
        var cv = drawInvoice(inv, st);
        return new Promise(function (res) { cv.toBlob(res, "image/jpeg", 0.92); }).then(function (jb) { return jb.arrayBuffer(); }).then(function (ab) {
          var blob = jpegPdf(new Uint8Array(ab), cv.width, cv.height);
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob); a.download = inv.invoice_no + ".pdf";
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
          invMsg("الفاتورة اتحمّلت: " + inv.invoice_no, "Invoice downloaded: " + inv.invoice_no, false);
        });
      });
    }).catch(function () { invMsg("حصلت مشكلة. جرب تاني.", "Something went wrong. Try again.", true); })
      .finally(function () { btn.disabled = false; });
  }

  /* notes and revisions */
  var KIND_L = { note: ["ملاحظة", "Note"], revision: ["طلب تعديل", "Revision request"], approval: ["موافقة", "Approval"] };
  var notesCache = [];
  function renderNotes(list) {
    notesCache = list.slice();
    if (lastRoom) lastRoom.data.notes = notesCache;
    var box = $("dv-notes-list");
    box.innerHTML = "";
    notesCache.forEach(function (n) {
      var it = document.createElement("div");
      it.className = "dv-note-item";
      it.setAttribute("data-k", n.kind);
      var m = document.createElement("div");
      m.className = "dv-note-meta";
      var kl = KIND_L[n.kind] || KIND_L.note;
      m.textContent = T(kl[0], kl[1]) + (n.name ? " · " + n.name : "") + " · " +
        new Date(n.created_at).toLocaleString(isEn() ? "en-GB" : "ar-EG");
      var t = document.createElement("div");
      t.className = "dv-note-text";
      t.textContent = n.body;
      it.appendChild(m); it.appendChild(t);
      box.appendChild(it);
    });
  }
  function noteMsg(ar, en, bad) {
    var p = $("dv-note-msg");
    p.hidden = false;
    p.style.color = bad ? "#ffb1a3" : "";
    p.setAttribute("data-ar", ar); p.setAttribute("data-en-t", en);
    p.textContent = T(ar, en);
  }
  var noteForm = $("dv-notes-form");
  if (noteForm) noteForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!lastRoom) return;
    var body = $("dv-note-body").value.trim();
    var name = $("dv-note-name").value.trim();
    var kind = $("dv-note-kind").value;
    if (!body) { noteMsg("اكتب رسالتك الأول.", "Write your message first.", true); return; }
    var btn = $("dv-note-send");
    btn.disabled = true;
    fetch(API + "/api/note", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: lastRoom.code, kind: kind, name: name, body: body })
    }).then(function (r) {
      if (r.status === 410) { show("expired"); return null; }
      if (r.status === 429) { noteMsg("ملاحظات كتير. كلم محمد مباشرة.", "Too many notes. Contact Mohamad directly.", true); return null; }
      if (!r.ok) throw new Error("bad");
      return r.json();
    }).then(function (res) {
      if (!res) return;
      notesCache.push({ kind: res.kind, name: res.name, body: res.body, created_at: res.created_at });
      renderNotes(notesCache);
      $("dv-note-body").value = "";
      noteMsg("اتبعتت. شكرًا، محمد هيشوفها.", "Sent. Thank you, Mohamad will see it.", false);
      try {
        fetch("https://formsubmit.co/ajax/mohamad.madih.20@gmail.com", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            _subject: "ملاحظة جديدة على تسليمة: " + res.project,
            _template: "table",
            _captcha: "false",
            "العميل": res.client,
            "المشروع": res.project,
            "النوع": (KIND_L[res.kind] || KIND_L.note)[0],
            "الاسم": res.name || "-",
            "الرسالة": res.body
          })
        }).catch(function () {});
      } catch (x) {}
    }).catch(function () {
      noteMsg("حصلت مشكلة في الإرسال. جرب تاني.", "Could not send. Try again.", true);
    }).finally(function () { btn.disabled = false; });
  });

  function openCode(code) {
    errBox.hidden = true;
    if (!code.trim()) {
      entryError("اكتب الكود الأول.");
      return;
    }
    var btn = $("dv-open");
    btn.disabled = true;
    fetch(API + "/api/room?code=" + encodeURIComponent(code.trim()))
      .then(function (r) {
        if (r.status === 404) { show("wrong"); return null; }
        if (r.status === 410) { show("expired"); return null; }
        if (r.status === 429) {
          show("entry");
          entryError("محاولات كتير غلط. استنى شوية وجرب تاني.");
          return null;
        }
        if (!r.ok) throw new Error("bad");
        return r.json();
      })
      .then(function (data) { if (data) renderRoom(code.trim(), data); })
      .catch(function () {
        entryError("في مشكلة في الاتصال. جرب تاني بعد شوية.");
      })
      .finally(function () { btn.disabled = false; });
  }

  function backToEntry() { show("entry"); codeInput.focus(); }

  $("dv-open").addEventListener("click", function () { openCode(codeInput.value); });
  codeInput.addEventListener("keydown", function (e) { if (e.key === "Enter") openCode(codeInput.value); });
  $("dv-retry").addEventListener("click", backToEntry);
  $("dv-another").addEventListener("click", backToEntry);
  $("dv-expired-back").addEventListener("click", function () { location.href = "../"; });
  $("dv-wrong-home").addEventListener("click", function () { location.href = "../"; });

  var params = new URLSearchParams(location.search);
  var pre = params.get("code");
  if (pre) {
    codeInput.value = pre;
    openCode(pre);
  }
  /* language toggle */
  var statics = [].slice.call(document.querySelectorAll("[data-en]"));
  statics.forEach(function (e) { e._ar = e.tagName === "TITLE" ? e.textContent : e.innerHTML; });
  var langBtn = $("dv-lang");
  function applyLang(l) {
    var en = l === "en";
    document.documentElement.lang = l;
    document.documentElement.dir = en ? "ltr" : "rtl";
    statics.forEach(function (e) {
      var v = en ? e.getAttribute("data-en") : e._ar;
      if (e.tagName === "TITLE") e.textContent = v; else e.innerHTML = v;
    });
    codeInput.placeholder = "XXXXX-XXXXX-XXXXX-XXXXX-XXXXX";
    if (langBtn) langBtn.textContent = en ? "AR" : "EN";
    $("dv-lb-close").setAttribute("aria-label", en ? "Close preview" : "قفل المعاينة");
    var nm = $("dv-note-msg");
    if (nm && !nm.hidden && nm.getAttribute("data-ar")) nm.textContent = en ? nm.getAttribute("data-en-t") : nm.getAttribute("data-ar");
    if (lastErr && !errBox.hidden) errText.textContent = en ? (EN_ERR[lastErr] || lastErr) : lastErr;
    if (lastRoom && !room.hidden) {
      var sv = banner ? banner.hidden : true;
      var cd = countdownTimer; if (cd) { clearInterval(cd); countdownTimer = null; }
      renderRoom(lastRoom.code, lastRoom.data);
    }
    try { localStorage.setItem(KEY, l); } catch (x) {}
  }
  if (langBtn) langBtn.addEventListener("click", function () { applyLang(isEn() ? "ar" : "en"); });
  try { if (localStorage.getItem(KEY) === "en") applyLang("en"); } catch (x) {}
  /* in-page image preview */
  function openPreview(url, name) {
    var lb = $("dv-lightbox"); if (!lb) return;
    $("dv-lb-img").src = url;
    $("dv-lb-img").alt = name;
    $("dv-lb-cap").textContent = name;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closePreview() {
    var lb = $("dv-lightbox"); if (!lb || lb.hidden) return;
    lb.hidden = true;
    $("dv-lb-img").removeAttribute("src");
    document.body.style.overflow = "";
  }
  (function () {
    var lbEl = $("dv-lightbox");
    if (!lbEl) return;
    $("dv-lb-close").addEventListener("click", closePreview);
    $("dv-lb-img").addEventListener("click", closePreview);
    lbEl.addEventListener("click", function (e) { if (e.target === lbEl) closePreview(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closePreview(); });
  })();
})();

