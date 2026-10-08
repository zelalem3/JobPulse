import React from "react";
import { SourceDistribution } from "../../types/dashboard";
import { Globe } from "lucide-react";

interface SourceDistributionProps {
  sources: SourceDistribution[];
}

export default function SourceDistributionCard({
  sources,
}: SourceDistributionProps) {
  return (
    <div className="h-full bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-800/70 flex flex-col">
      <div className="mb-5">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Globe className="text-blue-400" size={18} />
          Job Sources
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Distribution across channels
        </p>
      </div>

      <div className="space-y-4 flex-1">
        {sources.map((item, index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold gap-2">
              <span className="text-slate-300 truncate">{item.source}</span>
              <span className="text-slate-500 shrink-0 tabular-nums">
                {item.total} ({item.percentage}%)
              </span>
            </div>
            <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, item.percentage)}%` }}
              />
            </div>
          </div>
        ))}

        {sources.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-10">
            No source data available.
          </p>
        )}
      </div>
    </div>
  );
}
