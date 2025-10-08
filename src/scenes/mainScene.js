import * as THREE from 'three';
import { initFog } from '../environment/fog.js';
import { initGround } from '../environment/ground.js';
import { initSky } from '../environment/sky.js';
import { initAmbientLight } from '../environment/ambientLight.js';
import { initDirections } from '../environment/directions.js';
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
const scale = 0.3048;
// const scale = 1.0;

const scene = new THREE.Scene();
initFog(scene);
initGround(scene);
initSky(scene);
initAmbientLight(scene);
initDirections(scene);

let radius = 200*scale; 
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotationX = -90+70, targetRotationY = 10;
let rotationSpeed = 0.4;
let zoomSpeed = 0.05*scale;
let camX = 0, camZ = 0;
let camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1*scale, 2000*scale);
camera.position.set(0, 55*scale, -90*scale);

const higherFOVCamera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1*scale, 1000*scale);
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
    var sp=0.5*scale
    if (event.key === 'c' || event.key === 'C') {
        if (camera === higherFOVCamera) {
            camX=0,camZ=0;radius=200*scale;
            camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1*scale, 2000*scale);
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
lx = 100*scale * Math.cos(THREE.MathUtils.degToRad(theta));
ly = 100*scale * Math.sin(THREE.MathUtils.degToRad(theta));
lz = 100*scale * Math.tan(THREE.MathUtils.degToRad(phi+lat));
sunlight.position.set(lx, ly, lz);
sunlight.castShadow = true;
sunlight.shadow.camera.left = -500*scale;
sunlight.shadow.camera.right = 500*scale;
sunlight.shadow.camera.top = 500*scale;
sunlight.shadow.camera.bottom = -500*scale;
sunlight.shadow.camera.near = 0.5*scale;
sunlight.shadow.camera.far = 1000*scale;
sunlight.shadow.bias = -0.00006;
sunlight.shadow.mapSize.width = 16384;
sunlight.shadow.mapSize.height = 16384;
scene.add(sunlight);

let fullHouse= new THREE.Group();
scene.add(fullHouse);

let m=false;

if(!m){
    const chContainer = document.createElement('div');
    chContainer.id='chContainer';

    const chLabel = document.createElement('label');
    chLabel.id = 'chLabel';
    chLabel.textContent = 'Choose House Type: ';


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
    roofLabel.id = 'roofLabel';
    roofLabel.textContent = ' Roof ';

    const roofCheckbox = document.createElement('input');
    roofCheckbox.type = 'checkbox';
    roofCheckbox.checked = true;

    chContainer.appendChild(roofLabel);
    chContainer.appendChild(roofCheckbox);

    document.body.appendChild(chContainer);

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
}
// else{
//     constructMQTT(scene, fullHouse, camera, renderer, true);
// }
function renderLoop() {
    if (camera === higherFOVCamera) {
        targetRotationY=Math.max(-90, Math.min(90, targetRotationY));
        camera.position.set(
            camX,
            5.5*scale,
            camZ
        );
        const offsetX = -radius * Math.sin(THREE.MathUtils.degToRad(targetRotationX)) * Math.cos(THREE.MathUtils.degToRad(targetRotationY));
        const offsetY = -radius * Math.sin(THREE.MathUtils.degToRad(targetRotationY));
        const offsetZ = -radius * Math.cos(THREE.MathUtils.degToRad(targetRotationX)) * Math.cos(THREE.MathUtils.degToRad(targetRotationY));
        camera.lookAt(
            camX + offsetX,
            5.5*scale+offsetY,
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
    container.className = 'slider-group';

    // Create the label
    const label = document.createElement('label');
    label.textContent = labelText;
    container.appendChild(label);

    // Create the slider
    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = min;
    slider.max = max;
    slider.step = step;
    slider.value = initialValue;
    container.appendChild(slider);

    // Add slider event
    slider.addEventListener('input', () => {
        onChange(slider.value);
        isDragging = false;
    });

    // Create a label container for the slider
    const labelsContainer = document.createElement('div');
    labelsContainer.className = 'slider-labels';

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

const sliderContainer = document.createElement('div');
sliderContainer.id = 'sliderContainer';
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

export { scale };