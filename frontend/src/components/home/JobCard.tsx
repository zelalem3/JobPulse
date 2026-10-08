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

  const companyInitials =
    companyName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "CE";

  const formatTimeAgo = (date?: string | null) => {
    if (!date) return "Recently posted";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;

    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - parsedDate.getTime()) / 1000
    );

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
    const diffInHours =
      (new Date().getTime() - parsedDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 24;
  };

  const getSkillBadgeStyle = (index: number) => {
    const colorThemes = [
      "bg-indigo-500/10 border-indigo-500/25 text-indigo-300",
      "bg-emerald-500/10 border-emerald-500/25 text-emerald-300",
      "bg-violet-500/10 border-violet-500/25 text-violet-300",
      "bg-sky-500/10 border-sky-500/25 text-sky-300",
      "bg-amber-500/10 border-amber-500/25 text-amber-300",
      "bg-rose-500/10 border-rose-500/25 text-rose-300",
    ];
    return colorThemes[index % colorThemes.length];
  };

  const skills = Array.isArray(job.skills) ? job.skills : [];

  return (
    <article
      className="
        relative group
        bg-slate-900/70 backdrop-blur-xl
        rounded-2xl sm:rounded-3xl
        p-5 sm:p-6
        border border-slate-800/70
        hover:border-emerald-500/35
        hover:bg-slate-900/90
        hover:shadow-xl hover:shadow-emerald-950/20
        hover:-translate-y-0.5
        transition-all duration-300 ease-out
        overflow-hidden
      "
    >
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="flex flex-col gap-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className="
                shrink-0 w-11 h-11 sm:w-12 sm:h-12
                rounded-2xl
                bg-gradient-to-br from-slate-800 to-slate-900
                border border-slate-700/60
                flex items-center justify-center
                text-sm font-bold text-emerald-400
                shadow-inner
              "
              aria-hidden
            >
              {companyInitials}
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {job.source && (
                  <span className="text-[10px] sm:text-[11px] font-semibold bg-indigo-500/15 border border-indigo-500/25 px-2.5 py-0.5 rounded-full text-indigo-300 uppercase tracking-wide">
                    {job.source}
                  </span>
                )}
                {job.employment_type && (
                  <span className="text-[10px] sm:text-[11px] font-medium bg-slate-800/80 border border-slate-700/60 px-2.5 py-0.5 rounded-full text-slate-300">
                    {job.employment_type}
                  </span>
                )}
                {job.experience_level && (
                  <span className="text-[10px] sm:text-[11px] font-medium bg-violet-500/15 border border-violet-500/25 px-2.5 py-0.5 rounded-full text-violet-300">
                    {job.experience_level}
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold tracking-tight leading-snug">
                <Link
                  to={`/jobs/${job.id}`}
                  className="text-white hover:text-emerald-400 transition-colors duration-200 line-clamp-2"
                >
                  {job.title || "Untitled Position"}
                </Link>
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-1.5 text-slate-200 font-medium truncate max-w-[200px] sm:max-w-[260px]">
                  <Building2
                    size={13}
                    className="text-emerald-400/80 shrink-0"
                  />
                  {companyName}
                </span>
                <span className="inline-flex items-center gap-1.5 text-slate-400 truncate max-w-[180px] sm:max-w-[220px]">
                  <MapPin size={13} className="text-slate-500 shrink-0" />
                  {job.location || "Remote / Worldwide"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSave(job.id)}
              disabled={isSaving}
              className={`
                p-2.5 sm:p-3 rounded-xl border transition-all duration-200
                flex items-center justify-center
                focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50
                ${
                  job.isSaved
                    ? "text-amber-300 border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25"
                    : "text-slate-400 border-slate-800 bg-slate-950/60 hover:border-slate-600 hover:text-white hover:bg-slate-800"
                }
                ${isSaving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
              title={job.isSaved ? "Saved to bookmarks" : "Save job"}
              aria-label={job.isSaved ? "Unsave job" : "Save job"}
            >
              {job.isSaved ? (
                <BookmarkCheck size={17} fill="currentColor" />
              ) : (
                <Bookmark size={17} />
              )}
            </button>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 6).map((skill, index) => {
              const skillName = renderSkillName(skill);
              if (!skillName) return null;

              return (
                <span
                  key={`${skillName}-${index}`}
                  className={`text-[11px] border px-2.5 py-1 rounded-lg font-medium transition-colors ${getSkillBadgeStyle(index)}`}
                >
                  {skillName}
                </span>
              );
            })}
            {skills.length > 6 && (
              <span className="text-[11px] text-slate-500 px-2 py-1 font-medium">
                +{skills.length - 6} more
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-800/60">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {job.salary && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/25 px-3 py-1.5 rounded-xl">
                <Banknote size={13} className="text-emerald-400" />
                {job.salary}
              </span>
            )}
            {job.deadline && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 bg-slate-950/50 border border-slate-800 px-3 py-1.5 rounded-xl">
                <Calendar size={12} className="text-violet-400" />
                Deadline: {formatTimeAgo(job.deadline)}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              {isVeryRecent(job.created_at) && (
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                </span>
              )}
              <Clock size={12} className="text-slate-500" />
              {formatTimeAgo(job.created_at)}
            </span>
          </div>

          <Link
            to={`/jobs/${job.id}`}
            className="
              inline-flex items-center justify-center gap-2
              px-4 py-2.5
              bg-gradient-to-r from-emerald-600 to-teal-600
              hover:from-emerald-500 hover:to-teal-500
              active:scale-[0.98]
              text-white text-xs font-bold
              rounded-xl
              transition-all duration-200
              shadow-lg shadow-emerald-950/40
              hover:shadow-emerald-600/30
              border border-emerald-400/20
              group/btn
              w-full sm:w-auto
            "
          >
            <span>View Details</span>
            <ExternalLink
              size={13}
              className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-200"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
