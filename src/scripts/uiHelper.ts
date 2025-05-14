import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import World from "./World";
export function createGUI(world: World) {
    const gui = new GUI();
    gui.add(world.size, "width", 1, 100).name("Width");
    gui.add(world.size, "height", 1, 100).name("Height");
    gui.addColor(world, "color").name("Color")
    gui.add(world, "threshold", 0, 1).name("Threshold");
    gui.onChange(() => {
        world.generateTerrain();
        world.generateMeshes();
    });
}