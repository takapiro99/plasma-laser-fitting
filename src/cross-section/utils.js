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
