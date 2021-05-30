import { saveAs } from "file-saver";
import XLSX from "xlsx";

// const s2ab = (s) => {
//   var buf = new ArrayBuffer(s.length);
//   var view = new Uint8Array(buf);
//   for (var i = 0; i != s.length; ++i) {
//     view[i] = s.charCodeAt(i) & 0xff;
//   }
//   return buf;
// };

export const exportAsExcel = (experimentData, fittingData, fileName = new Date().toISOString().split("T")[0]) => {
  if (!experimentData.length || !fittingData.length) {
    if (experimentData) {
      if (!window.confirm("実験データだけの Excel でいいですか？")) {
        return;
      }
    } else {
      console.error("no data! sorry");
      return;
    }
  }
  console.log(experimentData, fittingData);

  let formattedData;
  if (experimentData.length >= fittingData.length) {
    formattedData = experimentData.map((x, i) => {
      if (fittingData.length - 1 >= i) {
        return [...x, ...fittingData[i]];
      } else {
        return [...x, "", ""];
      }
    });
  }else{
    formattedData = fittingData.map((x, i) => {
      if (experimentData.length - 1 >= i) {
        return [...experimentData[i], ...x];
      } else {
        return ["", "", ...x];
      }
    });
  }
  console.log(formattedData)
  console.log("export as excel here");

  const wb = XLSX.utils.book_new();

  const sheet = XLSX.utils.aoa_to_sheet(formattedData);
  XLSX.utils.book_append_sheet(wb, sheet);
  XLSX.writeFile(wb, `${fileName}.xlsx`);
  // document.querySelectorAll("table.table-to-export").forEach(function (currentValue, index) {
  //   // sheet_to_workbook()の実装を参考に記述
  //   var n = currentValue.getAttribute("data-sheet-name");
  //   if (!n) {
  //     n = "Sheet" + index;
  //   }
  //   workbook.SheetNames.push(n);
  //   workbook.Sheets[n] = XLSX.utils.table_to_sheet(currentValue, wopts);
  // });

  // const wbout = XLSX.write(workbook, wopts);

  // saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), `${filename}.xlsx`);
};
