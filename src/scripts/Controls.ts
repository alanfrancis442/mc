import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';
import type World from './World';

const CENTER_SCREEN_POSITION = new THREE.Vector2();
const selectionHelperGeometry = new THREE.BoxGeometry();
const selectionHelperMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.5
});

export default class Controls {
    pointerLock: PointerLockControls;
    camera: THREE.PerspectiveCamera;
    inputs = new THREE.Vector3();
    playerSelectionHelper!: THREE.Mesh;
    raycaster: THREE.Raycaster;
    selectedCoordinate!: THREE.Vector3 | null | undefined;

    constructor(camera: THREE.PerspectiveCamera) {
        this.camera = camera;
        this.pointerLock = new PointerLockControls(this.camera, document.body);
        this.raycaster = new THREE.Raycaster(new THREE.Vector3(), new THREE.Vector3(), 0, 10);

        document.addEventListener('keydown', this.handleKeyboardInput.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyUp(event: KeyboardEvent) {
        if (event.key === 'w' || event.key === 's') {
            this.inputs.z = 0;
        }
        if (event.key === 'a' || event.key === 'd') {
            this.inputs.x = 0;
        }
    }

    handleKeyboardInput(event: KeyboardEvent) {
        if (event.repeat) return;
        if (!this.isLocked) {
            this.lock();
            return;
        }

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
        }
    }

    get isLocked(): boolean {
        return this.pointerLock.isLocked;
    }

    lock() {
        this.pointerLock.lock();
    }

    moveRight(distance: number) {
        this.pointerLock.moveRight(distance);
    }

    moveForward(distance: number) {
        this.pointerLock.moveForward(distance);
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
    }

    removePlayerSelectionHelper(scene: World) {
        if (this.playerSelectionHelper) {
            scene.remove(this.playerSelectionHelper);
            this.playerSelectionHelper.remove();
            this.playerSelectionHelper = null!;
        }
    }

    updateRaycaster(world: World) {
        this.raycaster.setFromCamera(CENTER_SCREEN_POSITION, this.camera);
        const intersects = this.raycaster.intersectObjects(world.children, true);

        if (intersects.length > 0) {
            const intersection = intersects[0];
            const chunk = intersection.object.parent;
            if (intersection.object instanceof THREE.InstancedMesh && intersection.instanceId !== undefined) {
                const blockMatrix = new THREE.Matrix4()
                intersection.object.getMatrixAt(intersection.instanceId, blockMatrix);
                this.selectedCoordinate = chunk?.position.clone();
                this.selectedCoordinate?.applyMatrix4(blockMatrix);
                this.addPlayerSelectionHelper(world, this.selectedCoordinate || new THREE.Vector3());
            }
        }
    }

    update(world: World) {
        this.updateRaycaster(world);
    }
}