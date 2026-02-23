"use client";
import { useState, useMemo } from "react";
import { Card, CardHeader, PageHeader, Badge } from "@/components/ui";
import { blackScholes, generateOptionsChain, generatePayoffData } from "@/lib/finance";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, LineChart, Line } from "recharts";

export default function OptionsPage() {
  const [S, setS] = useState(188.42);
  const [K, setK] = useState(190);
  const [T, setT] = useState(0.25);
  const [r, setR] = useState(0.0525);
  const [sigma, setSigma] = useState(0.28);
  const [optType, setOptType] = useState<"call" | "put">("call");

  const result = useMemo(() => blackScholes({ S, K, T, r, sigma, type: optType }), [S, K, T, r, sigma, optType]);
  const chain = useMemo(() => generateOptionsChain(S, T, r, sigma), [S, T, r, sigma]);
  const payoff = useMemo(() => generatePayoffData(S, K, result.price, optType), [S, K, result.price, optType]);

  const greeks = [
    { name: "Delta", value: result.delta.toFixed(4), desc: "Price sensitivity per $1 move", color: "#3b82f6" },
    { name: "Gamma", value: result.gamma.toFixed(6), desc: "Delta sensitivity per $1 move", color: "#8b5cf6" },
    { name: "Theta", value: result.theta.toFixed(4), desc: "Time decay per day", color: "#ef4444" },
    { name: "Vega", value: result.vega.toFixed(4), desc: "Sensitivity per 1% vol change", color: "#10b981" },
    { name: "Rho", value: result.rho.toFixed(4), desc: "Sensitivity per 1% rate change", color: "#f59e0b" },
  ];

  return (
    <div className="p-8">
      <PageHeader title="Options Pricing" subtitle="Black-Scholes model with Greeks and options chain" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Inputs */}
        <Card>
          <CardHeader title="Model Inputs" />
          <div className="space-y-4">
            {[
              { label: "Spot Price (S)", value: S, set: setS, min: 1, max: 10000, step: 0.5 },
              { label: "Strike Price (K)", value: K, set: setK, min: 1, max: 10000, step: 1 },
              { label: "Time to Expiry (years)", value: T, set: setT, min: 0.01, max: 2, step: 0.01 },
              { label: "Risk-Free Rate", value: r, set: setR, min: 0, max: 0.2, step: 0.001 },
              { label: "Volatility (σ)", value: sigma, set: setSigma, min: 0.01, max: 2, step: 0.01 },
            ].map((inp) => (
              <div key={inp.label}>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-slate-400">{inp.label}</label>
                  <span className="text-xs font-mono text-blue-400">{inp.value.toFixed(inp.step < 0.01 ? 4 : inp.step < 1 ? 2 : 2)}</span>
                </div>
                <input
                  type="range" min={inp.min} max={inp.max} step={inp.step} value={inp.value}
                  onChange={(e) => inp.set(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <button onClick={() => setOptType("call")}
                className={`flex-1 py-2 rounded text-sm font-medium ${optType === "call" ? "bg-green-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                Call
              </button>
              <button onClick={() => setOptType("put")}
                className={`flex-1 py-2 rounded text-sm font-medium ${optType === "put" ? "bg-red-600 text-white" : "bg-slate-800 text-slate-400"}`}>
                Put
              </button>
            </div>
          </div>
        </Card>

        {/* Price & Greeks */}
        <Card>
          <CardHeader title="Option Price & Greeks" />
          <div className="text-center mb-6">
            <div className="text-xs text-slate-500 mb-1">Theoretical Price</div>
            <div className="text-4xl font-bold text-white">${result.price.toFixed(2)}</div>
            <div className="text-sm text-slate-400 mt-1">
              {optType === "call" ? "Call" : "Put"} @ K${K} | {(T * 365).toFixed(0)}d | σ{(sigma * 100).toFixed(0)}%
            </div>
            <Badge variant={S > K ? "success" : "danger"} >{S > K ? (optType === "call" ? "ITM" : "OTM") : (optType === "call" ? "OTM" : "ITM")}</Badge>
          </div>
          <div className="space-y-3">
            {greeks.map((g) => (
              <div key={g.name} className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold" style={{ color: g.color }}>{g.name}</span>
                  <p className="text-xs text-slate-500">{g.desc}</p>
                </div>
                <span className="text-sm font-mono text-white">{g.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div className="text-slate-500">d1: <span className="text-slate-300 font-mono">{result.d1}</span></div>
            <div className="text-slate-500">d2: <span className="text-slate-300 font-mono">{result.d2}</span></div>
          </div>
        </Card>

        {/* Payoff Diagram */}
        <Card>
          <CardHeader title="Payoff at Expiration" subtitle={`Long ${optType}`} />
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={payoff} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="payoffPos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="payoffNeg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="price" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false}
                tickFormatter={(v) => `$${v.toFixed(0)}`} interval={4} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} width={45}
                tickFormatter={(v) => `$${v.toFixed(0)}`} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 11 }}
                formatter={(v: unknown) => [`$${(v as number).toFixed(2)}`, "P&L"]} />
              <ReferenceLine y={0} stroke="#475569" />
              <ReferenceLine x={K} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `K=${K}`, fill: "#f59e0b", fontSize: 10 }} />
              <Area type="monotone" dataKey="payoff" stroke="#3b82f6" strokeWidth={2}
                fill={payoff.some(p => p.payoff > 0) ? "url(#payoffPos)" : "url(#payoffNeg)"} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Options Chain */}
      <Card>
        <CardHeader title="Options Chain" subtitle={`Spot: $${S.toFixed(2)} | ${(T * 365).toFixed(0)} days to expiry`} />
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-700">
                <th colSpan={6} className="text-center text-green-400 py-2 font-semibold">CALLS</th>
                <th className="text-center text-slate-300 py-2 font-bold">STRIKE</th>
                <th colSpan={6} className="text-center text-red-400 py-2 font-semibold">PUTS</th>
              </tr>
              <tr className="text-slate-500 border-b border-slate-800">
                <th className="text-left py-2 px-2">Price</th>
                <th className="px-2">Delta</th>
                <th className="px-2">Gamma</th>
                <th className="px-2">Theta</th>
                <th className="px-2">IV</th>
                <th className="px-2">OI</th>
                <th className="text-center px-3 font-bold text-slate-300">Strike</th>
                <th className="px-2">Price</th>
                <th className="px-2">Delta</th>
                <th className="px-2">Gamma</th>
                <th className="px-2">Theta</th>
                <th className="px-2">IV</th>
                <th className="px-2">OI</th>
              </tr>
            </thead>
            <tbody>
              {chain.map((row) => (
                <tr key={row.strike}
                  className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${row.atm ? "bg-blue-950/30 border-blue-800/30" : ""}`}>
                  <td className="py-1.5 px-2 text-green-400 font-mono">${row.callPrice.toFixed(2)}</td>
                  <td className="px-2 text-slate-300 font-mono">{row.callDelta.toFixed(3)}</td>
                  <td className="px-2 text-slate-300 font-mono">{row.callGamma.toFixed(5)}</td>
                  <td className="px-2 text-red-400 font-mono">{row.callTheta.toFixed(3)}</td>
                  <td className="px-2 text-slate-300">{row.callIV}%</td>
                  <td className="px-2 text-slate-400">{(row.callOI / 1000).toFixed(1)}K</td>
                  <td className={`px-3 text-center font-bold ${row.atm ? "text-yellow-400" : "text-white"}`}>
                    ${row.strike}
                    {row.atm && <span className="ml-1 text-yellow-400">★</span>}
                  </td>
                  <td className="py-1.5 px-2 text-red-400 font-mono">${row.putPrice.toFixed(2)}</td>
                  <td className="px-2 text-slate-300 font-mono">{row.putDelta.toFixed(3)}</td>
                  <td className="px-2 text-slate-300 font-mono">{row.putGamma.toFixed(5)}</td>
                  <td className="px-2 text-red-400 font-mono">{row.putTheta.toFixed(3)}</td>
                  <td className="px-2 text-slate-300">{row.putIV}%</td>
                  <td className="px-2 text-slate-400">{(row.putOI / 1000).toFixed(1)}K</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
