import React, { useEffect, useState } from 'react';
import { Search, MapPin, Filter, Briefcase, ExternalLink, Bookmark, BookmarkCheck, Calendar, SlidersHorizontal, ChevronDown } from 'lucide-react';
import api from '../services/axios';



interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  source: 'RemoteOK' | 'LinkedIn' | 'Indeed';
  salary: string;

  scrapedAt: string;
  isSaved: boolean;
}

export default function JobsPage() {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

 

  // Mock data representing indexed listings pulled from PostgreSQL tables via Laravel
  const [listings, setListings] = useState<JobListing[]>([]);

  // Seed sample listings to populate grid view right out of the box
  React.useEffect(() => {

    const fetchJobs = async () =>
    {
    try{
      const response =  await api.get("/api/jobs")
      console.log(response.data.data[0]);
      setListings(response.data.data);


    }
    catch(e)
    {
      console.log(e);
    }

  }
  fetchJobs();


    setListings([
      { id: '1', title: 'Full Stack Engineer (Laravel + React)', company: 'Apex Digital Solutions', location: 'Remote (US/Europe)', type: 'Remote', source: 'RemoteOK', salary: '$90k - $120k', scrapedAt: '14 mins ago', isSaved: false },
      { id: '2', title: 'Python & Web Scraping Developer', company: 'DataMetrics Global', location: 'Addis Ababa, Ethiopia', type: 'Full-time', source: 'LinkedIn', salary: 'Competitive', scrapedAt: '45 mins ago', isSaved: true },
      { id: '3', title: 'Senior Backend Architect (Laravel Core)', company: 'SaaSify Platforms', location: 'Remote (Global)', type: 'Contract', source: 'Indeed', salary: '$110k - $140k', scrapedAt: '2 hours ago', isSaved: false },
      { id: '4', title: 'React Developer with Tailwind Experience', company: 'StripeLine Agency', location: 'Hybrid / Berlin, DE', type: 'Part-time', source: 'LinkedIn', salary: '€50k - €65k', scrapedAt: '5 hours ago', isSaved: false },
    ]);
  }, []);

  const toggleSaveJob = (id: string) => {
    setListings(prev => prev.map(job => job.id === id ? { ...job, isSaved: !job.isSaved } : job));
  };

  const handleCheckboxToggle = (value: string, currentList: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (currentList.includes(value)) {
      setList(currentList.filter(item => item !== value));
    } else {
      setList([...currentList, value]);
    }
  };

  // Processing pipeline filters against the state vectors
  const filteredListings = listings.filter(job => {
    const matchesKeyword = job.title.toLowerCase().includes(searchKeyword.toLowerCase()) || 
                           job.company.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesLocation = job.location.toLowerCase().includes(searchLocation.toLowerCase());
    const matchesSource = selectedSources.length === 0 || selectedSources.includes(job.source);
    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(job.type);
    
    return matchesKeyword && matchesLocation && matchesSource && matchesType;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* --- DUAL INTERACTIVE SEARCH CONTROLS BANNER --- */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-2 items-center">
          <div className="flex items-center gap-2 px-3 w-full border-b md:border-b-0 md:border-r border-slate-100 py-2.5">
            <Search className="text-slate-400 shrink-0" size={18} />
            <input 
              type="text" 
              placeholder="Job titles, tech stack keywords, or companies..." 
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center gap-2 px-3 w-full py-2.5 md:w-80 shrink-0">
            <MapPin className="text-slate-400 shrink-0" size={18} />
            <input 
              type="text" 
              placeholder="City, region, or 'Remote'..." 
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
            />
          </div>
          <button className="w-full md:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-sm whitespace-nowrap">
            Update Index
          </button>
        </div>

        {/* Mobile Filter Toggle Ribbon */}
        <div className="md:hidden flex justify-between items-center px-1">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{filteredListings.length} Positions matching</p>
          <button 
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm"
          >
            <SlidersHorizontal size={14} /> Filter Layout
          </button>
        </div>

        {/* --- MAIN PAGE CONTENT INTERFACE SPLIT --- */}
        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* --- SIDEBAR DESKTOP FILTER CONTROLS --- */}
          <div className={`w-full md:w-60 bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-6 shrink-0 ${isMobileFiltersOpen ? 'block' : 'hidden md:block'}`}>
            
            {/* Filter Group: Scraper Target Origins */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Data Source Origins</h4>
              <div className="space-y-2">
                {['RemoteOK', 'LinkedIn', 'Indeed'].map((src) => (
                  <label key={src} className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer group select-none">
                    <input 
                      type="checkbox"
                      checked={selectedSources.includes(src)}
                      onChange={() => handleCheckboxToggle(src, selectedSources, setSelectedSources)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                    />
                    <span className="group-hover:text-slate-900 transition">{src}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Filter Group: Employment Types */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Deployment Profiles</h4>
              <div className="space-y-2">
                {['Remote', 'Full-time', 'Part-time', 'Contract'].map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm font-medium text-slate-600 cursor-pointer group select-none">
                    <input 
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleCheckboxToggle(type, selectedTypes, setSelectedTypes)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                    />
                    <span className="group-hover:text-slate-900 transition">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* --- CORE JOBS DATA LISTINGS INTERFACE --- */}
          <div className="flex-1 w-full space-y-4">
            <div className="hidden md:flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
                Showing {filteredListings.length} Discovered Vacancies
              </h3>
              <span className="text-xs text-slate-400 font-medium">Synced with PostgreSQL db storage</span>
            </div>

            <div className="space-y-4">
              {filteredListings.length > 0 ? (
                filteredListings.map((job) => (
                  <div 
                    key={job.id} 
                    className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 font-bold text-[10px] rounded uppercase tracking-wide">
                          {job.source}
                        </span>
                        <span className="px-2 py-0.5 bg-blue-50/60 border border-blue-100 text-blue-600 font-semibold text-[10px] rounded uppercase tracking-wide">
                          {job.type}
                        </span>
                        <span className="text-slate-400 text-xs flex items-center gap-1 font-medium ml-1">
                          <Calendar size={13} /> {job.scrapedAt}
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition leading-snug">
                        {job.title}
                      </h2>
                      <p className="text-sm font-semibold text-slate-500">
                        {job.company} — <span className="text-slate-400 font-normal">{job.location}</span>
                      </p>

                      <p className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-1 rounded w-fit">
                        Est. Budget: <span className="text-slate-700 font-extrabold">{job.salary}</span>
                      </p>
                    </div>

                    {/* Action Hub */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-0 pt-4 sm:pt-0 border-slate-100">
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className={`p-2.5 rounded-xl border transition ${
                          job.isSaved 
                            ? 'bg-amber-50 border-amber-200 text-amber-500' 
                            : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                        }`}
                        title={job.isSaved ? "Unsave Listing" : "Save Listing"}
                      >
                        {job.isSaved ? <BookmarkCheck size={18} fill="currentColor" /> : <Bookmark size={18} />}
                      </button>

                      <a 
                        href=""
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200 hover:border-blue-600 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200"
                      >
                        Apply <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                /* --- EMPTY SEARCH STATE DISPLAY --- */
                <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 text-center space-y-3">
                  <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                    <Briefcase size={20} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-700">No vacancies matched filters</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto">Try stripping out specific criteria parameters or broadening keyword parameters.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}