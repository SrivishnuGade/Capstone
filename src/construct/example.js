import { Room } from '../classes/room.js';
import * as THREE from 'three';
import { scale } from '../scenes/mainScene.js';
import { getRoomColor } from './color.js';

export function constructExample(scene, fullHouse, roof) {
    let max_x = 0;
    let min_y = 0;
    const jsonLoader = new THREE.FileLoader();
        jsonLoader.load('/Vastu_Layout_Output_v3.json', (data) => {
        const json = JSON.parse(data);
        console.log(json);
        const wallMap = { top: 'front', bottom: 'back', left: 'left', right: 'right' };
        const roomsByName = new Map();
        json.rooms.forEach(item => {
            const name = item.name;
            const length = Number(item.length ?? 0);
            const width = Number(item.width ?? 0);
            const x = Number(item.x);
            const y = Number(item.y);
            if (x+length/2>max_x) max_x = x+length/2;
            if (y-width/2<min_y) min_y = y-width/2;
            console.log(item)
            const room = new Room(name, scene,fullHouse, x,y, length,width, 10,roof,getRoomColor(name));
            room.createRoom();
            roomsByName.set(name, room);

            const adj = item.adjacency || {};

            if (/^Bathroom/i.test(name)) {
                if (!adj.top || adj.top.length === 0) {
                    room.addWindow(2, 2, wallMap.top,0,2);
                } else if (!adj.bottom || adj.bottom.length === 0) {
                    room.addWindow(2, 2, wallMap.bottom,0,2);
                } else if (!adj.left || adj.left.length === 0) {
                    room.addWindow(2, 2, wallMap.left,0,2);
                } else if (!adj.right || adj.right.length === 0) {
                    room.addWindow(2, 2, wallMap.right,0,2);
                }
            }
            else if (/^Balcony/i.test(name)) {
                room.addCavity('back', length);
                room.addCavity('right', width);
                room.addCavity('left', width);
                room.addCavity('front', length);
            }
            else{
                
                if (!adj.top || adj.top.length === 0) {
                    room.addWindow(length*0.6,4, wallMap.top);
                }
                if (!adj.bottom || adj.bottom.length === 0) {
                    room.addWindow(length*0.6,4, wallMap.bottom);
                }
                if (!adj.left || adj.left.length === 0) {
                    room.addWindow(width*0.6,4, wallMap.left);
                }
                if (!adj.right || adj.right.length === 0) {
                    room.addWindow(width*0.6,4, wallMap.right);
                }
            }

        });
        json.doors.forEach(doorData => {
            const x = doorData.x;
            const y = doorData.y;
            const r1 = roomsByName.get(doorData.room1);
            const r2 = roomsByName.get(doorData.room2);
            if (!r1 || !r2) return;

            const isBalcony1 = /^Balcony/i.test(doorData.room1 || '');
            const isBalcony2 = /^Balcony/i.test(doorData.room2 || '');

            // if both are balconies, skip adding doors
            if (isBalcony1 && isBalcony2) return;

            if (doorData.orientation === 'vertical') {
                // compute positions for both sides
                const r1RightPos = r1.y / scale - y;
                const r2LeftPos = y - r2.y / scale;
                const r1LeftPos = y - r1.y / scale;
                const r2RightPos = r2.y / scale - y;

                if (r1.x < r2.x) {
                    if (!isBalcony1) r1.addDoor('right', r1RightPos);
                    if (!isBalcony2) r2.addDoor('left', r2LeftPos);
                } else {
                    if (!isBalcony1) r1.addDoor('left', r1LeftPos);
                    if (!isBalcony2) r2.addDoor('right', r2RightPos);
                }
            } else {
                // horizontal / front-back
                const r1BackPos = x - r1.x / scale;
                const r2FrontPos = r2.x / scale - x;
                const r1FrontPos = r1.x / scale - x;
                const r2BackPos = x - r2.x / scale;

                if (r1.y < r2.y) {
                    if (!isBalcony1) r1.addDoor('back', r1BackPos);
                    if (!isBalcony2) r2.addDoor('front', r2FrontPos);
                } else {
                    if (!isBalcony1) r1.addDoor('front', r1FrontPos);
                    if (!isBalcony2) r2.addDoor('back', r2BackPos);
                }
            }
        });
        fullHouse.translateX(-max_x/2*scale);
        fullHouse.translateZ(-min_y/2*scale);
    });
}


