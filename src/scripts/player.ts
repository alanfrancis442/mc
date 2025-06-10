import * as THREE from 'three';
import type World from './World';
import Controls from './Controls';

export default class Player {
    camera: THREE.PerspectiveCamera;
    mesh: THREE.Mesh;
    velocity = new THREE.Vector3();
    playerBounceHelper!: THREE.Mesh;
    controls: Controls;

    //player properties
    speed = 5.0;
    height = 2.0;
    radius = 1.5;
    onGround = false;
    jumpForce = 5;
    #worldVelocity = new THREE.Vector3();

    constructor(scene: THREE.Scene) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 3, 0);
        scene.add(this.camera);

        this.controls = new Controls(this.camera);

        const geometry = new THREE.BoxGeometry(this.radius, this.height, this.radius);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.camera.position);
        scene.add(this.mesh);

        this.playerBounceHelper = new THREE.Mesh(
            new THREE.CapsuleGeometry(this.radius, this.height, 16),
            new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true })
        );
        this.playerBounceHelper.position.copy(this.camera.position);
        scene.add(this.playerBounceHelper);

        const axisHelper = new THREE.AxesHelper(5);
        this.playerBounceHelper.add(axisHelper);

        document.addEventListener('keydown', this.handleJump.bind(this));
    }

    tooglePlayerBounceHelper(toogle: boolean) {
        this.playerBounceHelper.visible = toogle;
    }

    get position(): THREE.Vector3 {
        return this.camera.position;
    }

    get WorldVelocity(): THREE.Vector3 {
        this.#worldVelocity.copy(this.velocity);
        this.#worldVelocity.applyEuler(
            new THREE.Euler(0, this.camera.rotation.y, 0)
        );
        return this.#worldVelocity;
    }

    applyWorldDeltaVelocity(deltaVelocity: THREE.Vector3) {
        deltaVelocity.applyEuler(
            new THREE.Euler(0, -this.camera.rotation.y, 0)
        );
        this.velocity.add(deltaVelocity);
    }

    handleJump(event: KeyboardEvent) {
        if (event.key === ' ' && this.onGround) {
            console.log('jumping');
            this.velocity.y += this.jumpForce;
            this.onGround = false;
        }
    }

    updatePlayerPosition(dt: number) {
        if (!this.controls.isLocked) return;

        const adjustedSpeed = this.speed * dt;
        this.velocity.x = this.controls.inputs.x * adjustedSpeed;
        this.velocity.z = this.controls.inputs.z * adjustedSpeed;

        this.controls.moveRight(this.velocity.x);
        this.controls.moveForward(this.velocity.z);
        this.position.y += this.velocity.y * dt;

        this.mesh.position.copy(this.position);
        this.playerBounceHelper.position.copy(this.position);
    }

    update(world: World) {
        this.controls.update(world);
    }
}
