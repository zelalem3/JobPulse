import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldAlert, Loader2 } from "lucide-react";
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
          className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors group cursor-pointer"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition" /> Back to Directories
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