import PerspectiveCamera from "./camera/PerspectiveCamera";
import { EventDispatcher } from "./core/EventDispatcher";
import { FrameState } from "./core/FrameState";
import LightManger from "./core/LightManger";
import PrimitiveManger from "./core/PrimitiveManger";
import SkyBox from "./mesh/SkyBox";
import Context from "./render/Context";
import Texture from "./render/Texture";
import ForwardRenderLine from "./renderpipeline/ForwardRenderLine";
import IBaseRenderLine from "./renderpipeline/IBaseRenderLine";
import defaultValue from "./utils/defaultValue";
import { loadPbrTexture } from "./utils/utils";
import textureCache from "./core/TextureCache";

export class Scene extends EventDispatcher {
  lightManger: LightManger;
  primitiveManger: PrimitiveManger;
  camera: PerspectiveCamera;
  context: Context;
  requestAdapter: {};
  deviceDescriptor: {};
  presentationContextDescriptor: {};
  container: HTMLDivElement;
  frameState: FrameState;
  currentRenderPipeline: IBaseRenderLine;
  viewport: { x: number; y: number; width: number; height: number };
  skybox: SkyBox;
  private ready: boolean;
  private brdfUrl:string;
  private specularEnvUrls:Array<string>;
  private diffuseEnvUrls:Array<string>;
  private inited:boolean;
  constructor(options) {
    super();
    this.container =
      options.container instanceof HTMLDivElement
        ? options.container
        : document.getElementById(options.container);
    this.lightManger = new LightManger();
    this.primitiveManger = new PrimitiveManger();
    this.context = new Context({
      canvas: null,
      container: this.container,
      pixelRatio: 1,
    });
    this.brdfUrl=defaultValue(options.brdfUrl,undefined);
    this.specularEnvUrls=defaultValue(options.specularEnvUrls,[]);
    this.diffuseEnvUrls=defaultValue(options.diffuseEnvUrls,[]);
    this.requestAdapter = options.requestAdapter || {};
    this.deviceDescriptor = options.deviceDescriptor || {};
    this.presentationContextDescriptor = options.presentationContextDescriptor;
    this.ready = false;
    this.skybox = defaultValue(options.skybox, undefined);
    this.inited=false;
    //this.init();
  }
  private async init() { 
    await this.context.init(
      this.requestAdapter,
      this.deviceDescriptor,
      this.presentationContextDescriptor
    )
      this.currentRenderPipeline = new ForwardRenderLine(this.context);
      this.frameState = new FrameState(this.context);
      this.viewport = {
        x: 0,
        y: 0,
        width: this.context.presentationSize.width,
        height: this.context.presentationSize.height,
      };
      if(this.brdfUrl){
        const {brdfTexture,diffuseTexture,specularTexture,}= await loadPbrTexture(this.brdfUrl,this.diffuseEnvUrls,this.specularEnvUrls);
        textureCache.addTexture('brdf',brdfTexture);
        textureCache.addTexture('diffuse',diffuseTexture);
        textureCache.addTexture('specular',specularTexture);
      }
      this.ready = true;
    
  }
  add(instance) {
    if (
      instance.type === "primitive" &&
      !this.primitiveManger.contains(instance)
    ) {
      this.primitiveManger.add(instance);
    }
  }
  addLight(light) {
    this.lightManger.add(light);
  }
  setCamera(camera) {
    this.camera = camera;
  }
  remove(instance) {
    if (
      instance.type === "primitive" &&
      !this.primitiveManger.contains(instance)
    ) {
      this.primitiveManger.remove(instance);
    }
  }
  getPrimitiveById() {}
  async render() {
    if (!this.inited) {
      this.inited=true;
       await this.init();
    }
    this.update();
  }
  private update() {
    if (!this.ready) return;
    //释放纹理
    textureCache.releasedTextures();
    //更新相机
    this.frameState.viewport = this.viewport;
    this.frameState.update(this.camera);
    //更新灯光
    this.lightManger.update(this.frameState);
    this.context.systemRenderResource.update(this.frameState, this);
    //update primitive and select
    this.primitiveManger.update(this.frameState);
    //selct renderPipeline
    this.currentRenderPipeline.render(this.frameState);
  }
}
