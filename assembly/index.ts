const arrayMax = (arr: Array<f64>): number => arr.reduce((a: number, b: number) => Math.max(a, b), f64.MIN_VALUE);
const arrayMin = (arr: Array<f64>): number => arr.reduce((a: number, b: number) => Math.min(a, b), f64.MAX_VALUE);

/**
 * Produces the same result as numpy.convolve(array, weights, 'same');
 * https://gist.github.com/jhurliman/7273803
 */
const convolve = (array: Array<f64>, weights: Array<f64>): Array<f64> => {
  if (weights.length % 2 !== 1) {
    throw new Error("weights array must have an odd length");
  }
  const al = array.length;
  const wl = weights.length;
  const offset = ~~(wl / 2);
  const output = new Array<f64>(al);
  for (let i = 0; i < al; i++) {
    var kmin = i >= offset ? 0 : offset - i;
    var kmax = i + offset < al ? wl - 1 : al - 1 - i + offset;
    output[i] = 0;
    for (var k = kmin; k <= kmax; k++) output[i] += array[i - offset + k] * weights[k];
  }
  return output;
};

const PI = Math.PI;

// Constants
const C = 3e8; // 光速m/s
const Me = 9.1e-31;
const e = 1.6e-19; // 電子の電荷量
const IPSIRON = 8.85e-12; // 真空の誘電率
const KAPPA = 1.6e-19; // ボルツマン定数 J/eV

// plasma parameter
// const ATOMIC_MASS = 12; // Atomic mass
// const Te = 7; // eV
// const Ti = 7; // eV
// const ne = 3e24; // m^-3
// const Z = 3.2;/
// const ICCD_CENTER = 596; // (pixel) rayleigh center on ICCD
// const DS = 25; // (pm) Doppler shift in wavelength

// Experiment parameter
// const D = 0.187; // 逆線分散 (nm/mm)

// const RSFWHM = 6; // Rayleigh scattering FWHM (pixel)
// const ANGLE_KI_KS = 135; // angle between ki and ks (degree)
// const FWHM = RSFWHM * dlICCD; // 装置関数幅 nm
// const FWHM = RSFWHM * 1; // 装置関数幅 nm
// const HWHM = FWHM / 2;

// Rayleigh scattering calibration
// const IR = 4500; // Rayleigh scattering integrated intensity
const sigma: f64 = 1 / 132; // scattering cross section ratio (Ray/Th) ???
// const ELR = 5; // Laser energy
// const ELT = 5;
// const n0 = 2.5e25; // air density for Rayleigh
// const NR = 100; // accumulation shots
// const NT = 3;

// const CO_EFF = (sigma * n0 * (NR / NT) * (ELR / ELT)) / 0.8 / IR;

// const RADIAN_KI_KS = (ANGLE_KI_KS * 2 * PI) / 360; // radian

const dlmin = -0.2; // nm
const dlmax = 0.2;
const step = 0.0003;

const lamda: f64 = 532; // レーザー波長 nm

// no need to change
// const Mi = ATOMIC_MASS * 1836 * Me;
const ki = (2 * PI) / (lamda * 1e-9); // 入射レーザーの波数 1/m とても大きい
// const KO: f64 = 2 * ki * Math.sin(RADIAN_KI_KS / 2); // 散乱に関わる波数 1/m 大きい

// const a = sqrt((2 * KAPPA * Te) / Me); // 電子の熱速度
// const b = sqrt((2 * KAPPA * Ti) / Mi); // イオンの熱速度

const count: i32 = <i32>ceil((dlmax - dlmin) / step);

