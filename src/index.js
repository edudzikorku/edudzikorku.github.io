import "three"
import "three-globe";
import ThreeGlobe from "three-globe";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import { WebGLRenderer, Scene } from "three";

import {
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Color,
  Fog, TextureLoader, MeshBasicMaterial, PlaneGeometry,
  RepeatWrapping
} from "three";


// Gen random  data
const N = 50;
const arcsData = [...Array(N).keys()].map(() => ({
  startLat: (Math.random() - 0.5) * 180,
  startLng: (Math.random() - 0.5) * 360,
  endLat: (Math.random() - 0.5) * 180,
  endLng: (Math.random() - 0.5) * 360,
  color: ['red', 'yellow', 'white', 'blue'][Math.round(Math.random() * 4)]
}));

const globe = new ThreeGlobe()
    .globeImageUrl('./img/nasa_night_lights.jpg')
    .bumpImageUrl('./img/earth-topology.png')
    // .arcsData(arcsData)
    // .arcColor('color')
    // .arcDashLength(0.4)
    // .arcDashGap(3)
    // .arcDashInitialGap(() => Math.random() * 5)
    // .arcDashAnimateTime(1000)

// Set globe size based on different viewports

if (window.innerWidth < 781) {
  globe.scale.x = 1;
  globe.scale.y = 1;
  globe.scale.z = 1;
} else {
globe.scale.x = 1.5;
globe.scale.y = 1.5;
globe.scale.z = 1.5;
}
// Set up renderer

const renderer = new WebGLRenderer({ antialias: false, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('my_globe').appendChild(renderer.domElement);

// Setup scene

const scene = new Scene();
scene.add(globe);
scene.add(new AmbientLight(0xbbbbbb));
scene.add(new DirectionalLight(0xffffff, 0.6));

  // Additional effects
scene.fog = new Fog(0x535ef3, 400, 2000);
// set up a backdrop image
// load image as texture
const textureLoader = new TextureLoader();
const galaxyTexture = textureLoader.load('./img/galaxy_i.jpg');
galaxyTexture.wrapS = RepeatWrapping;
galaxyTexture.wrapT = RepeatWrapping;

galaxyTexture.repeat.x = 1;
galaxyTexture.repeat.y = 1;
scene.background = galaxyTexture;

//  Setup camera

const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.aspect = window.innerWidth / window.innerHeight;
camera.updateProjectionMatrix();
camera.position.z = 300;

// Handle zoom in and out

globe.addEventListener('click', zoomInOut);

function zoomInOut () {
  // Zoom in
  if (globe.scale.x === 1) {
    globe.scale.x = 1.5;
    globe.scale.y = 1.5;
    globe.scale.z = 1.5;
  }
  // Zoom out
  else {
    globe.scale.x = 1;
    globe.scale.y = 1;
    globe.scale.z = 1;
  }
};


// Function for auto zoom

// Call the autoZoom function every 30 seconds (30000 milliseconds)
// setInterval(autoZoom, 30000);

// function autoZoom () {
//   // Zoom in
//   if (globe.scale.x === 1) {
//     globe.scale.x = 1.5;
//     globe.scale.y = 1.5;
//     globe.scale.z = 1.5;
//   }
//   // Zoom out
//   else {
//     globe.scale.x = 1;
//     globe.scale.y = 1;
//     globe.scale.z = 1;
//   }
// };


// Add camera controls

const tbControls = new TrackballControls(camera, renderer.domElement);
tbControls.minDistance = 101;
tbControls.rotateSpeed = 5;
tbControls.zoomSpeep = 0.8;

// mimic earth's anticlockwise rotation
// const earthRotationalVelocityKmp = 1670;
// const earthRadius = 1;

// // calculate rotation angle based on frame rate
// const frameRate = 60;
// const timePerFrame = 1 / frameRate; // time per frame in seconds
// // earth's rotational velocity per frame in km
// const rotationalVelocityPerFrameKph = (earthRotationalVelocityKmp * 1000 / 3600) * timePerFrame;
// // earth's rotational velocity per frame in radians
// const rotationalVelocityPerRadians = (rotationalVelocityPerFrameKph / earthRadius) * (Math.PI / 180);



// Kick-off renderer

function animate() {
  // Frame cycle
  tbControls.update();
  globe.rotation.y -= 0.006;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

var ourWorldDiv = document.getElementById("our_world");
var portrait = window.matchMedia("(orientation: portrait)");

function handleOrientation(e) {
  if (window.innerWidth < 781 && e.matches) {
    ourWorldDiv.classList.add("col-12 col-sm-6 text-center");
  } else {
    ourWorldDiv.classList.remove("'col-12 col-sm-6 text-center'");
  }
}

portrait.addEventListener("change", handleOrientation);

handleOrientation(portrait);

