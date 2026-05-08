/**
 * globe.js — esaLab 3D globe for the homepage hero
 * Uses three-globe + TrackballControls. No jQuery.
 */
import ThreeGlobe from "three-globe";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Fog,
} from "three";

const container = document.getElementById("globe-container");
if (!container) throw new Error("No #globe-container found in DOM");

// ── Globe ──────────────────────────────────────────────────────────────────
const globe = new ThreeGlobe()
  .globeImageUrl("img/nasa_night_lights.jpg")
  .bumpImageUrl("img/earth-topology.png");

const isDesktop = window.innerWidth >= 992;
const s = isDesktop ? 1.5 : 1;
globe.scale.set(s, s, s);

// ── Renderer ───────────────────────────────────────────────────────────────
const renderer = new WebGLRenderer({ antialias: false, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setClearColor(0x000000, 0);
container.appendChild(renderer.domElement);

// ── Scene ──────────────────────────────────────────────────────────────────
const scene = new Scene();
scene.add(globe);
scene.add(new AmbientLight(0xbbbbbb));
scene.add(new DirectionalLight(0xffffff, 0.6));
scene.fog = new Fog(0x535ef3, 400, 2000);

// ── Camera ─────────────────────────────────────────────────────────────────
const camera = new PerspectiveCamera(
  75,
  container.clientWidth / container.clientHeight,
  0.1,
  2000
);
camera.position.z = 300;

// ── Controls ───────────────────────────────────────────────────────────────
const controls = new TrackballControls(camera, renderer.domElement);
controls.minDistance = 101;
controls.rotateSpeed = 5;
controls.zoomSpeed = 0.8;

// ── Click to zoom ──────────────────────────────────────────────────────────
container.addEventListener("click", () => {
  const at = globe.scale.x;
  const to = at < 1.4 ? 1.5 : 1;
  globe.scale.set(to, to, to);
});

// ── Resize ─────────────────────────────────────────────────────────────────
const ro = new ResizeObserver(() => {
  const w = container.clientWidth;
  const h = container.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});
ro.observe(container);

// ── Render loop ────────────────────────────────────────────────────────────
(function tick() {
  requestAnimationFrame(tick);
  controls.update();
  globe.rotation.y -= 0.006;
  renderer.render(scene, camera);
})();
