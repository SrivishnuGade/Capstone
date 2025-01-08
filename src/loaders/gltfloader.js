// src/loaders/gltfLoader.js
// This code loads the required number of cars based on traffic level
// and adds them to the scene. It also clones the cars and adds them to the scene
// at different positions and rotations to simulate traffic.

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three'; // Import THREE if not done elsewhere

// Define cars globally within the module (but not in the function)
const cars = {};
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/assets/draco/'); // Path to Draco decoder files

// GLTF Loader Setup
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);


// const gltfLoader = new GLTFLoader();
export function loadModel(scene,name, path, scale, positionY = 0, counter = 0, l = 0,traffic_level) {
    return new Promise((resolve, reject) => {
        gltfLoader.load(path, function (gltf) {
            const model = gltf.scene;
            model.scale.set(scale, scale, scale);
            model.position.set(-counter, positionY, -(90 + l * 30));
            model.castShadow = true;
            model.receiveShadow = true;

            if (!cars[name]) {
                cars[name] = [];
            }

            cars[name].push(model);

            model.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.renderOrder = 1;
                    if (child.material) {
                        child.material = child.material.clone();
                        child.material.depthWrite = true;
                    }
                }
            });

            scene.add(model);

            const rotations = [Math.PI, Math.PI / 2, -Math.PI / 2];
            const positions = [
                new THREE.Vector3(counter, positionY, (90 + l * 30)),
                new THREE.Vector3(-(90 + l * 30), positionY, counter),
                new THREE.Vector3((90 + l * 30), positionY, -counter)
            ];

            rotations.forEach((rot, index) => {
                const clone = model.clone();
                clone.rotation.y = rot;
                clone.position.copy(positions[index]);

                cars[name].push(clone);
                scene.add(clone);
            });
            
            if(traffic_level === 'medium' || traffic_level === 'high'){
                const rotations2 = [0,Math.PI, Math.PI / 2, -Math.PI / 2];
                const positions2 = [
                    new THREE.Vector3(-counter, positionY, -(90-30 + l * 30)),
                    new THREE.Vector3(counter, positionY, (90-30 + l * 30)),
                    new THREE.Vector3(-(90-30 + l * 30), positionY, counter),
                    new THREE.Vector3((90-30 + l * 30), positionY, -counter)
                ];
                rotations2.forEach((rot, index) => {
                    const clone = model.clone();
                    clone.rotation.y = rot;
                    clone.position.copy(positions2[index]);

                    cars[name].push(clone);
                    scene.add(clone);
                });
            }

            if(traffic_level === 'high'){
                const rotations3 = [0,Math.PI, Math.PI / 2, -Math.PI / 2];
                const positions3 = [
                    new THREE.Vector3(-counter, positionY, -(90+300 + l * 30)),
                    new THREE.Vector3(counter, positionY, (90+300 + l * 30)),
                    new THREE.Vector3(-(90+300 + l * 30), positionY, counter),
                    new THREE.Vector3((90+300 + l * 30), positionY, -counter)
                ];
                rotations3.forEach((rot, index) => {
                    const clone = model.clone();
                    clone.rotation.y = rot;
                    clone.position.copy(positions3[index]);

                    cars[name].push(clone);
                    scene.add(clone);
                });
            }

            resolve(model);
        }, undefined, function (error) {
            reject('Error loading GLTF model:', error);
        });
    });
}

// return cars object to be used in other modules
export { cars };