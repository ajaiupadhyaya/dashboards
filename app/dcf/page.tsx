"use client";
import { useState, useMemo } from "react";
import { Card, CardHeader, PageHeader } from "@/components/ui";
import { runDCF, runSensitivityAnalysis, DCFInputs } from "@/lib/finance";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ComposedChart, Line, Cell, LabelList,
} from "recharts";

const DEFAULT_INPUTS: DCFInputs = {
  revenue: 385000,
  revenueGrowthRates: [8, 10, 12, 10, 8],
  ebitdaMargins: [30, 31, 32, 33, 33],
  daPercent: 3,
  capexPercent: 5,
  nwcChangePercent: 1,
  taxRate: 21,
  wacc: 9,
  terminalGrowthRate: 3,
  netDebt: 50000,
  sharesOutstanding: 15500,
};

const WACC_RANGE = [7, 8, 9, 10, 11];
const TGR_RANGE = [2, 2.5, 3, 3.5, 4];

export default function DCFPage() {
  const [inputs, setInputs] = useState<DCFInputs>(DEFAULT_INPUTS);

  const result = useMemo(() => runDCF(inputs), [inputs]);
  const sensitivity = useMemo(() => runSensitivityAnalysis(inputs, WACC_RANGE, TGR_RANGE), [inputs]);

  const updateInput = (key: keyof DCFInputs, value: number | number[]) => {
    setInputs((prev) => ({ ...prev, [key]: value }));
  };

  const waterfallData = [
    { name: "PV FCFs", value: result.pvFCF, start: 0, color: "#3b82f6" },
    { name: "PV Terminal", value: result.pvTerminal, start: result.pvFCF, color: "#8b5cf6" },
    { name: "Enterprise Value", value: result.enterpriseValue, start: 0, color: "#10b981", total: true },
    { name: "Less: Net Debt", value: -inputs.netDebt, start: result.enterpriseValue, color: "#ef4444" },
    { name: "Equity Value", value: result.equityValue, start: 0, color: "#22c55e", total: true },
  ];

  const fmt = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}B` : n >= 1e3 ? `$${(n / 1e3).toFixed(0)}M` : `$${n.toFixed(0)}`;

  return (
    <div className="p-8">
      <PageHeader title="DCF Valuation" subtitle="Discounted Cash Flow model with sensitivity analysis" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Inputs */}
        <Card className="lg:col-span-1">
          <CardHeader title="Model Assumptions" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <label className="text-slate-400">Base Revenue ($M)</label>
              <input type="number" value={inputs.revenue} onChange={(e) => updateInput("revenue", +e.target.value)}
                className="w-28 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono text-right focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-slate-400">WACC (%)</label>
              <input type="number" value={inputs.wacc} step={0.5} onChange={(e) => updateInput("wacc", +e.target.value)}
                className="w-28 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono text-right focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-slate-400">Terminal Growth Rate (%)</label>
              <input type="number" value={inputs.terminalGrowthRate} step={0.25} onChange={(e) => updateInput("terminalGrowthRate", +e.target.value)}
                className="w-28 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono text-right focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-slate-400">Tax Rate (%)</label>
              <input type="number" value={inputs.taxRate} onChange={(e) => updateInput("taxRate", +e.target.value)}
                className="w-28 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono text-right focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-slate-400">D&A (% rev)</label>
              <input type="number" value={inputs.daPercent} step={0.5} onChange={(e) => updateInput("daPercent", +e.target.value)}
                className="w-28 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono text-right focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-slate-400">CapEx (% rev)</label>
              <input type="number" value={inputs.capexPercent} step={0.5} onChange={(e) => updateInput("capexPercent", +e.target.value)}
                className="w-28 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono text-right focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-slate-400">Net Debt ($M)</label>
              <input type="number" value={inputs.netDebt} onChange={(e) => updateInput("netDebt", +e.target.value)}
                className="w-28 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono text-right focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex justify-between items-center">
              <label className="text-slate-400">Shares Outstanding (M)</label>
              <input type="number" value={inputs.sharesOutstanding} onChange={(e) => updateInput("sharesOutstanding", +e.target.value)}
                className="w-28 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-xs font-mono text-right focus:outline-none focus:border-blue-500" />
            </div>

            <div className="pt-3 border-t border-slate-800">
              <div className="text-xs text-slate-500 mb-2">Revenue Growth Rates (%)</div>
              <div className="flex gap-1">
                {inputs.revenueGrowthRates.map((g, i) => (
                  <input key={i} type="number" value={g} step={1}
                    onChange={(e) => {
                      const arr = [...inputs.revenueGrowthRates];
                      arr[i] = +e.target.value;
                      updateInput("revenueGrowthRates", arr);
                    }}
                    className="w-12 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-white text-xs font-mono text-center focus:outline-none focus:border-blue-500"
                  />
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-2">EBITDA Margins (%)</div>
              <div className="flex gap-1">
                {inputs.ebitdaMargins.map((m, i) => (
                  <input key={i} type="number" value={m} step={0.5}
                    onChange={(e) => {
                      const arr = [...inputs.ebitdaMargins];
                      arr[i] = +e.target.value;
                      updateInput("ebitdaMargins", arr);
                    }}
                    className="w-12 bg-slate-800 border border-slate-700 rounded px-1 py-1 text-white text-xs font-mono text-center focus:outline-none focus:border-blue-500"
                  />
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader title="Valuation Summary" />
          <div className="text-center mb-6">
            <div className="text-xs text-slate-500">Implied Share Price</div>
            <div className="text-5xl font-bold text-green-400 my-2">${result.impliedPrice.toFixed(2)}</div>
          </div>
          <div className="space-y-2">
            {[
              { label: "PV of FCFs", value: fmt(result.pvFCF), color: "#3b82f6" },
              { label: "PV of Terminal Value", value: fmt(result.pvTerminal), color: "#8b5cf6" },
              { label: "Enterprise Value", value: fmt(result.enterpriseValue), color: "#10b981" },
              { label: "Less: Net Debt", value: `(${fmt(inputs.netDebt)})`, color: "#ef4444" },
              { label: "Equity Value", value: fmt(result.equityValue), color: "#22c55e" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-2 border-b border-slate-800 last:border-0">
                <span className="text-sm text-slate-400">{row.label}</span>
                <span className="text-sm font-semibold" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-center">
            <div className="bg-slate-800 rounded p-2">
              <div className="text-slate-500">Terminal Value %</div>
              <div className="text-white font-semibold">{((result.pvTerminal / result.enterpriseValue) * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-slate-800 rounded p-2">
              <div className="text-slate-500">FCF Multiple</div>
              <div className="text-white font-semibold">{(result.enterpriseValue / result.projections[0].fcf).toFixed(1)}x</div>
            </div>
          </div>
        </Card>

        {/* Projections Chart */}
        <Card>
          <CardHeader title="Revenue & FCF Projections" />
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={result.projections} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} width={55}
                tickFormatter={(v) => `$${(v / 1e3).toFixed(0)}B`} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0", fontSize: 11 }}
                formatter={(v: unknown) => [`$${((v as number) / 1e3).toFixed(0)}B`]} />
              <Bar dataKey="revenue" fill="#3b82f6" opacity={0.6} name="Revenue" radius={[2, 2, 0, 0]} />
              <Bar dataKey="ebitda" fill="#8b5cf6" opacity={0.6} name="EBITDA" radius={[2, 2, 0, 0]} />
              <Line type="monotone" dataKey="fcf" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} name="FCF" />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Projections Table */}
      <Card className="mb-6">
        <CardHeader title="5-Year Financial Projections" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-xs">
                <th className="text-left py-2 pr-4">Metric</th>
                {result.projections.map((p) => (
                  <th key={p.year} className="text-right py-2 px-3">{p.year}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { label: "Revenue ($M)", key: "revenue" as const },
                { label: "EBITDA ($M)", key: "ebitda" as const },
                { label: "EBITDA Margin", key: "ebitdaMargin" as const },
                { label: "Free Cash Flow ($M)", key: "fcf" as const },
                { label: "PV of FCF ($M)", key: "pvFCF" as const },
              ].map(({ label, key }) => (
                <tr key={label} className="border-b border-slate-800 hover:bg-slate-800/30">
                  <td className="py-2 pr-4 text-slate-400 text-xs">{label}</td>
                  {result.projections.map((p, i) => (
                    <td key={i} className="py-2 px-3 text-right text-white font-mono text-xs">
                      {key === "ebitdaMargin" ? `${p[key]}%` : `$${p[key].toLocaleString()}`}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Sensitivity Analysis */}
      <Card>
        <CardHeader title="Sensitivity Analysis" subtitle="Implied Share Price — WACC vs. Terminal Growth Rate" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-2 px-3 text-slate-400 text-xs">WACC \ TGR</th>
                {TGR_RANGE.map((t) => (
                  <th key={t} className="text-right py-2 px-3 text-blue-400 text-xs">{t}%</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensitivity.map((row, i) => (
                <tr key={i} className="border-b border-slate-800">
                  <td className="py-2 px-3 text-blue-400 font-medium text-xs">{row.wacc}</td>
                  {TGR_RANGE.map((t) => {
                    const val = row[`tgr_${t}`] as number;
                    const basePrice = result.impliedPrice;
                    const diff = ((val - basePrice) / basePrice) * 100;
                    return (
                      <td key={t} className={`py-2 px-3 text-right text-xs font-mono font-semibold ${
                        diff > 10 ? "text-green-400" : diff > 0 ? "text-green-300" : diff > -10 ? "text-red-300" : "text-red-400"
                      } ${Math.abs(inputs.wacc - WACC_RANGE[i]) < 0.1 && t === inputs.terminalGrowthRate ? "bg-blue-900/30 ring-1 ring-blue-600 rounded" : ""}`}>
                        ${val.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded-full" /> &gt;10% above base</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full" /> &gt;10% below base</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-600 rounded-full" /> Base case</span>
        </div>
      </Card>
    </div>
  );
}
