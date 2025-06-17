import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/Addons.js';
import { SeedNoise } from './SeedNoise';
import { blocks, resources } from './Blocks';
import type { WorldDataStore } from './WorldDataStore';

const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial();

export default class WorldChunk extends THREE.Group {
    size: Sizes;
    data: BlockData = [];
    worldParams: WorldParams;
    loaded: boolean = false;
    dataStore: WorldDataStore;
    // threshold: number = 0.5;
    constructor(size: Sizes = { width: 32, height: 32 }, worldParams: WorldParams, dataStore: WorldDataStore) {
        super();
        this.size = size;
        this.worldParams = worldParams;
        this.dataStore = dataStore;
    }

    generate() {
        const seedNoise = new SeedNoise(this.worldParams.seed);
        this.initTerrain();
        this.generateResources(seedNoise);
        this.generateTerrain(seedNoise);
        this.loadPlayerChanges();
        this.generateMeshes();
        this.loaded = true;
    }

    initTerrain() {
        this.data = [];
        for (let x = 0; x < this.size.width; x++) {
            const layer = [];
            for (let y = 0; y < this.size.height; y++) {
                const row = [];
                for (let z = 0; z < this.size.width; z++) {
                    row.push({
                        id: blocks.null_block.id,
                        instanceId: null
                    });
                }
                layer.push(row);
            }
            this.data.push(layer);
        }
    }

    generateTerrain(seedNoise: SeedNoise) {
        const noise = new SimplexNoise(seedNoise);

        // Loop through the x and z coordinates (top-down view)
        for (let x = 0; x < this.size.width; x++) {
            for (let z = 0; z < this.size.width; z++) {
                // Generate height using noise
                const value = noise.noise((this.position.x + x) / this.worldParams.scale, (this.position.z + z) / this.worldParams.scale);
                const scaledNoiseValue = this.worldParams.offset + value * this.worldParams.magnitude;
                let height = Math.floor(scaledNoiseValue * this.size.height);

                // Clamp the height
                height = Math.max(0, Math.min(height, this.size.height - 1));

                // Set blocks from ground up to the calculated height
                for (let y = 0; y <= this.size.height; y++) {
                    if (y === height) {
                        this.setBlockId(x, y, z, blocks.grass.id);
                    }
                    else if (y < height && this.getBlock(x, y, z)?.id === blocks.null_block.id) {
                        this.setBlockId(x, y, z, blocks.dirt.id);
                    }
                    else if (y > height) {
                        this.setBlockId(x, y, z, blocks.null_block.id);
                    }
                }
            }
        }
    }

    generateResources(seedNoise: SeedNoise) {
        const noise = new SimplexNoise(seedNoise);
        resources.forEach((resource) => {
            for (let x = 0; x < this.size.width; x++) {
                for (let y = 0; y < this.size.height; y++) {
                    for (let z = 0; z < this.size.width; z++) {
                        const value = noise.noise3d((this.position.x + x) / resource.xScale, (this.position.y + y) / resource.yScale, (this.position.z + z) / resource.zScale);
                        if (value > resource.threshold) {
                            this.setBlockId(x, y, z, resource.id);
                        }
                    }
                }
            }
        });
    }

