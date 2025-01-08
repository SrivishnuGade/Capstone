// src/environment/ground.js
import * as THREE from 'three';

// creates a 3D ground plane of size 1000 x 1000 with a geenish hue and enables it to receive shadows

export function initGround(scene) {
    const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
    const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x77dd77 });
    const ground = new THREE.Mesh(planeGeometry, planeMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    ground.receiveShadow = true;
    scene.add(ground);
}
