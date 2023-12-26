import * as THREE from 'three';
import { Capsule } from 'three/addons/math/Capsule.js';
import { worldOctree, player, camera, characterBox } from './index.js';

export let playerOnFloor = false;
const GRAVITY = 30;
const x = 102, z = -67;

export function createPlayer(model) {
    // const Player = new THREE.Object3D();
    // if (!characterModel) throw new Error('Character model not loaded');
    const Player = model;
    Player.playerDirection = new THREE.Vector3();
    Player.PlayerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
    Player.playerDirection = new THREE.Vector3();
    Player.playerCollider = new Capsule(new THREE.Vector3(x, 0.35, z), new THREE.Vector3(x, 1, z), 0.35);
    // Player.playerCollider = new Capsule(characterBox.min, characterBox.max, 0.35);
    // console.log(characterBox.max.sub(characterBox.min));
    Player.playerVelocity = new THREE.Vector3();
    return Player;
}

export function teleportPlayerIfOob() {
    if (camera.position.y <= - 25) {
        player.playerCollider.start.set(x, 0.5, z);
        player.playerCollider.end.set(x, 1, z);
        player.playerCollider.radius = 0.35;
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