import { mat4 } from "gl-matrix";

import { Mesh } from "./Mesh";
import { Matrix } from "./Matrix";
import { vertex, fragment } from "./shaders";
import {
  createProgramFromTexts,
  resizeCanvasToDisplaySize,
  saveRectAspectRatio
} from "./helpers";

export class ModelRender {
  canvas = document.createElement("canvas");
  #gl =
    this.canvas.getContext("webgl") ||
    this.canvas.getContext("experimental-webgl");
  #derivatives = this.#gl.getExtension("OES_standard_derivatives");

  #program = createProgramFromTexts(this.#gl, vertex, fragment);
  #loseContext = this.#gl.getExtension("WEBGL_lose_context");

  #attrs = {
    position: this.#gl.getAttribLocation(this.#program, "aPosition"),
    textureCoords: this.#gl.getAttribLocation(this.#program, "aTextureCoords")
  };

  #uniforms = {
    meshMatrixLocation: this.#gl.getUniformLocation(
      this.#program,
      "uMeshMatrix"
    ),
    uCameraMatrixLocation: this.#gl.getUniformLocation(
      this.#program,
      "uCameraMatrix"
    ),
    uLineColorLocation: this.#gl.getUniformLocation(
      this.#program,
      "uLineColor"
    ),
    uBgColorLocation: this.#gl.getUniformLocation(this.#program, "uBgColor"),
    uLineWidthLocation: this.#gl.getUniformLocation(this.#program, "uLineWidth")
  };

  constructor() {
    const gl = this.#gl;
    gl.enable(gl.DEPTH_TEST);
    gl.useProgram(this.#program);
    gl.enableVertexAttribArray(this.#attrs.position);
    gl.enableVertexAttribArray(this.#attrs.textureCoords);
  }

  meshesByType = {};
  models = {};

  #initializeModel = (type) => {
    if (this.meshesByType[type] || !(type in this.models)) return;
    this.meshesByType[type] = {};
    /**
     * @type {Object<string, Mesh>}
     */
    const models = this.models[type];
    const gl = this.#gl;

    Object.entries(models).forEach(([key, data]) => {
      const mesh = new Mesh(data);
      mesh.attachRender(gl);
      mesh.initializeBuffers();
      this.meshesByType[type][key] = mesh;
    });
  };

  /** @type {HTMLElement} */
  holder;

  #modelName;
  set modelName(type) {
    this.#modelName = type;
    this.#initializeModel(type);
  }

  /**
   *
   * @returns {Object<string, Mesh>}
   */
  currentModel = () => this.meshesByType[this.#modelName];

  meshParams = {
    bgColor: 0,
    lineColor: 0,
    lineWidth: 0.01,
    transforms: {
      scale: () => 1,
      transforms: () => [0, 0, 0]
    }
  };

  resize = (resizeMetrics) => {
    saveRectAspectRatio(this.canvas);
    resizeCanvasToDisplaySize(this.canvas, window.devicePixelRatio);
    this.#gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    this.cameraMatrix.setScale(this.meshParams.transforms.scale(resizeMetrics));
    this.cameraMatrix.setTranslate(
      this.meshParams.transforms.translate(resizeMetrics)
    );
    this.#cameraMatrix = this.cameraMatrix.getCurrent();
  };

  cameraMatrix = new Matrix(() => {
    this.#cameraMatrix = this.cameraMatrix.getCurrent();
  });

  #cameraMatrix = mat4.create();
  resize = () => {
    saveRectAspectRatio(this.canvas);
    resizeCanvasToDisplaySize(this.canvas, window.devicePixelRatio);
    this.#gl.viewport(0, 0, this.canvas.width, this.canvas.height);

    this.cameraMatrix.setScale(this.meshParams.transforms.scale());
    this.cameraMatrix.setTranslate(this.meshParams.transforms.translate());
    this.#cameraMatrix = this.cameraMatrix.getCurrent();
  };

  init() {
    const gl = this.#gl;
    this.holder.appendChild(this.canvas);
    this.cameraMatrix.setOrtho(0, 70, 70, 0, 120, -120);
    this.resize();

    const {
      uLineColorLocation,
      uBgColorLocation,
      uLineWidthLocation
    } = this.#uniforms;
    gl.uniform3fv(uLineColorLocation, this.meshParams.lineColor);
    gl.uniform3fv(uBgColorLocation, this.meshParams.bgColor);
    gl.uniform1f(uLineWidthLocation, this.meshParams.lineWidth);
  }

  /**
   * @param {Mesh} mesh
   */
  #renderMesh = (mesh) => {
    const gl = this.#gl;
    const { position, textureCoords } = this.#attrs;
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positionsBuffer);
    gl.vertexAttribPointer(position, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvBuffer);
    gl.vertexAttribPointer(textureCoords, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix4fv(
      this.#uniforms.meshMatrixLocation,
      false,
      mesh.matrix.getCurrent()
    );
    gl.drawArrays(gl.TRIANGLES, 0, mesh.count);
  };

  render() {
    const gl = this.#gl;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.uniformMatrix4fv(
      this.#uniforms.uCameraMatrixLocation,
      false,
      this.#cameraMatrix
    );

    const meshes = this.currentModel();
    Object.values(meshes).forEach(this.#renderMesh);
  }

  destroy = () => {
    if (this.#loseContext) {
      this.#loseContext.loseContext();
    }
  };
}
