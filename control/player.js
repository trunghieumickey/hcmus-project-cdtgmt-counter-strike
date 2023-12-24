import * as THREE from 'three';
import { Capsule } from 'three/addons/math/Capsule.js';
import { worldOctree, playerOnFloor, playerCollider, playerVelocity, camera } from '../index.js';

const GRAVITY = 30;

export function createPlayer() {
    const Player = new THREE.Object3D();
    const PlayerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 2, 32);
    const PlayerMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const PlayerCollider = new Capsule(new THREE.Vector3(0, 0.35, 0), new THREE.Vector3(0, 1, 0), 0.35);
    const playerVelocity = new THREE.Vector3();
    const playerDirection = new THREE.Vector3();
    const PlayerMesh = new THREE.Mesh(PlayerGeometry, PlayerMaterial, PlayerCollider, playerVelocity, playerDirection);
    Player.add(PlayerMesh);
    return Player;
}

// function playerCollisions() {
//     const result = worldOctree.capsuleIntersect(playerCollider);
//     let playerOnFloor = false;
//     if (result) {
//         playerOnFloor = result.normal.y > 0;
//         if (!playerOnFloor) {
//             playerVelocity.addScaledVector(result.normal, - result.normal.dot(playerVelocity));
//         }
//         playerCollider.translate(result.normal.multiplyScalar(result.depth));
//     }
// }

// export function updatePlayer(deltaTime) {
//     let damping = Math.exp(- 4 * deltaTime) - 1;
//     if (!playerOnFloor) {
//         playerVelocity.y -= GRAVITY * deltaTime;
//         // small air resistance
//         damping *= 0.1;

//     }
//     playerVelocity.addScaledVector(playerVelocity, damping);
//     const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
//     playerCollider.translate(deltaPosition);
//     playerCollisions();
//     camera.position.copy(playerCollider.end);
// }

export function teleportPlayerIfOob() {
    if (camera.position.y <= - 25) {
        playerCollider.start.set(0, 0.35, 0);
        playerCollider.end.set(0, 1, 0);
        playerCollider.radius = 0.35;
        camera.position.copy(playerCollider.end);
        camera.rotation.set(0, 0, 0);
    }
}