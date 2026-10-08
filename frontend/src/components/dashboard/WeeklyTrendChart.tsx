import React from "react";
import { WeeklyTrendItem } from "../../types/dashboard";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Activity } from "lucide-react";

interface WeeklyTrendChartProps {
  data: WeeklyTrendItem[];
}

export default function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  return (
    <div className="h-full bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-800/70">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="text-emerald-400" size={18} />
            Weekly Job Inflow
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            New postings over the last 7 days
          </p>
        </div>
      </div>

      <div className="h-56 sm:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                borderColor: "#1e293b",
                borderRadius: "0.75rem",
                color: "#f1f5f9",
                fontSize: "12px",
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.4)",
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
