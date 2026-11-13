(() => {
  const stage = document.querySelector("[data-globe]");
  if (!stage) return;

  const canvas = stage.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const moonTexture = stage.querySelector(".moon-texture");
  if (!ctx) return;

  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const hero = stage.closest(".hero, .contact-stage");
  const compact = stage.parentElement?.classList.contains("contact-globe");
  const degree = Math.PI / 180;
  const fullTurn = Math.PI * 2;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const mix = (a, b, amount) => a + (b - a) * amount;
  const smoothstep = value => value * value * (3 - 2 * value);

  // Simplified coastlines provide an immediate local fallback for Natural Earth.
  const coastlines = [
    [[-168,66],[-159,70],[-141,70],[-128,73],[-107,72],[-93,74],[-80,72],[-65,63],[-55,52],[-65,46],[-75,39],[-80,31],[-81,25],[-89,30],[-97,27],[-96,20],[-86,21],[-84,14],[-77,8],[-83,8],[-89,15],[-96,16],[-105,21],[-114,29],[-117,33],[-124,42],[-130,54],[-143,59],[-155,57],[-162,54],[-166,58]],
    [[-79,8],[-73,12],[-62,10],[-51,4],[-47,-1],[-35,-7],[-39,-15],[-41,-22],[-49,-29],[-55,-35],[-63,-41],[-65,-48],[-70,-55],[-74,-51],[-73,-42],[-71,-35],[-71,-25],[-76,-17],[-81,-5]],
    [[-73,79],[-59,82],[-26,81],[-18,76],[-23,69],[-33,65],[-43,59],[-49,62],[-51,69],[-60,74]],
    [[-10,36],[-9,43],[-4,44],[-1,48],[7,54],[13,55],[10,59],[20,66],[27,71],[42,68],[48,69],[69,72],[90,75],[113,73],[128,73],[140,72],[160,69],[178,65],[171,60],[160,57],[154,53],[142,50],[136,43],[127,39],[122,32],[119,24],[109,21],[105,12],[103,3],[100,7],[96,16],[91,22],[87,22],[82,12],[77,8],[73,16],[67,24],[62,24],[57,18],[49,13],[42,13],[44,25],[40,29],[35,36],[27,36],[21,38],[16,43],[12,45],[8,42],[3,43],[-1,39],[-5,36]],
    [[-17,28],[-11,34],[2,37],[16,33],[31,32],[34,27],[38,17],[44,11],[52,12],[48,4],[43,-3],[40,-12],[34,-22],[30,-31],[22,-35],[15,-30],[11,-21],[12,-12],[8,-5],[2,4],[-9,5],[-15,10],[-17,16]],
    [[-10,51],[-6,58],[-2,59],[1,52],[-4,50]], [[-24,63],[-20,67],[-14,65],[-16,63]],
    [[130,32],[136,35],[141,41],[145,44],[144,39],[138,34],[133,32]],
    [[95,5],[102,2],[107,-5],[115,-7],[124,-8],[132,-6],[142,-4],[152,-6],[145,-10],[132,-10],[119,-9],[107,-7],[100,-3]],
    [[113,-23],[115,-34],[123,-35],[130,-32],[139,-36],[146,-39],[153,-31],[153,-25],[146,-17],[142,-11],[136,-16],[130,-12],[121,-19]],
    [[43,-13],[50,-14],[48,-23],[44,-26],[43,-21]], [[166,-46],[169,-43],[175,-37],[177,-39],[172,-46]],
  ];
  const cities = Object.fromEntries(Object.entries({
    brussels: [50.85, 4.35], newYork: [40.7, -74], saoPaulo: [-23.55, -46.63],
    dakar: [14.7, -17.45], capeTown: [-33.9, 18.42], dubai: [25.2, 55.27],
    mumbai: [19.08, 72.88], singapore: [1.35, 103.82], lisbon: [38.72, -9.14],
    montreal: [45.50, -73.57], mexico: [19.43, -99.13], bogota: [4.71, -74.07],
    casablanca: [33.57, -7.59], lagos: [6.52, 3.38], nairobi: [-1.29, 36.82],
    stockholm: [59.33, 18.07], athens: [37.98, 23.73], tokyo: [35.68, 139.69],
    seoul: [37.57, 126.98], hongKong: [22.32, 114.17], sydney: [-33.87, 151.21],
  }).map(([name, point]) => [name, vector(...point)]));
  const networks = [
    ["brussels:newYork", "brussels:lisbon", "brussels:stockholm", "brussels:athens",
      "lisbon:casablanca", "casablanca:dakar", "dakar:lagos", "newYork:montreal",
      "newYork:mexico", "mexico:bogota", "bogota:saoPaulo"],
    ["brussels:newYork", "brussels:athens", "athens:dubai", "dubai:mumbai",
      "lisbon:casablanca", "casablanca:dakar", "dakar:lagos", "lagos:nairobi",
      "nairobi:capeTown", "dakar:saoPaulo"],
    ["brussels:athens", "athens:dubai", "dubai:mumbai", "dubai:nairobi",
      "nairobi:capeTown", "mumbai:singapore", "singapore:hongKong", "hongKong:seoul",
      "seoul:tokyo", "singapore:sydney"],
  ];
  const primaryRoutes = new Set(["brussels:newYork", "brussels:athens", "athens:dubai",
    "dubai:mumbai", "mumbai:singapore", "dakar:saoPaulo", "nairobi:capeTown"]);
  const spacecraft = [
    { orbit: 1.17, tilt: -.29, angle: 3.6, period: 18500, ground: "brussels" },
    { orbit: 1.23, tilt: .57, angle: 1.12, period: -23500, ground: "lisbon" },
    { orbit: 1.13, tilt: -.68, angle: 2.38, period: 26700, ground: "newYork", shuttle: true },
  ];

  function vector(lat, lon) {
    const y = Math.sin(lat * degree);
    const latitude = Math.cos(lat * degree);
    return [latitude * Math.sin(lon * degree), y, latitude * Math.cos(lon * degree)];
  }

  function contains(polygon, lon, lat) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [x1, y1] = polygon[i];
      const [x2, y2] = polygon[j];
      if ((y1 > lat) !== (y2 > lat) && lon < (x2 - x1) * (lat - y1) / (y2 - y1) + x1) inside = !inside;
    }
    return inside;
  }

  function makeLand(polygons) {
    const dots = [];
    for (let lat = -58; lat <= 83; lat += 2.6) {
      const spacing = 2.8 / Math.max(.22, Math.cos(lat * degree));
      for (let lon = -179; lon < 180; lon += spacing) {
        if (polygons.some(([outline, ...holes]) => contains(outline, lon, lat) && !holes.some(hole => contains(hole, lon, lat)))) {
          dots.push(vector(lat, lon));
        }
      }
    }
    return dots;
  }

  function landFromTopology(topology) {
    const { scale, translate } = topology.transform;
    const arcs = topology.arcs.map(arc => {
      let x = 0, y = 0;
      return arc.map(([dx, dy]) => {
        x += dx;
        y += dy;
        return [x * scale[0] + translate[0], y * scale[1] + translate[1]];
      });
    });
    const objects = topology.objects.land.geometries;
    const polygons = objects.flatMap(object => object.type === "Polygon" ? [object.arcs] : object.arcs);
    return polygons.map(polygon => polygon.map(ring => ring.flatMap(index =>
      index < 0 ? [...arcs[~index]].reverse() : arcs[index]
    )));
  }

  let land = makeLand(coastlines.map(coast => [coast]));
  let frame = 0;
  let visible = false;
  let size = { width: 0, height: 0 };
  let scrollTarget = 0;
  let scroll = 0;
  let pointer = { x: 0, y: 0 };
  let yaw = -22;
  let pitch = 14;
  let offsetX = 0;
  let offsetY = 0;
  let previousFrame;
  let elapsed = 0;
  let rendered = false;

  const routes = [...new Set(networks.flat())].map((id, index) => {
    const [from, to] = id.split(":");
    const a = cities[from], b = cities[to];
    const angle = Math.acos(clamp(a.reduce((sum, value, axis) => sum + value * b[axis], 0), -1, 1));
    const sin = Math.sin(angle);
    const primary = primaryRoutes.has(id);
    const lift = Math.min(primary ? .155 : .087, .013 + angle * (primary ? .092 : .048));
    const path = Array.from({ length: 65 }, (_, step) => {
      const t = step / 64;
      const u = Math.sin((1 - t) * angle) / sin;
      const v = Math.sin(t * angle) / sin;
      const altitude = 1 + Math.sin(Math.PI * t) * lift;
      return a.map((value, axis) => (value * u + b[axis] * v) * altitude);
    });
    return { from, to, path, index, primary, color: primary ? "#9ddfff" : "#a393f5",
      membership: networks.map(network => Number(network.includes(id))) };
  });

  const grid = [];
  for (let lat = -60; lat <= 60; lat += 30) {
    grid.push(Array.from({ length: 91 }, (_, i) => vector(lat, i * 4 - 180)));
  }
  for (let lon = -180; lon < 180; lon += 30) {
    grid.push(Array.from({ length: 46 }, (_, i) => vector(i * 4 - 90, lon)));
  }

  function render(delta) {
    const { width, height } = size;
    if (!width || !height) return;

    const frozen = motion.matches;
    const easing = frozen ? 1 : 1 - Math.exp(-delta / 112);
    scroll = frozen ? 0 : mix(scroll, scrollTarget, easing);
    const now = frozen ? 0 : elapsed;
    const xFollow = frozen ? 0 : pointer.x;
    const yFollow = frozen ? 0 : pointer.y;
    const idleTurn = 24 * Math.sin(now / 6400) + 7 * Math.sin(now / 3700);
    yaw = mix(yaw, -22 + scroll * 86 + idleTurn + xFollow * 36, easing);
    pitch = mix(pitch, 14 + scroll * 4 - yFollow * 20 + Math.sin(now / 5400) * 2.5, easing);
    offsetX = mix(offsetX, xFollow, easing);
    offsetY = mix(offsetY, yFollow, easing);
    const yawCos = Math.cos(yaw * degree), yawSin = Math.sin(yaw * degree);
    const pitchCos = Math.cos(pitch * degree), pitchSin = Math.sin(pitch * degree);
    const cx = width * ((compact ? .48 : .52) + offsetX * .025);
    const cy = height * (.505 + offsetY * .023 - scroll * .025);
    const radius = Math.min(width, height) * ((compact ? .374 : .437) - scroll * .015);

    function project([x, y, z]) {
      const horizontal = x * yawCos - z * yawSin;
      const forward = x * yawSin + z * yawCos;
      const vertical = y * pitchCos - forward * pitchSin;
      const depth = y * pitchSin + forward * pitchCos;
      return [horizontal, vertical, depth];
    }

    // An orthographic ray from the camera intersects the unit sphere at this depth.
    function isVisible([x, y, depth]) {
      const plane = x * x + y * y;
      return plane >= 1 || depth + .00001 >= Math.sqrt(1 - plane);
    }

    function tracePath(points, width, color) {
      ctx.beginPath();
      let previous = points[0];
      let wasVisible = isVisible(previous);
      if (wasVisible) ctx.moveTo(cx + previous[0] * radius, cy - previous[1] * radius);

      for (let i = 1; i < points.length; i++) {
        const current = points[i];
        const visibleNow = isVisible(current);
        if (visibleNow !== wasVisible) {
          let low = 0, high = 1;
          for (let step = 0; step < 9; step++) {
            const center = (low + high) / 2;
            const sample = previous.map((value, axis) => mix(value, current[axis], center));
            if (isVisible(sample) === wasVisible) low = center;
            else high = center;
          }
          const x = cx + mix(previous[0], current[0], low) * radius;
          const y = cy - mix(previous[1], current[1], low) * radius;
          if (wasVisible) ctx.lineTo(x, y);
          else ctx.moveTo(x, y);
        }
        if (visibleNow) ctx.lineTo(cx + current[0] * radius, cy - current[1] * radius);
        previous = current;
        wasVisible = visibleNow;
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.stroke();
    }

    ctx.clearRect(0, 0, width, height);
    const glow = ctx.createRadialGradient(cx, cy, radius * .82, cx, cy, radius * 1.26);
    glow.addColorStop(0, "#4867fd53");
    glow.addColorStop(.42, "#4059da2f");
    glow.addColorStop(1, "#263ab000");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, fullTurn);
    const face = ctx.createRadialGradient(
      cx + radius * (-.29 + offsetX * .22),
      cy + radius * (-.35 + offsetY * .19),
      0, cx, cy, radius * 1.04,
    );
    face.addColorStop(0, "#293e80");
    face.addColorStop(.57, "#162858");
    face.addColorStop(.88, "#101a39");
    face.addColorStop(1, "#081128");
    ctx.fillStyle = face;
    ctx.fill();
    const rim = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
    rim.addColorStop(0, "#b6d9ffc7");
    rim.addColorStop(.49, "#6d93f56e");
    rim.addColorStop(1, "#6a77ca38");
    ctx.strokeStyle = rim;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const trace of grid) tracePath(trace.map(project), .55, "#9cb1ff24");

    const landBuckets = [[], [], [], []];
    for (const point of land) {
      const [x, y, depth] = project(point);
      if (depth <= .02) continue;
      landBuckets[Math.min(3, Math.floor(depth * 4))].push([x, y]);
    }
    for (const [layer, dots] of landBuckets.entries()) {
      ctx.fillStyle = ["#6d8fe345", "#82a0ef67", "#91a9f88f", "#a4bbffb5"][layer];
      ctx.beginPath();
      const r = (.59 + layer * .16) * Math.max(.8, radius / 155);
      for (const [x, y] of dots) {
        const px = cx + x * radius, py = cy - y * radius;
        ctx.moveTo(px + r, py);
        ctx.arc(px, py, r, 0, fullTurn);
      }
      ctx.fill();
    }

    const sequence = Math.min(1.999, scroll * 2.15);
    const index = Math.floor(sequence);
    const blend = smoothstep(clamp((sequence % 1 - .22) / .7, 0, 1));
    const activeCities = new Map();
    for (const { from, to, path, index: order, color, membership, primary } of routes) {
      const opacity = mix(membership[index], membership[index + 1], blend);
      if (opacity <= .012) continue;
      const projected = path.map(project);
      if (primary) {
        ctx.globalAlpha = opacity * .14;
        tracePath(projected, 3.9, color);
      }
      ctx.globalAlpha = opacity * (primary ? .86 : .47);
      tracePath(projected, primary ? 1.35 : .88, color);

      for (const name of [from, to]) {
        activeCities.set(name, Math.max(activeCities.get(name) || 0, opacity));
      }
      if (frozen || (!primary && order % 2 === 0)) continue;

      const cycle = (now / (5200 + (order % 4) * 370) + order * .173) % 1;
      const travelEnd = primary ? .62 : .54;
      if (cycle < travelEnd) {
        const position = Math.pow(cycle / travelEnd, 1.12);
        const tailLength = (primary ? .255 : .16) * clamp(position * 3, 0, 1);
        const samples = [];
        for (let k = 0; k <= 16; k++) {
          const sample = clamp(position - tailLength * (1 - k / 16), 0, 1) * (projected.length - 1);
          const start = Math.floor(sample);
          const end = Math.min(start + 1, projected.length - 1);
          samples.push(projected[start].map((value, axis) => mix(value, projected[end][axis], sample - start)));
        }
        for (let segment = 0; segment < 4; segment++) {
          ctx.globalAlpha = opacity * ((segment + 1) / 4) ** 2 * (primary ? .92 : .75);
          tracePath(samples.slice(segment * 4, segment * 4 + 5), 1 + segment * (primary ? .53 : .27), color);
        }
        const head = samples.at(-1);
        if (isVisible(head)) {
          const [x, y] = head;
          ctx.globalAlpha = opacity * .33;
          dot(cx + x * radius, cy - y * radius, primary ? 5.8 : 3.8, color);
          ctx.globalAlpha = opacity;
          dot(cx + x * radius, cy - y * radius, primary ? 2.6 : 1.65, "#f5fcff");
        }
      } else if (primary && cycle < travelEnd + .15) {
        const [x, y, depth] = projected.at(-1);
        if (depth > .02) {
          const pulse = (cycle - travelEnd) / .15;
          ctx.beginPath();
          ctx.arc(cx + x * radius, cy - y * radius, 3 + pulse * 15, 0, fullTurn);
          ctx.globalAlpha = opacity * (1 - pulse) * .8;
          ctx.lineWidth = 1.2;
          ctx.strokeStyle = color;
          ctx.stroke();
        }
      }
    }
    for (const [name, opacity] of activeCities) {
      const [x, y, depth] = project(cities[name]);
      if (depth <= .015 || name === "brussels") continue;
      ctx.globalAlpha = opacity * clamp(depth * 6, 0, 1);
      dot(cx + x * radius, cy - y * radius, 3.1, "#9fb9ff57");
      dot(cx + x * radius, cy - y * radius, 1.55, "#deefff");
    }

    ctx.globalAlpha = 1;
    const [hubX, hubY, bz] = project(cities.brussels);
    if (bz > 0) {
      const bx = cx + hubX * radius, by = cy - hubY * radius;
      const pulse = (now % 2100) / 2100;
      ctx.beginPath();
      ctx.arc(bx, by, 5.2 + pulse * 7, 0, fullTurn);
      ctx.globalAlpha = .68 - pulse * .55;
      ctx.strokeStyle = "#a9dfff";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
      dot(bx, by, 5, "#79dcff49");
      dot(bx, by, 3, "#effbff");
    }
    drawSpace();

    function drawSpace() {
      const unit = Math.max(.72, Math.min(1.25, radius / 270));
      const moonRadius = radius * .113;
      const moon = [.54 + offsetX * .09, Math.min(1.065 + offsetY * .065, (cy - moonRadius - 5) / radius), .37];
      const moonX = cx + moon[0] * radius, moonY = cy - moon[1] * radius;
      if (moonTexture?.naturalWidth) {
        ctx.drawImage(moonTexture, moonX - moonRadius, moonY - moonRadius, moonRadius * 2, moonRadius * 2);
      }
      drawLink(moon, project(cities.athens), (now / 6100 + .33) % 1, "#a89eff");

      for (const [index, craft] of spacecraft.entries()) {
        const { orbit, tilt, angle, period, ground, shuttle } = craft;
        const phase = angle + now / period * fullTurn;
        const ring = turn => {
          const horizontal = Math.cos(turn) * orbit;
          const vertical = Math.sin(turn) * orbit * .44;
          return [
            horizontal * Math.cos(tilt) - vertical * Math.sin(tilt),
            horizontal * Math.sin(tilt) + vertical * Math.cos(tilt),
            Math.sin(turn) * orbit * .89,
          ];
        };
        const point = ring(phase);
        if (!isVisible(point)) continue;
        const next = ring(phase + .01);
        const heading = Math.atan2(point[1] - next[1], next[0] - point[0]) + (period < 0 ? Math.PI : 0);
        drawLink(point, project(cities[ground]), (now / (3250 + index * 340) + index * .22 + .29) % 1, "#85e1ff");
        if (index === 1) {
          drawLink(moon, point, (now / 4600 + .24) % 1, "#b2a9ff");
        }
        const x = cx + point[0] * radius, y = cy - point[1] * radius;
        const scale = unit * (.82 + Math.max(0, point[2]) * .21);
        dot(x, y, scale * 14, "#829dff20");
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(heading);
        ctx.scale(scale, scale);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#c6e3ff";
        if (shuttle) {
          ctx.beginPath();
          ctx.moveTo(14, 0);
          ctx.lineTo(2, -4);
          ctx.lineTo(-8, -9);
          ctx.lineTo(-5, 0);
          ctx.lineTo(-8, 9);
          ctx.lineTo(2, 4);
          ctx.closePath();
          ctx.fillStyle = "#6c83dc";
          ctx.fill();
          ctx.stroke();
          dot(4, 0, 2.1, "#d3f4ff");
          dot(-10, 0, 2.1 + Math.sin(now / 190) * .5, "#8adfff");
        } else {
          ctx.fillStyle = "#425ea7";
          ctx.fillRect(-19, -4, 12, 8);
          ctx.fillRect(7, -4, 12, 8);
          ctx.strokeRect(-19, -4, 12, 8);
          ctx.strokeRect(7, -4, 12, 8);
          ctx.beginPath();
          ctx.moveTo(-19, 0);
          ctx.lineTo(19, 0);
          ctx.stroke();
          ctx.fillStyle = "#9cb7ef";
          ctx.fillRect(-6, -5, 12, 10);
          dot(0, -4, 3.4, "#deeaff");
          dot(1, 1, 1.65, "#79f0ff");
        }
        ctx.restore();
      }
    }

    function drawLink(from, to, phase, color) {
      if (!isVisible(to)) return;
      const pointAt = progress => from.map((value, axis) =>
        mix(value, to[axis], progress) + (axis === 1 ? Math.sin(Math.PI * progress) * .07 : 0));
      ctx.globalAlpha = .27;
      tracePath(Array.from({ length: 19 }, (_, i) => pointAt(i / 18)), 1, color);
      if (!frozen && phase < .64) {
        const position = phase / .64;
        const trailStart = Math.max(0, position - .24);
        ctx.globalAlpha = .88;
        tracePath(Array.from({ length: 9 }, (_, i) => pointAt(mix(trailStart, position, i / 8))), 1.55, color);
        const head = pointAt(position);
        if (isVisible(head)) dot(cx + head[0] * radius, cy - head[1] * radius, 2.2, "#e5f9ff");
      }
      ctx.globalAlpha = 1;
    }
    if (!rendered) {
      stage.classList.add("is-rendered");
      rendered = true;
    }
  }

  function dot(x, y, radius, color) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, fullTurn);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function tick(time) {
    frame = 0;
    const delta = previousFrame === undefined ? 16.7 : clamp(time - previousFrame, 0, 32);
    previousFrame = time;
    elapsed += delta;
    render(delta);
    if (visible && !document.hidden && !motion.matches) frame = requestAnimationFrame(tick);
  }

  function updateLoop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previousFrame = undefined;
    if (visible && !document.hidden) tick(performance.now());
  }

  function resize() {
    size = { width: canvas.clientWidth, height: canvas.clientHeight };
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(size.width * ratio);
    canvas.height = Math.round(size.height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    updateLoop();
  }

  function updateScroll() {
    const { top, height } = hero.getBoundingClientRect();
    scrollTarget = clamp((80 - top) / Math.max(height * .58, 1), 0, 1);
  }

  function resetPointer() {
    pointer = { x: 0, y: 0 };
  }

  addEventListener("pointermove", event => {
    if (motion.matches || event.pointerType === "touch") return;
    pointer = {
      x: clamp(event.clientX / Math.max(innerWidth, 1) * 2 - 1, -1, 1),
      y: clamp(event.clientY / Math.max(innerHeight, 1) * 2 - 1, -1, 1),
    };
  }, { passive: true, capture: true });
  document.documentElement.addEventListener("pointerleave", resetPointer);
  addEventListener("blur", resetPointer);
  addEventListener("scroll", updateScroll, { passive: true });
  document.addEventListener("visibilitychange", updateLoop);
  moonTexture?.addEventListener?.("load", updateLoop);
  motion.addEventListener("change", () => {
    resetPointer();
    updateLoop();
  });
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
  else addEventListener("resize", resize, { passive: true });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      updateLoop();
    }).observe(stage);
  } else {
    visible = true;
  }

  updateScroll();
  resize();
  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json")
    .then(response => {
      if (!response.ok) throw Error("Land atlas unavailable");
      return response.json();
    })
    .then(topology => { land = makeLand(landFromTopology(topology)); updateLoop(); })
    .catch(() => { /* The local coastline is already visible. */ });
})();
