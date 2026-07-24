import React from "react";

interface SourceFilterBarProps {
  allSources: string[];
  selectedSource: string;
  onSelectSource: (source: string) => void;
}

export default function SourceFilterBar({
  allSources,
  selectedSource,
  onSelectSource,
}: SourceFilterBarProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
      <button
        onClick={() => onSelectSource("All")}
        className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
          selectedSource === "All"
            ? "bg-slate-800 text-white border-slate-700 shadow-lg"
            : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200"
        }`}
      >
        All Sources
      </button>
      {allSources.map((src) => (
        <button
          key={src}
          onClick={() => onSelectSource(src)}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
            selectedSource === src
              ? "bg-slate-800 text-white border-slate-700 shadow-lg"
              : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200"
          }`}
        >
          {src}
        </button>
      ))}
    </div>
  );
}