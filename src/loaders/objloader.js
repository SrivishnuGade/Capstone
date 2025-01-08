// src/loaders/objLoader.js
// This code loads the road model from the OBJ file
// and adds it to the scene.
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

export function loadRoad(scene) {
    const objLoader = new OBJLoader();
    objLoader.load('/assets/USARoad.obj', (obj) => {
        obj.scale.set(4.9, 4.9, 4.9);
        obj.rotation.x = -Math.PI / 2;
        obj.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
            }
        });
        scene.add(obj);
    });
}
