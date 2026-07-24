import React, { useEffect, useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import api from "../services/axios";
import { SavedJob } from "../types/savedJobs";
import SavedJobsSearch from "../components/saved-jobs/SavedJobsSearch";
import SavedJobCard from "../components/saved-jobs/SavedJobCard";

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("api/savedjobs");

        const rawData = response.data.savedjobs || response.data || [];
        const jobsData = rawData.map((item: any) => ({
          id: item.id,
          job_listing_id: item.job_listing_id,
          title: item.job?.title || "Untitled Role",
          company: item.job?.company || "Company Confidential",
          location: item.job?.location || "Remote / Unspecified",
          source: item.job?.source || "JobPulse",
          url: item.job?.url || "#",
          saved_at: item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "Recently",
        }));

        setSavedJobs(jobsData);
      } catch (e) {
        console.error("Error fetching saved jobs:", e);
        setError("Could not load your saved positions registry.");
      } finally {
        setLoading(false);
      }
    };

    fetchSaved();
  }, []);

  const removeJob = async (id: string) => {
    const previousJobs = [...savedJobs];

    setSavedJobs((prev) => prev.filter((job) => job.id !== id));

    try {
      await api.delete(`api/savejob/${id}`);
    } catch (e) {
      console.error("Error removing saved job:", e);
      setSavedJobs(previousJobs);
      setError("Failed to remove the saved job. Please try again.");
    }
  };

  const filteredJobs = savedJobs.filter((job) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const title = (job.title || "").toLowerCase();
    const company = (job.company || "").toLowerCase();
    const location = (job.location || "").toLowerCase();
    const source = (job.source || "").toLowerCase();

    return (
      title.includes(term) ||
      company.includes(term) ||
      location.includes(term) ||
      source.includes(term)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-2 flex flex-col items-center">
          <Loader2 className="animate-spin text-slate-400" size={32} />
          <p className="text-sm font-semibold text-slate-400">
            Synchronizing saved positions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-slate-800 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Saved Positions
          </h1>
          <p className="text-sm font-semibold text-slate-400 mt-1">
            Keep tabs on interesting openings and manage your bookmarked roles.
          </p>
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-900/80 text-rose-300 p-4 rounded-2xl text-sm font-bold shadow-xl">
            {error}
          </div>
        )}

        <SavedJobsSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <SavedJobCard key={job.id} job={job} onRemove={removeJob} />
            ))
          ) : (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-dashed border-slate-800 rounded-3xl py-16 text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 bg-slate-950 text-slate-500 rounded-2xl flex items-center justify-center mx-auto border border-slate-800 shadow-inner">
                <Bookmark size={20} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-white">No bookmarks located</h3>
                <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">
                  Try broadening your search term or bookmark roles from the
                  explore page.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}