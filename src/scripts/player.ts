import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/Addons.js';

export default class Player {
    controls: PointerLockControls;
    camera: THREE.PerspectiveCamera;
    speed = 5.0;    
    inputs = new THREE.Vector3();
    velocity = new THREE.Vector3();

    constructor(scene: THREE.Scene) {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.controls = new PointerLockControls(this.camera, document.body);
        this.camera.position.set(0, -10, 0);
        scene.add(this.camera);
        
        document.addEventListener('keydown', this.handleKeyboardInput.bind(this));
        document.addEventListener('keyup', this.handleKeyUp.bind(this));
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
