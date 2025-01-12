import { wgslParseDefines } from "../../WgslPreprocessor";

export function PbrMaterialStruct(defines) {
	return wgslParseDefines`
    struct MaterialUniform {
          modelMatrix: mat4x4<f32>,
          color: vec3<f32>,
          opacity:f32,
          normalMatrix: mat4x4<f32>,
          emissive:vec3<f32>,
          metallic:f32,
          roughness:f32,
          #if ${defines.USE_NORMALTEXTURE}
              normalTextureScale:vec2<f32>,
          #endif
          #if ${defines.USE_AOTEXTURE}
              occlusionStrength:f32,
          #endif
      }
   `;
}
