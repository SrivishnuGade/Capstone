import {AmbientLight, LightProbe} from 'three';

export function initAmbientLight(scene) {
    const lightProbe = new LightProbe();
    scene.add(lightProbe);
    const ambientLight = new AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
}