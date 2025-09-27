import {AmbientLight} from 'three';

export function initAmbientLight(scene) {
    const ambientLight = new AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
}