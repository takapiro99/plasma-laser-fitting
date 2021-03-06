// color mode の配色は、gnuplot2 というもの
// https://github.com/matplotlib/matplotlib/blob/f6e0ee49c598f59c6e6cf4eefe473e4dc634a58a/lib/matplotlib/_cm.py#L166

const _r = (intensity) => {
  const val = intensity / 0.32 - 0.78125;
  if (val <= 0) {
    return 0;
  } else if (val >= 1) {
    return 1;
  }
  return val;
};

const _g = (intensity) => {
  const val = 2 * intensity - 0.84;
  if (val <= 0) {
    return 0;
  } else if (val >= 1) {
    return 1;
  }
  return val;
};

const _b = (intensity) => {
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

window._r = _r;
window._g = _g;
window._b = _b;
