import React from 'react';
import { Tag, Trash2 } from 'lucide-react';

interface Skill {
  id: number;
  name: string;
  created_at?: string;
}

interface AlertItemProps {
  skill: Skill;
  onDelete: (id: number) => void;
}

export default function AlertItem({ skill, onDelete }: AlertItemProps) {
  return (
    <div className="p-5 flex items-center justify-between hover:bg-slate-900/60 transition-all group">
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 group-hover:border-indigo-500/30 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all">
          <Tag size={16} />
        </div>
        <div className="space-y-0.5">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            {skill.name}
          </h4>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-900/80 px-2.5 py-0.5 rounded-md border border-slate-800">
            Active Watch
          </span>
        </div>
      </div>

      <button
        onClick={() => onDelete(skill.id)}
        className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 rounded-xl transition-all cursor-pointer shadow-sm opacity-80 group-hover:opacity-100"
        title="Delete Alert"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}