import React, { useCallback, useEffect, useState } from "react";
import {
  Bookmark,
  Loader2,
  Sparkles,
  SearchX,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/axios";
import { SavedJob } from "../types/savedJobs";
import SavedJobsSearch from "../components/saved-jobs/SavedJobsSearch";
import SavedJobCard from "../components/saved-jobs/SavedJobCard";

function resolveCompany(company: unknown): string {
  if (typeof company === "string" && company.trim()) return company.trim();
  if (company && typeof company === "object" && "name" in company) {
    const name = (company as { name?: string }).name;
    if (name?.trim()) return name.trim();
  }
  return "Company Confidential";
}

function formatSavedAt(value?: string | null): string {
  if (!value) return "Recently";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Recently";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchSaved = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("api/savedjobs");

      const rawData = response.data?.savedjobs || response.data?.data || response.data || [];
      const list = Array.isArray(rawData) ? rawData : [];

      const jobsData: SavedJob[] = list.map((item: any) => {
        const job = item.job || item;
        return {
          id: String(item.id ?? job.id),
          job_listing_id: item.job_listing_id != null
            ? String(item.job_listing_id)
            : job.id != null
              ? String(job.id)
              : undefined,
          title: job.title || "Untitled Role",
          company: resolveCompany(job.company),
          location: job.location || "Remote / Unspecified",
          source: job.source || "JobPulse",
          url: job.url || "#",
          saved_at: formatSavedAt(item.created_at || item.saved_at),
        };
      });

      setSavedJobs(jobsData);
    } catch (e) {
      console.error("Error fetching saved jobs:", e);
      setError("Could not load your saved jobs. Please try again.");
      setSavedJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSaved();
  }, [fetchSaved]);

  const removeJob = async (id: string) => {
    const previous = [...savedJobs];
    setSavedJobs((prev) => prev.filter((job) => job.id !== id));
    setRemovingId(id);
    setError(null);

    try {
      await api.delete(`api/savejob/${id}`);
    } catch (e) {
      console.error("Error removing saved job:", e);
      setSavedJobs(previous);
      setError("Failed to remove the saved job. Please try again.");
    } finally {
      setRemovingId(null);
    }
  };

  const filteredJobs = savedJobs.filter((job) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      (job.title || "").toLowerCase().includes(term) ||
      (job.company || "").toLowerCase().includes(term) ||
      (job.location || "").toLowerCase().includes(term) ||
      (job.source || "").toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3 flex flex-col items-center">
          <Loader2 className="animate-spin text-emerald-400" size={32} />
          <p className="text-sm font-medium text-slate-400">
            Loading saved jobs…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      <div className="pointer-events-none absolute top-0 right-1/4 w-[400px] h-[400px] bg-amber-600/8 rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 left-0 w-[320px] h-[320px] bg-emerald-600/8 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6 sm:space-y-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
              <Bookmark size={12} />
              Bookmarks
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              Saved Jobs
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            </h1>
            <p className="text-sm text-slate-400 max-w-md">
              Roles you bookmarked for later. Search, open, or remove anytime.
            </p>
          </div>

          {savedJobs.length > 0 && (
            <div className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-semibold text-slate-300">
              <span className="text-amber-400 font-bold tabular-nums">
                {filteredJobs.length}
              </span>
              {searchTerm.trim() && savedJobs.length !== filteredJobs.length
                ? ` / ${savedJobs.length}`
                : ""}{" "}
              saved
            </div>
          )}
        </header>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-sm text-rose-200"
          >
            <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <p className="flex-1 font-medium">{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-400/80 hover:text-rose-300 text-lg leading-none px-1"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        {/* Search */}
        {savedJobs.length > 0 && (
          <SavedJobsSearch
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}

        {/* List / empty states */}
        {filteredJobs.length > 0 ? (
          <ul className="space-y-3 sm:space-y-4">
            {filteredJobs.map((job) => (
              <li key={job.id}>
                <SavedJobCard
                  job={job}
                  onRemove={removeJob}
                  isRemoving={removingId === job.id}
                />
              </li>
            ))}
          </ul>
        ) : savedJobs.length > 0 && searchTerm ? (
          <div className="rounded-2xl sm:rounded-3xl border border-slate-800/70 bg-slate-900/50 py-14 px-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-indigo-400">
              <SearchX size={22} />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-bold text-white text-base">
                No matching bookmarks
              </h3>
              <p className="text-sm text-slate-400">
                Nothing matches “{searchTerm}”. Try another keyword.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="inline-flex px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800/70 bg-gradient-to-b from-slate-900/80 to-slate-900/40 py-16 sm:py-20 px-6 text-center space-y-5 shadow-xl">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative w-14 h-14 mx-auto rounded-2xl bg-slate-950 border border-amber-500/25 text-amber-400 flex items-center justify-center shadow-lg">
              <Bookmark size={24} className="fill-amber-400/20" />
            </div>

            <div className="relative space-y-2 max-w-md mx-auto">
              <h3 className="font-black text-white text-lg tracking-tight">
                No saved jobs yet
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Bookmark roles from the job list and they will show up here for
                quick access later.
              </p>
            </div>

            <div className="relative pt-1">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-950/40 border border-emerald-400/20 transition-all"
              >
                <Sparkles size={14} />
                Explore jobs
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
