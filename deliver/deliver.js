/* استلام الأعمال — client delivery page */
(function () {
  "use strict";

  // Set to the deployed Worker URL at launch (same pattern as the likes worker).
  var API = "https://portfolio-deliver.mohamad-madih-20.workers.dev";

  var $ = function (id) { return document.getElementById(id); };
  var entry = $("dv-entry"), room = $("dv-room"), expired = $("dv-expired"), wrong = $("dv-wrong");
  var codeInput = $("dv-code"), errBox = $("dv-entry-err"), errText = $("dv-entry-err-text");
  var countdownTimer = null;

  function show(which) {
    entry.hidden = which !== "entry";
    room.hidden = which !== "room";
    expired.hidden = which !== "expired";
    wrong.hidden = which !== "wrong";
    if (which !== "room" && countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
  }

  function entryError(msg) {
    errText.textContent = msg;
    errBox.hidden = false;
  }

  function fmtSize(bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " ميجا";
    if (bytes >= 1024) return Math.round(bytes / 1024) + " كيلو";
    return bytes + " بايت";
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

  function fileUrl(code, name, inline) {
    return API + "/api/file?code=" + encodeURIComponent(code) +
      "&name=" + encodeURIComponent(name) + (inline ? "&inline=1" : "");
  }

  function renderRoom(code, data) {
    $("dv-project").textContent = data.project;
    $("dv-client").textContent = "تسليمة خاصة بـ " + data.client;
    $("dv-explain").textContent = data.explanation;

    var facts = $("dv-facts");
    facts.innerHTML = "";
    [
      ["العميل", data.client],
      ["المحتوى", data.files.length + (data.files.length === 1 ? " ملف" : " ملفات") + " — نسخ أصلية"],
      ["إنشاء التسليمة", new Date(data.created_at).toLocaleString("ar-EG")],
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
        var badge = document.createElement("a");
        badge.className = "dv-pdf";
        badge.href = fileUrl(code, f.name, true);
        badge.target = "_blank";
        badge.rel = "noopener";
        badge.textContent = "PDF";
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
      cap.textContent = f.name + " (" + fmtSize(f.size) + ") — ";
      var dl = document.createElement("a");
      dl.className = "dv-cell-dl";
      dl.href = fileUrl(code, f.name, false);
      dl.textContent = "تحميل";
      cap.appendChild(dl);
      cell.appendChild(cap);
      grid.appendChild(cell);
    });

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
})();

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
