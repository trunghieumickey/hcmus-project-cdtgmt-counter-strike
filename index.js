// Import Three.js from CDN
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import { Octree } from 'three/addons/math/Octree.js';
import { Capsule } from 'three/addons/math/Capsule.js';

import { createPlayer, teleportPlayerIfOob, updatePlayer, playerOnFloor } from './control/player.js';
import { control, controls, keyStates } from './control/control.js';

const STEPS_PER_FRAME = 5;
const worldOctree = new Octree();
const clock = new THREE.Clock();
const scene = new THREE.Scene();

//create overview camera (top down, flat)
const overviewCamera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
overviewCamera.position.set(0, 50, 0);
overviewCamera.rotation.x = - Math.PI / 2;


// Create a camera
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';
camera.lookAt(scene.position);

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb, 1);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

//create abient light
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

//import model
const gltfLoader = new GLTFLoader();
var mapModel;

gltfLoader.load('./model/dust2.glb', (gltf) => {
  mapModel = gltf.scene;
  scene.add(mapModel);

  // Create a bounding box
  const box = new THREE.Box3().setFromObject(mapModel);

  // Calculate the offset between the bounding box's center and the scene's center
  const offset = box.getCenter(new THREE.Vector3()).negate();

  // Apply the offset to the model's position
  mapModel.position.add(offset);

  worldOctree.fromGraphNode(mapModel);
  // Now the center of the bounding box should be at the scene's center
  animate();
});

window.addEventListener('resize', onWindowResize);

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}


// ====================== Player ======================
// Create a player
const player = createPlayer();
scene.add(player);
control();

export { worldOctree, player, camera, playerOnFloor };

function animate() {
  //console.log(worldOctree.objects);

  const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

  // we look for collisions in substeps to mitigate the risk of
  // an object traversing another too quickly for detection.

  for (let i = 0; i < STEPS_PER_FRAME; i++) {

    controls(deltaTime);
    updatePlayer(deltaTime);
    teleportPlayerIfOob();
  }
  if (keyStates['KeyQ']) {
    renderer.render(scene, overviewCamera);
  } else {
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

}