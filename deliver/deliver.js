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

    tick(data.expires_at);
    show("room");
  }

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
