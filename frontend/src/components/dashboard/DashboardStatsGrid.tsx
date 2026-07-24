import React from "react";
import { Briefcase, TrendingUp, Zap } from "lucide-react";
import { Stats } from "../../types/dashboard";

interface DashboardStatsGridProps {
  stats: Stats | null;
}

export default function DashboardStatsGrid({ stats }: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-emerald-950/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80 hover:border-emerald-700/60 transition-all group">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
        <div className="flex justify-between items-center relative z-10">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Jobs</h3>
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 rounded-2xl shadow-inner">
            <Briefcase size={18} />
          </div>
        </div>
        <p className="text-4xl font-black text-white mt-4 relative z-10">{stats?.totalJobs ?? 0}</p>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-blue-950/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80 hover:border-blue-700/60 transition-all group">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
        <div className="flex justify-between items-center relative z-10">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">New Today</h3>
          <div className="p-3 bg-blue-950/80 border border-blue-800/60 text-blue-400 rounded-2xl shadow-inner">
            <TrendingUp size={18} />
          </div>
        </div>
        <p className="text-4xl font-black text-white mt-4 relative z-10">{stats?.newToday ?? 0}</p>
      </div>

      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-amber-950/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80 hover:border-amber-700/60 transition-all group">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
        <div className="flex justify-between items-center relative z-10">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Active Jobs</h3>
          <div className="p-3 bg-amber-950/80 border border-amber-800/60 text-amber-400 rounded-2xl shadow-inner">
            <Zap size={18} />
          </div>
        </div>
        <p className="text-4xl font-black text-white mt-4 relative z-10">{stats?.activeJobs ?? 0}</p>
      </div>
    </div>
  );
}