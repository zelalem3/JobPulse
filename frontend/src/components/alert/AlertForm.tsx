import React from "react";
import { Loader2, Plus, MapPin, Tag } from "lucide-react";

interface AlertFormProps {
  keyword: string;
  setKeyword: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
}

export default function AlertForm({
  keyword,
  setKeyword,
  location,
  setLocation,
  onSubmit,
  isSubmitting,
}: AlertFormProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800/70 bg-slate-900/70 backdrop-blur-xl shadow-xl">
      <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-800/70 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400 shrink-0">
          <Tag size={15} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-tight">
            New alert
          </h2>
          <p className="text-xs text-slate-500">
            Track a skill, role, or keyword
          </p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-5 sm:p-6 space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="alert-keyword-input"
            className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide"
          >
            Keyword / skill
          </label>
          <input
            id="alert-keyword-input"
            type="text"
            placeholder="e.g. TypeScript, DevOps, React…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            required
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="alert-location-input"
            className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex items-center gap-1.5"
          >
            <MapPin size={11} />
            Location
            <span className="normal-case font-normal text-slate-600">
              (optional)
            </span>
          </label>
          <input
            id="alert-location-input"
            type="text"
            placeholder="e.g. Remote, Addis Ababa…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
            disabled={isSubmitting}
            autoComplete="off"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !keyword.trim()}
          className="w-full inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] px-4 py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-950/40 disabled:opacity-50 disabled:cursor-not-allowed border border-indigo-500/25"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Plus size={15} />
              Save alert
            </>
          )}
        </button>
      </form>
    </div>
  );
}
