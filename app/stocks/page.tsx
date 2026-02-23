"use client";
import { useState, useMemo } from "react";
import { Card, CardHeader, PageHeader } from "@/components/ui";
import { generateOHLCData, sma, ema, rsi, bollingerBands, macd } from "@/lib/mockData";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart, BarChart,
} from "recharts";

const STOCKS = [
  { ticker: "AAPL", name: "Apple Inc.", price: 188.42, change: 1.24, startPrice: 155, vol: 0.018 },
  { ticker: "NVDA", name: "NVIDIA Corp.", price: 724.18, change: 4.82, startPrice: 480, vol: 0.032 },
  { ticker: "MSFT", name: "Microsoft", price: 415.30, change: 0.95, startPrice: 370, vol: 0.015 },
  { ticker: "GOOGL", name: "Alphabet", price: 161.82, change: -0.43, startPrice: 142, vol: 0.02 },
  { ticker: "TSLA", name: "Tesla", price: 195.64, change: -2.15, startPrice: 240, vol: 0.038 },
];

const INDICATORS = ["SMA 20", "SMA 50", "EMA 20", "Bollinger Bands"];

export default function StocksPage() {
  const [selected, setSelected] = useState(STOCKS[0]);
  const [activeIndicators, setActiveIndicators] = useState<string[]>(["SMA 20", "Bollinger Bands"]);

  const rawData = useMemo(() => generateOHLCData(180, selected.startPrice, selected.vol), [selected.ticker]);

  const chartData = useMemo(() => {
    const closes = rawData.map((d) => d.close);
    const sma20 = sma(closes, 20);
    const sma50 = sma(closes, 50);
    const ema20 = ema(closes, 20);
    const bb = bollingerBands(closes, 20);
    const rsiVals = rsi(closes, 14);
    const { macdLine, signalLine, histogram } = macd(closes);

    return rawData.map((d, i) => ({
      ...d,
      date: d.date.slice(5),
      sma20: sma20[i],
      sma50: sma50[i],
      ema20: ema20[i],
      bbUpper: bb[i].upper,
      bbMiddle: bb[i].middle,
      bbLower: bb[i].lower,
      rsi: rsiVals[i] !== null ? +rsiVals[i]!.toFixed(2) : null,
      macd: macdLine[i],
      macdSignal: signalLine[i],
      macdHist: histogram[i],
    }));
  }, [rawData]);

  const display = chartData.slice(-90);
  const last = display[display.length - 1];

  const toggleIndicator = (ind: string) => {
    setActiveIndicators((prev) =>
      prev.includes(ind) ? prev.filter((i) => i !== ind) : [...prev, ind]
    );
  };

  return (
    <div className="p-8">
      <PageHeader title="Stock Analysis" subtitle="Technical analysis with indicators" />

      {/* Stock Selector */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {STOCKS.map((s) => (
          <button
            key={s.ticker}
            onClick={() => setSelected(s)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selected.ticker === s.ticker
                ? "bg-blue-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            <span className="font-bold">{s.ticker}</span>
            <span className="ml-2 text-xs opacity-80">${s.price}</span>
            <span className={`ml-1 text-xs ${s.change >= 0 ? "text-green-400" : "text-red-400"}`}>
              {s.change >= 0 ? "+" : ""}{s.change}%
            </span>
          </button>
        ))}
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {[
          { label: "Open", value: `$${last?.open}` },
          { label: "High", value: `$${last?.high}` },
          { label: "Low", value: `$${last?.low}` },
          { label: "Close", value: `$${last?.close}` },
          { label: "Volume", value: `${(last?.volume / 1e6).toFixed(1)}M` },
        ].map((m) => (
          <div key={m.label} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <div className="text-xs text-slate-500">{m.label}</div>
            <div className="text-sm font-semibold text-white mt-0.5">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Indicator Toggles */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <span className="text-xs text-slate-500 self-center">Indicators:</span>
        {INDICATORS.map((ind) => (
          <button
            key={ind}
            onClick={() => toggleIndicator(ind)}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              activeIndicators.includes(ind)
                ? "bg-blue-600/20 text-blue-400 border border-blue-600/50"
                : "bg-slate-800 text-slate-500 border border-slate-700"
            }`}
          >
            {ind}
          </button>
        ))}
      </div>

      {/* Main Price Chart */}
      <Card className="mb-4">
        <CardHeader title={`${selected.ticker} — Price Chart`} subtitle="90-day with technical indicators" />
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={display} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} interval={8} />
            <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} domain={["auto", "auto"]} width={60} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 12 }}
              labelStyle={{ color: "#94a3b8" }}
            />
            {activeIndicators.includes("Bollinger Bands") && (
              <>
                <Line type="monotone" dataKey="bbUpper" stroke="#6366f1" strokeWidth={1} dot={false} strokeDasharray="3 3" name="BB Upper" />
                <Line type="monotone" dataKey="bbLower" stroke="#6366f1" strokeWidth={1} dot={false} strokeDasharray="3 3" name="BB Lower" />
                <Line type="monotone" dataKey="bbMiddle" stroke="#8b5cf6" strokeWidth={1} dot={false} name="BB Mid" />
              </>
            )}
            {activeIndicators.includes("SMA 20") && (
              <Line type="monotone" dataKey="sma20" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="SMA 20" />
            )}
            {activeIndicators.includes("SMA 50") && (
              <Line type="monotone" dataKey="sma50" stroke="#10b981" strokeWidth={1.5} dot={false} name="SMA 50" />
            )}
            {activeIndicators.includes("EMA 20") && (
              <Line type="monotone" dataKey="ema20" stroke="#f97316" strokeWidth={1.5} dot={false} name="EMA 20" />
            )}
            <Bar dataKey="close" fill="#3b82f6" opacity={0.7} name="Price" radius={[1, 1, 0, 0]} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Volume */}
        <Card>
          <CardHeader title="Volume" />
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={display} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false} interval={8} />
              <YAxis tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false} width={40}
                tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 11 }}
                formatter={(v: unknown) => [`${((v as number) / 1e6).toFixed(1)}M`, "Volume"]} />
              <Bar dataKey="volume" fill="#6366f1" opacity={0.7} radius={[1, 1, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* RSI */}
        <Card>
          <CardHeader title="RSI (14)" subtitle="Overbought >70 | Oversold <30" />
          <ResponsiveContainer width="100%" height={140}>
            <ComposedChart data={display} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false} interval={8} />
              <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false} width={30} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 11 }} />
              <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" />
              <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="rsi" stroke="#f59e0b" strokeWidth={2} dot={false} name="RSI" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* MACD */}
      <Card>
        <CardHeader title="MACD (12, 26, 9)" subtitle="Moving Average Convergence Divergence" />
        <ResponsiveContainer width="100%" height={160}>
          <ComposedChart data={display} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} interval={8} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} width={50} />
            <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 11 }} />
            <ReferenceLine y={0} stroke="#334155" />
            <Bar dataKey="macdHist" name="Histogram"
              fill="#3b82f6" opacity={0.7} radius={[1, 1, 0, 0]}
            />
            <Line type="monotone" dataKey="macd" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="MACD" />
            <Line type="monotone" dataKey="macdSignal" stroke="#ef4444" strokeWidth={1.5} dot={false} name="Signal" />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
