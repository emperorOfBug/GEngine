import { DirtectLight } from "./DirtectLight";
import { PointLight } from "./PointLight";
import { SpotLight } from "./SpotLight";

export class SpotData{
    decay: Float32Array;
    penumbraCos: Float32Array;
    coneCos: Float32Array;
    distance: Float32Array;
    dirtect: Float32Array;
    position: Float32Array;
    color: Float32Array;
    //array<light> light of byteSize must be k*16 
    static byteSize=64;
    static size=13;
    spotLight: SpotLight;
    constructor(buffer:Float32Array,byteOffset:number,spotLight:SpotLight){  
        this.spotLight=spotLight;   
        this.position=new Float32Array(buffer.buffer, byteOffset,3);//3
        this.distance=new Float32Array(buffer.buffer, byteOffset+12,1);//1
        this.dirtect=new Float32Array(buffer.buffer, byteOffset+16,3);//3
        this.coneCos=new Float32Array(buffer.buffer, byteOffset+28,1);//1
        this.color=new Float32Array(buffer.buffer, byteOffset+32,3);//3
        this.penumbraCos=new Float32Array(buffer.buffer, byteOffset+44,1);//1
        this.decay=new Float32Array(buffer.buffer, byteOffset+48,1);//1
    }
    update(){
        debugger
        if(this.spotLight.colorDirty){
            this.spotLight.colorDirty=false;
            copyData(this.spotLight.color.toArray(),this.color);
        }
        if (this.spotLight.positionDirty) {
            this.spotLight.positionDirty=false;
            copyData(this.spotLight.position.toArray(),this.position);
        }
        if (this.spotLight.dirtectDirty) {
            this.spotLight.dirtectDirty=false;
            copyData(this.spotLight.dirtect.toArray(),this.dirtect);
        }
        if(this.spotLight.distanceDirty){
            this.spotLight.distanceDirty=false;
            this.distance[0]=this.spotLight.distance;//1
        }
        if(this.spotLight.coneCosDirty){
            this.spotLight.coneCosDirty=false;
            this.coneCos[0]=this.spotLight.coneCos;//1
        }
        if (this.spotLight.penumbraCosDirty) {
            this.spotLight.penumbraCosDirty=false;
            this.penumbraCos[0]=this.spotLight.penumbraCos;//1
        }
        if (this.spotLight.decayDirty) {
            this.spotLight.decayDirty=false;
            this.decay[0]=this.spotLight.decay;//1
        }
        
    }
    destory(){
        this.spotLight=undefined;   
        this.color=undefined; 
        this.position=undefined; 
        this.dirtect=undefined; 
        this.distance=undefined; 
        this.coneCos=undefined; 
        this.penumbraCos=undefined; 
        this.decay=undefined; 
    }
}
export class PointData{
    color: Float32Array;
    position: Float32Array;
    decay: Uint32Array;
    distance: Uint32Array;
    pointLight: PointLight;
    static byteSize=32;
    static size=8;
    constructor(buffer:Float32Array,byteOffset:number,pointLight:PointLight){
        this.pointLight=pointLight;
        this.color=new Float32Array(buffer.buffer, byteOffset, 3);//3
        this.position=new Float32Array(buffer.buffer, byteOffset+12, 3);//3
        this.decay=new Uint32Array(buffer.buffer, byteOffset+24, 1);//1
        this.distance=new Uint32Array(buffer.buffer, byteOffset+28, 1);//1
    }
    update(){
        if (this.pointLight.colorDirty) {
            this.pointLight.colorDirty=false;
            copyData(this.pointLight.color.toArray(),this.color);
        }
        if (this.pointLight.positionDirty) {
            this.pointLight.positionDirty=false;
            copyData(this.pointLight.position.toArray(),this.position);
        }
        if (this.pointLight.decayDirty) {
            this.pointLight.decayDirty=false;
            this.decay[0]=this.pointLight.decay;
        }
        if (this.pointLight.distanceDirty) {
            this.pointLight.distanceDirty=false;
            this.distance[0]=this.pointLight.distance;
        }
        
    }
    destory(){
        this.pointLight=undefined;
        this.color=undefined;
        this.position=undefined;
        this.decay=undefined;
        this.distance=undefined;
    }
}
export class DirtectData{
    dirtect: Float32Array;
    color: Float32Array;
    dirtectLight: DirtectLight;
    static byteSize=24;
    static size=6;
    constructor(buffer:Float32Array,byteOffset:number,dirtectLight:DirtectLight){
        this.dirtectLight=dirtectLight;
        this.color=new Float32Array(buffer.buffer, byteOffset, 3);//3
        this.dirtect=new Float32Array(buffer.buffer, byteOffset+12, 3);//3
    }
    update(){
        if (this.dirtectLight.colorDirty) {
            this.dirtectLight.colorDirty=false;
            copyData(this.dirtectLight.color.toArray(),this.color);
        }
        if (this.dirtectLight.dirtectDirty) {
            this.dirtectLight.dirtectDirty=false;
            copyData(this.dirtectLight.dirtect.toArray(),this.dirtect);
        }
        
    }
    destory(){
        this.dirtectLight=undefined;
        this.color=undefined;
        this.dirtect=undefined;
    }
}
function copyData(src:Array<number>,dis:Float32Array|Uint32Array){
    src.forEach((element,index)=> {
    dis[index]=element;
    });
}