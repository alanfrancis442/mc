import * as THREE from 'three';
import WorldChunk from './WorldChunk';

export default class World extends THREE.Group {
    worldParams = {
        seed: 0,
        offset: 0,
        scale: 30,
        magnitude: 0.5,
    }

    chunkData = {
        x:0,
        z:0
    }

    chunkSize:Sizes={width:64,height:32};
    constructor(seend:number=0) {
        super();
    }
    generate() {
        this.disposeChunk();
        for(let x = -1 ;x<=1;x++){
            for(let z = -1 ;z<=1;z++){
                const chunk = new WorldChunk(this.chunkSize,this.worldParams);
                chunk.position.set(x*this.chunkSize.width,0,z*this.chunkSize.width);
                this.chunkData.x = x;
                this.chunkData.z = z;
                chunk.generate();
                this.add(chunk);
            }
        }
    }
    getBlock(x:number,y:number,z:number){
        return null   
    }
    disposeChunk() {
       if(this.children.length === 0) return;
        this.traverse((child) => {
            if(child instanceof WorldChunk){
                console.log("inside world chunk",child);
                if(child.disposeInstance) child.disposeInstance();
            }
            this.clear();
            
        });
    }
}