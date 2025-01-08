// src/scenes/mainScene.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { initFog } from '../environment/fog.js';
import { initLighting } from '../environment/lighting.js';
import { initGround } from '../environment/ground.js';
import { initSky } from '../environment/sky.js';
import { cars, loadModel } from '../loaders/gltfloader.js';
import { loadRoad } from '../loaders/objloader.js';
import { moveCarRight, moveCarRight1, moveCarRight2, moveCarRight3 ,
    moveCarLeft1,moveCarLeft11,moveCarLeft12,moveCarLeft13,
    moveCarLeft2,moveCarLeft21,moveCarLeft22,moveCarLeft23,
    moveCarStraight,moveCarStraight1,moveCarStraight2,moveCarStraight3,
    moveCarFront,moveCarFront1,moveCarFront2,moveCarFront3,
    changeLane,changeLane1,changeLane2,changeLane3
} from '../movements/carMovements.js';
import html2canvas from 'html2canvas';



const scene = new THREE.Scene();
initFog(scene);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
camera.position.set(30, 75, 350);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.id = "myCanvas";
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.minPolarAngle = 0;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = true;
controls.dampingFactor = 0.1;


initLighting(scene);
initGround(scene);
initSky(scene);

const clouds = [];
function createFluffyCloud() {
    const cloudGroup = new THREE.Group();
    
    const particleMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
        depthWrite: false,
    });

    // Adjusted geometry to make particles slightly larger and smoother
    const particleGeometry = new THREE.SphereGeometry(10, 16, 16); // Larger spheres for fluffier particles

    // Create multiple particles to form a fluffy cloud
    for (let i = 0; i < 150; i++) { // Reduced particle count for performance, but larger particles
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);

        // Randomly position each particle to form a spread-out, fluffy cloud shape
        particle.position.set(
            (Math.random() - 0.5) * 80, // x position, wider spread
            (Math.random() - 0.5) * 20, // y position, less vertical spread
            (Math.random() - 0.5) * 80  // z position, wider spread
        );

        // Randomize size slightly for a more natural look
        particle.scale.setScalar(Math.random() * 0.8 + 0.6);
        cloudGroup.add(particle);
    }

    // Set the overall position of the cloud cluster higher in the scene
    cloudGroup.position.set(
        Math.random() * 800 - 400, // x position within -400 to 400
        150 + Math.random() * 100,   // height above ground for a natural cloud level
        Math.random() * 800 - 400  // z position within -400 to 400
    );

    return cloudGroup;
}

// Add multiple fluffy clouds to the scene
for (let i = 0; i < 10; i++) {
    const cloud = createFluffyCloud();
    clouds.push(cloud);
    scene.add(cloud);
}


let traffic_level = 'high';

const loadGoogleMapsScript = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&callback=initMap&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onerror = function() {
        console.error("Error loading Google Maps script, setting traffic level to high by default.");
        updateTrafficDisplayPlaceholder("Google Maps API not available, defaulting to high traffic.");
        loadCars("high");
        console.log("Traffic is high, triggering alternative operations...");
    };
    document.head.appendChild(script);
};
loadGoogleMapsScript();


window.initMap = function () {
    if (typeof google === 'undefined' || !google.maps) {
        console.error("Google Maps API not available, setting traffic level to high by default.");
        updateTrafficDisplayPlaceholder("Google Maps API not available, defaulting to high traffic.");
        loadCars("high");
        console.log("Traffic is high, triggering alternative operations...");
        return;
    }
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 20,
        center: { lat: 12.9254, lng: 77.55005 },
    });

    const trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);

    updateTrafficDisplayPlaceholder("Calculating traffic density...");

    waitForBaseMapTilesToLoad(map)
        .then(() => {
            console.log("Map and Traffic Layer ready for density calculation.");
            return calculateTrafficDensity(document.getElementById("map"));
        })
        .then((trafficLevel) => {
            console.log(`Traffic density calculated: ${trafficLevel}`);
            loadCars(trafficLevel);
            if (trafficLevel === "low") {
                console.log("Traffic is low, performing specific operations...");
            } else if (trafficLevel === "medium") {
                console.log("Traffic is medium, executing other logic...");
            } else {
                console.log("Traffic is high, triggering alternative operations...");
            }
        })
        .catch((error) => {
            console.error("Error during map load or analysis:", error);
            updateTrafficDisplayPlaceholder("Error loading map or analyzing traffic.");
        });
};


function waitForBaseMapTilesToLoad(map) {
    return new Promise((resolve, reject) => {
        console.log("Waiting for base map tiles to load...");

        let resolved = false; // Flag to ensure no double resolve

        const fallbackTimeout = setTimeout(() => {
            if (!resolved) {
                console.log("Fallback triggered: Proceeding without tilesloaded.");
                resolved = true;
                resolve();
            }
        }, 5000); // 5 seconds fallback

        google.maps.event.addListenerOnce(map, "tilesloaded", () => {
            if (!resolved) {
                console.log("Base map tiles loaded event fired.");
                clearTimeout(fallbackTimeout);
                resolved = true;
                resolve();
            }
        });

        google.maps.event.addListenerOnce(map, "loaderror", () => {
            if (!resolved) {
                console.error("Error loading base map tiles.");
                clearTimeout(fallbackTimeout);
                resolved = true;
                reject(new Error("Error loading base map tiles."));
            }
        });
    });
}

