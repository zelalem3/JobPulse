import React, { useEffect, useState } from "react";
import {
  Briefcase,
  TrendingUp,
  Bookmark,
  MapPin,
  ArrowUpRight,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import api from "../services/axios";

/* -------------------- TYPES -------------------- */

interface JobListing {
  id: number;
  title: string;
  location: string;
  company_id: number;
  salary: string | null;
  employment_type: string;
  deadline: string | null;
  url: string | null;
}

interface Recommendation {
  job: JobListing;
  match_score: number;
  matched_skills: string[];
  location_match: boolean;
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
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
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

      // -------- saved jobs safe parsing --------
      const savedData =
        savedRes.data?.savedjobs ||
        savedRes.data?.data ||
        savedRes.data ||
        [];

      setSavedJobs(Array.isArray(savedData) ? savedData : []);

      // -------- stats --------
      setStats(statsRes.data);

      console.log("STATS RESPONSE:", statsRes.data);
      console.log("SAVED RESPONSE:", savedData);
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

      setRecommendations(Array.isArray(res.data) ? res.data : []);

      console.log("RECOMMENDATIONS RESPONSE:", res.data);
    } catch (err) {
      console.error("Recommendation error:", err);
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
          <div className="flex justify-between">
            <h3>Total Jobs</h3>
            <Briefcase />
          </div>
          <p className="text-2xl font-bold mt-2">
            {stats?.totalJobs ?? 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <div className="flex justify-between">
            <h3>Total Companies</h3>
            <Bookmark />
          </div>
          <p className="text-2xl font-bold mt-2">
            {stats?.totalCompanies ?? 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <div className="flex justify-between">
            <h3>New Today</h3>
            <TrendingUp />
          </div>
          <p className="text-2xl font-bold mt-2">
            {stats?.newToday ?? 0}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow">
          <div className="flex justify-between">
            <h3>Active Jobs</h3>
            <Briefcase />
          </div>
          <p className="text-2xl font-bold mt-2">
            {stats?.activeJobs ?? 0}
          </p>
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
              <div key={job.id} className="bg-white p-4 rounded-xl shadow">
                <h3 className="font-bold">{job.title}</h3>

                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <MapPin size={14} /> {job.location}
                </p>

                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    className="text-indigo-600 flex items-center gap-1 mt-3"
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
          <p>Loading recommendations...</p>
        ) : recommendations.length === 0 ? (
          <p className="text-slate-500">No recommendations found</p>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.job.id} className="bg-white p-4 rounded-xl shadow">

                <h3 className="font-bold">{rec.job.title}</h3>

                <p className="text-sm text-slate-500">
                  Match: {rec.match_score}%
                </p>

                {rec.location_match && (
                  <p className="text-xs text-blue-600">
                    📍 Location match
                  </p>
                )}

                <div className="flex gap-2 flex-wrap mt-2">
                  {rec.matched_skills?.map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-indigo-100 px-2 py-1 rounded"
                    >
                      {s}
                    </span>
                  ))}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}