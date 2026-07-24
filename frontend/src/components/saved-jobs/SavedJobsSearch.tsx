import React from "react";
import { Search } from "lucide-react";

interface SavedJobsSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export default function SavedJobsSearch({
  searchTerm,
  onSearchChange,
}: SavedJobsSearchProps) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-4 border border-slate-800/80 shadow-xl flex items-center">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl w-full shadow-inner">
        <Search size={16} className="text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search saved jobs by title, company, location, or source..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="bg-transparent border-none outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500 w-full"
        />
      </div>
    </div>
  );
}