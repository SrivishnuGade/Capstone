import * as THREE from 'three';
import { CSG } from 'three-csg-ts';

class Room{
    constructor(name,scene,fullgroup,x,y,length,width,height,roof=false){
        this.name = name;
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.length = length;
        this.width = width;
        this.height = height;
        this.roof=roof;
        this.walls = {};
        this.thickness = 1;
        this.group = new THREE.Group();
        fullgroup.add(this.group);
    }
    createRoom(){
        const thickness = this.thickness;
        
    
        // Material for walls
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
    
        // Front wall
        const frontWallGeometry = new THREE.BoxGeometry(this.length, this.height, thickness);
        const frontWall = new THREE.Mesh(frontWallGeometry, wallMaterial);
        frontWall.position.set(0, this.height/2, -this.width/2);
        frontWall.castShadow = true;
        frontWall.receiveShadow = true;
        this.walls.front = frontWall;
        this.group.add(frontWall);
    
        // Back wall
        const backWallGeometry = new THREE.BoxGeometry(this.length, this.height, thickness);
        const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
        backWall.position.set(0, this.height/2, this.width/2);
        backWall.castShadow = true;
        backWall.receiveShadow = true;
        this.walls.back = backWall;
        this.group.add(backWall);
    
        // Left wall
        const leftWallGeometry = new THREE.BoxGeometry(thickness, this.height, this.width);
        const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
        leftWall.position.set(-this.length/2, this.height/2, 0);
        leftWall.castShadow = true;
        leftWall.receiveShadow = true;
        this.walls.left = leftWall;
        this.group.add(leftWall);
    
        // Right wall
        const rightWallGeometry = new THREE.BoxGeometry(thickness, this.height, this.width);
        const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial);
        rightWall.position.set(this.length/2, this.height/2, 0);
        rightWall.castShadow = true;
        rightWall.receiveShadow = true;
        this.walls.right = rightWall;
        this.group.add(rightWall);
    
        // Floor
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const floorGeometry = new THREE.BoxGeometry(this.length, thickness, this.width);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(0, 0, 0);
        floor.receiveShadow = true;
        floor.castShadow = true;
        this.group.add(floor);

        //roof
        if(this.roof)
        {
            const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
            const roofGeometry = new THREE.BoxGeometry(this.length, thickness, this.width);
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.set(0, this.height, 0);
            roof.receiveShadow = true;
            roof.castShadow = true;
            this.group.add(roof);
        }
        
