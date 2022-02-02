import { readData, drawData, addData, wasmBrowserInstantiate, getLocalStorage, setLocalStorage, linearInterp } from "./utils";
import { resetZoom } from "chartjs-plugin-zoom";
import { exportAsExcel } from "./excel";

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
    console.error(e)
    alert("failed to load module. please reload.", { e });
  });

const updateStatus = async (text) => {
  document.getElementById("status-text").innerText = text;
};

window.updateStatus = updateStatus;
window.readData = readData;
window.drawData = drawData;
window.addData = addData;
window.resetZoom = resetZoom;
window.exportAsExcel = exportAsExcel;
window.setLocalStorage = setLocalStorage;
window.getLocalStorage = getLocalStorage;
window.linearInterp = linearInterp;
