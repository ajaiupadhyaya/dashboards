// Black-Scholes Options Pricing Model

export function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x);
  const t = 1.0 / (1.0 + p * absX);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return 0.5 * (1 + sign * y);
}

export function normalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export interface BSInputs {
  S: number;  // Spot price
  K: number;  // Strike price
  T: number;  // Time to expiration (years)
  r: number;  // Risk-free rate (decimal)
  sigma: number;  // Volatility (decimal)
  type: "call" | "put";
}

export interface BSResult {
  price: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
  d1: number;
  d2: number;
}

export function blackScholes(inputs: BSInputs): BSResult {
  const { S, K, T, r, sigma, type } = inputs;
  if (T <= 0) {
    const intrinsic = type === "call" ? Math.max(S - K, 0) : Math.max(K - S, 0);
    return { price: intrinsic, delta: type === "call" ? (S > K ? 1 : 0) : (S < K ? -1 : 0), gamma: 0, theta: 0, vega: 0, rho: 0, d1: 0, d2: 0 };
  }

  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);

  let price: number, delta: number, rho: number;
  if (type === "call") {
    price = S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
    delta = normalCDF(d1);
    rho = K * T * Math.exp(-r * T) * normalCDF(d2) / 100;
  } else {
    price = K * Math.exp(-r * T) * normalCDF(-d2) - S * normalCDF(-d1);
    delta = normalCDF(d1) - 1;
    rho = -K * T * Math.exp(-r * T) * normalCDF(-d2) / 100;
  }

  const gamma = normalPDF(d1) / (S * sigma * Math.sqrt(T));
  const theta = type === "call"
    ? (-(S * normalPDF(d1) * sigma) / (2 * Math.sqrt(T)) - r * K * Math.exp(-r * T) * normalCDF(d2)) / 365
    : (-(S * normalPDF(d1) * sigma) / (2 * Math.sqrt(T)) + r * K * Math.exp(-r * T) * normalCDF(-d2)) / 365;
  const vega = S * Math.sqrt(T) * normalPDF(d1) / 100;

  return {
    price: +price.toFixed(4),
    delta: +delta.toFixed(4),
    gamma: +gamma.toFixed(6),
    theta: +theta.toFixed(4),
    vega: +vega.toFixed(4),
    rho: +rho.toFixed(4),
    d1: +d1.toFixed(4),
    d2: +d2.toFixed(4),
  };
}

export function generateOptionsChain(S: number, T: number, r: number, sigma: number) {
  const strikes = [];
  for (let i = -6; i <= 6; i++) {
    strikes.push(Math.round(S + i * (S * 0.025)));
  }
  return strikes.map((K) => {
    const call = blackScholes({ S, K, T, r, sigma, type: "call" });
    const put = blackScholes({ S, K, T, r, sigma, type: "put" });
    const moneyness = S >= K ? "ITM" : "OTM";
    return {
      strike: K,
      callPrice: call.price,
      callDelta: call.delta,
      callGamma: call.gamma,
      callTheta: call.theta,
      callIV: +(sigma * (0.95 + Math.abs(K - S) / S * 0.5) * 100).toFixed(1),
      callOI: Math.floor(5000 + Math.random() * 50000),
      putPrice: put.price,
      putDelta: put.delta,
      putGamma: put.gamma,
      putTheta: put.theta,
      putIV: +(sigma * (0.95 + Math.abs(K - S) / S * 0.5) * 100).toFixed(1),
      putOI: Math.floor(5000 + Math.random() * 50000),
      moneyness,
      atm: Math.abs(K - S) < S * 0.025,
    };
  });
}

export function generatePayoffData(S: number, K: number, premium: number, type: "call" | "put") {
  const range = [];
  for (let price = S * 0.7; price <= S * 1.3; price += S * 0.02) {
    let payoff: number;
    if (type === "call") {
      payoff = Math.max(price - K, 0) - premium;
    } else {
      payoff = Math.max(K - price, 0) - premium;
    }
    range.push({ price: +price.toFixed(2), payoff: +payoff.toFixed(2) });
  }
  return range;
}

// DCF Model
export interface DCFInputs {
  revenue: number;
  revenueGrowthRates: number[];  // per year
  ebitdaMargins: number[];
  daPercent: number;
  capexPercent: number;
  nwcChangePercent: number;
  taxRate: number;
  wacc: number;
  terminalGrowthRate: number;
  netDebt: number;
  sharesOutstanding: number;
}

export function runDCF(inputs: DCFInputs) {
  const {
    revenue, revenueGrowthRates, ebitdaMargins, daPercent, capexPercent,
    nwcChangePercent, taxRate, wacc, terminalGrowthRate, netDebt, sharesOutstanding,
  } = inputs;

  const years = revenueGrowthRates.length;
  const projections = [];
  let rev = revenue;

  let pvFCF = 0;
  for (let i = 0; i < years; i++) {
    rev = rev * (1 + revenueGrowthRates[i] / 100);
    const ebitda = rev * ebitdaMargins[i] / 100;
    const da = rev * daPercent / 100;
    const ebit = ebitda - da;
    const nopat = ebit * (1 - taxRate / 100);
    const capex = rev * capexPercent / 100;
    const nwcChange = rev * nwcChangePercent / 100;
    const fcf = nopat + da - capex - nwcChange;
    const pv = fcf / Math.pow(1 + wacc / 100, i + 1);
    pvFCF += pv;

    projections.push({
      year: `Year ${i + 1}`,
      revenue: +rev.toFixed(0),
      ebitda: +ebitda.toFixed(0),
      ebitdaMargin: ebitdaMargins[i],
      fcf: +fcf.toFixed(0),
      pvFCF: +pv.toFixed(0),
    });
  }

  const terminalFCF = projections[years - 1].fcf * (1 + terminalGrowthRate / 100);
  const terminalValue = terminalFCF / (wacc / 100 - terminalGrowthRate / 100);
  const pvTerminal = terminalValue / Math.pow(1 + wacc / 100, years);
  const enterpriseValue = pvFCF + pvTerminal;
  const equityValue = enterpriseValue - netDebt;
  const impliedPrice = equityValue / sharesOutstanding;

  return {
    projections,
    pvFCF: +pvFCF.toFixed(0),
    pvTerminal: +pvTerminal.toFixed(0),
    terminalValue: +terminalValue.toFixed(0),
    enterpriseValue: +enterpriseValue.toFixed(0),
    equityValue: +equityValue.toFixed(0),
    impliedPrice: +impliedPrice.toFixed(2),
  };
}

export function runSensitivityAnalysis(
  baseInputs: DCFInputs,
  waccRange: number[],
  tgrRange: number[]
) {
  return waccRange.map((wacc) => {
    const row: Record<string, number | string> = { wacc: `${wacc.toFixed(1)}%` };
    tgrRange.forEach((tgr) => {
      const result = runDCF({ ...baseInputs, wacc, terminalGrowthRate: tgr });
      row[`tgr_${tgr}`] = result.impliedPrice;
    });
    return row;
  });
}
