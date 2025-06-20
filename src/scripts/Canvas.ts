import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import type Player from './player';
import type PhysicsWorld from './PhysicsWorld';
import World from './World';
export default class Canvas {
    element: HTMLCanvasElement;
    scene: THREE.Scene;
    camera!: THREE.PerspectiveCamera;
    orbitControls!: OrbitControls;
    renderer!: THREE.WebGLRenderer;
    sizes!: Sizes;
    time: number;
    clock: THREE.Clock;
    dimensions!: Dimensions;
    constructor() {
        this.element = document.createElement('canvas');
        this.element.classList.add('webgl');
        document.body.appendChild(this.element);
        this.scene = new THREE.Scene();
        this.time = 0;
        this.clock = new THREE.Clock();
        this.createCamera();
        this.createRender();
        this.setSizes();
        this.addOrbitControls();
        window.addEventListener('resize', () => {
            this.onResize();
        });
        this.addGridHelper();
        this.addFog();
    }

    onResize() {
        this.dimensions = {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: Math.min(2, window.devicePixelRatio)
        };
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.setSizes();

        this.renderer.setPixelRatio(this.dimensions.pixelRatio);
        this.renderer.setSize(this.dimensions.width, this.dimensions.height);
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 10;
        this.camera.position.y = 5;
        this.scene.add(this.camera);
    }

    setSizes() {
        let fov = this.camera.fov * (Math.PI / 180);
        let height = this.camera.position.z * Math.tan(fov / 2) * 2;
        let width = height * this.camera.aspect;

        this.sizes = {
            width: width,
            height: height
        };
    }

    createRender() {
        this.dimensions = {
            width: window.innerWidth,
            height: window.innerHeight,
            pixelRatio: Math.min(2, window.devicePixelRatio)
        };
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.element,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(this.dimensions.width, this.dimensions.height);
        this.renderer.render(this.scene, this.camera);
        this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
    }

    getTime() {
        return this.time;
    }

    addSimpleMesh() {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
        const cube = new THREE.Mesh(geometry, material);
        this.scene.add(cube);
    }

    addLight() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(3, 3, -3);
        directionalLight.castShadow = true;
        // directionalLight.intensity = 1.5;
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
    }

    addFog() {
        const fog = new THREE.Fog(0xffffff, 30, 100);
        this.scene.fog = fog;
    }
    addGridHelper() {
        const gridHelper = new THREE.GridHelper(10, 10);
        this.scene.add(gridHelper);
    }
    createDebugMesh() {
        const mesh = new THREE.Mesh(
            new THREE.PlaneGeometry(5, 5),
            new THREE.MeshStandardMaterial()
        )

        this.scene.add(mesh)
    }

    addDebugHelpers() {
        // Add axes helper
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);

        // Add camera helper
        const helper = new THREE.CameraHelper(this.camera);
        this.scene.add(helper);
    }

    addOrbitControls() {
        // Create OrbitControls only if they're needed
        // Using the renderer's domElement is fine for OrbitControls
        this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
        this.orbitControls.enableDamping = true;
        this.orbitControls.dampingFactor = 0.25;
        this.orbitControls.enableZoom = true;
        this.orbitControls.enablePan = true;

        // Disable OrbitControls by default when first loaded
        // They will be enabled only when pointer lock is not active
        this.orbitControls.enabled = false;
    }

    addToScene(object: THREE.Object3D) {
        this.scene.add(object);
    }

    render(player?: Player, physicsWorld?: PhysicsWorld, world?: World) {
        const dt = this.clock.getDelta();
        this.time = this.clock.getElapsedTime();

        // Update controls based on player lock state
        if (player?.controls.isLocked) {
            // Player controls are active - disable OrbitControls completely
            if (this.orbitControls) {
                this.orbitControls.enabled = false;
            }

            // Update player physics and position
            player.updatePlayerPosition(dt);
            if (player && physicsWorld && world) {
                physicsWorld.update(dt, player, world);
                player.update(world);
                world.update(player);
            }

            // Render the scene using player camera
            this.renderer.render(this.scene, player.camera);
        } else {
            // When pointer is not locked, use OrbitControls if they exist
            if (this.orbitControls) {
                this.orbitControls.enabled = true;
                this.orbitControls.update();
            }

            // Render the scene using the default camera
            this.renderer.render(this.scene, this.camera);
        }
    }
}
