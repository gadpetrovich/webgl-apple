/**
 * convert 0xHEXCODE to GL
 * @param {number} hex
 * @returns {number[]}
 */

export const hexToGL = (hex) => [
  ((hex >> 16) & 0xff) / 0xff,
  ((hex >> 8) & 0xff) / 0xff,
  ((hex >> 0) & 0xff) / 0xff
];

/**
 * Создание и компиляция шейдера
 *
 * @param {!WebGLRenderingContext} gl Контекст WebGL
 * @param {string} shaderSource Исходный код шейдера на языке GLSL
 * @param {number} shaderType Тип шейдера, VERTEX_SHADER или FRAGMENT_SHADER.
 * @return {!WebGLShader} Шейдер
 */
function compileShader(gl, shaderSource, shaderType) {
  // создаём объект шейдера
  const shader = gl.createShader(shaderType);

  // устанавливаем исходный код шейдера
  gl.shaderSource(shader, shaderSource);

  // компилируем шейдер
  gl.compileShader(shader);

  // проверяем результат компиляции
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    // Ошибка! Что-то не так на этапе компиляции
    throw new Error(
      "компиляция шейдера не удалась:" + gl.getShaderInfoLog(shader)
    );
  }

  return shader;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLShader} vertexShader
 * @param {WebGLShader} fragmentShader
 * @returns {WebGLProgram}
 */
function createProgram(gl, vertexShader, fragmentShader) {
  // создаём программу
  const program = gl.createProgram();

  // прикрепляем шейдеры
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // компонуем программу
  gl.linkProgram(program);

  // проверяем результат компоновки
  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    // что-то пошло не так на этапе компоновки
    throw new Error(
      "ошибка компоновки программы:" + gl.getProgramInfoLog(program)
    );
  }

  return program;
}

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} vertex
 * @param {string} fragment
 * @returns {WebGLProgram}
 */
export function createProgramFromTexts(gl, vertex, fragment) {
  const vertexShader = compileShader(gl, vertex, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragment, gl.FRAGMENT_SHADER);
  return createProgram(gl, vertexShader, fragmentShader);
}

/**
 *
 * @param {HTMLCanvasElement} canvas
 * @param {number} multiplier
 */
export function resizeCanvasToDisplaySize(canvas, multiplier) {
  multiplier = multiplier || 1;
  multiplier = Math.max(0, multiplier);
  const width = (canvas.clientWidth * multiplier) | 0;
  const height = (canvas.clientHeight * multiplier) | 0;
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    return true;
  }
  return false;
}

export function saveRectAspectRatio(canvas) {
  const { clientWidth, clientHeight } = canvas.parentElement;
  const size = Math.round(
    clientWidth > clientHeight
      ? clientWidth * (clientHeight / clientWidth)
      : clientHeight > clientWidth
      ? clientHeight * (clientWidth / clientHeight)
      : clientHeight
  );
  canvas.style.width = `${size}px`;
  canvas.style.height = `${size}px`;
}
