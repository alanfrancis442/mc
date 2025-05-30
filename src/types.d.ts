type Dimensions = {
    width: number;
    height: number;
    pixelRatio: number;
};

type Sizes = {
    width: number;
    height: number;
};
type BlockData = {
    id: number,
    instanceId: number | null,
}[][][]

type FaceTextures = {
    right?: string;
    left?: string;
    top?: string;
    bottom?: string;
    front?: string;
    back?: string;
};

type WorldParams = {
    seed: number;
    offset: number;
    scale: number;
    magnitude: number;
}
type Position = {
    x: number;
    y: number;
    z: number;
};

type Collision = {
    block: Position;
    contactPoint: Position;
    normal: THREE.Vector3;
    overlap: number;
};