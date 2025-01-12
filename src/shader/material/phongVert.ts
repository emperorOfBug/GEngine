import { wgslParseDefines } from "../WgslPreprocessor";
export default function phongVert(defines) {
	return wgslParseDefines`
      struct MaterialUniform {
            modelMatrix: mat4x4<f32>,
            color: vec3<f32>,
            opacity:f32,
            normalMatrix: mat4x4<f32>,
            emissive:vec3<f32>,
            specular:vec3<f32>,
            shininess:f32,
      }
      #include <VertexOutput>
      #include <SystemUniform>
      #include <VertexInput>
      @binding(${defines.phongBinding}) @group(0) var<uniform> selfUniform : MaterialUniform;
      @binding(${defines.cameraBinding}) @group(1) var<uniform> systemUniform : SystemUniform;
      @vertex
      fn main(input: VertexInput) -> VertexOutput {
            var output: VertexOutput;
            #if ${defines.HAS_UV}
               output.uv = input.uv;
            #endif 
            let modelPos=selfUniform.modelMatrix *vec4<f32>(input.position,1.0);
            output.worldPos = modelPos.xyz/modelPos.w;
            let vNormalView = selfUniform.normalMatrix * vec4<f32>(input.normal,0.0);
            output.normal =  vNormalView.xyz;
            output.view = systemUniform.cameraPosition.xyz - modelPos.xyz;
            let viewPosition=systemUniform.viewMatrix * modelPos;
            output.viewPosition = -viewPosition.xyz;
            output.position = systemUniform.projectionMatrix * systemUniform.viewMatrix * modelPos;
            return output;
      }`;
}
