import React from "react";
import { MapPin, DollarSign, Briefcase } from "lucide-react";

interface PositionSpecsPanelProps {
  location: string;
  salary: string;
  type: string;
}

export default function PositionSpecsPanel({
  location,
  salary,
  type,
}: PositionSpecsPanelProps) {
  return (
    <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-6 border border-slate-800/90 shadow-2xl space-y-4">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
        Position Specs
      </h4>

      <div className="space-y-4">
        <div className="flex items-center gap-3.5 p-3 bg-slate-950/40 rounded-2xl border border-slate-800/60">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400 shrink-0">
            <MapPin size={16} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Location
            </p>
            <p className="text-xs font-bold text-white mt-0.5">{location}</p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3 bg-slate-950/40 rounded-2xl border border-slate-800/60">
          <div className="p-2.5 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400 shrink-0">
            <DollarSign size={16} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Compensation
            </p>
            <p className="text-xs font-bold text-white mt-0.5">
              {salary || "Not Specified"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3.5 p-3 bg-slate-950/40 rounded-2xl border border-slate-800/60">
          <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400 shrink-0">
            <Briefcase size={16} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Employment Type
            </p>
            <p className="text-xs font-bold text-white mt-0.5">{type}</p>
          </div>
        </div>
      </div>
    </div>
  );
}