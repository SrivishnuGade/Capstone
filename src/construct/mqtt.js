import mqtt from 'mqtt';
import * as THREE from 'three';
import { scale } from '../scenes/mainScene.js';
import { Room } from '../classes/room.js';
import { getRoomColor } from './color.js';
export function constructMQTT(scene, fullHouse, camera, renderer, roof) {
    // const mqtt = require('mqtt');
    // MQTT broker configuration
    const brokerConfig = {
        host: 'cda8dea3eb4c4036a2389d3011a09c5f.s1.eu.hivemq.cloud',
        port: 8884,
        protocol: 'wss',
        username: 'hivemq.webclient.1728110744101',
        password: '%yk*1$<vM5PGzl9wUYZ7',
        clientId: `mqtt_${Math.random().toString(16).slice(2, 8)}`,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000,
        // Add these SSL/TLS options
        rejectUnauthorized: false,
        protocolVersion: 4
    };

    const topic = '/test_topic';

    // Create MQTT client
    const client = mqtt.connect('cda8dea3eb4c4036a2389d3011a09c5f.s1.eu.hivemq.cloud:8884/mqtt', brokerConfig);

    // Add status indicator
    const mqttStatus = document.createElement('div');
    mqttStatus.style.position = 'absolute';
    mqttStatus.style.bottom = '20px';
    mqttStatus.style.left = '20px';
    mqttStatus.style.padding = '10px';
    mqttStatus.style.backgroundColor = '#333';
    mqttStatus.style.color = 'white';
    mqttStatus.style.borderRadius = '5px';
    mqttStatus.style.fontFamily = 'Arial';
    document.body.appendChild(mqttStatus);

    const roofContainer = document.createElement('div');
    roofContainer.style.position = 'absolute';
    roofContainer.style.top = '20px';
    roofContainer.style.right = '20px';
    roofContainer.style.padding = '8px';
    roofContainer.style.backgroundColor = 'rgba(0,0,0,0.5)';
    roofContainer.style.color = 'white';
    roofContainer.style.borderRadius = '4px';
    roofContainer.style.fontFamily = 'Arial';
    roofContainer.style.zIndex = 9999;

    const roofInput = document.createElement('input');
    roofInput.type = 'checkbox';
    roofInput.id = 'roofToggle';
    roofInput.checked = Boolean(roof);

    const roofLabel = document.createElement('label');
    roofLabel.htmlFor = 'roofToggle';
    roofLabel.style.marginLeft = '6px';
    roofLabel.textContent = 'Roof';

    roofContainer.appendChild(roofInput);
    roofContainer.appendChild(roofLabel);
    document.body.appendChild(roofContainer);

    let currentRoofValue = roofInput.checked;
    let lastPayload = null;

    roofInput.addEventListener('change', () => {
        currentRoofValue = roofInput.checked;
        if (lastPayload) {
            rebuildFromPayload(lastPayload);
        }
    });

    function rebuildFromPayload(json) {
        currentRoofValue = roofInput.checked;
        scene.remove(fullHouse);
        fullHouse = new THREE.Group();
        scene.add(fullHouse);

        let max_x = 0;
        let min_y = 0;
        const wallMap = { top: 'front', bottom: 'back', left: 'left', right: 'right' };
        const roomsByName = new Map();
        json.rooms.forEach(item => {
            const name = item.name;
            const length = Number(item.length ?? 0);
            const width = Number(item.width ?? 0);
            const x = Number(item.x);
            const y = Number(item.y);
            if (x+length/2>max_x) max_x = x+length/2;
            if (y-width/2<min_y) min_y = y-width/2;
            console.log(item)
            const room = new Room(name, scene,fullHouse, x,y, length,width, 10,currentRoofValue,getRoomColor(name));
            room.createRoom();
            roomsByName.set(name, room);

            const adj = item.adjacency || {};

            if (/^Bathroom/i.test(name)) {
                if (!adj.top || adj.top.length === 0) {
                    room.addWindow(2, 2, wallMap.top,0,2);
                } else if (!adj.bottom || adj.bottom.length === 0) {
                    room.addWindow(2, 2, wallMap.bottom,0,2);
                } else if (!adj.left || adj.left.length === 0) {
                    room.addWindow(2, 2, wallMap.left,0,2);
                } else if (!adj.right || adj.right.length === 0) {
                    room.addWindow(2, 2, wallMap.right,0,2);
                }
            }
            else if (/^Balcony/i.test(name)) {
                room.addCavity('back', length);
                room.addCavity('right', width);
                room.addCavity('left', width);
                room.addCavity('front', length);
            }
            else{
                
                if (!adj.top || adj.top.length === 0) {
                    room.addWindow(length*0.6,4, wallMap.top);
                }
                if (!adj.bottom || adj.bottom.length === 0) {
                    room.addWindow(length*0.6,4, wallMap.bottom);
                }
                if (!adj.left || adj.left.length === 0) {
                    room.addWindow(width*0.6,4, wallMap.left);
                }
                if (!adj.right || adj.right.length === 0) {
                    room.addWindow(width*0.6,4, wallMap.right);
                }
            }
        
        });
        json.doors.forEach(doorData => {
            const x = doorData.x;
            const y = doorData.y;
            const r1 = roomsByName.get(doorData.room1);
            const r2 = roomsByName.get(doorData.room2);
            if (!r1 || !r2) return;

            const isBalcony1 = /^Balcony/i.test(doorData.room1 || '');
            const isBalcony2 = /^Balcony/i.test(doorData.room2 || '');

            // if both are balconies, skip adding doors
            if (isBalcony1 && isBalcony2) return;

            if (doorData.orientation === 'vertical') {
                // compute positions for both sides
                const r1RightPos = r1.y / scale - y;
                const r2LeftPos = y - r2.y / scale;
                const r1LeftPos = y - r1.y / scale;
                const r2RightPos = r2.y / scale - y;

                if (r1.x < r2.x) {
                    if (!isBalcony1) r1.addDoor('right', r1RightPos);
                    if (!isBalcony2) r2.addDoor('left', r2LeftPos);
                } else {
                    if (!isBalcony1) r1.addDoor('left', r1LeftPos);
                    if (!isBalcony2) r2.addDoor('right', r2RightPos);
                }
            } else {
                // horizontal / front-back
                const r1BackPos = x - r1.x / scale;
                const r2FrontPos = r2.x / scale - x;
                const r1FrontPos = r1.x / scale - x;
                const r2BackPos = x - r2.x / scale;

                if (r1.y < r2.y) {
                    if (!isBalcony1) r1.addDoor('back', r1BackPos);
                    if (!isBalcony2) r2.addDoor('front', r2FrontPos);
                } else {
                    if (!isBalcony1) r1.addDoor('front', r1FrontPos);
                    if (!isBalcony2) r2.addDoor('back', r2BackPos);
                }
            }
        });
        fullHouse.translateX(-max_x/2*scale);
        fullHouse.translateZ(-min_y/2*scale);
    }

    // Connection handler
    client.on('connect', () => {
        console.log('Connected to MQTT broker');
        mqttStatus.textContent = '🟢 MQTT Connected';
        mqttStatus.style.backgroundColor = '#4CAF50';
        
        // Subscribe to topic
        client.subscribe(topic, { qos: 1 }, (err) => {
            if (!err) {
                console.log(`Subscribed to ${topic}`);
            } else {
                console.error('Subscription error:', err);
                mqttStatus.textContent = '🔴 Sub Error';
                mqttStatus.style.backgroundColor = '#f44336';
            }
        });
    });

    const colorPalette = {
        "lightblue": 0xADD8E6,
        "lightyellow": 0xFFFFE0,
        "lightgreen": 0x90EE90,
        "lightpink": 0xFFB6C1,
        "lightgray": 0xD3D3D3,
        "lightsalmon": 0xFFA07A,
        "lightcyan": 0xE0FFFF,
        "thistle": 0xD8BFD8,
        "gainsboro": 0xDCDCDC,
        "lavender": 0xE6E6FA,
        "wheat": 0xF5DEB3
    };

    client.on('message', (topic, message) => {
        try {
            const json = JSON.parse(message.toString());
            lastPayload = json;
            console.log('Parsed data:', json);
            rebuildFromPayload(json);

        } catch (e) {
            console.error('JSON parsing error:', e);
            console.log('Raw message:', message.toString());
        }
    });

    // Reconnect handler
    client.on('reconnect', () => {
        console.log('Attempting to reconnect...');
        mqttStatus.textContent = '🟡 Reconnecting...';
        mqttStatus.style.backgroundColor = '#ff9800';
    });

    // Error handler
    client.on('error', (err) => {
        console.error('Connection error:', err);
        mqttStatus.textContent = '🔴 Connection Error';
        mqttStatus.style.backgroundColor = '#f44336';
    });

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    client.on('close', () => {
        console.log('Connection closed');
        if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Reconnection attempt ${reconnectAttempts}`);
            setTimeout(() => client.reconnect(), 5000);
        }
    });

    // Cleanup
    window.addEventListener('beforeunload', () => {
        if (client && client.connected) {
            client.end();
        }
    });
}