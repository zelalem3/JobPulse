import React from "react";
import { Tag, Trash2, MapPin, Loader2, Clock } from "lucide-react";

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
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
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
    alert.name?.trim() || alert.keyword?.trim() || "Unnamed alert";
  const created = formatCreated(alert.created_at);

  return (
    <div
      className={`
        relative px-5 sm:px-6 py-4
        flex items-center justify-between gap-4
        hover:bg-slate-900/50 transition-colors
        ${isDeleting ? "opacity-60 pointer-events-none" : ""}
      `}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0 group-hover:border-indigo-500/30">
          <Tag size={16} className="text-indigo-400/90" />
        </div>

        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold text-white truncate">
            {displayName}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300/90 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded-md">
              Active
            </span>

            {alert.location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin size={11} />
                {alert.location}
              </span>
            )}

            {created && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                <Clock size={11} />
                {created}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(alert.id)}
        disabled={isDeleting}
        className="
          p-2.5 rounded-xl border border-transparent
          text-slate-500 hover:text-rose-400
          hover:bg-rose-950/40 hover:border-rose-900/40
          transition-all shrink-0
          focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40
          disabled:opacity-50
        "
        title={`Delete alert: ${displayName}`}
        aria-label={`Delete alert: ${displayName}`}
      >
        {isDeleting ? (
          <Loader2 size={16} className="animate-spin text-slate-400" />
        ) : (
          <Trash2 size={16} />
        )}
      </button>
    </div>
  );
}
