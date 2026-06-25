import React, { useState } from 'react';
import { Search, MapPin, Briefcase, RefreshCw, ExternalLink, Calendar, Filter, Database } from 'lucide-react';

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  source: string;
  url: string;
  scraped_at: string;
  tags: string[];
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSource, setSelectedSource] = useState('All');

  // Mock data representing what Laravel fetches from PostgreSQL
  const [jobs] = useState<Job[]>([
    {
      id: 1,
      title: 'Full Stack Engineer (Laravel & React)',
      company: 'Apex Digital',
      location: 'Remote (US/Europe)',
      source: 'RemoteOK',
      url: '#',
      scraped_at: '12 mins ago',
      tags: ['Laravel', 'React', 'TypeScript']
    },
    {
      id: 2,
      title: 'Python Scraper Developer',
      company: 'DataMetrics Global',
      location: 'Hybrid / Addis Ababa',
      source: 'LinkedIn',
      url: '#',
      scraped_at: '45 mins ago',
      tags: ['Python', 'Playwright', 'PostgreSQL']
    },
    {
      id: 3,
      title: 'Senior Backend Architect',
      company: 'SaaSify Inc',
      location: 'Remote',
      source: 'Indeed',
      url: '#',
      scraped_at: '2 hours ago',
      tags: ['Laravel', 'Redis', 'Docker']
    }
  ]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* --- HERO / SEARCH BANNER --- */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-6xl mx-auto space-y-6 text-center">
          <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full uppercase tracking-wider border border-indigo-500/30">
            Automated Job Aggregator
          </span>
          <h1 className="text-4xl font-extrabold sm:text-5xl tracking-tight">
            Monitor Your Pulse on the Job Market
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-300">
            Live metrics streaming from your Python container scrapers straight into your Postgres database pipeline.
          </p>

          {/* Search Bar Wrapper */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-2 shadow-xl flex flex-col md:flex-row gap-2 items-center text-slate-800">
            <div className="flex items-center gap-2 px-3 w-full border-b md:border-b-0 md:border-r border-slate-100 py-2">
              <Search className="text-slate-400 shrink-0" size={20} />
              <input 
                type="text" 
                placeholder="Search jobs, tech stack, keywords..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent outline-none text-sm py-1"
              />
            </div>
            <div className="flex items-center gap-2 px-3 w-full py-2 md:w-64 shrink-0">
              <MapPin className="text-slate-400 shrink-0" size={20} />
              <span className="text-sm text-slate-500">Remote / Global</span>
            </div>
            <button className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition shrink-0 shadow-sm">
              Find Jobs
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* --- LIVE INFRASTRUCTURE METRICS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Database size={20} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Jobs Scraped</p>
              <h3 className="text-xl font-bold text-slate-800">1,248</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><RefreshCw size={20} className="animate-spin-slow" /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Scraper Engine</p>
              <h3 className="text-xl font-bold text-slate-800">Active (1h interval)</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Briefcase size={20} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Watchers</p>
              <h3 className="text-xl font-bold text-slate-800">4 Filters</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><Filter size={20} /></div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sources Connected</p>
              <h3 className="text-xl font-bold text-slate-800">3 Job Boards</h3>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT PANELS --- */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Side Control Block */}
          <div className="w-full lg:w-64 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-6 shrink-0">
            <div>
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 mb-3">
                Filter by Source
              </h4>
              <div className="space-y-2">
                {['All', 'RemoteOK', 'LinkedIn', 'Indeed'].map((source) => (
                  <button
                    key={source}
                    onClick={() => setSelectedSource(source)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-lg font-medium transition ${
                      selectedSource === source 
                        ? 'bg-blue-50 text-blue-600 font-semibold' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {source}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Job Listings Data Grid */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-lg font-bold text-slate-800">Latest Discovered Positions</h3>
              <span className="text-xs text-slate-400 font-medium">Auto-refreshing via Redis queues</span>
            </div>

            <div className="space-y-4">
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded uppercase tracking-wide border border-slate-200/60">
                        {job.source}
                      </span>
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <Calendar size={13} /> {job.scraped_at}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">
                      {job.title}
                    </h2>
                    <p className="text-sm font-medium text-slate-500">
                      {job.company} — <span className="text-slate-400 font-normal">{job.location}</span>
                    </p>
                    
                    {/* Tags container */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.tags.map((tag, idx) => (
                        <span key={idx} className="px-2.5 py-0.5 bg-blue-50/50 text-blue-600/90 font-medium text-xs rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <a 
                    href={job.url}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200 hover:border-blue-600 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200"
                  >
                    Apply <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}