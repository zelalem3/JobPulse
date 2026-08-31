import React, { useEffect, useMemo, useState } from "react";
import {
  Sparkles,
  Check,
  X,
  Loader2,
  Target,
} from "lucide-react";
import api from "../../services/axios";
import { Skill } from "../../types/jobDetails";

interface RequiredSkillsPanelProps {
  skills: (Skill | string)[];
}

interface UserSkill {
  id: number;
  name: string;
  created_at?: string;
}

export default function RequiredSkillsPanel({
  skills,
}: RequiredSkillsPanelProps) {
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [loading, setLoading] = useState(true);

  /*
   * Fetch the skills configured by the current user.
   *
   * Your existing /api/alerts endpoint already returns:
   *
   * {
   *   skills: [...]
   * }
   */
  useEffect(() => {
    const fetchUserSkills = async () => {
      try {
        setLoading(true);

        const response = await api.get("/api/alerts");

        const data = response.data;

        if (data && Array.isArray(data.skills)) {
          setUserSkills(data.skills);
        } else if (Array.isArray(data)) {
          setUserSkills(data);
        } else {
          setUserSkills([]);
        }
      } catch (error) {
        console.error("Error fetching user skills:", error);
        setUserSkills([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserSkills();
  }, []);

  /*
   * Convert a job skill into a comparable string.
   */
  const getSkillName = (skill: Skill | string): string => {
    if (typeof skill === "string") {
      return skill;
    }

    if (skill && typeof skill === "object") {
      return skill.name || skill.title || String(skill.id || "");
    }

    return String(skill);
  };

  /*
   * Normalize skill names so that:
   *
   * "React"
   * "react"
   * " REACT "
   *
   * are treated as the same skill.
   */
  const normalizeSkill = (skill: string): string => {
    return skill
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  };

  /*
   * Compare the job's required skills against
   * the user's configured skills.
   */
  const skillComparison = useMemo(() => {
    const userSkillSet = new Set(
      userSkills.map((skill) => normalizeSkill(skill.name))
    );

    return skills.map((skill) => {
      const name = getSkillName(skill);
      const normalizedName = normalizeSkill(name);

      return {
        name,
        matched: userSkillSet.has(normalizedName),
      };
    });
  }, [skills, userSkills]);

  const matchedSkills = skillComparison.filter(
    (skill) => skill.matched
  );

  const missingSkills = skillComparison.filter(
    (skill) => !skill.matched
  );

  const matchPercentage =
    skillComparison.length > 0
      ? Math.round(
          (matchedSkills.length / skillComparison.length) * 100
        )
      : 0;

  if (!skills || skills.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-6 border border-slate-800/90 shadow-2xl space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">

        <div>
          <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles
              size={14}
              className="text-emerald-400"
            />

            Required Skills
          </h4>

          <p className="text-[11px] text-slate-500 mt-1">
            Compared against your skill profile
          </p>
        </div>

        {/* Match percentage */}
        {!loading && (
          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shrink-0">
            <Target
              size={14}
              className="text-emerald-400"
            />

            <span className="text-xs font-black text-emerald-300">
              {matchPercentage}%
            </span>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-6 gap-2 text-slate-500">
          <Loader2
            size={16}
            className="animate-spin text-emerald-400"
          />

          <span className="text-xs font-medium">
            Comparing your skills...
          </span>
        </div>
      ) : (
        <>
          {/* Match summary */}
          <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800/70">

            <div className="flex items-center justify-between mb-2">

              <span className="text-[11px] font-bold text-slate-400">
                Skill compatibility
              </span>

              <span className="text-[11px] font-bold text-slate-300">
                {matchedSkills.length} / {skillComparison.length} matched
              </span>

            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">

              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                style={{
                  width: `${matchPercentage}%`,
                }}
              />

            </div>
          </div>

          {/* Matched skills */}
          {matchedSkills.length > 0 && (
            <div className="space-y-2.5">

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Check
                    size={12}
                    className="text-emerald-400"
                  />
                </div>

                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  You have these skills
                </span>
              </div>

              <div className="flex flex-wrap gap-2">

                {matchedSkills.map((skill, index) => (
                  <span
                    key={`${skill.name}-${index}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-bold rounded-xl"
                  >
                    <Check size={11} />
                    {skill.name}
                  </span>
                ))}

              </div>
            </div>
          )}

          {/* Missing skills */}
          {missingSkills.length > 0 && (
            <div className="space-y-2.5">

              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                  <X
                    size={12}
                    className="text-slate-500"
                  />
                </div>

                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Skills to develop
                </span>
              </div>

              <div className="flex flex-wrap gap-2">

                {missingSkills.map((skill, index) => (
                  <span
                    key={`${skill.name}-${index}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 border border-slate-700/70 text-slate-400 text-xs font-semibold rounded-xl"
                  >
                    {skill.name}
                  </span>
                ))}

              </div>
            </div>
          )}

          {/* Perfect match */}
          {missingSkills.length === 0 &&
            matchedSkills.length > 0 && (
              <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15">
                <p className="text-[11px] text-emerald-300 font-semibold flex items-center gap-2">
                  <Sparkles size={13} />
                  You match every listed skill for this position.
                </p>
              </div>
            )}

          {/* No user skills */}
          {userSkills.length === 0 && (
            <div className="p-3 rounded-2xl bg-amber-500/5 border border-amber-500/15">
              <p className="text-[11px] text-amber-300 font-medium leading-relaxed">
                You haven't configured any skills yet. Add skills to your
                Job Alerts to get personalized skill matching.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}