
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
    <div
      className="
        group relative flex items-center gap-3
        rounded-2xl border border-slate-800/80
        bg-slate-900/60 px-4 py-3.5
        shadow-lg shadow-black/10 backdrop-blur-xl
        transition-all duration-300
        hover:border-slate-700
        focus-within:border-indigo-500/60
        focus-within:bg-slate-900/90
        focus-within:shadow-indigo-950/20
        focus-within:ring-4 focus-within:ring-indigo-500/10
      "
    >
      {/* Search icon */}
      <div
        className="
          flex h-10 w-10 shrink-0 items-center justify-center
          rounded-xl border border-slate-800
          bg-gradient-to-br from-slate-800/90 to-slate-950
          transition-all duration-300
          group-focus-within:border-indigo-500/30
          group-focus-within:shadow-md
          group-focus-within:shadow-indigo-500/10
        "
      >
        <Search
          size={18}
          strokeWidth={2}
          className="
            text-slate-500 transition-colors duration-300
            group-focus-within:text-indigo-400
          "
        />
      </div>

      {/* Input */}
      <div className="min-w-0 flex-1">
        <label
          htmlFor="saved-jobs-search"
          className="
            mb-0.5 block text-[10px] font-bold uppercase
            tracking-[0.16em] text-slate-500
            transition-colors duration-300
            group-focus-within:text-indigo-400
          "
        >
          Find a saved job
        </label>

        <input
          id="saved-jobs-search"
          type="search"
          placeholder="Search by title, company, or location..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full border-none bg-transparent p-0
            text-sm font-medium text-slate-100
            outline-none ring-0 placeholder:text-slate-600
            focus:outline-none focus:ring-0
          "
          aria-label="Search saved jobs"
          autoComplete="off"
        />
      </div>

      {/* Right-side actions */}
      <div className="flex shrink-0 items-center gap-2">
        {!searchTerm && (
          <div
            className="
              hidden items-center gap-1.5 rounded-lg
              border border-slate-800/80 bg-slate-950/60
              px-2.5 py-2 text-[10px] font-medium
              text-slate-500 lg:flex
            "
          >
            <SlidersHorizontal size={12} />
            <span>Search jobs</span>
          </div>
        )}

        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="
              flex h-8 w-8 items-center justify-center
              rounded-xl border border-slate-800
              bg-slate-950/70 text-slate-500
              transition-all duration-200
              hover:border-indigo-500/30
              hover:bg-indigo-500/10 hover:text-indigo-300
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-indigo-500
            "
            aria-label="Clear search"
            title="Clear search"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  );
}
