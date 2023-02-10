import "/styles/main.css";
import { World } from "./world/world";

function main() {
  const container = document.querySelector("#globe-container");
  const world = new World(container);
  world.start();
}

main();
