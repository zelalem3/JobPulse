import React, { useState } from "react";
import { ExternalLink, Bookmark, BookmarkCheck, Share2, Check } from "lucide-react";
import { JobDetails } from "../../types/jobDetails";

interface JobDetailsHeaderProps {
  job: JobDetails;
  isSaving: boolean;
  onToggleSave: () => void;
}

export default function JobDetailsHeader({
  job,
  isSaving,
  onToggleSave,
}: JobDetailsHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="space-y-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold text-xs rounded-xl tracking-wide shadow-inner">
            {job.source}
          </span>
          <span className="px-3 py-1 bg-slate-800/90 border border-slate-700/80 text-slate-300 font-semibold text-xs rounded-xl tracking-wide">
            {job.type}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
          {(job.title || "").replace(/\*\*/g, "")}
        </h1>

        <p className="text-sm font-medium text-slate-400 flex flex-wrap items-center gap-2">
          <span className="text-white font-bold">{job.company}</span>
          <span className="text-slate-600">•</span>
          <a
            href={job.url || "#"}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 hover:text-emerald-300 underline font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            Apply on Official Site <ExternalLink size={12} />
          </a>
        </p>
      </div>

      <div className="flex items-center gap-3 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-800/80 justify-end shrink-0">
        <button
          onClick={onToggleSave}
          disabled={isSaving}
          className={`px-4 py-3 rounded-2xl border transition-all shadow-lg flex items-center gap-2 text-xs font-bold cursor-pointer ${
            job.isSaved
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
              : "bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
          } ${isSaving ? "opacity-60 cursor-not-allowed" : ""}`}
          title={job.isSaved ? "Unsave Position" : "Save Position"}
        >
          {job.isSaved ? (
            <>
              <BookmarkCheck size={18} className="text-emerald-400" /> Saved
            </>
          ) : (
            <>
              <Bookmark size={18} /> Save Position
            </>
          )}
        </button>

        <button 
          onClick={handleShare}
          className="p-3 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 rounded-2xl transition-all shadow-lg cursor-pointer relative"
          title="Share Opportunity"
        >
          {copied ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
        </button>
      </div>
    </div>
  );
}