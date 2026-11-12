import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

function ribbonGeometry() {
  const steps = 240;
  const width = 0.58;
  const depth = 0.095;
  const positions = [];
  const indices = [];

  function path(t) {
    return new THREE.Vector3(2.12 * Math.cos(t), 1.46 * Math.sin(t), .76 * Math.sin(2 * t + .4));
  }

  for (let index = 0; index <= steps; index++) {
    const t = index / steps * Math.PI * 2;
    const point = path(t);
    const tangent = path(t + .002).sub(path(t - .002)).normalize();
    const across = new THREE.Vector3(Math.cos(t), Math.sin(t), 0);
    across.addScaledVector(tangent, -across.dot(tangent))
      .normalize()
      .applyAxisAngle(tangent, 1.12 * Math.sin(t + .55));
    const normal = new THREE.Vector3().crossVectors(tangent, across).normalize();

    for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const vertex = point.clone().addScaledVector(across, u * width).addScaledVector(normal, v * depth);
      positions.push(vertex.x, vertex.y, vertex.z);
    }
    if (index === 0) continue;
    for (let face = 0; face < 4; face++) {
      const a = (index - 1) * 4 + face;
      const b = (index - 1) * 4 + (face + 1) % 4;
      indices.push(a, b, a + 4, b, b + 4, a + 4);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function addStudioLights(scene) {
  scene.add(new THREE.HemisphereLight(0xb3caff, 0x15235c, 2.4));
  for (const [color, power, x, y, z] of [
    [0xcad9ff, 4.5, -3, 5, 5],
    [0x7188ff, 4, 4, 1, -4],
    [0x366dff, 2.2, -4, -4, 3],
  ]) {
    const light = new THREE.DirectionalLight(color, power);
    light.position.set(x, y, z);
    scene.add(light);
  }
}

export function enhanceHero(stage, motionPreference) {
  const mount = stage.querySelector("[data-canvas]");
  const hero = stage.closest(".hero");
  const toggle = hero.querySelector("[data-scene-toggle]");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(37, 1, .1, 100);
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.setAttribute("aria-hidden", "true");
  mount.append(renderer.domElement);

  const sculpture = new THREE.Group();
  sculpture.add(new THREE.Mesh(ribbonGeometry(), new THREE.MeshPhysicalMaterial({
    color: 0x2048ed, metalness: .28, roughness: .24, clearcoat: 1, clearcoatRoughness: .18,
    side: THREE.DoubleSide,
  })));
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(3.05, .008, 8, 160),
    new THREE.MeshBasicMaterial({ color: 0x6e93ff, opacity: .39, transparent: true }),
  );
  ring.rotation.set(1.2, -.36, -.44);
  sculpture.add(ring);
  scene.add(sculpture);
  addStudioLights(scene);

  const pointer = new THREE.Vector2();
  let active = false;
  let visible = true;
  let usable = true;

  function size() {
    const { clientWidth: width, clientHeight: height } = mount;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.position.set(camera.aspect > 1.35 ? -.75 : 0, 0, camera.aspect > 1.35 ? 10.2 : 11.7);
    camera.lookAt(camera.position.x, 0, 0);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  function draw(time) {
    sculpture.rotation.x = THREE.MathUtils.lerp(sculpture.rotation.x, .26 + pointer.y * .34, .055);
    sculpture.rotation.y = THREE.MathUtils.lerp(sculpture.rotation.y, .3 + pointer.x * .54 + Math.sin(time * .00062) * .22, .05);
    sculpture.rotation.z = -.34 + Math.sin(time * .00046) * .08;
    renderer.render(scene, camera);
  }

  function updateAnimation() {
    renderer.setAnimationLoop(active && visible && !document.hidden && usable ? draw : null);
  }

  function showScene(show) {
    active = show;
    stage.classList.toggle("is-live", show);
    toggle.setAttribute("aria-pressed", String(show));
    if (show) {
      size();
      draw(0);
    }
    updateAnimation();
  }

  toggle.addEventListener("click", () => showScene(!active));
  hero.addEventListener("pointermove", event => {
    if (!active || event.pointerType === "touch") return;
    const rect = stage.getBoundingClientRect();
    pointer.set(
      THREE.MathUtils.clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1),
      THREE.MathUtils.clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1),
    );
  }, { passive: true });
  hero.addEventListener("pointerleave", () => pointer.set(0, 0));
  const resize = new ResizeObserver(() => {
    if (active) size();
  });
  resize.observe(mount);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    updateAnimation();
  });
  intersection.observe(stage);
  document.addEventListener("visibilitychange", updateAnimation);
  motionPreference.addEventListener("change", () => {
    if (motionPreference.matches) showScene(false);
    toggle.hidden = motionPreference.matches || !usable;
  });
  renderer.domElement.addEventListener("webglcontextlost", () => {
    usable = false;
    showScene(false);
    toggle.hidden = true;
    resize.disconnect();
    intersection.disconnect();
  });

  size();
  toggle.hidden = motionPreference.matches;
}
