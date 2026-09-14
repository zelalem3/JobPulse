
import React from 'react';
import { Tag, Trash2, MapPin } from 'lucide-react';

interface Skill {
  id: number;
  name?: string | null;
  keyword?: string | null;
  location?: string | null;
  created_at?: string;
}

interface AlertItemProps {
  skill: Skill;
  onDelete: (id: number) => void;
}

export default function AlertItem({
  skill,
  onDelete,
}: AlertItemProps) {
  // Support both legacy "name" and backend "keyword"
  const displayName =
    skill.name?.trim() ||
    skill.keyword?.trim() ||
    'Unnamed Alert';

  return (
    <div className="p-5 flex items-center justify-between gap-4 hover:bg-slate-900/60 transition-all group">
      
      {/* Alert Information */}
      <div className="flex items-center gap-3.5 min-w-0">
        
        <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 group-hover:border-indigo-500/30 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 transition-all shrink-0">
          <Tag size={16} />
        </div>

        <div className="space-y-1 min-w-0">
          
          {/* FIX: Render displayName instead of skill.name */}
          <h4 className="text-sm font-semibold text-white truncate">
            {displayName}
          </h4>

          <div className="flex flex-wrap items-center gap-2">
            
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-900/80 px-2.5 py-0.5 rounded-md border border-slate-800">
              Active Watch
            </span>

            {skill.location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin size={11} />
                {skill.location}
              </span>
            )}

          </div>
        </div>
      </div>

      {/* Delete Button */}
      <button
        type="button"
        onClick={() => onDelete(skill.id)}
        className="p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/50 rounded-xl transition-all cursor-pointer shadow-sm opacity-80 group-hover:opacity-100 shrink-0"
        title={`Delete alert: ${displayName}`}
        aria-label={`Delete alert: ${displayName}`}
      >
        <Trash2 size={16} />
      </button>

    </div>
  );
}