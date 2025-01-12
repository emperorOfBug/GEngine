import { IUniform } from "../core/WebGPUTypes";
import { Mesh } from "../mesh/Mesh";
import ShaderData from "../render/ShaderData";
import UniformBuffer from "../render/UniformBuffer";
import { UniformEnum } from "../render/Uniforms";
const uniformArrayNames = ["float-array", "vec2-array", "vec3-array", "vec4-array"];
export function checkContainFloatType(uniforms) {
	let result = 0;
	let hasArraytype = false;
	const uniformsNames = Object.getOwnPropertyNames(uniforms);
	uniformsNames.map((uniformsName) => {
		if (uniforms[uniformsName].type == "texture" || uniforms[uniformsName].type == "sampler") {
			result += 0;
		} else {
			if (
				uniformArrayNames.find((name) => {
					return name === uniforms[uniformsName].type;
				})
			) {
				hasArraytype = true;
			} else {
				result += 1;
			}
		}
	});
	return {
		hasFloat: result,
		hasArraytype
	};
}
export function addUniformToShaderData(
	name: string,
	uniform: IUniform,
	shaderData: ShaderData,
	mesh?: Mesh,
	uniformBuffer?: UniformBuffer
) {
	const valueIsFunc = uniform?.value instanceof Function;
	switch (uniform.type) {
		case "float":
			uniformBuffer.setUniform(
				name,
				valueIsFunc
					? uniform.value
					: () => {
							return uniform.value;
					  },
				UniformEnum.Float
			);
			break;
		case "vec2":
			uniformBuffer.setUniform(
				name,
				valueIsFunc
					? uniform.value
					: () => {
							return uniform.value;
					  },
				UniformEnum.FloatVec2
			);
			break;
		case "vec3":
			uniformBuffer.setUniform(
				name,
				valueIsFunc
					? uniform.value
					: () => {
							return uniform.value;
					  },
				UniformEnum.FloatVec3
			);
			break;
		case "color":
			uniformBuffer.setUniform(
				name,
				valueIsFunc
					? uniform.value
					: () => {
							return uniform.value;
					  },
				UniformEnum.Color
			);
			break;
		case "vec4":
			uniformBuffer.setUniform(
				name,
				valueIsFunc
					? uniform.value
					: () => {
							return uniform.value;
					  },
				UniformEnum.FloatVec4
			);
			break;
		case "mat2":
			uniformBuffer.setUniform(
				name,
				valueIsFunc
					? uniform.value
					: () => {
							return uniform.value;
					  },
				UniformEnum.Mat2
			);
			break;
		case "mat3":
			uniformBuffer.setUniform(
				name,
				valueIsFunc
					? uniform.value
					: () => {
							return uniform.value;
					  },
				UniformEnum.Mat3
			);
			break;
		case "mat4":
			uniformBuffer.setUniform(
				name,
				valueIsFunc
					? uniform.value
					: () =>
							name == "modelMatrix"
								? mesh?.modelMatrix
								: name === "normalMatrix"
								? mesh?.normalMatrix
								: uniform.value,
				UniformEnum.Mat4
			);
			break;
		case "float-array":
			uniformBuffer.setUniform(
				name,
				valueIsFunc
					? uniform.value
					: () => {
							return uniform.value;
					  },
				UniformEnum.FloatArray,
				uniform.value.length
			);
			break;
		case "vec2-array":
			uniformBuffer.setUniform(
				name,
				valueIsFunc
					? uniform.value
					: () => {
							return uniform.value;
					  },
				UniformEnum.Vec2Array,
				uniform.value.length
			);
			break;
		case "vec3-array":
			uniformBuffer.setUniform(
				name,
				valueIsFunc
					? uniform.value
					: () => {
							return uniform.value;
					  },
				UniformEnum.Vec3Array,
				uniform.value.length
			);
			break;
		case "vec4-array":
			uniformBuffer.setUniform(
				name,
				valueIsFunc
					? uniform.value
					: () => {
							return uniform.value;
					  },
				UniformEnum.Vec4Array,
				uniform.value.length
			);
			break;
		case "texture":
			shaderData.setTexture(
				name,
				valueIsFunc
					? uniform.value
					: () => {
							return uniform.value;
					  }
			);
			break;
		case "sampler":
			shaderData.setSampler(
				name,
				valueIsFunc
					? uniform.value
					: () => {
							return uniform.value;
					  },
				uniform?.binding
			);
			break;
		default:
			throw new Error("not match unifrom type");
	}
}
