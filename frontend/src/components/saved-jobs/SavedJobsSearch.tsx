import React from "react";
import { Search, X } from "lucide-react";

interface SavedJobsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function SavedJobsSearch({
  searchTerm,
  onSearchChange,
}: SavedJobsSearchProps) {
  return (
    <div className="relative flex items-center gap-2 rounded-2xl bg-slate-900/70 border border-slate-800/70 px-3.5 py-2.5 shadow-lg focus-within:border-amber-500/35 focus-within:ring-2 focus-within:ring-amber-500/15 transition-all">
      <Search size={16} className="text-slate-500 shrink-0" />
      <input
        type="search"
        placeholder="Search by title, company, location, or source…"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-100 placeholder:text-slate-500 min-w-0"
        aria-label="Search saved jobs"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={() => onSearchChange("")}
          className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
