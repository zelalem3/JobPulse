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
  Clock,
  Sparkles,
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
    if (typeof skill === "string") return skill;
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

  const formatTimeAgo = (date?: string | null) => {
    if (!date) return "Recently posted";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - parsedDate.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const isVeryRecent = (date?: string | null) => {
    if (!date) return false;
    const parsedDate = new Date(date);
    const diffInHours = (new Date().getTime() - parsedDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  const getSkillBadgeStyle = (index: number) => {
    const colorThemes = [
      "bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:border-indigo-400",
      "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:border-emerald-400",
      "bg-violet-500/10 border-violet-500/30 text-violet-300 hover:border-violet-400",
      "bg-sky-500/10 border-sky-500/30 text-sky-300 hover:border-sky-400",
      "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:border-amber-400",
      "bg-rose-500/10 border-rose-500/30 text-rose-300 hover:border-rose-400",
    ];
    return colorThemes[index % colorThemes.length];
  };

  const skills = Array.isArray(job.skills) ? job.skills : [];

  return (
    <div className="relative bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-xl border border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-900/80 transition-all duration-300 group overflow-hidden">
      
      {/* Top accent glowing gradient line on hover */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex flex-col md:flex-row justify-between gap-6">
        {/* Main Job Information */}
        <div className="space-y-4 flex-1 min-w-0">
          
          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {job.source && (
              <span className="text-[11px] font-semibold bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 rounded-full text-indigo-300 tracking-wide uppercase shadow-sm">
                {job.source}
              </span>
            )}

            {job.employment_type && (
              <span className="text-[11px] font-semibold bg-slate-800/90 border border-slate-700/80 px-3 py-1 rounded-full text-slate-200">
                {job.employment_type}
              </span>
            )} 

            {job.experience_level && (
              <span className="text-[11px] font-semibold bg-violet-500/15 border border-violet-500/30 px-3 py-1 rounded-full text-violet-300 shadow-sm">
                {job.experience_level}
              </span>
            )} 

            {/* Time posted indicator */}
            <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium ml-auto sm:ml-1">
              {isVeryRecent(job.created_at) && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
              <Clock size={13} className="text-emerald-400" />
              {formatTimeAgo(job.created_at)}
            </span>
          </div>

          {/* Job Title */}
          <h2 className="text-lg sm:text-xl font-bold tracking-tight">
            <Link
              to={`/jobs/${job.id}`}
              className="text-white hover:text-emerald-400 transition-colors duration-200 line-clamp-1"
            >
              {job.title || "Untitled Position"}
            </Link>
          </h2>

          {/* Company + Location */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
            <span className="flex items-center gap-2 text-slate-200 font-medium">
              <div className="p-1.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
                <Building2 size={14} />
              </div>
              <span className="truncate max-w-[260px] text-slate-200 font-semibold">
                {companyName}
              </span>
            </span>

            <span className="flex items-center gap-2 text-slate-400">
              <div className="p-1.5 bg-slate-800/60 rounded-xl text-slate-300 border border-slate-700/50">
                <MapPin size={14} />
              </div>
              <span className="truncate max-w-[220px]">{job.location || "Remote / Worldwide"}</span>
            </span>
          </div>

          {/* Color-Coded Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skills.slice(0, 8).map((skill, index) => {
                const skillName = renderSkillName(skill);
                if (!skillName) return null;

                return (
                  <span
                    key={`${skillName}-${index}`}
                    className={`text-[11px] border px-2.5 py-1 rounded-xl font-medium tracking-tight transition-all duration-200 hover:scale-105 ${getSkillBadgeStyle(
                      index
                    )}`}
                  >
                    {skillName}
                  </span>
                );
              })}

              {skills.length > 8 && (
                <span className="text-[11px] text-slate-500 px-2 py-1 font-medium">
                  +{skills.length - 8} more
                </span>
              )}
            </div>
          )}

          {/* Salary + Deadline */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {job.salary && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl shadow-sm">
                <Banknote size={14} className="text-emerald-400" />
                {job.salary}
              </span>
            )}

            {job.deadline && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-950/60 border border-slate-800 px-3 py-1.5 rounded-xl">
                <Calendar size={13} className="text-violet-400" />
                Deadline: {formatTimeAgo(job.deadline)}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center md:items-start gap-3 self-end md:self-start shrink-0">
          {/* Save Bookmark */}
          <button
            type="button"
            onClick={() => onToggleSave(job.id)}
            disabled={isSaving}
            className={`
              p-3.5
              bg-slate-950/90
              border
              rounded-2xl
              transition-all
              shadow-lg
              cursor-pointer
              flex items-center justify-center
              ${
                job.isSaved
                  ? "text-amber-300 border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25"
                  : "text-slate-400 border-slate-800 hover:border-slate-700 hover:bg-slate-800 hover:text-white"
              }
              ${isSaving ? "opacity-50 cursor-not-allowed" : ""}
            `}
            title={job.isSaved ? "Saved to bookmarks" : "Save job"}
          >
            {job.isSaved ? (
              <BookmarkCheck size={18} fill="currentColor" />
            ) : (
              <Bookmark size={18} />
            )}
          </button>

          {/* Emerald / Teal View Details Button */}
          <Link
            to={`/jobs/${job.id}`}
            className="
              relative
              px-6
              py-3.5
              bg-gradient-to-r
              from-emerald-600
              via-teal-600
              to-emerald-500
              hover:from-emerald-500
              hover:via-teal-500
              hover:to-emerald-400
              active:scale-95
              text-white
              text-xs
              font-bold
              rounded-2xl
              flex
              items-center
              gap-2.5
              transition-all
              duration-300
              shadow-xl
              shadow-emerald-950/50
              hover:shadow-emerald-600/40
              border
              border-emerald-400/30
              group/btn
              overflow-hidden
            "
          >
            {/* Shimmer overlay effect */}
            <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none" />
            
            <span className="relative z-10 tracking-wide">View Details</span>
            <ExternalLink
              size={14}
              className="relative z-10 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-0.5 transition-transform duration-300 text-emerald-100"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}