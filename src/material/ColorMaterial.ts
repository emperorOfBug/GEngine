import { FrameState } from "../core/FrameState";
import { Mesh } from "../mesh/Mesh";
import UniformBuffer from "../render/UniformBuffer";
import { UniformEnum } from "../render/Uniforms";
import { ShaderSource } from "../shader/ShaderSource";
import { Material } from "./Material";
export default class ColorMaterial extends Material {
	constructor() {
		super();
		this.type = "color";
		this.shaderSource = new ShaderSource({
			type: this.type,
			render: true,
			defines: {}
		});
	}
	update(frameState: FrameState, mesh: Mesh) {
		if (!this.shaderData || this.dirty) this.createShaderData(mesh);
		const uniformBuffer = new UniformBuffer({ label: "color" });
		uniformBuffer.setUniform(
			"modelMatrix",
			() => {
				return null;
			},
			UniformEnum.Mat4
		);
		this.shaderData.setUniformBuffer("color", uniformBuffer);
	}
}
