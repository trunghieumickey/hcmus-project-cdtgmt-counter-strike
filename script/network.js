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
            position: player.position,
            rotation: player.rotation,
            status: 0, // Replace with the actual player status
        }));
    }, 500);
});

client.on('message', (topic, message) => {
    console.log(`Received message on ${topic}: ${message.toString()}`);
    null; // Use a function to handle the message here
});