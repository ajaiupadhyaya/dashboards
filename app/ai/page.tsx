"use client";
import { useState } from "react";
import { Card, CardHeader, PageHeader, Badge } from "@/components/ui";
import { Bot, Send, Sparkles, TrendingUp, AlertTriangle, Lightbulb, BarChart2, RefreshCw } from "lucide-react";

const SAMPLE_PROMPTS = [
  "Analyze Apple (AAPL) Q4 2024 earnings and provide investment thesis",
  "What are the macro risks for tech sector in 2025?",
  "Compare NVIDIA vs AMD competitive positioning in AI chips",
  "Evaluate Fed policy impact on bond markets and credit spreads",
  "DCF valuation analysis for a SaaS company with 40% growth",
];

function generateMockAnalysis(prompt: string) {
  const ticker = prompt.match(/\b([A-Z]{2,5})\b/)?.[1] || "AAPL";
  return {
    summary: `Based on comprehensive analysis of ${ticker} and current market conditions, the company demonstrates strong fundamental characteristics with robust revenue growth driven by AI-powered product cycles and margin expansion. The stock appears moderately valued relative to sector peers with several near-term catalysts that could drive outperformance.`,
    keyInsights: [
      `Revenue growth of 12-15% CAGR expected through FY2026, underpinned by services monetization and hardware refresh cycle`,
      `Gross margins expanding 150-200bps annually as higher-margin software revenue mix increases to ~45% of total revenue`,
      `Strong free cash flow generation of $90B+ annually supports aggressive buyback program (~$110B authorized)`,
      `AI integration across product portfolio creates new monetization opportunities and reduces competitive moat erosion`,
      `Balance sheet with $160B+ in cash/securities provides strategic flexibility for M&A and capital returns`,
    ],
    risks: [
      { risk: "Regulatory headwinds in EU & US around antitrust and app store practices", severity: "High" },
      { risk: "China revenue exposure (~18% of total) subject to geopolitical risk and local competition", severity: "High" },
      { risk: "Consumer discretionary spending sensitivity to macro slowdown could pressure hardware sales", severity: "Medium" },
      { risk: "Valuation premium (28x P/E) leaves limited margin of safety in risk-off environments", severity: "Medium" },
      { risk: "AI competition from Google, Microsoft eroding some competitive advantages in services", severity: "Low" },
    ],
    opportunities: [
      "Vision Pro and spatial computing represent $30B+ TAM by 2028 as enterprise adoption accelerates",
      "Financial services expansion (Apple Pay Later, Apple Card) entering $150B+ addressable market",
      "India manufacturing ramp reduces supply chain concentration and opens largest smartphone growth market",
      "Health/wellness platform monetization from Apple Watch ecosystem with FDA clearances",
    ],
    valuation: {
      currentPrice: 188.42,
      targetLow: 175,
      targetBase: 215,
      targetHigh: 260,
      timeHorizon: "12 months",
      methodology: "Blended DCF (60%) and EV/EBITDA comparables (40%)",
    },
    rating: "Overweight",
    confidence: 78,
  };
}

