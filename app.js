/* Bayou City Mobile Mechanic — drum engine */
(function () {
  "use strict";

  var SERVICES = [
    { n: "01", t: "Mobile Oil & Filter Change", c: "service", p: "from $89", d: "Full synthetic oil, new filter, 20-point walkaround and a top-off of every fluid under the hood.", tag: "Service" },
    { n: "02", t: "Brake Pads & Rotors", c: "repair", p: "from $189", d: "Front or rear axle pads and rotors replaced at your parking spot, with a road test before we leave.", tag: "Repair" },
    { n: "03", t: "Battery Test & Replacement", c: "service", p: "from $129", d: "Load test on the spot, new battery fitted, terminals cleaned and the charging system checked.", tag: "Service" },
    { n: "04", t: "Diagnostic Scan", c: "inspect", p: "from $79", d: "OBD-II scan with a plain-English read-out of the codes and a written next-steps note.", tag: "Inspect" },
    { n: "05", t: "Pre-Purchase Inspection", c: "inspect", p: "from $149", d: "120-point check before you buy, with a photo report of anything that needs money spent.", tag: "Inspect" },
    { n: "06", t: "Starter & Alternator", c: "repair", p: "from $249", d: "Test, remove and refit of the starter or alternator. Parts quoted separately before we begin.", tag: "Repair" }
  ];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- boot failsafe ---------- */
  var boot = $("#boot");
  if (boot) {
    setTimeout(function () { if (boot && boot.parentNode) boot.parentNode.removeChild(boot); }, 2600);
  }

  /* ---------- 3D drum ---------- */
  var stage = $("#stage");
  var drum = $("#drum");
  var idxEl = $("#cardIdx");
  var totEl = $("#cardTot");
  var visible = SERVICES.slice();
  var index = 0;
  var cards = [];

  function build() {
    drum.innerHTML = "";
    cards = visible.map(function (s) {
      var el = document.createElement("article");
      el.className = "dcard";
      el.innerHTML =
        '<div class="dcard-top"><span class="dcard-num">' + s.n + '</span>' +
        '<span class="dcard-tag">' + s.tag + '</span></div>' +
        "<h3>" + s.t + "</h3>" +
        '<p class="dcard-price">Starting <span>' + s.p.replace("from ", "") + "</span></p>";
      el.addEventListener("click", function () {
        var i = visible.indexOf(s);
        if (i > -1 && i !== index) { index = i; draw(); }
      });
      drum.appendChild(el);
      return el;
    });
    if (idxEl) idxEl.textContent = visible.length ? "01" : "00";
    if (totEl) totEl.textContent = visible.length < 10 ? "0" + visible.length : "" + visible.length;
    paint();
  }

  function paint() {
    if (!cards.length) return;
    var step = 360 / cards.length;
    var w = stage.clientWidth || 600;
    var radius = Math.max(230, Math.min(w * 0.42, 330));
    cards.forEach(function (el, i) {
      el.style.transform = "rotateY(" + (i * step) + "deg) translateZ(" + radius + "px)";
      el.style.opacity = "";
      el.classList.remove("is-active");
    });
    drum.style.transform = "translateZ(" + (-radius) + "px) rotateY(" + (-index * step) + "deg)";
    var active = cards[index];
    if (active) { active.classList.add("is-active"); active.style.opacity = "1"; }
    cards.forEach(function (el, i) {
      var o = Math.abs(i - index);
      if (o === 1) el.style.opacity = ".55";
      else if (o > 1) el.style.opacity = ".28";
    });
    if (idxEl) idxEl.textContent = ("0" + (index + 1)).slice(-2);
    detail(visible[index]);
  }

  function detail(s) {
    if (!s) return;
    var t = $("#cdTitle"), d = $("#cdDesc"), p = $("#cdPrice"), g = $("#cdTag");
    if (g) g.textContent = s.tag.toUpperCase();
    if (t) t.textContent = s.t;
    if (d) d.textContent = s.d;
    if (p) p.textContent = s.p;
  }

  function move(delta) {
    if (!cards.length) return;
    index = (index + delta + cards.length) % cards.length;
    paint();
  }

  if (drum) {
    build();
    window.addEventListener("resize", function () { paint(); });
    var prev = $("#prev"), next = $("#next");
    if (prev) prev.addEventListener("click", function () { move(-1); });
    if (next) next.addEventListener("click", function () { move(1); });

    var downX = null, downY = null;
    stage.addEventListener("pointerdown", function (e) {
      downX = e.clientX; downY = e.clientY; stage.classList.add("is-drag");
    });
    stage.addEventListener("pointerup", function (e) {
      stage.classList.remove("is-drag");
      if (downX === null) return;
      var dx = e.clientX - downX, dy = e.clientY - downY;
      downX = null;
      if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
    });
    stage.addEventListener("pointercancel", function () { downX = null; stage.classList.remove("is-drag"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    });
  }

  $$(".filters .pill").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".filters .pill").forEach(function (x) { x.classList.remove("is-on"); });
      b.classList.add("is-on");
      var f = b.getAttribute("data-filter");
      visible = f === "all" ? SERVICES.slice() : SERVICES.filter(function (s) { return s.c === f; });
      index = 0;
      build();
    });
  });

  /* ---------- configurator ---------- */
  var state = { vehicle: 0, vehicleName: "Sedan / coupe", job: 89, jobName: "Oil & filter change", timing: 0, timingName: "Scheduled" };

  function money(n) { return "$" + n; }

  function renderConfig() {
    var total = state.job + state.vehicle + state.timing;
    var t = $("#cfgTotal"), j = $("#cfgJob"), g = $("#gaugeFill"), o = $("#outLines");
    if (t) t.textContent = total;
    if (j) j.textContent = state.jobName;
    if (g) g.style.width = Math.max(8, Math.min(100, (total / 400) * 100)) + "%";
    if (o) {
      o.innerHTML =
        "<li><span>" + state.jobName + "</span><span>" + money(state.job) + "</span></li>" +
        "<li><span>" + state.vehicleName + "</span><span>" + (state.vehicle ? "+" + money(state.vehicle) : "included") + "</span></li>" +
        "<li><span>" + state.timingName + " visit</span><span>" + (state.timing ? "+" + money(state.timing) : "included") + "</span></li>";
    }
    var n = $("#needle");
    if (n) {
      var deg = -66 + Math.min(1, (total - 79) / 320) * 132;
      n.style.transform = "translate(-50%,-100%) rotate(" + deg + "deg)";
    }
    var dl = $("#drawerTotal"), dj = $("#drawerJob"), dlines = $("#drawerLines");
    if (dl) dl.textContent = total;
    if (dj) dj.textContent = state.jobName;
    if (dlines) dlines.innerHTML = o ? o.innerHTML : "";
    var sms = $("#drawerSms");
    if (sms) {
      var body = "Hi Bayou City Mobile Mechanic — " + state.jobName + " on my " + state.vehicleName.toLowerCase() +
        " (" + state.timingName.toLowerCase() + "). Estimate shown: $" + total + ". I'm in Houston at: ";
      sms.setAttribute("href", "sms:+17138245093?&body=" + encodeURIComponent(body));
    }
  }

  $$(".pills").forEach(function (group) {
    var key = group.getAttribute("data-group");
    $$(".pill", group).forEach(function (b) {
      b.addEventListener("click", function () {
        $$(".pill", group).forEach(function (x) { x.classList.remove("is-on"); });
        b.classList.add("is-on");
        if (key === "job") {
          state.job = parseInt(b.getAttribute("data-base"), 10);
          state.jobName = b.getAttribute("data-label") || b.textContent;
        } else {
          state[key] = parseInt(b.getAttribute("data-add"), 10);
          state[key + "Name"] = b.textContent;
        }
        renderConfig();
      });
    });
  });
  renderConfig();

  /* ---------- hours today ---------- */
  (function () {
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var today;
    try {
      today = new Intl.DateTimeFormat("en-US", { weekday: "short", timeZone: "America/Chicago" }).format(new Date());
    } catch (err) {
      today = days[new Date().getDay()];
    }
    $$("#hours li").forEach(function (li) {
      if (li.getAttribute("data-day") === today) li.classList.add("is-today");
    });
    var slot = $("#dialSlot");
    if (slot && (today === "Sun")) slot.textContent = "Call-out";
  })();

  /* ---------- drawer ---------- */
  var drawer = $("#drawer"), scrim = $("#scrim");
  function open() {
    if (!drawer) return;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    if (scrim) scrim.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function close() {
    if (!drawer) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    if (scrim) scrim.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  $$("[data-open]").forEach(function (b) { b.addEventListener("click", open); });
  var x = $("#drawerClose");
  if (x) x.addEventListener("click", close);
  if (scrim) scrim.addEventListener("click", close);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
})();
