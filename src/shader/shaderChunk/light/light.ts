import { wgslParseDefines } from "../../WgslPreprocessor";
export default function light(defines) {
	return wgslParseDefines` 
    struct ReflectedLight {
        ambient: vec3<f32>,
        directDiffuse:vec3<f32>,
        directSpecular:vec3<f32>,
        indirectDiffuse:vec3<f32>,
        indirectSpecular:vec3<f32>,
        testColor: vec3<f32>,
    }; 
    struct IncidentLight {
        color: vec3<f32>,
        direction: vec3<f32>,
        visible: bool,
    };
    struct Geometry {
        position: vec3<f32>,
        normal: vec3<f32>,
        viewDir: vec3<f32>,
        dotNV:f32,
        #if ${defines.USE_CLEARCOAT}
            vec3 clearcoatNormal;
        #endif
    };

    #if ${defines.spotLightsCount > 0}
        struct SpotLight {
            position: vec3<f32>,
            distance: f32,
            direction: vec3<f32>,
            coneCos: f32,
            color: vec3<f32>,
            penumbraCos: f32,
            decay: f32,
        };
        fn getSpotLightInfo(spotLight:SpotLight,worldPos:vec3<f32>,shininess:f32,N:vec3<f32>,V:vec3<f32>)->ReflectedLight{
                var direction:vec3<f32> = spotLight.position - worldPos;
                var lightColor:ReflectedLight;
                let lightDistance:f32 = length(direction);
                direction = normalize(direction);
                let angleCos:f32 = dot( direction, spotLight.direction );
                let decay:f32 = clamp(1.0 - pow(lightDistance/spotLight.distance, spotLight.decay), 0.0, 1.0);
                let spotEffect:f32 = smoothstep( spotLight.penumbraCos, spotLight.coneCos, angleCos );
                let decayTotal:f32 = decay * spotEffect;
                let d:f32 = max( dot( N, direction ), 0.0 )  * decayTotal;
                lightColor.directDiffuse= spotLight.color * d;
                let halfDir:vec3<f32> = normalize( V + direction );
                let s:f32 = pow( clamp( dot( N, halfDir ), 0.0, 1.0 ), shininess ) * decayTotal;
                lightColor.directSpecular= spotLight.color * s;
                return lightColor;
        }
        fn getSpotLightIncidentLight(spotLight:SpotLight, geometry:Geometry)->IncidentLight {
            var incidentLight:IncidentLight;
            let lVector:vec3<f32> = spotLight.position - geometry.position;
            incidentLight.direction = normalize( lVector );
    
            let lightDistance:f32 = length( lVector );
            let angleCos:f32 = dot( incidentLight.direction, spotLight.direction );
    
            let spotEffect:f32 = smoothstep( spotLight.penumbraCos, spotLight.coneCos, angleCos );
            let decayEffect:f32 = clamp(1.0 - pow(lightDistance/spotLight.distance, 4.0), 0.0, 1.0);
    
            incidentLight.color=spotLight.color*spotEffect * decayEffect; 
            return  incidentLight;
        }

    #endif 

    #if ${defines.pointLightsCount > 0}
        struct PointLight {
            position: vec3<f32>,
            distance: f32,
            color: vec3<f32>,
            decay: f32,
        };
        fn getPointLightInfo(pointLight:PointLight,worldPos:vec3<f32>,shininess:f32,N:vec3<f32>,V:vec3<f32>)->ReflectedLight{
            var lightColor:ReflectedLight;
            var direction:vec3<f32> = worldPos - pointLight.position;
            let dist:f32 = length( direction );
            direction = normalize(direction);
            let decay = clamp(1.0 - pow(dist / pointLight.distance, pointLight.decay), 0.0, 1.0);
    
            let d =  max( dot( N, -direction ), 0.0 ) * decay;
            lightColor.directDiffuse = pointLight.color * d;
    
            let halfDir:vec3<f32> = normalize( V - direction );
            let s:f32 = pow( clamp( dot( N, halfDir ), 0.0, 1.0 ), shininess )  * decay;
            lightColor.directSpecular = pointLight.color * s;
            return lightColor;
        }
        fn getPointLightIncidentLight(pointLight:PointLight, geometry:Geometry)->IncidentLight {
            var incidentLight:IncidentLight;
            let lVector:vec3<f32> = pointLight.position-geometry.position;
            incidentLight.direction= normalize( lVector );
            let lightDistance:f32 = length( lVector );
            // let weight:f32=1.0 - pow(lightDistance/pointLight.distance, 4.0);
            incidentLight.color=pointLight.color*clamp(1.0 - pow(lightDistance/pointLight.distance, 4.0), 0.0, 1.0);
            return incidentLight;
        }
    #endif
    #if ${defines.dirtectLightsCount > 0}
        struct DirectionalLight {
            direction: vec3<f32>,
            color: vec3<f32>,
        };
        fn getDirectLightInfo(directionalLight:DirectionalLight,shininess:f32,N:vec3<f32>,V:vec3<f32>)->ReflectedLight{
            var lightColor:ReflectedLight;
            let d:f32 = max(dot(N, -directionalLight.direction), 0.0);
            lightColor.directDiffuse += directionalLight.color * d;
    
            let halfDir:vec3<f32> = normalize( V - directionalLight.direction );
            let s:f32 = pow( clamp( dot( N, halfDir ), 0.0, 1.0 ), shininess );
            lightColor.directSpecular += directionalLight.color * s;
            return lightColor;
        }
        fn getDirectionalDirectLightIncidentLight(directionalLight:DirectionalLight,geometry:Geometry)->IncidentLight {
            var incidentLight:IncidentLight;
            incidentLight.color = directionalLight.color;
            incidentLight.direction = normalize(directionalLight.direction);
            return incidentLight;         
        }
    #endif

    #if ${defines.openShadow} 
        struct LightInfo {
            direction: vec3<f32>,
            viewport: vec4<f32>,
        };
        
        fn linearizeDepth(depth: f32, near: f32, far: f32)->f32 {
            return 2 * (near * far) / (far + near - depth * (far - near));
        }

        fn getCubeFace(v : vec3<f32>) -> i32{
            let vAbs = abs(v);
        
            if (vAbs.z >= vAbs.x && vAbs.z >= vAbs.y) {
              if (v.z < 0.0) {
                return 3;
              }
              return 2;
            }
        
            if (vAbs.y >= vAbs.x) {
              if (v.y < 0.0) {
                return 5;
              }
              return 4;
            }
        
            if (v.x < 0.0) {
              return 1;
            }
            return 0;
        }

        fn getShadowValue(shadowMapArray:texture_depth_2d_array, shadowSampler:sampler_comparison, lightPos:vec4<f32>, geometry:Geometry, lightInfo:LightInfo, index:u32, isPointLight: bool, near: f32, far: f32)->f32 {
            var visibility = 0.0;
            var projectPos: vec3<f32> = lightPos.xyz / lightPos.w;
            var shadowPos: vec3<f32> = vec3(projectPos.xy * vec2(0.5, -0.5) + vec2(0.5), projectPos.z);
            var d:f32 = dot(geometry.normal, -lightInfo.direction);
            var bias = max(0.012 * (1.0 - d), 0.001) / lightPos.w;
            let oneOverShadowDepthTextureSize = 1.0 / 1024.0;
            // var depth = select(shadowPos.z, (linearizeDepth(shadowPos.z, near, far) - near) / (far- near), isPerspectiveCamera);
            var depth = shadowPos.z;

            if (isPointLight) {
                shadowPos.x = shadowPos.x * lightInfo.viewport.z;
                shadowPos.y = shadowPos.y * lightInfo.viewport.w;
                var viewportX = lightInfo.viewport.x * lightInfo.viewport.z;
                var viewportY = lightInfo.viewport.y * lightInfo.viewport.w;
                var uvOffset = 1.5 / 1024.0;
                shadowPos.x = clamp(shadowPos.x + viewportX, viewportX + uvOffset, viewportX + lightInfo.viewport.z - uvOffset);
                shadowPos.y = clamp(shadowPos.y + viewportY, viewportY + uvOffset, viewportY + lightInfo.viewport.w - uvOffset);
            }

            for (var y = -1; y <= 1; y++) {
                for (var x = -1; x <= 1; x++) {
                    let offset = vec2<f32>(vec2(x, y)) * oneOverShadowDepthTextureSize;
                
                    visibility += textureSampleCompare(
                        shadowMapArray, shadowSampler,
                        shadowPos.xy + offset, index, depth - bias);
                }
            }
            visibility /= 9.0;
            var inFrustum = shadowPos.x >= 0.0 && shadowPos.x <= 1.0 && shadowPos.y >= 0.0 && shadowPos.y <= 1.0;
            if (!inFrustum || depth > 1.0) {
                visibility = 1.0;
            }
            return visibility;
        }
    #endif

    #if ${
		defines.ambientLightCount || defines.spotLightsCount || defines.pointLightsCount || defines.dirtectLightsCount
	}
        struct LightUniforms{
            #if ${defines.ambientLightCount}
                ambient:vec4<f32>,
            #endif
            #if ${defines.spotLightsCount}
                spotLights:array<SpotLight,${defines.spotLightsCount}>,
            #endif
            #if ${defines.pointLightsCount}
                pointLights:array<PointLight,${defines.pointLightsCount}>,
            #endif
            #if ${defines.dirtectLightsCount}
                dirtectLights:array<DirectionalLight,${defines.dirtectLightsCount}>,
            #endif
        }
        @group(2) @binding(${defines.lightBinding}) var<storage, read> lightUniforms: LightUniforms;

        #if ${defines.openShadow}
            #if ${defines.spotLightShadowMapsCount}
                struct SpotLightShadow {
                    shadowCameraVPMatrix: mat4x4<f32>,
                    shadowCameraNear: f32,
                    shadowCameraFar: f32
                }
            #endif
            #if ${defines.pointLightShadowMapsCount}
                struct PointLightShadow {
                    shadowCameraVPMatrixArray: array<mat4x4<f32>, 6>,
                    shadowCameraViewportArray: array<vec4<f32>, 6>,
                    shadowCameraNear: f32,
                    shadowCameraFar: f32,
                    // shadowCameraVPMatrix: mat4x4<f32>,
                    // shadowCameraVPMatrixArray: array<mat4x4<f32>, 6>,
                    // shadowCameraViewportArray: array<vec4<f32>, 6>,
                }
            #endif
            #if ${defines.directLightShadowMapsCount}
                struct DirectLightShadow {
                    shadowCameraVPMatrix: mat4x4<f32>,
                }
            #endif
            struct ShadowUniforms{
                #if ${defines.spotLightShadowMapsCount}
                    spotLightShadows:array<SpotLightShadow,${defines.spotLightShadowMapsCount}>,
                #endif
                #if ${defines.pointLightShadowMapsCount}
                    pointLightShadows:array<PointLightShadow,${defines.pointLightShadowMapsCount}>,
                #endif
                #if ${defines.directLightShadowMapsCount}
                    directLightShadows:array<DirectLightShadow,${defines.directLightShadowMapsCount}>,
                #endif
            }
            @group(2) @binding(${defines.shadowBinding}) var<storage, read> shadowUniforms: ShadowUniforms;

            #if ${defines.spotLightShadowMapTextureArrayBinding}
                @group(2) @binding(${
					defines.spotLightShadowMapTextureArrayBinding
				}) var spotLightShadowMapTextureArray: texture_depth_2d_array;
            #endif
            #if ${defines.pointLightShadowMapTextureArrayBinding}
                @group(2) @binding(${
					defines.pointLightShadowMapTextureArrayBinding
				}) var pointLightShadowMapTextureArray: texture_depth_2d_array;
            #endif
            #if ${defines.directLightShadowMapTextureArrayBinding}
                @group(2) @binding(${
					defines.directLightShadowMapTextureArrayBinding
				}) var directLightShadowMapTextureArray: texture_depth_2d_array;
            #endif
            @group(2) @binding(${defines.shadowSamplerBinding}) var shadowSampler: sampler_comparison;
        #endif

    #endif
    #if ${defines.materialPhong}
        fn parseLights(geometry:Geometry,shininess:f32)->ReflectedLight {
    #elif ${defines.materialPbr}
        fn parseLights(geometry:Geometry,material:PhysicalMaterial)->ReflectedLight{
    #endif
        var reflectedLight:ReflectedLight;
        var shadowValue:f32 = 1.0;
        #if ${defines.ambientLightCount > 0}
            //处理环境光
            var ambientColor:vec3<f32> = lightUniforms.ambient.xyz * lightUniforms.ambient.w;
            reflectedLight.ambient += ambientColor;
        #endif

        #if ${defines.spotLightsCount > 0}
            //处理聚光灯
            var spotLight:SpotLight;
            for (var k = 0u; k < ${defines.spotLightsCount}; k = k + 1u) {
                spotLight= lightUniforms.spotLights[k];
                #if ${defines.materialPhong && defines.openShadow && defines.spotLightShadowMapsCount}
                    if k < textureNumLayers(spotLightShadowMapTextureArray) {
                        var spotLightShadow:SpotLightShadow = shadowUniforms.spotLightShadows[k];
                        var lightPos: vec4<f32> = spotLightShadow.shadowCameraVPMatrix * vec4<f32>(geometry.position,1.0);
                        var lightInfo:LightInfo;
                        lightInfo.direction = normalize(geometry.position - spotLight.position);

                        shadowValue = getShadowValue(spotLightShadowMapTextureArray, shadowSampler, lightPos, geometry, lightInfo, k, false,
                            spotLightShadow.shadowCameraNear, spotLightShadow.shadowCameraFar);
                    }
                    spotLight.color *= shadowValue;
                #endif
                #if ${defines.materialPhong}
                    let spReflectedLight=getSpotLightInfo(spotLight,geometry.position,shininess,geometry.normal,geometry.viewDir);
                #elif ${defines.materialPbr}
                    let incidentLight=getSpotLightIncidentLight(spotLight,geometry);
                    let spReflectedLight=direct_Physical(incidentLight, geometry, material);
                #endif

                reflectedLight.directDiffuse+=spReflectedLight.directDiffuse;
                reflectedLight.directSpecular+=spReflectedLight.directSpecular;
            }
        #endif
        #if ${defines.pointLightsCount > 0}
            //处理点光源
            var pointLight:PointLight;
            for (var j = 0u; j < ${defines.pointLightsCount};j = j + 1u) {
                pointLight = lightUniforms.pointLights[j];
                #if ${defines.materialPhong && defines.openShadow && defines.pointLightShadowMapsCount}
                    if j < textureNumLayers(pointLightShadowMapTextureArray) {
                        var pointLightShadow:PointLightShadow = shadowUniforms.pointLightShadows[j];
                        var lightInfo:LightInfo;
                        lightInfo.direction = normalize(geometry.position - pointLight.position);
                        var cubeFace = getCubeFace(lightInfo.direction);
                        var lightPos: vec4<f32> = pointLightShadow.shadowCameraVPMatrixArray[cubeFace] * vec4<f32>(geometry.position,1.0);
                        lightInfo.viewport = pointLightShadow.shadowCameraViewportArray[cubeFace];

                        // var lightPos: vec4<f32> = pointLightShadow.shadowCameraVPMatrix * vec4<f32>(geometry.position,1.0);

                        shadowValue = getShadowValue(pointLightShadowMapTextureArray, shadowSampler, lightPos, geometry, lightInfo, j, true,
                            pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar);
                        
                        // reflectedLight.testColor = vec3(pointLightShadow.shadowCameraFar / 1000, 
                        //     pointLightShadow.shadowCameraVPMatrixArray[5][3][2] / 255, pointLightShadow.shadowCameraVPMatrixArray[5][3][3] / 255);
                        // reflectedLight.testColor = vec3(pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraNear);
                    }
                    pointLight.color *= shadowValue;
                #endif
                #if ${defines.materialPhong}
                    let poiReflectedLight=getPointLightInfo(pointLight,geometry.position,shininess,geometry.normal,geometry.viewDir);
                #elif ${defines.materialPbr}
                   let incidentLight=getPointLightIncidentLight(pointLight,geometry);
                   let poiReflectedLight=direct_Physical(incidentLight, geometry, material);
                #endif

                reflectedLight.directDiffuse+=poiReflectedLight.directDiffuse;
                reflectedLight.directSpecular+=poiReflectedLight.directSpecular;
            }
        #endif
        #if ${defines.dirtectLightsCount > 0}
            //处理方向光
            var directionalLight:DirectionalLight;
            for (var i= 0u; i <${defines.dirtectLightsCount}; i = i + 1u) {
                directionalLight = lightUniforms.dirtectLights[i];
                #if ${defines.materialPhong && defines.openShadow && defines.directLightShadowMapsCount}
                    if i < textureNumLayers(directLightShadowMapTextureArray) {
                        var directLightShadow:DirectLightShadow = shadowUniforms.directLightShadows[i];
                        var lightPos: vec4<f32> = directLightShadow.shadowCameraVPMatrix * vec4<f32>(geometry.position,1.0);
                        var lightInfo:LightInfo;
                        lightInfo.direction = directionalLight.direction;
                            
                        shadowValue = getShadowValue(directLightShadowMapTextureArray, shadowSampler, lightPos, geometry, lightInfo, i, false, 0, 0);
                    }
                    directionalLight.color *= shadowValue;
                #endif
            
                #if ${defines.materialPhong}
                    let dirReflectedLight=getDirectLightInfo(directionalLight,shininess,geometry.normal,geometry.viewDir);
                #elif ${defines.materialPbr}
                    let incidentLight=getDirectionalDirectLightIncidentLight(directionalLight,geometry);
                    let dirReflectedLight=direct_Physical(incidentLight, geometry, material);
                #endif

                reflectedLight.directDiffuse+=dirReflectedLight.directDiffuse;
                reflectedLight.directSpecular+=dirReflectedLight.directSpecular;
            }
        #endif
        return reflectedLight;
    }`;
}
