import React from "react";
import { Skill } from "../../types/jobDetails";

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
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
        Required Skills
      </h4>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs font-bold rounded-xl tracking-wide"
          >
            {renderSkillName(skill)}
          </span>
        ))}
      </div>
    </div>
  );
}