import React from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Building2,
  Banknote,
} from "lucide-react";

import { Job } from "../../types/job";

interface JobCardProps {
  job: Job;
  onToggleSave: (id: number) => void;
  isSaving: boolean;
}

export default function JobCard({
  job,
  onToggleSave,
  isSaving,
}: JobCardProps) {
  const renderSkillName = (skill: any): string => {
    if (typeof skill === "string") {
      return skill;
    }

    if (skill && typeof skill === "object") {
      return skill.name || skill.title || String(skill.id || "");
    }

    return "";
  };

  const jobType = job.job_type ?? (job as any).type;

  const postedDate =
    job.scraped_at || (job as any).created_at || null;

  const formatDate = (date: string | null) => {
    if (!date) return "Recently added";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 group">

      <div className="flex justify-between flex-col md:flex-row gap-6">

        {/* Main information */}
        <div className="space-y-3 flex-1 min-w-0">

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2">

            {job.source && (
              <span className="text-[11px] font-semibold bg-indigo-500/10 border border-indigo-500/25 px-3 py-1 rounded-full text-indigo-400 tracking-wide uppercase">
                {job.source}
              </span>
            )}

            {jobType && (
              <span className="text-[11px] font-semibold bg-slate-800 border border-slate-700/60 px-3 py-1 rounded-full text-slate-300">
                {jobType}
              </span>
            )}

            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium ml-1">
              <Calendar
                size={13}
                className="text-slate-500"
              />

              {formatDate(postedDate)}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            <Link
              to={`/jobs/${job.id}`}
              className="text-white hover:text-indigo-300 transition-colors duration-200"
            >
              {(job.title || "").replace(/\/\*.*?\*\//g, "").trim()}
            </Link>
          </h2>

          {/* Company + Location */}
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">

            <span className="flex items-center gap-1.5 text-white font-semibold">
              <Building2
                size={15}
                className="text-slate-400"
              />

              {job.company || "Confidential Employer"}
            </span>

            <span className="flex items-center gap-1.5 text-slate-400">
              <MapPin
                size={15}
                className="text-slate-500"
              />

              {job.location || "Remote / Worldwide"}
            </span>
          </div>

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {job.skills.map((skill, index) => {
                const skillName = renderSkillName(skill);

                if (!skillName) return null;

                return (
                  <span
                    key={`${skillName}-${index}`}
                    className="text-[11px] bg-slate-950/80 border border-slate-800 text-slate-300 px-2.5 py-1 rounded-xl font-medium"
                  >
                    {skillName}
                  </span>
                );
              })}
            </div>
          )}

          {/* Salary */}
          {job.salary && (
            <div className="pt-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-3 py-1.5 rounded-xl">
                <Banknote size={14} />
                {job.salary}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center md:items-start gap-3 self-end md:self-start shrink-0">

          <button
            type="button"
            onClick={() => onToggleSave(job.id)}
            disabled={isSaving}
            className={`p-3 bg-slate-950/80 border rounded-2xl transition-all shadow-md cursor-pointer ${
              job.isSaved
                ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                : "text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white"
            } ${
              isSaving
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
            title={
              job.isSaved
                ? "Remove from saved jobs"
                : "Save job"
            }
            aria-label={
              job.isSaved
                ? "Remove from saved jobs"
                : "Save job"
            }
          >
            {job.isSaved ? (
              <BookmarkCheck
                size={18}
                fill="currentColor"
              />
            ) : (
              <Bookmark size={18} />
            )}
          </button>

          <Link
            to={`/jobs/${job.id}`}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-semibold rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-950/50 border border-indigo-500/30 group"
          >
            <span>View Details</span>

            <ExternalLink
              size={14}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}