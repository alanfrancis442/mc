import './style.css'
import Canvas from './scripts/Canvas'
import Stats from 'three/examples/jsm/libs/stats.module.js';

const canvas = new Canvas();
const stats = new Stats();
document.body.appendChild(stats.dom);
canvas.addOrbitControls();
canvas.addGridHelper();
function render() {
  canvas.render();
  stats.update();
  requestAnimationFrame(render);
}

render();