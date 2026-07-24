import React from 'react';
import { Calendar, Trash2 } from 'lucide-react';

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
    <div className="p-5 flex items-center justify-between hover:bg-slate-800/40 transition">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white">Monitor: <span className="text-slate-300 font-black">{skill.name}</span></h3>
        <p className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
          <Calendar size={12} className="text-slate-500" /> Active Watch
        </p>
      </div>

      <button
        onClick={() => onDelete(skill.id)}
        className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/60 rounded-2xl transition cursor-pointer shadow-lg"
        title="Delete Alert"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}