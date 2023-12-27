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
    gunSound.setBuffer(buffer);
});

function shoot() {
    const gunBullet = createGunBullet();
    gunBullet.position.copy(camera.position);
    gunBullet.bulletVelocity = getForwardVector().multiplyScalar(20);
    scene.add(gunBullet);

    // // Create a line to visualize the bullet's trajectory
    // const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
    // const points = [];
    // //points.push(new THREE.Vector3().copy(camera.position));
    // points.push(new THREE.Vector3().copy(camera.position).add(gunBullet.bulletVelocityVelocity));
    // const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // const line = new THREE.Line(geometry, material);
    // scene.add(line);

    // Play the sound
    if (gunSound) {
        gunSound.play();
    }
    // Remove the bullet after 1 second
    setTimeout(() => {
        scene.remove(gunBullet);
        //scene.remove(line);
    }, 1000);
}