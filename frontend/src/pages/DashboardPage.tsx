import React, { useEffect, useState } from "react";
import {
  Briefcase,
  TrendingUp,
  Bookmark,
  MapPin,
  ArrowUpRight,
  Loader2,
  Sparkles,
  Zap,
  Building2,
} from "lucide-react";

import api from "../services/axios";

/* -------------------- TYPES -------------------- */

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

interface SavedJobPivot {
  id: number;
  user_id: number;
  job_listing_id: number;
  created_at: string;
  updated_at: string;
  job?: JobListing;
}

interface Stats {
  totalJobs: number;
  totalCompanies: number;
  newToday: number;
  activeJobs: number;
}

/* -------------------- COMPONENT -------------------- */

export default function DashboardPage() {
  const [savedJobs, setSavedJobs] = useState<JobListing[]>([]);
  const [recommendations, setRecommendations] = useState<JobListing[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);

  const [loading, setLoading] = useState(true);
  const [recLoading, setRecLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  /* -------------------- FETCH ALL -------------------- */

  const fetchAll = async () => {
    try {
      setLoading(true);

      const [savedRes, statsRes] = await Promise.all([
        api.get("api/savedjobs"),
        api.get("api/dashboard/stats"),
      ]);

      // -------- saved jobs safe parsing & flat mapping --------
      const savedData =
        savedRes.data?.savedjobs ||
        savedRes.data?.data ||
        savedRes.data ||
        [];

      const formattedSavedJobs = Array.isArray(savedData)
        ? savedData.map((item: SavedJobPivot | JobListing) => {
            if ('job' in item && item.job) {
              return {
                id: item.job.id,
                title: item.job.title,
                location: item.job.location,
                company_id: item.job.company_id,
                salary: item.job.salary,
                employment_type: item.job.employment_type,
                deadline: item.job.deadline,
                url: item.job.url,
              };
            }
            return item as JobListing;
          })
        : [];

      setSavedJobs(formattedSavedJobs);

      // -------- stats --------
      setStats(statsRes.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }

    fetchRecommendations();
  };

  /* -------------------- RECOMMENDATIONS -------------------- */

  const fetchRecommendations = async () => {
    try {
      setRecLoading(true);

      const res = await api.get("api/recommendations");

      // Handle wrapped objects or direct array responses securely
      const responseData = res.data;
      const recData = responseData?.recommendations || responseData?.data || responseData || [];
      
      // Normalize items whether they are direct job records or wrapped with a .job property
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

      setRecommendations(normalizedRecs);
      console.log("NORMALIZED RECOMMENDATIONS:", normalizedRecs);
    } catch (err) {
      console.error("Recommendation error:", err);
      setRecommendations([]);
    } finally {
      setRecLoading(false);
    }
  };

  /* -------------------- LOADING -------------------- */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Loader2 className="animate-spin text-emerald-400" size={32} />
          <p className="text-sm font-semibold text-slate-400">Synchronizing vibrant workspace...</p>
        </div>
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-900 selection:text-white space-y-10">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Dashboard <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </h1>
          <p className="text-sm font-semibold text-slate-400">Your career insights and tailored career metrics</p>
        </div>
        <div className="px-4 py-2 bg-gradient-to-r from-emerald-950/80 to-blue-950/80 border border-emerald-800/60 rounded-2xl flex items-center gap-2 shadow-xl">
          <Sparkles size={16} className="text-emerald-400" />
          <span className="text-xs font-bold text-emerald-300">System Fully Active</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-10">
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-emerald-950/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80 hover:border-emerald-700/60 transition-all group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
            <div className="flex justify-between items-center relative z-10">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Jobs</h3>
              <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 rounded-2xl shadow-inner">
                <Briefcase size={18} />
              </div>
            </div>
            <p className="text-4xl font-black text-white mt-4 relative z-10">{stats?.totalJobs ?? 0}</p>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-blue-950/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80 hover:border-blue-700/60 transition-all group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
            <div className="flex justify-between items-center relative z-10">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">New Today</h3>
              <div className="p-3 bg-blue-950/80 border border-blue-800/60 text-blue-400 rounded-2xl shadow-inner">
                <TrendingUp size={18} />
              </div>
            </div>
            <p className="text-4xl font-black text-white mt-4 relative z-10">{stats?.newToday ?? 0}</p>
          </div>

          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-amber-950/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80 hover:border-amber-700/60 transition-all group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
            <div className="flex justify-between items-center relative z-10">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Active Jobs</h3>
              <div className="p-3 bg-amber-950/80 border border-amber-800/60 text-amber-400 rounded-2xl shadow-inner">
                <Zap size={18} />
              </div>
            </div>
            <p className="text-4xl font-black text-white mt-4 relative z-10">{stats?.activeJobs ?? 0}</p>
          </div>
        </div>

        {/* SAVED JOBS */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl">
              <Bookmark size={18} />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">Saved Jobs</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {savedJobs.length === 0 ? (
              <div className="col-span-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 shadow-2xl font-medium">
                No saved jobs found
              </div>
            ) : (
              savedJobs.map((job) => (
                <div key={job.id} className="group bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="space-y-2">
                    <h3 className="font-black text-lg text-white leading-tight group-hover:text-amber-300 transition-colors">{job.title}</h3>
                    <p className="text-sm font-semibold text-slate-400 flex items-center gap-1.5">
                      <MapPin size={14} className="text-amber-500 shrink-0" /> {job.location || 'Addis Ababa'}
                    </p>
                  </div>

                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white bg-amber-950/60 border border-amber-800/60 hover:bg-amber-900/80 px-4 py-2.5 rounded-2xl transition-all w-fit shadow-lg"
                    >
                      Apply Now <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECOMMENDATIONS */}
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
          ) : recommendations.length === 0 ? (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 shadow-2xl font-medium">
              No recommendations found
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5">
              {recommendations.map((job) => (
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
      </div>

    </div>
  );
}