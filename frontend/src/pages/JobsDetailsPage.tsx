import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // 1. Added routing hooks
import { 
  ArrowLeft, Bookmark, BookmarkCheck, ExternalLink, Calendar, 
  MapPin, Briefcase, DollarSign, Share2, ShieldAlert, Database, Loader2 
} from 'lucide-react';
import api from '../services/axios';

interface JobDetails {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  source: string;
  url: string;
  scrapedAt: string;
  isSaved: boolean;
  description: string;
  companyWebsite?: string;
}

export default function JobDetails() {
  const { id } = useParams<{ id: string }>(); // 2. Grab the dynamic ID from the URL path
  const navigate = useNavigate();

  const [job, setJob] = useState<JobDetails | null>(null); // Start as null while loading
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [save, setsave] = useState(false);

 const savejob = async () => {
  try {
    
    const response = await api.post(`api/savejob/${id}`); 
    console.log("saved successfully", response.data);
    setsave(true); 
  } catch (e) {
    console.error("Error saving job:", e);
  }
};

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        
        // 3. Requesting singular route mapping to JobListingController@show
        const response = await api.get(`/api/jobs/${id}`);
        
        // Depending on your API structure, assign response data or fallback mapping
        setJob(response.data); 
      } catch (e) {
        console.error("Error pulling database listing:", e);
        setError("Could not locate the requested job listing registry.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]); // Refetches if the user navigates directly to another job ID

  const toggleSave = () => {
    if (job) {
      setJob(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null);
    }
  };

  // --- STATE TEMPLATE INTERRUPTS ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm font-semibold text-slate-500">Retrieving position registry indices...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-sm text-center shadow-sm space-y-4">
          <ShieldAlert className="mx-auto text-rose-500" size={40} />
          <p className="text-sm font-bold text-slate-700">{error || "Record missing."}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="w-full py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // --- CORE RENDER SECTION ---
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* --- BACK NAVIGATION LINK --- */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition" /> Back to Directories
        </button>

        {/* --- MAIN HERO HEADER PANEL --- */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 font-bold text-[10px] rounded uppercase tracking-wide">
                {job.source}
              </span>
              <span className="px-2.5 py-0.5 bg-slate-100 text-slate-500 font-medium text-[10px] rounded uppercase tracking-wide">
                {job.type}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {job.title}
            </h1>
            <p className="text-base font-semibold text-slate-500">
              {job.company} — <a href={job.companyWebsite || "#"} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-normal text-sm inline-flex items-center gap-0.5">Visit Site <ExternalLink size={12} /></a>
            </p>
          </div>

          <div className="flex items-center gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 justify-end shrink-0">
            <button 
              onClick={toggleSave}
              className={`p-3 rounded-xl border transition ${
                job.isSaved 
                  ? 'bg-amber-50 border-amber-200 text-amber-500' 
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
              }`}
              title={job.isSaved ? "Unsave Position" : "Save Position"}
            >
              {job.isSaved ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
            </button>
            
            <button className="p-3 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-200 rounded-xl transition">
              <Share2 size={20} />
            </button>

            <a 
              href={job.url}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center gap-2"
            >
              Apply Externally <ExternalLink size={15} />
            </a>
          </div>
        </div>

        {/* --- GRID SPLIT INTERFACE PANEL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <article className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed space-y-4">
              {job.description?.split('\n\n').map((paragraph, index) => {
                if (paragraph.startsWith('###')) {
                  return <h3 key={index} className="text-lg font-black text-slate-900 pt-4 first:pt-0 pb-1 border-b border-slate-100">{paragraph.replace('###', '').trim()}</h3>;
                }
                if (paragraph.startsWith('*')) {
                  return (
                    <ul key={index} className="list-disc pl-5 space-y-2 my-2">
                      {paragraph.split('\n').map((li, i) => (
                        <li key={i} className="text-slate-600">
                          {li.replace('*', '').trim().split('**').map((chunk, cIdx) => cIdx % 2 === 1 ? <strong key={cIdx} className="text-slate-900 font-bold">{chunk}</strong> : chunk)}
                        </li>
                      ))}
                    </ul>
                  );
                }
                return <p key={index}>{paragraph}</p>;
              }) || <p className="text-slate-400 italic">No description provided for this listing.</p>}
            </article>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Position Specs</h4>
              
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Location</p>
                    <p className="text-sm font-semibold text-slate-700">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <DollarSign size={18} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Compensation</p>
                    <p className="text-sm font-semibold text-slate-700">{job.salary}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase size={18} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide">Employment Type</p>
                    <p className="text-sm font-semibold text-slate-700">{job.type}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 shadow-md text-slate-300 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Database size={14} /> Pipeline Telemetry
              </h4>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Index ID:</span>
                  <span className="text-slate-300 font-bold">#JP-{job.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Discovered:</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Calendar size={12} /> {job.scrapedAt}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ingest Engine:</span>
                  <span className="text-blue-400 font-bold">Playwright/BS4</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-100 border border-slate-200/60 rounded-xl flex gap-2 items-start text-slate-400">
              <ShieldAlert size={16} className="shrink-0 mt-0.5 text-slate-400" />
              <p className="text-[11px] leading-relaxed font-medium">
                This listing was automatically scraped by the JobPulse system cluster. Always cross-verify external source application loops before submitting sensitive account keys or CV credentials.
              </p>
            </div>
          </div>
          <div>
            <button onClick={savejob}>{save ? "saved" : "save job"}</button>
          </div>

        </div>
      </div>
    </div>
  );
}