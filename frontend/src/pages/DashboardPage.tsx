import React, { useEffect, useState } from 'react';
// FIX: Added ArrowUpRight to the lucide-react imports
import { Briefcase, Calendar, MapPin, Trash2, Bookmark, ArrowUpRight } from 'lucide-react';
import api from '../services/axios';

interface JobListing {
  id: number;
  title: string;
  location: string;
  company_id: number;
  salary: string | null;
  employment_type: string;
  deadline: string | null;
  url: string | null;
  company?: {
    name: string;
    logo?: string;
  };
}

export default function SavedJobsDashboard() {
  const [savedJobs, setSavedJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      // Ensure this matches your Laravel API route path
      const response = await api.get('api/dashboard/saved-jobs'); 
      setSavedJobs(response.data.savedjobs || []);
    } catch (err: any) {
      console.error("Error fetching saved jobs:", err);
      setError(err.response?.data?.message || "Failed to load saved jobs.");
    } finally {
      setLoading(false);
    }
  };

  const removeSavedJob = async (jobId: number) => {
    try {
      // Endpoint match to match standard Laravel route structures
      await api.delete(`api/jobs/${jobId}/unsave`);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      console.error("Error unsaving job:", err);
      alert("Could not remove the job layout at this moment.");
    }
  };

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Saved Jobs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your bookmarked positions and application pipelines ({savedJobs.length}).
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* --- SAVED JOBS GRID --- */}
      {savedJobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-sm mt-8">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Bookmark size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No saved jobs found</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">
            Explore the main dashboard aggregation feeds to bookmark positions you are interested in applying to.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedJobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                {/* Job Title & Badges */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h2 className="font-bold text-slate-900 text-lg line-clamp-2 hover:text-indigo-600 transition-colors">
                    {job.title}
                  </h2>
                  <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                    {job.employment_type ? job.employment_type.replace('_', ' ') : 'Full Time'}
                  </span>
                </div>

                {/* Company Name */}
                <p className="text-sm font-semibold text-slate-600 mb-4">
                  {job.company?.name || `Tracked Company #${job.company_id}`}
                </p>

                {/* Info List Metadata */}
                <div className="space-y-2 text-sm text-slate-500 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                  {job.salary && (
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} className="text-slate-400" />
                      <span className="font-medium text-emerald-600">{job.salary}</span>
                    </div>
                  )}
                  {job.deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-slate-400" />
                      <span>Closes: {new Date(job.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 text-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm py-2 px-4 rounded-lg shadow-sm transition-colors"
                  >
                    <span>Apply</span>
                    <ArrowUpRight size={14} />
                  </a>
                )}
                
                <button
                  onClick={() => removeSavedJob(job.id)}
                  className="p-2 border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg transition-colors group"
                  title="Remove Bookmark"
                >
                  <Trash2 size={18} />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}