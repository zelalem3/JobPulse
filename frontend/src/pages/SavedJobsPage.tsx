import React, { useState } from 'react';
import { Bookmark, MapPin, Calendar, ExternalLink, Trash2, CheckCircle2, Hourglass, XCircle, Search } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');


  const fetchSaved = async () =>
  {
    const response = await api.get("api/savedjobs");
    console.log(response.data);

    



  }
  fetchSaved();
  


  // Mock data representing saved relations pulled from your Laravel backend
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([
    {
      id: '1',
      title: 'Full Stack Engineer (Laravel & React)',
      company: 'Apex Digital',
      location: 'Remote (US/Europe)',
      source: 'RemoteOK',
      url: '#',
      saved_at: 'Saved 2 days ago',
      status: 'interviewing',
    },
    {
      id: '2',
      title: 'Python Scraper Specialist',
      company: 'DataMetrics Global',
      location: 'Addis Ababa, Ethiopia',
      source: 'LinkedIn',
      url: '#',
      saved_at: 'Saved 5 days ago',
      status: 'applied',
    },
    {
      id: '3',
      title: 'Senior Backend Developer',
      company: 'SaaSify Inc',
      location: 'Remote',
      source: 'Indeed',
      url: '#',
      saved_at: 'Saved 1 week ago',
      status: 'saved',
    },
  ]);

  const updateStatus = (id: string, newStatus: SavedJob['status']) => {
    setSavedJobs(prev => prev.map(job => job.id === id ? { ...job, status: newStatus } : job));
  };

  const removeJob = (id: string) => {
    setSavedJobs(prev => prev.filter(job => job.id !== id));
  };

  // Filter & Search Logic combined
  const filteredJobs = savedJobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Dynamic helper to render visual badges based on current application stage
  const getStatusBadge = (status: SavedJob['status']) => {
    const configurations = {
      saved: { text: 'Saved', style: 'bg-slate-100 border-slate-200 text-slate-600', icon: <Bookmark size={12} /> },
      applied: { text: 'Applied', style: 'bg-blue-50 border-blue-200 text-blue-600', icon: <Hourglass size={12} /> },
      interviewing: { text: 'Interviewing', style: 'bg-amber-50 border-amber-200 text-amber-600', icon: <Calendar size={12} /> },
      rejected: { text: 'Archived', style: 'bg-rose-50 border-rose-200 text-rose-500', icon: <XCircle size={12} /> },
    };
    const config = configurations[status];
    return (
      <span className={`px-2.5 py-1 border text-xs font-bold rounded-lg flex items-center gap-1.5 capitalize ${config.style}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* --- PAGE HEADER --- */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Saved Positions</h1>
          <p className="text-sm text-slate-400">Keep tabs on interesting openings and manage your pipeline progress.</p>
        </div>

        {/* --- CONTROLS BAR: SEARCH & STATUS FILTER --- */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/60 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl w-full sm:max-w-xs">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-slate-700 w-full"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
            {['all', 'saved', 'applied', 'interviewing'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border capitalize transition shrink-0 ${
                  filterStatus === status
                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
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
            filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                
                {/* Information block */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 border border-slate-200/60 rounded text-[10px] font-bold uppercase tracking-wide">
                      {job.source}
                    </span>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Calendar size={13} /> {job.saved_at}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {job.title}
                  </h2>
                  <p className="text-sm font-semibold text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span>{job.company}</span>
                    <span className="text-slate-300 font-normal">|</span>
                    <span className="text-slate-400 font-normal flex items-center gap-0.5"><MapPin size={14} /> {job.location}</span>
                  </p>
                </div>

                {/* Status pipelines & control layout updates */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full md:w-auto justify-between border-t md:border-0 pt-4 md:pt-0 border-slate-100">
                  
                  {/* Internal selector to drive pipeline updates to database */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Pipeline</label>
                    <select
                      value={job.status}
                      onChange={(e) => updateStatus(job.id, e.target.value as SavedJob['status'])}
                      className="text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-semibold text-slate-600 outline-none focus:border-blue-500 transition"
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
                      href={job.url}
                      className="p-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl text-slate-500 hover:text-blue-600 transition shadow-sm"
                      title="Apply on Origin Board"
                    >
                      <ExternalLink size={16} />
                    </a>

                    <button
                      onClick={() => removeJob(job.id)}
                      className="p-2 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl text-slate-400 hover:text-rose-600 transition"
                      title="Unsave Job"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                </div>

              </div>
            ))
          ) : (
            /* --- EMPTY DATA STATE --- */
            <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                <Bookmark size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-slate-700">No bookmarks located</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto">Try broadening your search term or select an alternative status filter view window.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}