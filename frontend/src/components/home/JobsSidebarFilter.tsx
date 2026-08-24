import React from "react";
import { Filter } from "lucide-react";

interface JobsSidebarFilterProps {
  allSources: string[];
  selectedSources: string[];
  onCheckboxToggle: (source: string) => void;
  isOpen: boolean;
}

export default function JobsSidebarFilter({
  allSources,
  selectedSources,
  onCheckboxToggle,
  isOpen,
}: JobsSidebarFilterProps) {
  return (
    <aside
      className={`w-full md:w-64 bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl border border-slate-800/80 ${
        isOpen ? "block" : "hidden md:block"
      }`}
    >
      <div className="space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800/80 text-white font-bold text-sm tracking-wide">
          <Filter size={16} className="text-indigo-400" />
          <span>Filter Sources</span>
        </div>

        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {allSources.length > 0 ? (
            allSources.map((src) => {
              const isChecked = selectedSources.includes(src);
              return (
                <label
                  key={src}
                  className={`flex items-center gap-3 p-2 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                    isChecked 
                      ? "bg-indigo-500/10 border border-indigo-500/30 text-white" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onCheckboxToggle(src)}
                    className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer w-4 h-4"
                  />
                  <span className="truncate">{src}</span>
                </label>
              );
            })
          ) : (
            <p className="text-xs text-slate-500 italic py-2">No active sources available</p>
          )}
        </div>
      </div>
    </aside>
  );
}