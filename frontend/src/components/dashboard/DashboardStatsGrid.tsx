import React from "react";
import { Briefcase, TrendingUp, Zap } from "lucide-react";
import { Stats } from "../../types/dashboard";

interface DashboardStatsGridProps {
  stats: Stats | null;
}

const cards = [
  {
    key: "totalJobs" as const,
    label: "Total Jobs",
    hint: "All listings in the system",
    icon: Briefcase,
    accent: {
      gradient: "from-emerald-950/40",
      border: "hover:border-emerald-700/50",
      glow: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
      iconBg: "bg-emerald-950/80 border-emerald-800/50 text-emerald-400",
    },
  },
  {
    key: "newToday" as const,
    label: "New Today",
    hint: "Posted in the last 24h",
    icon: TrendingUp,
    accent: {
      gradient: "from-blue-950/40",
      border: "hover:border-blue-700/50",
      glow: "bg-blue-500/10 group-hover:bg-blue-500/20",
      iconBg: "bg-blue-950/80 border-blue-800/50 text-blue-400",
    },
  },
  {
    key: "activeJobs" as const,
    label: "Active Jobs",
    hint: "Currently open roles",
    icon: Zap,
    accent: {
      gradient: "from-amber-950/40",
      border: "hover:border-amber-700/50",
      glow: "bg-amber-500/10 group-hover:bg-amber-500/20",
      iconBg: "bg-amber-950/80 border-amber-800/50 text-amber-400",
    },
  },
];

export default function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
      {cards.map(({ key, label, hint, icon: Icon, accent }) => (
        <div
          key={key}
          className={`
            relative overflow-hidden
            bg-gradient-to-br from-slate-900/90 via-slate-900/70 ${accent.gradient}
            backdrop-blur-xl p-5 sm:p-6 rounded-2xl sm:rounded-3xl
            shadow-xl border border-slate-800/70
            ${accent.border}
            transition-all duration-300 group
          `}
        >
          <div
            className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full blur-2xl transition-all ${accent.glow}`}
          />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {label}
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">
                {hint}
              </p>
            </div>
            <div
              className={`p-2.5 border rounded-xl shadow-inner ${accent.iconBg}`}
            >
              <Icon size={16} />
            </div>
          </div>
          <p className="text-3xl sm:text-4xl font-black text-white mt-4 relative z-10 tabular-nums tracking-tight">
            {(stats?.[key] ?? 0).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
