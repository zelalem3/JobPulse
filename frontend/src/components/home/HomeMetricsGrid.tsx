import React from "react";
import { Database, Activity, Briefcase, Layers } from "lucide-react";

interface HomeMetricsGridProps {
  totalJobsLength: number;
  totalItems: number;
  allSourcesCount: number;
}

const metricCardClass =
  "bg-slate-900/70 backdrop-blur-xl p-4 sm:p-5 rounded-2xl shadow-lg border border-slate-800/70 hover:border-slate-700/80 hover:-translate-y-0.5 transition-all duration-200";

export default function HomeMetricsGrid({
  totalJobsLength,
  totalItems,
  allSourcesCount,
}: HomeMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className={metricCardClass}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 shrink-0">
            <Database size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider truncate">
              Total Jobs
            </p>
            <h3 className="font-black text-lg sm:text-xl text-white tracking-tight tabular-nums">
              {totalJobsLength.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      <div className={metricCardClass}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 shrink-0">
            <Activity size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider truncate">
              Live Feed
            </p>
            <h3 className="font-black text-lg sm:text-xl text-emerald-400 tracking-tight flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">Live</span>
            </h3>
          </div>
        </div>
      </div>

      <div className={metricCardClass}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 shrink-0">
            <Briefcase size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider truncate">
              Matching
            </p>
            <h3 className="font-black text-lg sm:text-xl text-white tracking-tight tabular-nums">
              {totalItems.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      <div className={metricCardClass}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/10 rounded-xl border border-violet-500/20 text-violet-400 shrink-0">
            <Layers size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider truncate">
              Sources
            </p>
            <h3 className="font-black text-lg sm:text-xl text-white tracking-tight tabular-nums">
              {allSourcesCount}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
