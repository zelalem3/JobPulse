import React from "react";
import { Database, RefreshCw, Briefcase, Filter } from "lucide-react";

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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800 rounded-2xl border border-slate-700 text-slate-300">
            <Database size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Total Jobs
            </p>
            <h3 className="font-black text-xl text-white">
              {totalJobsLength}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800 rounded-2xl border border-slate-700 text-slate-300">
            <RefreshCw size={18} className="animate-spin" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Scraper
            </p>
            <h3 className="font-black text-xl text-emerald-400">
              Active
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800 rounded-2xl border border-slate-700 text-slate-300">
            <Briefcase size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Results
            </p>
            <h3 className="font-black text-xl text-white">
              {totalItems}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-800 rounded-2xl border border-slate-700 text-slate-300">
            <Filter size={18} />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Sources
            </p>
            <h3 className="font-black text-xl text-white">
              {allSourcesCount}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}