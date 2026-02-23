// Mock/simulated financial data

export function generateOHLCData(
  days = 252,
  startPrice = 150,
  volatility = 0.02,
  drift = 0.0003
) {
  const data = [];
  let price = startPrice;
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const open = price;
    const change = price * (drift + volatility * (Math.random() * 2 - 1));
    const close = price + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const volume = Math.floor(1e7 + Math.random() * 5e7);

    data.push({
      date: date.toISOString().split("T")[0],
      open: +open.toFixed(2),
      high: +high.toFixed(2),
      low: +low.toFixed(2),
      close: +close.toFixed(2),
      volume,
    });

    price = close;
  }
  return data;
}

// Simple Moving Average
export function sma(data: number[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null;
    const slice = data.slice(i - period + 1, i + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

// Exponential Moving Average
export function ema(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const result: (number | null)[] = [];
  let prev: number | null = null;
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    if (i === period - 1) {
      const seed = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
      result.push(seed);
      prev = seed;
      continue;
    }
    const val: number = data[i] * k + (prev as number) * (1 - k);
    result.push(val);
    prev = val;
  }
  return result;
}

// RSI
export function rsi(prices: number[], period = 14): (number | null)[] {
  const result: (number | null)[] = new Array(period).fill(null);
  for (let i = period; i < prices.length; i++) {
    const changes = prices.slice(i - period, i + 1).map((p, j, arr) =>
      j === 0 ? 0 : p - arr[j - 1]
    ).slice(1);
    const gains = changes.filter((c) => c > 0);
    const losses = changes.filter((c) => c < 0).map((c) => Math.abs(c));
    const avgGain = gains.reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.reduce((a, b) => a + b, 0) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(100 - 100 / (1 + rs));
  }
  return result;
}

// Bollinger Bands
export function bollingerBands(prices: number[], period = 20, stdDev = 2) {
  const middle = sma(prices, period);
  return middle.map((mid, i) => {
    if (mid === null || i < period - 1) return { upper: null, middle: null, lower: null };
    const slice = prices.slice(i - period + 1, i + 1);
    const variance = slice.reduce((acc, p) => acc + Math.pow(p - (mid as number), 2), 0) / period;
    const std = Math.sqrt(variance);
    return {
      upper: +(mid + stdDev * std).toFixed(2),
      middle: +mid.toFixed(2),
      lower: +(mid - stdDev * std).toFixed(2),
    };
  });
}

// MACD
export function macd(prices: number[], fast = 12, slow = 26, signal = 9) {
  const emaFast = ema(prices, fast);
  const emaSlow = ema(prices, slow);
  const macdLine = emaFast.map((f, i) => {
    if (f === null || emaSlow[i] === null) return null;
    return +(f - (emaSlow[i] as number)).toFixed(4);
  });
  const validMacd = macdLine.filter((v) => v !== null) as number[];
  const signalLine: (number | null)[] = new Array(macdLine.length - validMacd.length).fill(null);
  const signalEma = ema(validMacd, signal);
  signalLine.push(...signalEma);
  const histogram = macdLine.map((m, i) => {
    if (m === null || signalLine[i] === null) return null;
    return +((m as number) - (signalLine[i] as number)).toFixed(4);
  });
  return { macdLine, signalLine, histogram };
}

// Macro data
export function generateYieldCurve() {
  const maturities = ["1M", "3M", "6M", "1Y", "2Y", "3Y", "5Y", "7Y", "10Y", "20Y", "30Y"];
  const rates = [5.3, 5.25, 5.1, 4.85, 4.3, 4.1, 3.95, 4.0, 4.05, 4.3, 4.35];
  return maturities.map((m, i) => ({ maturity: m, rate: rates[i], inverted: rates[i] < rates[4] }));
}

export function generateInflationData() {
  const months = 36;
  const data = [];
  const now = new Date();
  let cpi = 3.2;
  for (let i = months; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    cpi = Math.max(0.5, cpi + (Math.random() - 0.5) * 0.3);
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      cpi: +cpi.toFixed(2),
      core: +(cpi - 0.2 + (Math.random() - 0.5) * 0.1).toFixed(2),
    });
  }
  return data;
}

