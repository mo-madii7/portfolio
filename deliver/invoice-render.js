/* Shared invoice / quote renderer (generated from the delivery-page drawing code). */
(function () {
  "use strict";
  var LANG = "ar";
  function isEn() { return LANG === "en"; }
  function T(a, e) { return isEn() ? e : a; }
  var PAY = [
    ["InstaPay", "ipn.eg/S/moomadih.202/instapay/6M0zSZ"],
    ["Vodafone Cash", "01099033963"],
    ["Etisalat Cash", "01119072800"],
    ["WE Pay", "01515190759"]
  ];
  var STAMP_URL = (function () { try { var cs = document.currentScript; return new URL("../images/5UPEZOA6.png", cs.src).href; } catch (e) { return "../images/5UPEZOA6.png"; } })();
  var stampImg = null;
  function loadStamp() {
    return new Promise(function (res) {
      if (stampImg) return res(stampImg);
      var im = new Image();
      im.onload = function () { stampImg = im; res(im); };
      im.onerror = function () { res(null); };
      im.src = STAMP_URL;
    });
  }
  var stampCache = null;
  function inkStamp(img) {
    if (stampCache) return stampCache;
    var sw = 350, sh = 290, k = 2, w = sw * k, h = sh * k;
    var o = document.createElement("canvas"); o.width = w; o.height = h;
    var g = o.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, w, h);
    g.drawImage(img, 225, 255, sw, sh, 0, 0, w, h);
    var d = g.getImageData(0, 0, w, h), p = d.data, s = 7;
    function rnd() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }
    var gw = 16, gh = 14, grid = [], i, j;
    for (i = 0; i < gw * gh; i++) grid.push(rnd());
    function blot(px, py) {
      var fx = px / w * (gw - 1), fy = py / h * (gh - 1), ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
      var a = grid[iy * gw + ix], b = grid[iy * gw + Math.min(ix + 1, gw - 1)], c = grid[Math.min(iy + 1, gh - 1) * gw + ix], e = grid[Math.min(iy + 1, gh - 1) * gw + Math.min(ix + 1, gw - 1)];
      return (a * (1 - tx) + b * tx) * (1 - ty) + (c * (1 - tx) + e * tx) * ty;
    }
    for (j = 0; j < h; j++) for (i = 0; i < w; i++) {
      var n = (j * w + i) * 4, r = p[n], gg = p[n + 1], b2 = p[n + 2], mn = Math.min(r, gg, b2);
      var a0 = Math.max(0, Math.min(1, (238 - mn) / 40));
      var yellow = r > 200 && b2 < 140 && gg > 150;
      if (yellow) { p[n] = 28; p[n + 1] = 58; p[n + 2] = 160; } else { p[n] = 18; p[n + 1] = 40; p[n + 2] = 130; }
      var t = 0.72 + 0.28 * blot(i, j); if (yellow && (i - 570) * (i - 570) + (j - 440) * (j - 440) < 3000) t *= 0.3;
      var f = rnd(), grain = f < 0.06 ? 0.15 : 0.85 + 0.15 * f;
      p[n + 3] = Math.round(255 * a0 * t * grain);
    }
    g.putImageData(d, 0, 0);
    stampCache = o; return o;
  }
  function drawStamp(x, cx, cy, img) {
    if (!img) return;
    var o = inkStamp(img);
    x.save(); x.translate(cx, cy); x.rotate(-0.2); x.globalAlpha = 0.9;
    x.drawImage(o, -115, -80, 230, 190);
    x.restore();
  }
  function jpegPdf(jpegBytes, w, h) {
    var enc = new TextEncoder(), parts = [], off = [], len = 0;
    function push(b) { if (typeof b === "string") b = enc.encode(b); parts.push(b); len += b.length; }
    function obj(n, body) { off[n] = len; push(n + " 0 obj\n"); push(body); push("\nendobj\n"); }
    push("%PDF-1.4\n");
    obj(1, "<< /Type /Catalog /Pages 2 0 R >>");
    obj(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
    obj(3, "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 " + (595.28 * h / w).toFixed(2) + "] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>");
    off[4] = len; push("4 0 obj\n<< /Type /XObject /Subtype /Image /Width " + w + " /Height " + h + " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jpegBytes.length + " >>\nstream\n"); push(jpegBytes); push("\nendstream\nendobj\n");
    var cs = "q 595.28 0 0 " + (595.28 * h / w).toFixed(2) + " 0 0 cm /Im0 Do Q";
    obj(5, "<< /Length " + cs.length + " >>\nstream\n" + cs + "\nendstream");
    var xref = len; push("xref\n0 6\n0000000000 65535 f \n");
    for (var i = 1; i <= 5; i++) push(String(off[i]).padStart(10, "0") + " 00000 n \n");
    push("trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF");
    var out = new Uint8Array(len), p = 0;
    parts.forEach(function (b) { out.set(b, p); p += b.length; });
    return new Blob([out], { type: "application/pdf" });
  }
  function drawInvoice(inv, stamp, H) {
    var en = isEn(), W = 1240, M = 90, quote = inv.kind === "quote"; H = H || 1754;
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
    txt(quote ? T("عرض سعر", "QUOTATION") : T("فاتورة", "INVOICE"), start, 150, 76, 700, "#ffffff");
    txt("Mo.Madii7", end, 118, 44, 700, "#fb923c", en ? "right" : "left");
    txt(T("محمد مديح · مصمم جرافيك ومونتير", "Mohamad Madih · Graphic designer & video editor"), end, 168, 24, 400, "#cbd5e1", en ? "right" : "left");
    var y = 340, lab = "#64748b", ink = "#0b1b3d";
    function pair(l, v, Y, X, al) { txt(l, X, Y, 24, 400, lab, al); txt(v, X, Y + 42, 32, 600, ink, al); }
    pair(quote ? T("رقم العرض", "Quote no.") : T("رقم الفاتورة", "Invoice no."), (inv.invoice_code && !quote ? inv.invoice_no + "-" + inv.invoice_code : inv.invoice_no), y, start);
    pair(quote ? T("تاريخ العرض", "Quote date") : T("تاريخ الإصدار", "Issue date"), df(inv.issued_at), y, end, en ? "right" : "left");
    y += 130;
    pair(T("العميل", "Billed to"), inv.client, y, start);
    if (quote) pair(T("صالح حتى", "Valid until"), df(new Date(new Date(inv.issued_at).getTime() + 14 * 86400000)), y, end, en ? "right" : "left");
    else if (inv.delivery_date) pair(T("تاريخ التسليم", "Delivery date"), df(inv.delivery_date), y, end, en ? "right" : "left");
    y += 130;
    if (inv.project) (function () {
      var pj = inv.project || "", mw = (quote && inv.delivery_date) ? (W - 2 * M) * 0.58 : W - 2 * M;
      x.font = "600 32px " + FONT;
      while (pj.length > 4 && x.measureText(pj).width > mw) pj = pj.slice(0, -2);
      if (pj !== inv.project) pj += "…";
      pair(T("المشروع", "Project"), pj, y, start);
    })();
    if (quote && inv.delivery_date) { pair(T("تاريخ التسليم", "Delivery date"), df(inv.delivery_date), y, end, en ? "right" : "left"); if (!inv.project) y += 110; }
    y += inv.project ? 150 : 40;
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
      lines.forEach(function (l, i) { txt(l, start, y + 46 + i * 40, 30, 500, ink); });
      x.direction = "ltr"; txt((it.price < 0 ? "\u2212" : "") + nf(Math.abs(it.price)), end, y + 46, 30, 600, it.price < 0 ? "#15803d" : ink, en ? "right" : "left"); x.direction = en ? "ltr" : "rtl";
      y += 20 + lines.length * 40 + 14;
      x.fillStyle = "#eef2f7"; x.fillRect(M, y, W - 2 * M, 2);
      y += 6;
    });
    y += 20;
    x.fillStyle = "#e2e8f0"; x.fillRect(M, y, W - 2 * M, 3);
    y += 66;
    txt(quote ? T("الإجمالي", "Total") : T("الإجمالي المستحق", "Total due"), start, y, 34, 600, ink);
    txt(nf(inv.amount) + " " + T("ج.م", "EGP"), end, y, 52, 700, "#c2410c", en ? "right" : "left");
    y += 80;
    if (quote) {
      x.fillStyle = "#f1f5f9"; x.fillRect(M, y, W - 2 * M, 130);
      txt(T("هذا عرض سعر وليس فاتورة.", "This is a quotation, not an invoice."), start + (en ? 30 : -30), y + 52, 26, 600, ink);
      txt(T("الأسعار للبنود المذكورة فقط وصالحة لمدة ١٤ يومًا من تاريخ العرض.", "Prices apply to the listed items only and are valid for 14 days from the quote date."), start + (en ? 30 : -30), y + 98, 22, 400, lab);
      y += 130 + 70;
    } else {
      var boxH = 100 + PAY.length * 44;
      x.fillStyle = "#fff7ed"; x.fillRect(M, y, W - 2 * M, boxH);
      txt(T("طرق الدفع", "Payment methods"), start + (en ? 30 : -30), y + 60, 30, 700, "#9a3412");
      PAY.forEach(function (p, i) {
        var yy = y + 108 + i * 44;
        txt(p[0], start + (en ? 30 : -30), yy, 26, 500, ink);
        x.direction = "ltr";
        txt(p[1], end + (en ? -30 : 30), yy, 26, 500, ink, en ? "right" : "left");
        x.direction = en ? "ltr" : "rtl";
      });
      y += boxH + 50;
    }
    drawStamp(x, en ? W - M - 140 : M + 140, y + 85, stamp);
    txt(T("للاستفسار: واتساب 01119072800", "Questions: WhatsApp 01119072800"), start, y, 26, 400, lab);
    txt(T("شكرًا لتعاملك معنا", "Thank you for your business"), start, y + 50, 26, 400, lab);
    c._end = y + 190;
    return c;
  }

  window.MMInv = {
    render: function (inv, lang) {
      LANG = lang === "en" ? "en" : "ar";
      return Promise.all([Promise.resolve(document.fonts && document.fonts.load("600 30px Alexandria", "فاتورة Invoice")).catch(function () {}), loadStamp()]).then(function (r) {
        var st = r[1];
        var dry = drawInvoice(inv, st, 6000);
        var cv = drawInvoice(inv, st, Math.max(1754, dry._end));
        return new Promise(function (res) { cv.toBlob(res, "image/jpeg", 0.92); }).then(function (jb) { return jb.arrayBuffer(); }).then(function (ab) {
          return { blob: jpegPdf(new Uint8Array(ab), cv.width, cv.height), canvas: cv };
        });
      });
    }
  };
})();
