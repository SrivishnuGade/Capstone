import * as THREE from 'three';
import { CSG } from 'three-csg-ts';
import { scale } from '../scenes/mainScene.js';

class Room{
    constructor(name,scene,fullgroup,x,y,length,width,height,roof=false,color=0xD3D3D3){
        this.color = color;
        this.name = name;
        this.scene = scene;
        this.x = x*scale;
        this.y = y*scale;
        this.length = length*scale;
        this.width = width*scale;
        this.height = height*scale;
        this.roof=roof;
        this.walls = {};
        this.thickness = 1*scale;
        this.group = new THREE.Group();
        fullgroup.add(this.group);
    }
    createRoom(){
        const thickness = this.thickness;
        
    
        // Material for walls
        const innerWallMaterial = new THREE.MeshStandardMaterial({ color: this.color });
        const outerWallMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });

        // Front wall
        const outerFrontWallGeometry = new THREE.BoxGeometry(this.length, this.height, thickness/4);
        const outerFrontWall = new THREE.Mesh(outerFrontWallGeometry, outerWallMaterial);
        outerFrontWall.position.set(0, this.height/2, -this.width/2+thickness/8);
        outerFrontWall.castShadow = true;
        outerFrontWall.receiveShadow = true;
        this.walls.outerFront = outerFrontWall;
        this.group.add(outerFrontWall);

        const innerFrontWallGeometry = new THREE.BoxGeometry(this.length-thickness/2, this.height, thickness/4);
        const innerFrontWall = new THREE.Mesh(innerFrontWallGeometry, innerWallMaterial);
        innerFrontWall.position.set(0, this.height/2, -this.width/2+3*thickness/8);
        innerFrontWall.castShadow = true;
        innerFrontWall.receiveShadow = true;
        this.walls.innerFront = innerFrontWall;
        this.group.add(innerFrontWall);

        // Back wall
        const outerBackWallGeometry = new THREE.BoxGeometry(this.length, this.height, thickness/4);
        const outerBackWall = new THREE.Mesh(outerBackWallGeometry, outerWallMaterial);
        outerBackWall.position.set(0, this.height/2, this.width/2-thickness/8);
        outerBackWall.castShadow = true;
        outerBackWall.receiveShadow = true;
        this.walls.outerBack = outerBackWall;
        this.group.add(outerBackWall);

        const innerBackWallGeometry = new THREE.BoxGeometry(this.length-thickness/2, this.height, thickness/4);
        const innerBackWall = new THREE.Mesh(innerBackWallGeometry, innerWallMaterial);
        innerBackWall.position.set(0, this.height/2, this.width/2-3*thickness/8);
        innerBackWall.castShadow = true;
        innerBackWall.receiveShadow = true;
        this.walls.innerBack = innerBackWall;
        this.group.add(innerBackWall);

        // Left wall
        const outerLeftWallGeometry = new THREE.BoxGeometry(thickness/4, this.height, this.width);
        const outerLeftWall = new THREE.Mesh(outerLeftWallGeometry, outerWallMaterial);
        outerLeftWall.position.set(-this.length/2+thickness/8, this.height/2, 0);
        outerLeftWall.castShadow = true;
        outerLeftWall.receiveShadow = true;
        this.walls.outerLeft = outerLeftWall;
        this.group.add(outerLeftWall);

        const innerLeftWallGeometry = new THREE.BoxGeometry(thickness/4, this.height, this.width-thickness/2);
        const innerLeftWall = new THREE.Mesh(innerLeftWallGeometry, innerWallMaterial);
        innerLeftWall.position.set(-this.length/2+3*thickness/8, this.height/2, 0);
        innerLeftWall.castShadow = true;
        innerLeftWall.receiveShadow = true;
        this.walls.innerLeft = innerLeftWall;
        this.group.add(innerLeftWall);

        // Right wall
        const outerRightWallGeometry = new THREE.BoxGeometry(thickness/4, this.height, this.width);
        const outerRightWall = new THREE.Mesh(outerRightWallGeometry, outerWallMaterial);
        outerRightWall.position.set(this.length/2-thickness/8, this.height/2, 0);
        outerRightWall.castShadow = true;
        outerRightWall.receiveShadow = true;
        this.walls.outerRight = outerRightWall;
        this.group.add(outerRightWall);

        const innerRightWallGeometry = new THREE.BoxGeometry(thickness/4, this.height, this.width-thickness/2);
        const innerRightWall = new THREE.Mesh(innerRightWallGeometry, innerWallMaterial);
        innerRightWall.position.set(this.length/2-3*thickness/8, this.height/2, 0);
        innerRightWall.castShadow = true;
        innerRightWall.receiveShadow = true;
        this.walls.innerRight = innerRightWall;
        this.group.add(innerRightWall);    
    
        
        // const texLoader = new THREE.TextureLoader();
        // const floorTexture = texLoader.load('tiles/Tiles_067_basecolor.png');
        // const floorNormalMap = texLoader.load('tiles/Tiles_067_normal.png');
        // const floorHeightMap = texLoader.load('tiles/Tiles_067_height.png');
        // const floorRoughnessMap = texLoader.load('tiles/Tiles_067_roughness.png');
        // const floorAOmap= texLoader.load('tiles/Tiles_067_ambientOcclusion.png');

        // const floorMaterial = new THREE.MeshStandardMaterial({
        //     map: floorTexture,
        //     normalMap: floorNormalMap,
        //     // displacementMap: floorHeightMap,
        //     // displacementScale: 0.01*scale,
        //     roughnessMap: floorRoughnessMap,
        //     roughness: 0.2,
        //     aoMap: floorAOmap,
        //     aoMapIntensity: 1.5,
        //     metalness: 0.6
        // });
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const floorGeometry = new THREE.BoxGeometry(this.length, thickness, this.width);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        // floor.geometry.attributes.uv2 = floor.geometry.attributes.uv;
        floor.position.set(0, -thickness/2, 0);
        floor.receiveShadow = true;
        floor.castShadow = true;
        this.group.add(floor);

        const baseSize = 256;
        const chars = Math.max(this.name.length, 8); // minimum width for short names
        const size = Math.ceil(baseSize + (chars - 8) * 32); // increase width for longer names
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = baseSize;
        const ctx = canvas.getContext('2d');
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 6;
        ctx.strokeText(this.name, size / 2, size / 2);
        ctx.fillText(this.name, size / 2, size / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        const aspect = size / baseSize;
        sprite.scale.set(2*scale * aspect, 2*scale, 2*scale); // Width scales with aspect, height stays the same

        // Position the sprite at the centroid and slightly above the floor
        sprite.position.set(0, this.thickness + 5*scale, 0);

        this.group.add(sprite);

        //roof
        if(this.roof)
        {
            const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
            const roofGeometry = new THREE.BoxGeometry(this.length, thickness, this.width);
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.set(0, this.height+thickness/2, 0);
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
        width=width*scale;
        height=height*scale;
        offsetX=offsetX*scale;
        offsetY=offsetY*scale;
        if (!this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`] || 
            !this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`]) {
            console.error(`Outer or inner wall for ${wall} not found`);
            return;
        }

        // Create window geometry
        const windowGeometry = new THREE.BoxGeometry(
            wall === 'left' || wall === 'right' ? this.thickness/2  : width,
            height,
            wall === 'left' || wall === 'right' ? width : this.thickness/2
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
        switch (wall) {
            case 'front':
                windowMesh.position.set(0, this.height / 2, -this.width / 2 + this.thickness/4);
                break;
            case 'back':
                windowMesh.position.set(0, this.height / 2, this.width / 2 - this.thickness/4);
                break;
            case 'left':
                windowMesh.position.set(-this.length / 2 + this.thickness/4, this.height / 2, 0);
                break;
            case 'right':
                windowMesh.position.set(this.length / 2 - this.thickness/4, this.height / 2, 0);
                break;
        }
        try {
            // Handle outer wall subtraction
            const outerOriginalPosition = this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`].position.clone();
            const outerOriginalRotation = this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`].rotation.clone();
            const outerWallCSG = CSG.fromMesh(this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`]);
            const windowCSG = CSG.fromMesh(windowMesh);
            const subtractedOuterWallCSG = outerWallCSG.subtract(windowCSG);
        
            const newOuterWall = CSG.toMesh(
                subtractedOuterWallCSG,
                this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`].matrix,
                this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`].material
            );
        
            newOuterWall.position.copy(outerOriginalPosition);
            newOuterWall.rotation.copy(outerOriginalRotation);
            newOuterWall.castShadow = true;
            newOuterWall.receiveShadow = true;
        
            this.group.remove(this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`]);
            this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`] = newOuterWall;
            this.group.add(newOuterWall);
        
            // Handle inner wall subtraction
            const innerOriginalPosition = this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`].position.clone();
            const innerOriginalRotation = this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`].rotation.clone();
            const innerWallCSG = CSG.fromMesh(this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`]);
            const subtractedInnerWallCSG = innerWallCSG.subtract(windowCSG);
        
            const newInnerWall = CSG.toMesh(
                subtractedInnerWallCSG,
                this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`].matrix,
                this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`].material
            );
        
            newInnerWall.position.copy(innerOriginalPosition);
            newInnerWall.rotation.copy(innerOriginalRotation);
            newInnerWall.castShadow = true;
            newInnerWall.receiveShadow = true;
        
            this.group.remove(this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`]);
            this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`] = newInnerWall;
            this.group.add(newInnerWall);
        
            // Create window pane
            const windowPaneMaterial = new THREE.MeshStandardMaterial({
                color: 0x87CEEB,
                transparent: true,
                opacity: 0.2
            });
            const windowPane = new THREE.Mesh(windowGeometry, windowPaneMaterial);
            windowPane.position.copy(windowMesh.position);
            this.group.add(windowPane);
        } catch (error) {
            console.error('Error creating window:', error);
        }
    }
    addDoor(wall, offsetX=0) {
        offsetX=offsetX*scale;
        if (!this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`] || 
            !this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`]) {
            console.error(`Outer or inner wall for ${wall} not found`);
            return;
        }

        const doorGeometry = new THREE.BoxGeometry(
            wall === 'left' || wall === 'right' ? this.thickness/2  : 3*scale,
            7*scale,
            wall === 'left' || wall === 'right' ? 3*scale : this.thickness/2
        );
        const offsetY=-1.5*scale;
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
                doorMesh.position.set(0, this.height/2, -this.width/2+this.thickness/4);
                break;
            case 'back':
                doorMesh.position.set(0,this.height/2, this.width/2-this.thickness/4);
                break;
            case 'left':
                doorMesh.position.set(-this.length/2+this.thickness/4, this.height/2,0);
                break;
            case 'right':
                doorMesh.position.set(this.length/2-this.thickness/4, this.height/2,0);
                break;
        }
        try {
            const doorCSG = CSG.fromMesh(doorMesh);
    
            // Handle outer wall subtraction
            const outerOriginalPosition = this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`].position.clone();
            const outerOriginalRotation = this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`].rotation.clone();
            const outerWallCSG = CSG.fromMesh(this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`]);
            const subtractedOuterWallCSG = outerWallCSG.subtract(doorCSG);
    
            const newOuterWall = CSG.toMesh(
                subtractedOuterWallCSG,
                this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`].matrix,
                this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`].material
            );
    
            newOuterWall.position.copy(outerOriginalPosition);
            newOuterWall.rotation.copy(outerOriginalRotation);
            newOuterWall.castShadow = true;
            newOuterWall.receiveShadow = true;
    
            this.group.remove(this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`]);
            this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`] = newOuterWall;
            this.group.add(newOuterWall);
    
            // Handle inner wall subtraction
            const innerOriginalPosition = this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`].position.clone();
            const innerOriginalRotation = this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`].rotation.clone();
            const innerWallCSG = CSG.fromMesh(this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`]);
            const subtractedInnerWallCSG = innerWallCSG.subtract(doorCSG);
    
            const newInnerWall = CSG.toMesh(
                subtractedInnerWallCSG,
                this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`].matrix,
                this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`].material
            );
    
            newInnerWall.position.copy(innerOriginalPosition);
            newInnerWall.rotation.copy(innerOriginalRotation);
            newInnerWall.castShadow = true;
            newInnerWall.receiveShadow = true;
    
            this.group.remove(this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`]);
            this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`] = newInnerWall;
            this.group.add(newInnerWall);
    
            // Create door pane
            const doorMaterial = new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                transparent: true,
                opacity: 0.0
            });
            const doorPane = new THREE.Mesh(doorGeometry, doorMaterial);
            doorPane.position.copy(doorMesh.position);
            this.group.add(doorPane);
        } catch (error) {
            console.error('Error creating door:', error);
        }
    }
    addCavity(wall, width, offsetX = 0) {
        width=width*scale;
        offsetX=offsetX*scale;
        if (!this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`] || 
            !this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`]) {
            console.error(`Outer or inner wall for ${wall} not found`);
            return;
        }
    
        const cavityGeometry = new THREE.BoxGeometry(
            wall === 'left' || wall === 'right' ? this.thickness/2 : width,
            this.height,
            wall === 'left' || wall === 'right' ? width : this.thickness/2
        );
    
        switch (wall) {
            case 'front':
                cavityGeometry.translate(-offsetX, 0, 0);
                break;
            case 'back':
                cavityGeometry.translate(offsetX, 0, 0);
                break;
            case 'left':
                cavityGeometry.translate(0, 0, offsetX);
                break;
            case 'right':
                cavityGeometry.translate(0, 0, -offsetX);
                break;
        }
    
        const cavityMesh = new THREE.Mesh(cavityGeometry);
    
        switch (wall) {
            case 'front':
                cavityMesh.position.set(0, this.height / 2, -this.width / 2+ this.thickness/4);
                break;
            case 'back':
                cavityMesh.position.set(0, this.height / 2, this.width / 2- this.thickness/4);
                break;
            case 'left':
                cavityMesh.position.set(-this.length / 2+this.thickness/4, this.height / 2, 0);
                break;
            case 'right':
                cavityMesh.position.set(this.length / 2-this.thickness/4, this.height / 2, 0);
                break;
        }
    
        try {
            const cavityCSG = CSG.fromMesh(cavityMesh);
    
            // Handle outer wall subtraction
            const outerOriginalPosition = this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`].position.clone();
            const outerOriginalRotation = this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`].rotation.clone();
            const outerWallCSG = CSG.fromMesh(this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`]);
            const subtractedOuterWallCSG = outerWallCSG.subtract(cavityCSG);
    
            const newOuterWall = CSG.toMesh(
                subtractedOuterWallCSG,
                this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`].matrix,
                this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`].material
            );
    
            newOuterWall.position.copy(outerOriginalPosition);
            newOuterWall.rotation.copy(outerOriginalRotation);
            newOuterWall.castShadow = true;
            newOuterWall.receiveShadow = true;
    
            this.group.remove(this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`]);
            this.walls[`outer${wall.charAt(0).toUpperCase() + wall.slice(1)}`] = newOuterWall;
            this.group.add(newOuterWall);
    
            // Handle inner wall subtraction
            const innerOriginalPosition = this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`].position.clone();
            const innerOriginalRotation = this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`].rotation.clone();
            const innerWallCSG = CSG.fromMesh(this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`]);
            const subtractedInnerWallCSG = innerWallCSG.subtract(cavityCSG);
    
            const newInnerWall = CSG.toMesh(
                subtractedInnerWallCSG,
                this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`].matrix,
                this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`].material
            );
    
            newInnerWall.position.copy(innerOriginalPosition);
            newInnerWall.rotation.copy(innerOriginalRotation);
            newInnerWall.castShadow = true;
            newInnerWall.receiveShadow = true;
    
            this.group.remove(this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`]);
            this.walls[`inner${wall.charAt(0).toUpperCase() + wall.slice(1)}`] = newInnerWall;
            this.group.add(newInnerWall);
    
            // Create cavity pane
            const cavityMaterial = new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                transparent: true,
                opacity: 0.0
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
        this.x = x*scale;
        this.y = y*scale;
        this.length = length * scale;
        this.width = width * scale;
        this.roof=roof;
        this.thickness = 1*scale;
        this.group = new THREE.Group();
        fullgroup.add(this.group);
    }
    createFloor(){
        const thickness = this.thickness;
    
        // Floor
        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
        const floorGeometry = new THREE.BoxGeometry(this.length, thickness, this.width);
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.set(0, -thickness/2, 0);
        floor.receiveShadow = true;
        floor.castShadow = true;
        this.group.add(floor);

        if(this.roof){
            const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa });
            const roofGeometry = new THREE.BoxGeometry(this.length, thickness, this.width);
            const roof = new THREE.Mesh(roofGeometry, roofMaterial);
            roof.position.set(0, 10*scale+thickness/2, 0);
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


export {Room,Floor};