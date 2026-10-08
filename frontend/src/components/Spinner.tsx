import React from "react";

interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  layout?: "vertical" | "horizontal";
  card?: boolean;
}

const sizeConfig = {
  sm: {
    container: "h-9 w-9",
    ring: "inset-0 border-[1.5px]",
    inner: "h-6 w-6",
    text: "text-[8px]",
    dot: "h-1 w-1",
    label: "text-xs",
    orbit: "18px",
  },
  md: {
    container: "h-12 w-12",
    ring: "inset-0 border-2",
    inner: "h-7 w-7",
    text: "text-[9px]",
    dot: "h-1.5 w-1.5",
    label: "text-sm",
    orbit: "24px",
  },
  lg: {
    container: "h-14 w-14",
    ring: "inset-0 border-2",
    inner: "h-9 w-9",
    text: "text-[10px]",
    dot: "h-1.5 w-1.5",
    label: "text-sm",
    orbit: "28px",
  },
  xl: {
    container: "h-20 w-20",
    ring: "inset-0 border-2",
    inner: "h-11 w-11",
    text: "text-xs",
    dot: "h-2 w-2",
    label: "text-base",
    orbit: "40px",
  },
};






export default function Spinner({
  size = "md",
  label,
  layout = "vertical",
  card = false,
}: SpinnerProps) {
  const config = sizeConfig[size];

  const spinner = (
    <div className="relative">
      {/* Ambient glow */}
      <div className="absolute inset-0 scale-150 rounded-full bg-indigo-500/10 blur-xl animate-pulse" />

      {/* Spinner */}
      <div
        className={`relative ${config.container} flex items-center justify-center`}
      >
        {/* Outer orbit */}
        <div
          className={`absolute ${config.ring} rounded-full border-indigo-500/20 border-t-indigo-400 border-r-violet-400 animate-spin`}
          style={{ animationDuration: "1.4s" }}
        />

        {/* Secondary orbit */}
        <div
          className="absolute inset-[4px] rounded-full border border-transparent border-l-indigo-500/40 border-b-violet-500/40 animate-spin"
          style={{
            animationDuration: "2s",
            animationDirection: "reverse",
          }}
        />

        {/* Center glow */}
        <div className="absolute rounded-full bg-indigo-500/15 blur-md h-5/6 w-5/6" />

        {/* JP mark */}
        <div
          className={`relative ${config.inner} flex items-center justify-center rounded-lg bg-slate-900 border border-indigo-500/30 shadow-lg shadow-indigo-950/40`}
        >
          <span
            className={`${config.text} font-black tracking-tight text-white`}
          >
            JP
          </span>
        </div>

        {/* Orbiting dot */}
        <div
          className={`absolute ${config.dot} -top-0.5 left-1/2 -translate-x-1/2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)] animate-spin`}
          style={{
            transformOrigin: `50% ${size === "xl" ? "32px" : size === "lg" ? "24px" : size === "md" ? "20px" : "16px"}`,
            animationDuration: "1.2s",
          }}
        />
      </div>
    </div>
  );

  if (card) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 px-8 py-7 backdrop-blur-sm"
        role="status"
        aria-label={label || "Loading"}
      >
        {spinner}

        {label && (
          <LoadingLabel label={label} size={size} />
        )}
      </div>
    );
  }

  if (layout === "horizontal") {
    return (
      <div
        className="flex items-center justify-center gap-3"
        role="status"
        aria-label={label || "Loading"}
      >
        {spinner}

        {label && (
          <LoadingLabel label={label} size={size} />
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
        <LoadingLabel label={label} size={size} />
      )}
    </div>
  );
}

function LoadingLabel({
  label,
  size,
}: {
  label: string;
  size: SpinnerProps["size"];
}) {
  const labelSize = sizeConfig[size || "md"].label;

  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className={`${labelSize} font-medium text-slate-400`}
      >
        {label}
      </span>

      <div className="flex items-center gap-1">
        <span
          className="h-1 w-1 rounded-full bg-indigo-400 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <span
          className="h-1 w-1 rounded-full bg-indigo-400 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-1 w-1 rounded-full bg-indigo-400 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

