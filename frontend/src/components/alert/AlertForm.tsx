
import React from "react";
import {
  Loader2,
  Plus,
  MapPin,
  Tag,
  Sparkles,
  ArrowRight,
  Check,
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

const examples = [
  { label: "React", color: "indigo" },
  { label: "Python", color: "emerald" },
  { label: "Backend", color: "violet" },
];

export default function AlertForm({
  keyword,
  setKeyword,
  location,
  setLocation,
  onSubmit,
  isSubmitting,
}: AlertFormProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/10 transition-colors duration-300 hover:border-slate-700">
      {/* Decorative color accents */}
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-indigo-500/[0.10] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-44 w-44 rounded-full bg-violet-500/[0.07] blur-3xl" />

      {/* Top accent line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />

      {/* Header */}
      <div className="relative border-b border-slate-800/80 px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 to-violet-500/10 text-indigo-300 shadow-inner shadow-indigo-500/[0.06]">
            <Tag size={19} strokeWidth={1.8} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-white">
                Create an alert
              </h2>

              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-300">
                <Check size={10} />
                Quick setup
              </span>
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Tell JobPulse what opportunities to find.
            </p>
          </div>

          <Sparkles
            size={17}
            className="shrink-0 text-violet-400/70"
          />
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="relative space-y-5 p-5 sm:p-6"
      >
        {/* Keyword */}
        <div className="space-y-2.5">
          <label
            htmlFor="alert-keyword-input"
            className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-300"
          >
            <span>Keyword or skill</span>
            <span className="text-[10px] font-medium text-rose-300">
              Required *
            </span>
          </label>

          <div className="group/input relative">
            <Tag
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within/input:text-indigo-400"
            />

            <input
              id="alert-keyword-input"
              type="text"
              placeholder="e.g. React Developer"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="off"
              required
              maxLength={100}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 py-3.5 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-400/60 focus:bg-slate-950 focus:ring-4 focus:ring-indigo-500/[0.10] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <p className="text-[11px] leading-5 text-slate-500">
            Choose a job title, technology, or skill you want to track.
          </p>
        </div>

        {/* Suggestions */}
        <div className="space-y-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Popular searches
          </p>

          <div className="flex flex-wrap gap-2">
            {examples.map((example) => {
              const selected = keyword === example.label;

              const colorStyles = {
                indigo: selected
                  ? "border-indigo-400/40 bg-indigo-500/15 text-indigo-200"
                  : "border-indigo-400/10 bg-indigo-500/[0.04] text-indigo-300/80 hover:border-indigo-400/30 hover:bg-indigo-500/10 hover:text-indigo-200",
                emerald: selected
                  ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-200"
                  : "border-emerald-400/10 bg-emerald-500/[0.04] text-emerald-300/80 hover:border-emerald-400/30 hover:bg-emerald-500/10 hover:text-emerald-200",
                violet: selected
                  ? "border-violet-400/40 bg-violet-500/15 text-violet-200"
                  : "border-violet-400/10 bg-violet-500/[0.04] text-violet-300/80 hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-violet-200",
              };

              return (
                <button
                  key={example.label}
                  type="button"
                  disabled={isSubmitting}
                  aria-pressed={selected}
                  onClick={() => setKeyword(example.label)}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${colorStyles[example.color]}`}
                >
                  {example.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div className="space-y-2.5">
          <label
            htmlFor="alert-location-input"
            className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-300"
          >
            <span>Preferred location</span>
            <span className="text-[10px] font-medium text-slate-500">
              Optional
            </span>
          </label>

          <div className="group/input relative">
            <MapPin
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within/input:text-sky-400"
            />

            <input
              id="alert-location-input"
              type="text"
              placeholder="e.g. Addis Ababa or Remote"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isSubmitting}
              autoComplete="off"
              maxLength={100}
              className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 py-3.5 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 hover:border-slate-600 focus:border-sky-400/50 focus:bg-slate-950 focus:ring-4 focus:ring-sky-500/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <p className="text-[11px] leading-5 text-slate-500">
            Leave blank if you want to search without specifying a location.
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || !keyword.trim()}
          className="group/button relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-900/30 active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
        >
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/0 via-white/[0.08] to-white/0 opacity-0 transition-opacity group-hover/button:opacity-100" />

          {isSubmitting ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              <span>Creating your alert...</span>
            </>
          ) : (
            <>
              <Plus size={17} />
              <span>Start monitoring</span>
              <ArrowRight
                size={16}
                className="ml-auto transition-transform group-hover/button:translate-x-0.5"
              />
            </>
          )}
        </button>

        <p className="text-center text-[10px] leading-5 text-slate-500">
          <Sparkles
            size={11}
            className="mr-1 inline text-indigo-400"
          />
          You can manage or remove your alerts at any time.
        </p>
      </form>
    </div>
  );
}
