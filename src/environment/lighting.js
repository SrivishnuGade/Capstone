// src/environment/lighting.js
import * as THREE from 'three';

// creates a directional light with a white color and an intensity of 3 with a shadow casting property set to true
export function initLighting(scene) {
    const sunlight = new THREE.DirectionalLight(0xffffff, 3); // Adjusted intensity
    sunlight.position.set(100, 150, 100); // Adjusted position for better shadow casting
    sunlight.castShadow = true;
    sunlight.shadow.camera.left = -500;
    sunlight.shadow.camera.right = 500;
    sunlight.shadow.camera.top = 500;
    sunlight.shadow.camera.bottom = -500;
    sunlight.shadow.camera.near = 0.5;
    sunlight.shadow.camera.far = 1000;
    sunlight.shadow.bias = -0.0005;
    sunlight.shadow.mapSize.width = 4096;
    sunlight.shadow.mapSize.height = 4096;
    scene.add(sunlight);
}
