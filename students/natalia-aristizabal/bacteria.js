/* Bacteria in the background — Natalia Aristizabal
   Rod-shaped bacteria with beating flagella swim behind the page.
   Click or tap the page (not a link or card) to drop a nutrient: the bacteria find it by
   run-and-tumble chemotaxis (they tumble less often while the nutrient
   concentration is rising), feed, and divide.
   Pausable, respects prefers-reduced-motion, and stops when the tab is hidden. */
(function () {
  "use strict";
  var canvas = document.createElement("canvas");
  canvas.id = "bact-bg";
  canvas.setAttribute("aria-hidden", "true");
  document.body.insertBefore(canvas, document.body.firstChild);
  if (!canvas.getContext) return;
  var ctx = canvas.getContext("2d");

  var bar = document.createElement("div");
  bar.id = "bact-bar";
  bar.innerHTML = '<span>Click the page to feed the bacteria</span><button type="button" id="bact-toggle" aria-pressed="false">Pause</button>';
  document.body.appendChild(bar);
  var toggle = document.getElementById("bact-toggle");

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var COLORS = ["#E07A6E", "#3FAF8F", "#E3B23C", "#8E7FD6", "#5AA2E6"];
  var MAX_FOOD = 4;
  var W = 0, H = 0, dpr = 1, START = 14, MAX = 40;
  var bacteria = [], food = [];
  var running = false, paused = reduce, last = 0;

  function rand(a, b) { return a + Math.random() * (b - a); }

  function makeBacterium(x, y, angle, color) {
    return {
      x: x, y: y,
      a: angle === undefined ? rand(0, Math.PI * 2) : angle,
      len: rand(22, 30), wid: rand(9, 11), speed: rand(20, 30),
      phase: rand(0, Math.PI * 2),
      color: color || COLORS[(Math.random() * COLORS.length) | 0],
      energy: rand(0, 0.3), lastC: 0, tumble: 0
    };
  }

  function populate() {
    START = Math.max(8, Math.min(16, Math.round((W * H) / 60000)));
    MAX = START * 3;
    bacteria = []; food = [];
    for (var i = 0; i < START; i++) bacteria.push(makeBacterium(rand(20, W - 20), rand(20, H - 20)));
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!bacteria.length) populate();
    bacteria.forEach(function (b) { b.x = Math.min(Math.max(b.x, 14), W - 14); b.y = Math.min(Math.max(b.y, 14), H - 14); });
    draw();
  }

  function concentration(x, y) {
    var c = 0;
    for (var i = 0; i < food.length; i++) {
      var f = food[i], dx = x - f.x, dy = y - f.y;
      c += f.amount * Math.exp(-(dx * dx + dy * dy) / (2 * f.spread * f.spread));
    }
    return c;
  }

  function step(dt) {
    var i, b;
    for (i = 0; i < bacteria.length; i++) {
      b = bacteria[i];
      var c = concentration(b.x, b.y);
      var dc = c - b.lastC; b.lastC = c;
      // Run-and-tumble: keep running while things get better, tumble sooner when they get worse.
      var rate = food.length ? (dc > 0 ? 0.08 : 1.8) : 0.5;
      if (b.tumble > 0) {
        b.tumble -= dt;
        b.a += rand(-1, 1) * 7 * dt;
      } else if (Math.random() < rate * dt) {
        b.tumble = rand(0.15, 0.35);
      } else {
        b.a += rand(-1, 1) * 0.8 * dt;
        // Gentle bias toward the richest nearby drop, so the response is easy to see.
        var best = null, bestC = 0;
        for (var q = 0; q < food.length; q++) {
          var d = Math.hypot(food[q].x - b.x, food[q].y - b.y);
          var cq = food[q].amount / (1 + d / 120);
          if (d < 700 && cq > bestC) { bestC = cq; best = food[q]; }
        }
        if (best) {
          var want = Math.atan2(best.y - b.y, best.x - b.x);
          var diff = Math.atan2(Math.sin(want - b.a), Math.cos(want - b.a));
          b.a += Math.max(-1, Math.min(1, diff)) * 1.1 * dt;
        }
        var v = b.speed * (food.length ? 2 : 1) * dt;
        b.x += Math.cos(b.a) * v; b.y += Math.sin(b.a) * v;
      }
      var m = 14;
      if (b.x < m) { b.x = m; b.a = Math.PI - b.a; }
      if (b.x > W - m) { b.x = W - m; b.a = Math.PI - b.a; }
      if (b.y < m) { b.y = m; b.a = -b.a; }
      if (b.y > H - m) { b.y = H - m; b.a = -b.a; }
      if (c > 0.05) {
        var bite = Math.min(c, 1) * 0.35 * dt;
        b.energy += bite;
        for (var j = 0; j < food.length; j++) {
          if (Math.hypot(b.x - food[j].x, b.y - food[j].y) < food[j].spread) food[j].amount -= bite * 0.12;
        }
      }
      b.phase += dt * (b.tumble > 0 ? 10 : 20);
    }
    var born = [];
    for (i = 0; i < bacteria.length; i++) {
      b = bacteria[i];
      if (b.energy >= 1) {
        if (bacteria.length + born.length < MAX) {
          b.energy = 0;
          var child = makeBacterium(b.x - Math.cos(b.a) * b.len * 0.6, b.y - Math.sin(b.a) * b.len * 0.6,
                                    b.a + Math.PI + rand(-0.6, 0.6), b.color);
          child.len = b.len; child.wid = b.wid;
          born.push(child);
        } else {
          b.energy = 1;
        }
      }
    }
    for (i = 0; i < born.length; i++) bacteria.push(born[i]);
    food = food.filter(function (f) { f.amount -= dt * 0.04; f.age += dt; return f.amount > 0.02; });
  }

  function capsule(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arc(x + w - r, y + r, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(x + r, y + h);
    ctx.arc(x + r, y + r, r, Math.PI / 2, Math.PI * 1.5);
    ctx.closePath();
  }

  function drawBacterium(b) {
    var L = b.len, R = b.wid / 2;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.a);
    ctx.strokeStyle = b.color; ctx.lineWidth = 1.3; ctx.lineCap = "round";
    for (var k = 0; k < 3; k++) {
      var off = (k - 1) * R * 0.45;
      ctx.beginPath();
      for (var s = 0; s <= 24; s++) {
        var t = s / 24;
        var fx = -L / 2 + 1 - t * L * 1.3;
        var fy = off * (1 - t * 0.5) + Math.sin(t * Math.PI * 3 - b.phase + k * 0.8) * R * 0.6 * (0.25 + t);
        if (s === 0) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy);
      }
      ctx.stroke();
    }
    ctx.fillStyle = b.color;
    capsule(-L / 2, -R, L, 2 * R, R);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    capsule(-L / 2 + R * 0.6, -R * 0.6, L - R * 1.4, R * 0.45, R * 0.22);
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < food.length; i++) {
      var f = food[i], rad = f.spread * 1.4;
      var fg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, rad);
      fg.addColorStop(0, "rgba(240,190,60," + (0.35 * Math.min(f.amount, 1)).toFixed(3) + ")");
      fg.addColorStop(1, "rgba(240,190,60,0)");
      ctx.fillStyle = fg;
      ctx.beginPath(); ctx.arc(f.x, f.y, rad, 0, Math.PI * 2); ctx.fill();
      var pop = Math.min(f.age * 4, 1);
      ctx.fillStyle = "rgba(227,178,60," + (0.8 * Math.min(f.amount, 1)).toFixed(3) + ")";
      ctx.beginPath(); ctx.arc(f.x, f.y, 3 + 3 * pop, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 0.32;
    for (i = 0; i < bacteria.length; i++) drawBacterium(bacteria[i]);
    ctx.globalAlpha = 1;
  }

  function frame(t) {
    if (!running) return;
    var dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    step(dt); draw();
    window.requestAnimationFrame(frame);
  }
  function start() {
    if (running || paused || document.hidden) return;
    running = true; last = performance.now();
    window.requestAnimationFrame(frame);
  }
  function stop() { running = false; }

  function setPaused(p) {
    paused = p;
    toggle.textContent = p ? "Play" : "Pause";
    toggle.setAttribute("aria-pressed", p ? "true" : "false");
    if (p) stop(); else start();
  }

  function addFood(x, y) {
    food.push({ x: x, y: y, amount: 1, spread: rand(70, 95), age: 0 });
    if (food.length > MAX_FOOD) food.shift();
    if (paused) { for (var i = 0; i < 240; i++) step(1 / 60); draw(); }
  }

  // Feed anywhere on the page except links, buttons, cards, the photo and the top bar.
  var SKIP = "a, button, input, textarea, select, label, .card, .photo-card, .rail-link, header, nav, #bact-bar";
  document.addEventListener("pointerdown", function (e) {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target.closest && e.target.closest(SKIP)) return;
    addFood(e.clientX, e.clientY);
  });
  toggle.addEventListener("click", function () { setPaused(!paused); });

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });

  resize();
  if (reduce) setPaused(true); else start();
})();
