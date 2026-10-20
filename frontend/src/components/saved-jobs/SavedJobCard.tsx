import React from "react";
import {
  CalendarDays,
  MapPin,
  ExternalLink,
  Trash2,
  Building2,
  Loader2,
  ArrowUpRight,
  BookmarkCheck,
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
  const companyName = job.company?.trim() || "Company not specified";
  const jobTitle = job.title?.trim() || "Untitled position";
  const location = job.location?.trim() || "Location not specified";
  const source = job.source?.trim() || "JobPulse";

  const companyInitials =
    companyName === "Company not specified"
      ? "CO"
      : companyName
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((word) => word[0]?.toUpperCase() ?? "")
          .join("");

  const detailsPath = job.job_listing_id
    ? `/jobs/${job.job_listing_id}`
    : null;

  const applyUrl =
    job.url && job.url !== "#" ? job.url : null;

  return (
    <article
      aria-busy={isRemoving}
      className={`
        group relative overflow-hidden rounded-2xl
        border border-slate-800/90
        bg-slate-900/70
        transition-all duration-200
        hover:border-slate-700
        hover:bg-slate-900
        hover:shadow-lg hover:shadow-black/10
        ${isRemoving ? "pointer-events-none opacity-60" : ""}
      `}
    >
      {/* Subtle top accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="p-4 sm:p-5 lg:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">

          {/* Company identity */}
          <div className="flex min-w-0 flex-1 items-start gap-3.5 sm:gap-4">
            <div className="relative shrink-0">
              <div
                className="
                  flex h-12 w-12 items-center justify-center
                  rounded-xl border border-indigo-400/15
                  bg-indigo-500/[0.08]
                  text-sm font-bold tracking-wide text-indigo-300
                  sm:h-14 sm:w-14 sm:rounded-2xl
                "
                aria-label={`Company initials: ${companyInitials}`}
              >
                {companyInitials}
              </div>

              <span
                className="
                  absolute -bottom-1 -right-1
                  flex h-5 w-5 items-center justify-center
                  rounded-full border-[3px] border-slate-900
                  bg-emerald-500 text-white
                "
                title="Saved job"
              >
                <BookmarkCheck size={10} strokeWidth={2.5} />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              {/* Metadata */}
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <span
                  className="
                    inline-flex max-w-full items-center truncate
                    rounded-md border border-slate-700/80
                    bg-slate-800/70 px-2 py-1
                    text-[10px] font-semibold uppercase
                    tracking-wider text-slate-400
                  "
                  title={source}
                >
                  {source}
                </span>

                {job.saved_at && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <CalendarDays size={13} className="shrink-0" />
                    <span>Saved {job.saved_at}</span>
                  </span>
                )}
              </div>

              {/* Job title */}
              <h2 className="text-base font-bold leading-snug tracking-tight text-slate-100 sm:text-lg">
                {detailsPath ? (
                  <Link
                    to={detailsPath}
                    className="
                      rounded-sm transition-colors
                      hover:text-indigo-300
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-indigo-500
                    "
                  >
                    {jobTitle}
                  </Link>
                ) : (
                  jobTitle
                )}
              </h2>

              {/* Company and location */}
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4">
                <span
                  className="inline-flex min-w-0 items-center gap-2 text-sm text-slate-300"
                  title={companyName}
                >
                  <Building2
                    size={15}
                    className="shrink-0 text-indigo-400"
                  />
                  <span className="truncate">{companyName}</span>
                </span>

                <span
                  className="inline-flex min-w-0 items-center gap-2 text-sm text-slate-500"
                  title={location}
                >
                  <MapPin
                    size={15}
                    className="shrink-0 text-slate-500"
                  />
                  <span className="truncate">{location}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div
            className="
              flex shrink-0 items-center gap-2
              border-t border-slate-800/80 pt-4
              sm:border-t-0 sm:pt-0
            "
          >
            {detailsPath && (
              <Link
                to={detailsPath}
                className="
                  inline-flex min-h-10 flex-1 items-center
                  justify-center gap-1.5 rounded-xl
                  border border-slate-700/80 bg-slate-800/50
                  px-3.5 py-2 text-xs font-semibold text-slate-300
                  transition-colors
                  hover:border-slate-600 hover:bg-slate-800
                  hover:text-white
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-indigo-500
                  sm:flex-none
                "
              >
                Details
                <ArrowUpRight size={14} />
              </Link>
            )}

            {applyUrl && (
              <a
                href={applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex min-h-10 flex-1 items-center
                  justify-center gap-2 rounded-xl
                  border border-indigo-400/20
                  bg-indigo-600 px-4 py-2
                  text-xs font-bold text-white
                  shadow-sm shadow-indigo-950/20
                  transition-colors
                  hover:bg-indigo-500
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-indigo-400
                  focus-visible:ring-offset-2
                  focus-visible:ring-offset-slate-900
                  sm:flex-none
                "
              >
                Apply
                <ExternalLink size={13} />
              </a>
            )}

            <button
              type="button"
              onClick={() => onRemove(job.id)}
              disabled={isRemoving}
              className="
                inline-flex h-10 w-10 shrink-0 items-center
                justify-center rounded-xl
                border border-slate-800 bg-transparent
                text-slate-500 transition-colors
                hover:border-rose-500/30
                hover:bg-rose-500/10 hover:text-rose-400
                focus-visible:outline-none
                focus-visible:ring-2 focus-visible:ring-rose-500
                disabled:cursor-not-allowed disabled:opacity-50
              "
              title="Remove from saved jobs"
              aria-label={`Remove ${jobTitle} from saved jobs`}
            >
              {isRemoving ? (
                <Loader2 size={16} className="animate-spin" />
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
