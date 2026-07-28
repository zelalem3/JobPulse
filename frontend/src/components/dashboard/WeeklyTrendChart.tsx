import React from "react";
import { WeeklyTrendItem } from "../../types/dashboard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Activity } from "lucide-react";

interface WeeklyTrendChartProps {
  data: WeeklyTrendItem[];
}

export default function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="text-emerald-400" size={20} />
            Weekly Job Inflow
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">New postings captured over the last 7 days</p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#090d16",
                borderColor: "#1e293b",
                borderRadius: "1rem",
                color: "#fff",
                fontSize: "12px",
                boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.5)",
              }}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorTotal)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}