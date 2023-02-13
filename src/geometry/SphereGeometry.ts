import { Float32Attribute } from "../render/Attribute";
import { createSphere } from "../utils/GeometryUtils";
import Geometry from "./Geometry";

export default class SphereGeometry extends Geometry {
	normals: number[];
	uvs: number[];
	positions: number[];
	indices: number[];
	constructor() {
		super({});
		this.type = "sphere";
		this.init();
	}
	private init() {
		const { positions, normals, uvs, indices } = createSphere({});
		this.positions = positions;
		this.normals = normals;
		this.uvs = uvs;
		this.indices = indices;
		this.computeBoundingSphere(this.positions);
		this.setAttribute(new Float32Attribute("position", this.positions, 3));
		this.setAttribute(new Float32Attribute("normal", this.normals, 3));
		this.setAttribute(new Float32Attribute("uv", this.uvs, 2));

		this.setIndice(this.indices);
		this.count = this.indices.length;
	}
}
