import React, { useState, useEffect } from "react";
import { Bookmark, MapPin, ArrowUpRight, Loader2, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../services/axios";

interface JobListing {
  id: number;
  title: string;
  location: string;
  company_id?: number;
  salary: string | null;
  employment_type?: string;
  deadline?: string | null;
  url: string | null;
  match_score?: number;
  matched_skills?: string[];
  location_match?: boolean;
}

interface SavedJobPivot {
  id: number;
  user_id: number;
  job_listing_id: number;
  created_at: string;
  updated_at: string;
  job?: JobListing;
}

export default function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const savedRes = await api.get("api/savedjobs");

      const savedData =
        savedRes.data?.savedjobs ||
        savedRes.data?.data ||
        savedRes.data ||
        [];

      const formattedSavedJobs = Array.isArray(savedData)
        ? savedData.map((item: SavedJobPivot | JobListing) => {
            if ('job' in item && item.job) {
              return {
                id: item.job.id,
                title: item.job.title,
                location: item.job.location,
                company_id: item.job.company_id,
                salary: item.job.salary,
                employment_type: item.job.employment_type,
                deadline: item.job.deadline,
                url: item.job.url,
              };
            }
            return item as JobListing;
          })
        : [];

      setSavedJobs(formattedSavedJobs);
    } catch (err) {
      console.error("Error fetching saved jobs:", err);
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl shadow-inner">
          <Bookmark size={20} />
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">Saved Jobs</h2>
      </div>

      {loading ? (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 shadow-2xl font-medium flex items-center justify-center gap-3">
          <Loader2 className="animate-spin text-amber-400" size={20} /> Loading saved jobs...
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {savedJobs.length === 0 ? (
            <div className="col-span-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 shadow-2xl font-medium">
              No saved jobs found
            </div>
          ) : (
            savedJobs.map((job) => (
              <div 
                key={job.id} 
                className="group bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 flex flex-col justify-between gap-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-teal-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="space-y-2.5">
                  <Link to={`/jobs/${job.id}`}>
                    <h3 className="font-black text-lg text-white leading-snug group-hover:text-amber-300 transition-colors line-clamp-2">
                      {job.title}
                    </h3>
                  </Link>

                  <p className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                    <MapPin size={13} className="text-amber-500 shrink-0" /> {job.location || 'Addis Ababa'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap pt-2 border-t border-slate-800/60">
                  {/* Redesigned Sleek Outline Details Button */}
                  <Link
                    to={`/jobs/${job.id}`}
                    className="
                      flex-1
                      inline-flex
                      items-center
                      justify-center
                      gap-1.5
                      text-xs
                      font-bold
                      text-slate-300
                      hover:text-white
                      bg-slate-950/40
                      hover:bg-slate-800/80
                      border
                      border-slate-800
                      hover:border-slate-700
                      px-4
                      py-3
                      rounded-2xl
                      transition-all
                      duration-200
                      shadow-sm
                    "
                  >
                    <Sparkles size={13} className="text-slate-400 group-hover:text-amber-400 transition-colors" />
                    <span>View Details</span>
                  </Link>

                  {/* External Application Button */}
                  {job.url && (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="
                        flex-1
                        inline-flex
                        items-center
                        justify-center
                        gap-1.5
                        text-xs
                        font-bold
                        text-amber-200
                        bg-gradient-to-r
                        from-amber-950/80
                        to-amber-900/40
                        hover:from-amber-900/90
                        hover:to-amber-800/60
                        border
                        border-amber-700/50
                        hover:border-amber-500/60
                        px-4
                        py-3
                        rounded-2xl
                        transition-all
                        duration-200
                        shadow-lg
                        shadow-amber-950/30
                      "
                    >
                      <span>Apply Now</span>
                      <ArrowUpRight size={14} className="text-amber-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}