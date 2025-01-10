import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initFog } from '../environment/fog.js';
import { initGround } from '../environment/ground.js';
import { initSky } from '../environment/sky.js';

let lx = 0.0;
let ly = 100.0;
let lz = 0.0;
let theta = 90.0;
let phi = 0.0;
let lat = 23.5;

// Create a div for displaying the room dimensions
const infoDiv = document.createElement('div');
infoDiv.style.position = 'absolute';
infoDiv.style.top = '10px';
infoDiv.style.right = '10px';
infoDiv.style.fontFamily = 'Arial, sans-serif';
infoDiv.style.fontSize = '16px';
infoDiv.style.color = 'white';
document.body.appendChild(infoDiv);

const scene = new THREE.Scene();
initFog(scene);


const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.set(30, 75, 350);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true;
controls.dampingFactor = 0.1;

const sunlight = new THREE.DirectionalLight(0xffffff, 3);
lx = 100 * Math.cos(THREE.MathUtils.degToRad(theta));
ly = 100 * Math.sin(THREE.MathUtils.degToRad(theta));
lz = 100 * Math.tan(THREE.MathUtils.degToRad(phi+lat));
sunlight.position.set(lx, ly, lz);
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

initGround(scene);
initSky(scene);

let roomDimensions = { x: 20, y: 0, z: 15 };
let roomGroup = null;

function createRoom(x, y, z) {
    const thickness = 1;
    const scale = 2;
    const group = new THREE.Group();

    // Enable shadow mapping
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Material for walls
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });

    // Front wall
    const frontWallGeometry = new THREE.BoxGeometry((x + 2 * thickness) * scale, 10 * scale, thickness * scale);
    const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
    frontWall.position.set(0, 5 * scale, -z * scale / 2 - 0.5 * thickness * scale);
    frontWall.castShadow = true;  // Wall casts shadows
    frontWall.receiveShadow = true; // Wall receives shadows
    group.add(frontWall);

    // Back wall
    // const backWallGeometry = new THREE.BoxGeometry((x + 2 * thickness) * scale, 10 * scale, thickness * scale);
    // const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
    // backWall.position.set(0, 5 * scale, z * scale / 2 + 0.5 * thickness * scale);
    // backWall.castShadow = true;
    // backWall.receiveShadow = true;
    // group.add(backWall);

    // Left wall
    const leftWallGeometry = new THREE.BoxGeometry(thickness * scale, 10 * scale, z * scale);
    const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
    leftWall.position.set(-x * scale / 2 - 0.5 * thickness * scale, 5 * scale, 0);
    leftWall.castShadow = true;
    leftWall.receiveShadow = true;
    group.add(leftWall);

    // Right wall
    const rightWallGeometry = new THREE.BoxGeometry(thickness * scale, 10 * scale, z * scale);
    const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
    rightWall.position.set(x * scale / 2 + 0.5 * thickness * scale, 5 * scale, 0);
    rightWall.castShadow = true;
    rightWall.receiveShadow = true;
    group.add(rightWall);

    // Floor
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
    const floorGeometry = new THREE.BoxGeometry(x * scale, thickness * scale, z * scale);
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.set(0, 0.5 * thickness * scale, 0);
    floor.receiveShadow = true;
    floor.castShadow = true;
    group.add(floor);

    // Add the group to the scene
    scene.add(group);
    roomGroup = group;
}

createRoom(roomDimensions.x, roomDimensions.y, roomDimensions.z);

function updateRoomDimensions() {
    if (roomGroup) {
        scene.remove(roomGroup);
    }
    createRoom(roomDimensions.x, roomDimensions.y, roomDimensions.z);
    infoDiv.textContent = `Room Dimensions: X = ${roomDimensions.x}, Z = ${roomDimensions.z}`;
}

function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();
window.addEventListener('keydown', (event) => {
    const step = 1;
    switch (event.key) {
        case 'W': case 'w':
            roomDimensions.x += step; 
            break;
        case 'S': case 's':
            roomDimensions.x -= step;
            break;
        case 'A': case 'a':
            roomDimensions.z -= step;
            break;
        case 'D': case 'd':
            roomDimensions.z += step;
            break;
    }
    roomDimensions.x = Math.max(4, roomDimensions.x);
    roomDimensions.z = Math.max(4, roomDimensions.z);
    updateRoomDimensions();
});

function createSliderWithLabels(labelText, min, max, step, initialValue, onChange, labels) {
    const container = document.createElement('div');
    container.style.marginBottom = '20px';
    container.style.position = 'relative';

    // Create the label
    const label = document.createElement('label');
    label.textContent = labelText;
    label.style.display = 'block';
    label.style.marginBottom = '5px';
    container.appendChild(label);

    // Create the slider
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = initialValue;
    slider.style.width = '200px';
    container.appendChild(slider);

    // Add slider event
    slider.addEventListener('input', () => {
        onChange(slider.value);
    });

    // Create a label container for the slider
    const labelsContainer = document.createElement('div');
    labelsContainer.style.position = 'absolute';
    labelsContainer.style.top = '35px';
    labelsContainer.style.width = '200px';
    labelsContainer.style.display = 'flex';
    labelsContainer.style.justifyContent = 'space-between';
    labelsContainer.style.fontFamily = 'Arial, sans-serif';
    labelsContainer.style.fontSize = '12px';
    labelsContainer.style.color = '#fff';
    labelsContainer.style.marginTop = '5px';

    // Add labels to the slider track
    labels.forEach((text) => {
        const labelSpan = document.createElement('span');
        labelSpan.textContent = text;
        labelsContainer.appendChild(labelSpan);
    });

    container.appendChild(labelsContainer);
    sliderContainer.appendChild(container);

    return slider;
}

// Example: Adding sliders for Sunlight Direction and Elevation
const sliderContainer = document.createElement('div');
sliderContainer.style.position = 'absolute';
sliderContainer.style.top = '10px';
sliderContainer.style.left = '10px';
sliderContainer.style.zIndex = '10';
document.body.appendChild(sliderContainer);

// Sunlight Direction Slider
createSliderWithLabels(
    'Time of Day',
    5, 175, 1, theta,
    (value) => {
        theta = parseFloat(value);
        lx = 100 * Math.cos(THREE.MathUtils.degToRad(theta));
        ly = 100 * Math.sin(THREE.MathUtils.degToRad(theta));
        sunlight.position.set(lx, ly, lz);
    },
    ['Morning', 'Afternoon', 'Evening']
);

// Sunlight Elevation Slider
createSliderWithLabels(
    'Season',
    -23.5, 23.5, 1, phi,
    (value) => {
        phi = parseFloat(value);
        lz = 100 * Math.tan(THREE.MathUtils.degToRad(phi+lat));
        sunlight.position.set(lx, ly, lz);
    },
    ['Summer', 'Winter']
);
