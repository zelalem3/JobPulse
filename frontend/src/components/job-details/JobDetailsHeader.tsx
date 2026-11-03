import React, { useState } from "react";
import {
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Share2,
  Check,
  MapPin,
  Briefcase,
  DollarSign,
  Building2,
} from "lucide-react";
import { JobDetails } from "../../types/jobDetails";

interface JobDetailsHeaderProps {
  job: JobDetails;
  isSaving: boolean;
  onToggleSave: () => void;
}

function getInitials(name?: string | null): string {
  if (!name) return "JP";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "JP";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function JobDetailsHeader({
  job,
  isSaving,
  onToggleSave,
}: JobDetailsHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy job URL:", error);
    }
  };

  const cleanTitle = (job.title || "").replace(/\*\*/g, "");
  const companyName = job.company?.name || "Company not specified";
  const initials = getInitials(companyName);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 backdrop-blur-2xl rounded-3xl border border-slate-800/90 shadow-2xl shadow-black/20">
      {/* Ambient glows */}
      <div className="absolute -top-28 -left-16 w-72 h-72 bg-emerald-500/[0.07] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-0 w-72 h-72 bg-indigo-500/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

      <div className="relative p-5 sm:p-7 lg:p-8">
        {/* Source + Type badges */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {job.source && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-bold text-[11px] sm:text-xs rounded-xl tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
              {job.source}
            </span>
          )}

          {job.type && (
            <span className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/70 text-slate-300 font-semibold text-[11px] sm:text-xs rounded-xl tracking-wide">
              {job.type}
            </span>
          )}
        </div>

        {/* Title + Company row */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
          {/* Company avatar */}
          <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center shadow-lg">
            <span className="text-lg sm:text-xl font-black tracking-tight text-emerald-300">
              {initials}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-[1.12] text-white">
              {cleanTitle}
            </h1>

            <div className="mt-2.5 flex items-center gap-2 text-sm text-slate-400">
              <Building2 size={14} className="text-slate-500 shrink-0" />
              <span className="font-semibold text-slate-200 truncate">
                {companyName}
              </span>
            </div>
          </div>
        </div>

        {/* Quick facts */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2.5 mt-5 sm:mt-6">
          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <MapPin size={14} className="text-emerald-400 shrink-0" />
            <span className="font-medium">
              {job.location || "Location not specified"}
            </span>
          </div>

          <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-700" />

          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <Briefcase size={14} className="text-sky-400 shrink-0" />
            <span className="font-medium">{job.type || "Not specified"}</span>
          </div>

          <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-700" />

          <div className="flex items-center gap-2 text-[13px] text-slate-400">
            <DollarSign size={14} className="text-indigo-400 shrink-0" />
            <span className="font-medium">{job.salary || "Negotiable"}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-gradient-to-r from-slate-800 via-slate-700/60 to-transparent" />

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/15 transition-all hover:-translate-y-0.5"
            >
              Apply on Official Site
              <ExternalLink size={15} />
            </a>
          )}

          <button
            onClick={onToggleSave}
            disabled={isSaving}
            className={`
              inline-flex items-center justify-center gap-2
              px-4 py-2.5 sm:py-3
              rounded-xl border transition-all shadow-lg text-sm font-bold cursor-pointer
              ${
                job.isSaved
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25"
                  : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              }
              ${isSaving ? "opacity-60 cursor-not-allowed" : ""}
            `}
            title={job.isSaved ? "Unsave Position" : "Save Position"}
          >
            {job.isSaved ? (
              <>
                <BookmarkCheck size={16} className="text-emerald-400" />
                Saved
              </>
            ) : (
              <>
                <Bookmark size={16} />
                Save
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all shadow-lg cursor-pointer text-sm font-bold"
            title="Share Opportunity"
          >
            {copied ? (
              <>
                <Check size={16} className="text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Share2 size={16} />
                Share
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
