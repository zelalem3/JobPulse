import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import api from "../services/axios";
import { JobListing, SavedJobPivot, Stats } from "../types/dashboard";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStatsGrid from "../components/dashboard/DashboardStatsGrid";
import SavedJobs from "../components/dashboard/SavedJobs";
import RecommendedJobs from "../components/dashboard/RecommendedJobsSection";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [, statsRes] = await Promise.all([
        api.get("api/savedjobs"),
        api.get("api/dashboard/stats"),
      ]);

      setStats(statsRes.data);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-900 selection:text-white space-y-10 w-full">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto w-full">
        <DashboardHeader />
      </div>

      <div className="max-w-6xl mx-auto space-y-10 w-full">
        {/* STATS GRID */}
        <DashboardStatsGrid stats={stats} />

        {/* SAVED JOBS SECTION */}
        <SavedJobs />

        {/* RECOMMENDED JOBS SECTION */}
        <RecommendedJobs />
      </div>

    </div>
  );
}