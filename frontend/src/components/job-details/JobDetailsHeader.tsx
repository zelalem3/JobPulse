import React from "react";
import { ExternalLink, Bookmark, BookmarkCheck, Share2 } from "lucide-react";
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
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-slate-800 border border-slate-700/60 text-slate-300 font-bold text-xs rounded-xl tracking-wide">
            {job.source}
          </span>
          <span className="px-3 py-1 bg-slate-800 border border-slate-700/60 text-slate-300 font-semibold text-xs rounded-xl tracking-wide">
            {job.type}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
          {(job.title || "").replace(/\*\*/g, "")}
        </h1>

        <p className="text-sm font-semibold text-slate-400">
          {job.company} —{" "}
          <a
            href={job.url || "#"}
            target="_blank"
            rel="noreferrer"
            className="text-slate-300 hover:text-white underline font-bold inline-flex items-center gap-1"
          >
            Visit Site <ExternalLink size={12} />
          </a>
        </p>
      </div>

      <div className="flex items-center gap-2.5 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-800 justify-end shrink-0">
        <button
          onClick={onToggleSave}
          disabled={isSaving}
          className={`p-3 rounded-2xl border transition-all shadow-lg flex items-center justify-center ${
            job.isSaved
              ? "bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700"
              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
          } ${isSaving ? "opacity-60 cursor-not-allowed" : ""}`}
          title={job.isSaved ? "Unsave Position" : "Save Position"}
        >
          {job.isSaved ? (
            <BookmarkCheck size={20} fill="currentColor" />
          ) : (
            <Bookmark size={20} />
          )}
        </button>

        <button className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-2xl transition-all shadow-lg">
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
}