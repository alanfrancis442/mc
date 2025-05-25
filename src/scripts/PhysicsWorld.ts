import * as THREE from 'three';
import World from './World';
import { blocks } from './Blocks';
import type Player from "./player";

const collisionGeometry = new THREE.BoxGeometry(1.2,1.2,1.2);
const collisionMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffff00,
    transparent:true,
    opacity:0.05,
});

export default class PhysicsWorld {
    helpers:THREE.Group;
    
    constructor(scene:THREE.Scene) {
        this.helpers = new THREE.Group();
        scene.add(this.helpers);
    } 

    addCollisionHelper(position:Position) {
        const collisionHelper = new THREE.Mesh(collisionGeometry, collisionMaterial);
        collisionHelper.position.copy(position);
        this.helpers.add(collisionHelper);

        setTimeout(() => {
            this.helpers.remove(collisionHelper);
            // Dispose of geometry and material to prevent memory leaks
            collisionHelper.geometry.dispose();
            if (collisionHelper.material instanceof THREE.Material) {
                collisionHelper.material.dispose();
            }
        }, 1500);
    }  

    // Convert world coordinates to grid coordinates
    worldToGrid(worldPos: { x: number, y: number, z: number }, world: World) {
        return {
            x: Math.floor(worldPos.x + world.size.width / 2),
            y: Math.floor(worldPos.y + world.size.height / 2),
            z: Math.floor(worldPos.z + world.size.width / 2)
        };
    }

    // Convert grid coordinates to world coordinates
    gridToWorld(gridPos: { x: number, y: number, z: number }, world: World) {
        return {
            x: gridPos.x - world.size.width / 2,
            y: gridPos.y - world.size.height / 2,
            z: gridPos.z - world.size.width / 2
        };
    }


    boradPhase(player: Player,world: World) {
        const candidates = [];
        
        const playerGridPos = this.worldToGrid(player.position, world);
        
        const extents = {
            x:{
                min: Math.floor(playerGridPos.x - player.radius),
                max: Math.ceil(playerGridPos.x + player.radius)
            },
            y:{
                min: Math.floor(playerGridPos.y - player.height),
                max: Math.ceil(playerGridPos.y)
            },
            z:{
                min: Math.floor(playerGridPos.z - player.radius),
                max: Math.ceil(playerGridPos.z + player.radius)
            }
        }
        
        for (let x = extents.x.min; x <= extents.x.max; x++) {
            for (let y = extents.y.min; y <= extents.y.max; y++) {
                for (let z = extents.z.min; z <= extents.z.max; z++) {
                    const block = world.getBlock(x, y, z);
                    if (block && block.id !== blocks.null_block.id) {
                        const position = this.gridToWorld({x,y,z},world);
                        candidates.push(block);
                        this.addCollisionHelper(position);
                    }
                }
            }
        }

        console.log(candidates.length);

        return candidates;
    }

    narrowPhase(candidates: Position[],player: Player,world: World) {
        for(const candidate of candidates) {
           const position = player.position;
           const closestPoint = {
            x: Math.max(candidate.x -0.5, Math.min(position.x, candidate.x + 0.5)),
            y: Math.max(candidate.y -0.5, Math.min(position.y- (
                player.height/2
            ),candidate.y + 0.5)),
            z: Math.max(candidate.z -0.5, Math.min(position.z, candidate.z + 0.5)),
           } 
           
           //ditermining the point is inside the pleyers bounding box
           
        } 
    }

    detectCollisions(player: Player,world: World) {
        const candidates = this.boradPhase(player,world);
        
    }

    update(dt: number,player: Player,world: World) {
        this.detectCollisions(player,world);
    }

}