import React from "react";
import { Database, Calendar, ShieldAlert } from "lucide-react";

interface PipelineTelemetryPanelProps {
  id: string;
  scrapedAt: string;
}

export default function PipelineTelemetryPanel({
  id,
  scrapedAt,
}: PipelineTelemetryPanelProps) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4 text-slate-200">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Database size={14} /> Pipeline Telemetry
        </h4>

        <div className="space-y-3 font-mono text-xs">
          <div className="flex justify-between border-b border-slate-800 pb-2.5">
            <span className="text-slate-500">Index ID:</span>
            <span className="text-slate-200 font-bold">#JP-{id}</span>
          </div>
          <div className="flex justify-between border-b border-slate-800 pb-2.5">
            <span className="text-slate-500">Discovered:</span>
            <span className="text-slate-300 font-bold flex items-center gap-1">
              <Calendar size={12} className="text-slate-500" /> {scrapedAt}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Ingest Engine:</span>
            <span className="text-slate-300 font-bold">Playwright/BS4</span>
          </div>
        </div>
      </div>

      <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-3xl flex gap-3 items-start text-slate-400 shadow-xl">
        <ShieldAlert size={18} className="shrink-0 mt-0.5 text-slate-400" />
        <p className="text-[11px] leading-relaxed font-medium text-slate-400">
          This listing was automatically scraped by the JobPulse system cluster.
          Always cross-verify external source application loops before submitting
          sensitive account keys or CV credentials.
        </p>
      </div>
    </div>
  );
}