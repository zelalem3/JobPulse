import React from "react";
import { CompanyModel } from "../../types/dashboard";
import { Building2 } from "lucide-react";

interface TopCompaniesProps {
  companies: CompanyModel[];
}

export default function TopCompaniesCard({ companies }: TopCompaniesProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950/80 backdrop-blur-xl p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-800/70">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="text-amber-400" size={18} />
            Top Hiring Companies
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Organizations with the highest active volume
          </p>
        </div>
      </div>

      {companies.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-10">
          No company data available.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {companies.map((company, index) => (
            <div
              key={company.id ?? index}
              className="
                flex items-center justify-between gap-3
                p-3.5 rounded-2xl
                bg-slate-900/50 border border-slate-800/60
                hover:border-amber-700/40 hover:bg-slate-900/80
                transition-all duration-200
              "
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center font-bold text-[11px] text-amber-300/90 shrink-0">
                  {company.name
                    ? company.name.substring(0, 2).toUpperCase()
                    : "CP"}
                </div>
                <span className="text-sm font-semibold text-slate-200 truncate">
                  {company.name}
                </span>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-amber-950/50 text-amber-400 border border-amber-800/40 shrink-0 tabular-nums">
                {company.jobs_count} jobs
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
