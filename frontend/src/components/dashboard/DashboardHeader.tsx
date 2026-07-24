import React from "react";
import { Sparkles } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
          Dashboard <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </h1>
        <p className="text-sm font-semibold text-slate-400">Your career insights and tailored career metrics</p>
      </div>
      <div className="px-4 py-2 bg-gradient-to-r from-emerald-950/80 to-blue-950/80 border border-emerald-800/60 rounded-2xl flex items-center gap-2 shadow-xl">
        <Sparkles size={16} className="text-emerald-400" />
        <span className="text-xs font-bold text-emerald-300">System Fully Active</span>
      </div>
    </div>
  );
}