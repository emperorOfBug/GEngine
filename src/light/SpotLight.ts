import Camera from "../camera/Camera";
import Vector3 from "../math/Vector3";
import { Light } from "./Light";

export class SpotLight extends Light {
	private _distance: number;
	private _angle: number;
	private _penumbra: number;
	private _decay: number;
	decayDirty: boolean;
	distanceDirty: boolean;
	private _coneCos: number;
	private _penumbraCos: number;
	coneCosDirty: boolean;
	penumbraDirty: boolean;
	angleDirty: boolean;
	penumbraCosDirty: boolean;
	public dirtectVC: Vector3;
	dirtectDirty: boolean;
	private _target: Vector3;
	constructor(color, intensity, distance = 0, angle = 60, penumbra = 60, decay = 1) {
		super(color, intensity);
		this._distance = distance;
		this._angle = (angle / 180) * Math.PI;
		this._penumbra = (penumbra / 180) * Math.PI;
		this._decay = decay;
		this.type = "spot";
		this._target = new Vector3(0, 0, 0);
		this.dirtectDirty = true;
		this.angleDirty = true;
		this.penumbraDirty = true;
		this.distanceDirty = true;
		this.decayDirty = true;
		this.coneCosDirty = true;
		this.penumbraCosDirty = true;
		this.updateConeCosOrPenumbraCos();
	}
	set target(value) {
		this.dirtectDirty = true;
		this._target = value;
	}
	get directional() {
		const result = new Vector3();
		Vector3.subtract(this.position, this._target, result);
		return Vector3.normalize(result, new Vector3());
	}
	get angle() {
		return this._angle;
	}
	set angle(value) {
		this.angleDirty = true;
		this._angle = (value / 180) * Math.PI;
		this.updateConeCosOrPenumbraCos();
	}
	get penumbra() {
		return this._penumbra;
	}
	set penumbra(value) {
		this.penumbraDirty = true;
		this._penumbra = (value / 180) * Math.PI;
		this.updateConeCosOrPenumbraCos();
	}
	set distance(value) {
		this.distanceDirty = true;
		this._distance = value;
	}
	get distance() {
		return this._distance;
	}
	set decay(value) {
		this.decayDirty = true;
		this._decay = value;
	}
	get decay() {
		return this._decay;
	}
	set coneCos(value) {
		this.coneCosDirty = true;
		this._coneCos = value;
	}
	get coneCos() {
		return this._coneCos;
	}
	set penumbraCos(value) {
		this.penumbraCosDirty = true;
		this._penumbraCos = value;
	}
	get penumbraCos() {
		return this._penumbraCos;
	}
	private updateConeCosOrPenumbraCos() {
		this._coneCos = Math.cos(this.angle);
		this._penumbraCos = Math.cos(this.angle + this.penumbra);
	}
	update(camera: Camera): void {
		super.update(camera);
		let directional = this.directional.clone();
		const viewMatrix = camera.viewMatrix;
		//this.dirtectVC = directional.transformDirection(viewMatrix);
		this.dirtectVC = directional;
	}
}
//uniform
// color: {},
// position: {},
// direction: {},
// distance: {},
// coneCos: {},
// penumbraCos: {},
// decay: {}
