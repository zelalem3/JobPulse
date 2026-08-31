import React from "react";
import {
  Database,
  Calendar,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

interface PipelineTelemetryPanelProps {
  id: string;
  scrapedAt: string;
}

export default function PipelineTelemetryPanel({
  id,
  scrapedAt,
}: PipelineTelemetryPanelProps) {
  return (
    <div className="space-y-4">
      {/* Verification */}
      <div
        className="
          bg-slate-900/70
          backdrop-blur-2xl
          rounded-3xl
          p-6
          border border-slate-800/90
          shadow-2xl
        "
      >
        <div className="flex items-center gap-2 mb-5">
          <div
            className="
              p-2
              bg-emerald-500/10
              border border-emerald-500/20
              rounded-xl
            "
          >
            <ShieldCheck
              size={15}
              className="text-emerald-400"
            />
          </div>

          <div>
            <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider">
              JobPulse Verification
            </h4>

            <p className="text-[10px] text-slate-600 mt-0.5">
              Listing integrity
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <span className="text-[10px] text-emerald-400">
                ✓
              </span>
            </div>

            <span className="text-xs font-semibold text-slate-300">
              Source successfully indexed
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <span className="text-[10px] text-emerald-400">
                ✓
              </span>
            </div>

            <span className="text-xs font-semibold text-slate-300">
              Listing data available
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <span className="text-[10px] text-emerald-400">
                ✓
              </span>
            </div>

            <span className="text-xs font-semibold text-slate-300">
              Application link available
            </span>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div
        className="
          bg-slate-900/40
          border border-slate-800/80
          rounded-3xl
          p-5
          shadow-xl
          backdrop-blur-md
        "
      >
        <div className="flex items-center gap-2 mb-4">
          <Database
            size={14}
            className="text-slate-500"
          />

          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
            Listing Metadata
          </span>
        </div>

        <div className="space-y-3 font-mono text-[11px]">
          <div className="flex justify-between gap-4 border-b border-slate-800/70 pb-2.5">
            <span className="text-slate-600">
              Index ID
            </span>

            <span className="text-slate-400 font-bold">
              #JP-{id}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-slate-600">
              Discovered
            </span>

            <span className="text-slate-400 font-bold flex items-center gap-1.5 text-right">
              <Calendar size={11} className="text-slate-600" />
              {scrapedAt}
            </span>
          </div>
        </div>
      </div>

      {/* Security notice */}
      <div
        className="
          p-4
          bg-emerald-500/[0.03]
          border border-slate-800/80
          rounded-3xl
          flex gap-3
          items-start
          shadow-xl
          backdrop-blur-md
        "
      >
        <ShieldCheck
          size={17}
          className="shrink-0 mt-0.5 text-emerald-400"
        />

        <div>
          <p className="text-[11px] font-bold text-slate-300 mb-1">
            Apply safely
          </p>

          <p className="text-[11px] leading-relaxed font-medium text-slate-500">
            Verify the application domain before submitting
            sensitive personal information.
          </p>
        </div>
      </div>
    </div>
  );
}