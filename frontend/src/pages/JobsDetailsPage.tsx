import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Bookmark, BookmarkCheck, ExternalLink, Calendar, 
  MapPin, Briefcase, DollarSign, Share2, ShieldAlert, Database, Loader2 
} from 'lucide-react';
import api from '../services/axios';

interface Skill {
  id?: number;
  name?: string;
  title?: string;
}

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
  skills?: (Skill | string)[];
}

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Helper function to safely extract skill names whether they are strings, relational objects, or pivot records
  const renderSkillName = (skill: Skill | string): string => {
    if (typeof skill === "string") return skill;
    if (skill && typeof skill === "object") {
      return skill.name || skill.title || String(skill.id || "");
    }
    return String(skill);
  };

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(`/api/jobs/${id}`);
        setJob(response.data);
      } catch (e) {
        console.error("Error pulling database listing:", e);
        setError("Could not locate the requested job listing registry.");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const toggleSave = async () => {
    if (!job || isSaving) return;
    
    const previousSavedState = job.isSaved;
    setJob(prev => prev ? { ...prev, isSaved: !prev.isSaved } : null);
    setIsSaving(true);

    try {
      const response = await api.post(`api/savejob/${id}`);
      console.log("Save status updated successfully", response.data);
    } catch (e) {
      console.error("Error updating save status:", e);
      setJob(prev => prev ? { ...prev, isSaved: previousSavedState } : null);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Loader2 className="animate-spin text-slate-400" size={32} />
          <p className="text-sm font-semibold text-slate-400">Retrieving position registry indices...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 max-w-sm text-center shadow-xl space-y-4">
          <ShieldAlert className="mx-auto text-rose-400" size={40} />
          <p className="text-sm font-bold text-white">{error || "Record missing."}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-all border border-slate-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-slate-800 selection:text-white">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* --- BACK NAVIGATION LINK --- */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition" /> Back to Directories
        </button>

        {/* --- MAIN HERO HEADER PANEL --- */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-slate-800 border border-slate-700/60 text-slate-300 font-bold text-xs rounded-xl tracking-wide">
                {job.source}
              </span>
              <span className="px-3 py-1 bg-slate-800 border border-slate-700/60 text-slate-300 font-semibold text-xs rounded-xl tracking-wide">
                {job.type}
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight text-white">
              {(job.title || "").replace(/\*\*/g, "")}
            </h1>
            
            <p className="text-sm font-semibold text-slate-400">
              {job.company} — <a href={job.url || "#"} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white underline font-bold inline-flex items-center gap-1">Visit Site <ExternalLink size={12} /></a>
            </p>
          </div>

          <div className="flex items-center gap-2.5 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-800 justify-end shrink-0">
            <button 
              onClick={toggleSave}
              disabled={isSaving}
              className={`p-3 rounded-2xl border transition-all shadow-lg flex items-center justify-center ${
                job.isSaved 
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              } ${isSaving ? 'opacity-60 cursor-not-allowed' : ''}`}
              title={job.isSaved ? "Unsave Position" : "Save Position"}
            >
              {job.isSaved ? <BookmarkCheck size={20} fill="currentColor" /> : <Bookmark size={20} />}
            </button>
            
            <button className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-2xl transition-all shadow-lg">
              <Share2 size={20} />
            </button>

            
          </div>
        </div>

        {/* --- GRID SPLIT INTERFACE PANEL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* --- HYBRID SAFE DESCRIPTION PANEL --- */}
          <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-xl space-y-4">
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-4">Job Description</h2>
            
            <article className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed">
              {(() => {
                const descriptionText = job.description || "";
                const hasHtml = /<\/?[a-z][\s\S]*>/i.test(descriptionText);

                if (hasHtml) {
                  return (
                    <div 
                      className="space-y-4 text-slate-300 prose-p:text-slate-300 prose-p:font-normal prose-p:text-[14px] prose-p:leading-relaxed prose-headings:text-white prose-headings:font-black prose-ul:list-disc prose-ul:pl-5 prose-ol:list-decimal prose-ol:pl-5 prose-li:text-slate-300"
                      dangerouslySetInnerHTML={{ __html: descriptionText }} 
                    />
                  );
                }

                return (
                  <div className="space-y-4 text-slate-300">
                    {descriptionText.split(/\n+/).map((paragraph, index) => {
                      const trimmed = paragraph.trim();
                      if (!trimmed) return null;

                      if (trimmed.startsWith('###')) {
                        return (
                          <h3 key={index} className="text-base font-black text-white pt-3 pb-1 border-b border-slate-800 mt-6 first:mt-0">
                            {trimmed.replace('###', '').trim()}
                          </h3>
                        );
                      }

                      if (trimmed.startsWith('*') || trimmed.startsWith('-')) {
                        const cleanLi = trimmed.replace(/^[*-\s]+/, '').trim();
                        return (
                          <ul key={index} className="list-disc pl-5 my-1">
                            <li className="text-slate-300 text-[14px] font-normal">
                              {cleanLi.split('**').map((chunk, cIdx) => 
                                cIdx % 2 === 1 ? <strong key={cIdx} className="text-white font-bold">{chunk}</strong> : chunk
                              )}
                            </li>
                          </ul>
                        );
                      }

                      return (
                        <p key={index} className="text-slate-300 text-[14px] leading-relaxed font-normal">
                          {trimmed}
                        </p>
                      );
                    })}
                  </div>
                );
              })()}
            </article>
          </div>

          {/* --- SIDEBAR TECH INFO PANELS --- */}
          <div className="space-y-6">
            
            {/* --- SKILLS BADGES PANEL --- */}
            {job.skills && job.skills.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1.5 bg-slate-800/80 border border-slate-700/60 text-slate-200 text-xs font-bold rounded-xl tracking-wide"
                    >
                      {renderSkillName(skill)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">Position Specs</h4>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-xl border border-slate-700/60 text-slate-300 shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Location</p>
                    <p className="text-sm font-bold text-white">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-xl border border-slate-700/60 text-slate-300 shrink-0">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Compensation</p>
                    <p className="text-sm font-bold text-white">{job.salary || "Not Specified"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-slate-800 rounded-xl border border-slate-700/60 text-slate-300 shrink-0">
                    <Briefcase size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Employment Type</p>
                    <p className="text-sm font-bold text-white">{job.type}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 border border-slate-800/80 shadow-xl space-y-4 text-slate-200">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Database size={14} /> Pipeline Telemetry
              </h4>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-500">Index ID:</span>
                  <span className="text-slate-200 font-bold">#JP-{job.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-500">Discovered:</span>
                  <span className="text-slate-300 font-bold flex items-center gap-1">
                    <Calendar size={12} className="text-slate-500" /> {job.scrapedAt}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ingest Engine:</span>
                  <span className="text-slate-300 font-bold">Playwright/BS4</span>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-3xl flex gap-3 items-start text-slate-400 shadow-xl">
              <ShieldAlert size={18} className="shrink-0 mt-0.5 text-slate-400" />
              <p className="text-[11px] leading-relaxed font-medium text-slate-400">
                This listing was automatically scraped by the JobPulse system cluster. Always cross-verify external source application loops before submitting sensitive account keys or CV credentials.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}