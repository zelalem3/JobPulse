import React, { useState, useEffect } from "react";
import { Bookmark, MapPin, ArrowUpRight, Loader2 } from "lucide-react";
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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl">
          <Bookmark size={18} />
        </div>
        <h2 className="text-xl font-black text-white tracking-tight">Saved Jobs</h2>
      </div>

      {loading ? (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 shadow-2xl font-medium flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-amber-400" size={18} /> Loading saved jobs...
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-5">
          {savedJobs.length === 0 ? (
            <div className="col-span-full bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-12 text-center text-slate-400 shadow-2xl font-medium">
              No saved jobs found
            </div>
          ) : (
            savedJobs.map((job) => (
              <div key={job.id} className="group bg-gradient-to-b from-slate-900/80 to-slate-900/40 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-800/80 hover:border-amber-500/50 transition-all flex flex-col justify-between gap-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="space-y-2">
                  <h3 className="font-black text-lg text-white leading-tight group-hover:text-amber-300 transition-colors">{job.title}</h3>
                  <p className="text-sm font-semibold text-slate-400 flex items-center gap-1.5">
                    <MapPin size={14} className="text-amber-500 shrink-0" /> {job.location || 'Addis Ababa'}
                  </p>
                </div>

                {job.url && (
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-white bg-amber-950/60 border border-amber-800/60 hover:bg-amber-900/80 px-4 py-2.5 rounded-2xl transition-all w-fit shadow-lg"
                  >
                    Apply Now <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}