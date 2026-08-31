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
  return (
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
      <h4
        className="
          text-xs
          font-black
          text-slate-300
          uppercase
          tracking-wider
          mb-5
        "
      >
        Position Specs
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
        {/* Location */}
        <div
          className="
            p-3.5
            bg-slate-950/40
            rounded-2xl
            border border-slate-800/60
            hover:border-emerald-500/20
            transition-colors
          "
        >
          <div className="flex items-center gap-2 mb-2">
            <MapPin
              size={14}
              className="text-emerald-400"
            />

            <span
              className="
                text-[10px]
                text-slate-500
                font-black
                uppercase
                tracking-wider
              "
            >
              Location
            </span>
          </div>

          <p className="text-sm font-bold text-white">
            {location || "Not specified"}
          </p>
        </div>

        {/* Compensation */}
        <div
          className="
            p-3.5
            bg-slate-950/40
            rounded-2xl
            border border-slate-800/60
            hover:border-indigo-500/20
            transition-colors
          "
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign
              size={14}
              className="text-indigo-400"
            />

            <span
              className="
                text-[10px]
                text-slate-500
                font-black
                uppercase
                tracking-wider
              "
            >
              Compensation
            </span>
          </div>

          <p className="text-sm font-bold text-white">
            {salary || "Not specified"}
          </p>
        </div>

        {/* Employment */}
        <div
          className="
            p-3.5
            bg-slate-950/40
            rounded-2xl
            border border-slate-800/60
            hover:border-blue-500/20
            transition-colors
          "
        >
          <div className="flex items-center gap-2 mb-2">
            <Briefcase
              size={14}
              className="text-blue-400"
            />

            <span
              className="
                text-[10px]
                text-slate-500
                font-black
                uppercase
                tracking-wider
              "
            >
              Employment Type
            </span>
          </div>

          <p className="text-sm font-bold text-white">
            {type || "Not specified"}
          </p>
        </div>
      </div>
    </div>
  );
}