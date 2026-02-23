"use client";
import { useState, useMemo } from "react";
import { Card, CardHeader, PageHeader, MetricCard } from "@/components/ui";
import { runMonteCarlo } from "@/lib/mockData";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, ReferenceLine,
} from "recharts";

const PATH_COLORS = ["#3b82f6", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444",
  "#06b6d4", "#84cc16", "#f97316", "#a855f7", "#ec4899"];

export default function MonteCarloPage() {
  const [S0, setS0] = useState(188.42);
  const [mu, setMu] = useState(0.12);
  const [sigma, setSigma] = useState(0.28);
  const [T, setT] = useState(1);
  const [steps, setSteps] = useState(252);
  const [sims, setSims] = useState(500);
  const [ran, setRan] = useState(false);

  const [result, setResult] = useState<{ paths: number[][]; finalPrices: number[] } | null>(null);

  const runSim = () => {
    const r = runMonteCarlo(S0, mu, sigma, T, steps, sims);
    setResult(r);
    setRan(true);
  };

  // Display only 30 paths on chart
  const chartData = useMemo(() => {
    if (!result) return [];
    const displayPaths = result.paths.slice(0, 30);
    return Array.from({ length: steps + 1 }, (_, i) => {
      const point: Record<string, number> = { step: i };
      displayPaths.forEach((path, j) => { point[`path${j}`] = path[i]; });
      return point;
    });
  }, [result, steps]);

  const histData = useMemo(() => {
    if (!result) return [];
    const prices = result.finalPrices;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const bins = 40;
    const binSize = (max - min) / bins;
    const counts: number[] = new Array(bins).fill(0);
    prices.forEach((p) => {
      const idx = Math.min(Math.floor((p - min) / binSize), bins - 1);
      counts[idx]++;
    });
    return counts.map((count, i) => ({
      price: +(min + i * binSize + binSize / 2).toFixed(2),
      count,
    }));
  }, [result]);

  const stats = useMemo(() => {
    if (!result) return null;
    const prices = [...result.finalPrices].sort((a, b) => a - b);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
    const std = Math.sqrt(variance);
    const p5 = prices[Math.floor(prices.length * 0.05)];
    const p25 = prices[Math.floor(prices.length * 0.25)];
    const p50 = prices[Math.floor(prices.length * 0.50)];
    const p75 = prices[Math.floor(prices.length * 0.75)];
    const p95 = prices[Math.floor(prices.length * 0.95)];
    const probProfit = (prices.filter((p) => p > S0).length / prices.length) * 100;
    return { mean, std, p5, p25, p50, p75, p95, probProfit };
  }, [result, S0]);

  return (
    <div className="p-8">
      <PageHeader title="Monte Carlo Simulation" subtitle="Geometric Brownian Motion stock price simulation" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <Card className="lg:col-span-1">
          <CardHeader title="Parameters" />
          <div className="space-y-4">
            {[
              { label: "Initial Price (S₀)", value: S0, set: setS0, min: 1, max: 5000, step: 1 },
              { label: "Annual Drift (μ)", value: mu, set: setMu, min: -0.5, max: 1, step: 0.01 },
              { label: "Volatility (σ)", value: sigma, set: setSigma, min: 0.01, max: 2, step: 0.01 },
              { label: "Time Horizon (years)", value: T, set: setT, min: 0.25, max: 5, step: 0.25 },
              { label: "Time Steps", value: steps, set: setSteps, min: 50, max: 1000, step: 50 },
              { label: "Simulations", value: sims, set: setSims, min: 100, max: 5000, step: 100 },
            ].map((inp) => (
              <div key={inp.label}>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-slate-400">{inp.label}</label>
                  <span className="text-xs font-mono text-blue-400">{inp.value}</span>
                </div>
                <input type="range" min={inp.min} max={inp.max} step={inp.step} value={inp.value}
                  onChange={(e) => inp.set(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-blue-500" />
              </div>
            ))}
            <button onClick={runSim}
              className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg transition-colors">
              Run Simulation
            </button>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          {!ran ? (
            <Card className="flex items-center justify-center h-48">
              <div className="text-center text-slate-500">
                <div className="text-4xl mb-3">📊</div>
                <p>Configure parameters and click "Run Simulation"</p>
              </div>
            </Card>
          ) : (
            <>
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard label="Mean Final Price" value={`$${stats.mean.toFixed(2)}`} change={stats.mean - S0} changePercent={((stats.mean - S0) / S0) * 100} />
                  <MetricCard label="P5 (5th Percentile)" value={`$${stats.p5.toFixed(2)}`} />
                  <MetricCard label="P95 (95th Percentile)" value={`$${stats.p95.toFixed(2)}`} />
                  <MetricCard label="Prob. of Profit" value={`${stats.probProfit.toFixed(1)}%`} />
                </div>
              )}

              {/* Paths Chart */}
              <Card>
                <CardHeader title={`${Math.min(30, sims)} Sample Price Paths`} subtitle={`GBM with μ=${(mu * 100).toFixed(0)}%, σ=${(sigma * 100).toFixed(0)}%`} />
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="step" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} interval={Math.floor(steps / 8)} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} width={55} domain={["auto", "auto"]}
                      tickFormatter={(v) => `$${v.toFixed(0)}`} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 10 }} />
                    <ReferenceLine y={S0} stroke="#475569" strokeDasharray="4 4" label={{ value: `S₀=$${S0}`, fill: "#64748b", fontSize: 10 }} />
                    {Array.from({ length: Math.min(30, sims) }, (_, j) => (
                      <Line key={j} type="monotone" dataKey={`path${j}`} stroke={PATH_COLORS[j % PATH_COLORS.length]}
                        strokeWidth={1} dot={false} opacity={0.4} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </>
          )}
        </div>
      </div>

      {ran && result && stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Distribution */}
          <Card>
            <CardHeader title="Distribution of Final Prices" subtitle={`${sims} simulations`} />
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={histData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="price" tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false}
                  tickFormatter={(v) => `$${v.toFixed(0)}`} interval={7} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} width={35} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 11 }}
                  formatter={(v: unknown) => [v as number, "Count"]} labelFormatter={(v) => `$${v}`} />
                <ReferenceLine x={stats.mean} stroke="#f59e0b" strokeDasharray="4 4" />
                <Bar dataKey="count" fill="#3b82f6" opacity={0.7} radius={[1, 1, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Percentile Table */}
          <Card>
            <CardHeader title="Confidence Intervals" />
            <div className="space-y-4 mt-2">
              {[
                { label: "5th Percentile (Worst 5%)", value: stats.p5, pct: ((stats.p5 - S0) / S0) * 100, color: "#ef4444" },
                { label: "25th Percentile", value: stats.p25, pct: ((stats.p25 - S0) / S0) * 100, color: "#f97316" },
                { label: "50th Percentile (Median)", value: stats.p50, pct: ((stats.p50 - S0) / S0) * 100, color: "#f59e0b" },
                { label: "Mean Expected Value", value: stats.mean, pct: ((stats.mean - S0) / S0) * 100, color: "#3b82f6" },
                { label: "75th Percentile", value: stats.p75, pct: ((stats.p75 - S0) / S0) * 100, color: "#22c55e" },
                { label: "95th Percentile (Best 5%)", value: stats.p95, pct: ((stats.p95 - S0) / S0) * 100, color: "#10b981" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center">
                  <span className="text-sm text-slate-400">{row.label}</span>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-white">${row.value.toFixed(2)}</span>
                    <span className={`ml-2 text-xs font-medium ${row.pct >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {row.pct >= 0 ? "+" : ""}{row.pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-800">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Std. Deviation</span>
                  <span className="text-white font-mono">${stats.std.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-slate-400">90% Confidence Interval</span>
                  <span className="text-blue-400 font-mono">[${stats.p5.toFixed(0)}, ${stats.p95.toFixed(0)}]</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
