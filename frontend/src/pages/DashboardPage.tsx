import React, { useEffect, useState } from "react";
import {
  Briefcase,
  TrendingUp,
  Bookmark,
  MapPin,
  ArrowUpRight,
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
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  /* -------------------- UI -------------------- */

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-500">Your job activity overview</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-500">Total Jobs</h3>
            <Briefcase className="text-indigo-600" size={20} />
          </div>
          <p className="text-2xl font-bold mt-2">{stats?.totalJobs ?? 0}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-500">Total Companies</h3>
            <Bookmark className="text-indigo-600" size={20} />
          </div>
          <p className="text-2xl font-bold mt-2">{stats?.totalCompanies ?? 0}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-500">New Today</h3>
            <TrendingUp className="text-indigo-600" size={20} />
          </div>
          <p className="text-2xl font-bold mt-2">{stats?.newToday ?? 0}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold text-slate-500">Active Jobs</h3>
            <Briefcase className="text-indigo-600" size={20} />
          </div>
          <p className="text-2xl font-bold mt-2">{stats?.activeJobs ?? 0}</p>
        </div>
      </div>

      {/* SAVED JOBS */}
      <div>
        <h2 className="text-xl font-bold mb-4">Saved Jobs</h2>

        <div className="grid md:grid-cols-3 gap-4">
          {savedJobs.length === 0 ? (
            <p className="text-slate-500">No saved jobs found</p>
          ) : (
            savedJobs.map((job) => (
              <div key={job.id} className="bg-white p-4 rounded-xl shadow flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{job.title}</h3>
                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {job.location || 'Remote / Unspecified'}
                  </p>
                </div>

                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 font-semibold text-sm flex items-center gap-1 mt-4 hover:underline"
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
      <div>
        <h2 className="text-xl font-bold mb-4">Recommended Jobs</h2>

        {recLoading ? (
          <p className="text-slate-500">Loading recommendations...</p>
        ) : recommendations.length === 0 ? (
          <p className="text-slate-500">No recommendations found</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {recommendations.map((job) => (
              <div key={job.id || Math.random()} className="bg-white p-4 rounded-xl shadow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-slate-900">{job.title}</h3>
                    {job.match_score && (
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        {job.match_score}% Match
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                    <MapPin size={14} /> {job.location || 'Remote / Unspecified'}
                  </p>

                  {job.location_match && (
                    <p className="text-xs text-blue-600 font-semibold mt-1">
                      📍 Location match
                    </p>
                  )}

                  <div className="flex gap-1.5 flex-wrap mt-3">
                    {job.matched_skills?.map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-md font-medium"
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
                    className="text-indigo-600 font-semibold text-sm flex items-center gap-1 mt-4 hover:underline"
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
  );
}