import { utils, writeFile } from "xlsx";

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

  let formattedData;
  if (experimentData.length >= fittingData.length) {
    formattedData = experimentData.map((x, i) => {
      if (fittingData.length - 1 >= i) {
        return [...x, ...fittingData[i]];
      } else {
        return [...x];
      }
    });
  } else {
    formattedData = fittingData.map((x, i) => {
      if (experimentData.length - 1 >= i) {
        return [...experimentData[i], ...x];
      } else {
        return ["", "", ...x];
      }
    });
  }
  const workbook = utils.book_new();
  const sheet = utils.aoa_to_sheet(formattedData.unshift(["実験データ", "", "フィッティングしたデータ"]));

  utils.book_append_sheet(workbook, sheet);
  writeFile(workbook, `${fileName}.xlsx`);
};
