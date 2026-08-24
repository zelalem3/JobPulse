import React from 'react';
import { Plus, Loader2, Zap } from 'lucide-react';

interface AlertFormProps {
  newName: string;
  setNewName: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
}

export default function AlertForm({ newName, setNewName, onSubmit, isSubmitting }: AlertFormProps) {
  return (
    <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-6 border border-slate-800/80 shadow-2xl space-y-6 relative overflow-hidden">
      
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-2.5 border-b border-slate-800/80 pb-4">
        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <Zap size={16} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">New Alert Monitor</h3>
          <p className="text-xs text-slate-400">Target a specific technology or skill</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Keyword / Skill</label>
          <input 
            type="text" 
            placeholder="e.g., TypeScript, Go, DevOps..." 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl text-sm text-slate-100 outline-none placeholder:text-slate-600 shadow-inner focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            required
            disabled={isSubmitting}
          />
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 px-4 py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-950/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/30"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin text-white" />
              <span>Deploying Monitor...</span>
            </>
          ) : (
            <>
              <Plus size={16} />
              <span>Save Alert Monitor</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}