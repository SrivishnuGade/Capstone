// src/environment/fog.js
import * as THREE from 'three';

// adds a light blue colour fog with near and far distances as 200 and 1200
export function initFog(scene) {
    scene.fog = new THREE.Fog(0x87CEEB, 200, 1200);
}
