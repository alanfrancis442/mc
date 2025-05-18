import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import World from "./World";
import { resources } from "./Blocks";
export function createGUI(world: World) {
    const gui = new GUI();
    gui.add(world.size, "width", 1, 100).name("Width");
    gui.add(world.size, "height", 1, 100).name("Height");
    gui.addColor(world, "color").name("Color")


    gui.add(world.worldParams, "seed", 0, 100).name("Seed");
    gui.add(world.worldParams, "offset", 0, 1).name("Offset");
    gui.add(world.worldParams, "scale", 10, 100).name("Scale");
    gui.add(world.worldParams, "magnitude", 0, 1).name("Magnitude");


    //resources controls
    // const resourcesFolder = gui.addFolder("Resources");
    // resourcesFolder.add(world.resourceParams, "scale", 10, 100).name("Scale");
    // resourcesFolder.add(world.resourceParams, "threshold", 0, 1).name("Threshold");
    resources.forEach((resource) => {
        const resourceFolder = gui.addFolder(resource.name);
        resourceFolder.add(resource, "xScale", 10, 100).name("X Scale");
        resourceFolder.add(resource, "yScale", 10, 100).name("Y Scale");
        resourceFolder.add(resource, "zScale", 10, 100).name("Z Scale");
        resourceFolder.add(resource, "threshold", 0, 1).name("Threshold");

    });
    gui.onChange(() => {
        world.generate();
    });
}