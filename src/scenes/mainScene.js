import * as THREE from 'three';
import { initFog } from '../environment/fog.js';
import { initGround } from '../environment/ground.js';
import { initSky } from '../environment/sky.js';
import { initAmbientLight } from '../environment/ambientLight.js';
import { constructDomLur } from '../construct/domlur.js';
// import { constructMQTT } from '../construct/mqtt.js';
import { constructCubicasa } from '../construct/cubicasa.js';
import { constructPrestige } from '../construct/prestige.js';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';

let lx = 0.0;
let ly = 100.0;
let lz = 0.0;
let theta = 90.0;
let phi = 0.0;
let lat = 13;

const scene = new THREE.Scene();
initFog(scene);
initGround(scene);
initSky(scene);
initAmbientLight(scene);

let radius = 200; 
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotationX = -90-45, targetRotationY = 10;
let rotationSpeed = 0.7;
let zoomSpeed = 0.05;
let camX = 0, camZ = 0;
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.set(0, 55, -90);

const higherFOVCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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
function onWheel(event) {
    radius += event.deltaY * zoomSpeed;
    radius = Math.max(10, Math.min(500, radius));
}
function onKeyDown(event) {
    var sp=0.5
    if (event.key === 'c' || event.key === 'C') {
        if (camera === higherFOVCamera) {
            camX=0,camZ=0;
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
        camX-=sp * Math.sin(THREE.MathUtils.degToRad(targetRotationX));
        camZ-=sp * Math.cos(THREE.MathUtils.degToRad(targetRotationX));
    }
    else if (event.key === 's' || event.key === 'S') {
        camX+=sp * Math.sin(THREE.MathUtils.degToRad(targetRotationX));
        camZ+=sp * Math.cos(THREE.MathUtils.degToRad(targetRotationX));
    }
    else if (event.key === 'a' || event.key === 'A') {
        camX-=sp * Math.cos(THREE.MathUtils.degToRad(targetRotationX));
        camZ+=sp * Math.sin(THREE.MathUtils.degToRad(targetRotationX));
    }
    else if (event.key === 'd' || event.key === 'D') {
        camX+=sp * Math.cos(THREE.MathUtils.degToRad(targetRotationX));
        camZ-=sp * Math.sin(THREE.MathUtils.degToRad(targetRotationX));
    }
}
window.addEventListener('mousedown', onMouseDown, false);
window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mouseup', () => { isDragging = false; }, false);
window.addEventListener('wheel', onWheel, false);
window.addEventListener('keydown', onKeyDown, false);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

renderer.xr.enabled = true;
document.body.appendChild(VRButton.createButton(renderer));

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
sunlight.shadow.bias = -0.00006;
sunlight.shadow.mapSize.width = 16384;
sunlight.shadow.mapSize.height = 16384;
scene.add(sunlight);

const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
const frontWallGeometry = new THREE.BoxGeometry(100, 10,1);
const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
frontWall.position.set(0, 5, -200);
frontWall.castShadow = true;
frontWall.receiveShadow = true;
scene.add(frontWall);

let fullHouse= new THREE.Group();
scene.add(fullHouse);

const chContainer = document.createElement('div');
chContainer.style.position = 'absolute';
chContainer.style.top = '10px';
chContainer.style.right = '10px';
chContainer.style.zIndex = '20';
chContainer.style.background = 'rgba(0,0,0,0.5)';
chContainer.style.padding = '10px';
chContainer.style.borderRadius = '8px';

const chLabel = document.createElement('label');
chLabel.textContent = 'Choose House Type: ';
chLabel.style.color = '#fff';
chLabel.style.marginRight = '8px';

const chSelect = document.createElement('select');
['Cubicasa', 'Domlur', 'Prestige'].forEach((name, idx) => {
    const option = document.createElement('option');
    option.value = idx + 1;
    option.textContent = name;
    chSelect.appendChild(option);
});
chContainer.appendChild(chLabel);
chContainer.appendChild(chSelect);

// Roof checkbox
const roofLabel = document.createElement('label');
roofLabel.textContent = ' Roof ';
roofLabel.style.color = '#fff';
roofLabel.style.marginLeft = '12px';

const roofCheckbox = document.createElement('input');
roofCheckbox.type = 'checkbox';
roofCheckbox.checked = true;

chContainer.appendChild(roofLabel);
chContainer.appendChild(roofCheckbox);

document.body.appendChild(chContainer);

let roof = roofCheckbox.checked;

// Function to clear and reconstruct house
function updateHouseType(ch, roof) {
    scene.remove(fullHouse);
    fullHouse = new THREE.Group();
    scene.add(fullHouse);

    if (ch == 1) {
        constructCubicasa(scene, fullHouse, roof);
    } else if (ch == 2) {
        constructDomLur(scene, fullHouse, roof);
    } else if (ch == 3) {
        constructPrestige(scene, fullHouse, roof);
    }
}

// Initial construction
updateHouseType(parseInt(chSelect.value), roofCheckbox.checked);

// Listen for dropdown and checkbox changes
chSelect.addEventListener('change', () => {
    updateHouseType(parseInt(chSelect.value), roofCheckbox.checked);
});
roofCheckbox.addEventListener('change', () => {
    updateHouseType(parseInt(chSelect.value), roofCheckbox.checked);
});


function renderLoop() {
    if (camera === higherFOVCamera) {
        targetRotationY=Math.max(-90, Math.min(90, targetRotationY));
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
}

renderer.setAnimationLoop(renderLoop);

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