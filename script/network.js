import mqtt from "mqtt";
import { player, characterModel, scene } from "./index.js";
import { createPlayer } from "./player.js";

const client = mqtt.connect('wss://test.mosquitto.org:8081');
const topic = 'hcmus-cs';
const playerID = Math.floor(Math.random() * 0x100000000).toString(16).padStart(8, '0');

export function sendMessage(message) {
    client.publish(topic, message);
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
    }, 500);
});

client.on('message', (topic, message) => {
    message = JSON.parse(message);
    console.log(message);
});