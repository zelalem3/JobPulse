import React from 'react';
import { Plus, Loader2 } from 'lucide-react';

interface AlertFormProps {
  newName: string;
  setNewName: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export default function AlertForm({ newName, setNewName, onSubmit, isSubmitting }: AlertFormProps) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-5">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-3">
        <Plus size={16} className="text-slate-300" /> New Alert Monitor
      </h3>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Skill Name</label>
          <input 
            type="text" 
            placeholder="e.g., React, Python..." 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl text-sm text-slate-100 outline-none placeholder:text-slate-500 shadow-inner focus:border-slate-700 transition-all font-semibold"
            required
            disabled={isSubmitting}
          />
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 inline-flex items-center justify-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white bg-amber-950/60 border border-amber-800/60 hover:bg-amber-900/80 px-4 py-3 rounded-2xl transition-all shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Save Alert
        </button>
      </form>
    </div>
  );
}