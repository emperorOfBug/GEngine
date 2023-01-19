import Context from "./Context";

class Sampler {
  public gpuSampler: GPUSampler;
  layoutType: string;
  constructor(
    public descriptor: GPUSamplerDescriptor = {
      magFilter: "linear",
      minFilter: "linear",
      mipmapFilter: "linear",
      addressModeU: "clamp-to-edge",
      addressModeV: "clamp-to-edge",
      addressModeW: "clamp-to-edge",
    }
  ) {
    this.layoutType = "filtering";
  }
  update(context: Context) {
    if (!this.gpuSampler)
      this.gpuSampler = context.device.createSampler(this.descriptor);
  }
}

export default Sampler;
