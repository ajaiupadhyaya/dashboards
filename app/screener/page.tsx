"use client";
import { useState, useMemo } from "react";
import { Card, CardHeader, PageHeader, Badge } from "@/components/ui";
import { SCREENER_DATA } from "@/lib/mockData";
import { Search, SlidersHorizontal, ChevronUp, ChevronDown } from "lucide-react";

type SortKey = keyof typeof SCREENER_DATA[0];
type SortDir = "asc" | "desc";

const SECTORS = ["All", ...Array.from(new Set(SCREENER_DATA.map((s) => s.sector)))];

export default function ScreenerPage() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [filters, setFilters] = useState({
    minPE: 0, maxPE: 200,
    minMarketCap: 0, maxMarketCap: 10000,
    minROE: -50, maxROE: 500,
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    return SCREENER_DATA
      .filter((s) => {
        const matchSearch = s.ticker.toLowerCase().includes(search.toLowerCase()) ||
          s.name.toLowerCase().includes(search.toLowerCase());
        const matchSector = sector === "All" || s.sector === sector;
        const matchPE = s.pe >= filters.minPE && s.pe <= filters.maxPE;
        const matchMCap = s.marketCap >= filters.minMarketCap && s.marketCap <= filters.maxMarketCap;
        const matchROE = s.roe >= filters.minROE && s.roe <= filters.maxROE;
        return matchSearch && matchSector && matchPE && matchMCap && matchROE;
      })
      .sort((a, b) => {
        const av = a[sortKey] as number;
        const bv = b[sortKey] as number;
        return sortDir === "asc" ? av - bv : bv - av;
      });
  }, [search, sector, sortKey, sortDir, filters]);

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-blue-400" />
      : <ChevronDown className="w-3 h-3 text-blue-400" />;
  };

  const cols: { key: SortKey; label: string; fmt?: (v: number) => string; colorize?: boolean }[] = [
    { key: "marketCap", label: "Mkt Cap ($B)", fmt: (v) => `$${v}B` },
    { key: "pe", label: "P/E Ratio", colorize: true },
    { key: "pb", label: "P/B Ratio" },
    { key: "ps", label: "P/S Ratio" },
    { key: "ev_ebitda", label: "EV/EBITDA" },
    { key: "roe", label: "ROE (%)", fmt: (v) => `${v.toFixed(1)}%`, colorize: true },
    { key: "dividend", label: "Div Yield", fmt: (v) => v > 0 ? `${v.toFixed(2)}%` : "—" },
    { key: "revenue_growth", label: "Rev Growth", fmt: (v) => `${v.toFixed(1)}%`, colorize: true },
    { key: "gross_margin", label: "Gross Margin", fmt: (v) => `${v.toFixed(1)}%` },
  ];

  return (
    <div className="p-8">
      <PageHeader title="Stock Screener" subtitle="Filter and sort stocks by fundamental metrics" />

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2 top-2" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ticker or name..."
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 pl-7 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Sector</label>
            <select value={sector} onChange={(e) => setSector(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500">
              {SECTORS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">P/E Range</label>
            <div className="flex items-center gap-2">
              <input type="number" value={filters.minPE} onChange={(e) => setFilters((f) => ({ ...f, minPE: +e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500" placeholder="Min" />
              <span className="text-slate-600">—</span>
              <input type="number" value={filters.maxPE} onChange={(e) => setFilters((f) => ({ ...f, maxPE: +e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500" placeholder="Max" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Market Cap ($B)</label>
            <div className="flex items-center gap-2">
              <input type="number" value={filters.minMarketCap} onChange={(e) => setFilters((f) => ({ ...f, minMarketCap: +e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500" placeholder="Min" />
              <span className="text-slate-600">—</span>
              <input type="number" value={filters.maxMarketCap} onChange={(e) => setFilters((f) => ({ ...f, maxMarketCap: +e.target.value }))}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1.5 text-white text-sm focus:outline-none focus:border-blue-500" placeholder="Max" />
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-slate-500">{filtered.length} results</span>
          <button onClick={() => { setSearch(""); setSector("All"); setFilters({ minPE: 0, maxPE: 200, minMarketCap: 0, maxMarketCap: 10000, minROE: -50, maxROE: 500 }); }}
            className="text-xs text-blue-400 hover:text-blue-300">Reset filters</button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-3 text-slate-500 text-xs font-medium whitespace-nowrap">Ticker</th>
                <th className="text-left py-3 px-3 text-slate-500 text-xs font-medium whitespace-nowrap">Name</th>
                <th className="text-left py-3 px-3 text-slate-500 text-xs font-medium whitespace-nowrap">Sector</th>
                {cols.map((col) => (
                  <th key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="text-right py-3 px-3 text-slate-500 text-xs font-medium cursor-pointer hover:text-white whitespace-nowrap select-none">
                    <div className="flex items-center justify-end gap-1">
                      {col.label}
                      <SortIcon col={col.key} />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.ticker} className="border-b border-slate-800 hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-white font-mono">{row.ticker}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 text-xs whitespace-nowrap">{row.name}</td>
                  <td className="py-2.5 px-3">
                    <Badge variant="info">{row.sector}</Badge>
                  </td>
                  {cols.map((col) => {
                    const val = row[col.key] as number;
                    const display = col.fmt ? col.fmt(val) : val.toFixed(1);
                    let colorClass = "text-slate-300";
                    if (col.colorize) {
                      if (col.key === "revenue_growth") {
                        colorClass = val > 15 ? "text-green-400" : val > 0 ? "text-green-300" : "text-red-400";
                      } else if (col.key === "roe") {
                        colorClass = val > 20 ? "text-green-400" : val > 0 ? "text-slate-300" : "text-red-400";
                      } else if (col.key === "pe") {
                        colorClass = val < 15 ? "text-green-400" : val > 50 ? "text-red-400" : "text-slate-300";
                      }
                    }
                    return (
                      <td key={col.key} className={`py-2.5 px-3 text-right font-mono text-xs ${colorClass}`}>
                        {display}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-slate-600">No stocks match your filters</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
