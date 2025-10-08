import { Room ,Floor} from '../classes/room.js';

export function constructDomLur(scene, fullHouse, roof) {
    const livingRoom = new Room('Living Room', scene,fullHouse, 0, 0, 25, 10, 10,roof,0xFFB6C1);
    const bedroom2 = new Room('Bedroom2', scene,fullHouse, -12.5+6.5, 10, 13, 10, 10,roof,0xADD8E6);
    const kitchen = new Room('Kitchen', scene,fullHouse, 12.5+4, 0, 8, 10, 10,roof,0x90EE90);
    const bedroom = new Room('Bedroom', scene,fullHouse, 12.5+8-6, 10, 12, 10, 10,roof,0xFFFFE0);
    const bathroom = new Room('Bathroom', scene,fullHouse, 4.5, 5+3+4, 8, 6, 10,roof);
    const floorbath= new Floor('Floorbath',scene,fullHouse,0.5+4,7,8,4,roof)

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
}