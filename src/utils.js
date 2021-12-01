import { Chart, registerables } from "chart.js";
import AsBind from "as-bind";
import zoomPlugin from "chartjs-plugin-zoom";

Chart.register(zoomPlugin);
Chart.register(...registerables);

const chartJsOptions = {
  devicePixelRatio: 2,
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
      text: "",
      font: {
        size: 18,
      },
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
    borderColor: "#f44336",
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

export const drawData = (ctx, data, shouldUpdate = false) => {
  const D = document.getElementById("D").value; //# 逆線分散 (nm/mm)
  const ICCD_PIXEL = document.getElementById("ppICCD").value; //# pixel per mm on ICCD (mm/pixel)
  const dlICCD = D * ICCD_PIXEL; //# wavelength per pixel on ICCD (nm/pixel)
  const ICCD_CENTER = document.getElementById("ICCD_CENTER").value; //# (pixel) rayleigh center on ICCD
  const baseline = document.getElementById("baseline").value;
  const xAxis = [...Array(data.length).keys()].map((x) => (x - ICCD_CENTER) * dlICCD);
  // TODO 範囲決めれるようにしたいかも
  const allData = xAxis.map((item, i) => [item, data[i][2]]).filter((item) => item[0] < 0.4 && item[0] > -0.4);
  const foramttedData = {
    datasets: [
      {
        label: "data",
        data: allData.map((data) => ({ x: data[0], y: parseFloat(data[1]) + parseFloat(baseline) })),
        fill: false,
        borderColor: "#64b5f6",
        tension: 0.1,
        showLine: true,
        pointBorderWidth: 0,
        pointBackgroundColor: "transparent",
        borderWidth: 1.5,
      },
    ],
  };
  if (shouldUpdate) {
    const chart = myChart;
    if (chart.data.datasets.length >= 2) {
      chart.data.datasets.pop();
    }
    chart.data.datasets.push({
      label: "data",
      data: allData.map((data) => ({ x: data[0], y: parseFloat(data[1]) + parseFloat(baseline) })),
      fill: false,
      borderColor: "#64b5f6",
      tension: 0.1,
      showLine: true,
      pointBorderWidth: 0,
      pointBackgroundColor: "transparent",
      borderWidth: 1.5,
    });
    chart.update();
    return;
  }
  if (myChart) {
    myChart.clear();
    myChart.destroy();
  }
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

const storageAvailable = () => {
  var storage;
  try {
    storage = window["localStorage"];
    var x = "__storage_test__";
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return e instanceof DOMException && (e.code === 22 || e.code === 1014 || e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED") && storage && storage.length !== 0;
  }
};

export const setLocalStorage = (key, value) => {
  if (!storageAvailable()) {
    throw new Error("there is no local storage");
  }
  window.localStorage.setItem(key, value);
  return;
};

export const getLocalStorage = (key) => {
  if (!storageAvailable()) {
    throw new Error("there is no local storage");
  }
  const value = window.localStorage.getItem(key);
  return value;
};

const datan19 = [
  [0.5, 1.0, 1.5, 2.0, 5.0, 7.0, 10.0, 15.0, 23.0, 32.0, 52.0, 74.0, 100.0, 165.0, 235.0, 310.0, 390.0, 475.0, 655.0, 845.0, 1000.0, 1441.0, 1925.0, 2454.0, 3030.0, 3655.0, 4331.0, 5060.0, 5844.0, 6685.0, 7585.0, 8546.0, 10000.0, 20000.0, 50000.0, 100000.0],
  [0.00054005, 0.10523, 0.3871, 0.80533, 2.7098, 4.5245, 6.8702, 9.0401, 12.375, 14.065, 16.321, 17.305, 17.723, 18.661, 20.217, 21.977, 23.949, 26.482, 33.176, 34.816, 35.167, 35.67, 36.137, 36.83, 38.061, 40.154, 42.998, 46.144, 48.907, 50.689, 51.727, 52.385, 53.026, 56.187, 59.965, 61.208],
];

export const linearInterp = (val, arr = datan19) => {
  const endX = arr[0].reduce((acc, cur) => {
    if (acc) return acc;
    if (cur > val) return cur;
  }, undefined);
  const startX = arr[0]
    .slice()
    .reverse()
    .reduce((acc, cur) => {
      if (acc) return acc;
      if (cur <= val) return cur;
    }, undefined);
  const startY = arr[1][arr[0].indexOf(startX)];
  const endY = arr[1][arr[0].indexOf(endX)];
  if (!startY || !endY) return alert("error: 範囲外");
  const answer = startY + ((endY - startY) / (endX - startX)) * (val - startX);
  // console.log(startX, val, endX, startY, answer, endY)
  return answer;
};


