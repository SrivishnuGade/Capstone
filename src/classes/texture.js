import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

// Load textures
const map = textureLoader.load('/textures/laminate-flooring-brown-bl/laminate-flooring-brown_albedo.png');
const normalMap = textureLoader.load('/textures/laminate-flooring-brown-bl/laminate-flooring-brown-bl_normal-ogl.png');
const roughnessMap = textureLoader.load('/textures/laminate-flooring-brown-bl/laminate-flooring-brown-bl_roughness.png');
const metalnessMap = textureLoader.load('/textures/laminate-flooring-brown-bl/laminate-flooring-brown_metallic.png');
const aoMap = textureLoader.load('/textures/laminate-flooring-brown-bl/laminate-flooring-brown-bl_ao.png');

// Configure texture properties
map.wrapS = THREE.RepeatWrapping;
map.wrapT = THREE.RepeatWrapping;
map.repeat.set(4, 4);

normalMap.wrapS = THREE.RepeatWrapping;
normalMap.wrapT = THREE.RepeatWrapping;
normalMap.repeat.set(4, 4);

roughnessMap.wrapS = THREE.RepeatWrapping;
roughnessMap.wrapT = THREE.RepeatWrapping;
roughnessMap.repeat.set(4, 4);

metalnessMap.wrapS = THREE.RepeatWrapping;
metalnessMap.wrapT = THREE.RepeatWrapping;
metalnessMap.repeat.set(4, 4);

aoMap.wrapS = THREE.RepeatWrapping;
aoMap.wrapT = THREE.RepeatWrapping;
aoMap.repeat.set(4, 4);

// Create the material
const floorMaterial = new THREE.MeshStandardMaterial({
    map: map,
    normalMap: normalMap,
    roughnessMap: roughnessMap,
    metalnessMap: metalnessMap,
    aoMap: aoMap,
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.1
});

export { floorMaterial };