export default function AIAnalysisPage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ReturnType<typeof generateMockAnalysis> | null>(null);

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setAnalysis(generateMockAnalysis(prompt));
    setLoading(false);
  };

  return (
    <div className="p-8">
      <PageHeader title="AI Financial Analysis" subtitle="Powered by quantitative models and market intelligence" />

      <Card className="mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-600/20 border border-blue-600/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask for market analysis, earnings breakdown, valuation, macro outlook, or investment thesis..."
              rows={3}
              className="w-full bg-transparent text-slate-200 placeholder-slate-600 text-sm resize-none focus:outline-none"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-2 flex-wrap">
                {SAMPLE_PROMPTS.slice(0, 3).map((p) => (
                  <button key={p} onClick={() => setPrompt(p)}
                    className="text-xs px-3 py-1 bg-slate-800 text-slate-400 rounded-full hover:text-white hover:bg-slate-700 transition-colors">
                    {p.slice(0, 40)}...
                  </button>
                ))}
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || !prompt.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors ml-4"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Sample prompts */}
      <div className="mb-6">
        <div className="text-xs text-slate-500 mb-3">Example queries:</div>
        <div className="flex gap-2 flex-wrap">
          {SAMPLE_PROMPTS.map((p) => (
            <button key={p} onClick={() => setPrompt(p)}
              className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-lg hover:border-blue-600/50 hover:text-blue-400 transition-colors">
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <Card className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
            <div className="text-slate-400 text-sm">Running quantitative analysis...</div>
            <div className="text-slate-600 text-xs mt-1">Processing market data, financials, and sentiment</div>
          </div>
        </Card>
      )}

      {analysis && !loading && (
        <div className="space-y-6">
          {/* Rating & Summary */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-white font-semibold">Analysis Summary</h3>
                  <p className="text-xs text-slate-500">AI confidence: {analysis.confidence}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={analysis.rating === "Overweight" ? "success" : analysis.rating === "Underweight" ? "danger" : "info"}>
                  {analysis.rating}
                </Badge>
                <div className="text-xs text-slate-500">Confidence</div>
                <div className="w-24 bg-slate-800 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${analysis.confidence}%` }} />
                </div>
                <span className="text-xs text-blue-400">{analysis.confidence}%</span>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Key Insights */}
            <Card>
              <CardHeader title="Key Insights" />
              <ul className="space-y-3">
                {analysis.keyInsights.map((insight, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-blue-600/20 border border-blue-600/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <TrendingUp className="w-3 h-3 text-blue-400" />
                    </div>
                    <span className="text-sm text-slate-300 leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Risks */}
            <Card>
              <CardHeader title="Risk Factors" />
              <ul className="space-y-3">
                {analysis.risks.map((r, i) => (
                  <li key={i} className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        r.severity === "High" ? "text-red-400" : r.severity === "Medium" ? "text-yellow-400" : "text-green-400"
                      }`} />
                      <span className="text-sm text-slate-300 leading-relaxed">{r.risk}</span>
                    </div>
                    <Badge variant={r.severity === "High" ? "danger" : r.severity === "Medium" ? "warning" : "success"}>
                      {r.severity}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Opportunities */}
            <Card>
              <CardHeader title="Growth Opportunities" />
              <ul className="space-y-3">
                {analysis.opportunities.map((opp, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-green-600/20 border border-green-600/30 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Lightbulb className="w-3 h-3 text-green-400" />
                    </div>
                    <span className="text-sm text-slate-300 leading-relaxed">{opp}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Price Target */}
            <Card>
              <CardHeader title="Price Target Analysis" />
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                  <span className="text-sm text-slate-400">Current Price</span>
                  <span className="text-lg font-bold text-white">${analysis.valuation.currentPrice}</span>
                </div>
                {[
                  { label: "Bull Case", value: analysis.valuation.targetHigh, color: "#10b981" },
                  { label: "Base Case", value: analysis.valuation.targetBase, color: "#3b82f6" },
                  { label: "Bear Case", value: analysis.valuation.targetLow, color: "#ef4444" },
                ].map((t) => (
                  <div key={t.label} className="flex justify-between items-center">
                    <span className="text-sm text-slate-400">{t.label} Target</span>
                    <div className="text-right">
                      <span className="text-base font-semibold" style={{ color: t.color }}>${t.value}</span>
                      <span className={`ml-2 text-xs ${t.value > analysis.valuation.currentPrice ? "text-green-400" : "text-red-400"}`}>
                        {t.value > analysis.valuation.currentPrice ? "+" : ""}
                        {(((t.value - analysis.valuation.currentPrice) / analysis.valuation.currentPrice) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-slate-800 text-xs text-slate-500">
                  <div>Methodology: {analysis.valuation.methodology}</div>
                  <div className="mt-1">Time Horizon: {analysis.valuation.timeHorizon}</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Disclaimer */}
          <div className="text-xs text-slate-600 bg-slate-900 border border-slate-800 rounded-lg p-4">
            ⚠ This analysis is generated by a simulated AI model using mock data for demonstration purposes only. 
            It does not constitute financial advice and should not be used for actual investment decisions. 
            Always consult a qualified financial advisor before making investment decisions.
          </div>
        </div>
      )}
    </div>
  );
}
