import * as THREE from 'three';
import World from './WorldChunk';
import { blocks } from './Blocks';
import type Player from "./player";

const collisionGeometry = new THREE.BoxGeometry(1.0001, 1.0001, 1.0001);
const collisionMaterial = new THREE.MeshBasicMaterial({
    color: 0xffff00,
    transparent: true,
    opacity: 0.05,
});

const contactGeometry = new THREE.SphereGeometry(0.1);
const contactMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    transparent: true,
    opacity: 1,
});

export default class PhysicsWorld {
    helpers: THREE.Group;
    gravity = 12.5;
    simulation = 200;
    timeStep = 1 / this.simulation;
    accumulator = 0;
    constructor(scene: THREE.Scene) {
        this.helpers = new THREE.Group();
        scene.add(this.helpers);
    }

    addCollisionHelper(position: Position) {
        const collisionHelper = new THREE.Mesh(collisionGeometry, collisionMaterial);
        collisionHelper.position.copy(position);
        this.helpers.add(collisionHelper);

    }

    addContactPointerHelper(position: Position) {
        const contactHelper = new THREE.Mesh(contactGeometry, contactMaterial);
        contactHelper.position.copy(position);
        this.helpers.add(contactHelper);

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


    boradPhase(player: Player, world: World) {
        const candidates = [];

        const playerGridPos = this.worldToGrid(player.position, world);

        const extents = {
            x: {
                min: Math.floor(playerGridPos.x - player.radius),
                max: Math.ceil(playerGridPos.x + player.radius)
            },
            y: {
                min: Math.floor(playerGridPos.y - player.height),
                max: Math.ceil(playerGridPos.y)
            },
            z: {
                min: Math.floor(playerGridPos.z - player.radius),
                max: Math.ceil(playerGridPos.z + player.radius)
            }
        }

        for (let x = extents.x.min; x <= extents.x.max; x++) {
            for (let y = extents.y.min; y <= extents.y.max; y++) {
                for (let z = extents.z.min; z <= extents.z.max; z++) {
                    const block = world.getBlock(x, y, z);
                    if (block && block.id !== blocks.null_block.id) {
                        const position = this.gridToWorld({ x, y, z }, world);
                        candidates.push({
                            x: position.x,
                            y: position.y,
                            z: position.z
                        });
                        this.addCollisionHelper(position);
                    }
                }
            }
        }

        return candidates;
    }

    narrowPhase(candidates: Position[], player: Player) {
        const collisions = [];

        for (const block of candidates) {
            // Get the point on the block that is closest to the center of the player's bounding cylinder
            const closestPoint = {
                x: Math.max(block.x - 0.5, Math.min(player.position.x, block.x + 0.5)),
                y: Math.max(block.y - 0.5, Math.min(player.position.y - (player.height / 2), block.y + 0.5)),
                z: Math.max(block.z - 0.5, Math.min(player.position.z, block.z + 0.5))
            };

            // Get distance along each axis between closest point and the center
            // of the player's bounding cylinder
            const dx = closestPoint.x - player.position.x;
            const dy = closestPoint.y - (player.position.y - (player.height / 2));
            const dz = closestPoint.z - player.position.z;

            if (this.isPointInsideBox(closestPoint, player)) {
                // Compute the overlap between the point and the player's bounding
                // cylinder along the y-axis and in the xz-plane
                const overlapY = (player.height / 2) - Math.abs(dy);
                const overlapXZ = player.radius - Math.sqrt(dx * dx + dz * dz);

                // Compute the normal of the collision (pointing away from the contact point)
                // and the overlap between the point and the player's bounding cylinder
                let normal, overlap;
                if (overlapY < overlapXZ) {
                    normal = new THREE.Vector3(0, -Math.sign(dy), 0);
                    overlap = overlapY;
                    player.onGround = true;
                } else {
                    normal = new THREE.Vector3(-dx, 0, -dz).normalize();
                    overlap = overlapXZ;
                }

                collisions.push({
                    block,
                    contactPoint: closestPoint,
                    normal,
                    overlap
                });

                this.addContactPointerHelper(closestPoint);
            }
        }

        return collisions;
    }

    resolveCollisions(collisions: Collision[], player: Player) {
        collisions.sort((a, b) => {
            return a.overlap < b.overlap ? 1 : -1;
        })

        //isPointInsideBox(
        for (const collision of collisions) {
            if (!this.isPointInsideBox(collision.contactPoint, player)) {
                continue;
            }
            let deltaPosition = collision.normal.clone()
            deltaPosition.multiplyScalar(collision.overlap)
            player.position.add(deltaPosition)

            let magnitude = player.WorldVelocity.dot(collision.normal)
            let velocityAdjustment = collision.normal.clone().multiplyScalar(magnitude)
            player.applyWorldDeltaVelocity(velocityAdjustment.negate())
        }
    }

    detectCollisions(player: Player, world: World) {
        player.onGround = false;
        const candidates = this.boradPhase(player, world);
        const collisions = this.narrowPhase(candidates, player);
        if (collisions.length > 0) {
            this.resolveCollisions(collisions, player);
        }
    }

    isPointInsideBox(point: Position, player: Player) {
        const dx = point.x - player.position.x;
        const dy = point.y - (player.position.y - (player.height / 2));
        const dz = point.z - player.position.z;
        const r_sq = dx * dx + dz * dz;

        // Check if contact point is inside the player's bounding cylinder
        return (Math.abs(dy) < player.height / 2) && (r_sq < player.radius * player.radius);
    }


    update(dt: number, player: Player, world: World) {
        this.accumulator += dt;
        // Remember if player was on ground at any point during the physics steps
        let wasOnGround = player.onGround;
        
        while (this.accumulator >= this.timeStep) {
            this.helpers.clear();
            player.velocity.y -= this.gravity * this.timeStep;
            this.detectCollisions(player, world);
            
            // If player became on ground during this step, remember it
            if (player.onGround) {
                wasOnGround = true;
            }
            
            this.accumulator -= this.timeStep;
        }
        
        // Apply the remembered ground state after all physics steps
        player.onGround = wasOnGround;
    }
}
