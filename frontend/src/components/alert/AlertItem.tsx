import React from "react";
import {
  Tag,
  Trash2,
  MapPin,
  Loader2,
  Clock,
  Activity,
  ArrowUpRight,
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
  if (!date) {
    return null;
  }

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return null;
  }

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
    alert.name?.trim() ||
    alert.keyword?.trim() ||
    "Unnamed alert";

  const created =
    formatCreated(
      alert.created_at
    );

  return (
    <div
      className={`
        group relative overflow-hidden
        rounded-2xl
        border border-slate-800/80
        bg-slate-950/40
        hover:bg-slate-950/70
        hover:border-indigo-500/20
        transition-all duration-300
        ${isDeleting
          ? "opacity-50 pointer-events-none"
          : "hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"}
      `}
    >

      {/* Active accent */}
      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-indigo-500/70 opacity-60 group-hover:opacity-100 transition-opacity" />

      <div className="p-4 sm:p-5">

        <div className="flex items-start justify-between gap-4">

          {/* Main */}
          <div className="flex items-start gap-3.5 min-w-0">

            <div className="relative shrink-0">

              <div className="w-11 h-11 rounded-xl bg-indigo-500/[0.08] border border-indigo-500/15 flex items-center justify-center">
                <Tag
                  size={17}
                  className="text-indigo-400"
                />
              </div>

              {/* Live dot */}
              <span className="absolute -right-1 -bottom-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-50 animate-ping" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 border-2 border-slate-950" />
              </span>
            </div>

            <div className="min-w-0 pt-0.5">

              <div className="flex items-center gap-2 flex-wrap">

                <h3 className="text-sm font-bold text-white truncate">
                  {displayName}
                </h3>

                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/15 text-[9px] font-bold uppercase tracking-wider text-indigo-300">
                  <Activity size={9} />
                  Watching
                </span>
              </div>

              {/* Details */}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">

                {alert.location && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                    <MapPin
                      size={11}
                      className="text-slate-600"
                    />
                    {alert.location}
                  </span>
                )}

                {created && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-600">
                    <Clock size={11} />
                    Added {created}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delete */}
          <button
            type="button"
            onClick={() =>
              onDelete(alert.id)
            }
            disabled={isDeleting}
            className="
              shrink-0
              w-9 h-9
              rounded-xl
              flex items-center justify-center
              text-slate-600
              border border-transparent
              hover:text-rose-400
              hover:bg-rose-500/[0.08]
              hover:border-rose-500/15
              transition-all
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-rose-500/30
              disabled:opacity-50
            "
            title={`Delete alert: ${displayName}`}
            aria-label={`Delete alert: ${displayName}`}
          >
            {isDeleting ? (
              <Loader2
                size={15}
                className="animate-spin"
              />
            ) : (
              <Trash2 size={15} />
            )}
          </button>
        </div>

        {/* Bottom metadata */}
        <div className="mt-4 pt-3.5 border-t border-slate-800/50 flex items-center justify-between">

          <div className="flex items-center gap-2">

            <span className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              Matching incoming jobs
            </span>
          </div>

          <ArrowUpRight
            size={13}
            className="text-slate-700 group-hover:text-indigo-400 transition-colors"
          />
        </div>
      </div>
    </div>
  );
}

