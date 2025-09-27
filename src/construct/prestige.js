import { Room ,Floor, RoomWindow} from '../classes/room.js';

export function constructPrestige(scene, fullHouse, roof) {
    const livingRoom = new Room('Living Room', scene,fullHouse, 0, 0, 12, 20, 10,roof,0xFFB6C1);
    const balcony = new Room('Balcony', scene,fullHouse, 0, 10+3, 12, 6, 10,roof,0xD2B48C);
    const foyer = new Room('Foyer', scene,fullHouse, -4,-10-2.625, 4, 5.25, 10,roof,0xFFB6C1);
    const diningRoom = new Room('Dining Room', scene,fullHouse, 3.5+6, -10+6.5, 7, 13, 10,roof,0xFFB6C1);

    const bedroom2 = new Room('Bedroom2', scene,fullHouse, -5-6.5, -0.5, 11, 13, 10,roof,0xADD8E6);

    const bedroom3 = new Room('Bedroom3', scene,fullHouse, 6+6, 10.5, 12, 11, 10,roof,0xADD8E6);
    const bedroom3path = new Room('Bedroom3path', scene,fullHouse, 3.5+6, 4, 7, 2, 10,roof,0xADD8E6);

    const bathroom2 = new Room('Bathroom2', scene,fullHouse, -6-2.75, +1.5-10-2.625, 5.5, 8.25, 10,roof);
    

    const bedroom = new Room('Bedroom', scene,fullHouse, 6+7+6, -2.5, 12, 15, 10,roof,0xFFFFE0);
    const bathroom = new Room('Bathroom', scene,fullHouse, 6+7+12-3, -4.5-10, 6, 9, 10,roof);
    const balcony2 = new Room('Balcony2', scene,fullHouse, 6+12+3.5, 7.5, 7, 5, 10,roof,0xD2B48C);

    const bathroom3 = new Room('Bathroom3', scene,fullHouse, 6+7+6-4.5, -2.5-10, 9, 5, 10,roof);
    
    const kitchen = new Room('Kitchen', scene,fullHouse, 5+4-5, -15, 12, 10, 10,roof,0x90EE90);
    const utily = new Room('Utility', scene,fullHouse, 6+7, -7.5-10, 6, 5, 10,roof,0xD3D3D3);

    livingRoom.createRoom();
    livingRoom.addDoor('left',-5.5);
    livingRoom.addWindow(8,8,'back',0,-1);

    livingRoom.addDoor('front',-3);

    livingRoom.addCavity('front',4,4)
    livingRoom.addCavity('right',13,10-6.5)

    diningRoom.createRoom();
    diningRoom.addCavity('left',13);
    diningRoom.addDoor('front',-2);
    diningRoom.addDoor('back',2);
    diningRoom.addDoor('right',5);

    balcony.createRoom();
    balcony.addWindow(8,8,'front',0,-1);
    balcony.addCavity('back',12);

    foyer.createRoom();
    foyer.addDoor('front');
    foyer.addCavity('back',4);

    bedroom3.createRoom();
    bedroom3.addCavity('front',7,2.5)
    bedroom3.addWindow(4,4,'back');

    bedroom3path.createRoom();
    bedroom3path.addDoor('front',-2);
    bedroom3path.addCavity('back',7);

    bedroom2.createRoom();
    bedroom2.addWindow(4,4,'back');
    bedroom2.addDoor('right',5);
    bedroom2.addDoor('front',-1.5);

    bathroom2.createRoom();
    bathroom2.addDoor('back',-1.5);
    bathroom2.addWindow(2,2,'left',0,2);


    kitchen.createRoom();
    kitchen.addDoor('back',-1);
    kitchen.addWindow(4,4,'front');
    kitchen.addCavity('right',5,2.5)

    bedroom.createRoom();
    bedroom.addDoor('left',-6);
    bedroom.addDoor('back',4.5);
    bedroom.addDoor('front',-1.5);

    balcony2.createRoom();
    balcony2.addCavity('back',7);
    balcony2.addDoor('front',-2);

    bathroom.createRoom();
    bathroom.addDoor('back',-1.5);
    bathroom.addWindow(2,2,'front',1.5,2);

    bathroom3.createRoom();
    bathroom3.addDoor('back',-3);
    bathroom3.addWindow(2,2,'front',-3,2);

    utily.createRoom();
    utily.addCavity('left',5);
    utily.addWindow(4,4,'front');
}