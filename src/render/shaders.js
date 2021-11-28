const glsl = (x) => x[0];

export const vertex = glsl`#version 100
precision mediump float;
uniform mat4 uMeshMatrix;
uniform mat4 uOrthoMatrix;
uniform mat4 uCameraMatrix;
attribute vec4 aPosition;
attribute vec2 aTextureCoords;
varying vec2 vTextureCoords;
void main(){
    gl_Position = uCameraMatrix * uMeshMatrix * aPosition;
    vTextureCoords = aTextureCoords;
}`;

export const fragment = glsl`#version 100
#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec3 uLineColor;
uniform vec3 uBgColor;
uniform float uLineWidth;
varying vec2 vTextureCoords;
float border(vec2 uv, float uLineWidth, vec2 gap) {
  vec2 xy0 = smoothstep(vec2(uLineWidth) - gap, vec2(uLineWidth) + gap, uv);
  vec2 xy1 = smoothstep(vec2(1. - uLineWidth) - gap, vec2(1. - uLineWidth) + gap, uv);
  vec2 xy = xy0 - xy1;
  return clamp(xy.x * xy.y, 0., 1.);
}
void main() {
  vec2 uv = vTextureCoords;
  vec2 fw = vec2(uLineWidth + 0.05);
  #ifdef GL_OES_standard_derivatives
    fw = fwidth(uv);
  #endif
  float br = border(vTextureCoords, uLineWidth, fw);
  gl_FragColor = vec4(mix(uLineColor, uBgColor, br), 1.);
}`;
