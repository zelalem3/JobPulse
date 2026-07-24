import React, { useState, useEffect } from "react";
import { Sparkles, Loader2, MapPin, ArrowUpRight } from "lucide-react";
import api from "../../services/axios";

interface JobListing {
  id: number;
  title: string;
  location: string;
  company_id?: number;
  salary: string | null;
  employment_type?: string;
  deadline?: string | null;
  url: string | null;
  match_score?: number;
  matched_skills?: string[];
  location_match?: boolean;
}

export default function RecommendedJobs() {
  const [recommendedJobs, setRecommendedJobs] = useState<JobListing[]>([]);
  const [recLoading, setRecLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setRecLoading(true);
      const res = await api.get("api/recommendations");
      const responseData = res.data;
      const recData = responseData?.recommendations || responseData?.data || responseData || [];
      
      const normalizedRecs = Array.isArray(recData)
        ? recData.map((item: any) => {
            if (item && typeof item === 'object' && 'job' in item && item.job) {
              return {
                ...item.job,
                match_score: item.match_score,
                matched_skills: item.matched_skills,
                location_match: item.location_match,
              };
            }
            return item as JobListing;
          })
        : [];

      setRecommendedJobs(normalizedRecs);
    } catch (err) {
      console.error("Recommendation error:", err);
      setRecommendedJobs([]);
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
          <Sparkles size={18} />
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">Recommended Jobs</h2>
      </div>

      {recLoading ? (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 shadow-2xl font-medium flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-emerald-400" size={18} /> Loading smart recommendations...
        </div>
      ) : recommendedJobs.length === 0 ? (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 shadow-2xl font-medium">
          No recommendations found
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {recommendedJobs.map((job) => (
            <div key={job.id || Math.random()} className="group bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between gap-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="font-black text-lg text-white leading-tight group-hover:text-emerald-300 transition-colors">{job.title}</h3>
                  {job.match_score && (
                    <span className="bg-emerald-950/80 text-emerald-300 text-xs font-black px-3 py-1 rounded-xl border border-emerald-800/60 shrink-0 shadow-sm flex items-center gap-1">
                      ✨ {job.match_score}% Match
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-slate-400 flex items-center gap-1.5">
                  <MapPin size={14} className="text-emerald-500 shrink-0" /> {job.location || 'Addis Ababa'}
                </p>

                {job.location_match && (
                  <p className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-900/50 w-fit">
                    📍 Location match confirmed
                  </p>
                )}

                <div className="flex gap-1.5 flex-wrap pt-1">
                  {job.matched_skills?.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 px-2.5 py-0.5 rounded-lg font-medium shadow-inner"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/60 border border-emerald-800/60 hover:bg-emerald-900/80 px-4 py-2.5 rounded-2xl transition-all w-fit shadow-lg"
                >
                  Apply Now <ArrowUpRight size={14} />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}