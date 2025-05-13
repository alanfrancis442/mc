import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import World from "./World";
export function createGUI(world: World) {
    const gui = new GUI();
    gui.add(world.size, "width", 1, 100).name("Width");
    gui.add(world.size, "height", 1, 100).name("Height");
    gui.onChange(() => {
        world.generateMeshes();
    });
}