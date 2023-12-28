import * as THREE from 'three';
import { Capsule } from 'three/addons/math/Capsule.js';
import { worldOctree, player, camera } from './index.js';

export let playerOnFloor = false;
const GRAVITY = 30;
//const x = 102, z = -67;
const x = 106, z = -19;
const humanWidth = 0.3, humanHeight = 1.6;

export function createPlayer(model) {
    // const Player = new THREE.Object3D();
    // if (!characterModel) throw new Error('Character model not loaded');
    const Player = model;
    Player.scale.set(0.1, 0.1, 0.1);
    Player.playerDirection = new THREE.Vector3();
    Player.PlayerGeometry = new THREE.CylinderGeometry(humanWidth, humanWidth, humanHeight, 32);
    Player.playerCollider = new Capsule(new THREE.Vector3(x, humanWidth, z), new THREE.Vector3(x, humanHeight, z), humanWidth);
    // Player.playerCollider = new Capsule(characterBox.min, characterBox.max, humanWidth);
    // console.log(characterBox.max.sub(characterBox.min));
    Player.playerVelocity = new THREE.Vector3();

    // Create a sphere geometry to represent the point on top of the player
    const sphereGeometry = new THREE.SphereGeometry(20, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Yellow color
    const sphere = new THREE.Mesh(sphereGeometry, material);

    // Position the sphere on top of the player
    sphere.position.set(0, 2, 0); // Adjust the y value as needed

    // Add the sphere to the player object
    Player.add(sphere);

    return Player;
}

export function teleportPlayerIfOob() {
    if (camera.position.y <= - 25) {
        player.playerCollider.start.set(x, humanWidth, z);
        player.playerCollider.end.set(x, 1, z);
        player.playerCollider.radius = humanWidth;
        camera.position.copy(player.playerCollider.end);
        camera.rotation.set(0, 0, 0);
    }
}

function playerCollisions() {
    const result = worldOctree.capsuleIntersect(player.playerCollider);
    playerOnFloor = false;
    if (result) {
        playerOnFloor = result.normal.y > 0;
        if (!playerOnFloor) {
            player.playerVelocity.addScaledVector(result.normal, - result.normal.dot(player.playerVelocity));
        }
        player.playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }
}

export function updatePlayer(deltaTime) {
    if (player) {
        let damping = Math.exp(- 4 * deltaTime) - 1;
        if (!playerOnFloor) {
            player.playerVelocity.y -= GRAVITY * deltaTime;
            damping *= 0.1;
        }
        player.playerVelocity.addScaledVector(player.playerVelocity, damping);
        const deltaPosition = player.playerVelocity.clone().multiplyScalar(deltaTime);
        player.playerCollider.translate(deltaPosition);
        playerCollisions();
        camera.position.copy(player.playerCollider.end);
        player.position.copy(player.playerCollider.end);
        player.position.y -= player.playerCollider.radius;
    }
}