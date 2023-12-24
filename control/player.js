import * as THREE from 'three';
import { Capsule } from 'three/addons/math/Capsule.js';
import { worldOctree, player, camera } from '../index.js';

export let playerOnFloor = false;
const GRAVITY = 30;

export function createPlayer() {
    const Player = new THREE.Object3D();
    Player.playerDirection = new THREE.Vector3();
    Player.PlayerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
    Player.playerDirection = new THREE.Vector3();
    Player.playerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);
    Player.playerVelocity = new THREE.Vector3();
    return Player;
}

export function teleportPlayerIfOob() {
    if (camera.position.y <= - 25) {
        player.playerCollider.start.set(0, 0.35, 0);
        player.playerCollider.end.set(0, 1, 0);
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
}