        // Add the group to the scene
        this.group.position.set(this.x,0,this.y);
        // this.scene.add(this.group);
        // roomGroup = group;
    }
    addWindow(width, height, wall, offsetX=0, offsetY=0) {
        if (!this.walls[wall]) {
            console.error(`Wall ${wall} not found`);
            return;
        }

        // Create window geometry
        const windowGeometry = new THREE.BoxGeometry(
            wall === 'left' || wall === 'right' ? this.thickness  : width,
            height,
            wall === 'left' || wall === 'right' ? width : this.thickness
        );
        switch(wall) {
            case 'front':
                windowGeometry.translate(-offsetX, offsetY,0);
                break;
            case 'back':
                windowGeometry.translate(offsetX, offsetY,0);
                break;
            case 'left':
                windowGeometry.translate(0, offsetY,offsetX);
                break;
            case 'right':
                windowGeometry.translate(0, offsetY,-offsetX);
                break;
        }
        // Create window mesh and position it
        const windowMesh = new THREE.Mesh(windowGeometry);
        
        offsetX=0;
        offsetY=0;
        // Position the window based on the wall
        switch(wall) {
            case 'front':
                windowMesh.position.set(0, this.height/2, -this.width/2);
                break;
            case 'back':
                windowMesh.position.set(0,this.height/2, this.width/2);
                break;
            case 'left':
                windowMesh.position.set(-this.length/2, this.height/2,0);
                break;
            case 'right':
                windowMesh.position.set(this.length/2, this.height/2,0);
                break;
        }
        try {
            const originalPosition = this.walls[wall].position.clone();
            const originalRotation = this.walls[wall].rotation.clone();
            // Perform CSG subtraction
            const wallCSG = CSG.fromMesh(this.walls[wall]);
            // console.log(this.walls[wall].position)
            const windowCSG = CSG.fromMesh(windowMesh);
            // console.log(windowMesh.position)
            const subtractedWallCSG = wallCSG.subtract(windowCSG);
            
            // Create new mesh from CSG result
            const newWall = CSG.toMesh(
                subtractedWallCSG,
                this.walls[wall].matrix,
                this.walls[wall].material
            );

            newWall.position.copy(originalPosition);
            newWall.rotation.copy(originalRotation);
            newWall.castShadow = true;
            newWall.receiveShadow = true;
            
            // Replace old wall with new one
            this.group.remove(this.walls[wall]);
            this.walls[wall] = newWall;
            this.group.add(newWall);

            // Create window pane
            const windowPaneMaterial = new THREE.MeshStandardMaterial({
                color: 0x87CEEB,
                transparent: true,
                opacity: 0.5
            });
            const windowPane = new THREE.Mesh(windowGeometry, windowPaneMaterial);
            windowPane.position.copy(windowMesh.position);
            // windowPane.castShadow = true;
            // windowPane.receiveShadow = true;
            this.group.add(windowPane);
        } catch (error) {
            console.error('Error creating window:', error);
        }
    }
    addDoor(wall, offsetX=0) {
        if (!this.walls[wall]) {
            console.error(`Wall ${wall} not found`);
            return;
        }

        const doorGeometry = new THREE.BoxGeometry(
            wall === 'left' || wall === 'right' ? this.thickness  : 3,
            7,
            wall === 'left' || wall === 'right' ? 3 : this.thickness
        );
        const offsetY=-1.5;
        switch(wall) {
            case 'front':
                doorGeometry.translate(-offsetX, offsetY,0);
                break;
            case 'back':
                doorGeometry.translate(offsetX, offsetY,0);
                break;
            case 'left':
                doorGeometry.translate(0, offsetY,offsetX);
                break;
            case 'right':
                doorGeometry.translate(0, offsetY,-offsetX);
                break;
        }

        const doorMesh = new THREE.Mesh(doorGeometry);
        

        switch(wall) {
            case 'front':
                doorMesh.position.set(0, this.height/2, -this.width/2);
                break;
            case 'back':
                doorMesh.position.set(0,this.height/2, this.width/2);
                break;
            case 'left':
                doorMesh.position.set(-this.length/2, this.height/2,0);
                break;
            case 'right':
                doorMesh.position.set(this.length/2, this.height/2,0);
                break;
        }
        try {
            const originalPosition = this.walls[wall].position.clone();
            const originalRotation = this.walls[wall].rotation.clone();
            // Perform CSG subtraction
            const wallCSG = CSG.fromMesh(this.walls[wall]);
            const doorCSG = CSG.fromMesh(doorMesh);
            const subtractedWallCSG = wallCSG.subtract(doorCSG);
            
            // Create new mesh from CSG result
            const newWall = CSG.toMesh(
                subtractedWallCSG,
                this.walls[wall].matrix,
                this.walls[wall].material
            );

            newWall.position.copy(originalPosition);
            newWall.rotation.copy(originalRotation);
            newWall.castShadow = true;
            newWall.receiveShadow = true;
            
            this.group.remove(this.walls[wall]);
            this.walls[wall] = newWall;
            this.group.add(newWall);

            const doorMaterial = new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                transparent: true,
                opacity: 0.1
            });
            const doorPane = new THREE.Mesh(doorGeometry, doorMaterial);
            doorPane.position.copy(doorMesh.position);
            this.group.add(doorPane);
        } catch (error) {
            console.error('Error creating door:', error);
        }
    }  
    addCavity(wall,width,offsetX){
        if (!this.walls[wall]) {
            console.error(`Wall ${wall} not found`);
            return;
        }
        const cavityGeometry = new THREE.BoxGeometry(
            wall === 'left' || wall === 'right' ? this.thickness  : width,
            this.height,
            wall === 'left' || wall === 'right' ? 3 : this.thickness
        );
        switch(wall) {
            case 'front':
                cavityGeometry.translate(-offsetX,0,0);
                break;
            case 'back':
                cavityGeometry.translate(offsetX,0,0);
                break;
            case 'left':
                cavityGeometry.translate(0,0,offsetX);
                break;
            case 'right':
                cavityGeometry.translate(0,0,-offsetX);
                break;
        }

        const cavityMesh = new THREE.Mesh(cavityGeometry);
        

        switch(wall) {
            case 'front':
                cavityMesh.position.set(0, this.height/2, -this.width/2);
                break;
            case 'back':
                cavityMesh.position.set(0,this.height/2, this.width/2);
                break;
            case 'left':
                cavityMesh.position.set(-this.length/2, this.height/2,0);
                break;
            case 'right':
                cavityMesh.position.set(this.length/2, this.height/2,0);
                break;
        }
        try {
            const originalPosition = this.walls[wall].position.clone();
            const originalRotation = this.walls[wall].rotation.clone();
            // Perform CSG subtraction
            const wallCSG = CSG.fromMesh(this.walls[wall]);
            // console.log(this.walls[wall].position)
            const cavityCSG = CSG.fromMesh(cavityMesh);
            // console.log(cavityMesh.position)
            const subtractedWallCSG = wallCSG.subtract(cavityCSG);
            
            // Create new mesh from CSG result
            const newWall = CSG.toMesh(
                subtractedWallCSG,
                this.walls[wall].matrix,
                this.walls[wall].material
            );

            newWall.position.copy(originalPosition);
            newWall.rotation.copy(originalRotation);
            newWall.castShadow = true;
            newWall.receiveShadow = true;
            
            // Replace old wall with new one
            this.group.remove(this.walls[wall]);
            this.walls[wall] = newWall;
            this.group.add(newWall);

            const cavityMaterial = new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                transparent: true,
                opacity: 0.1
            });
            const cavityPane = new THREE.Mesh(cavityGeometry, cavityMaterial);
            cavityPane.position.copy(cavityMesh.position);
            this.group.add(cavityPane);
        } catch (error) {
            console.error('Error creating cavity:', error);
        }
    }
}

