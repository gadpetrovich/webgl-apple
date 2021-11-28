import "./styles.css";
import appleObj from "./assets/apple.obj"; // в parcel фетчит файлик не нужно, мне сразу дают содержимое файла
import { hexToGL } from "./render/helpers";
import { parseOBJToVVT } from "./render/parser";
import { ModelRender } from "./render/Render";
import animejs from "animejs";

const meshParams = {
  bgColor: hexToGL(0x40cece),
  lineColor: hexToGL(0x2435cf),
  lineWidth: 0.01,
  transforms: {
    scale: () => {
      return 0.9;
    },
    translate: () => {
      return [30, 65, 0];
    }
  }
};

async function render() {
  document.getElementById("root").innerHTML = `
  <div class="container"></div>
  `;
  const apple = await fetch(appleObj)
    .then((r) => r.text())
    .then(parseOBJToVVT)
    .then((entries) =>
      Object.fromEntries(
        entries.map(([name, { vertexes, uv }]) => {
          return [
            name,
            { positions: new Float32Array(vertexes), uv: new Float32Array(uv) }
          ];
        })
      )
    );
  let app = new ModelRender();
  app.holder = document.querySelector(".container");
  app.models = { apple };
  app.modelName = "apple";
  app.meshParams = meshParams;
  app.init();
  const model = app.currentModel();
  model.apple.matrix.setRotateX(-180);
  app.render();

  const targets = { y: 0 };
  animejs({
    targets,
    y: [0, 360],
    duration: 7e3,
    easing: "linear",
    loop: true,
    update() {
      model.apple.matrix.setRotateY(targets.y);
      app.render();
    }
  });
}

render();
