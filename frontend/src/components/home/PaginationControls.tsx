import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (newPage: number) => void;
}

export default function PaginationControls({
  currentPage,
  lastPage,
  onPageChange,
}: PaginationControlsProps) {
  return (
    <div className="flex justify-center items-center gap-3 pt-6">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-all hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white shadow-lg cursor-pointer inline-flex items-center gap-1.5"
      >
        <ChevronLeft size={16} />
        <span>Previous</span>
      </button>

      <span className="text-xs font-bold text-slate-300 bg-slate-900/60 px-4 py-2.5 rounded-2xl border border-slate-800/80 shadow-inner flex items-center gap-1.5">
        Page <span className="text-indigo-400 font-black">{currentPage}</span> of <span className="text-slate-100">{lastPage}</span>
      </span>

      <button
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl disabled:opacity-40 disabled:cursor-not-allowed font-semibold text-xs transition-all hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white shadow-lg cursor-pointer inline-flex items-center gap-1.5"
      >
        <span>Next</span>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}