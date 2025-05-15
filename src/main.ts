import './style.css'
import Canvas from './scripts/Canvas'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import World from './scripts/World'
import { createGUI } from './scripts/uiHelper';

const canvas = new Canvas();
const stats = new Stats();
document.body.appendChild(stats.dom);
canvas.addOrbitControls();
canvas.addGridHelper();
canvas.addLight();

const world = new World();
world.generateTerrain();
world.generateMeshes();
canvas.addToScene(world);
createGUI(world);
function render() {
  canvas.render();
  stats.update();
  requestAnimationFrame(render);
}

render();