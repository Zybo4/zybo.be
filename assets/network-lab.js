(() => {
  const lab = document.querySelector("[data-lab]");
  const atmosphere = document.querySelector(".hero-atmosphere");
  if (!lab || !atmosphere) return;

  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const starfield = atmosphere.querySelector(".atmosphere-stars");
  const stars = document.createDocumentFragment();
  let seed = 27413;

  function random() {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  }

  for (let i = 0; i < 105; i++) {
    const star = document.createElement("i");
    const near = i % 7 === 0;
    star.style.setProperty("--x", random() * 100 + "%");
    star.style.setProperty("--y", random() * 100 + "%");
    star.style.setProperty("--size", (near ? 1.5 + random() * .8 : .95 + random() * .55) + "px");
    star.style.setProperty("--alpha", (near ? .54 + random() * .33 : .32 + random() * .43));
    star.style.setProperty("--tone", i % 5 === 0 ? "#e1e5ff" : i % 3 === 0 ? "#a7ddff" : "#bac9f5");
    if (near) star.classList.add("star-twinkle");
    star.style.setProperty("--duration", 4.6 + random() * 5.4 + "s");
    star.style.setProperty("--delay", -random() * 7 + "s");
    stars.append(star);
  }
  starfield.append(stars);

  const controls = [...lab.querySelectorAll("[data-viewport]")];
  const preview = lab.querySelector(".device-preview");
  const sample = preview.querySelector(".demo-page");
  const size = lab.querySelector("[data-screen-width]");
  let screenTween;

  for (const button of controls) {
    button.addEventListener("click", () => {
      if (button.getAttribute("aria-pressed") === "true") return;
      preview.dataset.device = button.dataset.viewport;
      size.value = button.dataset.width + " px";
      for (const control of controls) {
        control.setAttribute("aria-pressed", String(control === button));
      }
      if (!motion.matches && window.gsap) {
        screenTween = window.gsap.fromTo(sample, { opacity: .55 }, {
          opacity: 1, duration: .45, ease: "power2.out", clearProps: "opacity", overwrite: true,
        });
      }
    });
  }

  const topology = lab.querySelector("[data-topology]");
  const prompt = lab.querySelector("[data-prompt]");
  const command = lab.querySelector("[data-command]");
  const result = lab.querySelector("[data-result]");
  const modeControls = lab.querySelector(".lab-modes");
  const modeButtons = [...modeControls.querySelectorAll("button")];
  const notes = lab.querySelector("[data-network-notes]");
  const clients = ["pc01", "pc02", "pc03"];
  const modes = {
    local: { command: "curl -I http://192.168.1.10", result: "HTTP/1.1 200 OK\ncontent-type: text/html" },
    internet: { command: "curl -I https://example.com", result: "HTTP/2 200 OK\ncontent-type: text/html" },
  };
  let mode = "local";
  let clientIndex = 0;
  let timer;
  let inView = false;

  function send(direction) {
    topology.classList.remove("is-running");
    topology.dataset.direction = direction;
    const previous = topology.querySelector(".is-path");
    previous?.classList.remove("is-path");
    topology.querySelector(`[data-${mode}="${clients[clientIndex]}"]`).classList.add("is-path");
    void topology.offsetWidth;
    topology.classList.add("is-running");
  }

  function startRequest() {
    const client = clients[clientIndex];
    topology.dataset.client = client;
    prompt.textContent = client.replace("pc", "pc-") + " $";
    result.textContent = "";
    send("request");

    timer = setTimeout(() => {
      send("response");
      timer = setTimeout(() => {
        result.textContent = modes[mode].result;
        timer = setTimeout(() => {
          clientIndex = (clientIndex + 1) % clients.length;
          startRequest();
        }, 2300);
      }, 1250);
    }, 1350);
  }

  function refresh() {
    clearTimeout(timer);
    topology.classList.remove("is-running");
    const visible = inView && !document.hidden;
    lab.classList.toggle("is-visible", visible);
    if (visible && !motion.matches) startRequest();
    else result.textContent = modes[mode].result;
  }

  for (const button of modeButtons) {
    button.addEventListener("click", () => {
      mode = button.dataset.networkMode;
      topology.dataset.mode = mode;
      notes.dataset.mode = mode;
      command.textContent = modes[mode].command;
      for (const control of modeButtons) control.setAttribute("aria-pressed", String(control === button));
      refresh();
    });
  }
  modeControls.hidden = false;

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      refresh();
    }, { threshold: .1 }).observe(topology);
    new IntersectionObserver(([entry]) => {
      atmosphere.classList.toggle("is-visible", entry.isIntersecting);
    }).observe(atmosphere);
  } else {
    inView = true;
    atmosphere.classList.add("is-visible");
    refresh();
  }
  document.addEventListener("visibilitychange", refresh);
  motion.addEventListener("change", () => {
    if (motion.matches && screenTween) {
      screenTween.kill();
      sample.style.removeProperty("opacity");
    }
    refresh();
  });

  const route = lab.querySelector("[data-web-route]");
  const map = route.querySelector(".route-map");
  const phases = [...route.querySelectorAll("[data-phase-button]")];
  const replay = route.querySelector("[data-route-play]");
  const head = route.querySelector(".route-head");
  const trail = route.querySelector(".route-trail");
  const paths = Object.fromEntries([...route.querySelectorAll("[data-path]")].map(path => [
    path.dataset.path, { path, length: path.getTotalLength() },
  ]));
  const sequence = ["dns", "tls", "http"];
  let routeFrame;
  let routePlayed = false;
  const travelTime = 1120;
  const serverPause = 380;
  const phaseTime = 2 * travelTime + serverPause + 660;

  function selectPhase(phase) {
    route.dataset.phase = phase;
    for (const step of phases) step.setAttribute("aria-pressed", String(step.dataset.phaseButton === phase));
  }

  function stopRoute() {
    cancelAnimationFrame(routeFrame);
    route.dataset.leg = "done";
  }

  function playRoute(steps) {
    routePlayed = true;
    stopRoute();
    selectPhase(steps[0]);
    if (motion.matches || document.hidden) return;
    let start;

    function update(time) {
      start ??= time;
      const elapsed = time - start;
      const phase = steps[Math.floor(elapsed / phaseTime)];
      if (!phase) {
        stopRoute();
        return;
      }
      if (route.dataset.phase !== phase) selectPhase(phase);
      const current = elapsed % phaseTime;
      const returning = current >= travelTime + serverPause;
      const progress = (returning ? current - travelTime - serverPause : current) / travelTime;
      route.dataset.leg = progress >= 1 ? (returning ? "done" : "received") : (returning ? "in" : "out");

      if (progress < 1) {
        const key = (phase === "dns" ? "dns" : "web") + (returning ? "-in" : "-out");
        const { path, length } = paths[key];
        const point = path.getPointAtLength(progress * length);
        head.setAttribute("cx", point.x);
        head.setAttribute("cy", point.y);
        const segments = Array.from({ length: 8 }, (_, index) => {
          const sample = path.getPointAtLength(Math.max(0, progress - .14 * (1 - index / 7)) * length);
          return `${sample.x} ${sample.y}`;
        });
        trail.setAttribute("d", "M" + segments.join(" L"));
      }
      routeFrame = requestAnimationFrame(update);
    }
    routeFrame = requestAnimationFrame(update);
  }

  for (const button of phases) {
    button.addEventListener("click", () => {
      const bounds = map.getBoundingClientRect();
      if (bounds.top < 0 || bounds.bottom > innerHeight) map.scrollIntoView({ block: "center", behavior: "instant" });
      playRoute([button.dataset.phaseButton]);
    });
  }
  replay.addEventListener("click", () => playRoute(sequence));
  replay.hidden = false;
  if ("IntersectionObserver" in window) {
    const routeObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (!routePlayed) playRoute(sequence);
      routeObserver.disconnect();
    }, { threshold: .28 });
    routeObserver.observe(map);
  }
  motion.addEventListener("change", stopRoute);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopRoute();
  });
})();
