import * as THREE from 'three';
import { scale } from '../scenes/mainScene.js';

function createDirectionSprite(letter, size) {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 100px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeText(letter, 64, 64);
    ctx.fillText(letter, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(material);
    sprite.scale.set(size, size, 1);
    return sprite;
}

export function initDirections(scene, size = 15 * scale) {
    // North
    const north = createDirectionSprite('N', size);
    north.position.set(0, 5 * scale, -200 * scale);
    scene.add(north);

    // South
    const south = createDirectionSprite('S', size);
    south.position.set(0, 5 * scale, 200 * scale);
    scene.add(south);

    // East
    const east = createDirectionSprite('E', size);
    east.position.set(200 * scale, 5 * scale, 0);
    scene.add(east);

    // West
    const west = createDirectionSprite('W', size);
    west.position.set(-200 * scale, 5 * scale, 0);
    scene.add(west);
}