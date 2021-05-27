import { Chart, registerables } from "chart.js";

import zoomPlugin from "chartjs-plugin-zoom";

Chart.register(zoomPlugin);
Chart.register(...registerables);

export const addData = (chart, label, data) => {
  chart.data.labels.push(label);
  chart.data.datasets.forEach((dataset) => {
    dataset.data.push(data);
  });
  chart.update();
};

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      if (fr.readyState !== 2) {
        alert("something gone wrong");
        reject();
      }
      resolve(fr.result);
    };
    fr.onerror = reject;
    // fr.readAsText(file.blob);
    fr.readAsText(file);
  });
};

export const readData = async (input) => {
  if (!input.files.length) return;
  const file = input.files[0];
  let rawData;
  try {
    rawData = await readFile(file);
  } catch (e) {
    alert("error reading data", { e });
    return;
  }
  const vals = rawData
    .split("\r\n")
    .map((item) => item.split(",").map((str) => parseFloat(str.trim())));
  return vals;
};

export const drawData = (ctx, data) => {
  const D = 0.187; //# 逆線分散 (nm/mm)
  const ICCD_PIXEL = 0.013; //# pixel per mm on ICCD (mm/pixel)
  const dlICCD = D * ICCD_PIXEL; //# wavelength per pixel on ICCD (nm/pixel)
  const ICCD_CENTER = 596; //# (pixel) rayleigh center on ICCD
  if (myChart) {
    console.log("destroyed");
    myChart.clear();
    myChart.destroy();
  }
  const xAxis = [...Array(data.length).keys()].map(
    (x) => (x - ICCD_CENTER) * dlICCD
  );
  const allData = xAxis
    .map((item, i) => [item, data[i][2]])
    .filter((item) => item[0] < 0.4 && item[0] > -0.4);
  console.log(allData.length);
  const foramttedData = {
    labels: allData.map((item) => item[0]),
    datasets: [
      {
        label: "data",
        data: allData.map((item) => item[1]),
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
        pointBorderWidth: 0,
        pointBackgroundColor: "transparent",
        borderWidth: 1.5,
      },
    ],
  };
  myChart = new Chart(ctx, {
    type: "line",
    data: foramttedData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxis: {
          type: "linear",
          ticks: {
            callback: (val) => ((val * 200) % 10 == 0 ? val : ""),
          },
        },
      },
      plugins: {
        zoom: {
          pan: {
            enabled: true,
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: false,
            },
            mode: "xy",
          },
        },
      },
    },
  });
  return myChart;
};
import loader from "@assemblyscript/loader";
import AsBind from "as-bind";

// https://github.com/torch2424/wasm-by-example/blob/master/demo-util/
export const wasmBrowserInstantiate = async (wasmModuleUrl, importObject) => {
  let response = undefined;

  if (!importObject) {
    importObject = {
      env: {
        abort: () => console.log("Abort!"),
      },
    };
  }

  // Check if the browser supports streaming instantiation
  // if (WebAssembly.instantiateStreaming) {
  //   // Fetch the module, and instantiate it as it is downloading
  //   response = await WebAssembly.instantiateStreaming(
  //     fetch(wasmModuleUrl),
  //     importObject
  //   );
  // } else {
  // Fallback to using fetch to download the entire module
  // And then instantiate the module
  const fetchAndInstantiateTask = async () => {
    const wasmArrayBuffer = await fetch(wasmModuleUrl).then((response) =>
      response.arrayBuffer()
    );
    return AsBind.instantiate(wasmArrayBuffer, importObject);
  };
  response = await fetchAndInstantiateTask();
  // }
  // const res = await loader.instantiate(fetch(wasmModuleUrl), importObject);

  return response;
};