class Floor{
    constructor(name,scene,fullgroup,x,y,length,width,roof=false){
        this.name = name;
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.length = length;
        this.width = width;
        this.roof=roof;
        this.thickness = 1;
        this.group = new THREE.Group();
        fullgroup.add(this.group);
    }
    createFloor(){
        const thickness = this.thickness;
    
        // Floor
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const floorGeometry = new THREE.BoxGeometry(this.length, thickness, this.width);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(0, 0, 0);
        floor.receiveShadow = true;
        floor.castShadow = true;
        this.group.add(floor);

        if(this.roof){
            const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
            const roofGeometry = new THREE.BoxGeometry(this.length, thickness, this.width);
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.set(0, 10, 0);
            roof.receiveShadow = true;
            roof.castShadow = true;
            this.group.add(roof);
        }
    
        // Add the group to the scene
        this.group.position.set(this.x,0,this.y);
        // this.scene.add(this.group);
        // roomGroup = group;
    }
}


class Door extends Room{
    constructor(name,scene,x,y,length,width,height){
        super(name,scene,x,y,length,width,height);
    }
}



class RoomWindow {
    constructor(room,scene, width, height, wall, offsetX = 0, offsetY = 0) {
        this.room = room;
        this.width = width;
        this.height = height;
        this.wall = wall;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.scene=scene;
        this.createWindow();
    }

    createWindow() {
        const windowMaterial = new THREE.MeshStandardMaterial({ color: 0x00A0FF, transparent: true, opacity: 0.9 });
        let windowGeometry;
        let windowMesh;
        const x = this.room.x
        const y= this.room.y
        
        // Position based on wall selection
        switch (this.wall) {
            case 'front':
                windowGeometry = new THREE.BoxGeometry(this.width, this.height, this.room.thickness*8);
                windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                windowMesh.position.set(x+this.offsetX, this.room.height / 2 + this.offsetY, y-this.room.width / 2 );
                console.error(this.room.x+this.offsetX, this.room.height / 2 + this.offsetY, this.room.y-this.room.width / 2 );
                windowMesh.castShadow = true;
        windowMesh.receiveShadow = true;
        console.log(windowMesh.position)
        
        this.scene.add(windowMesh);
                break;
            case 'back':
                windowGeometry = new THREE.BoxGeometry(this.width, this.height, this.room.thickness*2);
                windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                windowMesh.position.set(this.room.x+this.offsetX, this.room.height / 2 + this.offsetY, this.room.y+this.room.width / 2 );
                windowMesh.castShadow = true;
        windowMesh.receiveShadow = true;
        console.log(windowMesh.position)
        
        this.scene.add(windowMesh);
                break;
            case 'left':
                windowGeometry = new THREE.BoxGeometry(this.room.thickness*2,this.height, this.width);
                windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                windowMesh.position.set(this.room.x-this.room.length/2, this.room.height / 2 + this.offsetY, this.room.y+this.offsetX);
                windowMesh.castShadow = true;
        windowMesh.receiveShadow = true;
        console.log(windowMesh.position)
        
        this.scene.add(windowMesh);
                break;
            case 'right':
                windowGeometry = new THREE.BoxGeometry(this.room.thickness*2,this.height, this.width);
                windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
                windowMesh.position.set(this.room.x+this.room.length/2, this.room.height / 2 + this.offsetY, this.room.y+this.offsetX);
                windowMesh.castShadow = true;
        windowMesh.receiveShadow = true;
        console.log(windowMesh.position)
        
        this.scene.add(windowMesh);
                break;
            default:
                console.error("Invalid wall position. Choose 'front', 'back', 'left', or 'right'.");
                return;
        }

        

    }
}

export {Room,RoomWindow,Door,Floor};