function calculateTrafficDensity(map) {
    return new Promise((resolve, reject) => {
        console.log("Starting traffic density calculation...");

        // Use html2canvas to capture the map
        html2canvas(map, { scale: 3, useCORS: true, allowTaint: true })
            .then((canvas) => {
                console.log("Canvas captured.");
                const trafficDensity = analyzeTrafficColors(canvas);
                const trafficLevel = updateTrafficDisplay(trafficDensity);
                resolve(trafficLevel); // Resolve the Promise with the calculated traffic level
            })
            .catch((error) => {
                console.error("Error capturing canvas:", error);
                updateTrafficDisplayPlaceholder("Error capturing traffic data.");
                reject(error); // Reject the Promise on error
            });
    });
}

function analyzeTrafficColors(canvas) {
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let redPixels = 0;
    let orangePixels = 0;
    let yellowPixels = 0;
    let greenPixels = 0;

    // Iterate over each pixel and classify it based on the color ranges
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        if (isRed(r, g, b)) {
            redPixels++;
        } else if (isOrange(r, g, b)) {
            orangePixels++;
        } else if (isYellow(r, g, b)) {
            yellowPixels++;
        } else if (isGreen(r, g, b)) {
            greenPixels++;
        }
    }

    const totalPixels = redPixels + orangePixels + yellowPixels + greenPixels;
    const redDensity = (redPixels / totalPixels) * 100;
    const orangeDensity = (orangePixels / totalPixels) * 100;
    const yellowDensity = (yellowPixels / totalPixels) * 100;
    const greenDensity = (greenPixels / totalPixels) * 100;

    return { redDensity, orangeDensity, yellowDensity, greenDensity };
}

function updateTrafficDisplay({ redDensity, orangeDensity, yellowDensity, greenDensity }) {
    let calc_traffic_level = 'high';
    if (greenDensity > 75) {
        calc_traffic_level = 'low';
    } else if (redDensity < 40) {
        calc_traffic_level = 'medium';
    }

    const trafficInfo = document.getElementById("traffic-info");
    if(!isNaN(redDensity)){
        if (trafficInfo) {
            trafficInfo.innerHTML = `
                <p><strong>Traffic Density Analysis:</strong></p>
                <p>High (Red): ${redDensity.toFixed(2)}%</p>
                <p>Moderate (Orange): ${orangeDensity.toFixed(2)}%</p>
                <p>Light (Yellow): ${yellowDensity.toFixed(2)}%</p>
                <p>No Traffic (Green): ${greenDensity.toFixed(2)}%</p>
                <p>Traffic level: ${calc_traffic_level}</p>
            `;
        }
    }
    else if (trafficInfo) {
        trafficInfo.innerHTML = `<p>Traffic level: ${calc_traffic_level}</p>`;
    }

    
    return calc_traffic_level;
}

function isRed(r, g, b) {
    return r > 160 && g < 80 && b < 80;
}

function isOrange(r, g, b) {
    return r > 180 && r <= 250 && g > 100 && g <= 180 && b < 90;
}

function isYellow(r, g, b) {
    return r > 200 && g > 170 && g <= 255 && b > 60 && b < 120;
}

function isGreen(r, g, b) {
    return r < 110 && g > 170 && g <= 255 && b < 170;
}

function updateTrafficDisplayPlaceholder(message) {
    const trafficInfo = document.getElementById("traffic-info");
    if (trafficInfo) {
        trafficInfo.innerHTML = `<p>${message}</p>`;
    }
}

// Insert a container in the HTML to display traffic density information
document.body.insertAdjacentHTML(
    "beforeend",
    `
    <div id="traffic-info" style="position: absolute; top: 20px; right: 30px; background: white; padding: 10px; border-radius: 5px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); font-size: 14px;">
        <p>Initializing traffic density analysis...</p>
    </div>
`
);



