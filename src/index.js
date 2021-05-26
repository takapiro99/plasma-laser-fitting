import { readData, drawData } from "./utils";
import { constants } from "./constants";
import { resetZoom } from "chartjs-plugin-zoom";

const hello = () => {
  console.log("hello there");
};

console.log(drawData);

window.readData = readData;
window.constants = constants;
window.hello = hello;
window.drawData = drawData;
window.resetZoom = resetZoom
