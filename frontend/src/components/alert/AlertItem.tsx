
import React from "react";
import {
  Tag,
  Trash2,
  MapPin,
  Loader2,
  Clock3,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

export interface AlertData {
  id: number;
  name?: string | null;
  keyword?: string | null;
  location?: string | null;
  created_at?: string;
}

interface AlertItemProps {
  alert: AlertData;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

function formatCreated(date?: string) {
  if (!date) return null;

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AlertItem({
  alert,
  onDelete,
  isDeleting = false,
}: AlertItemProps) {
  const displayName =
    alert.name?.trim() ||
    alert.keyword?.trim() ||
    "Unnamed alert";

  const created = formatCreated(alert.created_at);

  return (
    <article
      className={`
        group relative overflow-hidden rounded-2xl
        border border-slate-800/90
        bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/90
        transition-all duration-200
        ${
          isDeleting
            ? "pointer-events-none opacity-60"
            : "hover:-translate-y-0.5 hover:border-indigo-400/30 hover:shadow-xl hover:shadow-indigo-950/20"
        }
      `}
    >
      {/* Soft decorative accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent opacity-50 transition-opacity group-hover:opacity-100" />

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3.5">
          {/* Keyword icon */}
          <div className="relative shrink-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-slate-900 text-indigo-300 shadow-inner shadow-indigo-500/[0.06] transition-transform duration-200 group-hover:scale-105">
              <Tag size={19} strokeWidth={1.8} />
            </div>

            <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-slate-900 bg-emerald-500 text-white shadow-sm shadow-emerald-950/50">
              <CheckCircle2 size={12} strokeWidth={2.5} />
            </span>
          </div>

          {/* Alert information */}
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="max-w-full break-words text-sm font-bold tracking-tight text-white sm:text-[15px]">
                {displayName}
              </h3>

              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/15 bg-emerald-400/[0.08] px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Saved
              </span>
            </div>

            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              Monitoring opportunities matching your search
            </p>

            {/* Metadata */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {alert.location ? (
                <span className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-sky-400/10 bg-sky-400/[0.06] px-2.5 py-1.5 text-xs text-sky-200/80">
                  <MapPin
                    size={13}
                    className="shrink-0 text-sky-400"
                  />
                  <span className="break-words">
                    {alert.location}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-violet-400/10 bg-violet-400/[0.06] px-2.5 py-1.5 text-xs text-violet-200/80">
                  <Sparkles
                    size={13}
                    className="text-violet-400"
                  />
                  All locations
                </span>
              )}

              {created && (
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-800/50 px-2.5 py-1.5 text-xs text-slate-400">
                  <Clock3 size={13} className="text-slate-500" />
                  {created}
                </span>
              )}
            </div>
          </div>

          {/* Delete button */}
          <button
            type="button"
            onClick={() => onDelete(alert.id)}
            disabled={isDeleting}
            className="
              flex h-9 w-9 shrink-0 items-center justify-center
              rounded-xl border border-slate-700/60 bg-slate-800/50
              text-slate-400 transition-all duration-200
              hover:border-rose-400/25 hover:bg-rose-500/10
              hover:text-rose-300
              focus:outline-none focus-visible:ring-2
              focus-visible:ring-rose-400/40
              disabled:cursor-not-allowed disabled:opacity-50
            "
            title={`Delete alert: ${displayName}`}
            aria-label={`Delete alert: ${displayName}`}
          >
            {isDeleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-800/80 pt-3.5">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Sparkles size={12} />
            </span>

            <span className="truncate text-[11px] font-medium text-slate-400">
              Job matching alert
            </span>
          </div>

          <ArrowUpRight
            size={15}
            className="shrink-0 text-slate-600 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-indigo-400"
          />
        </div>
      </div>
    </article>
  );
}
