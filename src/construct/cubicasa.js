import { Wall, FloorRoof } from '../classes/wall.js';
import * as THREE from 'three';

export function constructCubicasa(scene, fullHouse, roof) {
    const jsonLoader = new THREE.FileLoader();
    jsonLoader.load('/colorful_1012.json', (data) => {
        const json = JSON.parse(data);
        console.log(json);

        const wallHeight = 10;


        json.walls.forEach(wallData => {
            const name = wallData.class || "Wall";
            const points = wallData.points;
            const doors = wallData.doors || [];
            const windows = wallData.windows || [];
            const wall = new Wall(name, scene, fullHouse, points, wallHeight, doors, windows);
            wall.createWall();
            doors.forEach(door => {
                wall.addDoor(door.points);
            });
            windows.forEach(window => {
                wall.addWindow(4, window.points);
            });
        });

        json.floors.forEach(floorData => {
            const name = floorData.class || "Floor";
            const points = floorData.points;
            const thickness = 0.5;
            const floor = new FloorRoof(name, scene, fullHouse, points, thickness, roof);
            floor.createFloor();
        });
    });
    fullHouse.translateY(-0.5);
}