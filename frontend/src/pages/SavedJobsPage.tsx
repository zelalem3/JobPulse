import React, { useEffect, useState } from 'react';
import { Bookmark, MapPin, Calendar, ExternalLink, Trash2, Search, Loader2 } from 'lucide-react';
import api from '../services/axios';

interface SavedJob {
  id: string;
  job_listing_id?: string;
  title: string;
  company: string;
  location: string;
  source: string;
  url: string;
  saved_at: string;
}

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch saved jobs from the Laravel backend
  useEffect(() => {
    const fetchSaved = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("api/savedjobs");
        
        // Map backend response structure and flatten nested job attributes
        const rawData = response.data.savedjobs || response.data || [];
        const jobsData = rawData.map((item: any) => ({
          id: item.id,
          job_listing_id: item.job_listing_id,
          title: item.job?.title || 'Untitled Role',
          company: item.job?.company || 'Company Confidential',
          location: item.job?.location || 'Remote / Unspecified',
          source: item.job?.source || 'JobPulse',
          url: item.job?.url || '#',
          saved_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
        }));

        setSavedJobs(jobsData);
      } catch (e) {
        console.error("Error fetching saved jobs:", e);
        setError("Could not load your saved positions registry.");
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  const removeJob = async (id: string) => {
    const previousJobs = [...savedJobs];
  
    setSavedJobs(prev => prev.filter(job => job.id !== id));

    try {
      await api.delete(`api/savejob/${id}`);
    } catch (e) {
      console.error("Error removing saved job:", e);
      setSavedJobs(previousJobs);
      setError("Failed to remove the saved job. Please try again.");
    }
  };

  // Filter & Search Logic
  const filteredJobs = savedJobs.filter(job => {
    const matchesSearch = (job.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (job.company?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Loader2 className="animate-spin text-slate-400" size={32} />
          <p className="text-sm font-semibold text-slate-400">Synchronizing saved positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-slate-800 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* --- PAGE HEADER --- */}
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Saved Positions</h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">Keep tabs on interesting openings and manage your bookmarked roles.</p>
        </div>

        {/* --- ERROR BANNER --- */}
        {error && (
          <div className="bg-rose-950/60 border border-rose-900/80 text-rose-300 p-4 rounded-2xl text-sm font-bold shadow-xl">
            {error}
          </div>
        )}

        {/* --- CONTROLS BAR: SEARCH --- */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-4 border border-slate-800/80 shadow-xl flex items-center">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl w-full shadow-inner">
            <Search size={16} className="text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Filter by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500 w-full"
            />
          </div>
        </div>

        {/* --- SAVED JOBS DATA CARDS LIST --- */}
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job: any) => (
              <div 
                key={job.id} 
                className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl hover:border-slate-700/80 transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                
                {/* Information block */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 bg-slate-800 text-slate-300 border border-slate-700/60 rounded-xl text-xs font-bold tracking-wide">
                      {job.source || 'JobPulse'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Calendar size={13} className="text-slate-500" /> {job.saved_at || 'Recently Saved'}
                    </span>
                  </div>

                  <h2 className="text-lg font-black text-white leading-tight">
                    {job.title}
                  </h2>
                  <p className="text-sm font-semibold text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>{job.company}</span>
                    <span className="text-slate-600 font-bold">•</span>
                    <span className="text-slate-400 flex items-center gap-1"><MapPin size={14} className="text-slate-500" /> {job.location}</span>
                  </p>
                </div>

                {/* Control layout actions */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-0 pt-4 md:pt-0 border-slate-800">
                  <a 
                    href={job.url || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all shadow-lg"
                    title="Apply on Origin Board"
                  >
                    <ExternalLink size={16} />
                  </a>

                  <button
                    onClick={() => removeJob(job.id)}
                    className="p-2.5 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-900/60 rounded-2xl text-slate-400 hover:text-rose-400 transition-all cursor-pointer shadow-lg"
                    title="Unsave Job"
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))
          ) : (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-dashed border-slate-800 rounded-3xl py-16 text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 bg-slate-950 text-slate-500 rounded-2xl flex items-center justify-center mx-auto border border-slate-800 shadow-inner">
                <Bookmark size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white">No bookmarks located</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">Try broadening your search term or bookmark roles from the explore page.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}