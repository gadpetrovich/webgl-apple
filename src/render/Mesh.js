import { Matrix } from "./Matrix";

export class Mesh {
  /**
   *
   * @param {Float32Array} positions
   * @param {Float32Array} uv
   */
  constructor({ positions, uv }) {
    this.positions = positions;
    this.uv = uv;
    this.count = this.positions.length / 3;
    this.matrix = new Matrix();
  }

  positionsBuffer;
  uvBuffer;

  #setGeometry = (data) => {
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
  };

  /**
   * @param {WebGLRenderingContext} gl
   */
  attachRender(gl) {
    this.gl = gl;
  }

  initializeBuffers() {
    this.positionsBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionsBuffer);
    this.#setGeometry(this.positions);

    this.uvBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.uvBuffer);
    this.#setGeometry(this.uv);
  }
}
