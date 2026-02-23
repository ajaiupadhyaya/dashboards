// Shared UI components

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  change,
  changePercent,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: string | number;
  change?: number;
  changePercent?: number;
  prefix?: string;
  suffix?: string;
}) {
  const isPositive = (change ?? 0) >= 0;
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">{label}</div>
      <div className="text-2xl font-bold text-white">
        {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-1 text-sm font-medium ${isPositive ? "text-green-400" : "text-red-400"}`}>
          <span>{isPositive ? "▲" : "▼"}</span>
          <span>{Math.abs(change).toFixed(2)}</span>
          {changePercent !== undefined && (
            <span className="text-xs opacity-80">({Math.abs(changePercent).toFixed(2)}%)</span>
          )}
        </div>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}

export function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "success" | "danger" | "warning" | "info" }) {
  const variants = {
    default: "bg-slate-700 text-slate-300",
    success: "bg-green-900/50 text-green-400 border border-green-800",
    danger: "bg-red-900/50 text-red-400 border border-red-800",
    warning: "bg-yellow-900/50 text-yellow-400 border border-yellow-800",
    info: "bg-blue-900/50 text-blue-400 border border-blue-800",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}
