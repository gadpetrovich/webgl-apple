import { glMatrix, mat4, vec3 } from "gl-matrix";

export class Matrix {
  constructor(onUpdate = () => {}) {
    this.onUpdate = onUpdate;
  }

  matrices = {};

  setOrtho(left, right, bottom, top, near, far) {
    if (!this.matrices.ortho) {
      this.matrices.ortho = mat4.create();
    }
    mat4.ortho(this.matrices.ortho, left, right, bottom, top, near, far);
  }

  setScale(ratio) {
    if (!this.matrices.scale) {
      this.matrices.scale = mat4.create();
    }
    mat4.fromScaling(this.matrices.scale, vec3.fromValues(ratio, ratio, ratio));
    this.onUpdate();
  }

  setTranslate(params) {
    if (!this.matrices.translate) {
      this.matrices.translate = mat4.create();
    }
    mat4.fromTranslation(this.matrices.translate, params);
    this.onUpdate();
  }

  setRotateX(deg) {
    if (!this.matrices.rotateX) {
      this.matrices.rotateX = mat4.create();
    }
    mat4.fromXRotation(this.matrices.rotateX, glMatrix.toRadian(deg));
    this.onUpdate();
  }

  setRotateY(deg) {
    if (!this.matrices.rotateY) {
      this.matrices.rotateY = mat4.create();
    }
    mat4.fromYRotation(this.matrices.rotateY, glMatrix.toRadian(deg));
    this.onUpdate();
  }

  setRotateZ(deg) {
    if (!this.matrices.rotateZ) {
      this.matrices.rotateZ = mat4.create();
    }
    mat4.fromZRotation(this.matrices.rotateZ, glMatrix.toRadian(deg));
    this.onUpdate();
  }

  getCurrent() {
    const matrix = mat4.create();
    const matrices = [
      this.matrices.ortho,
      this.matrices.translate,
      this.matrices.rotateZ,
      this.matrices.rotateX,
      this.matrices.rotateY,
      this.matrices.scale
    ].filter(Boolean);
    if (matrices.length === 0) return matrix;
    if (matrices.length === 1) return matrices[0];
    return matrices.reduce((a, b) => mat4.multiply(matrix, a, b));
  }
}
