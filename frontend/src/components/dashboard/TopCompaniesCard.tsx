import React from "react";
import { CompanyModel } from "../../types/dashboard";
import { Building2 } from "lucide-react";

interface TopCompaniesProps {
  companies: CompanyModel[];
}

export default function TopCompaniesCard({ companies }: TopCompaniesProps) {
  return (
    <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="text-amber-400" size={20} />
            Top Hiring Companies
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Organizations with the highest active volume</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
        {companies.map((company, index) => (
          <div
            key={company.id ?? index}
            className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800/60 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
                {company.name ? company.name.substring(0, 2).toUpperCase() : "CP"}
              </div>
              <span className="text-sm font-semibold text-slate-200">{company.name}</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-950/60 text-amber-400 border border-amber-800/40">
              {company.jobs_count} jobs
            </span>
          </div>
        ))}

        {companies.length === 0 && (
          <p className="text-xs text-slate-500 text-center py-10">No company data available.</p>
        )}
      </div>
    </div>
  );
}