import './style.css'
import Canvas from './scripts/Canvas'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { createGUI } from './scripts/uiHelper';
import * as THREE from 'three'
import Player from './scripts/player';
import PhysicsWorld from './scripts/PhysicsWorld';
import World from './scripts/World';
import Controls from './scripts/Controls';
import { preventContextMenu } from './scripts/preventContextMenu';

const canvas = new Canvas();
const physicsWorld = new PhysicsWorld(canvas.scene);
const stats = new Stats();
document.body.appendChild(stats.dom);
// Only add OrbitControls if you plan to alternate between control systems
// canvas.addOrbitControls();
canvas.addLight();

const world = new World();
world.generate();
canvas.addToScene(world);
const controls = new Controls(world);
const player = new Player(canvas.scene, controls);
controls.initPlayer(player);
controls.pointerLockInit(player.camera);

// Prevent right-click context menu which can interfere with game controls
preventContextMenu();

if (import.meta.env.MODE === 'development') {
  createGUI(world);
}

canvas.renderer.shadowMap.enabled = true;
canvas.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

function render() {
  canvas.render(player, physicsWorld, world);
  stats.update();
  requestAnimationFrame(render);
}

render();