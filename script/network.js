import mqtt from "mqtt";
import { player } from "./index.js";

const client = mqtt.connect('wss://test.mosquitto.org:8081');
const topic = 'hcmus-cs';

export function sendMessage(message) {
    client.publish(topic, message);
}

client.on('connect', () => {
    console.log('Connected to MQTT broker');
    client.subscribe(topic);
    //for every 500ms, send a message to the server
    setInterval(() => {
        sendMessage(JSON.stringify({
            playerNumber: 1, // Replace with the actual player number
            action: 'move',
            position:{
                x: player.position.x.toFixed(2),
                y: player.position.y.toFixed(2),
                z: player.position.z.toFixed(2),
                r: player.rotation.y.toFixed(2),
            },
        }));
    }, 500);
});

client.on('message', (topic, message) => {
    console.log(`Received message on ${topic}: ${message.toString()}`);
    null; // Use a function to handle the message here
});