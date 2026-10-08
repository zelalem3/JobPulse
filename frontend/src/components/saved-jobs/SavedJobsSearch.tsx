import React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";

interface SavedJobsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function SavedJobsSearch({
  searchTerm,
  onSearchChange,
}: SavedJobsSearchProps) {
  return (
    <div className="group flex items-center gap-3 rounded-2xl bg-slate-900/70 backdrop-blur-xl border border-slate-800/80 px-4 py-3 shadow-lg transition-all duration-200 focus-within:border-indigo-500/40 focus-within:ring-4 focus-within:ring-indigo-500/5">

      {/* Search icon */}
      <div className="shrink-0 w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center">
        <Search
          size={15}
          className="text-slate-500 group-focus-within:text-indigo-400 transition-colors"
        />
      </div>

      {/* Input */}
      <div className="flex-1 min-w-0">

        <input
          type="search"
          placeholder="Search your saved jobs..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-sm font-medium text-slate-100 placeholder:text-slate-600"
          aria-label="Search saved jobs"
        />

      </div>

      {/* Search hint */}
      {!searchTerm && (
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-600">
          <SlidersHorizontal size={12} />
          <span>Title · Company · Location</span>
        </div>
      )}

      {/* Clear */}
      {searchTerm && (
        <button
          type="button"
          onClick={() => onSearchChange("")}
          className="shrink-0 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}

    </div>
  );
}
