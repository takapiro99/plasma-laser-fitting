import { readData, drawData, wasmBrowserInstantiate } from "./utils";
import { constants } from "./constants";
import { resetZoom } from "chartjs-plugin-zoom";

const loadWasm = async () => {
  const wasmModule = await wasmBrowserInstantiate("./optimized.wasm");
  window.calculate1 = wasmModule.exports.calculate1;
  // const arrPtr = calculate1(1); // pin if necessary
  // console.log("hello", arrPtr);
};

loadWasm().then(() => {
  console.log("loaded");
});

window.readData = readData;
window.constants = constants;
window.drawData = drawData;
window.resetZoom = resetZoom;
