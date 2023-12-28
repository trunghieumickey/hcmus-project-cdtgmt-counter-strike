import mqtt from "mqtt";
import { player, scene } from "./index.js";
import * as THREE from "three";

const client = mqtt.connect('wss://test.mosquitto.org:8081');
const topic = 'hcmus-cs';
const playerID = Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, '0');

export function sendMessage(message) {
    client.publish(topic, message);
}

function messageHandler(message) {
    switch (message.action) {
        case 'move':
            if (message.playerID !== playerID) {
                let player = scene.getObjectByName(message.playerID);
                if (!player) {
                    player = new THREE.Mesh(
                        new THREE.CylinderGeometry(0.3, 0.3, 1.6, 32),
                        new THREE.MeshStandardMaterial({ color: 0xffffff })
                    );
                    player.name = message.playerID;
                    console.log("add new player")
                    scene.add(player);
                }
                player.position.set(message.position.x, message.position.y, message.position.z);
                player.rotation.y = message.position.r;
                console.log("player: ", player.position);
            }
            break;
        // case 'remove':
        //     if (message.playerID !== playerID) {
        //         const player = scene.getObjectByName(message.playerID);
        //         if (player) {
        //             scene.remove(player);
        //         }
        //     }
        //     break;
        // case 'create':
        //     if (message.playerID !== playerID) {
        //         const { x, y, z, r } = message.position;
        //         createPlayer(message.playerID, x, y, z, r);
        //     }
        //     break;
        default:
            break;
    }
}

let lastSentMessage = null;

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe(topic);
    //for every 500ms, send a message to the server
    setInterval(() => {
        const currentMessage = JSON.stringify({
            playerID: playerID,
            action: 'move',
            position: {
                x: player.position.x.toFixed(2),
                y: player.position.y.toFixed(2),
                z: player.position.z.toFixed(2),
                r: player.rotation.y.toFixed(2),
            },
        });

        if (currentMessage !== lastSentMessage) {
            sendMessage(currentMessage);
            lastSentMessage = currentMessage;
        }
    }, 100);
});

client.on('message', (topic, message) => {
    message = JSON.parse(message);
    messageHandler(message);
});