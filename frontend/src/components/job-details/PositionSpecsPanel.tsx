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
    <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
        Position Specs
      </h4>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-800 rounded-xl border border-slate-700/60 text-slate-300 shrink-0">
            <MapPin size={16} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
              Location
            </p>
            <p className="text-sm font-bold text-white">{location}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-800 rounded-xl border border-slate-700/60 text-slate-300 shrink-0">
            <DollarSign size={16} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
              Compensation
            </p>
            <p className="text-sm font-bold text-white">
              {salary || "Not Specified"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-800 rounded-xl border border-slate-700/60 text-slate-300 shrink-0">
            <Briefcase size={16} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">
              Employment Type
            </p>
            <p className="text-sm font-bold text-white">{type}</p>
          </div>
        </div>
      </div>
    </div>
  );
}