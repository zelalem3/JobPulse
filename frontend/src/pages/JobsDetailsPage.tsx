import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldAlert, Loader2, Sparkles } from "lucide-react";
import api from "../services/axios";
import { JobDetails } from "../types/jobDetails";
import JobDetailsHeader from "../components/job-details/JobDetailsHeader";
import JobDescription from "../components/job-details/JobDescription";
import RequiredSkillsPanel from "../components/job-details/RequiredSkillsPanel";
import PositionSpecsPanel from "../components/job-details/PositionSpecsPanel";
import PipelineTelemetryPanel from "../components/job-details/PipelineTelemetryPanel";

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

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
      const response = await api.post(`/api/savejob/${id}`);
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="text-center space-y-3 flex flex-col items-center z-10">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl">
            <Loader2 className="animate-spin text-emerald-400" size={32} />
          </div>
          <p className="text-xs font-bold text-slate-400 tracking-wider uppercase">Gathering opportunity intel...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(244,63,94,0.15),rgba(255,255,255,0))] pointer-events-none" />
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 max-w-sm text-center shadow-2xl space-y-5 z-10">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert size={28} />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-white">Listing Unavailable</h2>
            <p className="text-xs text-slate-400 leading-relaxed">{error || "Record missing."}</p>
          </div>
          <button 
            onClick={() => navigate(-1)} 
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-all border border-slate-700/60 shadow-lg cursor-pointer"
          >
            Return to Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-6 relative z-10">
        
        {/* --- BACK NAVIGATION LINK --- */}
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900/40 hover:bg-slate-900 border border-slate-800/80 rounded-2xl text-xs font-bold text-slate-400 hover:text-white transition-all group cursor-pointer shadow-lg backdrop-blur-md"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform text-emerald-400" /> 
          Back to Listings
        </button>

        {/* --- HERO HEADER PANEL --- */}
        <JobDetailsHeader 
          job={job} 
          isSaving={isSaving} 
          onToggleSave={toggleSave} 
        />

        {/* --- GRID SPLIT INTERFACE PANEL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* --- DESCRIPTION PANEL --- */}
          <JobDescription description={job.description} />

          {/* --- SIDEBAR TECH INFO PANELS --- */}
          <div className="space-y-6">
            <RequiredSkillsPanel skills={job.skills || []} />

            <PositionSpecsPanel 
              location={job.location} 
              salary={job.salary} 
              type={job.type} 
            />

            <PipelineTelemetryPanel 
              id={job.id} 
              scrapedAt={job.scrapedAt} 
            />
          </div>

        </div>
      </div>
    </div>
  );
}