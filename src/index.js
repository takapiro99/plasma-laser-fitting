import { readData, drawData, wasmBrowserInstantiate } from "./utils";
import { resetZoom } from "chartjs-plugin-zoom";

const loadWasm = async () => {
  const wasmModule = await wasmBrowserInstantiate("./optimized.wasm");
  console.log(wasmModule)
  window.calcXAxis = wasmModule.exports.calcXAxis;
  window.calcYAxis = wasmModule.exports.calcYAxis;
};

loadWasm().then(() => {
  console.log("loaded");
});

window.readData = readData;
window.drawData = drawData;
window.resetZoom = resetZoom;
