import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import World from "./World";
export function createGUI(world: World) {
    const gui = new GUI();
    gui.add(world.size, "width", 1, 100).name("Width");
    gui.add(world.size, "height", 1, 100).name("Height");
    gui.addColor(world, "color").name("Color")


    gui.add(world, "threshold", 0, 1).name("Threshold");
    gui.add(world.worldParams, "seed", 0, 100).name("Seed");
    gui.add(world.worldParams, "offset", 0, 1).name("Offset");
    gui.add(world.worldParams, "scale", 10, 100).name("Scale");
    gui.add(world.worldParams, "magnitude", 0, 1).name("Magnitude");
    gui.onChange(() => {
        world.generateTerrain();
        world.generateMeshes();
    });
}