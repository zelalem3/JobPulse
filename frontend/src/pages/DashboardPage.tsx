import React, { useEffect, useState } from 'react';
import { 
  BarChart3, Layers, Play, Pause, CheckCircle2, 
  AlertCircle, Clock, Server, Terminal, ArrowUpRight, 
  Building2, Briefcase, Award 
} from 'lucide-react';
import api from '../services/axios';

// Interfaces for API structures
interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalCompanies: number;
  scrapesToday: number;
}

interface TopCompany {
  id: number;
  name: string;
  logo?: string;
  jobs_count: number;
}

interface SkillCount {
  name: string;
  count: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [companies, setCompanies] = useState<TopCompany[]>([]);
  const [skills, setSkills] = useState<SkillCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all endpoints concurrently
        const [statsRes, companiesRes, skillsRes] = await Promise.all([
          api.get("api/dashboard/stats"),
          api.get("api/dashboard/topcompanies"),
          api.get("api/dashboard/skills")
        ]);

        setStats(statsRes.data);
        // Assuming your backend responds with { companies: [...] } based on previous code
        setCompanies(companiesRes.data.companies || []);
        setSkills(skillsRes.data.skills || []);
      } catch (error) {
        console.error("Error loading dashboard metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 text-slate-800">
      
      {/* Header section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Scraper Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time job aggregation insights and metrics.</p>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase">Total Jobs</p>
            <p className="text-3xl font-bold mt-1 text-slate-900">{stats?.totalJobs ?? 0}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Briefcase size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase">Active Listings</p>
            <p className="text-3xl font-bold mt-1 text-green-600">{stats?.activeJobs ?? 0}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase">Tracked Companies</p>
            <p className="text-3xl font-bold mt-1 text-slate-900">{stats?.totalCompanies ?? 0}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Building2 size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase">Scrapes Today</p>
            <p className="text-3xl font-bold mt-1 text-slate-900">{stats?.scrapesToday ?? 0}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Server size={24} />
          </div>
        </div>

      </div>

      {/* --- CONTENT BLOCKS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Companies List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-indigo-600" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Top Companies by Openings</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">Ranked</span>
          </div>

          <div className="divide-y divide-slate-100">
            {companies.length === 0 ? (
              <p className="text-slate-400 text-sm py-4">No company data available</p>
            ) : (
              companies.map((company, index) => (
                <div key={company.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400 w-5">#{index + 1}</span>
                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-600 overflow-hidden border border-slate-200">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="object-cover w-full h-full" />
                      ) : (
                        company.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="font-semibold text-slate-800 text-sm md:text-base">{company.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md text-sm font-medium">
                    <span>{company.jobs_count}</span>
                    <span className="text-xs text-indigo-400 font-normal">jobs</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* In-Demand Skills List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award className="text-amber-500" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Trending Skills Keyword Counts</h2>
            </div>
          </div>

          <div className="space-y-4">
            {skills.length === 0 ? (
              <p className="text-slate-400 text-sm">No skill statistics available</p>
            ) : (
              skills.map((skill, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-700">{skill.name}</span>
                    <span className="text-slate-500 font-semibold">{skill.count} listings</span>
                  </div>
                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.min(100, (skill.count / (skills[0]?.count || 1)) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}