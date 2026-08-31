import React from "react";
import {
  CheckCircle2,
  CircleAlert,
  Sparkles,
  Target,
} from "lucide-react";
import { Skill } from "../../types/jobDetails";

interface SkillMatchPanelProps {
  score: number;
  matchedSkills: Skill[];
  missingSkills: Skill[];
  loading?: boolean;
}

export default function SkillMatchPanel({
  score = 0,
  matchedSkills = [],
  missingSkills = [],
  loading = false,
}: SkillMatchPanelProps) {
  if (loading) {
    return (
      <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-6 border border-slate-800/90 shadow-2xl">
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            <Sparkles size={15} className="text-emerald-400" />
          </div>

          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Your Skill Match
          </h4>
        </div>

        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  /*
   * Make sure the score is always a valid percentage.
   */
  const safeScore = Math.min(
    100,
    Math.max(0, Number(score) || 0)
  );

  const getScoreLabel = () => {
    if (safeScore >= 80) return "Strong Match";
    if (safeScore >= 60) return "Good Match";
    if (safeScore >= 40) return "Potential Match";
    if (safeScore > 0) return "Low Match";

    return "No Match Data";
  };

  const getScoreDescription = () => {
    if (safeScore >= 80) {
      return "You meet most of the skills required for this position.";
    }

    if (safeScore >= 60) {
      return "You have a solid set of skills that align with this position.";
    }

    if (safeScore >= 40) {
      return "You have some relevant skills, but there are a few gaps.";
    }

    if (safeScore > 0) {
      return "You have some relevant skills, but this position requires several skills that aren't currently in your profile.";
    }

    if (missingSkills.length > 0) {
      return "This position requires skills that aren't currently in your profile.";
    }

    return "There isn't enough skill information to calculate a meaningful match for this position.";
  };

  /*
   * SVG circumference:
   *
   * radius = 52
   * circumference = 2πr ≈ 326.7
   */
  const circumference = 326.7;
  const progress = (safeScore / 100) * circumference;

  return (
    <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-6 border border-slate-800/90 shadow-2xl space-y-6 relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Sparkles size={14} className="text-emerald-400" />
          Your Skill Match
        </h4>

        <Target size={16} className="text-slate-600" />
      </div>

      {/* Score */}
      <div className="flex flex-col items-center text-center relative z-10">

        <div className="relative w-32 h-32 flex items-center justify-center">

          {/* Background ring */}
          <div className="absolute inset-0 rounded-full border-8 border-slate-800" />

          {/* Progress ring */}
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 120 120"
          >
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className="text-emerald-500"
              strokeDasharray={`${progress} ${circumference}`}
            />
          </svg>

          {/* Score text */}
          <div className="relative flex flex-col items-center">
            <span className="text-3xl font-black text-white">
              {Math.round(safeScore)}%
            </span>

            <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">
              Match
            </span>
          </div>
        </div>

        <h3 className="mt-4 text-sm font-black text-emerald-300">
          {getScoreLabel()}
        </h3>

        <p className="mt-1 text-xs leading-relaxed text-slate-500 max-w-xs">
          {getScoreDescription()}
        </p>
      </div>

      {/* Skill summary */}
      <div className="grid grid-cols-2 gap-3 relative z-10">

        {/* Matched */}
        <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle2
              size={15}
              className="text-emerald-400"
            />

            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Matched
            </span>
          </div>

          <p className="mt-2 text-xl font-black text-white">
            {matchedSkills.length}
          </p>
        </div>

        {/* Missing */}
        <div className="rounded-2xl bg-amber-500/5 border border-amber-500/10 p-3">
          <div className="flex items-center gap-2">
            <CircleAlert
              size={15}
              className="text-amber-400"
            />

            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Missing
            </span>
          </div>

          <p className="mt-2 text-xl font-black text-white">
            {missingSkills.length}
          </p>
        </div>
      </div>

      {/* Matched skills */}
      {matchedSkills.length > 0 && (
        <div className="space-y-3 relative z-10">

          <div className="flex items-center gap-2">
            <CheckCircle2
              size={14}
              className="text-emerald-400"
            />

            <span className="text-[10px] uppercase tracking-wider font-black text-slate-400">
              Skills You Have
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-bold"
              >
                <CheckCircle2 size={11} />
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Missing skills */}
      {missingSkills.length > 0 && (
        <div className="space-y-3 relative z-10">

          <div className="flex items-center gap-2">
            <CircleAlert
              size={14}
              className="text-amber-400"
            />

            <span className="text-[10px] uppercase tracking-wider font-black text-slate-400">
              Skill Gaps
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {missingSkills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/5 border border-amber-500/15 text-amber-300 text-[11px] font-bold"
              >
                <CircleAlert size={11} />
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Perfect match */}
      {missingSkills.length === 0 &&
        matchedSkills.length > 0 && (
          <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 relative z-10">
            <p className="text-xs text-emerald-300 font-semibold leading-relaxed">
              🎯 You have all of the skills currently associated
              with this position.
            </p>
          </div>
        )}

      {/* No skill information */}
      {matchedSkills.length === 0 &&
        missingSkills.length === 0 && (
          <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-800 relative z-10">
            <p className="text-xs text-slate-500 leading-relaxed">
              There isn't enough skill information to calculate a
              meaningful match for this position.
            </p>
          </div>
        )}
    </div>
  );
}