import React from "react";
import { Sparkles } from "lucide-react";

export default function DashboardHeader() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {greeting}
        </p>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
          Dashboard
          <span
            className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
            aria-hidden
          />
        </h1>
        <p className="text-sm text-slate-400 font-medium">
          Career insights, trends, and tailored recommendations
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-950/50 border border-emerald-800/50 rounded-2xl shadow-lg">
        <Sparkles size={14} className="text-emerald-400" />
        <span className="text-xs font-bold text-emerald-300">
          System active
        </span>
      </div>
    </div>
  );
}
