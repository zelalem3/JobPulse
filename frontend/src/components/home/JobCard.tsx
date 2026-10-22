
import React from "react";
import {
  Bookmark,
  BookmarkCheck,
  MapPin,
  Clock3,
  Banknote,
  ArrowUpRight,
  BriefcaseBusiness,
} from "lucide-react";
import { Link } from "react-router-dom";

interface JobCardProps {
  job: Job;
  onToggleSave: (id: number) => void;
  isSaving: boolean;
}

const formatDate = (date?: string | null) => {
  if (!date) return null;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};



const formatTimeAgo = (date?: string | null): string => {
  if (!date) return "Date unavailable";

  const postedAt = new Date(date).getTime();

  if (Number.isNaN(postedAt)) return "Date unavailable";

  const diff = Date.now() - postedAt;

  if (diff < 0) return "Just now";

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return new Date(postedAt).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};


const JobCard: React.FC<JobCardProps> = ({
  job,
  onToggleSave,
  isSaving,
}) => {
  const companyName =
    typeof job.company === "string"
      ? job.company
      : job.company?.name || "Confidential Employer";

  const companyInitials = companyName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const saved = Boolean(job.isSaved);

  const skills = Array.isArray(job.skills)
    ? job.skills
        .map((skill) =>
          typeof skill === "string"
            ? skill
            : skill?.name || skill?.title
        )
        .filter(Boolean)
    : [];

  const postedDate = formatDate(job.created_at);
  const deadline = formatDate(job.deadline);

  
  return (
      <article className="group relative h-full">
        {/* Full-card link */}
        <Link
          to={`/jobs/${job.id}`}
          aria-label={`View job: ${job.title} at ${companyName}`}
          className="
            relative flex h-full flex-col overflow-hidden rounded-2xl
            border border-slate-200/90 bg-white p-5
            transition-all duration-200
            hover:-translate-y-0.5 hover:border-emerald-300
            hover:shadow-lg hover:shadow-slate-200/40
            focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-emerald-500
            dark:border-slate-800 dark:bg-slate-900
            dark:hover:border-emerald-800 dark:hover:shadow-black/20
            sm:p-6
          "
        >
          {/* Hover accent */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-emerald-500 opacity-0 transition-opacity group-hover:opacity-100" />

          {/* Company and save button area */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-sm font-bold text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400">
                {companyInitials || "CO"}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {companyName}
                </p>
                {job.source && (
                  <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-slate-500">
                    {job.source}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Job title */}
          <div className="mt-5">
            <h2 className="line-clamp-2 text-lg font-semibold leading-7 tracking-tight text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
              {job.title}
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
              {job.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={15} className="shrink-0 text-slate-400" />
                  <span className="line-clamp-1">{job.location}</span>
                </span>
              )}

              {job.employment_type && (
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness size={14} className="shrink-0 text-slate-400" />
                  {job.employment_type}
                </span>
              )}
            </div>
          </div>

          {/* Skills */}
          <div className="mt-5 min-h-7">
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {skills.slice(0, 3).map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {skill}
                  </span>
                ))}
                {skills.length > 3 && (
                  <span className="rounded-md px-1.5 py-1 text-xs font-medium text-slate-400">
                    +{skills.length - 3}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                Skills not specified
              </div>
            )}
          </div>

          {/* Bottom details */}
          <div className="mt-auto pt-5">
            <div className="flex min-h-6 flex-wrap items-center gap-x-4 gap-y-2">
              {job.salary && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-100">
                  <Banknote size={16} className="text-emerald-600" />
                  {job.salary}
                </span>
              )}

              {postedDate && (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <Clock3 size={14} />
                  {formatTimeAgo(job.created_at)}
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              {deadline ? (
                <span className="min-w-0 text-xs text-slate-500 dark:text-slate-400">
                  Deadline: {deadline}
                </span>
              ) : (
                <span className="text-xs text-slate-400">
                  Explore opportunity
                </span>
              )}

              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-emerald-700">
                View job
                <ArrowUpRight size={15} />
              </span>
            </div>
          </div>
        </Link>

        {/* Independent save button */}
        <button
          type="button"
          onClick={() => onToggleSave(job.id)}
          disabled={isSaving}
          aria-label={saved ? "Remove saved job" : "Save job"}
          aria-pressed={saved}
          className={`
            absolute right-5 top-5 z-10
            flex h-9 w-9 items-center justify-center rounded-lg border
            transition-colors disabled:cursor-not-allowed disabled:opacity-50
            sm:right-6 sm:top-6
            ${
              saved
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400"
                : "border-slate-200 bg-white text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-emerald-950"
            }
          `}
        >
          {saved ? <BookmarkCheck size={17} /> : <Bookmark size={17} />}
        </button>
      </article>
    );

};

export default JobCard;
