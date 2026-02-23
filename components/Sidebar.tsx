"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  BookOpen,
  Calculator,
  PieChart,
  Shuffle,
  Globe,
  Bot,
  Search,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/stocks", label: "Stock Analysis", icon: TrendingUp },
  { href: "/options", label: "Options Pricing", icon: BookOpen },
  { href: "/dcf", label: "DCF Valuation", icon: Calculator },
  { href: "/portfolio", label: "Portfolio", icon: PieChart },
  { href: "/montecarlo", label: "Monte Carlo", icon: Shuffle },
  { href: "/macro", label: "Macro Indicators", icon: Globe },
  { href: "/ai", label: "AI Analysis", icon: Bot },
  { href: "/screener", label: "Screener", icon: Search },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">FinResearch</div>
            <div className="text-xs text-slate-400">Pro Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800 rounded-lg p-3">
          <div className="text-xs text-slate-400">Market Status</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">NYSE Open</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Last update: just now</div>
        </div>
      </div>
    </aside>
  );
}
