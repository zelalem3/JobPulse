import React from "react";
import { Skill } from "../../types/jobDetails";
import { Sparkles } from "lucide-react";

interface RequiredSkillsPanelProps {
  skills: (Skill | string)[];
}

export default function RequiredSkillsPanel({ skills }: RequiredSkillsPanelProps) {
  if (!skills || skills.length === 0) return null;

  const renderSkillName = (skill: Skill | string): string => {
    if (typeof skill === "string") return skill;
    if (skill && typeof skill === "object") {
      return skill.name || skill.title || String(skill.id || "");
    }
    return String(skill);
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-6 border border-slate-800/90 shadow-2xl space-y-4">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
        <Sparkles size={14} className="text-emerald-400" /> Required Skills
      </h4>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1.5 bg-slate-800/90 border border-slate-700/60 hover:border-emerald-500/40 text-slate-200 text-xs font-bold rounded-xl tracking-wide transition-all shadow-sm"
          >
            {renderSkillName(skill)}
          </span>
        ))}
      </div>
    </div>
  );
}