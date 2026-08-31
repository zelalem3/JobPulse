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
} from "lucide-react";
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy job URL:", error);
    }
  };

  const cleanTitle = (job.title || "").replace(/\*\*/g, "");

  return (
    <div
      className="
        relative overflow-hidden
        bg-gradient-to-br from-slate-900/95 via-slate-900/85 to-slate-950/95
        backdrop-blur-2xl
        rounded-3xl
        border border-slate-800/90
        shadow-2xl
      "
    >
      {/* Ambient glow */}
      <div className="absolute -top-32 -left-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute -bottom-40 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent" />

      <div className="relative p-6 sm:p-8">
        {/* Source + Employment Type */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          {job.source && (
            <span
              className="
                inline-flex items-center gap-1.5
                px-3 py-1.5
                bg-emerald-500/10
                border border-emerald-500/20
                text-emerald-300
                font-bold text-xs
                rounded-xl
                tracking-wide
              "
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
              {job.source}
            </span>
          )}

          {job.type && (
            <span
              className="
                px-3 py-1.5
                bg-slate-800/80
                border border-slate-700/80
                text-slate-300
                font-semibold text-xs
                rounded-xl
                tracking-wide
              "
            >
              {job.type}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="max-w-4xl">
          <h1
            className="
              text-3xl sm:text-4xl lg:text-5xl
              font-black
              tracking-tight
              leading-[1.08]
              text-white
            "
          >
            {cleanTitle}
          </h1>

          {job.company && (
            <p className="mt-3 text-base text-slate-400">
              <span className="font-bold text-slate-200">
                {job.company}
              </span>
            </p>
          )}
        </div>

        {/* Quick Facts */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-6">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <MapPin size={15} className="text-emerald-400 shrink-0" />
            <span>{job.location || "Location not specified"}</span>
          </div>

          <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-700" />

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Briefcase size={15} className="text-blue-400 shrink-0" />
            <span>{job.type || "Not specified"}</span>
          </div>

          <div className="hidden sm:block w-1 h-1 rounded-full bg-slate-700" />

          <div className="flex items-center gap-2 text-sm text-slate-400">
            <DollarSign size={15} className="text-indigo-400 shrink-0" />
            <span>{job.salary || "Negotiable"}</span>
          </div>
        </div>

        {/* Divider */}
        <div className="my-7 h-px bg-gradient-to-r from-slate-800 via-slate-700/70 to-transparent" />

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Primary CTA */}
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center justify-center gap-2
                px-5 py-3
                rounded-xl
                bg-emerald-500
                hover:bg-emerald-400
                active:bg-emerald-600
                text-slate-950
                font-black
                text-sm
                shadow-lg shadow-emerald-500/10
                transition-all
                hover:-translate-y-0.5
              "
            >
              Apply on Official Site
              <ExternalLink size={15} />
            </a>
          )}

          {/* Save */}
          <button
            onClick={onToggleSave}
            disabled={isSaving}
            className={`
              inline-flex items-center justify-center gap-2
              px-4 py-3
              rounded-xl
              border
              transition-all
              shadow-lg
              text-sm
              font-bold
              cursor-pointer
              ${
                job.isSaved
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                  : "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
              }
              ${isSaving ? "opacity-60 cursor-not-allowed" : ""}
            `}
            title={job.isSaved ? "Unsave Position" : "Save Position"}
          >
            {job.isSaved ? (
              <>
                <BookmarkCheck size={17} className="text-emerald-400" />
                Saved
              </>
            ) : (
              <>
                <Bookmark size={17} />
                Save Position
              </>
            )}
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className="
              inline-flex items-center justify-center gap-2
              px-4 py-3
              rounded-xl
              bg-slate-900/80
              hover:bg-slate-800
              text-slate-300
              hover:text-white
              border border-slate-800
              transition-all
              shadow-lg
              cursor-pointer
              text-sm
              font-bold
            "
            title="Share Opportunity"
          >
            {copied ? (
              <>
                <Check size={17} className="text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Share2 size={17} />
                Share
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}