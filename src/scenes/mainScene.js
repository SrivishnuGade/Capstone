import * as THREE from 'three';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initFog } from '../environment/fog.js';
import { initGround } from '../environment/ground.js';
import { initSky } from '../environment/sky.js';
import { Room ,Floor, RoomWindow} from '../classes/room.js';


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

let radius = 200; 
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotationX = -90-45, targetRotationY = 10;
let rotationSpeed = 0.7;
let zoomSpeed = 0.05;
let camX = 0, camZ = 0;
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.set(0, 55, -90);

const higherFOVCamera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
higherFOVCamera.position.copy(camera.position);
higherFOVCamera.lookAt(scene.position);


function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}
function onMouseMove(event) {
    if (isDragging) {
        const deltaX = event.clientX - previousMousePosition.x;
        const deltaY = event.clientY - previousMousePosition.y;

        targetRotationX -= deltaX * rotationSpeed;
        targetRotationY += deltaY * rotationSpeed;

        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
}
function onMouseUp() {
    isDragging = false;
}
function onWheel(event) {
    // Adjust the radius based on the scroll input
    radius += event.deltaY * zoomSpeed;
    radius = Math.max(10, Math.min(500, radius)); // Clamp the radius
}
function onKeyDown(event) {
    if (event.key === 'c' || event.key === 'C') {
        if (camera === higherFOVCamera) {
            camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 10, 8000);
            camera.position.copy(higherFOVCamera.position);
            camera.lookAt(scene.position);
        } else {
            higherFOVCamera.position.copy(camera.position);
            higherFOVCamera.lookAt(scene.position);
            camera = higherFOVCamera;
        }
    }
    else if (event.key === 'w' || event.key === 'W') {
        camX+=0.1;
    }
    else if (event.key === 's' || event.key === 'S') {
        camX-=0.1;
    }
    else if (event.key === 'a' || event.key === 'A') {
        camZ+=0.1;
    }
    else if (event.key === 'd' || event.key === 'D') {
        camZ-=0.1;
    }
}
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mouseup', onMouseUp, false);
window.addEventListener('wheel', onWheel, false);
window.addEventListener('keydown', onKeyDown, false);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.minPolarAngle = 0;
// controls.maxPolarAngle = Math.PI / 2;
// controls.enableDamping = true;
// controls.dampingFactor = 0.1;

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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

initGround(scene);
initSky(scene);

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
const frontWallGeometry = new THREE.BoxGeometry(100, 10,1);
const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
frontWall.position.set(0, 5, -200);
frontWall.castShadow = true;
frontWall.receiveShadow = true;
scene.add(frontWall);

let fullHouse= new THREE.Group();
scene.add(fullHouse);
let roof=true;

const livingRoom = new Room('Living Room', scene,fullHouse, 0, 0, 25, 10, 10,roof);
const bedroom2 = new Room('Bedroom2', scene,fullHouse, -12.5+6.5, 10, 13, 10, 10,roof);
const kitchen = new Room('Kitchen', scene,fullHouse, 12.5+4, 0, 8, 10, 10,roof);
const bedroom = new Room('Bedroom', scene,fullHouse, 12.5+8-6, 10, 12, 10, 10,roof);
const bathroom = new Room('Bathroom', scene,fullHouse, 4.5, 5+3+4, 8, 6, 10,roof);
const floorbath= new Floor('Floorbath',scene,fullHouse,0.5+4,7,8,4,roof)
// const bedroom = new Room('Bedroom', scene, 10, -20, 20, 15, 10);

livingRoom.createRoom();
livingRoom.addDoor('left',-3);
livingRoom.addWindow(4,4,'left',2.5);
livingRoom.addWindow(4,4,'front',-8);
livingRoom.addWindow(2,4,'front',1);

livingRoom.addDoor('right',-3);
livingRoom.addDoor('back',10.5);
livingRoom.addCavity('back',8,4.5)

bedroom2.createRoom();
bedroom2.addDoor('right',3);
bedroom2.addWindow(4,4,'left');
bedroom2.addWindow(2,4,'back',3);

kitchen.createRoom();
kitchen.addDoor('left',3);
kitchen.addWindow(2,2,'right');
kitchen.addWindow(2,2,'front');

bedroom.createRoom();
bedroom.addDoor('front',4);
bedroom.addWindow(5,4,'back');

bathroom.createRoom();
bathroom.addDoor('front',1.5);
bathroom.addWindow(2,2,'back',0,2);

floorbath.createFloor();


function animate() {
    // controls.update();
    
    if (camera === higherFOVCamera) {
        // Cockpit view
        camera.position.set(
            camX,
            5.5,
            camZ
        );
        const offsetX = -radius * Math.sin(THREE.MathUtils.degToRad(targetRotationX)) * Math.cos(THREE.MathUtils.degToRad(targetRotationY));
        const offsetY = -radius * Math.sin(THREE.MathUtils.degToRad(targetRotationY));
        const offsetZ = -radius * Math.cos(THREE.MathUtils.degToRad(targetRotationX)) * Math.cos(THREE.MathUtils.degToRad(targetRotationY));
        camera.lookAt(
            camX + offsetX,
            5.5+offsetY,
            camZ+offsetZ
        );
    } else {
        targetRotationY=Math.max(0, Math.min(90, targetRotationY));
        const offsetX = radius * Math.sin(THREE.MathUtils.degToRad(targetRotationX)) * Math.cos(THREE.MathUtils.degToRad(targetRotationY));
        const offsetY = radius * Math.sin(THREE.MathUtils.degToRad(targetRotationY));
        const offsetZ = radius * Math.cos(THREE.MathUtils.degToRad(targetRotationX)) * Math.cos(THREE.MathUtils.degToRad(targetRotationY));

        camera.position.set(
            offsetX,
            offsetY,
            offsetZ
        );

        camera.lookAt(0,0,0);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();


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
        isDragging=false;
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

createSliderWithLabels(
    'Facing Direction',
    0,360,1,phi,
    (value) => {
        phi=parseFloat(value);
        fullHouse.rotation.set(0,-THREE.MathUtils.degToRad(phi),0);
        console.log("phi"+phi);
    },
    ['N','E','S','W',' ']
);
