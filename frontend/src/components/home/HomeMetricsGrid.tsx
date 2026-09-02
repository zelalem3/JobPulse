import React from "react";
import { Database, Activity, Briefcase, Layers } from "lucide-react";

interface HomeMetricsGridProps {
  totalJobsLength: number;
  totalItems: number;
  allSourcesCount: number;
}

export default function HomeMetricsGrid({
  totalJobsLength,
  totalItems,
  allSourcesCount,
}: HomeMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      
      <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
            <Database size={18} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Total Database
            </p>
            <h3 className="font-black text-xl text-white tracking-tight">
              {totalJobsLength.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
            <Activity size={18} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Live Updates
            </p>
            <h3 className="font-black text-xl text-emerald-400 tracking-tight flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Updated continuously
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
            <Briefcase size={18} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Filtered Results
            </p>
            <h3 className="font-black text-xl text-white tracking-tight">
              {totalItems.toLocaleString()}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-slate-800/80 hover:border-slate-700/80 transition-all">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-violet-500/10 rounded-2xl border border-violet-500/20 text-violet-400">
            <Layers size={18} />
          </div>
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
              Active Sources
            </p>
            <h3 className="font-black text-xl text-white tracking-tight">
              {allSourcesCount}
            </h3>
          </div>
        </div>
      </div>

    </div>
  );
}