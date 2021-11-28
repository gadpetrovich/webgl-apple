const uv4 = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1]
];
/**
 *
 * @param {string} line
 */
const isVertex = (line) => line[0] === "v";

/**
 *
 * @param {string} line
 */
const isObject = (line) => line[0] === "o";

/**
 *
 * @param {string} line
 */
const isFace = (line) => line[0] === "f";
/**
 *
 * @param {string[]} lines
 */
const parseObj = (lines) =>
  lines.reduce(
    (acc, line) => {
      if (isVertex(line)) {
        acc.vertexes.push(line.split(" ").slice(1).map(Number));
      }
      if (isObject(line)) {
        acc.objects.push([line.slice(1).trim(), []]);
      }
      if (isFace(line)) {
        const lastSelect = acc.objects[acc.objects.length - 1][1];
        lastSelect.push(line.split(/\s+/).slice(1).map(Number));
      }
      return acc;
    },
    { vertexes: [], objects: [] }
  );

export function parseOBJToVVT(obj) {
  const preLines = obj
    .split(/[\r\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length);
  const parsed = parseObj(preLines);

  return parsed.objects.map(([name, parsedFaces]) => {
    const vertexList = parsed.vertexes;
    const filtetered = parsedFaces.filter((is) => is.length < 5);
    const vertexes = filtetered
      .map((is) => {
        const [v0, v1, v2, v3] = is.map((i) => vertexList[i - 1]);
        if (is.length === 3) {
          return [v0, v1, v2];
        }
        return [
          [v0, v1, v2],
          [v0, v2, v3]
        ];
      })
      .flat(4);

    const uv = filtetered
      .map((is, i) => {
        if (is.length === 3) {
          return i % 2 ? [uv4[0], uv4[2], uv4[1]] : [uv4[0], uv4[2], uv4[3]];
        }
        return [
          [uv4[0], uv4[1], uv4[2]],
          [uv4[0], uv4[2], uv4[3]]
        ];
      })
      .flat(4);
    return [name, { vertexes, uv }];
  });
}
