import { readData, drawData, addData, wasmBrowserInstantiate } from "./utils";
import { resetZoom } from "chartjs-plugin-zoom";

const loadWasm = async () => {
  const wasmModule = await wasmBrowserInstantiate("./optimized.wasm");
  window.calcXAxis = wasmModule.exports.calcXAxis;
  window.calcYAxis = wasmModule.exports.calcYAxis;
};

loadWasm()
  .then(() => {
    console.log("loaded");
  })
  .catch((e) => {
    alert("failed to load module", { e });
  });

window.readData = readData;
window.drawData = drawData;
window.addData = addData;
window.resetZoom = resetZoom;
