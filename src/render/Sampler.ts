class Sampler {
	public gpuSampler: GPUSampler;
	public layoutType: GPUSamplerBindingLayout;

	static baseSampler = new Sampler({
		magFilter: "linear",
		minFilter: "linear"
	});

	constructor(
		public descriptor?: GPUSamplerDescriptor,
		layoutType: GPUSamplerBindingLayout = {
			type: "filtering"
		}
	) {
		this.descriptor = {};
		Object.assign(
			this.descriptor,
			{
				magFilter: "linear",
				minFilter: "linear",
				// mipmapFilter: "linear",
				addressModeU: "clamp-to-edge",
				addressModeV: "clamp-to-edge"
				// addressModeW: "clamp-to-edge",
			},
			descriptor
		);
		this.layoutType = layoutType;
	}
	update(device: GPUDevice) {
		if (!this.gpuSampler) this.gpuSampler = device.createSampler(this.descriptor);
	}
}

export default Sampler;
