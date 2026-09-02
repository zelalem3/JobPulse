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
  Briefcase,
  Clock,
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

  const companyName =
    typeof job.company === "object" && job.company !== null
      ? job.company.name
      : typeof job.company === "string"
        ? job.company
        : "Confidential Employer";

  const formatDate = (date?: string | null) => {
    if (!date) return "Recently posted";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const skills = Array.isArray(job.skills) ? job.skills : [];

  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 group">
      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* Main Job Information */}
        <div className="space-y-4 flex-1 min-w-0">
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-2">
            {job.source && (
              <span className="text-[11px] font-semibold bg-indigo-500/10 border border-indigo-500/25 px-3 py-1 rounded-full text-indigo-400 tracking-wide uppercase">
                {job.source}
              </span>
            )}

            {job.employment_type && (
              <span className="text-[11px] font-semibold bg-slate-800 border border-slate-700/60 px-3 py-1 rounded-full text-slate-300">
                {job.employment_type}
              </span>
            )}

            {job.experience_level && (
              <span className="text-[11px] font-semibold bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full text-violet-300">
                {job.experience_level}
              </span>
            )}

            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium ml-1">
              <Calendar size={13} className="text-slate-500" />
              {formatDate(job.posted_at)}
            </span>
          </div>

          {/* Job Title */}
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            <Link
              to={`/jobs/${job.id}`}
              className="text-white hover:text-indigo-300 transition-colors duration-200"
            >
              {job.title || "Untitled Position"}
            </Link>
          </h2>

          {/* Company + Location */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
            <span className="flex items-center gap-1.5 text-white font-semibold">
              <Building2 size={15} className="text-slate-400 shrink-0" />
              <span className="truncate max-w-[250px]">
                {companyName}
              </span>
            </span>

            <span className="flex items-center gap-1.5 text-slate-400">
              <MapPin size={15} className="text-slate-500 shrink-0" />
              <span>{job.location || "Remote / Worldwide"}</span>
            </span>

            {job.category && (
              <span className="flex items-center gap-1.5 text-slate-400">
                <Briefcase size={14} className="text-slate-500 shrink-0" />
                <span>{job.category}</span>
              </span>
            )}
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.slice(0, 8).map((skill, index) => {
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

              {skills.length > 8 && (
                <span className="text-[11px] text-slate-500 px-2 py-1">
                  +{skills.length - 8} more
                </span>
              )}
            </div>
          )}

          {/* Salary + Deadline */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {job.salary && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-3 py-1.5 rounded-xl">
                <Banknote size={14} />
                {job.salary}
              </span>
            )}

            {job.deadline && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
                <Clock size={13} className="text-slate-500" />
                Deadline: {formatDate(job.deadline)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center md:items-start gap-3 self-end md:self-start shrink-0">
          {/* Save */}
          <button
            type="button"
            onClick={() => onToggleSave(job.id)}
            disabled={isSaving}
            className={`
              p-3
              bg-slate-950/80
              border
              rounded-2xl
              transition-all
              shadow-md
              cursor-pointer
              ${
                job.isSaved
                  ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
                  : "text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white"
              }
              ${
                isSaving
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }
            `}
            title={job.isSaved ? "Saved to bookmarks" : "Save job"}
          >
            {job.isSaved ? (
              <BookmarkCheck size={18} fill="currentColor" />
            ) : (
              <Bookmark size={18} />
            )}
          </button>

          {/* View Details */}
          <Link
            to={`/jobs/${job.id}`}
            className="
              px-5
              py-3
              bg-indigo-600
              hover:bg-indigo-500
              active:bg-indigo-700
              text-white
              text-xs
              font-semibold
              rounded-2xl
              flex
              items-center
              gap-2
              transition-all
              shadow-lg
              shadow-indigo-950/50
              border
              border-indigo-500/30
              group
            "
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