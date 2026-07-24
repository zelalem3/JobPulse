import React, { useEffect, useState } from "react";
import {
  Briefcase,
  TrendingUp,
  Bookmark,
  MapPin,
  ArrowUpRight,
  Loader2,
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
          <Loader2 className="animate-spin text-slate-400" size={32} />
          <p className="text-sm font-semibold text-slate-400">Loading dashboard telemetry...</p>
        </div>
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-slate-800 selection:text-white space-y-8">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-white">Dashboard</h1>
        <p className="text-sm font-semibold text-slate-400">Your job activity overview</p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Total Jobs</h3>
              <div className="p-2 bg-slate-800 rounded-2xl border border-slate-700/60 text-slate-300">
                <Briefcase size={16} />
              </div>
            </div>
            <p className="text-3xl font-black text-white">{stats?.totalJobs ?? 0}</p>
          </div>

          

          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">New Today</h3>
              <div className="p-2 bg-slate-800 rounded-2xl border border-slate-700/60 text-slate-300">
                <TrendingUp size={16} />
              </div>
            </div>
            <p className="text-3xl font-black text-white">{stats?.newToday ?? 0}</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Active Jobs</h3>
              <div className="p-2 bg-slate-800 rounded-2xl border border-slate-700/60 text-slate-300">
                <Briefcase size={16} />
              </div>
            </div>
            <p className="text-3xl font-black text-white">{stats?.activeJobs ?? 0}</p>
          </div>
        </div>

        {/* SAVED JOBS */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Saved Jobs</h2>

          <div className="grid md:grid-cols-3 gap-4">
            {savedJobs.length === 0 ? (
              <div className="col-span-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 shadow-xl font-medium">
                No saved jobs found
              </div>
            ) : (
              savedJobs.map((job) => (
                <div key={job.id} className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-800/80 hover:border-slate-700/85 transition-all flex flex-col justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="font-black text-lg text-white leading-tight">{job.title}</h3>
                    <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-500 shrink-0" /> {job.location || 'Remote / Unspecified'}
                    </p>
                  </div>

                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 border border-slate-700/60 px-4 py-2.5 rounded-2xl transition-all w-fit shadow-lg"
                    >
                      Apply <ArrowUpRight size={14} />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECOMMENDATIONS */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">Recommended Jobs</h2>

          {recLoading ? (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 shadow-xl font-medium flex items-center justify-center gap-2">
              <Loader2 className="animate-spin text-slate-400" size={18} /> Loading recommendations...
            </div>
          ) : recommendations.length === 0 ? (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 shadow-xl font-medium">
              No recommendations found
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {recommendations.map((job) => (
                <div key={job.id || Math.random()} className="bg-slate-900/60 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-slate-800/80 hover:border-slate-700/85 transition-all flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-black text-lg text-white leading-tight">{job.title}</h3>
                      {job.match_score && (
                        <span className="bg-slate-800 text-slate-200 text-xs font-bold px-3 py-1 rounded-xl border border-slate-700/60 shrink-0 shadow-sm">
                          {job.match_score}% Match
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-500 shrink-0" /> {job.location || 'Remote / Unspecified'}
                    </p>

                    {job.location_match && (
                      <p className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                        📍 Location match
                      </p>
                    )}

                    <div className="flex gap-1.5 flex-wrap pt-1">
                      {job.matched_skills?.map((s) => (
                        <span
                          key={s}
                          className="text-xs bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-xl font-medium shadow-inner"
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
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 border border-slate-700/60 px-4 py-2.5 rounded-2xl transition-all w-fit shadow-lg"
                    >
                      Apply <ArrowUpRight size={14} />
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