import { Material } from "./Material";
import { ShaderSource } from "../shader/ShaderSource";
import { Mesh } from "../mesh/Mesh";
import { FrameState } from "../core/FrameState";
import Color from "../math/Color";
import UniformBuffer from "../render/UniformBuffer";
import Texture from "../render/Texture";
import Sampler from "../render/Sampler";
import textureCache from "../core/TextureCache";
import { UniformEnum } from "../render/Uniforms";
export default class BlinnPhongMaterial extends Material {
	public specular: Color;
	public shininess: number;
	public normalTexture: Texture;
	public normalSampler: Sampler;
	constructor() {
		super();
		this.type = "phong";
		this.color = new Color(1.0, 0.0, 0.0);
		this.shaderSource = new ShaderSource({
			type: this.type,
			render: true,
			defines: {
				materialPhong: true
			}
		});
		this.light = true;
		this.specular = new Color(1.0, 1.0, 1.0);
		this.shininess = 30.0;
		this.baseTexture = undefined;
		this.baseSampler = undefined;
	}
	update(frameState: FrameState, mesh: Mesh) {
		if (!this.shaderData || this.dirty) this.createShaderData(mesh);
	}
	protected createShaderData(mesh?: Mesh) {
		super.createShaderData(mesh);
		const uniformBuffer = new UniformBuffer({ label: "phong" });
		uniformBuffer.setUniform(
			"modelMatrix",
			() => {
				return null;
			},
			UniformEnum.Mat4
		);
		uniformBuffer.setUniform("color", this, UniformEnum.Color);
		uniformBuffer.setUniform("opacity", this, UniformEnum.Float);
		uniformBuffer.setUniform(
			"normalMtrix",
			() => {
				return mesh.normalMatrix;
			},
			UniformEnum.Mat4
		);
		uniformBuffer.setUniform("emissive", this, UniformEnum.Color);
		uniformBuffer.setUniform("shininess", this, UniformEnum.Float);
		uniformBuffer.setUniform("specular", this, UniformEnum.Color);
		this.shaderData.setUniformBuffer("phong", uniformBuffer);
		if (this.baseTexture) {
			this.shaderData.setDefine("USE_COLORTEXTURE", true);
			this.shaderData.setTexture("baseColorTexture", this.baseTexture);
			this.shaderData.setSampler("baseColorSampler", this.baseSampler || textureCache.defaultSampler);
		}
		if (this.normalTexture) {
			this.shaderData.setDefine("USE_NORMALTEXTURE", true);
			this.shaderData.setTexture("normalTexture", this.normalTexture);
			this.shaderData.setSampler("normalSampler", this.normalSampler || textureCache.defaultSampler);
		}
	}
	destroy() {}
}
