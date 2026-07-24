import React from "react";

interface JobsPaginationControlsProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (newPage: number) => void;
}

export default function JobsPaginationControls({
  currentPage,
  lastPage,
  onPageChange,
}: JobsPaginationControlsProps) {
  return (
    <div className="flex justify-center items-center gap-4 mt-10">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="px-5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl disabled:opacity-40 font-semibold text-sm transition-all hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white shadow-lg cursor-pointer"
      >
        Previous
      </button>

      <span className="text-sm font-bold text-slate-300 bg-slate-900/60 px-4 py-2.5 rounded-2xl border border-slate-800/80 shadow-inner flex items-center gap-1.5">
        Page <span className="text-emerald-400 font-black">{currentPage}</span> of{" "}
        <span className="text-slate-100">{lastPage}</span>
      </span>

      <button
        disabled={currentPage === lastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="px-5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl disabled:opacity-40 font-semibold text-sm transition-all hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white shadow-lg cursor-pointer"
      >
        Next
      </button>
    </div>
  );
}