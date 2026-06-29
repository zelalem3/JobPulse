
import React, { useEffect, useState } from "react";
import api from "../services/axios";
import {
  Briefcase,
  Bookmark,
  Bell,
  Building2,
  ArrowUpRight,
  MapPin,
} from "lucide-react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

interface DashboardStats {
  total_jobs: number;
  saved_jobs: number;
  alerts: number;
  companies: number;
}

interface TopSkill {
  name: string;
  count: number;
}

interface TopCompany {
  id: number;
  name: string;
  jobs_count: number;
}

interface GraphPoint {
  date: string;
  jobs: number;
}

interface JobListing {
  id: number;
  title: string;
  location: string;
  salary: string | null;
  url: string | null;
  company?: {
    name: string;
  };
}

interface Recommendation {
  job: JobListing;
  match_score: number;
  matched_skills: string[];
  location_match: boolean;
}

export default function Dashboard() {
  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [skills, setSkills] =
    useState<TopSkill[]>([]);

  const [companies, setCompanies] =
    useState<TopCompany[]>([]);

  const [graph, setGraph] =
    useState<GraphPoint[]>([]);

  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  const [savedJobs, setSavedJobs] =
    useState<JobListing[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    Promise.all([
      fetchStats(),
      fetchSkills(),
      fetchCompanies(),
      fetchGraph(),
      fetchRecommendations(),
      fetchSavedJobs(),
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get(
        "/api/dashboard/stats"
      );

      setStats(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await api.get(
        "/api/dashboard/skills"
      );

      setSkills(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await api.get(
        "/api/dashboard/topcompanies"
      );

      setCompanies(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGraph = async () => {
    try {
      const response = await api.get(
        "/api/dashboard/graph"
      );

      setGraph(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommendations = async () => {
    try {
      const response = await api.get(
        "/api/recommendations"
      );

      setRecommendations(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSavedJobs = async () => {
    try {
      const response = await api.get(
        "/api/dashboard/saved-jobs"
      );

      setSavedJobs(
        response.data.savedjobs || []
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">
        Dashboard
      </h1>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white rounded-xl p-6 shadow">
          <Briefcase
            className="mb-3 text-indigo-600"
          />
          <p className="text-slate-500">
            Total Jobs
          </p>
          <h2 className="text-3xl font-bold">
            {stats?.total_jobs ?? 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <Bookmark
            className="mb-3 text-indigo-600"
          />
          <p className="text-slate-500">
            Saved Jobs
          </p>
          <h2 className="text-3xl font-bold">
            {stats?.saved_jobs ?? 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <Bell
            className="mb-3 text-indigo-600"
          />
          <p className="text-slate-500">
            Alerts
          </p>
          <h2 className="text-3xl font-bold">
            {stats?.alerts ?? 0}
          </h2>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <Building2
            className="mb-3 text-indigo-600"
          />
          <p className="text-slate-500">
            Companies
          </p>
          <h2 className="text-3xl font-bold">
            {stats?.companies ?? 0}
          </h2>
        </div>
      </div>

      {/* Graph */}
      <div className="bg-white rounded-xl p-6 shadow mb-10">
        <h2 className="text-xl font-bold mb-5">
          Job Posting Trend
        </h2>

        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <LineChart data={graph}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line
              dataKey="jobs"
              stroke="#4f46e5"
              type="monotone"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Skills & Companies */}
      <div className="grid md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-bold mb-5">
            Trending Skills
          </h2>

          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill.name}
                className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg"
              >
                {skill.name} ({skill.count})
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow">
          <h2 className="text-xl font-bold mb-5">
            Top Hiring Companies
          </h2>

          <div className="space-y-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex justify-between"
              >
                <span>{company.name}</span>

                <span className="font-bold">
                  {company.jobs_count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">
          Recommended For You
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <div
              key={rec.job.id}
              className="bg-white rounded-xl p-6 shadow"
            >
              <h3 className="font-bold text-lg">
                {rec.job.title}
              </h3>

              <div className="flex items-center gap-2 mt-2 text-slate-500">
                <MapPin size={15} />
                {rec.job.location}
              </div>

              <div className="mt-4">
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  {rec.match_score}% Match
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {rec.matched_skills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>

              {rec.job.url && (
                <a
                  href={rec.job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-5 text-indigo-600"
                >
                  Apply
                  <ArrowUpRight size={15} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Saved Jobs */}
      <div>
        <h2 className="text-2xl font-bold mb-6">
          Recently Saved Jobs
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {savedJobs.slice(0, 6).map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl p-6 shadow"
            >
              <h3 className="font-bold">
                {job.title}
              </h3>

              <p className="text-slate-500 mt-2">
                {job.location}
              </p>

              {job.url && (
                <a
                  href={job.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 mt-5 text-indigo-600"
                >
                  View Job
                  <ArrowUpRight size={15} />
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
