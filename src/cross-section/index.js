import { readData } from "../utils";
// import { intensity2Color } from "./utils";
// import * as d3 from "d3";
import { saveAs } from "file-saver";
import JSZip from "jszip";

let rawData = null;
let rawFileName = null;

const inputFileAndDraw = (input) => {
  if(!input.files[0].name){
    return
  }
  const filenamechunk = input.files[0].name.split(".")
  console.log()
  if(filenamechunk[filenamechunk.length - 1] !== "txt"){
    input.value = ""
    return alert("this was not .txt file")
  }
  document.getElementById("input-file-status").innerHTML = "input running... please wait";
  setTimeout(() => {
    readData(input)
      .then((d) => {
        const [data, fileName] = d;
        console.log(data, fileName);
        rawData = data;
        rawFileName = fileName.slice(0, -4);
        window.rawData = data;
        window.fileName = fileName;
        document.getElementById("input-file-status").innerHTML = `input complete<br/>total data size: ${data.length} (${Math.round(Math.sqrt(data.length))}^2)`;
        document.getElementById("console").style.pointerEvents = "auto";
        document.getElementById("console").style.color = "inherit";
        document.getElementById("downloadButton").classList.remove("disabled");
        // draw2D(data);
      })
      .catch((e) => {
        console.error(e);
        alert("something went wrong, sorry.  " + e);
      });
  }, 70);
};

window.inputFileAndDraw = inputFileAndDraw;

const downloadZip = () => {
  // e.preventDefault()
  if (!rawData) {
    alert("input file first.");
    return;
  }
  const min = document.getElementById("min").value - 0;
  let max = document.getElementById("max").value - 0;
  const step = document.getElementById("step").value - 0;
  if ((max - min + 1) % step !== 0) {
    if (
      !window.confirm(`${max - min + 1} elements is not indivisible by step: ${step}

automatically adjust and continue anyway?`)
    ) {
      alert("adjust and try again.");
      return;
    } else {
      // adjust max
      const sectionCount = Math.ceil((max - min + 1) / step);
      max = min + step * sectionCount - 1;
    }
  }
  const sectionCount = Math.round((max - min + 1) / step);
  if (sectionCount > 100) {
    alert(`too many sections: ${sectionCount}
over 100 sections will be aborted`);
    return;
  }
  // proceed
  const count = 1024;
  const min_index = min - 1;
  const max_index = max - 1;
  const fixedDataObj = rawData.slice(count * (min - 1), count * max).reduce((acc, cur) => {
    const index = cur[1] - 1 - min_index;
    if (!acc[index]) acc[index] = [];
    acc[index].push(cur);
    return acc;
  }, {});
  const fixedData = Object.values(fixedDataObj)
    .reduce(
      (acc, cur, i) => {
        const index1 = Math.floor(i / step);
        acc[index1].push(cur);
        return acc;
      },
      new Array(sectionCount).fill().map(() => [])
    )
    .map((item) => {
      return item
        .reduce(
          (acc, cur) => {
            cur.forEach((s, i) => (acc[i] += s[2]));
            return acc;
          },
          new Array(count).fill().map(() => 0)
        )
        .map((s) => Math.round(s / step));
    })
    .map((s) => s.map((t, i) => [i + 1, 1, t]));
  // M.toast({ html: "preparing files...", classes: "light-blue lighten-3 black-text" });
  const zip = new JSZip();
  fixedData.forEach((item, i) => {
    zip.file(`${rawFileName}__${min + step * i}_${min + step * (i + 1) - 1}.txt`, `${item.map((s) => s.join(",")).join("\r\n")}\r\n`);
  });
  // M.toast({ html: "zipping...", classes: "light-blue lighten-3 black-text" });
  zip.generateAsync({ type: "blob" }).then((content) => {
    // see FileSaver.js
    saveAs(content, `${rawFileName}__processed__.zip`);
  });
};

window.downloadZip = downloadZip;

// const draw2D = (data) => {
//   // 1. データの準備
//   const width = window.innerWidth * 0.35;
//   const height = width;

//   let formattedData = [];
//   const dataCount = 1024;
//   for (let i = 0; i < dataCount; i++) {
//     formattedData.push(data.slice(i * dataCount, (i + 1) * dataCount).map((s) => s[2]));
//   }
//   // formattedData.push(0)
//   formattedData = formattedData.flat();
//   console.log(formattedData);
//   const svg = d3.select("#heatmap").append("svg").attr("width", width).attr("height", height);

//   // 3. しきい値の設定
//   const thresholds = d3.range(0, 21).map((p) => p * 50); //1000まで

//   // 4. データ変換 // 30,30
//   const _contours = d3.contours().size([1024, 300]).thresholds(thresholds);

//   // 5. カラースケールの設定
//   const color = d3.scaleSequential((t) => intensity2Color(1 - t, 0, 1)).domain([0, 1000]);
//   console.log("hello1");
//   // 6. コンター用SVG要素の設定
//   // return
//   svg
//     .selectAll("path")
//     .data(_contours(formattedData.slice(300000,607200)))
//     .enter()
//     .append("path")
//     .attr("d", d3.geoPath(d3.geoIdentity().scale(width / dataCount)))
//     .attr("fill", (d) => color(d.value));
// };

window.readData = readData;
