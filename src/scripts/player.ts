import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';

export default class Player {
    controls: PointerLockControls;
    camera: THREE.PerspectiveCamera;
    mesh: THREE.Mesh;
    inputs = new THREE.Vector3();
    velocity = new THREE.Vector3();
    position = new THREE.Vector3();
    playerBounceHelper!: THREE.Mesh;

    //player properties
    speed = 5.0;
    height = 2.0;
    radius = 1.5;
        

    constructor(scene: THREE.Scene) {
        this.position.set(0, -10, 0);
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.controls = new PointerLockControls(this.camera, document.body);
        this.camera.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(this.camera);

        const geometry = new THREE.BoxGeometry(this.radius, this.height, this.radius);
        const material = new THREE.MeshBasicMaterial( { color:0x00ff00,wireframe: false } );
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.camera.position);
        scene.add(this.mesh);

        document.addEventListener('keydown', this.handleKeyboardInput.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));

        this.playerBounceHelper = new THREE.Mesh(
            new THREE.CapsuleGeometry(this.radius, this.height, 16),
            new THREE.MeshBasicMaterial( { color: 0xff0000,wireframe: true } )
        )
        this.playerBounceHelper.position.copy(this.camera.position);
        scene.add(this.playerBounceHelper);

        const axisHelper = new THREE.AxesHelper(5);
        this.playerBounceHelper.add(axisHelper);
    }

    handleKeyUp(event: KeyboardEvent) {
        if(event.key === 'w' || event.key === 's') {
            this.inputs.z = 0;
        }
        if(event.key === 'a' || event.key === 'd') {
            this.inputs.x = 0;
        }
    }

    getPosition(): THREE.Vector3 {
        return this.camera.position;
    }
    
    updatePlayerPosition(dt:number) {
        if(!this.controls.isLocked) return;
        const adjustedSpeed = this.speed * dt;
        this.velocity.x = this.inputs.x * adjustedSpeed;
        this.velocity.z = this.inputs.z * adjustedSpeed;
        this.controls.moveRight(this.velocity.x);
        this.controls.moveForward(this.velocity.z);
        this.position.copy(this.camera.position);   
        this.mesh.position.copy(this.position);
        this.playerBounceHelper.position.copy(this.position);
    }   

    handleKeyboardInput(event: KeyboardEvent) {
        if(!this.controls.isLocked) {
            this.controls.lock();
            console.log('mouse locked');
            return;
        }
        console.log(event.key);
        switch(event.key) {
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

}