// # 横軸（波長シフト）-0.2から0.2まで、0.0003ずつプロット, length = 1334
export function calcYAxis(props: Float64Array): Float64Array {
  // props = [precision, ne, Z, atomic_mass, Te, Ti, center, shiftWaveLength, 逆線分散D, ppmm-ICCD,
  // FHWM, NT, akiks, integratedIntensity, ELR, ELT, airDensity, shots, w_fit_coeff, flag, ne_after]
  const precision = props[0];
  const ne = props[1];
  const Z = props[2];
  const ATOMIC_MASS = props[3];
  const Te = props[4];
  const Ti = props[5];
  const ICCD_CENTER = props[6];
  const DS = props[7];
  const D = props[8];
  const ICCD_PIXEL = props[9];
  const RSFWHM = props[10];
  const NT = props[11];
  const ANGLE_KI_KS = props[12];
  const IR = props[13];
  const ELR = props[14];
  const ELT = props[15];
  const n0 = props[16];
  const NR = props[17];
  const w_fit_coeff = props[18];
  const calcParams = props[19];
  const ne_after = props[20];
  //
  const Mi = ATOMIC_MASS * 1836 * Me;
  const b = sqrt((2 * KAPPA * Ti) / Mi); // イオンの熱速度
  const dlICCD = D * ICCD_PIXEL; // wavelength per pixel on ICCD (nm/pixel)

  const FWHM = RSFWHM * dlICCD; // 装置関数幅 nm
  const HWHM = FWHM / 2;
  const CO_EFF = (sigma * n0 * (NR / NT) * (ELR / ELT)) / 0.8 / IR;
  const RADIAN_KI_KS = (ANGLE_KI_KS * 2 * PI) / 360; // radian
  const KO: f64 = 2 * ki * Math.sin(RADIAN_KI_KS / 2); // 散乱に関わる波数 1/m 大きい
  // from above
  const DEBYE = sqrt((IPSIRON * KAPPA * Te) / (e ** 2 * ne)); // デバイ長 m
  const DEBYE_after = sqrt((IPSIRON * KAPPA * Te) / (e ** 2 * ne_after)); // デバイ長 m
  const ALPHA = 1 / (KO * DEBYE);
  const ALPHA_after = 1 / (KO * DEBYE_after);

  const dl = new Array<f64>(count).map<f64>((_, i) => dlmin + i * step);
  const xiFact = (2 * PI * C * 1e9) / (KO * b * lamda ** 2);
  const xi = new Array<f64>(count);
  for (let i = 0; i < count; i++) {
    xi[i] = dl[i] * xiFact;
  }
  const ximax = arrayMax(xi);
  const ximin = arrayMin(xi);
  const IPVxi = new Array<f64>(count);
  const RPxi = new Array<f64>(count);
  for (let i = 0; i < count; i++) {
    const phi = 0.01 * abs(xi[i]) + 1e-6;
    const dzxi = phi / precision;
    const aa = xi[i] - phi;
    const bb = xi[i] + phi;
    let Imxi: f64 = 0;
    let Ipxi: f64 = 0;
    for (let j = 0; j < Math.floor((xi[i] - phi - (ximin - 1)) / dzxi) + 1; j++) {
      const d = aa - j * dzxi;
      Imxi += (d * Math.exp(-1 * d ** 2)) / (d - xi[i]);
    }
    for (let j = 0; j < Math.floor((ximax + 1 - (xi[i] + phi)) / dzxi) + 1; j++) {
      const d = bb + j * dzxi;
      Ipxi += (d * Math.exp(-1 * d ** 2)) / (d - xi[i]);
    }
    IPVxi[i] = dzxi * (Ipxi + Imxi);
    // # evaluating real pole contribution
    RPxi[i] = 2 * phi * (1 - 2 * xi[i] ** 2);
  }
  // putting together dW/dxi
  const dwXiRe = new Array<f64>(count);
  const dwXiIm = new Array<f64>(count);
  for (let i = 0; i < count; i++) {
    dwXiRe[i] = (RPxi[i] * Math.exp(-1 * xi[i] ** 2) + IPVxi[i]) / sqrt(PI);
    dwXiIm[i] = (-1 * PI * xi[i] * Math.exp(-1 * xi[i] ** 2)) / sqrt(PI);
  }
  // 虚数登場
  const dw = dl.map<f64>((x) => (x * 2 * PI * C * 1e9) / lamda ** 2);

  const fi0 = new Array<f64>(count);
  for (let i = 0; i < count; i++) {
    fi0[i] = sqrt(1 / PI / b ** 2) * Math.exp((-1 * (dw[i] / KO) ** 2) / b ** 2);
  }
  const beta = sqrt((((Z * ALPHA ** 2) / (1 + ALPHA ** 2)) * Te) / Ti);
  const beta_after = sqrt((((Z * ALPHA_after ** 2) / (1 + ALPHA_after ** 2)) * Te) / Ti);

  const icont = new Array<f64>(count);
  const icont_after = new Array<f64>(count);
  const icontFact = Z * (ALPHA ** 2 / (1 + ALPHA ** 2)) ** 2;
  const icontFact_after = Z * (ALPHA_after ** 2 / (1 + ALPHA_after ** 2)) ** 2;

  for (let i = 0; i < count; i++) {
    icont[i] = (icontFact * fi0[i]) / ((1 + beta ** 2 * dwXiRe[i]) ** 2 + (beta ** 2 * dwXiIm[i]) ** 2);
  }

  // const inst = dl.map<f64>((x) => Math.exp((-0.5 / HWHM ** 2) * x ** 2)); // 装置関数
  let inst = new Array<f64>(dl.length);
  for (let i = 0; i < inst.length; i++) {
    inst[i] = Math.exp((-0.5 / HWHM ** 2) * dl[i] ** 2);
  }

  if (count % 2 == 0) {
    icont.push(0);
    inst.push(0);
  }

  const w = convolve(icont, inst);
  // y軸
  let _w_fit = new Array<number>(count);
  for (let i = 0; i < count; i++) {
    _w_fit[i] = w[i] * w_fit_coeff;
  }
  // const _w_fit = w.map<f64>((x) => x * w_fit_coeff);
  const w_fit = new Float64Array(count);
  for (let i = 0; i < count; i++) {
    w_fit[i] = _w_fit[i];
  }

  if (calcParams) {
    for (let i = 0; i < count; i++) {
      icont_after[i] = (icontFact_after * fi0[i]) / ((1 + beta_after ** 2 * dwXiRe[i]) ** 2 + (beta_after ** 2 * dwXiIm[i]) ** 2);
    }
    let inst_after = new Array<f64>(dl.length);
    for (let i = 0; i < inst_after.length; i++) {
      inst_after[i] = Math.exp((-0.5 / HWHM ** 2) * dl[i] ** 2);
    }
    if (count % 2 == 0) {
      icont_after.push(0);
      inst_after.push(0);
    }
    const w_after = convolve(icont_after, inst_after);
    // const _w_fit = w_after.map<f64>((x) => x * w_fit_coeff);
    let _w_fit_after = new Array<number>(count);
    for (let i = 0; i < count; i++) {
      _w_fit_after[i] = w_after[i] * w_fit_coeff;
    }
    const w_fit_after = new Float64Array(count);
    for (let i = 0; i < count; i++) {
      w_fit_after[i] = _w_fit_after[i];
    }
    let fitarea = new Array<f64>(count);
    let fitarea_after = new Array<f64>(count);
    for (let i = 0; i < count; i++) {
      fitarea[i] = (w_fit[i] * 3e-4) / dlICCD;
      fitarea_after[i] = (w_fit_after[i] * 3e-4) / dlICCD;
    }
    let fitarea_sum: f64 = 0; //fitarea.reduce<f64>((a,b)=>a+b, 0)
    let fitarea_after_sum: f64 = 0; // fitarea_after.reduce<f64>((a,b)=>a+b, 0)
    for (let i = 0; i < count; i++) {
      fitarea_sum += fitarea[i];
      fitarea_after_sum += fitarea_after[i];
    }
    // const fitarea = w_fit.map((x) => (x * 3e-4) / dlICCD).reduce((a, b) => a + b, 0); //sum(list(map(lambda x: x * 3e-4/dlICCD, w_fit)))
    // const fitarea_after = w_fit_after.map((x) => (x * 3e-4) / dlICCD).reduce((a, b) => a + b, 0); //sum(list(map(lambda x: x * 3e-4/dlICCD, w_fit)))
    const ne_real = fitarea_sum * CO_EFF;
    const ne_real_after = fitarea_after_sum * CO_EFF;
    let params = new Float64Array(12);
    // params[0] = ne_real;
    // params[1] = ne_real_after;
    params[0] = fitarea_sum;
    params[1] = fitarea_after_sum;
    params[2] = CO_EFF;
    params[3] = sigma;
    params[4] = n0;
    params[5] = NR;
    params[6] = NT;
    params[7] = ELR;
    params[8] = ELT;
    params[9] = IR;
    params[10] = ne_real;
    params[11] = ne_real_after;
    // const CO_EFF = (sigma * n0 * (NR / NT) * (ELR / ELT)) / 0.8 / IR;
    return params;
  }

  // n_e     : 3e+24
  // n_e_real: 1.1789734655122692e+25
  // Te      : 7
  // Vs      : 19936.28441855617
  // Z       : 3.2

  return w_fit;
}

/**
 * calculates x axis
 * @param props Array
 * @returns dl_fit
 */
export function calcXAxis(props: Float64Array): Float64Array {
  const DS = props[0];
  const dl = new Array<f64>(count).map<f64>((_, i) => dlmin + i * step);
  const dl_fit = new Float64Array(count);
  for (let j = 0; j < count; j++) {
    dl_fit[j] = dl[j] - DS * 1e-3;
  }
  return dl_fit;
}
