"use client";
import { useMemo } from "react";
import { Card, CardHeader, PageHeader, MetricCard } from "@/components/ui";
import {
  PORTFOLIO_ASSETS, generateEfficientFrontier, generateCorrelationMatrix, generateOHLCData,
} from "@/lib/mockData";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from "recharts";

function getColor(value: number): string {
  if (value >= 0.7) return "#ef4444";
  if (value >= 0.4) return "#f97316";
  if (value >= 0.1) return "#eab308";
  if (value >= -0.1) return "#6b7280";
  if (value >= -0.4) return "#22c55e";
  return "#16a34a";
}

export default function PortfolioPage() {
  const frontier = useMemo(() => generateEfficientFrontier(), []);
  const { tickers, corr } = useMemo(() => generateCorrelationMatrix(), []);

  // Portfolio returns time series
  const portData = useMemo(() => {
    const data = generateOHLCData(252, 1000000, 0.012, 0.0004);
    return data.slice(-120).map((d) => ({ date: d.date.slice(5), value: d.close }));
  }, []);

  // Portfolio metrics
  const portReturn = 18.4;
  const portRisk = 12.8;
  const sharpe = 1.84;
  const sortino = 2.31;
  const maxDD = -8.4;
  const beta = 1.12;

  // Current portfolio dot for efficient frontier
  const portPoint = [{ risk: portRisk, return: portReturn, name: "Your Portfolio" }];

  return (
    <div className="p-8">
      <PageHeader title="Portfolio Analysis" subtitle="Risk-return optimization and performance attribution" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard label="Total Return" value="18.4%" change={18.4} />
        <MetricCard label="Sharpe Ratio" value={sharpe.toFixed(2)} />
        <MetricCard label="Sortino Ratio" value={sortino.toFixed(2)} />
        <MetricCard label="Max Drawdown" value={`${maxDD}%`} change={maxDD} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Efficient Frontier */}
        <Card>
          <CardHeader title="Efficient Frontier" subtitle="Risk vs. Return optimization" />
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="risk" name="Risk (σ)" unit="%" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} label={{ value: "Risk (%)", fill: "#64748b", dy: 15, fontSize: 11 }} />
              <YAxis dataKey="return" name="Return" unit="%" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} label={{ value: "Return (%)", fill: "#64748b", angle: -90, dx: -10, fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 11 }}
                formatter={(v: unknown, n) => [`${(v as number).toFixed(2)}%`, n]}
              />
              <Scatter name="Efficient Frontier" data={frontier} fill="#3b82f6" opacity={0.6} />
              <Scatter name="Your Portfolio" data={portPoint} fill="#f59e0b" shape="star" />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full" />Efficient Portfolios</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-yellow-500 rounded-full" />Your Portfolio</span>
          </div>
        </Card>

        {/* Portfolio Weights */}
        <Card>
          <CardHeader title="Portfolio Weights" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={PORTFOLIO_ASSETS} dataKey="weight" nameKey="ticker"
                cx="50%" cy="50%" outerRadius={90} innerRadius={45}
                label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ""} ${((percent ?? 0) * 100).toFixed(0)}%`}
                labelLine={{ stroke: "#475569" }}
              >
                {PORTFOLIO_ASSETS.map((asset, i) => (
                  <Cell key={i} fill={asset.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 11 }}
                formatter={(v: unknown) => [`${((v as number) * 100).toFixed(1)}%`, "Weight"]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {PORTFOLIO_ASSETS.map((a) => (
              <div key={a.ticker} className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }} />
                <span className="text-slate-400">{a.ticker}</span>
                <span className="text-slate-300 ml-auto">{(a.weight * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Portfolio Value */}
        <Card>
          <CardHeader title="Portfolio Performance" subtitle="120-day NAV history" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={portData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} interval={14} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} width={65}
                tickFormatter={(v) => `$${(v / 1e6).toFixed(2)}M`} domain={["auto", "auto"]} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 11 }}
                formatter={(v: unknown) => [`$${(v as number).toLocaleString()}`, "NAV"]} />
              <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#portGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Asset Details Table */}
        <Card>
          <CardHeader title="Holdings Summary" />
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700 text-slate-500">
                  <th className="text-left py-2">Asset</th>
                  <th className="text-right py-2">Weight</th>
                  <th className="text-right py-2">Return</th>
                  <th className="text-right py-2">Risk (σ)</th>
                  <th className="text-right py-2">Sharpe</th>
                </tr>
              </thead>
              <tbody>
                {PORTFOLIO_ASSETS.map((a) => (
                  <tr key={a.ticker} className="border-b border-slate-800 hover:bg-slate-800/30">
                    <td className="py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ background: a.color }} />
                        <span className="font-semibold text-white">{a.ticker}</span>
                      </div>
                    </td>
                    <td className="text-right text-slate-300">{(a.weight * 100).toFixed(0)}%</td>
                    <td className={`text-right font-medium ${a.returns > 0 ? "text-green-400" : "text-red-400"}`}>
                      {(a.returns * 100).toFixed(1)}%
                    </td>
                    <td className="text-right text-slate-300">{(a.risk * 100).toFixed(1)}%</td>
                    <td className="text-right text-white font-mono">{((a.returns - 0.05) / a.risk).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Correlation Matrix */}
      <Card>
        <CardHeader title="Correlation Matrix" subtitle="Asset return correlations (rolling 252-day)" />
        <div className="overflow-x-auto">
          <table className="text-xs border-collapse">
            <thead>
              <tr>
                <th className="w-16" />
                {tickers.map((t) => (
                  <th key={t} className="text-slate-400 font-medium px-3 py-2 text-center w-16">{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tickers.map((rowT, i) => (
                <tr key={rowT}>
                  <td className="text-slate-400 font-medium pr-3 py-1.5 text-right">{rowT}</td>
                  {tickers.map((colT, j) => (
                    <td key={colT} className="px-1 py-1.5 text-center">
                      <div
                        className="w-12 h-8 flex items-center justify-center rounded text-xs font-mono font-semibold mx-auto"
                        style={{
                          background: `${getColor(corr[i][j])}22`,
                          color: getColor(corr[i][j]),
                          border: `1px solid ${getColor(corr[i][j])}44`,
                        }}
                      >
                        {corr[i][j].toFixed(2)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex gap-4 text-xs text-slate-500 flex-wrap">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "#ef444422", border: "1px solid #ef444444" }} /> High positive (≥0.7)</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "#6b728022", border: "1px solid #6b728044" }} /> Low correlation</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded" style={{ background: "#22c55e22", border: "1px solid #22c55e44" }} /> Negative</span>
        </div>
      </Card>
    </div>
  );
}
