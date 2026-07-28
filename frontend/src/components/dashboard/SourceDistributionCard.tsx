import React from "react";
import { SourceDistribution } from "../../types/dashboard";
import { Globe } from "lucide-react";

interface SourceDistributionProps {
  sources: SourceDistribution[];
}

export default function SourceDistributionCard({ sources }: SourceDistributionProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="text-blue-400" size={20} />
              Job Sources
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution across ingestion channels</p>
          </div>
        </div>

        <div className="space-y-4">
          {sources.map((item, index) => (
            <div key={index} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">{item.source}</span>
                <span className="text-slate-400">
                  {item.total} jobs ({item.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden p-0.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}

          {sources.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-10">No source data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}