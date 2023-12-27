import { camera, player, scene, listener } from './index.js';
import { playerOnFloor } from './player.js';
import { createGunBullet } from './gun_bullet.js';
import * as THREE from 'three';
export const keyStates = {};
let mouseTime = 0;

//// add keydown and keyup events to the document
export function control() {
    document.addEventListener('keydown', (event) => {
        keyStates[event.code] = true;
    });

    document.addEventListener('keyup', (event) => {
        keyStates[event.code] = false;
    });

    document.addEventListener('mousedown', () => {
        document.body.requestPointerLock();
        let mos = mouseTime;
        mos = performance.now();
    });

    document.addEventListener('mouseup', () => {
        if (document.pointerLockElement !== null) shoot();
    });

    document.body.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === document.body) {
            camera.rotation.y -= event.movementX / 500;
            camera.rotation.x -= event.movementY / 500;

            // Limit the vertical rotation of the camera
            camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, camera.rotation.x));

            if (player) { player.rotation.y = camera.rotation.y + Math.PI; }
        }
    });
}

////controls
function getForwardVector() {
    camera.getWorldDirection(player.playerDirection);
    player.playerDirection.y = 0;
    player.playerDirection.normalize();
    return player.playerDirection;
}

function getSideVector() {
    camera.getWorldDirection(player.playerDirection);
    player.playerDirection.y = 0;
    player.playerDirection.normalize();
    player.playerDirection.cross(camera.up);
    return player.playerDirection;
}

export function controls(deltaTime, characterFrame, mixer) {
    // gives a bit of air control
    if (player) {
        const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);
        if (keyStates['KeyW']) {
            player.playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
            mixer.update(characterFrame.getDelta());
        }

        if (keyStates['KeyS']) {
            player.playerVelocity.add(getForwardVector().multiplyScalar(- speedDelta));
            mixer.update(characterFrame.getDelta());
        }

        if (keyStates['KeyA']) {
            player.playerVelocity.add(getSideVector().multiplyScalar(- speedDelta));
            mixer.update(characterFrame.getDelta());
        }

        if (keyStates['KeyD']) {
            player.playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
            mixer.update(characterFrame.getDelta());
        }

        if (playerOnFloor) {
            if (keyStates['Space']) {
                player.playerVelocity.y = 10;
            }
        }
    }
}

// Load the sound
let gunSound;
const audioLoader = new THREE.AudioLoader();
audioLoader.load('sound/AK-47.mp3', function (buffer) {
    gunSound = new THREE.Audio(listener);
    gunSound.setVolume(0.1);
    gunSound.setBuffer(buffer);
});

let bullets = [];
function shoot() {
    // Create a bullet
    const bullet = createGunBullet();
    bullet.position.copy(camera.position);
    bullet.bulletVelocity.copy(getForwardVector().multiplyScalar(100));
    bullets.push(bullet);

    // Create a raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.set(camera.position, getForwardVector());
    raycaster.camera = camera; // Set the Raycaster.camera property to the camera object

    // Perform the raycast
    const intersects = raycaster.intersectObjects(scene.children, true);

    // Create a line to visualize the bullet trajectory
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
    const points = [];
    points.push(new THREE.Vector3().copy(camera.position));
    const ak47Range = intersects.length > 0 ? intersects[0].distance : 38;
    points.push(new THREE.Vector3().copy(camera.position).add(getForwardVector().multiplyScalar(ak47Range)));
    const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);

    // Play the sound
    gunSound.play();
    if (gunSound.isPlaying) {
        gunSound.stop();
        gunSound.play();
    }

    // Remove the bullet and line after 1 second
    setTimeout(() => {
        scene.remove(line);
        scene.remove(bullet);
    }, 1000);
}