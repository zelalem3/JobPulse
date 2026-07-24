import React from "react";
import { Calendar, MapPin, ExternalLink, Trash2 } from "lucide-react";
import { SavedJob } from "../../types/savedJobs";

interface SavedJobCardProps {
  job: SavedJob;
  onRemove: (id: string) => void;
}

export default function SavedJobCard({ job, onRemove }: SavedJobCardProps) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl hover:border-slate-700/80 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="space-y-2 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-bold tracking-wide">
            {job.source || "JobPulse"}
          </span>
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Calendar size={13} className="text-slate-500" />{" "}
            {job.saved_at || "Recently Saved"}
          </span>
        </div>

        <h2 className="text-lg font-black text-white leading-tight">
          {job.title}
        </h2>
        <p className="text-sm font-semibold text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>{job.company}</span>
          <span className="text-slate-600 font-bold">•</span>
          <span className="text-slate-400 flex items-center gap-1">
            <MapPin size={14} className="text-slate-500" /> {job.location}
          </span>
        </p>
      </div>

      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-0 pt-4 md:pt-0 border-slate-800">
        <a
          href={job.url || "#"}
          target="_blank"
          rel="noreferrer"
          className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all shadow-lg"
          title="Apply on Origin Board"
        >
          <ExternalLink size={16} />
        </a>

        <button
          onClick={() => onRemove(job.id)}
          className="p-2.5 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/60 rounded-2xl text-slate-400 hover:text-rose-400 transition-all cursor-pointer shadow-lg"
          title="Unsave Job"
          type="button"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}