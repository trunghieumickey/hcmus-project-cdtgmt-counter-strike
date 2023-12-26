// Import Three.js from CDN
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import { Octree } from 'three/addons/math/Octree.js';
import { createPlayer, teleportPlayerIfOob, updatePlayer } from './player.js';
import { control, controls, keyStates } from './control.js';

const STEPS_PER_FRAME = 5;
const worldOctree = new Octree();
const clock = new THREE.Clock();
const scene = new THREE.Scene();

//create overview camera (top down, flat)
const overviewCamera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
overviewCamera.position.set(0, 100, 0);
overviewCamera.rotation.x = - Math.PI / 2;

// Create a camera
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.rotation.order = 'YXZ';
camera.castShadow = true;
camera.lookAt(scene.position);
scene.add(camera);

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x87ceeb, 1);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

function createPointLight(x, y, z) {
  const light = new THREE.PointLight(0xffffff, 1, 100);
  light.position.set(x, y, z);
  light.shadowCameraVisible = true;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;
  light.shadow.camera.near = 20;
  light.shadow.camera.far = 100;
  light.shadow.bias = 0.0001;
  scene.add(light);

  //add helper for light
  const helper = new THREE.PointLightHelper(light);
  scene.add(helper);
}

let lighting = true;
if (lighting) {
  //create directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(-100, 40, -4);
  directionalLight.castShadow = true;

  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 20;
  directionalLight.shadow.camera.far = 100;
  directionalLight.shadow.bias = 0.0001;
  scene.add(directionalLight);

  const helper = new THREE.DirectionalLightHelper(directionalLight);
  scene.add(helper);

  //Light in Dust II
  createPointLight(79.57287971308995, -5.643300100652871, -58.85797348022461);
  createPointLight(21.990610489906908, -0.7, -25.158002472422947);
  createPointLight(44.555808320115744, -0.7, -23.060394986331307);
  createPointLight(48.18740035517612, -4.729054642021601, -34.036189584549135);
  createPointLight(103.95813903808593, -6.2782811685022695, 0.44196676611882085);
  createPointLight(84.7581573486328, -2.2301502346108763, -8.761638723017235);

  //Light in Dust

  //Ambient Light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
  scene.add(ambientLight);

}
else {
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);
}

//import model
const gltfLoader = new GLTFLoader();
var mapModel;

gltfLoader.load('./model/dust.glb', (gltf) => {
  mapModel = gltf.scene;

  // Traverse through all the meshes in the model
  mapModel.traverse(function (node) {
    if (node instanceof THREE.Mesh) {
      // Enable shadows for this mesh
      node.castShadow = true;
      node.receiveShadow = true;

      node.material = new THREE.MeshPhongMaterial({ map: node.material.map });
    }
  });

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
},
  (error) => {
    console.error('An error occurred while loading the map model:', error);
  }
);

window.addEventListener('resize', onWindowResize);

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

}

const textureLoader = new THREE.TextureLoader();
const crosshairTexture = textureLoader.load('sprite/crosshair.png');
const crosshairMaterial = new THREE.SpriteMaterial({ map: crosshairTexture });
const crosshair = new THREE.Sprite(crosshairMaterial);
crosshair.scale.set(0.02, 0.02, 0.02);
crosshair.position.set(0, 0, -0.5);
camera.add(crosshair);

// ====================== Player ======================
// Create a player
var characterModel, characterBox, mixer, player;
let characterFrame = new THREE.Clock();
gltfLoader.load('./model/walking.glb', (gltf) => {
  characterModel = gltf.scene;
  characterModel.scale.set(0.1, 0.1, 0.1);
  characterBox = new THREE.Box3().setFromObject(characterModel);

  player = createPlayer(characterModel);
  scene.add(player);

  const animation = gltf.animations[0];
  mixer = new THREE.AnimationMixer(characterModel);
  const action = mixer.clipAction(animation);
  action.play();
  animate();
},
  (error) => {
    console.error('An error occurred while loading the character model:', error);
  }
);

control();

export { worldOctree, player, camera, characterBox };

function animate() {
  //console.log(worldOctree.objects);
  console.log(`Camera position - ${camera.position.x}, ${camera.position.y}, ${camera.position.z}`);

  const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

  // we look for collisions in substeps to mitigate the risk of
  // an object traversing another too quickly for detection.

  for (let i = 0; i < STEPS_PER_FRAME; i++) {
    if (player) {
      // console.log(player.position)
      controls(deltaTime, characterFrame, mixer);
      updatePlayer(deltaTime);
      teleportPlayerIfOob();
    }

  }
  if (keyStates['KeyQ']) {
    renderer.render(scene, overviewCamera);
  } else {
    renderer.render(scene, camera);
  }
  requestAnimationFrame(animate);

}