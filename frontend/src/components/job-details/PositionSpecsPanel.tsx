import React from "react";
import {
  MapPin,
  DollarSign,
  Briefcase,
} from "lucide-react";

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
  const specs = [
    {
      icon: MapPin,
      label: "Location",
      value: location || "Not specified",
      accent: "text-emerald-400",
      hover: "hover:border-emerald-500/25",
    },
    {
      icon: DollarSign,
      label: "Compensation",
      value: salary || "Not specified",
      accent: "text-indigo-400",
      hover: "hover:border-indigo-500/25",
    },
    {
      icon: Briefcase,
      label: "Employment Type",
      value: type || "Not specified",
      accent: "text-sky-400",
      hover: "hover:border-sky-500/25",
    },
  ];

  return (
    <div className="bg-slate-900/70 backdrop-blur-2xl rounded-3xl p-6 border border-slate-800/90 shadow-2xl">
      <h4 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-5">
        Position Specs
      </h4>

      <div className="grid grid-cols-1 gap-3">
        {specs.map(({ icon: Icon, label, value, accent, hover }) => (
          <div
            key={label}
            className={`
              p-3.5
              bg-slate-950/40
              rounded-2xl
              border border-slate-800/60
              transition-colors duration-200
              ${hover}
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon size={14} className={accent} />
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">
                {label}
              </span>
            </div>
            <p className="text-sm font-bold text-white leading-snug">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
