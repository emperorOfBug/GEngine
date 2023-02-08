import Camera from "../camera/Camera";
import { Material } from "../material/Material";
import { Mesh } from "../mesh/Mesh";
import Context from "../render/Context";
import DrawCommand from "../render/DrawCommand";
export default class RenderQueue {
  public pre: Array<Mesh>;
  public opaque: Array<Mesh>;
  public transparent: Array<Mesh>;
  public compute: Array<Mesh>;
  constructor() {
    this.pre = [];
    this.opaque = [];
    this.transparent = [];
    this.compute = [];
  }
  sort() {
    RenderQueue.sort(
      this.opaque,
      0,
      this.opaque.length,
      RenderQueue._compareFromNearToFar
    );
    RenderQueue.sort(
      this.transparent,
      0,
      this.transparent.length,
      RenderQueue._compareFromFarToNear
    );
  }
  opaqueRender(
    camera: Camera,
    context: Context,
    passEncoder?: GPURenderPassEncoder,
    replaceMaterial?: Material
  ) {
    this.opaque.map((mesh) => {
      mesh.beforeRender();
      RenderQueue.excuteCommand(
        mesh.getDrawCommand(replaceMaterial),
        context,
        passEncoder,
        camera
      );
      mesh.afterRender();
    });
  }
  transparentRender(
    camera: Camera,
    context: Context,
    passEncoder?: GPURenderPassEncoder,
    replaceMaterial?: Material
  ) {
    this.transparent.map((mesh) => {
      mesh.beforeRender();
      RenderQueue.excuteCommand(
        mesh.getDrawCommand(replaceMaterial),
        context,
        passEncoder,
        camera
      );
      mesh.afterRender();
    });
  }
  computeRender(
    camera: Camera,
    context: Context,
    passEncoder?: GPURenderPassEncoder,
    replaceMaterial?: Material
  ) {
    this.compute.map((mesh) => {
      mesh.beforeRender();
      RenderQueue.excuteCommand(
        mesh.getDrawCommand(),
        context,
        passEncoder,
        camera
      );
      mesh.afterRender();
    });
  }
  preRender(
    camera: Camera,
    context: Context,
    passEncoder?: GPURenderPassEncoder,
    replaceMaterial?: Material
  ) {
    this.pre.map((mesh) => {
      mesh.beforeRender();
      RenderQueue.excuteCommand(
        mesh.getDrawCommand(),
        context,
        passEncoder,
        camera
      );
      mesh.afterRender();
    });
  }
  static excuteCommand(
    command: DrawCommand,
    context?: Context,
    passEncoder?: GPURenderPassEncoder,
    camera?: Camera
  ) {
    if (command.renderTarget) {
      const currentRenderPassEncoder =
        command.renderTarget.beginRenderPassEncoder(context);
      context.render(command, currentRenderPassEncoder, camera);
      command.renderTarget.endRenderPassEncoder();
    } else {
      context.render(command, passEncoder, camera);
    }
  }
  reset() {
    this.pre = [];
    this.opaque = [];
    this.transparent = [];
    this.compute = [];
  }
  static _compareFromNearToFar(a: Mesh, b: Mesh): number {
    return a.priority - b.priority || a.distanceToCamera - b.distanceToCamera;
  }

  static _compareFromFarToNear(a: Mesh, b: Mesh): number {
    return a.priority - b.priority || b.distanceToCamera - a.distanceToCamera;
  }
  //according to camera distance
  static sort<T>(
    insatnce: T[],
    from: number,
    to: number,
    compareFunc: Function
  ): void {
    RenderQueue._quickSort(insatnce, from, to, compareFunc);
  }
  //from https://github.com/oasis-engine/engine/blob/main/packages/core/src/RenderPipeline/RenderQueue.ts
  private static _quickSort<T>(
    a: T[],
    from: number,
    to: number,
    compareFunc: Function
  ): void {
    while (true) {
      // Insertion sort is faster for short arrays.
      if (to - from <= 10) {
        RenderQueue._insertionSort(a, from, to, compareFunc);
        return;
      }
      const third_index = (from + to) >> 1;
      // Find a pivot as the median of first, last and middle element.
      let v0 = a[from];
      let v1 = a[to - 1];
      let v2 = a[third_index];
      const c01 = compareFunc(v0, v1);
      if (c01 > 0) {
        // v1 < v0, so swap them.
        const tmp = v0;
        v0 = v1;
        v1 = tmp;
      } // v0 <= v1.
      const c02 = compareFunc(v0, v2);
      if (c02 >= 0) {
        // v2 <= v0 <= v1.
        const tmp = v0;
        v0 = v2;
        v2 = v1;
        v1 = tmp;
      } else {
        // v0 <= v1 && v0 < v2
        const c12 = compareFunc(v1, v2);
        if (c12 > 0) {
          // v0 <= v2 < v1
          const tmp = v1;
          v1 = v2;
          v2 = tmp;
        }
      }
      // v0 <= v1 <= v2
      a[from] = v0;
      a[to - 1] = v2;
      const pivot = v1;
      let low_end = from + 1; // Upper bound of elements lower than pivot.
      let high_start = to - 1; // Lower bound of elements greater than pivot.
      a[third_index] = a[low_end];
      a[low_end] = pivot;

      // From low_end to i are elements equal to pivot.
      // From i to high_start are elements that haven't been compared yet.
      partition: for (let i = low_end + 1; i < high_start; i++) {
        let element = a[i];
        let order = compareFunc(element, pivot);
        if (order < 0) {
          a[i] = a[low_end];
          a[low_end] = element;
          low_end++;
        } else if (order > 0) {
          do {
            high_start--;
            if (high_start == i) break partition;
            const top_elem = a[high_start];
            order = compareFunc(top_elem, pivot);
          } while (order > 0);
          a[i] = a[high_start];
          a[high_start] = element;
          if (order < 0) {
            element = a[i];
            a[i] = a[low_end];
            a[low_end] = element;
            low_end++;
          }
        }
      }
      if (to - high_start < low_end - from) {
        this._quickSort(a, high_start, to, compareFunc);
        to = low_end;
      } else {
        this._quickSort(a, from, low_end, compareFunc);
        from = high_start;
      }
    }
  }
  private static _insertionSort<T>(
    a: T[],
    from: number,
    to: number,
    compareFunc: Function
  ): void {
    for (let i = from + 1; i < to; i++) {
      let j;
      const element = a[i];
      for (j = i - 1; j >= from; j--) {
        const tmp = a[j];
        const order = compareFunc(tmp, element);
        if (order > 0) {
          a[j + 1] = tmp;
        } else {
          break;
        }
      }
      a[j + 1] = element;
    }
  }
}
