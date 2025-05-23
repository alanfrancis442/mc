import './style.css'
import Canvas from './scripts/Canvas'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import World from './scripts/World'
import { createGUI } from './scripts/uiHelper';
import * as THREE from 'three'
import Player from './scripts/player';
const canvas = new Canvas();
const player = new Player(canvas.scene);

const stats = new Stats();
document.body.appendChild(stats.dom);
canvas.addOrbitControls();
// canvas.addGridHelper();
canvas.addLight();

const world = new World();
world.generate();
canvas.addToScene(world);
createGUI(world);
canvas.renderer.shadowMap.enabled = true;
canvas.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
function render() {
  canvas.render(player);
  stats.update();
  requestAnimationFrame(render);
}

render();