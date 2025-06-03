import * as THREE from 'three';
import WorldChunk from './WorldChunk';
import type Player from './player';

export default class World extends THREE.Group {
    worldParams = {
        seed: 0,
        offset: 0,
        scale: 30,
        magnitude: 0.5,
    }

    asyncLoading = false;

    chunkData = {
        x:0,
        z:0
    }

    drawDistance = 2;

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
        if(!chunk || !(chunk as WorldChunk).loaded) return null;
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
    
    getVisibleChunks(player:Player){
        const visibleChunks = [];

        const cords = this.worldToChunkCoordinates(player.position);
        const chunkX = cords.chunkCord.x;
        const chunkZ = cords.chunkCord.z;

        for(let x = chunkX - this.drawDistance;x<=chunkX + this.drawDistance;x++){
            for(let z = chunkZ - this.drawDistance;z<=chunkZ + this.drawDistance;z++){
                // const chunk = this.getChunk(x,z);
                // if(chunk){
                //     visibleChunks.push(chunk);
                // }
                visibleChunks.push({x,z});
            }
        }
        return visibleChunks;
    }

    //filtering the chunks that are not already loaded and determine which chunks to load
    getChunksToLoad(visibleChunks:ChunkPosition[]){
    return visibleChunks.filter(e=>{
            const chunk = this.getChunk(e.x,e.z);
            return !chunk;
        })
    }

    getChunksToRemove(visibleChunks:ChunkPosition[]):WorldChunk[] {
        return this.children.filter(child=>{
            if(child instanceof WorldChunk){
                return !visibleChunks.some(e=>e.x===child.userData.x&&e.z===child.userData.z);
            }
            return false;
        }) as WorldChunk[];
    }

    removeUnwantedChunks(visibleChunks:ChunkPosition[]){
        const chunksToRemove = this.getChunksToRemove(visibleChunks);
        for(const chunk of chunksToRemove){
            if(chunk.disposeInstance) chunk.disposeInstance();
            this.remove(chunk);
        }
    }

    loadChunks(chunksToLoad:ChunkPosition[]){
        chunksToLoad.forEach(chunk=>{
            const chunkInstance = new WorldChunk(this.chunkSize,this.worldParams);
            chunkInstance.position.set(chunk.x*this.chunkSize.width,0,chunk.z*this.chunkSize.width);
            chunkInstance.userData = {
                x:chunk.x,
                z:chunk.z
            }
            if(this.asyncLoading){
                requestIdleCallback(()=>chunkInstance.generate(),{
                    timeout:1000
                });
            }else{
                chunkInstance.generate();
            }
            this.add(chunkInstance);
        });
    }

    update(player:Player){
        const visibleChunks = this.getVisibleChunks(player);
        console.log("visibleChunks",visibleChunks);
        const chunksToLoad = this.getChunksToLoad(visibleChunks);
        console.log("chunksToLoad",chunksToLoad);
        this.removeUnwantedChunks(visibleChunks);
        this.loadChunks(chunksToLoad);
    }
}