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