function loadCars(traffic_level){
Promise.all([
    // loadModel(scene,'Mustang', '/assets/shelby/scene.gltf', 450, 0, 60, 12,traffic_level),
    // loadModel(scene,'Focus', '/assets/focus/scene.gltf', 500, 0, 30, 12,traffic_level),
    // loadModel(scene,'Boxster', '/assets/boxster/scene.gltf', 1.35, 3.9, 45, 12,traffic_level),
    // loadModel(scene,'Porsche', '/assets/porsche/scene.gltf', 5, 0.55, 30, 8,traffic_level),
    loadModel(scene, 'Mustang', '/assets/shelby/scene_draco.gltf', 450, 0, 60, 12, traffic_level),
    loadModel(scene, 'Focus', '/assets/focus/scene_draco.gltf', 500, 0, 30, 12, traffic_level),
    loadModel(scene, 'Boxster', '/assets/boxster/scene_draco.gltf', 1.35, 3.9, 45, 12, traffic_level),
    loadModel(scene, 'Porsche', '/assets/porsche/scene_draco.gltf', 5, 0.55, 30, 8, traffic_level)
    // loadModel(scene,'Civic', '/assets/civic/scene.gltf', 500, 0, 75, 12)
]).then(() => {
    console.log('All models loaded:', cars);
    if(traffic_level==='medium' || traffic_level==='high'){
        scene.remove(cars['Focus'][8]);
    }
    if(traffic_level==='high'){scene.remove(cars['Focus'][11]);}


    setInterval(() => {
        // Define the cars you want to include in the loop
        let carModels = [];
        if (traffic_level==='low'){
            carModels = [
                [cars['Focus'][1]], // Include Focus car at index 5
                [cars['Boxster'][1]], // Include Boxster car at index 5
                [cars['Mustang'][1]],
                [cars['Porsche'][1]],
            ];
        }
        else if(traffic_level==='medium'){
            carModels = [
                [cars['Focus'][5]], // Include Focus car at index 5
                [cars['Boxster'][5]], // Include Boxster car at index 5
                [cars['Focus'][1]],
                [cars['Boxster'][1]],
                [cars['Porsche'][1]],
                [cars['Porsche'][5]],
                [cars['Mustang'][1]],
                [cars['Mustang'][5]],
            ];
        }
        else if(traffic_level==='high'){
            carModels = [
                [cars['Focus'][5]], // Include Focus car at index 5
                [cars['Boxster'][5]], // Include Boxster car at index 5
                [cars['Focus'][1]],
                [cars['Boxster'][1]],
                [cars['Focus'][9]],
                [cars['Boxster'][9]],
                [cars['Porsche'][1]],
                [cars['Porsche'][5]],
                [cars['Porsche'][9]],
                [cars['Mustang'][1]],
                [cars['Mustang'][5]],
                [cars['Mustang'][9]],
            ];
        }

        // Loop over each car array and each car within those arrays
        carModels.forEach(carArray => {
            carArray.forEach(car => {
                let lane=5;
                if(car.position.x<70){
                    lane = Math.floor(car.position.x / 15);
                }
                const position = Math.floor((car.position.z - 90) / 30);
                let light= 'red';
                if(lane>=0 &&lane<=4){
                    light = getTrafficLightColor(15+lane);
                }
                // console.log(light);
                if(lane===5 && position>=1)
                {
                    if (!occ_pos.some(pos => pos[0] === lane && pos[1] === position)) {
                        occ_pos.push([lane, position]); // Only add if it doesn't exist
                    }
                    if(position===1)
                    {
                        moveCarRight(car);
                        console.log('right');
                        occ_pos = occ_pos.filter(pos => pos[0] !== lane || pos[1] !== position);
                    }
                    else if ((position !== 1) && !occ_pos.some(pos => pos[0] === lane && pos[1] === position - 1)) {
                        // Move the car forward
                        moveCarFront(car);
                        occ_pos.push([lane, position-1]);
                        occ_pos = occ_pos.filter(pos => pos[0] !== lane || pos[1] !== position); // Remove the old position
                    }
                }
                else if(position>=0)
                {
                    // Check if the car's current position is already tracked
                    if (!occ_pos.some(pos => pos[0] === lane && pos[1] === position)) {
                        occ_pos.push([lane, position]); // Only add if it doesn't exist
                    }
                    // if(lane===5 && position===1){
                    //     moveCarRight(car);
                    //     console.log('right');
                    //     occ_pos = occ_pos.filter(pos => pos[0] !== lane || pos[1] !== position);
                    // }
                    // else if (car.position.z <= 140 && car.position.x===75) {
                    //     moveCarRight(car);
                    //     occ_pos = occ_pos.filter(pos => pos[0] !== lane || pos[1] !== position);
                    // }else
                    if (position === 0 && light=='green') {
                        switch (lane) {
                            case 0:
                                moveCarLeft1(car);

                                break;
                            case 1:
                                moveCarLeft2(car);
                                break;

                            default:
                                moveCarStraight(car);
                                break;
                        }
                        occ_pos = occ_pos.filter(pos => pos[0] !== lane || pos[1] !== position);
                    }
                    
                    else if ((position !== 0 || light=='green') && !occ_pos.some(pos => pos[0] === lane && pos[1] === position - 1)) {
                        // Move the car forward
     
                        

                        let randomInt=THREE.MathUtils.randInt(0,1)
                        if (position === 7 && lane === 2 && randomInt===0) {
                            changeLane(car, 'left');
                            occ_pos.push([lane-1, position-1]);
                            
                        } else if (position === 5 && lane === 1 && !occ_pos.some(pos => pos[0] === lane-1 && pos[1] === position - 1)) {
                            changeLane(car, 'left');
                            occ_pos.push([lane-1, position-1]);
                        } else if(position === 8 && lane === 4){
                            changeLane(car, 'right');
                            occ_pos.push([lane+1, position-1]);
                        } else {
                            moveCarFront(car);
                            occ_pos.push([lane, position-1]);
                        }
                        // Update occupancy for the new position
                        // occ_pos.push([lane, position-1]); // Add the new position
                        occ_pos = occ_pos.filter(pos => pos[0] !== lane || pos[1] !== position); // Remove the old position
                    } else {
                        // Mark the current position if it hasn't moved
                        occ2[lane][position] = 1;
                    }
                }
                // Log for debugging
                // console.log(`Position: ${position}, Lane: ${lane}`);
                // console.log(occ_pos);

                // Remove the car from the scene if it goes beyond z = -450
                
                if (car.position.z < -400 || car.position.x > 400 || car.position.x < -400) {
                    let randomInt=THREE.MathUtils.randInt(0,2)
                    car.position.z=450;
                    car.position.x=30+randomInt *15
                    car.rotation.y=Math.PI;
                    // scene.remove(car);
                }
            });
        });
    }, 250);
    setInterval(() => {
        let carModels = [];
        if (traffic_level==='low'){
            carModels = [
                [cars['Focus'][0]], // Include Focus car at index 5
                [cars['Boxster'][0]], // Include Boxster car at index 5
                [cars['Mustang'][0]],
                [cars['Porsche'][0]],
            ];
        }
        else if(traffic_level==='medium'){
            carModels = [
                [cars['Focus'][4]],
                [cars['Boxster'][4]],
                [cars['Focus'][0]],
                [cars['Boxster'][0]],
                [cars['Porsche'][0]],
                [cars['Porsche'][4]],
                [cars['Mustang'][0]],
                [cars['Mustang'][4]],
            ];
        }
        else if(traffic_level==='high'){
            carModels = [
                [cars['Focus'][4]],
                [cars['Boxster'][4]],
                [cars['Focus'][0]],
                [cars['Boxster'][0]],
                // [cars['Focus'][8]],
                [cars['Boxster'][8]],
                [cars['Porsche'][0]],
                [cars['Porsche'][4]],
                [cars['Porsche'][8]],
                [cars['Mustang'][0]],
                [cars['Mustang'][4]],
                [cars['Mustang'][8]],
            ];
        }
        carModels.forEach(carArray => {
            carArray.forEach(car => {
                let lane=5;
                if(-car.position.x<70){
                    lane = Math.floor(-car.position.x / 15);
                }
                const position = Math.floor((-car.position.z - 90) / 30);
                let light = 'red';
    
                if (lane >= 0 && lane <= 4) {
                    light = getTrafficLightColor(lane);
                }
                if (position >= 0) {
                    // Insert debugging logs
                    console.log(`Processing car at lane: ${lane}, position: ${position}`);
    
                    if (!occ_pos1.some(pos => pos[0] === lane && pos[1] === position)) {
                        occ_pos1.push([lane, position]);
                        console.log(`Added to occ_pos1: lane ${lane}, position ${position}`);
                    }
    
                    if (position === 0 && light === 'green') {
                        switch (lane) {
                            case 0:
                                moveCarLeft11(car);
                                break;
                            case 1:
                                moveCarLeft21(car);
                                break;
                            default:
                                moveCarStraight1(car);
                                break;
                        }
                        occ_pos1 = occ_pos1.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if (lane === 5 && position === 1) {
                        moveCarRight1(car);
                        occ_pos1 = occ_pos1.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if (car.position.z <= 140 && car.position.x === 75) {
                        moveCarRight1(car);
                        occ_pos1 = occ_pos1.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if ((position !== 0 || light === 'green') && !occ_pos1.some(pos => pos[0] === lane && pos[1] === position - 1)) {
                        let randomInt=THREE.MathUtils.randInt(0,1)
                        if (position === 7 && lane === 2 && randomInt===0) {
                            changeLane1(car, 'left');
                            occ_pos1.push([lane - 1, position - 1]);
                        } else if (position === 5 && lane === 1 && !occ_pos1.some(pos => pos[0] === lane - 1 && pos[1] === position - 1)) {
                            changeLane1(car, 'left');
                            occ_pos1.push([lane - 1, position - 1]);
                        } else if (position === 8 && lane === 4) {
                            changeLane1(car, 'right');
                            occ_pos1.push([lane + 1, position - 1]);
                        } else {
                            moveCarFront1(car);
                            occ_pos1.push([lane, position - 1]);
                        }
                        occ_pos1 = occ_pos1.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else {
                        occ21[lane][position] = 1;
                    }
                }
    
                console.log(`Final occ_pos1:`, occ_pos1);
                
                if (car.position.z > 410|| car.position.x > 410 || car.position.x < -410) {
                    let randomInt=THREE.MathUtils.randInt(0,2)
                    car.position.z=-450;
                    car.position.x=-(30+randomInt *15)
                    car.rotation.y=0;
                    // scene.remove(car);
                }
            });
        });
    }, 250);
    setInterval(() => {
        let carModels = [];
        if (traffic_level==='low'){
            carModels = [
                [cars['Focus'][2]], // Include Focus car at index 5
                [cars['Boxster'][2]], // Include Boxster car at index 5
                [cars['Mustang'][2]],
                [cars['Porsche'][2]],
            ];
        }
        else if(traffic_level==='medium'){
            carModels = [
                [cars['Focus'][6]],
                [cars['Boxster'][6]],
                [cars['Focus'][2]],
                [cars['Boxster'][2]],
                [cars['Porsche'][2]],
                [cars['Porsche'][6]],
                [cars['Mustang'][2]],
                [cars['Mustang'][6]],
            ];
        }
        else if(traffic_level==='high'){
            carModels = [
                [cars['Focus'][6]],
                [cars['Boxster'][6]],
                [cars['Focus'][2]],
                [cars['Boxster'][2]],
                [cars['Focus'][10]],
                [cars['Boxster'][10]],
                [cars['Porsche'][2]],
                [cars['Porsche'][6]],
                [cars['Porsche'][10]],
                [cars['Mustang'][2]],
                [cars['Mustang'][6]],
                [cars['Mustang'][10]],
            ];
        }
        carModels.forEach(carArray => {
            carArray.forEach(car => {
                let lane=5;
                if(car.position.z<70){
                    lane = Math.floor(car.position.z / 15);
                }
                const position = Math.floor((-car.position.x - 90) / 30);
                let light = 'red';
    
                if (lane >= 0 && lane <= 4) {
                    light = getTrafficLightColor(5+lane);
                }
                if (position >= 0) {
                    // Insert debugging logs
                    console.log(`Processing car at lane: ${lane}, position: ${position}`);
    
                    if (!occ_pos2.some(pos => pos[0] === lane && pos[1] === position)) {
                        occ_pos2.push([lane, position]);
                        console.log(`Added to occ_pos2: lane ${lane}, position ${position}`);
                    }
    
                    if (position === 0 && light === 'green') {
                        switch (lane) {
                            case 0:
                                moveCarLeft12(car);
                                break;
                            case 1:
                                moveCarLeft22(car);
                                break;
                            default:
                                moveCarStraight2(car);
                                break;
                        }
                        occ_pos2 = occ_pos2.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if (lane === 5 && position === 1) {
                        moveCarRight2(car);
                        occ_pos2 = occ_pos2.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if (car.position.x >= -140 && car.position.z === 75) {
                        moveCarRight2(car);
                        occ_pos2 = occ_pos2.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if ((position !== 0 || light === 'green') && !occ_pos2.some(pos => pos[0] === lane && pos[1] === position - 1)) {
                        let randomInt=THREE.MathUtils.randInt(0,1)
                        if (position === 7 && lane === 2 && randomInt===0) {
                            changeLane2(car, 'left');
                            occ_pos2.push([lane - 1, position - 1]);
                        } else if (position === 5 && lane === 1 && !occ_pos2.some(pos => pos[0] === lane - 1 && pos[1] === position - 1)) {
                            changeLane2(car, 'left');
                            occ_pos2.push([lane - 1, position - 1]);
                        } else if (position === 8 && lane === 4) {
                            changeLane2(car, 'right');
                            occ_pos2.push([lane + 1, position - 1]);
                        } else {
                            moveCarFront2(car);
                            occ_pos2.push([lane, position - 1]);
                        }
                        occ_pos2 = occ_pos2.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else {
                        occ21[lane][position] = 1;
                    }
                }
    
                console.log(`Final occ_pos2:`, occ_pos2);
                
                if (car.position.x > 400 || car.position.z > 400 || car.position.z < -400) {
                    let randomInt=THREE.MathUtils.randInt(0,2)
                    car.position.x=-450;
                    car.position.z=30+randomInt *15
                    car.rotation.y=Math.PI/2;
                    // scene.remove(car);
                }
            });
        });
    }, 250);
    setInterval(() => {
        let carModels = [];
        if (traffic_level==='low'){
            carModels = [
                [cars['Focus'][3]], // Include Focus car at index 5
                [cars['Boxster'][3]], // Include Boxster car at index 5
                [cars['Mustang'][3]],
                [cars['Porsche'][3]],
            ];
        }
        else if(traffic_level==='medium'){
            carModels = [
                [cars['Focus'][7]],
                [cars['Boxster'][7]],
                [cars['Focus'][3]],
                [cars['Boxster'][3]],
                [cars['Porsche'][3]],
                [cars['Porsche'][7]],
                [cars['Mustang'][3]],
                [cars['Mustang'][7]],
            ];
        }
        else if(traffic_level==='high'){
            carModels = [
                [cars['Focus'][7]],
                [cars['Boxster'][7]],
                [cars['Focus'][3]],
                [cars['Boxster'][3]],
                // [cars['Focus'][11]],
                [cars['Boxster'][11]],
                [cars['Porsche'][3]],
                [cars['Porsche'][7]],
                [cars['Porsche'][11]],
                [cars['Mustang'][3]],
                [cars['Mustang'][7]],
                [cars['Mustang'][11]],
            ];
        }
        carModels.forEach(carArray => {
            carArray.forEach(car => {
                let lane=5;
                if(-car.position.z<70){
                    lane = Math.floor(-car.position.z / 15);
                }
                const position = Math.floor((car.position.x - 90) / 30);
                let light = 'red';
    
                if (lane >= 0 && lane <= 4) {
                    light = getTrafficLightColor(10+lane);
                }
                if (position >= 0) {
                    // Insert debugging logs
                    console.log(`Processing car at lane: ${lane}, position: ${position}`);
    
                    if (!occ_pos3.some(pos => pos[0] === lane && pos[1] === position)) {
                        occ_pos3.push([lane, position]);
                        console.log(`Added to occ_pos3: lane ${lane}, position ${position}`);
                    }
    
                    if (position === 0 && light === 'green') {
                        switch (lane) {
                            case 0:
                                moveCarLeft13(car);
                                break;
                            case 1:
                                moveCarLeft23(car);
                                break;
                            default:
                                moveCarStraight3(car);
                                break;
                        }
                        occ_pos3 = occ_pos3.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if (lane === 5 && position === 1) {
                        moveCarRight3(car);
                        occ_pos3 = occ_pos3.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if (car.position.x <= 140 && car.position.z === -75) {
                        moveCarRight3(car);
                        occ_pos3 = occ_pos3.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else if ((position !== 0 || light === 'green') && !occ_pos3.some(pos => pos[0] === lane && pos[1] === position - 1)) {
                        let randomInt=THREE.MathUtils.randInt(0,1)
                        if (position === 7 && lane === 2 && randomInt===0) {
                            changeLane3(car, 'left');
                            occ_pos3.push([lane - 1, position - 1]);
                        } else if (position === 5 && lane === 1 && !occ_pos3.some(pos => pos[0] === lane - 1 && pos[1] === position - 1)) {
                            changeLane3(car, 'left');
                            occ_pos3.push([lane - 1, position - 1]);
                        } else if (position === 8 && lane === 4) {
                            changeLane3(car, 'right');
                            occ_pos3.push([lane + 1, position - 1]);
                        } else {
                            moveCarFront3(car);
                            occ_pos3.push([lane, position - 1]);
                        }
                        occ_pos3 = occ_pos3.filter(pos => pos[0] !== lane || pos[1] !== position);
                    } else {
                        occ21[lane][position] = 1;
                    }
                }
    
                console.log(`Final occ_pos3:`, occ_pos3);
                
                if (car.position.x < -400 || car.position.z > 400 || car.position.z < -400) {
                    let randomInt=THREE.MathUtils.randInt(0,2)
                    car.position.x=450;
                    car.position.z=-(30+randomInt *15)
                    car.rotation.y=-Math.PI/2;
                    // scene.remove(car);
                }
            });
        });
    }, 250);

}).catch(error => {
    console.error(error);
});
}

loadRoad(scene);

let occ2 = [  [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0]
            ];
let occ_pos=[];
let occ21 = [  [0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0], 
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0]
            ];

let occ_pos1=[];
let occ_pos2=[];
let occ_pos3=[];

// -------------------------Traffic Light-------------------------
const redMaterialOn = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const redMaterialOff = new THREE.MeshBasicMaterial({ color: 0x333333 });
const yellowMaterialOn = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const yellowMaterialOff = new THREE.MeshBasicMaterial({ color: 0x333333 });
const greenMaterialOn = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const greenMaterialOff = new THREE.MeshBasicMaterial({ color: 0x333333 });

// Array to hold all traffic lights
const trafficLights = [];

// Function to create a traffic light
function createTrafficLight(x, y, z) {
    const group = new THREE.Group();
    const lightGeometry = new THREE.SphereGeometry(1, 32, 32);

    // Red light
    const redLight = new THREE.Mesh(lightGeometry, redMaterialOn);
    redLight.position.set(-2.3, 0, 0);
    group.add(redLight);

    const redShadeGeometry = new THREE.CylinderGeometry(1, 1, 0.5, 32, 1, true); // Hollow cylinder with open ends
    const shadeMaterial = new THREE.MeshBasicMaterial({ color: 0x333333, side: THREE.DoubleSide }); // Double-sided for inner visibility
    const redShade = new THREE.Mesh(redShadeGeometry, shadeMaterial);
    redShade.position.set(-2.3, 0, 0.5); // Position above the red light
    redShade.rotation.z = Math.PI / 2;
    redShade.rotation.y=Math.PI/2 // Slant the cylinder to create an angled shade
    group.add(redShade);

    // Yellow light
    const yellowLight = new THREE.Mesh(lightGeometry, yellowMaterialOff);
    yellowLight.position.set(0, 0, 0);
    group.add(yellowLight);
    const yellowShade = new THREE.Mesh(redShadeGeometry.clone(), shadeMaterial);
    yellowShade.position.set(0, 0, 0.5);
    yellowShade.rotation.z = Math.PI / 2;
    yellowShade.rotation.y = Math.PI / 2;
    group.add(yellowShade);

    // Green light
    const greenLight = new THREE.Mesh(lightGeometry, greenMaterialOff);
    greenLight.position.set(2.3, 0, 0);
    group.add(greenLight);
    const greenShade = new THREE.Mesh(redShadeGeometry.clone(), shadeMaterial);
    greenShade.position.set(2.3, 0, 0.5);
    greenShade.rotation.z = Math.PI / 2;
    greenShade.rotation.y = Math.PI / 2;
    group.add(greenShade);

    const housingGeometry = new THREE.BoxGeometry(7, 3, 1.5); // Adjust dimensions as needed
    const housingMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const housing = new THREE.Mesh(housingGeometry, housingMaterial);
    housing.position.set(0, 0, -0.3); // Position it to enclose the lights
    group.add(housing);


    
    group.position.set(x, y, z);
    if (z ==-69) {
        group.rotation.y = 0;
    }
    else if (z == 69) {
        group.rotation.y = Math.PI;
    }
    else if (x == -69) {
        group.rotation.y = Math.PI / 2;
    }
    else if (x == 69) {
        group.rotation.y = -Math.PI / 2;
    }


    scene.add(group);
    trafficLights.push({ group, redLight, yellowLight, greenLight, state: 0 }); 
}

function AddTrafficLight() {  
// Create multiple traffic lights
for (let i = 0; i < 61; i += 15) {
    createTrafficLight(-i, 30.7, +69); // Adjust spacing as needed
}

for (let i = 0; i < 61; i += 15) {
    createTrafficLight(69, 30.7, i); // Adjust spacing as needed
}

for (let i = 0; i < 61; i += 15) {
    createTrafficLight(-69, 30.7, -i); // Adjust spacing as needed
}

for (let i = 0; i < 61; i+=15) {
    createTrafficLight(i , 30.7, -69); // Adjust spacing as needed
}
}

AddTrafficLight();

function getTrafficLightColor(index) {
    // Ensure index is within bounds
    if (index < 0 || index >= trafficLights.length) {
        console.error(`Invalid traffic light index: ${index}`);
        return null;
    }

    const trafficLight = trafficLights[index];

    // Check the material of each light to determine the current color
    if (trafficLight.redLight.material === redMaterialOn) {
        return "red";
    } else if (trafficLight.yellowLight.material === yellowMaterialOn) {
        return "yellow";
    } else if (trafficLight.greenLight.material === greenMaterialOn) {
        return "green";
    } else {
        // If no light is "on", you might consider returning "off" or null
        return "off";
    }
}

function setTrafficLightsColors(lists, color) {
    // Flatten the lists of indices into a single array
    const allIndices = [].concat(...lists);

    // Loop through each index in the combined array
    allIndices.forEach(index => {
        // Ensure each index is valid
        if (index < 0 || index >= trafficLights.length) {
            console.error(`Invalid traffic light index: ${index}`);
            return;
        }

        // Get the traffic light object for the current index
        const trafficLight = trafficLights[index];

        // Set all lights to "off" by default
        trafficLight.redLight.material = redMaterialOff;
        trafficLight.yellowLight.material = yellowMaterialOff;
        trafficLight.greenLight.material = greenMaterialOff;

        // Turn on the specified color
        switch (color) {
            case "red":
                trafficLight.redLight.material = redMaterialOn;
                break;
            case "yellow":
                trafficLight.yellowLight.material = yellowMaterialOn;
                break;
            case "green":
                trafficLight.greenLight.material = greenMaterialOn;
                break;
            default:
                console.error("Invalid color specified. Use 'red', 'yellow', or 'green'.");
        }
    });
}


const st1=[2,3,4]
const st2=[17,18,19]
const st3=[7,8,9]
const st4=[12,13,14]

const l1=[0,1]
const l2=[15,16]
const l3=[5,6]
const l4=[10,11]

// setTrafficLightsColors([l1,l2], "green");
// setTrafficLightsColors([st3,st4], "red");

let isRunning = true; // Control variable for the traffic signal loop
let currentPattern = 1; // Initialize the pattern to 1

function controlTrafficSignals() {
    // Define the two traffic signal patterns
    const patterns = {
        1: [
            { lights: [st1, l1], duration: 3000 }, // st1 and l1 green for 5 seconds
            { lights: [st2, l2], duration: 3000 }, // st2 and l2 green for 5 seconds
            { lights: [st3, l3], duration: 3000 }, // st3 and l3 green for 5 seconds
            { lights: [st4, l4], duration: 3000 }, // st4 and l4 green for 5 seconds
        ],
        2: [
            
            { lights: [st1, st2], duration: 3000 }, // First green for 5 seconds
            { lights: [st3, st4], duration: 3000 }, // Next green for 5 seconds
            { lights: [l1, l2], duration: 3000 },   // Next green for 5 seconds
            { lights: [l3, l4], duration: 3000 },   // Next green for 5 seconds
        ],
        4:[
            { lights: [st1, l1], duration: 3000 }, // st1 and l1 green for 5 seconds
            { lights: [st2, l2], duration: 3000 }, // st2 and l2 green for 5 seconds
            { lights: [st3, st4], duration: 3000 }, // st3 and l3 green for 5 seconds
            { lights: [l3, l4], duration: 3000 }, // st4 and l4 green for 5 seconds
        ],
        3:[
            { lights: [st1, st2], duration: 3000 }, // st1 and l1 green for 5 seconds
            { lights: [l1, l2], duration: 3000 }, // st2 and l2 green for 5 seconds
            { lights: [st3, l3], duration: 3000 }, // st3 and l3 green for 5 seconds
            { lights: [st4, l4], duration: 3000 }, // st4 and l4 green for 5 seconds
        ]
    };

    let index = 0;

    function changeSignals() {
        if (!isRunning) return; // Stop if not running

        const { lights, duration } = patterns[currentPattern][index];

        setTrafficLightsColors(lights, "green");

        setTimeout(() => {
            setTrafficLightsColors(lights, "yellow");

            setTimeout(() => {
                setTrafficLightsColors(lights, "red");

                index = (index + 1) % patterns[currentPattern].length; // Loop through the current pattern
                changeSignals();
            }, 1000);
        }, duration);
    }

    changeSignals();
}

// To start and stop the loop:
function startTrafficSignals() {
    isRunning = true;
    controlTrafficSignals();
}

// Function to create or update the placeholder box with the correct image
function showPlaceholderBox(pattern) {
    // Remove any existing placeholder box
    let existingBox = document.getElementById('placeholderBox');
    if (existingBox) {
        existingBox.remove();
    }

    // Create a new placeholder box
    const placeholderBox = document.createElement('div');
    placeholderBox.id = 'placeholderBox';
    placeholderBox.style.position = 'absolute';
    placeholderBox.style.top = '10px';
    placeholderBox.style.left = '10px';
    
    // Use viewport units for consistent sizing across browsers
    placeholderBox.style.width = '20vw'; // 20% of viewport width
    placeholderBox.style.height = '15vh'; // 15% of viewport height

    // Additional styling for the placeholder box
    placeholderBox.style.border = '2px solid #333';
    placeholderBox.style.backgroundColor = '#fff';
    placeholderBox.style.display = 'flex';
    placeholderBox.style.alignItems = 'center';
    placeholderBox.style.justifyContent = 'center';
    placeholderBox.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.3)';
    placeholderBox.style.zIndex = '1000';
    placeholderBox.style.opacity = 1;
    placeholderBox.style.transition = 'opacity 1s ease-out';

    // Create the image element for the placeholder
    const img = document.createElement('img');
    img.src = `./assets/patterns/pattern${pattern}.png`; // Set the correct image path based on pattern
    img.alt = `Pattern ${pattern}`;
    
    // Ensure the image fits properly within the box
    img.style.width = '100%';  // Adjust to fit the width of the placeholder box
    img.style.height = '100%'; // Adjust to fit the height of the placeholder box
    img.style.objectFit = 'contain';

    // Append the image to the placeholder box
    placeholderBox.appendChild(img);

    // Append the placeholder box to the document body
    document.body.appendChild(placeholderBox);

    // Start fade-out after 5 seconds
    setTimeout(() => {
        placeholderBox.style.opacity = 0; // Start fade-out
    }, 4000); // Wait 4 seconds before starting fade-out

    // Remove the placeholder box from the DOM after fade-out
    setTimeout(() => {
        placeholderBox.remove();
    }, 5000); // Total delay of 5 seconds (1 second fade-out duration)
}



// Function to switch patterns based on user input
function switchPattern(event) {
    if (event.key === '1') {
        currentPattern = 1; // Switch to pattern 1
        console.log("Switched to Pattern 1");
        showPlaceholderBox(1); // Display image for pattern 1
    } else if (event.key === '2') {
        currentPattern = 2; // Switch to pattern 2
        console.log("Switched to Pattern 2");
        showPlaceholderBox(2); // Display image for pattern 2
    } else if (event.key === '3') {
        currentPattern = 3; // Switch to pattern 3
        console.log("Switched to Pattern 3");
        showPlaceholderBox(3); // Display image for pattern 3
    } else if (event.key === '4') {
        currentPattern = 4; // Switch to pattern 4
        console.log("Switched to Pattern 4");
        showPlaceholderBox(4); // Display image for pattern 4
    }
}


document.addEventListener('keydown', switchPattern);

startTrafficSignals();


function animateCloud() {
    clouds.forEach(cloud => {
        cloud.position.x += 0.1;
        if (cloud.position.x > 500) cloud.position.x = -500;
    });
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animateCloud);
}

animateCloud();
