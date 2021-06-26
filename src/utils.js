import { Chart, registerables } from "chart.js";
import AsBind from "as-bind";
import zoomPlugin from "chartjs-plugin-zoom";

Chart.register(zoomPlugin);
Chart.register(...registerables);

const chartJsOptions = {
  hover: { mode: null },
  showTooltips: false,
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    numbers: { duration: 0 },
    colors: {
      type: "color",
      duration: 500,
      from: "transparent",
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: "Δλ",
        font: {
          size: 18,
        },
      },
      ticks: {
        callback: (val) => ((val * 200) % 10 == 0 ? val : ""),
      },
    },
    y: {
      display: true,
      title: {
        display: true,
        text: "Intensity",
        font: {
          size: 18,
        },
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
    tooltip: {
      enabled: false,
    },
    title: {
      display: true,
      text: new Date().toISOString().split("T").join(" ").slice(0, -8),
    },
  },
};

export const addData = (chart, label, data) => {
  if (chart.data.datasets.length >= 2) {
    chart.data.datasets.shift();
  }
  chart.data.datasets.unshift({
    label: "computed",
    data: label.map((x, i) => ({ x: x, y: data[i] })),
    fill: false,
    borderColor: "#f44336", //,"rgb(200, 10, 10)",
    tension: 0.1,
    showLine: true,
    pointBorderWidth: 0,
    pointBackgroundColor: "transparent",
    borderWidth: 1.5,
    options: {
      plugins: {
        subtitle: {
          display: true,
          text: "Custom Chart Subtitle",
        },
      },
    },
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
  const vals = rawData.split("\r\n").map((item) => item.split(",").map((str) => parseFloat(str.trim())));
  return [vals, file.name];
};

export const drawData = (ctx, data) => {
  const D = 0.187; //# 逆線分散 (nm/mm)
  const ICCD_PIXEL = 0.013; //# pixel per mm on ICCD (mm/pixel)
  const dlICCD = D * ICCD_PIXEL; //# wavelength per pixel on ICCD (nm/pixel)
  const ICCD_CENTER = 596; //# (pixel) rayleigh center on ICCD
  if (myChart) {
    myChart.clear();
    myChart.destroy();
  }
  const xAxis = [...Array(data.length).keys()].map((x) => (x - ICCD_CENTER) * dlICCD);
  // TODO 範囲決めれるようにしたいかも
  const allData = xAxis.map((item, i) => [item, data[i][2]]).filter((item) => item[0] < 1 && item[0] > -1);
  const foramttedData = {
    datasets: [
      {
        label: "data",
        data: allData.map((data, i) => ({ x: data[0], y: data[1] })),
        fill: false,
        borderColor: "#64b5f6", //"rgb(75, 192, 192)",
        tension: 0.1,
        showLine: true,
        pointBorderWidth: 0,
        pointBackgroundColor: "transparent",
        borderWidth: 1.5,
      },
    ],
  };
  myChart = new Chart(ctx, {
    type: "scatter",
    data: foramttedData,
    options: chartJsOptions,
  });
  return myChart;
};

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
  const fetchAndInstantiateTask = async () => {
    const wasmArrayBuffer = await fetch(wasmModuleUrl).then((response) => response.arrayBuffer());
    return AsBind.instantiate(wasmArrayBuffer, importObject);
  };
  response = await fetchAndInstantiateTask();
  return response;
};
