
import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  MapPin,
  Building2,
  Banknote,
  Clock3,
  BriefcaseBusiness,
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
      .map((word) => word[0]?.toUpperCase() ?? "")
      .join("") || "CE";

  const skills = Array.isArray(job.skills) ? job.skills : [];

  const renderSkillName = (skill: unknown): string => {
    if (typeof skill === "string") return skill;

    if (skill && typeof skill === "object") {
      const item = skill as {
        name?: string;
        title?: string;
        id?: string | number;
      };

      return item.name || item.title || "";
    }

    return "";
  };

  const formatTimeAgo = (date?: string | null): string => {
    if (!date) return "Recently posted";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date unavailable";
    }

    const difference = Date.now() - parsedDate.getTime();

    if (difference < 0) return "Upcoming";

    const minutes = Math.floor(difference / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        parsedDate.getFullYear() !== new Date().getFullYear()
          ? "numeric"
          : undefined,
    });
  };

  const isVeryRecent = (date?: string | null): boolean => {
    if (!date) return false;

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return false;

    const age = Date.now() - parsedDate.getTime();

    return age >= 0 && age <= 24 * 60 * 60 * 1000;
  };

  const formatDeadline = (date?: string | null): string => {
    if (!date) return "";

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;

    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year:
        parsedDate.getFullYear() !== new Date().getFullYear()
          ? "numeric"
          : undefined,
    });
  };

  const isExpired = (date?: string | null): boolean => {
    if (!date) return false;

    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return false;

    return parsedDate.getTime() < Date.now();
  };

  const skillStyles = [
    "border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-300",
    "border-indigo-500/20 bg-indigo-500/[0.07] text-indigo-300",
    "border-sky-500/20 bg-sky-500/[0.07] text-sky-300",
    "border-violet-500/20 bg-violet-500/[0.07] text-violet-300",
  ];

  const validSkills = skills
    .map(renderSkillName)
    .filter((skill) => skill.trim().length > 0);

  const saved = Boolean(job.isSaved);
  const recent = isVeryRecent(job.created_at);
  const expired = isExpired(job.deadline);

  return (
    <article className="group relative isolate overflow-hidden rounded-2xl border border-slate-800/90 bg-slate-900/65 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/35 hover:bg-slate-900 hover:shadow-2xl hover:shadow-emerald-950/20">
      {/* Subtle hover accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="p-5 sm:p-6">
        {/* Company and actions */}
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/15 bg-gradient-to-br from-emerald-500/15 via-slate-800 to-indigo-500/10 text-sm font-black tracking-wide text-emerald-300 shadow-inner sm:h-14 sm:w-14">
            {companyInitials}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              {job.source && (
                <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-slate-700/80 bg-slate-950/70 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {job.source}
                </span>
              )}

              {recent && (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  New
                </span>
              )}

              {expired && (
                <span className="rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-rose-300">
                  Deadline passed
                </span>
              )}
            </div>

            <p className="mt-2 truncate text-sm font-semibold text-slate-200">
              {companyName}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onToggleSave(job.id)}
            disabled={isSaving}
            aria-label={saved ? "Remove saved job" : "Save job"}
            aria-pressed={saved}
            title={saved ? "Remove from saved jobs" : "Save job"}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 disabled:cursor-not-allowed disabled:opacity-50 ${
              saved
                ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
                : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
            }`}
          >
            {saved ? (
              <BookmarkCheck size={18} />
            ) : (
              <Bookmark size={18} />
            )}
          </button>
        </div>

        {/* Job title */}
        <div className="mt-5">
          <h2 className="text-lg font-bold leading-snug tracking-tight text-white transition-colors group-hover:text-emerald-300 sm:text-xl">
            <Link
              to={`/jobs/${job.id}`}
              className="rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            >
              {job.title || "Untitled Position"}
            </Link>
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={14} className="shrink-0 text-emerald-400" />
              <span>{job.location || "Location not specified"}</span>
            </span>

            {job.employment_type && (
              <span className="inline-flex items-center gap-1.5">
                <BriefcaseBusiness
                  size={14}
                  className="shrink-0 text-slate-500"
                />
                {job.employment_type}
              </span>
            )}

            {job.experience_level && (
              <span className="inline-flex items-center gap-1.5">
                <Sparkles
                  size={14}
                  className="shrink-0 text-indigo-400"
                />
                {job.experience_level}
              </span>
            )}
          </div>
        </div>

        {/* Skills */}
        {validSkills.length > 0 && (
          <div className="mt-5 border-t border-slate-800/70 pt-4">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              Skills & expertise
            </p>

            <div className="flex flex-wrap gap-2">
              {validSkills.slice(0, 5).map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  title={skill}
                  className={`max-w-full truncate rounded-lg border px-2.5 py-1.5 text-[11px] font-medium ${
                    skillStyles[index % skillStyles.length]
                  }`}
                >
                  {skill}
                </span>
              ))}

              {validSkills.length > 5 && (
                <span className="inline-flex items-center rounded-lg border border-slate-800 bg-slate-950/50 px-2.5 py-1.5 text-[11px] font-medium text-slate-400">
                  +{validSkills.length - 5}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Compensation and dates */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {job.salary && (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-2 text-xs font-bold text-emerald-300">
              <Banknote size={14} />
              {job.salary}
            </span>
          )}

          {job.deadline && (
            <span
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium ${
                expired
                  ? "border-rose-500/20 bg-rose-500/[0.06] text-rose-300"
                  : "border-slate-800 bg-slate-950/50 text-slate-400"
              }`}
            >
              <CalendarDays size={14} />
              {expired ? "Closed" : "Apply by"}{" "}
              {formatDeadline(job.deadline)}
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="mt-5 flex flex-col gap-4 border-t border-slate-800/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock3 size={14} className="shrink-0" />
            <span>Posted {formatTimeAgo(job.created_at)}</span>
          </div>

          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500 px-4 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-950/20 transition-all duration-200 hover:border-emerald-300/40 hover:bg-emerald-400 active:scale-[0.98] sm:w-auto"
          >
            View opportunity
            <ExternalLink
              size={14}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
