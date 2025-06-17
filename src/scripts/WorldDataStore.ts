export class WorldDataStore {
    private static instance: WorldDataStore;
    private Data: Map<string, any>;

    constructor() {
        this.Data = new Map();
    }

    public static getInstance(): WorldDataStore {
        if (!WorldDataStore.instance) {
            WorldDataStore.instance = new WorldDataStore();
        }
        return WorldDataStore.instance;
    }

    public getKey(chunkX: number, chunkZ: number, blockX: number, blockY: number, blockZ: number): string {
        return `${chunkX}-${chunkZ}-${blockX}-${blockY}-${blockZ}`;
    }

    public setData(chunkX: number, chunkZ: number, blockX: number, blockY: number, blockZ: number, blockId: number): void {
        const key = this.getKey(chunkX, chunkZ, blockX, blockY, blockZ);
        this.Data.set(key, blockId);
    }

    public containsKey(chunkX: number, chunkZ: number, blockX: number, blockY: number, blockZ: number): boolean {
        const key = this.getKey(chunkX, chunkZ, blockX, blockY, blockZ);
        return this.Data.has(key);
    }

    public getData(chunkX: number, chunkZ: number, blockX: number, blockY: number, blockZ: number): any {
        const key = this.getKey(chunkX, chunkZ, blockX, blockY, blockZ);
        return this.Data.get(key);
    }

    public deleteChunkData(chunkX: number, chunkZ: number): void {
        const chunkKey = `${chunkX},${chunkZ}`;
        this.Data.delete(chunkKey);
    }

    public clearChunkData(): void {
        this.Data.clear();
    }
}
