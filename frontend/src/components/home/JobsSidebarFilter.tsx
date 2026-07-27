import React from "react";

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
    <div
      className={`w-full md:w-60 bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-800/80 ${
        isOpen ? "block" : "hidden md:block"
      }`}
    >
      <div className="space-y-6">
        <div>
          <h4 className="font-bold text-sm text-white mb-3 tracking-wide">Sources</h4>
          {allSources.length > 0 ? (
            allSources.map((src) => (
              <label
                key={src}
                className="flex items-center gap-2.5 mb-2.5 text-sm text-slate-300 hover:text-white cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedSources.includes(src)}
                  onChange={() => onCheckboxToggle(src)}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                {src}
              </label>
            ))
          ) : (
            <p className="text-xs text-slate-500">No sources available</p>
          )}
        </div>

        <div className="pt-2 border-t border-slate-800"></div>
      </div>
    </div>
  );
}