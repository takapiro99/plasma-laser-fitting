import { readData } from "../utils";
import { _r, _g, _b, intensity2Color } from "./utils";
import * as d3 from "d3";

let rawData = null;

const inputFileAndDraw = (input) => {
  document.getElementById("input-file-status").innerHTML = "input running... please wait";
  setTimeout(() => {
    readData(input)
      .then((data) => {
        console.log(data);
        // console.log(data.flatMap(x=>x).sort())
        rawData = data;
        window.rawData = data;
        document.getElementById("input-file-status").innerHTML = "input complete";
        draw2D(data);
      })
      .catch((e) => {
        console.error(e);
        alert("something went wrong, sorry");
      });
  }, 70);
};

window.inputFileAndDraw = inputFileAndDraw;

const draw2D = (data) => {
  // 1. データの準備
  const width = window.innerWidth * 0.35;
  const height = width;

  let formattedData = [];
  const dataCount = 1024;
  for (let i = 0; i < dataCount; i++) {
    formattedData.push(data.slice(i * dataCount, (i + 1) * dataCount).map((s) => s[2]));
  }
  formattedData = formattedData.flat();
  console.log(formattedData)
  const n = 30;
  const m = 30;
  let k = 0;

  // const values = new Array(n * m);
  // for (let j = 0; j < m; ++j) {
  //   for (let i = 0; i < n; ++i) {
  //     const s = (Math.abs(m / 2 - j) + Math.abs(n / 2 - i)) / 30;
  //     values[k] = s * 1000;
  //     ++k;
  //   }
  // }
  // console.log(values)

  const svg = d3.select("#heatmap").append("svg").attr("width", width).attr("height", height);

  // 3. しきい値の設定
  const thresholds = d3.range(0, 21).map((p) => p * 50); //1000まで

  // 4. データ変換 // 30,30
  const _contours = d3.contours().size([dataCount, dataCount]).thresholds(thresholds);

  // 5. カラースケールの設定
  const color = d3.scaleSequential((t) => intensity2Color(1 - t, 0, 1)).domain([0, 1000]);
  console.log("hello1")
  // 6. コンター用SVG要素の設定
  svg
    .selectAll("path")
    .data(_contours(formattedData))
    .enter()
    .append("path")
    .attr("d", d3.geoPath(d3.geoIdentity().scale(width / dataCount)))
    .attr("fill", (d) => color(d.value));
};

window.readData = readData;
