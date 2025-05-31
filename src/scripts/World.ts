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

    chunkSize:Sizes={width:32,height:32};
    constructor(seend:number=0) {   
        super();
    }

    worldToChunkCoordinates(position:Position){
        const chunkCord =  {
            x:Math.floor(position.x/this.chunkSize.width),
            z:Math.floor(position.z/this.chunkSize.width)
        }
        const blockCord = {
            x:position.x - this.chunkSize.width*chunkCord.x,
            y:position.y,
            z:position.z - this.chunkSize.width*chunkCord.z
        }
        return {
            chunkCord,
            blockCord
        }
    }

    getChunk(x:number,z:number){
        return this.children.find((child) => {
            if(child instanceof WorldChunk){
                if (child.userData.x === x && child.userData.z === z) {
                    return true;
                }
            }
            return false;
        }); 
    }

    generate() {
        this.disposeChunk();
        for(let x = -1 ;x<=1;x++){
            for(let z = -1 ;z<=1;z++){
                const chunk = new WorldChunk(this.chunkSize,this.worldParams);
                chunk.position.set(x*this.chunkSize.width,0,z*this.chunkSize.width);
                chunk.userData = {
                    x,
                    z
                }
                chunk.generate();
                this.add(chunk);
            }
        }
    }
    getBlock(x:number,y:number,z:number){
        const chunkcoord = this.worldToChunkCoordinates({x,y,z});
        const chunk = this.getChunk(chunkcoord.chunkCord.x,chunkcoord.chunkCord.z);
        if(!chunk) return null;
        return (chunk as WorldChunk).getBlock(chunkcoord.blockCord.x,chunkcoord.blockCord.y,chunkcoord.blockCord.z);
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