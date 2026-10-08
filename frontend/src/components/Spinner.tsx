import React from "react";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: string;
  label?: string;
  layout?: "vertical" | "horizontal";
  glow?: boolean;
  card?: boolean;
}

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-[22px] h-[22px]",
  xl: "w-7 h-7",
};

const labelSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-sm",
  xl: "text-base",
};

export default function Spinner({
  size = "md",
  color = "text-indigo-400",
  label,
  layout = "vertical",
  glow = true,
  card = false,
}: SpinnerProps) {
  const spinner = (
    <div className={card ? "relative" : undefined}>
      {card && glow && (
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl" />
      )}

      <div
        className={
          card
            ? "relative w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center"
            : undefined
        }
      >
        <Loader2
          className={`${sizeClasses[size]} ${color} animate-spin ${
            glow
              ? "drop-shadow-[0_0_8px_rgba(99,102,241,0.25)]"
              : ""
          }`}
          strokeWidth={2.2}
        />
      </div>
    </div>
  );

  if (layout === "horizontal") {
    return (
      <div
        className="flex items-center justify-center gap-3"
        role="status"
        aria-label={label || "Loading"}
      >
        {spinner}

        {label && (
          <span
            className={`${labelSizes[size]} font-medium text-slate-400`}
          >
            {label}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center gap-4"
      role="status"
      aria-label={label || "Loading"}
    >
      {spinner}

      {label && (
        <p
          className={`${labelSizes[size]} font-medium text-slate-400`}
        >
          {label}
        </p>
      )}
    </div>
  );
}