// export function constructExample(scene, fullHouse, roof) {
//     const livingRoom = new Room('Living Room', scene,fullHouse, 0, 0, 20, 19.5, 10,roof,0xFFB6C1);

//     const coveredPorch = new Room('Covered Porch', scene,fullHouse, 5, 9.75+5, 10, 10, 10,roof,0xADD8E6);
//     const rooftopGarden = new Room('Rooftop Garden', scene,fullHouse, -5, 9.75+5, 10, 10, 10,roof,0x90EE90);

//     const bedroom3 = new Room('Bedroom3', scene,fullHouse, 10-6-5.25, 9.75+10+4, 10.5, 8, 10,roof,0xFFFFE0);
//     const bathroom2= new Room('Bathroom2', scene,fullHouse, 10-3, 9.75+10+4, 6, 8, 10,roof);

//     const masterBedroom = new Room('Master Bedroom', scene,fullHouse, -10-5, 9.75+10+8-7-4, 10, 8, 10,roof,0xFFFFE0);
//     const bedroom2 = new Room('Bedroom2', scene,fullHouse, -10-5, 9.75+10+8-7-8-4, 10, 8, 10,roof,0xFFFFE0);
//     const diningRoom = new Room('Dining Room', scene,fullHouse, -10-5, 9.75+10+8-7-8-8-6, 10, 12, 10,roof,0xFFB6C1);

//     const bathroom = new Room('Bathroom', scene,fullHouse, -10-10+2.5, 9.75+10+8-7-4+4+3.5, 5, 7, 10,roof);
//     const kitchen = new Room('Kitchen', scene,fullHouse, -10-10+5+4, 9.75+10+8-7-4+4+3.5, 8, 7, 10,roof,0x90EE90);

//     livingRoom.createRoom();
//     livingRoom.addDoor('back',5);
//     livingRoom.addDoor('back',-5);
//     livingRoom.addWindow(8,4,'right',-2);
//     livingRoom.addWindow(8,4,'front');
//     livingRoom.addDoor('left',-1.25);
//     livingRoom.addDoor('right',7.5);
//     livingRoom.addDoor('left',7.25);

//     coveredPorch.createRoom();
//     coveredPorch.addDoor('front',0);
//     coveredPorch.addWindow(4,4,'right');
//     coveredPorch.addDoor('back',-5+2)
//     coveredPorch.addCavity('left',8);

//     rooftopGarden.createRoom();
//     rooftopGarden.addDoor('front',0);
//     rooftopGarden.addDoor('left',2.125);
//     rooftopGarden.addCavity('right',8);

//     bedroom3.createRoom();
//     bedroom3.addDoor('front',-5+1.75);
//     bedroom3.addDoor('right',0);
//     bedroom3.addWindow(4,4,'back');

//     bathroom2.createRoom();
//     bathroom2.addDoor('left',0);
//     bathroom2.addWindow(2,2,'back',0,2);

//     masterBedroom.createRoom();
//     masterBedroom.addWindow(4,4,'left');
//     masterBedroom.addDoor('right');
//     masterBedroom.addDoor('back',-2.5)

//     bedroom2.createRoom();
//     bedroom2.addWindow(4,4,'left');
//     bedroom2.addDoor('right',1.5);

//     diningRoom.createRoom();
//     diningRoom.addWindow(4,4,'front');
//     diningRoom.addWindow(4,4,'left'); 
//     diningRoom.addDoor('right');  

//     bathroom.createRoom();
//     bathroom.addDoor('front');
//     bathroom.addWindow(2,2,'left',0,2);

//     kitchen.createRoom();
//     kitchen.addWindow(4,4,'back');
//     kitchen.addDoor('front',2);
// }