import React from "react";
import {
  Loader2,
  Plus,
  MapPin,
  Tag,
  Sparkles,
} from "lucide-react";

interface AlertFormProps {
  keyword: string;
  setKeyword: (val: string) => void;
  location: string;
  setLocation: (val: string) => void;
  onSubmit: (
    e: React.FormEvent<HTMLFormElement>
  ) => void;
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
    <div className="relative overflow-hidden rounded-[24px] border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl shadow-xl">

      {/* Accent glow */}
      <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative px-5 sm:px-6 pt-6 pb-5">

        <div className="flex items-start justify-between gap-4">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Tag
                size={17}
                className="text-indigo-400"
              />
            </div>

            <div>
              <h2 className="text-sm font-bold text-white">
                New monitor
              </h2>

              <p className="text-[11px] text-slate-500 mt-0.5">
                Tell JobPulse what to watch
              </p>
            </div>
          </div>

          <Sparkles
            size={16}
            className="text-indigo-400/50"
          />
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="relative px-5 sm:px-6 pb-6 space-y-5"
      >

        {/* Keyword */}
        <div className="space-y-2">

          <label
            htmlFor="alert-keyword-input"
            className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-slate-500"
          >
            <span>Keyword or skill</span>
            <span className="text-indigo-400/70">
              Required
            </span>
          </label>

          <div className="relative group">

            <Tag
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors"
            />

            <input
              id="alert-keyword-input"
              type="text"
              placeholder="React, Python, Backend..."
              value={keyword}
              onChange={(e) =>
                setKeyword(e.target.value)
              }
              disabled={isSubmitting}
              autoComplete="off"
              required
              className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/[0.08] transition-all"
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2">

          <label
            htmlFor="alert-location-input"
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
          >
            <MapPin size={11} />
            Location
            <span className="normal-case font-normal text-slate-700">
              Optional
            </span>
          </label>

          <div className="relative group">

            <MapPin
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors"
            />

            <input
              id="alert-location-input"
              type="text"
              placeholder="Remote, Addis Ababa..."
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              disabled={isSubmitting}
              autoComplete="off"
              className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/[0.08] transition-all"
            />
          </div>
        </div>

        {/* Examples */}
        <div className="flex flex-wrap gap-1.5">

          {[
            "React",
            "Python",
            "Backend",
          ].map((example) => (
            <button
              key={example}
              type="button"
              disabled={isSubmitting}
              onClick={() =>
                setKeyword(example)
              }
              className="px-2.5 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[10px] font-semibold text-slate-500 hover:text-indigo-300 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all"
            >
              {example}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={
            isSubmitting ||
            !keyword.trim()
          }
          className="group w-full inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-xs font-bold transition-all shadow-lg shadow-indigo-950/30 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2
                size={15}
                className="animate-spin"
              />
              Creating monitor...
            </>
          ) : (
            <>
              <Plus size={15} />
              Start monitoring
              <span className="ml-auto opacity-40 group-hover:opacity-80 transition-opacity">
                →
              </span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

