import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShieldAlert,
} from "lucide-react";
import Spinner from "../components/Spinner";
import api from "../services/axios";
import { JobDetails, Skill } from "../types/jobDetails";

import JobDetailsHeader from "../components/job-details/JobDetailsHeader";
import JobDescription from "../components/job-details/JobDescription";
import RequiredSkillsPanel from "../components/job-details/RequiredSkillsPanel";
import PositionSpecsPanel from "../components/job-details/PositionSpecsPanel";
import PipelineTelemetryPanel from "../components/job-details/PipelineTelemetryPanel";
import SkillMatchPanel from "../components/job-details/SkillMatchPanel";

interface SkillMatch {
  match_score: number;
  matched_skills: Skill[];
  missing_skills: Skill[];
}

export default function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [skillMatch, setSkillMatch] = useState<SkillMatch>({
    match_score: 0,
    matched_skills: [],
    missing_skills: [],
  });

  const [matchLoading, setMatchLoading] = useState<boolean>(true);

  /*
  |--------------------------------------------------------------------------
  | Fetch Job
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchJob = async () => {
      if (!id) {
        setError("Invalid job listing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await api.get(`/api/jobs/${id}`);
        setJob(response.data);
      } catch (error) {
        console.error("Error pulling database listing:", error);
        setError("Could not locate the requested job listing.");
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Fetch Skill Match
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchSkillMatch = async () => {
      if (!id) {
        setMatchLoading(false);
        return;
      }

      try {
        setMatchLoading(true);

        const response = await api.get(`/api/job/recommendation/${id}`);
        const data = response.data;

        setSkillMatch({
          match_score: Number(data?.match_score ?? 0),
          matched_skills: Array.isArray(data?.matched_skills)
            ? data.matched_skills
            : [],
          missing_skills: Array.isArray(data?.missing_skills)
            ? data.missing_skills
            : [],
        });
      } catch (error) {
        console.error("Error fetching skill match:", error);
        // Don't break the whole job page if skill matching fails.
        setSkillMatch({
          match_score: 0,
          matched_skills: [],
          missing_skills: [],
        });
      } finally {
        setMatchLoading(false);
      }
    };

    fetchSkillMatch();
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | Toggle Saved Job
  |--------------------------------------------------------------------------
  */

  const toggleSave = async () => {
    if (!job || isSaving || !id) {
      return;
    }

    const previousSavedState = job.isSaved;

    // Optimistic UI update.
    setJob((previous) => {
      if (!previous) return null;
      return {
        ...previous,
        isSaved: !previous.isSaved,
      };
    });

    setIsSaving(true);

    try {
      const response = await api.post(`/api/savejob/${id}`);
      console.log("Save status updated successfully:", response.data);
    } catch (error) {
      console.error("Error updating save status:", error);

      // Rollback if API request fails.
      setJob((previous) => {
        if (!previous) return null;
        return {
          ...previous,
          isSaved: previousSavedState,
        };
      });
    } finally {
      setIsSaving(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Loading State
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-950 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)] pointer-events-none" />
        <Spinner size="lg" label="Loading opportunity..." />
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Error State
  |--------------------------------------------------------------------------
  */

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(244,63,94,0.12),transparent)] pointer-events-none" />

        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-5 z-10">
          <div className="w-14 h-14 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
            <ShieldAlert size={28} />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-base font-black text-white">
              Listing Unavailable
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              {error || "The requested job record could not be found."}
            </p>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold transition-all border border-slate-700/60 shadow-lg cursor-pointer"
          >
            Return to Listings
          </button>
        </div>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Main Page
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-500/30 selection:text-emerald-50 relative overflow-hidden">
      {/* Ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[520px] h-[520px] bg-emerald-500/[0.06] rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-[420px] h-[420px] bg-indigo-500/[0.05] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-cyan-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-5 sm:space-y-7 relative z-10">
        {/* Back Navigation */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900/50 hover:bg-slate-900/80 border border-slate-800/80 rounded-2xl text-xs font-bold text-slate-400 hover:text-white transition-all group cursor-pointer shadow-lg backdrop-blur-md"
        >
          <ArrowLeft
            size={14}
            className="text-emerald-400 group-hover:-translate-x-1 transition-transform duration-200"
          />
          Back to Listings
        </button>

        {/* Hero Header */}
        <JobDetailsHeader
          job={job}
          isSaving={isSaving}
          onToggleSave={toggleSave}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* LEFT / MAIN COLUMN */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-5 sm:space-y-6">
            <JobDescription description={job.description} />
          </div>

          {/* RIGHT / SIDEBAR — sticky on large screens */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-5 sm:space-y-6">
              <SkillMatchPanel
                score={skillMatch.match_score}
                matchedSkills={skillMatch.matched_skills}
                missingSkills={skillMatch.missing_skills}
                loading={matchLoading}
              />

              {/* <RequiredSkillsPanel skills={job.skills || []} /> */}

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
    </div>
  );
}
