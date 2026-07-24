import React from "react";
import { Link } from "react-router-dom";
import { Calendar, ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { Job } from "../../types/job";

interface JobCardProps {
  job: Job;
  onToggleSave: (id: number) => void;
  isSaving: boolean;
}

export default function JobCard({ job, onToggleSave, isSaving }: JobCardProps) {
  const renderSkillName = (skill: any): string => {
    if (typeof skill === "string") return skill;
    if (skill && typeof skill === "object") {
      return skill.name || skill.title || String(skill.id || "");
    }
    return String(skill);
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300">
      <div className="flex justify-between flex-col md:flex-row gap-4">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="text-xs bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-xl font-medium text-slate-300">
              {job.source}
            </span>

            {job.type && (
              <span className="text-xs bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-xl font-medium text-slate-300">
                {job.type}
              </span>
            )}

            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium px-1">
              <Calendar size={12} className="text-slate-500" />
              {job.scraped_at}
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight transition antialiased">
            <Link
              to={`/jobs/${job.id}`}
              className="text-white hover:text-slate-300 transition-colors duration-200"
            >
              {(job.title || "").replace(/\*\*/g, "")}
            </Link>
          </h2>

          <p className="text-slate-400 mt-1 font-medium text-sm">
            {job.company} — {job.location}
          </p>

          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {job.skills.map((skill, index) => (
                <span
                  key={index}
                  className="text-[11px] bg-blue-950/50 border border-blue-800/50 text-blue-300 px-2.5 py-0.5 rounded-lg font-medium"
                >
                  {renderSkillName(skill)}
                </span>
              ))}
            </div>
          )}

          {job.salary && (
            <p className="mt-2 text-xs font-semibold text-slate-300 bg-slate-950/60 inline-block px-3 py-1.5 rounded-xl border border-slate-800">
              Salary: {job.salary}
            </p>
          )}
        </div>

        <div className="flex items-start gap-2.5 self-end md:self-start">
          <button
            onClick={() => onToggleSave(job.id)}
            disabled={isSaving}
            className={`p-2.5 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all shadow-lg ${
              job.isSaved ? "text-blue-400 border-slate-700" : "text-slate-400"
            } ${isSaving ? "opacity-50" : ""}`}
          >
            {job.isSaved ? (
              <BookmarkCheck className="text-amber-400" fill="currentColor" size={18} />
            ) : (
              <Bookmark size={18} />
            )}
          </button>

          <Link
            to={`/jobs/${job.id}`}
            className="px-5 py-2.5 bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:text-white text-xs font-bold rounded-2xl flex items-center gap-2 transition-all shadow-xl border border-slate-800 hover:border-slate-700 group cursor-pointer"
          >
            View Details
            <ExternalLink size={14} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}