import * as THREE from 'three';
import { CSG } from 'three-csg-ts';

class Wall {
    constructor(name, scene, fullgroup, points, height, doors = [], windows = []) {
        this.name = name;
        this.scene = scene;
        this.points = points;
        this.height = height;
        this.doors = doors;
        this.windows = windows;
        this.walls = {};
        this.thickness = 1;
        this.group = new THREE.Group();
        fullgroup.add(this.group);
    }
    createWall() {
        // Material for walls
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });

        // points is a list of edges of a polygon of the from  "-30.62,17.02 22.42,17.02 21.70,16.29 -29.89,16.29"
        const shape = new THREE.Shape();
        const coords = this.points.split(" ").map(p => {
            const [x, z] = p.split(",").map(Number); // Treat second value as Z
            return [x, z];
        });
        shape.moveTo(coords[0][0], coords[0][1]);
        for (let i = 1; i < coords.length; i++) {
            shape.lineTo(coords[i][0], coords[i][1]);
        }
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: this.height, bevelEnabled: false });
        const wall = new THREE.Mesh(geometry, wallMaterial);
        wall.castShadow = true;
        wall.receiveShadow = true;
        // Rotate so extrusion goes up (Y axis)
        wall.rotation.x = -Math.PI / 2;
        this.group.add(wall);
        this.wallMesh = wall;
    }
    addWindow(height, points, offsetY = 0) {
        // points is a list of edges of a polygon of the from  "-30.62,17.02 22.42,17.02 21.70,16.29 -29.89,16.29"
        // Create window geometry
        const shape = new THREE.Shape();
        const coords = points.split(" ").map(p => {
            const [x, z] = p.split(",").map(Number);
            return [x, z];
        });

        let cx = 0, cz = 0;
        coords.forEach(([x, z]) => { cx += x; cz += z; });
        cx /= coords.length;
        cz /= coords.length;

        // Scale outward from centroid
        const grow = 0.001; // Increase as needed (in world units)
        const grownCoords = coords.map(([x, z]) => {
            return [
                cx + (x - cx) * (1 + grow),
                cz + (z - cz) * (1 + grow)
            ];
        });

        // Build shape

        shape.moveTo(grownCoords[0][0], grownCoords[0][1]);
        for (let i = 1; i < grownCoords.length; i++) {
            shape.lineTo(grownCoords[i][0], grownCoords[i][1]);
        }
        const windowGeometry = new THREE.ExtrudeGeometry(shape, { depth: height, bevelEnabled: false });
        windowGeometry.translate(0, 0, 5 - height / 2); // raise the window vertically
        const windowMesh = new THREE.Mesh(windowGeometry);
        windowMesh.rotation.x = -Math.PI / 2;


        try {
            const originalPosition = this.wallMesh.position.clone();
            const originalRotation = this.wallMesh.rotation.clone();
            const wallCSG = CSG.fromMesh(this.wallMesh);
            const windowCSG = CSG.fromMesh(windowMesh);
            const subtractedWallCSG = wallCSG.subtract(windowCSG);

            const newWall = CSG.toMesh(
                subtractedWallCSG,
                this.wallMesh.matrix,
                this.wallMesh.material
            );

            newWall.position.copy(originalPosition);
            newWall.rotation.copy(originalRotation);
            newWall.castShadow = true;
            newWall.receiveShadow = true;

            this.group.remove(this.wallMesh);
            this.wallMesh = newWall;
            this.group.add(newWall);

            const windowPaneMaterial = new THREE.MeshStandardMaterial({
                color: 0x87CEEB,
                transparent: true,
                opacity: 0.5
            });
            const windowPane = new THREE.Mesh(windowGeometry, windowPaneMaterial);
            windowPane.position.copy(windowMesh.position);
            windowPane.rotation.x = -Math.PI / 2;
            // windowPane.castShadow = true;
            // windowPane.receiveShadow = true;
            this.group.add(windowPane);


        } catch (error) {
            console.error('Error creating window:', error);
        }
    }
    addDoor(points) {
        const shape = new THREE.Shape();
        const coords = points.split(" ").map(p => {
            const [x, z] = p.split(",").map(Number);
            return [x, z];
        });
        shape.moveTo(coords[0][0], coords[0][1]);
        for (let i = 1; i < coords.length; i++) {
            shape.lineTo(coords[i][0], coords[i][1]);
        }
        const doorGeometry = new THREE.ExtrudeGeometry(shape, { depth: 7, bevelEnabled: false });
        doorGeometry.translate(0, 0, 0.5); // raise the door vertically
        const doorMesh = new THREE.Mesh(doorGeometry);
        doorMesh.rotation.x = -Math.PI / 2;



        try {
            // Use the wall mesh, not the group!
            const originalPosition = this.wallMesh.position.clone();
            const originalRotation = this.wallMesh.rotation.clone();
            const wallCSG = CSG.fromMesh(this.wallMesh);
            const doorCSG = CSG.fromMesh(doorMesh);
            const subtractedWallCSG = wallCSG.subtract(doorCSG);

            const newWall = CSG.toMesh(
                subtractedWallCSG,
                this.wallMesh.matrix,
                this.wallMesh.material
            );

            newWall.position.copy(originalPosition);
            newWall.rotation.copy(originalRotation);
            newWall.castShadow = true;
            newWall.receiveShadow = true;

            this.group.remove(this.wallMesh);
            this.wallMesh = newWall;
            this.group.add(newWall);

            const doorMaterial = new THREE.MeshStandardMaterial({
                color: 0x8B4513,
                transparent: true,
                opacity: 0.1
            });
            const doorPane = new THREE.Mesh(doorGeometry, doorMaterial);
            doorPane.position.copy(doorMesh.position);
            doorPane.rotation.x = -Math.PI / 2;
            this.group.add(doorPane);


        } catch (error) {
            console.error('Error creating door:', error);
        }
    }
}

