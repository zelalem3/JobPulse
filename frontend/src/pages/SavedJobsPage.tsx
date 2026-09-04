import React, { useEffect, useState } from "react";
import { Bookmark, Loader2, Sparkles, SearchX, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
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
        <div className="text-center space-y-3 flex flex-col items-center">
          <div className="relative p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl">
            <Loader2 className="animate-spin text-emerald-400" size={32} />
          </div>
          <p className="text-sm font-semibold text-slate-400 tracking-wide">
            Synchronizing saved positions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wide uppercase mb-1">
              <Sparkles size={13} />
              <span>Personal Bookmarks</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Saved Positions
            </h1>
            <p className="text-sm font-medium text-slate-400">
              Keep tabs on interesting openings and manage your bookmarked roles.
            </p>
          </div>

          {savedJobs.length > 0 && (
            <div className="self-start sm:self-center px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs font-semibold text-slate-300 shadow-sm">
              <span className="text-emerald-400 font-bold">{savedJobs.length}</span> {savedJobs.length === 1 ? "position saved" : "positions saved"}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-900/80 text-rose-300 p-4 rounded-2xl text-sm font-bold shadow-xl backdrop-blur-md">
            {error}
          </div>
        )}

        {/* Search Bar Component */}
        {savedJobs.length > 0 && (
          <SavedJobsSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}

        {/* Jobs List / Empty State */}
        <div className="space-y-4">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <SavedJobCard key={job.id} job={job} onRemove={removeJob} />
            ))
          ) : savedJobs.length > 0 && searchTerm ? (
            /* No search match state */
            <div className="relative bg-slate-900/50 backdrop-blur-2xl border border-slate-800/80 rounded-3xl py-16 px-6 text-center space-y-4 shadow-xl overflow-hidden">
              <div className="w-14 h-14 bg-slate-950 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-800 shadow-lg">
                <SearchX size={24} />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="font-bold text-white text-lg">No matching bookmarks</h3>
                <p className="text-slate-400 text-sm font-medium">
                  We couldn't find any saved roles matching "<span className="text-slate-200">{searchTerm}</span>". Try a different keyword.
                </p>
              </div>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-2 inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              >
                Clear search filter
              </button>
            </div>
          ) : (
            /* Completely empty state */
            <div className="relative bg-gradient-to-b from-slate-900/80 to-slate-900/30 backdrop-blur-2xl border border-slate-800/80 rounded-3xl py-20 px-6 text-center space-y-6 shadow-2xl overflow-hidden group">
              
              {/* Subtle background glow accent */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative w-16 h-16 bg-slate-950 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/30 shadow-xl shadow-emerald-950/50 group-hover:scale-105 transition-transform duration-300">
                <Bookmark size={28} className="fill-emerald-400/20" />
              </div>

              <div className="space-y-2 max-w-md mx-auto">
                <h3 className="font-black text-white text-xl tracking-tight">No saved positions yet</h3>
                <p className="text-slate-400 text-sm font-medium leading-relaxed">
                  Your bookmarked career opportunities will appear here. Explore active listings and tap the bookmark icon to save roles for later.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/"
                  className="
                    inline-flex
                    items-center
                    gap-2
                    px-6
                    py-3.5
                    bg-gradient-to-r
                    from-emerald-600
                    via-teal-600
                    to-emerald-500
                    hover:from-emerald-500
                    hover:via-teal-500
                    hover:to-emerald-400
                    text-white
                    text-xs
                    font-bold
                    rounded-2xl
                    transition-all
                    duration-300
                    shadow-xl
                    shadow-emerald-950/50
                    border
                    border-emerald-400/30
                  "
                >
                  <span>Explore Openings</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}