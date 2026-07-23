import React, { useEffect, useState } from 'react';
import { Bookmark, MapPin, Calendar, ExternalLink, Trash2, Hourglass, XCircle, Search, Loader2 } from 'lucide-react';
import api from '../services/axios';

interface SavedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  source: string;
  url: string;
  saved_at: string;
  status: 'saved' | 'applied' | 'interviewing' | 'rejected';
}

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

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
          // Extract job listing ID if needed, or keep pivot row ID for deletion depending on your route design. 
          // If your backend delete route takes the pivot ID or job_listing_id, make sure this matches.
          job_listing_id: item.job_listing_id,
          title: item.job?.title || 'Untitled Role',
          company: item.job?.company || 'Company Confidential',
          location: item.job?.location || 'Remote / Unspecified',
          source: item.job?.source || 'JobPulse',
          url: item.job?.url || '#',
          saved_at: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recently',
          status: item.status || 'saved',
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

  const updateStatus = (id: string, newStatus: SavedJob['status']) => {
    setSavedJobs(prev => prev.map(job => job.id === id ? { ...job, status: newStatus } : job));
  };

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

  // Filter & Search Logic combined
  const filteredJobs = savedJobs.filter(job => {
    const matchesSearch = (job.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
                          (job.company?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Dynamic helper to render visual badges based on current application stage
  const getStatusBadge = (status: SavedJob['status'] = 'saved') => {
    const configurations = {
      saved: { text: 'Saved', style: 'bg-slate-100 border-slate-200 text-slate-700', icon: <Bookmark size={12} /> },
      applied: { text: 'Applied', style: 'bg-blue-50 border-blue-200 text-blue-700', icon: <Hourglass size={12} /> },
      interviewing: { text: 'Interviewing', style: 'bg-amber-50 border-amber-200 text-amber-700', icon: <Calendar size={12} /> },
      rejected: { text: 'Archived', style: 'bg-rose-50 border-rose-200 text-rose-700', icon: <XCircle size={12} /> },
    };
    const config = configurations[status] || configurations.saved;
    return (
      <span className={`px-2.5 py-1 border text-xs font-bold rounded-lg flex items-center gap-1.5 capitalize ${config.style}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm font-bold text-slate-800">Synchronizing saved positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* --- PAGE HEADER --- */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved Positions</h1>
          <p className="text-sm font-bold text-slate-600">Keep tabs on interesting openings and manage your pipeline progress.</p>
        </div>

        {/* --- ERROR BANNER --- */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        {/* --- CONTROLS BAR: SEARCH & STATUS FILTER --- */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl w-full sm:max-w-xs">
            <Search size={16} className="text-slate-500" />
            <input 
              type="text" 
              placeholder="Filter by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-semibold text-slate-900 w-full"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
            {['all', 'saved', 'applied', 'interviewing', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border capitalize transition shrink-0 ${
                  filterStatus === status
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* --- SAVED JOBS DATA CARDS LIST --- */}
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job: any) => (
              <div 
                key={job.id} 
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                
                {/* Information block */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200/60 rounded text-[10px] font-bold uppercase tracking-wide">
                      {job.source || 'JobPulse'}
                    </span>
                    <span className="text-xs text-slate-600 font-bold flex items-center gap-1">
                      <Calendar size={13} /> {job.saved_at || 'Recently Saved'}
                    </span>
                  </div>

                  <h2 className="text-lg font-black text-slate-900 leading-tight">
                    {job.title}
                  </h2>
                  <p className="text-sm font-bold text-slate-800 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>{job.company}</span>
                    <span className="text-slate-400 font-bold">|</span>
                    <span className="text-slate-700 font-semibold flex items-center gap-0.5"><MapPin size={14} /> {job.location}</span>
                  </p>
                </div>

                {/* Status pipelines & control layout updates */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full md:w-auto justify-between border-t md:border-0 pt-4 md:pt-0 border-slate-100">
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Update Pipeline</label>
                    <select
                      value={job.status || 'saved'}
                      onChange={(e) => updateStatus(job.id, e.target.value as SavedJob['status'])}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold text-slate-800 outline-none focus:border-blue-500 transition"
                    >
                      <option value="saved">Mark Saved</option>
                      <option value="applied">Mark Applied</option>
                      <option value="interviewing">Interviewing</option>
                      <option value="rejected">Archive Post</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 pt-4 sm:pt-0">
                    {getStatusBadge(job.status)}

                    <a 
                      href={job.url || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl text-slate-700 hover:text-blue-600 transition shadow-sm"
                      title="Apply on Origin Board"
                    >
                      <ExternalLink size={16} />
                    </a>

                    <button
                      onClick={() => removeJob(job.id, job.job_listing_id)}
                      className="p-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-slate-500 hover:text-rose-600 transition cursor-pointer"
                      title="Unsave Job"
                      type="button"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>

              </div>
            ))
          ) : (
           
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                <Bookmark size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-black text-slate-900">No bookmarks located</h3>
                <p className="text-slate-600 text-sm max-w-xs mx-auto font-semibold">Try broadening your search term or select an alternative status filter view window.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}