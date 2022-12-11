import { FrameState } from "../core/FrameState";
import RenderObject from "../core/RenderObject";
import { VertextBuffers } from "../core/VertextBuffers";
import { IndexFormat, InputStepMode, PrimitiveTopology, VertexFormat } from "../core/WebGPUConstant";
import ColorMaterial from "../material/ColorMaterial";
import Attribute from "../render/Attribute";
import Buffer from "../render/Buffer";
import DrawCommand from "../render/DrawCommand";
import Pipeline from "../render/Pipeline";
import { Mesh } from "./Mesh";
export default class Axes extends Mesh {

    private vertBuffers: VertextBuffers;

    private indexBuffer: Buffer;

    count: number;

    type:string;

    material: ColorMaterial;

    constructor() {
        super();
        this.distanceToCamera=10;
        this.material=new ColorMaterial();
    }
    update(frameState: FrameState){
        this.updateMatrix();
        this.material.update(frameState,this);
        if(!this.drawCommand) this.init(frameState);
        frameState.commandList.opaque.push(this.drawCommand);
    }
    private init(frameState: FrameState) {
        const {context,pass}=frameState;
        const {device,systemRenderResource}=context;
        const data = new Float32Array([
            /* position */ 0, 0, 0, /* color */ 1, 0, 0, 1,
            /* position */ 1, 0, 0, /* color */ 1, 0.5, 0.5, 1,
            /* position */ 0, 0, 0, /* color */ 0, 1, 0, 1,
            /* position */ 0, 1, 0, /* color */ 0.5, 1, 0.5, 1,
            /* position */ 0, 0, 0, /* color */ 0, 0, 1, 1,
            /* position */ 0, 0, 1, /* color */ 0.5, 0.5, 1, 1,
        ])
        const indices = new Uint16Array([
            0, 1,
            2, 3,
            4, 5
        ]);
        const buffer = Buffer.createVertexBuffer(device, data);
        //attribute
        const pat = new Attribute('position', VertexFormat.Float32x3, 0, 0);
        const cat = new Attribute('color', VertexFormat.Float32x4, 3 * Float32Array.BYTES_PER_ELEMENT, 1);
        // vertBuffer
        const vertBuffers = new VertextBuffers([
            {
                index: 0,
                arrayStride: 28,
                stepMode: InputStepMode.Vertex,
                buffer,
                attributes: [pat, cat],
            }
        ]);
        this.vertBuffers = vertBuffers;
        this.indexBuffer = Buffer.createIndexBuffer(device, indices);
        this.count = indices.length;
        this.drawCommand = new DrawCommand({
            vertexBuffers: this.vertBuffers,
            indexBuffer: this.indexBuffer,
            indexFormat: IndexFormat.Uint16,
            bindGroups: this.material.bindGroups,
            instances: 1,
            count: this.count,
            renderState:this.material.renderState,
            topology:PrimitiveTopology.LineList,
            shaderSource:this.material.shaderSource,
            groupLayouts:this.material.groupLayouts,
            uuid:this.material.type+this.material.shaderSource.uid,
            type:'render',
            onwer:this       
        });
        this.drawCommand.pipeline=Pipeline.getRenderPipelineFromCache(device,this.drawCommand,systemRenderResource.layouts);
    };
}