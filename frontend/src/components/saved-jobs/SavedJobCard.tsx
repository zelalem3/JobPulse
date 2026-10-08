import React from "react";
import {
  Calendar,
  MapPin,
  ExternalLink,
  Trash2,
  Building2,
  Loader2,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { SavedJob } from "../../types/savedJobs";

interface SavedJobCardProps {
  job: SavedJob;
  onRemove: (id: string) => void;
  isRemoving?: boolean;
}

export default function SavedJobCard({
  job,
  onRemove,
  isRemoving = false,
}: SavedJobCardProps) {
  const companyInitials =
    (job.company || "C")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "C";

  const detailsPath = job.job_listing_id
    ? `/jobs/${job.job_listing_id}`
    : null;

  return (
    <article
      className={`
        group relative
        bg-slate-900/70 backdrop-blur-xl
        rounded-2xl sm:rounded-3xl
        p-5 sm:p-6
        border border-slate-800/70
        hover:border-amber-500/30
        hover:bg-slate-900/90
        hover:shadow-lg hover:shadow-amber-950/10
        transition-all duration-300
        ${isRemoving ? "opacity-60 pointer-events-none" : ""}
      `}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
        {/* Avatar + info */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <div
            className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center text-sm font-bold text-amber-400/90 shadow-inner"
            aria-hidden
          >
            {companyInitials}
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide bg-slate-800/90 border border-slate-700/60 text-slate-300 px-2.5 py-0.5 rounded-full">
                {job.source || "JobPulse"}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                <Calendar size={11} />
                {job.saved_at || "Recently"}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
              {detailsPath ? (
                <Link
                  to={detailsPath}
                  className="hover:text-amber-300 transition-colors line-clamp-2"
                >
                  {job.title}
                </Link>
              ) : (
                <span className="line-clamp-2">{job.title}</span>
              )}
            </h2>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1.5 text-slate-200 font-medium truncate max-w-[220px]">
                <Building2 size={13} className="text-amber-400/80 shrink-0" />
                {job.company}
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-400 truncate max-w-[200px]">
                <MapPin size={13} className="text-slate-500 shrink-0" />
                {job.location}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 w-full sm:w-auto border-t sm:border-0 border-slate-800/60 pt-3 sm:pt-0">
          {detailsPath && (
            <Link
              to={detailsPath}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-950/50 border border-slate-800 hover:border-slate-600 hover:text-white hover:bg-slate-800 transition-all"
            >
              Details
              <ArrowUpRight size={13} />
            </Link>
          )}

          {job.url && job.url !== "#" && (
            <a
              href={job.url}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-amber-200 bg-amber-950/50 border border-amber-800/40 hover:border-amber-600/50 hover:bg-amber-950/80 transition-all"
              title="Open original listing"
            >
              Apply
              <ExternalLink size={13} />
            </a>
          )}

          <button
            type="button"
            onClick={() => onRemove(job.id)}
            disabled={isRemoving}
            className="p-2.5 rounded-xl border border-slate-800 text-slate-500 bg-slate-950/40 hover:text-rose-400 hover:bg-rose-950/40 hover:border-rose-900/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 disabled:opacity-50"
            title="Remove from saved"
            aria-label={`Remove ${job.title}`}
          >
            {isRemoving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
