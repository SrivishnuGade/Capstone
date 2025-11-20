import mqtt from 'mqtt';
import { Room } from '../classes/room.js';
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
            const data = JSON.parse(message.toString());
            // console.log('Raw message received:', message.toString());
            console.log('Parsed data:', data);
            
            if (data.name) {
                try {
                    let name = data.name;
                    let l = parseFloat(data.length); // Ensure numeric
                    let w = parseFloat(data.width);  // Ensure numeric
                    let positionX = parseFloat(data.position[0])+w/2; // Ensure numeric
                    let positionY = parseFloat(data.position[1])+l/2; // Ensure numeric
                    let color = colorPalette[data.color];// || 0xD3D3D3; // Default to light gray if color not found
                    console.log(color);
                    console.log(data.color);
                    
                    // Validate parameters
                    if (isNaN(l) || isNaN(w) || isNaN(positionX) || isNaN(positionY)) {
                        throw new Error('Invalid numeric parameters');
                    }
                    
                    console.log('Creating:',
                        name, l, w, positionX, positionY
                    );
                    
                    // Create room and add to scene immediately
                    const room = new Room(name, scene, fullHouse, -positionX*3, positionY*3, w*3, l*3, 10, roof,color);
                    room.createRoom();

                    if(data.contact_points){
                        console.log(data.contact_points.bottom.used)
                        if(name!="Bathroom"){
                            if(data.contact_points.bottom.used){
                                room.addDoor('front');
                            }
                            else{
                                room.addWindow(w+1,4,'front');
                            }
                            if(data.contact_points.top.used){
                                room.addDoor('back');
                            }
                            else{
                                room.addWindow(w+1,4,'back');
                            }
                            if(data.contact_points.right.used){
                                room.addDoor('left');
                            }
                            else{
                                room.addWindow(l+1,4,'left');
                            }
                            if(data.contact_points.left.used){
                                room.addDoor('right');
                            }
                            else{
                                room.addWindow(l+1,4,'right');
                            }
                        }
                        else{
                            if(data.contact_points.bottom.used){
                                room.addDoor('front');
                                room.addWindow(2,2,'back',0,2);
                            }
                            else if(data.contact_points.top.used){
                                room.addDoor('back');
                                room.addWindow(2,2,'front',0,2);
                            }
                            
                            else if(data.contact_points.right.used){
                                room.addDoor('left');
                                room.addWindow(2,2,'right',0,2);
                            }
                            else{
                                room.addDoor('right');
                                room.addWindow(2,2,'left',0,2);
                            }
                        
                        }
                        
                    }


                    
                    // Force scene update
                    fullHouse.updateMatrixWorld(true);
                    renderer.render(scene, camera);
                    
                    // console.log('Room created and scene updated');
                } catch (roomError) {
                    console.error('Error creating room:', roomError);
                    console.error('Error stack:', roomError.stack);
                }
            } else {
                console.log('Message missing required "name" property');
            }
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