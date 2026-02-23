"use client";
import { useMemo } from "react";
import { Card, CardHeader, PageHeader, MetricCard } from "@/components/ui";
import {
  generateYieldCurve, generateInflationData, generateGDPData, generateFedFundsData,
} from "@/lib/mockData";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter, Cell,
} from "recharts";

export default function MacroPage() {
  const yieldCurve = useMemo(() => generateYieldCurve(), []);
  const inflation = useMemo(() => generateInflationData(), []);
  const gdp = useMemo(() => generateGDPData(), []);
  const fedFunds = useMemo(() => generateFedFundsData(), []);

  const last10Y = yieldCurve.find((y) => y.maturity === "10Y")?.rate ?? 4.05;
  const last2Y = yieldCurve.find((y) => y.maturity === "2Y")?.rate ?? 4.3;
  const spread = +(last10Y - last2Y).toFixed(2);

  return (
    <div className="p-8">
      <PageHeader title="Macroeconomic Indicators" subtitle="Key economic data and central bank policy" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="10Y Treasury" value={`${last10Y}%`} change={last10Y - 3.88} changePercent={((last10Y - 3.88) / 3.88) * 100} />
        <MetricCard label="2Y Treasury" value={`${last2Y}%`} change={last2Y - 4.61} changePercent={((last2Y - 4.61) / 4.61) * 100} />
        <MetricCard label="2Y/10Y Spread" value={`${spread > 0 ? "+" : ""}${spread}%`} change={spread} />
        <MetricCard label="Fed Funds Rate" value="5.50%" change={0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Yield Curve */}
        <Card>
          <CardHeader
            title="US Treasury Yield Curve"
            subtitle={spread < 0 ? "⚠ Inverted Curve — Potential Recession Signal" : "Normal curve shape"}
          />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={yieldCurve} margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="maturity" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} width={40}
                domain={["auto", "auto"]} tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 11 }}
                formatter={(v: unknown) => [`${v}%`, "Yield"]} />
              <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2} fill="url(#yieldGrad)"
                dot={{ fill: "#3b82f6", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-2 mt-3">
            {yieldCurve.filter((_, i) => i % 3 === 0).map((y) => (
              <div key={y.maturity} className="text-center bg-slate-800 rounded p-2">
                <div className="text-xs text-slate-500">{y.maturity}</div>
                <div className="text-sm font-semibold text-white">{y.rate}%</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Fed Funds */}
        <Card>
          <CardHeader title="Federal Funds Rate" subtitle="Target rate — 60 months" />
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={fedFunds} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="fedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false} interval={9} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} width={35} domain={[0, 6]}
                tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 11 }}
                formatter={(v: unknown) => [`${v}%`, "Fed Funds Rate"]} />
              <Area type="stepAfter" dataKey="rate" stroke="#f59e0b" strokeWidth={2} fill="url(#fedGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-800 rounded p-2">
              <div className="text-slate-500">Current</div>
              <div className="text-white font-semibold">5.25-5.50%</div>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <div className="text-slate-500">Next Meeting</div>
              <div className="text-white font-semibold">Mar 2025</div>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <div className="text-slate-500">Mkt Expectation</div>
              <div className="text-green-400 font-semibold">Hold</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inflation */}
        <Card>
          <CardHeader title="Inflation (CPI)" subtitle="Headline & Core — 3 years" />
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={inflation} margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false} interval={5} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} width={35}
                tickFormatter={(v) => `${v}%`} domain={[0, "auto"]} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 11 }}
                formatter={(v: unknown, n) => [`${v}%`, n]} />
              <ReferenceLine y={2} stroke="#22c55e" strokeDasharray="4 4" label={{ value: "2% Target", fill: "#22c55e", fontSize: 9 }} />
              <Line type="monotone" dataKey="cpi" stroke="#ef4444" strokeWidth={2} dot={false} name="CPI" />
              <Line type="monotone" dataKey="core" stroke="#f97316" strokeWidth={2} dot={false} strokeDasharray="4 4" name="Core CPI" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 flex gap-4 text-xs">
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-red-500" />Headline CPI</span>
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-orange-500" style={{ borderTop: "2px dashed" }} />Core CPI</span>
            <span className="flex items-center gap-1"><span className="w-4 h-0.5 bg-green-500" />2% Target</span>
          </div>
        </Card>

        {/* GDP */}
        <Card>
          <CardHeader title="Real GDP Growth" subtitle="Quarter-over-quarter annualized (%)" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={gdp} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 9 }} tickLine={false} interval={3} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} width={35}
                tickFormatter={(v) => `${v}%`} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 11 }}
                formatter={(v: unknown) => [`${(v as number).toFixed(2)}%`, "GDP Growth"]} />
              <ReferenceLine y={0} stroke="#475569" />
              <Bar dataKey="gdp" radius={[2, 2, 0, 0]} name="GDP Growth">
                {gdp.map((entry, i) => (
                  <Cell key={i} fill={entry.gdp >= 0 ? "#10b981" : "#ef4444"} opacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-slate-800 rounded p-2">
              <div className="text-slate-500">Latest Q</div>
              <div className="text-green-400 font-semibold">{gdp[gdp.length - 1]?.gdp.toFixed(1)}%</div>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <div className="text-slate-500">5Y Average</div>
              <div className="text-white font-semibold">
                {(gdp.slice(-20).reduce((a, b) => a + b.gdp, 0) / 20).toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <div className="text-slate-500">Recession Qtrs</div>
              <div className="text-red-400 font-semibold">{gdp.filter((q) => q.gdp < 0).length}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
