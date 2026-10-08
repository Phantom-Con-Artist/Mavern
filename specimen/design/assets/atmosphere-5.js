/* Mavern specimen 05 — hand-drawn shimmer, falling petals and floating light. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* the ink line never sits still: step the displacement seed about 8 times a second */
  const noise = document.getElementById("wobble-noise");
  if (!reduce && noise) {
    let seed = 3;
    setInterval(() => noise.setAttribute("seed", (seed = (seed % 40) + 1)), 125);
  }

  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  let W = 0, H = 0;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = canvas.clientWidth; H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const rand = (a, b) => a + Math.random() * (b - a);
  const petalCount = () => Math.round(Math.min(46, Math.max(16, W / 34)));
  const moteCount = () => Math.round(Math.min(70, Math.max(24, W / 22)));

  const makePetal = (anywhere) => ({
    x: anywhere ? rand(0, W) : rand(W * .3, W * 1.2),
    y: anywhere ? rand(-20, H) : rand(-60, -10),
    s: rand(4, 11), vy: rand(14, 34), vx: rand(-26, -8),
    rot: rand(0, 6.28), vr: rand(-1.1, 1.1), ph: rand(0, 6.28), sw: rand(.6, 1.4), a: rand(.5, .95),
  });
  const makeMote = () => ({ x: rand(0, W), y: rand(H * .1, H), r: rand(.8, 2.4), vy: rand(-9, -2), vx: rand(-4, 5), ph: rand(0, 6.28), tw: rand(.4, 1.1) });

  let petals = [], motes = [];
  const seedAll = () => {
    petals = Array.from({ length: petalCount() }, () => makePetal(true));
    motes = Array.from({ length: moteCount() }, makeMote);
  };
  resize(); seedAll();
  addEventListener("resize", () => { resize(); seedAll(); });

  const drawPetal = (p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.scale(1, .55 + .45 * Math.abs(Math.sin(p.rot * .7 + p.ph)));
    ctx.globalAlpha = p.a;
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, p.s);
    g.addColorStop(0, "#fbe3e8"); g.addColorStop(1, "#f0a9bb");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(0, -p.s);
    ctx.bezierCurveTo(p.s, -p.s * .6, p.s * .8, p.s * .8, 0, p.s);
    ctx.bezierCurveTo(-p.s * .8, p.s * .8, -p.s, -p.s * .6, 0, -p.s);
    ctx.fill();
    ctx.restore();
  };
  const drawMote = (m, t) => {
    const a = .25 + .75 * (.5 + .5 * Math.sin(t * m.tw + m.ph));
    const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 5);
    g.addColorStop(0, `rgba(255,240,190,${a})`); g.addColorStop(.25, `rgba(255,228,150,${a * .5})`); g.addColorStop(1, "rgba(255,228,150,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(m.x, m.y, m.r * 5, 0, 6.28); ctx.fill();
  };

  let last = performance.now(), t = 0;
  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, .05); last = now; t += dt;
    ctx.clearRect(0, 0, W, H);
    for (const m of motes) {
      m.x += (m.vx + Math.sin(t * .4 + m.ph) * 5) * dt; m.y += m.vy * dt;
      if (m.y < -10 || m.x < -10 || m.x > W + 10) Object.assign(m, makeMote(), { y: H + 10 });
      drawMote(m, t);
    }
    for (let i = 0; i < petals.length; i++) {
      const p = petals[i];
      p.x += (p.vx + Math.sin(t * p.sw + p.ph) * 22) * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      if (p.y > H + 20 || p.x < -30) petals[i] = makePetal(false);
      drawPetal(p);
    }
    if (!reduce) requestAnimationFrame(frame);
  };
  if (reduce) frame(performance.now()); else requestAnimationFrame(frame);
})();
