import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import type World from './World';

const CENTER_SCREEN_POSITION = new THREE.Vector2();
const selectionHelperGeometry = new THREE.BoxGeometry();
//red color for the selection helper
const selectionHelperMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000, transparent: true, opacity: 0.5 });
export default class Player {
    controls: PointerLockControls;
    camera: THREE.PerspectiveCamera;
    mesh: THREE.Mesh;
    inputs = new THREE.Vector3();
    velocity = new THREE.Vector3();
    playerBounceHelper!: THREE.Mesh;
    playerSelectionHelper!: THREE.Mesh;

    raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 10);
    selectedCoordinate!: THREE.Vector3 | null;

    //player properties
    speed = 5.0;
    height = 2.0;
    radius = 1.5;
    onGround = false
    jumpForce = 5;
    #worldVelocity = new THREE.Vector3();

    constructor(scene: THREE.Scene) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.controls = new PointerLockControls(this.camera, document.body);
        this.camera.position.set(0, 3, 0);
        scene.add(this.camera);

        const geometry = new THREE.BoxGeometry(this.radius, this.height, this.radius);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.camera.position);
        scene.add(this.mesh);

        document.addEventListener('keydown', this.handleKeyboardInput.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));

        this.playerBounceHelper = new THREE.Mesh(
            new THREE.CapsuleGeometry(this.radius, this.height, 16),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
        )
        this.playerBounceHelper.position.copy(this.camera.position);
        scene.add(this.playerBounceHelper);

        const axisHelper = new THREE.AxesHelper(5);
        this.playerBounceHelper.add(axisHelper);
    }

    tooglePlayerBounceHelper(toogle: boolean) {
        this.playerBounceHelper.visible = toogle;
    }

    addPlayerSelectionHelper(scene: World, point: THREE.Vector3) {
        if (!this.playerSelectionHelper) {
            this.playerSelectionHelper = new THREE.Mesh(
                selectionHelperGeometry,
                selectionHelperMaterial
            );
        }
        this.playerSelectionHelper.position.copy(point);
        this.playerSelectionHelper.scale.set(1.2, 1.2, 1.2);
        scene.add(this.playerSelectionHelper);
        console.log('Adding Player Selection Helper at:', point);
    }

    removePlayerSelectionHelper(scene: World) {
        if (this.playerSelectionHelper) {
            scene.remove(this.playerSelectionHelper);
            this.playerSelectionHelper.remove();
            this.playerSelectionHelper = null!;
        }
    }

    handleKeyUp(event: KeyboardEvent) {
        if (event.key === 'w' || event.key === 's') {
            this.inputs.z = 0;
        }
        if (event.key === 'a' || event.key === 'd') {
            this.inputs.x = 0;
        }
    }

    get position(): THREE.Vector3 {
        return this.camera.position;
    }

    get WorldVelocity(): THREE.Vector3 {
        this.#worldVelocity.copy(this.velocity);
        this.#worldVelocity.applyEuler(
            new THREE.Euler(
                0,
                this.camera.rotation.y,
                0
            )
        )
        return this.#worldVelocity;
    }

    applyWorldDeltaVelocity(deltaVelocity: THREE.Vector3) {
        deltaVelocity.applyEuler(
            new THREE.Euler(
                0,
                -this.camera.rotation.y,
                0
            )
        )
        this.velocity.add(deltaVelocity);
    }

    updatePlayerPosition(dt: number) {
        if (!this.controls.isLocked) return;
        const adjustedSpeed = this.speed * dt;
        this.velocity.x = this.inputs.x * adjustedSpeed;
        this.velocity.z = this.inputs.z * adjustedSpeed;
        this.controls.moveRight(this.velocity.x);
        this.controls.moveForward(this.velocity.z);
        this.position.y += this.velocity.y * dt
        this.mesh.position.copy(this.position);
        this.playerBounceHelper.position.copy(this.position);
    }

    handleKeyboardInput(event: KeyboardEvent) {
        if (event.repeat) return;
        if (!this.controls.isLocked) {
            this.controls.lock();
            console.log('mouse locked');
            return;
        }
        console.log(event.key);
        switch (event.key) {
            case 'w':
                this.inputs.z = 1;
                break;
            case 's':
                this.inputs.z = -1;
                break;
            case 'a':
                this.inputs.x = -1;
                break;
            case 'd':
                this.inputs.x = 1;
                break;
            case ' '://for jumping 
                if (this.onGround) {
                    console.log('jumping');
                    this.velocity.y += this.jumpForce;
                    this.onGround = false;
                }
                break;
        }
    }

    updateRaycaster(world: World) {
        this.raycaster.setFromCamera(CENTER_SCREEN_POSITION, this.camera);
        const intersects = this.raycaster.intersectObjects(world.children, true);

        if (intersects.length > 0) {
            const intersection = intersects[0];
            if (intersection.object instanceof THREE.InstancedMesh && intersection.instanceId !== undefined) {
                const blockMatrix = new THREE.Matrix4()
                intersection.object.getMatrixAt(intersection.instanceId, blockMatrix);
                this.selectedCoordinate = new THREE.Vector3().applyMatrix4(blockMatrix);
                this.addPlayerSelectionHelper(world, this.selectedCoordinate);
                console.log('Selected Coordinate:', this.selectedCoordinate);
            }
        }

    }

    update(world: World) {
        this.updateRaycaster(world);
    }

}
