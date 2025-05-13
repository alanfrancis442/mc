import * as THREE from 'three';

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

export default class World extends THREE.Group {
    size: Sizes;
    data: BlockData = [];
    constructor(size: Sizes = { width: 32, height: 32 }) {
        super();
        this.size = size;
    }

    generateTerrain() {
        this.data = [];
        for (let x = 0; x < this.size.width; x++) {
            const layer = [];
            for (let y = 0; y < this.size.height; y++) {
                const row = [];
                for (let z = 0; z < this.size.width; z++) {
                    row.push({
                        id: 1,
                        instanceId: null
                    });
                }
                layer.push(row);
            }
            this.data.push(layer);
        }
    }

    generateMeshes() {
        this.clear();
        const maxCount = this.size.width * this.size.height * this.size.width;
        const mesh = new THREE.InstancedMesh(geometry, material, maxCount);
        mesh.count = 0;
        const matrix = new THREE.Matrix4();
        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++) {
                for (let z = 0; z < this.size.width; z++) {
                    const block = this.getBlock(x, y, z);
                    if (!block) {
                        continue;
                    }
                    const blockid = block.id;
                    const instanceId = mesh.count;
                    if (blockid !== 0) {
                        matrix.setPosition(
                            x - this.size.width / 2,
                            y - this.size.height / 2,
                            z - this.size.width / 2
                        )
                        mesh.setMatrixAt(instanceId, matrix);
                        this.setBlockInstanceId(x, y, z, instanceId);
                        mesh.count++;
                    }
                }
            }
        }
        this.add(mesh);
    }

    //helper functions

    // Get a block at the specified coordinates
    getBlock(x: number, y: number, z: number) {
        if (!this.isInBounces(x, y, z)) {
            return null;
        }
        return this.data[x][y][z];
    }

    // Get the block id at the specified coordinates
    setBlockId(x: number, y: number, z: number, id: number) {
        if (this.isInBounces(x, y, z)) {
            this.data[x][y][z].id = id;
        }
    }

    // Get the block instance id at the specified coordinates
    setBlockInstanceId(x: number, y: number, z: number, id: number) {
        if (this.isInBounces(x, y, z)) {
            this.data[x][y][z].instanceId = id;
        }
    }
    // Check if the coordinates are within the bounds
    isInBounces(x: number, y: number, z: number) {
        return (
            x >= 0 && x < this.size.width &&
            y >= 0 && y < this.size.height &&
            z >= 0 && z < this.size.width
        )
    }

}

