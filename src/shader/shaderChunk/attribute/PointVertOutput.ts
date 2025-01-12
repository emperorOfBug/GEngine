export function PointVertOutput(defines) {
	return `
    struct PointVertOutput{
        @builtin(position) position:vec4<f32>,
        @location(0) uv:vec2<f32>,
        @location(1) color: vec4<f32>,
        @location(2) size: f32,
    }
   `;
}
