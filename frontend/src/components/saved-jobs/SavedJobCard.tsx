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
        group relative overflow-hidden
        bg-slate-900/60
        backdrop-blur-xl
        rounded-2xl
        border border-slate-800/80
        hover:border-indigo-500/30
        hover:bg-slate-900/80
        hover:shadow-xl hover:shadow-indigo-950/10
        transition-all duration-300
        ${isRemoving ? "opacity-50 pointer-events-none" : ""}
      `}
    >
      {/* Subtle hover accent */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-5 sm:p-6">

        <div className="flex flex-col lg:flex-row lg:items-center gap-5">

          {/* Main information */}
          <div className="flex items-start gap-4 min-w-0 flex-1">

            {/* Company avatar */}
            <div className="relative shrink-0">

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-slate-900 border border-indigo-500/15 flex items-center justify-center text-sm font-black text-indigo-300 shadow-inner">
                {companyInitials}
              </div>

              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-slate-900 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
              </div>

            </div>

            {/* Information */}
            <div className="min-w-0 flex-1">

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-2 mb-2">

                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800/80 border border-slate-700/70 text-slate-400 px-2.5 py-1 rounded-lg">
                  {job.source || "JobPulse"}
                </span>

                <span className="inline-flex items-center gap-1 text-[10px] text-slate-600 font-medium">
                  <Calendar size={10} />
                  Saved {job.saved_at || "recently"}
                </span>

              </div>

              {/* Title */}
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                {detailsPath ? (
                  <Link
                    to={detailsPath}
                    className="hover:text-indigo-300 transition-colors line-clamp-2"
                  >
                    {job.title}
                  </Link>
                ) : (
                  <span className="line-clamp-2">
                    {job.title}
                  </span>
                )}
              </h2>

              {/* Company / location */}
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-2">

                <span className="inline-flex items-center gap-1.5 text-sm text-slate-300 font-medium truncate max-w-[240px]">
                  <Building2
                    size={14}
                    className="text-indigo-400/80 shrink-0"
                  />
                  <span className="truncate">
                    {job.company}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 truncate max-w-[220px]">
                  <MapPin
                    size={14}
                    className="text-slate-600 shrink-0"
                  />
                  <span className="truncate">
                    {job.location}
                  </span>
                </span>

              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:border-l lg:border-slate-800/80 lg:pl-5">

            {detailsPath && (
              <Link
                to={detailsPath}
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-950/60 border border-slate-800 hover:border-slate-600 hover:text-white hover:bg-slate-800 transition-all"
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
                className="flex-1 lg:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/30 shadow-lg shadow-indigo-950/30 transition-all"
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
              className="shrink-0 p-2.5 rounded-xl border border-slate-800 text-slate-500 bg-slate-950/40 hover:text-rose-400 hover:bg-rose-950/30 hover:border-rose-900/40 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40 disabled:opacity-50"
              title="Remove from saved"
              aria-label={`Remove ${job.title}`}
            >
              {isRemoving ? (
                <Loader2
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={16} />
              )}
            </button>

          </div>

        </div>

      </div>
    </article>
  );
}

