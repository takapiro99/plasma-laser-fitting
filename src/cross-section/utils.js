export const _r = (intensity) => {
  const val = intensity / 0.32 - 0.78125;
  if (val <= 0) {
    return 0;
  } else if (val >= 1) {
    return 1;
  }
  return val;
};

export const _g = (intensity) => {
  const val = 2 * intensity - 0.84;
  if (val <= 0) {
    return 0;
  } else if (val >= 1) {
    return 1;
  }
  return val;
};

export const _b = (intensity) => {
  let val;
  if (intensity < 0.25) {
    val = 4 * intensity;
  } else if (intensity < 0.92) {
    val = -2 * intensity + 1.84;
  } else {
    val = intensity / 0.08 - 11.5;
  }
  if (val <= 0) {
    return 0;
  } else if (val >= 1) {
    return 1;
  }
  return val;
};

const rgbStringFromRGB = (r, g, b) => {
  return `rgb(${r}, ${g}, ${b})`;
};

export const intensity2Color = (val, min = 0, max = 1) => {
  if (min > val) return rgbStringFromRGB(_r(0), _g(0), _b(0));
  if (max < val) return rgbStringFromRGB(_r(1), _g(1), _b(1));
  const sVal = 1 - (val - min) / (max - min);
  // https://github.com/matplotlib/matplotlib/blob/master/lib/matplotlib/_cm.py#L142
  const ans = rgbStringFromRGB(Math.floor(_r(sVal) * 255), Math.floor(_g(sVal) * 255), Math.floor(_b(sVal) * 255));
  return ans;
};

// let rawData = null
// const inputFileAndDraw = (input) => {
//   document.getElementById("input-file-status").innerHTML = "input running... please wait"
//   setTimeout(() => {
//     readData(input).then((data) => {
//       console.log(data)
//       // console.log(data.flatMap(x=>x).sort())
//       rawData = Data
//       document.getElementById("input-file-status").innerHTML = "input complete"
//     }).catch((e) => alert("something went wrong, sorry"));
//   }, 70)
// };
