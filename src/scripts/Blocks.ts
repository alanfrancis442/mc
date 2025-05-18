import { resourceProperties, scales } from "./constants";
import * as THREE from "three";
const loadTexture = (textureName: string) => {
    const texture = new THREE.TextureLoader().load(`/texture/blocks/${textureName}`);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestMipmapNearestFilter;
    return texture;
}

const createMaterial = (texturePathOrFaces: string | FaceTextures, color = 0xffffff) => {
    if (typeof texturePathOrFaces === "string") {
        const texture = loadTexture(texturePathOrFaces);
        return new THREE.MeshStandardMaterial({
            map: texture,
            color: color,
        });
    } else {
        // Face order: right, left, top, bottom, front, back
        const faces = ["right", "left", "top", "bottom", "front", "back"] as const;
        return faces.map((face) => {
            const textureName = texturePathOrFaces[face] || "dirt.png"; // fallback texture
            const texture = loadTexture(textureName);
            return new THREE.MeshStandardMaterial({
                map: texture,
                color: color,
            });
        })
    }
}

export const blocks = {
    null_block: {
        id: 0,
        color: 0x000000,
        name: "Null Block",
        material: null
    },
    dirt: {
        id: 1,
        color: 0x8B4513,
        name: "Dirt",
        material: createMaterial("dirt.png"),
    },
    stone: {
        id: 2,
        color: 0x808080,
        name: "Stone",
        material: createMaterial("stone.png"),
    },
    grass: {
        id: 3,
        color: 0x12631a,
        name: "Grass",
        material: createMaterial({
            top: "grass.png",
            bottom: "dirt.png",
            left: "grass_side.png",
            right: "grass_side.png",
            front: "grass_side.png",
            back: "grass_side.png",
        }),
    },
    // water: {
    //     id: 4,
    //     color: 0x0000FF,
    //     name: "Water",
    //     material: createMaterial("water.png"),
    // },
    // sand: {
    //     id: 5,
    //     color: 0xFFFF00,
    //     name: "Sand",
    //     material: createMaterial("sand.png"),
    // },
    // wood: {
    //     id: 6,
    //     color: 0x8B4513,
    //     name: "Wood",
    //     material: createMaterial("wood.png"),
    // },
    coalOre: {
        id: 7,
        color: 0xFF4500,
        name: "Coal Ore",
        material: createMaterial("coal_ore.png"),
    },
    ironOre: {
        id: 8,
        color: 0xC0C0C0,
        name: "Iron Ore",
        material: createMaterial("iron_ore.png"),
    },

}



export const resources = [blocks.coalOre, blocks.ironOre].map((block) => {
    return {
        ...block,
        ...resourceProperties,
        xScale: scales[Math.floor(Math.random() * scales.length)],
        yScale: scales[Math.floor(Math.random() * scales.length)],
        zScale: scales[Math.floor(Math.random() * scales.length)],
    }
});