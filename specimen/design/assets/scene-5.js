/* Mavern specimen 05 — the valley, drawn in code.
   Every layer is generated SVG in a shared 1600 x 900 coordinate space. */
(() => {
  const W = 1600, H = 900;
  const NS = "http://www.w3.org/2000/svg";

  /* ---------- helpers ---------- */
  const rng = (seed) => () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const f = (n) => Math.round(n * 10) / 10;

  /* 1D value noise, smooth */
  const noise = (seed) => {
    const r = rng(seed), v = Array.from({ length: 256 }, r);
    return (x) => {
      const i = Math.floor(x), t = x - i, s = t * t * (3 - 2 * t);
      return v[i & 255] * (1 - s) + v[(i + 1) & 255] * s;
    };
  };

  /* ridge line as smooth path + a lookup for placing things on it */
  const ridge = (base, amp, seed, step = 28) => {
    const n = noise(seed), pts = [];
    for (let x = -60; x <= W + 60; x += step) {
      const y = (typeof base === "function" ? base(x) : base) + (n(x / 140) * .65 + n(x / 52 + 40) * .35 - .5) * 2 * amp;
      pts.push([x, y]);
    }
    let d = `M${pts[0][0]},${f(pts[0][1])}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
      d += ` Q${pts[i][0]},${f(pts[i][1])} ${f(mx)},${f(my)}`;
    }
    d += ` L${W + 60},${H + 20} L-60,${H + 20} Z`;
    const at = (x) => {
      const i = Math.max(0, Math.min(pts.length - 2, Math.floor((x + 60) / step)));
      const t = (x - pts[i][0]) / step;
      return pts[i][1] * (1 - t) + pts[i + 1][1] * t;
    };
    return { d, at };
  };

  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  // shared filters are defined once, in the sky layer, and referenced by every other layer
  const put = (id, html) => { document.getElementById(id).innerHTML = id === "sky-art" ? html : html.replace(defs, ""); };

  /* shared defs live in each svg that needs them (filters are referenced by id across the document) */
  const defs = `
    <defs>
      <filter id="rough" x="-3%" y="-3%" width="106%" height="106%">
        <feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="2" seed="4" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="paint" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency=".011" numOctaves="3" seed="11" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feGaussianBlur in="d" stdDeviation="2.2"/>
      </filter>
      <filter id="petalEdge" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="21" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/>
      </filter>
      <filter id="soft"><feGaussianBlur stdDeviation="18"/></filter>
      <filter id="blur6"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id="blur14"><feGaussianBlur stdDeviation="14"/></filter>
    </defs>`;

  /* ---------- sky ---------- */
  put("sky-art", `${defs}
    <defs>
      <linearGradient id="skyg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#6f93bd"/><stop offset=".38" stop-color="#a9c4dc"/>
        <stop offset=".62" stop-color="#e5e4d8"/><stop offset=".8" stop-color="#f7e2b2"/>
      </linearGradient>
      <radialGradient id="sun" cx=".5" cy=".5" r=".5">
        <stop offset="0" stop-color="#fffbe6"/><stop offset=".25" stop-color="#fff0c4" stop-opacity=".8"/><stop offset="1" stop-color="#fff0c4" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#skyg)"/>
    <circle cx="520" cy="290" r="520" fill="url(#sun)"/>
    <circle cx="520" cy="290" r="46" fill="#fffdf2"/>`);

  /* ---------- clouds (own layer so it can drift) ---------- */
  (() => {
    const r = rng(7);
    let g = "";
    const cloud = (cx, cy, s, tone) => {
      let out = "";
      const n = 8 + Math.floor(r() * 5);
      for (let i = 0; i < n; i++) {
        const ox = (r() - .5) * 300 * s, oy = (r() - .5) * 46 * s;
        const rx = (70 + r() * 90) * s, ry = (26 + r() * 30) * s;
        out += `<ellipse cx="${f(cx + ox)}" cy="${f(cy + oy + 16 * s)}" rx="${f(rx)}" ry="${f(ry)}" fill="#a9b4d0" opacity=".55"/>`;
      }
      for (let i = 0; i < n; i++) {
        const ox = (r() - .5) * 300 * s, oy = (r() - .5) * 46 * s;
        const rx = (70 + r() * 90) * s, ry = (26 + r() * 30) * s;
        out += `<ellipse cx="${f(cx + ox)}" cy="${f(cy + oy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${tone}" opacity=".9"/>`;
      }
      return out;
    };
    const spots = [[160, 110, 1.15, "#fdf6ea"], [620, 60, .9, "#fff3d8"], [980, 150, 1.05, "#f6f2ee"], [1420, 90, 1.2, "#fdf2e6"], [350, 290, .7, "#fff1d2"], [1250, 300, .8, "#fbeede"], [820, 260, .55, "#fff0cc"], [-80, 330, .8, "#f3eee9"], [1700, 230, 1, "#f7efe8"]];
    spots.forEach(([x, y, s, c]) => { g += cloud(x, y, s, c); });
    put("clouds", `${defs}<g filter="url(#paint)">${g}</g>`);
  })();

  /* ---------- far mountains (snow caps via gradient) ---------- */
  (() => {
    const far = ridge((x) => 400 - 40 * Math.sin(x / 260), 90, 3);
    const mid = ridge((x) => 455 - 20 * Math.sin(x / 330 + 1), 55, 9);
    put("mountains", `${defs}
      <defs>
        <linearGradient id="mFar" gradientUnits="userSpaceOnUse" x1="0" y1="290" x2="0" y2="520">
          <stop offset="0" stop-color="#f7f8fb"/><stop offset=".22" stop-color="#dfe6f0"/><stop offset=".4" stop-color="#a9bad2"/><stop offset="1" stop-color="#cdd8e4"/>
        </linearGradient>
        <linearGradient id="mMid" gradientUnits="userSpaceOnUse" x1="0" y1="390" x2="0" y2="620">
          <stop offset="0" stop-color="#7f9db4"/><stop offset=".6" stop-color="#a9c0c4"/><stop offset="1" stop-color="#d4dcc9"/>
        </linearGradient>
      </defs>
      <g filter="url(#rough)">
        <path d="${far.d}" fill="url(#mFar)"/>
        <path d="${mid.d}" fill="url(#mMid)"/>
      </g>`);
  })();

  /* ---------- mist ---------- */
  put("mist", `${defs}
    <g filter="url(#soft)" fill="#f2f6f6">
      <g class="mist-a"><ellipse cx="300" cy="540" rx="420" ry="46" opacity=".6"/><ellipse cx="1180" cy="520" rx="380" ry="40" opacity=".5"/></g>
      <g class="mist-b"><ellipse cx="760" cy="600" rx="460" ry="38" opacity=".55"/><ellipse cx="80" cy="470" rx="300" ry="34" opacity=".45"/></g>
    </g>`);

  /* ---------- valley: forested hills, meadow, river, village ---------- */
  (() => {
    const r = rng(31);
    const hillY = (x) => x < 800 ? 440 + 175 * smooth(0, 820, x) : 615 - 135 * smooth(980, 1600, x);
    const hills = ridge(hillY, 26, 14, 22);

    const conifer = (x, y, s, c1, c2) => {
      const w = 20 * s, h = 62 * s;
      let d = "";
      for (let k = 0; k < 3; k++) {
        const ty = y - h + k * h * .27, bw = w * (.45 + k * .3), by = ty + h * .42;
        d += `M${f(x)},${f(ty)} L${f(x - bw)},${f(by)} L${f(x + bw)},${f(by)} Z `;
      }
      return `<path d="${d}" fill="${c1}"/><path d="M${f(x)},${f(y - h)} L${f(x + w * .9)},${f(y - h * .08)} L${f(x)},${f(y - h * .08)} Z" fill="${c2}" opacity=".5"/>`;
    };

    const houseRoofs = ["#b4694a", "#9c5f4d", "#c37a52"], walls = ["#efe2c4", "#e5d3b0", "#f2e8d0"];
    let village = "";
    for (let i = 0; i < 15; i++) {
      const x = 770 + r() * 190, y = 612 + r() * 26, s = .7 + r() * .6, w = 17 * s, h = 11 * s;
      village += `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${pick(r, walls)}"/>` +
        `<path d="M${f(x - 2)},${f(y)} L${f(x + w / 2)},${f(y - 9 * s)} L${f(x + w + 2)},${f(y)} Z" fill="${pick(r, houseRoofs)}"/>`;
    }
    village += `<rect x="868" y="575" width="9" height="40" fill="#e9dcc2"/><path d="M866,575 L872.5,548 L879,575 Z" fill="#7c6a73"/><rect x="871" y="590" width="3" height="6" fill="#6f5d56"/>`;

    let trees = "";
    const spots = [];
    for (let i = 0; i < 150; i++) {
      const x = r() < .62 ? r() * 760 : 1020 + r() * 600;
      spots.push([x, hillY(x) + 14 + r() * (x < 760 ? 90 : 70)]);
    }
    spots.sort((a, b) => a[1] - b[1]).forEach(([x, y]) => {
      const t = Math.min(1, (y - 440) / 220), s = .55 + t * .75 + r() * .25;
      trees += conifer(x, y, s, pick(r, ["#2f5b4a", "#3a6a52", "#2a5244", "#46765a"]), "#9fc7a4");
    });

    let blossoms = "";
    for (let i = 0; i < 90; i++) {
      const x = 1000 + r() * 560, y = hillY(x) + 30 + r() * 70;
      blossoms += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + r() * 5)}" fill="${pick(r, ["#f4c0cf", "#f9d6dc", "#ee9fb6"])}" opacity=".85"/>`;
    }

    put("valley", `${defs}
      <defs>
        <linearGradient id="hillg" gradientUnits="userSpaceOnUse" x1="0" y1="420" x2="0" y2="760">
          <stop offset="0" stop-color="#4b7a68"/><stop offset=".45" stop-color="#6a9a62"/><stop offset="1" stop-color="#b8cd78"/>
        </linearGradient>
        <radialGradient id="meadow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#dfe58f"/><stop offset="1" stop-color="#dfe58f" stop-opacity="0"/></radialGradient>
      </defs>
      <g filter="url(#rough)"><path d="${hills.d}" fill="url(#hillg)"/></g>
      <ellipse cx="860" cy="632" rx="360" ry="46" fill="url(#meadow)"/>
      <path d="M1020,588 C960,606 930,596 880,612 C830,628 790,632 740,640" fill="none" stroke="#d6eaf0" stroke-width="7" stroke-linecap="round" opacity=".9"/>
      <path d="M1020,586 C960,603 930,594 880,610" fill="none" stroke="#ffffff" stroke-width="2" opacity=".7"/>
      ${village}
      <g>${trees}</g>
      ${blossoms}
      `);
  })();

  /* ---------- foreground hill, path, flowers, stone, traveller ---------- */
  (() => {
    const r = rng(55);
    const fgY = (x) => 880 - 220 * smooth(280, 1500, x);
    const fg = ridge(fgY, 14, 22, 20);

    let flowers = "";
    for (let i = 0; i < 260; i++) {
      const x = r() * W, y = fg.at(x) + 8 + Math.pow(r(), 1.6) * (H - fg.at(x));
      if (x > 780 && x < 1110 && y > 700) continue; // keep the path clear
      const c = pick(r, ["#ffffff", "#fdf3f5", "#f5b9ca", "#f2d97a", "#e9a1bb"]);
      flowers += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.6 + r() * 2.6)}" fill="${c}" opacity=".95"/>`;
    }
    let rocks = "";
    [[1130, 790, 54, 30], [1020, 842, 40, 22], [1240, 744, 62, 34]].forEach(([x, y, rx, ry]) => {
      rocks += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#7d8180"/><ellipse cx="${x - rx * .15}" cy="${y - ry * .3}" rx="${rx * .8}" ry="${ry * .6}" fill="#a2a89f"/><ellipse cx="${x - rx * .25}" cy="${y + ry * .2}" rx="${rx * .5}" ry="${ry * .3}" fill="#6f9060" opacity=".7"/>`;
    });

    put("foreground", `${defs}
      <defs>
        <linearGradient id="fgg" gradientUnits="userSpaceOnUse" x1="0" y1="560" x2="0" y2="900">
          <stop offset="0" stop-color="#9dbb68"/><stop offset=".4" stop-color="#6c9650"/><stop offset="1" stop-color="#2f5a3e"/>
        </linearGradient>
        <linearGradient id="dirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfb383"/><stop offset="1" stop-color="#9c7d59"/></linearGradient>
      </defs>
      <g filter="url(#rough)">
        <path d="${fg.d}" fill="url(#fgg)"/>
        <path d="M720,905 C790,850 940,832 1030,790 C1095,762 1140,745 1196,708 L1222,714 C1180,752 1146,786 1096,814 C1020,858 960,872 976,905 Z" fill="url(#dirt)"/>
        <path d="M1030,790 C1095,762 1140,745 1196,708" fill="none" stroke="#e8d6a8" stroke-width="3" opacity=".6"/>
      </g>
      ${rocks}
      <rect x="1232" y="660" width="26" height="54" rx="6" fill="#8d9390"/><rect x="1236" y="662" width="12" height="46" rx="5" fill="#b3b8b0"/>
      ${flowers}`);

    /* traveller stands on the path, looking over the valley */
    put("traveller", `
      <g transform="translate(1120 742) scale(.9)">
        <ellipse cx="0" cy="2" rx="22" ry="5" fill="#2b3a2a" opacity=".35"/>
        <path d="M24 -88 L27 0" stroke="#4a3626" stroke-width="2.6" stroke-linecap="round"/>
        <circle cx="24" cy="-92" r="4.4" fill="#f4dc9c"/><circle cx="24" cy="-92" r="9" fill="#f4dc9c" opacity=".25"/>
        <g class="hair"><path d="M-9 -80 C-17 -58 -15 -34 -9 -18 L-1 -34 L7 -18 C12 -40 11 -62 5 -80 Z" fill="#ece8dc"/></g>
        <circle cx="-2" cy="-80" r="9" fill="#efe9dc"/>
        <path d="M-12 -70 C-8 -75 4 -75 8 -70 L14 -6 L18 0 L-24 0 L-18 -8 Z" fill="#5f7686"/>
        <path d="M-12 -70 C-8 -75 4 -75 8 -70 L5 -52 L-9 -52 Z" fill="#f1ede2"/>
        <g class="cloak-hem"><path d="M-22 -14 L16 -14 L20 0 L-26 0 Z" fill="#46606f"/></g>
        <path d="M-2 -66 L-2 -4" stroke="#3f5563" stroke-width="1.2" opacity=".6"/>
      </g>`);
  })();

  /* ---------- grass blades that sway in front of the hill ---------- */
  (() => {
    const r = rng(77);
    const fgY = (x) => 880 - 220 * smooth(280, 1500, x);
    let blades = "";
    for (let i = 0; i < 520; i++) {
      const x = r() * W, base = fgY(x) + 10 + Math.pow(r(), .7) * (H - fgY(x));
      if (x > 760 && x < 1130 && base > 700 && base < 900) continue;
      const h = 14 + r() * 26 + (base - 700) * .05, lean = (r() - .5) * 14;
      const c = pick(r, ["#a6c76e", "#7fa857", "#5b8a4a", "#c3d98a", "#44743f"]);
      blades += `<path d="M${f(x)},${f(base)} Q${f(x + lean * .4)},${f(base - h * .55)} ${f(x + lean)},${f(base - h)}" stroke="${c}" stroke-width="${f(1.4 + r() * 1.6)}" stroke-linecap="round" fill="none"/>`;
    }
    put("grass", `<g>${blades}</g>`);
  })();

  /* ---------- tree: trunk and branches ---------- */
  const branches = [
    // [path, width]
    ["M1300,640 C1290,540 1306,430 1296,330", 62],
    ["M1296,350 C1230,300 1140,284 1040,236", 30], ["M1230,308 C1190,250 1130,214 1080,150", 14],
    ["M1040,236 C990,214 940,190 880,196", 12],
    ["M1300,380 C1360,330 1440,300 1540,262", 28], ["M1420,316 C1450,250 1500,200 1530,130", 13],
    ["M1296,340 C1290,280 1310,220 1330,150", 22], ["M1330,170 C1380,120 1440,100 1500,70", 10],
    ["M1160,268 C1120,300 1080,330 1030,350", 11],
  ];
  put("trunk", `${defs}
    <defs><linearGradient id="bark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a7558"/><stop offset=".45" stop-color="#5f4b3b"/><stop offset="1" stop-color="#3a2d27"/></linearGradient></defs>
    <g filter="url(#rough)" stroke-linecap="round" fill="none">
      <path d="M1235,716 C1262,690 1280,664 1272,600 L1342,596 C1338,664 1366,694 1412,712 C1380,722 1330,722 1235,716 Z" fill="url(#bark)" stroke="none"/>
      ${branches.map(([d, w]) => `<path d="${d}" stroke="url(#bark)" stroke-width="${w}"/>`).join("")}
      ${branches.map(([d, w]) => `<path d="${d}" stroke="#a4906c" stroke-width="${Math.max(2, w * .16)}" transform="translate(${-w * .22} ${-w * .1})" opacity=".55"/>`).join("")}
      <path d="M1286,640 C1280,560 1292,470 1284,360 M1304,640 C1312,560 1302,470 1310,370 M1322,640 C1326,570 1318,500 1324,400" stroke="#33271f" stroke-width="2.4" opacity=".55"/>
    </g>
    <g fill="#7e9a57" opacity=".8"><ellipse cx="1276" cy="640" rx="14" ry="26" transform="rotate(8 1276 640)"/><ellipse cx="1304" cy="470" rx="7" ry="22"/><ellipse cx="1248" cy="700" rx="22" ry="8"/></g>`);

  /* ---------- tree: blossom canopy (own layer, sways as one piece) ---------- */
  (() => {
    const r = rng(101);
    const inside = (x, y) => {
      const dx = (x - 1230) / 560, dy = (y - 170) / 175;
      return dx * dx + dy * dy < 1;
    };
    const dark = ["#d97fa0", "#e590ad", "#cf7396"], mid = ["#f0a9bf", "#f4b6c9", "#ee9db6"], light = ["#f9d3de", "#fbe1e8", "#fff0f3"];
    let shadow = "", base = "", hi = "";
    let placed = 0;
    while (placed < 400) {
      const x = 700 + r() * 1000, y = -10 + r() * 380;
      if (!inside(x, y)) continue;
      if (r() < .22 || (y > 250 && r() < .35)) continue; // gaps let sky and branches show through
      const s = 16 + r() * 26;
      shadow += `<circle cx="${f(x + 8)}" cy="${f(y + 14)}" r="${f(s)}" fill="${pick(r, dark)}"/>`;
      base += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(s * .95)}" fill="${pick(r, mid)}"/>`;
      hi += `<circle cx="${f(x - s * .3)}" cy="${f(y - s * .38)}" r="${f(s * .5)}" fill="${pick(r, light)}" opacity=".85"/>`;
      placed++;
    }
    let sprinkle = "";
    for (let i = 0; i < 260; i++) {
      const x = 700 + r() * 1000, y = 0 + r() * 470;
      if (!inside(x * .98 + 20, y) && r() > .25) continue;
      sprinkle += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + r() * 6)}" fill="${pick(r, [...mid, ...light])}"/>`;
    }
    put("canopy", `${defs}<g filter="url(#petalEdge)"><g>${shadow}</g><g>${base}</g><g>${hi}</g><g>${sprinkle}</g></g>`);
  })();

  /* ---------- out-of-focus foreground: depth of field ---------- */
  (() => {
    const r = rng(303);
    let near = "";
    for (let i = 0; i < 26; i++) {
      const left = i % 2 === 0, x = left ? r() * 380 : 1220 + r() * 400, base = 960, h = 120 + r() * 200, lean = (r() - .5) * 120;
      near += `<path d="M${f(x)},${base} Q${f(x + lean * .3)},${f(base - h * .6)} ${f(x + lean)},${f(base - h)}" stroke="${pick(r, ["#2e5a3b", "#3f7048", "#244a35"])}" stroke-width="${f(10 + r() * 14)}" stroke-linecap="round" fill="none"/>`;
    }
    for (let i = 0; i < 6; i++) {
      const x = 1100 + r() * 480, y = 600 + r() * 260, s = 38 + r() * 40;
      near += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(s)}" ry="${f(s * .6)}" fill="#f6c3d1" opacity=".75" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>`;
    }
    put("near", `${defs}<g filter="url(#blur6)">${near}</g>`);
  })();

  /* ---------- fit all layers to the viewport, favouring the tree on narrow screens ---------- */
  const svgs = [...document.querySelectorAll("svg.scene")];
  const fit = () => {
    const vw = innerWidth, vh = innerHeight, scale = Math.max(vw / W, vh / H);
    const visW = vw / scale, visH = vh / scale;
    const focal = vw / vh < 1.2 ? 1020 : 800;
    const x0 = Math.min(W - visW, Math.max(0, focal - visW / 2));
    const y0 = Math.max(0, (H - visH) * .55);
    svgs.forEach((s) => s.setAttribute("viewBox", `${f(x0)} ${f(y0)} ${f(visW)} ${f(visH)}`));
  };
  fit(); addEventListener("resize", fit);

  /* ---------- parallax: pointer + a slow breathing drift ---------- */
  const layers = [...document.querySelectorAll(".layer")];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let tx = 0, ty = 0, cx = 0, cy = 0;
  if (!reduce && matchMedia("(pointer: fine)").matches) {
    addEventListener("pointermove", (e) => { tx = e.clientX / innerWidth - .5; ty = e.clientY / innerHeight - .5; }, { passive: true });
  }
  const tick = (now) => {
    const t = now / 1000;
    cx += (tx - cx) * .04; cy += (ty - cy) * .04;
    const ax = cx + Math.sin(t * .12) * .12, ay = cy + Math.cos(t * .09) * .06;
    for (const l of layers) {
      const d = +l.dataset.depth;
      l.style.transform = `translate3d(${f(-ax * d)}px, ${f(-ay * d * .6)}px, 0) scale(1.07)`;
    }
    if (!reduce) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();
