import "three"
import "three-globe";
import ThreeGlobe from "three-globe";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls.js";
import { WebGLRenderer, Scene } from "three";

import {
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  // Color,
  Fog
  // AxesHelper,
  // DirectionalLightHelper,
  // CameraHelper,
  // PointLight,
  // SphereGeometry,
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
    .arcsData(arcsData)
    .arcColor('color')
    .arcDashLength(0.4)
    .arcDashGap(3)
    .arcDashInitialGap(() => Math.random() * 5)
    .arcDashAnimateTime(1000)
let globeSize = 100;
if (window.innerWidth < 781) {
  globeSize = 50;
}
else if (window.innerWidth >= 1200) {
  globeSize = 150;
}

const options = {
  globeSize: globeSize,
};

globe.init(options);
globe.render();

window.addEventListener('resize', () => {
  if (window.innerWidth < 781) {
    globeSize = 50;
  } else if (window.innerWidth >= 1200) {
    globeSize = 150;
  }
  else {
    globeSize = 100;
  }

options.globeSize = globeSize;
globe.updateGeometry(options)
globe.render();
});

// globe.scale.x = 1.5;
// globe.scale.y = 1.5;
// globe.scale.z = 1.5;

// Set up renderer

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('my_globe').appendChild(renderer.domElement);

// Setup scene 

const scene = new Scene();
scene.add(globe);
scene.add(new AmbientLight(0xbbbbbb));
scene.add(new DirectionalLight(0xffffff, 0.6));

  // Additional effects
scene.fog = new Fog(0x535ef3, 400, 2000);

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


// Kick-off renderer

function animate() {
  // Frame cycle
  tbControls.update();
  globe.rotation.y += 0.001
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();



