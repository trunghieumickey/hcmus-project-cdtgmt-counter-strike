import { camera, player } from '../index.js';
import { playerOnFloor } from './player.js';

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
        if (document.pointerLockElement !== null) null;
    });

    document.body.addEventListener('mousemove', (event) => {
        if (document.pointerLockElement === document.body) {
            camera.rotation.y -= event.movementX / 500;
            camera.rotation.x -= event.movementY / 500;

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

export function controls(deltaTime) {
    // gives a bit of air control
    const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);
    if (keyStates['KeyW']) {
        player.playerVelocity.add(getForwardVector().multiplyScalar(speedDelta));
    }

    if (keyStates['KeyS']) {
        player.playerVelocity.add(getForwardVector().multiplyScalar(- speedDelta));
    }

    if (keyStates['KeyA']) {
        player.playerVelocity.add(getSideVector().multiplyScalar(- speedDelta));
    }

    if (keyStates['KeyD']) {
        player.playerVelocity.add(getSideVector().multiplyScalar(speedDelta));
    }

    if (playerOnFloor) {
        if (keyStates['Space']) {
            player.playerVelocity.y = 8;
        }
    }
}