import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import api from "../services/axios";
import { Stats, GraphData, CompanyModel } from "../types/dashboard";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStatsGrid from "../components/dashboard/DashboardStatsGrid";
import WeeklyTrendChart from "../components/dashboard/WeeklyTrendChart";
import SourceDistributionCard from "../components/dashboard/SourceDistributionCard";
import TopCompaniesCard from "../components/dashboard/TopCompaniesCard";
import SavedJobs from "../components/dashboard/SavedJobs";
import RecommendedJobs from "../components/dashboard/RecommendedJobsSection";
import TelegramBanner from "../components/dashboard/TelegramBanner";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [topCompanies, setTopCompanies] = useState<CompanyModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [userRes, statsRes, graphRes, companiesRes] = await Promise.all([
        api.get("api/profile"),
        api.get("api/dashboard/stats"),
        api.get("api/dashboard/graph"),
        api.get("api/dashboard/topcompanies"),
      ]);

      setUser(userRes.data);
      setStats(statsRes.data);
      setGraphData(graphRes.data);
      setTopCompanies(companiesRes.data.companies || []);
    } catch (err) {
      console.error("Dashboard error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3 flex flex-col items-center">
          <Loader2 className="animate-spin text-emerald-400" size={32} />
          <p className="text-sm font-medium text-slate-400">
            Loading your workspace…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-1/4 w-[420px] h-[420px] bg-emerald-600/8 rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 left-0 w-[360px] h-[360px] bg-indigo-600/8 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        <DashboardHeader />

        <TelegramBanner user={user} />

        <DashboardStatsGrid stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          <div className="lg:col-span-2 min-h-[280px]">
            {graphData && <WeeklyTrendChart data={graphData.weeklyTrend} />}
          </div>
          <div className="min-h-[280px]">
            {graphData && (
              <SourceDistributionCard sources={graphData.sources} />
            )}
          </div>
        </div>

        <TopCompaniesCard companies={topCompanies} />

        <SavedJobs />

        <RecommendedJobs />
      </div>
    </div>
  );
}
