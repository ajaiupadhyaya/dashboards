"use client";
import { MetricCard, Card, CardHeader } from "@/components/ui";
import { generateOHLCData } from "@/lib/mockData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

const marketData = generateOHLCData(90, 4800, 0.008, 0.0005);
const nasdaqData = generateOHLCData(90, 16800, 0.01, 0.0006);
const btcData = generateOHLCData(90, 42000, 0.025, 0.001);

const recentActivity = [
  { time: "09:32", action: "Buy", ticker: "AAPL", qty: 100, price: 188.42, pnl: 245.80 },
  { time: "10:15", action: "Sell", ticker: "NVDA", qty: 50, price: 724.18, pnl: 1842.50 },
  { time: "11:44", action: "Buy", ticker: "SPY", qty: 200, price: 480.22, pnl: -125.40 },
  { time: "13:02", action: "Buy", ticker: "MSFT", qty: 75, price: 415.30, pnl: 380.25 },
  { time: "14:30", action: "Sell", ticker: "TSLA", qty: 30, price: 195.64, pnl: -520.80 },
];

const sectorData = [
  { sector: "Technology", ret: 1.42 },
  { sector: "Healthcare", ret: 0.68 },
  { sector: "Financials", ret: 0.45 },
  { sector: "Energy", ret: -0.82 },
  { sector: "Consumer Disc.", ret: 0.31 },
  { sector: "Utilities", ret: -1.12 },
  { sector: "Materials", ret: 0.22 },
];

export default function DashboardPage() {
  const last = marketData[marketData.length - 1];
  const prev = marketData[marketData.length - 2];
  const spyChange = last.close - prev.close;
  const spyChangePct = (spyChange / prev.close) * 100;

  const lastNq = nasdaqData[nasdaqData.length - 1];
  const prevNq = nasdaqData[nasdaqData.length - 2];
  const nqChange = lastNq.close - prevNq.close;

  const lastBtc = btcData[btcData.length - 1];
  const prevBtc = btcData[btcData.length - 2];
  const btcChange = lastBtc.close - prevBtc.close;

  const chartData = marketData.slice(-60).map((d) => ({ date: d.date.slice(5), value: d.close }));
  const volumeData = marketData.slice(-30).map((d) => ({ date: d.date.slice(5), volume: +(d.volume / 1e6).toFixed(1) }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Market Overview</h1>
        <p className="text-slate-400 mt-1">Professional financial research & analytics platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="S&P 500" value={last.close.toFixed(2)} change={spyChange} changePercent={spyChangePct} prefix="$" />
        <MetricCard label="NASDAQ" value={lastNq.close.toFixed(2)} change={nqChange} changePercent={(nqChange / prevNq.close) * 100} prefix="$" />
        <MetricCard label="Bitcoin" value={lastBtc.close.toFixed(0)} change={btcChange} changePercent={(btcChange / prevBtc.close) * 100} prefix="$" />
        <MetricCard label="VIX" value="16.42" change={-1.23} changePercent={-6.97} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="S&P 500 Index" subtitle="60-day price history" />
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="spyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} interval={9} />
                <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} domain={["auto", "auto"]} width={55} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0" }} labelStyle={{ color: "#94a3b8" }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#spyGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <Card>
          <CardHeader title="Portfolio Summary" />
          <div className="space-y-3">
            {[
              { label: "Total Value", value: "$2,847,420", pos: null },
              { label: "Day P&L", value: "+$12,340", pos: true },
              { label: "Total Return", value: "+$384,920", pos: true },
              { label: "Beta", value: "1.12", pos: null },
              { label: "Sharpe Ratio", value: "1.84", pos: null },
              { label: "Max Drawdown", value: "-8.4%", pos: false },
            ].map((item) => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-800 last:border-0">
                <span className="text-sm text-slate-400">{item.label}</span>
                <span className={`text-sm font-semibold ${item.pos === true ? "text-green-400" : item.pos === false ? "text-red-400" : "text-white"}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Market Volume" subtitle="30-day (millions)" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={volumeData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} interval={4} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} width={35} />
              <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#e2e8f0" }} />
              <Bar dataKey="volume" fill="#3b82f6" opacity={0.8} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Sector Performance" subtitle="Today" />
          <div className="space-y-2 mt-2">
            {sectorData.map((s) => (
              <div key={s.sector} className="flex items-center gap-2">
                <span className="text-xs text-slate-400 w-28 shrink-0">{s.sector}</span>
                <div className="flex-1 bg-slate-800 rounded-full h-1.5 relative">
                  <div
                    className={`h-1.5 rounded-full ${s.ret >= 0 ? "bg-green-500" : "bg-red-500"}`}
                    style={{ width: `${Math.min(Math.abs(s.ret) * 30 + 10, 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-medium w-12 text-right ${s.ret >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {s.ret > 0 ? "+" : ""}{s.ret}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Recent Trades" />
          <div className="space-y-2">
            {recentActivity.map((t, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${t.action === "Buy" ? "bg-green-900/50 text-green-400" : "bg-red-900/50 text-red-400"}`}>
                    {t.action}
                  </span>
                  <span className="text-sm font-medium text-white">{t.ticker}</span>
                  <span className="text-xs text-slate-500">{t.qty}sh</span>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">${t.price}</div>
                  <div className={`text-xs font-medium ${t.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                    {t.pnl >= 0 ? "+" : ""}${t.pnl.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
