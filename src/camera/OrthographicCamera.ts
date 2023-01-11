import Matrix4 from "../math/Matrix4";
import Camera from "./Camera";

export default class OrthographicCamera extends Camera {
  private rightDis: number;
  constructor(
    left: number = -1,
    right: number = 1,
    top: number = 1,
    bottom: number = -1,
    near: number = 0.1,
    far: number = 2000
  ) {
    super();
    this.near = near;
    this.far = far;
    this.left = left;
    this.top = top;
    this.bottom = bottom;
    this.rightDis = right;
  }
  private updateCameraParms() {
    const dx = (this.rightDis - this.left) / 2;
    const dy = (this.top - this.bottom) / 2;
    const cx = (this.rightDis + this.left) / 2;
    const cy = (this.top + this.bottom) / 2;
    return {
      left: cx - dx,
      right: cx + dx,
      top: cy + dy,
      bottom: cy - dy,
    };
  }
  protected updateProjectionMatrix() {
    if (this.projectMatrixDirty) {
      const { left, right, top, bottom } = this.updateCameraParms();
      this.projectionMatrix = Matrix4.makeOrthographic(
        left,
        right,
        top,
        bottom,
        this.near,
        this.far
      );
      this.projectMatrixDirty = false;
    }
  }
}