export function generateGDPData() {
  const quarters = 20;
  const data = [];
  const now = new Date();
  let gdp = 2.1;
  for (let i = quarters; i >= 0; i--) {
    const year = now.getFullYear() - Math.floor(i / 4);
    const q = ((now.getMonth() / 3 + 1 - (i % 4) + 4) % 4) + 1;
    gdp = gdp + (Math.random() - 0.45) * 1.5;
    data.push({
      date: `Q${Math.floor(q)}/${year}`,
      gdp: +gdp.toFixed(2),
      positive: gdp >= 0,
    });
  }
  return data;
}

export function generateFedFundsData() {
  const months = 60;
  const data = [];
  const now = new Date();
  const keyRates: Record<string, number> = {};
  // Simulate Fed rate hike cycle 2022-2023
  let rate = 0.25;
  for (let i = months; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    // Rate hikes starting ~24 months ago
    if (i <= 36 && i > 12) rate = Math.min(5.5, rate + (Math.random() > 0.6 ? 0.25 : 0));
    if (i <= 12) rate = Math.max(4.5, rate - (Math.random() > 0.8 ? 0.25 : 0));
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      rate: +rate.toFixed(2),
    });
  }
  return data;
}

// Portfolio data
export const PORTFOLIO_ASSETS = [
  { ticker: "AAPL", name: "Apple", weight: 0.20, returns: 0.28, risk: 0.18, color: "#3b82f6" },
  { ticker: "MSFT", name: "Microsoft", weight: 0.18, returns: 0.24, risk: 0.16, color: "#8b5cf6" },
  { ticker: "GOOGL", name: "Alphabet", weight: 0.15, returns: 0.20, risk: 0.22, color: "#10b981" },
  { ticker: "JPM", name: "JPMorgan", weight: 0.12, returns: 0.15, risk: 0.20, color: "#f59e0b" },
  { ticker: "GLD", name: "Gold ETF", weight: 0.10, returns: 0.08, risk: 0.12, color: "#f97316" },
  { ticker: "BND", name: "Bond ETF", weight: 0.15, returns: 0.04, risk: 0.05, color: "#06b6d4" },
  { ticker: "NVDA", name: "NVIDIA", weight: 0.10, returns: 0.45, risk: 0.38, color: "#84cc16" },
];

export function generateEfficientFrontier() {
  const points = [];
  for (let i = 0; i <= 40; i++) {
    const risk = 0.04 + i * 0.008;
    const ret = -0.5 * Math.pow(risk - 0.18, 2) / 0.01 + 0.22 + (Math.random() - 0.5) * 0.005;
    points.push({ risk: +(risk * 100).toFixed(2), return: +(ret * 100).toFixed(2) });
  }
  return points;
}

export function generateCorrelationMatrix() {
  const tickers = ["AAPL", "MSFT", "GOOGL", "JPM", "GLD", "BND", "NVDA"];
  const corr = [
    [1.00, 0.82, 0.75, 0.45, -0.12, -0.28, 0.68],
    [0.82, 1.00, 0.80, 0.42, -0.15, -0.30, 0.72],
    [0.75, 0.80, 1.00, 0.38, -0.10, -0.25, 0.65],
    [0.45, 0.42, 0.38, 1.00, 0.05, 0.10, 0.35],
    [-0.12, -0.15, -0.10, 0.05, 1.00, 0.45, -0.08],
    [-0.28, -0.30, -0.25, 0.10, 0.45, 1.00, -0.22],
    [0.68, 0.72, 0.65, 0.35, -0.08, -0.22, 1.00],
  ];
  return { tickers, corr };
}

// Monte Carlo
export function runMonteCarlo(
  S0: number,
  mu: number,
  sigma: number,
  T: number,
  steps: number,
  simulations: number
) {
  const dt = T / steps;
  const paths: number[][] = [];
  const finalPrices: number[] = [];

  for (let sim = 0; sim < simulations; sim++) {
    const path: number[] = [S0];
    let S = S0;
    for (let t = 1; t <= steps; t++) {
      const z = normalRandom();
      S = S * Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * z);
      path.push(+S.toFixed(2));
    }
    paths.push(path);
    finalPrices.push(path[path.length - 1]);
  }
  return { paths, finalPrices };
}

function normalRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Screener data
export const SCREENER_DATA = [
  { ticker: "AAPL", name: "Apple Inc.", sector: "Technology", marketCap: 2850, pe: 28.5, pb: 45.2, ps: 7.8, ev_ebitda: 22.1, roe: 147.9, dividend: 0.54, revenue_growth: 6.1, gross_margin: 43.8 },
  { ticker: "MSFT", name: "Microsoft Corp.", sector: "Technology", marketCap: 2780, pe: 35.2, pb: 12.8, ps: 12.1, ev_ebitda: 26.4, roe: 38.5, dividend: 0.73, revenue_growth: 13.3, gross_margin: 70.1 },
  { ticker: "GOOGL", name: "Alphabet Inc.", sector: "Technology", marketCap: 1780, pe: 24.1, pb: 6.2, ps: 5.9, ev_ebitda: 16.8, roe: 28.4, dividend: 0.0, revenue_growth: 11.5, gross_margin: 57.1 },
  { ticker: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Disc.", marketCap: 1820, pe: 42.8, pb: 9.1, ps: 3.2, ev_ebitda: 22.5, roe: 22.1, dividend: 0.0, revenue_growth: 13.0, gross_margin: 47.6 },
  { ticker: "NVDA", name: "NVIDIA Corp.", sector: "Technology", marketCap: 2250, pe: 68.4, pb: 38.5, ps: 24.1, ev_ebitda: 55.2, roe: 91.5, dividend: 0.04, revenue_growth: 122.4, gross_margin: 74.6 },
  { ticker: "META", name: "Meta Platforms", sector: "Communication", marketCap: 1260, pe: 25.8, pb: 7.4, ps: 7.2, ev_ebitda: 18.1, roe: 31.5, dividend: 0.0, revenue_growth: 21.4, gross_margin: 81.5 },
  { ticker: "BRK.B", name: "Berkshire Hathaway", sector: "Financials", marketCap: 880, pe: 22.1, pb: 1.6, ps: 2.1, ev_ebitda: 12.8, roe: 13.2, dividend: 0.0, revenue_growth: 5.8, gross_margin: 18.4 },
  { ticker: "JPM", name: "JPMorgan Chase", sector: "Financials", marketCap: 550, pe: 11.2, pb: 1.8, ps: 2.8, ev_ebitda: 8.5, roe: 17.2, dividend: 2.40, revenue_growth: 12.3, gross_margin: 62.1 },
  { ticker: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", marketCap: 395, pe: 15.8, pb: 5.1, ps: 4.2, ev_ebitda: 12.1, roe: 32.8, dividend: 3.07, revenue_growth: -0.8, gross_margin: 68.4 },
  { ticker: "XOM", name: "Exxon Mobil", sector: "Energy", marketCap: 410, pe: 13.5, pb: 2.1, ps: 1.4, ev_ebitda: 7.8, roe: 17.5, dividend: 3.68, revenue_growth: -8.2, gross_margin: 38.5 },
  { ticker: "PG", name: "Procter & Gamble", sector: "Cons. Staples", marketCap: 355, pe: 24.8, pb: 8.2, ps: 4.5, ev_ebitda: 17.4, roe: 34.1, dividend: 2.39, revenue_growth: 3.5, gross_margin: 52.1 },
  { ticker: "HD", name: "Home Depot", sector: "Consumer Disc.", marketCap: 320, pe: 21.4, pb: 42.1, ps: 2.1, ev_ebitda: 15.6, roe: 215.8, dividend: 2.42, revenue_growth: -2.1, gross_margin: 33.5 },
  { ticker: "UNH", name: "UnitedHealth Group", sector: "Healthcare", marketCap: 480, pe: 18.2, pb: 5.8, ps: 0.8, ev_ebitda: 14.2, roe: 28.5, dividend: 1.86, revenue_growth: 14.6, gross_margin: 24.1 },
  { ticker: "V", name: "Visa Inc.", sector: "Financials", marketCap: 510, pe: 30.5, pb: 12.8, ps: 14.2, ev_ebitda: 24.1, roe: 44.5, dividend: 0.75, revenue_growth: 9.5, gross_margin: 79.8 },
  { ticker: "TSLA", name: "Tesla Inc.", sector: "Consumer Disc.", marketCap: 580, pe: 55.8, pb: 10.2, ps: 6.8, ev_ebitda: 38.5, roe: 19.8, dividend: 0.0, revenue_growth: 8.6, gross_margin: 17.9 },
];
