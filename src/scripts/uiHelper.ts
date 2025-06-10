import GUI from "three/examples/jsm/libs/lil-gui.module.min.js";
import { resources } from "./Blocks";
import World from "./World";
import Player from "./player";
export function createGUI(world: World) {
    const gui = new GUI();
    const worldFolder = gui.addFolder("World");
    worldFolder.add(world.chunkSize, "width", 1, 100).name("Width");
    worldFolder.add(world.chunkSize, "height", 1, 100).name("Height");
    worldFolder.add(world.worldParams, "seed", 0, 100).name("Seed");
    worldFolder.add(world.worldParams, "offset", 0, 1).name("Offset");
    worldFolder.add(world.worldParams, "scale", 10, 100).name("Scale");
    worldFolder.add(world.worldParams, "magnitude", 0, 1).name("Magnitude");
    worldFolder.add(world,"asyncLoading").name("Async Loading");


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


    const playerFolder = gui.addFolder("Player");
    playerFolder.add({ toggleBounceHelper: true }, "toggleBounceHelper")
        .name("Show Bounce Helper")
        .onChange((value: boolean) => {
            // This will affect all player instances
            Player.prototype.tooglePlayerBounceHelper(value);
        });
    worldFolder.onChange(() => {
        world.generate();
    });
}