class FloorRoof {
    constructor(name, scene, fullgroup, points, thickness, roof = false) {
        this.name = name;
        this.scene = scene;
        this.fullgroup = fullgroup;
        this.points = points;
        this.thickness = thickness;
        this.roof = roof;
        this.group = new THREE.Group();
        fullgroup.add(this.group);
    }
    createFloor() {
        console.log("Creating floor:", this.name);
        // Material for floor

        const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });

        // points is a list of edges of a polygon of the from  "-30.62,17.02 22.42,17.02 21.70,16.29 -29.89,16.29"
        const shape = new THREE.Shape();
        const coords = this.points.split(" ").map(p => {
            const [x, z] = p.split(",").map(Number); // Treat second value as Z
            return [x, z];
        });
        shape.moveTo(coords[0][0], coords[0][1]);
        for (let i = 1; i < coords.length; i++) {
            shape.lineTo(coords[i][0], coords[i][1]);
        }
        const geometry = new THREE.ExtrudeGeometry(shape, { depth: this.thickness, bevelEnabled: false });
        const floor = new THREE.Mesh(geometry, floorMaterial);
        floor.castShadow = true;
        floor.receiveShadow = true;
        // Rotate so extrusion goes up (Y axis)
        floor.rotation.x = -Math.PI / 2;
        this.group.add(floor);

        // --- Levitate this.name as text in the middle of the room ---
        // Calculate centroid using the polygon centroid formula
        let area = 0, cx = 0, cz = 0;
        for (let i = 0, len = coords.length, j = len - 1; i < len; j = i++) {
            const [x0, z0] = coords[j];
            const [x1, z1] = coords[i];
            const f = x0 * z1 - x1 * z0;
            area += f;
            cx += (x0 + x1) * f;
            cz += (z0 + z1) * f;
        }
        area *= 0.5;
        cx /= (6 * area);
        cz /= (6 * area);
        const displayName = this.name.replace(/^Space\s*/i, '').trim();

        // Create text sprite
        const baseSize = 256;
        const chars = Math.max(displayName.length, 8); // minimum width for short names
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
        ctx.strokeText(displayName, size / 2, size / 2);
        ctx.fillText(displayName, size / 2, size / 2);

        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(material);
        const aspect = size / baseSize;
        sprite.scale.set(2 * aspect, 2, 2); // Width scales with aspect, height stays the same

        // Position the sprite at the centroid and slightly above the floor
        sprite.position.set(cx, this.thickness + 5, -cz);

        this.group.add(sprite);

        if (this.roof) {
            const roofMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
            const roof = new THREE.Mesh(geometry, roofMaterial);
            roof.position.y = -this.thickness + 10; // Position the roof above the floor
            roof.castShadow = true;
            roof.receiveShadow = true;
            roof.rotation.x = -Math.PI / 2;
            this.group.add(roof);
        }
    }
}

export { Wall, FloorRoof };