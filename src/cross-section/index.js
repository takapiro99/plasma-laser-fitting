import { readData } from "../utils";
// import { intensity2Color } from "./utils";
// import * as d3 from "d3";
import { saveAs } from "file-saver";
import JSZip from "jszip";

let rawData = null;
let rawFileName = null;

const sleep = async (msec) => new Promise((resolve) => setTimeout(resolve, msec));

const inputFileAndDraw = async (input) => {
  if (!input.files[0].name) {
    return alert("was not a file.");
  }
  const filenamechunk = input.files[0].name.split(".");
  if (filenamechunk[filenamechunk.length - 1] !== "txt") {
    input.value = "";
    return alert("this was not .txt file");
  }
  document.getElementById("input-file-status").innerHTML = "input running... please wait";
  sleep(80);
  // setTimeout(() => {
  try {
    const d = await readData(input);
    // .then((d) => {
    const [data, fileName] = d;
    console.log(data, fileName);
    rawData = data;
    rawFileName = fileName.slice(0, -4);
    window.rawData = data;
    window.fileName = fileName;
    document.getElementById("input-file-status").innerHTML = `input complete<br/>total data size: ${data.length} (${Math.round(Math.sqrt(data.length))}^2)<br/><b style="color:tomato">${data.length !== 1048577 ? "1024*1024ではありません。OK?" : ""}</b>`;
    document.getElementById("console").style.pointerEvents = "auto";
    document.getElementById("console").style.color = "inherit";
    document.getElementById("downloadButton").classList.remove("disabled");
    // draw2D(data);
    return true;
    // })
  } catch (e) {
    console.error(e);
    alert("something went wrong, sorry.  " + e);
    return false;
  }
  // .catch((e) => {
  // });
  // }, 70);
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
window.readData = readData;

const changeMode = (mode) => {
  console.log(mode);
  if (mode === "draw") {
    drawMode = true;
    document.getElementById("draw").classList.add("active");
    document.getElementById("move").classList.remove("active");
    canvas.style.cursor = "crosshair";
  } else if (mode === "move") {
    drawMode = false;
    document.getElementById("draw").classList.remove("active");
    document.getElementById("move").classList.add("active");
    canvas.style.cursor = "move";
  }
};

window.changeMode = changeMode;

import { data } from "./data";

window.data = data