    generateMeshes() {
        this.clear();
        const maxCount = this.size.width * this.size.height * this.size.width;
        let meshes: { [key: number]: THREE.InstancedMesh } = {};
        Object.values(blocks).filter((block) => block.id !== blocks.null_block.id).forEach((block) => {
            const blockMesh = new THREE.InstancedMesh(geometry, block.material || material, maxCount);
            blockMesh.count = 0;
            blockMesh.name = block.name;
            blockMesh.userData.blockId = block.id;
            // console.log(`Generating mesh for block: ${block.name} with id: ${block.id}`);
            blockMesh.castShadow = true;
            blockMesh.receiveShadow = true;
            meshes[block.id] = blockMesh;
        });

        const matrix = new THREE.Matrix4();
        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++) {
                for (let z = 0; z < this.size.width; z++) {
                    const block = this.getBlock(x, y, z);
                    if (!block) {
                        continue;
                    }
                    const blockid = block.id;
                    if (blockid === blocks.null_block.id) {
                        continue;
                    } const mesh = meshes[blockid];
                    const instanceId = mesh.count;

                    if (blockid !== blocks.null_block.id && this.isBlockViewable(x, y, z)) {
                        const worldPos = this.gridToWorld({ x, y, z });
                        matrix.setPosition(worldPos.x, worldPos.y, worldPos.z);
                        mesh.setMatrixAt(instanceId, matrix);
                        this.setBlockInstanceId(x, y, z, instanceId);
                        mesh.count++;
                    }
                }
            }
        }
        this.add(...Object.values(meshes));
    }

    loadPlayerChanges() {
        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++) {
                for (let z = 0; z < this.size.width; z++) {
                    if (this.dataStore.containsKey(this.position.x, this.position.z, x, y, z)) {
                        const blockId = this.dataStore.getData(this.position.x, this.position.z, x, y, z);
                        this.setBlockId(x, y, z, blockId);
                    }
                }
            }
        }
    }

    //helper functions

    // Convert local grid coordinates to world coordinates
    gridToWorld(gridPos: { x: number, y: number, z: number }) {
        return {
            x: gridPos.x - this.size.width / 2,
            y: gridPos.y - this.size.height / 2,
            z: gridPos.z - this.size.width / 2
        };
    }

    // Convert world coordinates to local grid coordinates
    worldToGrid(worldPos: { x: number, y: number, z: number }) {
        return {
            x: Math.floor(worldPos.x + this.size.width / 2),
            y: Math.floor(worldPos.y + this.size.height / 2),
            z: Math.floor(worldPos.z + this.size.width / 2)
        };
    }

    deleteBlockInstance(x: number, y: number, z: number) {
        const block = this.getBlock(x, y, z);
        // console.log("block to delete", block);
        // console.log("block to delete", this.children);
        if (block && block.instanceId) {
            const instanceId = block.instanceId;
            if (instanceId !== null) {
                const mesh = this.children.find((child) => {
                    return child instanceof THREE.InstancedMesh && child.userData.blockId === block.id;
                }) as THREE.InstancedMesh | undefined;
                if (!mesh) {
                    console.error(`No mesh found for block id ${block.id} at (${x}, ${y}, ${z})`);
                    return;
                }
                // console.log("mesh", mesh);
                if (mesh instanceof THREE.InstancedMesh) {
                    //getting the last matrix and swapping the instance 
                    const lastMatrix = new THREE.Matrix4();
                    mesh.getMatrixAt(mesh.count - 1, lastMatrix);

                    const latestWorldPosition = new THREE.Vector3();
                    latestWorldPosition.setFromMatrixPosition(lastMatrix);
                    const latestGridPosition = this.worldToGrid(latestWorldPosition);
                    this.setBlockInstanceId(latestGridPosition.x, latestGridPosition.y, latestGridPosition.z, block.instanceId);
                    //swapping
                    mesh.setMatrixAt(instanceId, lastMatrix);
                    mesh.count--;
                    mesh.instanceMatrix.needsUpdate = true;
                    mesh.computeBoundingSphere();
                    this.setBlockInstanceId(x, y, z, null);
                    // this.setBlockId(x, y, z, blocks.null_block.id);
                    console.log(`Deleted block at (${x}, ${y}, ${z}) with instanceId ${instanceId}`);
                }
            }
        }
    }
    addBlockInstance(position: Position) {
        // console.log("Adding block at position", position);
        const { x, y, z } = position;
        const block = this.getBlock(x, y, z);

        // Check if block exists, is not a null block, doesn't already have an instance, and should be viewable
        if (block && block.id !== blocks.null_block.id && block.instanceId === null && this.isBlockViewable(x, y, z)) {
            const mesh = this.children.find((child) => {
                return child instanceof THREE.InstancedMesh && child.userData.blockId === block.id;
            }) as THREE.InstancedMesh | undefined;

            if (!mesh) {
                console.error(`No mesh found for block id ${block.id} at (${x}, ${y}, ${z})`);
                return;
            }

            // Use the current mesh count as the new instance ID
            const instanceId = mesh.count;
            this.setBlockInstanceId(x, y, z, instanceId);

            const matrix = new THREE.Matrix4();
            const worldPos = this.gridToWorld({ x, y, z });
            matrix.setPosition(worldPos.x, worldPos.y, worldPos.z);
            mesh.setMatrixAt(instanceId, matrix);
            mesh.count++;
            mesh.instanceMatrix.needsUpdate = true;
            mesh.computeBoundingSphere();

            // console.log(`Added block instance at (${x}, ${y}, ${z}) with instanceId ${instanceId}`);
        } else {
            console.log(`Cannot add block instance at (${x}, ${y}, ${z}): block=${!!block}, id=${block?.id}, instanceId=${block?.instanceId}, viewable=${block ? this.isBlockViewable(x, y, z) : false}`);
        }
    }

    addBlock(position: Position, blockId: number) {
        const { x, y, z } = position;
        const block = this.getBlock(x, y, z);
        if (block && block.id === blocks.null_block.id) {
            this.setBlockId(x, y, z, blockId);
            this.addBlockInstance(position);
            this.dataStore.setData(this.position.x, this.position.z, x, y, z, blockId);
        }
    }

    removeBlock(position: Position) {
        const { x, y, z } = position;
        const block = this.getBlock(x, y, z);
        // console.log("block at position", block);
        if (block && block.id !== blocks.null_block.id) {
            this.deleteBlockInstance(x, y, z);
            this.setBlockId(x, y, z, blocks.null_block.id);
            // console.log(`Removed block at (${x}, ${y}, ${z})`);
            this.dataStore.setData(this.position.x, this.position.z, x, y, z, blocks.null_block.id);
        }
        else {
            console.log(`No block found at (${x}, ${y}, ${z}) to remove.`);
        }
    }

    // Get a block at the specified coordinates
    getBlock(x: number, y: number, z: number) {
        if (!this.isInBounds(x, y, z)) {
            return null;
        }
        return this.data[x][y][z];
    }

    // Get the block id at the specified coordinates
    setBlockId(x: number, y: number, z: number, id: number) {
        if (this.isInBounds(x, y, z)) {
            this.data[x][y][z].id = id;
        }
    }

    // Get the block instance id at the specified coordinates
    setBlockInstanceId(x: number, y: number, z: number, id: number | null) {
        if (this.isInBounds(x, y, z)) {
            this.data[x][y][z].instanceId = id;
        }
    }
    // Check if the coordinates are within the bounds
    isInBounds(x: number, y: number, z: number) {
        const inBounds = (
            x >= 0 && x < this.size.width &&
            y >= 0 && y < this.size.height &&
            z >= 0 && z < this.size.width
        );

        // if (!inBounds) {
        //     console.log(`Coordinates out of bounds: (${x}, ${y}, ${z}), bounds: (0-${this.size.width - 1}, 0-${this.size.height - 1}, 0-${this.size.width - 1})`);
        // }

        return inBounds;
    }

    isBlockViewable(x: number, y: number, z: number) {
        // First check if the current block is within bounds
        if (!this.isInBounds(x, y, z)) {
            return false;
        }

        // Create a silent boundary checker that doesn't log errors
        const silentCheck = (checkX: number, checkY: number, checkZ: number) => {
            // Check if coordinates are within bounds without logging errors
            const withinBounds = (
                checkX >= 0 && checkX < this.size.width &&
                checkY >= 0 && checkY < this.size.height &&
                checkZ >= 0 && checkZ < this.size.width
            );

            // If out of bounds, treat as empty space (viewable)
            if (!withinBounds) {
                return blocks.null_block.id;
            }

            // If in bounds, return the actual block id
            return this.data[checkX][checkY][checkZ].id;
        };

        const topBlock = silentCheck(x, y + 1, z)
        const bottomBlock = silentCheck(x, y - 1, z)
        const leftBlock = silentCheck(x - 1, y, z)
        const rightBlock = silentCheck(x + 1, y, z)
        const frontBlock = silentCheck(x, y, z + 1)
        const backBlock = silentCheck(x, y, z - 1)

        if (
            topBlock === blocks.null_block.id ||
            bottomBlock === blocks.null_block.id ||
            leftBlock === blocks.null_block.id ||
            rightBlock === blocks.null_block.id ||
            frontBlock === blocks.null_block.id ||
            backBlock === blocks.null_block.id
        ) {
            return true;
        }
        return false;
    }

    disposeInstance() {
        if (this.children.length === 0) return;
        // console.log(this);
        this.traverse((child) => {
            if (child instanceof THREE.InstancedMesh) {
                if (child.dispose) child.dispose();
                this.remove(child);
            }
            this.clear();
        });
    }
}


