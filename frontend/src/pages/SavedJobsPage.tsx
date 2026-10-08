import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Loader2,
  Sparkles,
  SearchX,
  ArrowRight,
  AlertCircle,
  BriefcaseBusiness,
  Clock3,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../services/axios";
import { SavedJob } from "../types/savedJobs";
import SavedJobsSearch from "../components/saved-jobs/SavedJobsSearch";
import SavedJobCard from "../components/saved-jobs/SavedJobCard";

function resolveCompany(company: unknown): string {
  if (typeof company === "string" && company.trim()) {
    return company.trim();
  }

  if (company && typeof company === "object" && "name" in company) {
    const name = (company as { name?: string }).name;

    if (name?.trim()) {
      return name.trim();
    }
  }

  return "Company Confidential";
}

function formatSavedAt(value?: string | null): string {
  if (!value) return "Recently";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return "Recently";
  }

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

      const rawData =
        response.data?.savedjobs ||
        response.data?.data ||
        response.data ||
        [];

      const list = Array.isArray(rawData) ? rawData : [];

      const jobsData: SavedJob[] = list.map((item: any) => {
        const job = item.job || item;

        return {
          id: String(item.id ?? job.id),
          job_listing_id:
            item.job_listing_id != null
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

  const filteredJobs = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    if (!term) {
      return savedJobs;
    }

    return savedJobs.filter((job) => {
      return (
        (job.title || "").toLowerCase().includes(term) ||
        (job.company || "").toLowerCase().includes(term) ||
        (job.location || "").toLowerCase().includes(term) ||
        (job.source || "").toLowerCase().includes(term)
      );
    });
  }, [savedJobs, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-xl" />
            <div className="relative w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
              <Loader2
                className="animate-spin text-indigo-400"
                size={22}
              />
            </div>
          </div>

          <p className="text-sm font-medium text-slate-400">
            Loading your saved jobs...
          </p>
        </div>
      </div>
    );
  }

  const hasSearch = searchTerm.trim().length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">

      {/* Ambient background */}
      <div className="pointer-events-none absolute -top-40 right-0 w-[500px] h-[500px] rounded-full bg-indigo-600/[0.07] blur-[120px]" />
      <div className="pointer-events-none absolute top-[35%] -left-40 w-[400px] h-[400px] rounded-full bg-violet-600/[0.05] blur-[120px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-14">

        {/* Header */}
        <header className="mb-8">

          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">

            <div className="space-y-4">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-[0.12em]">
                <Bookmark size={12} />
                Your collection
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                  Saved Jobs
                </h1>

                <p className="mt-2 text-sm sm:text-base text-slate-400 max-w-xl leading-relaxed">
                  Keep track of opportunities you're interested in and come
                  back to them whenever you're ready.
                </p>
              </div>

            </div>

            {/* Count */}
            <div className="flex items-center gap-3">

              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-lg">

                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <Bookmark
                    size={16}
                    className="text-indigo-400"
                  />
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                    Saved
                  </p>

                  <p className="text-lg leading-none font-black text-white">
                    {savedJobs.length}
                  </p>
                </div>

              </div>

              <Link
                to="/jobs"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-950/40"
              >
                Find more jobs
                <ArrowRight size={14} />
              </Link>

            </div>

          </div>

        </header>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-sm text-rose-200"
          >
            <AlertCircle
              size={18}
              className="text-rose-400 shrink-0 mt-0.5"
            />

            <p className="flex-1 font-medium">
              {error}
            </p>

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

        {/* Search + summary */}
        {savedJobs.length > 0 && (
          <div className="mb-6 space-y-3">

            <SavedJobsSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />

            <div className="flex items-center justify-between px-1">

              <p className="text-xs text-slate-500">
                {hasSearch ? (
                  <>
                    Showing{" "}
                    <span className="text-slate-300 font-semibold">
                      {filteredJobs.length}
                    </span>{" "}
                    of{" "}
                    <span className="text-slate-300 font-semibold">
                      {savedJobs.length}
                    </span>{" "}
                    saved jobs
                  </>
                ) : (
                  <>
                    <span className="text-slate-300 font-semibold">
                      {savedJobs.length}
                    </span>{" "}
                    {savedJobs.length === 1 ? "opportunity" : "opportunities"}{" "}
                    saved
                  </>
                )}
              </p>

              {hasSearch && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Clear search
                </button>
              )}

            </div>

          </div>
        )}

        {/* Jobs */}
        {filteredJobs.length > 0 ? (
          <div className="space-y-3">

            {filteredJobs.map((job) => (
              <SavedJobCard
                key={job.id}
                job={job}
                onRemove={removeJob}
                isRemoving={removingId === job.id}
              />
            ))}

          </div>
        ) : savedJobs.length > 0 && hasSearch ? (

          /* Search empty */
          <div className="rounded-3xl border border-slate-800/80 bg-slate-900/50 py-20 px-6 text-center">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500 mb-5">
              <SearchX size={24} />
            </div>

            <h3 className="font-bold text-white text-lg">
              No matching jobs
            </h3>

            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              We couldn't find any saved jobs matching{" "}
              <span className="text-slate-300 font-medium">
                "{searchTerm}"
              </span>
              .
            </p>

            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 transition-all"
            >
              Clear search
              <ChevronRight size={14} />
            </button>

          </div>

        ) : (

          /* Empty */
          <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-b from-slate-900/80 to-slate-900/40 py-20 sm:py-24 px-6 text-center">

            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-indigo-500/[0.06] blur-3xl" />

            <div className="relative">

              <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-xl shadow-indigo-950/20">
                <Bookmark size={27} />
              </div>

              <div className="mt-6 max-w-md mx-auto">

                <h3 className="font-black text-white text-xl tracking-tight">
                  Your saved jobs are waiting
                </h3>

                <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                  When you find an opportunity you don't want to lose,
                  bookmark it and it'll appear here for easy access later.
                </p>

              </div>

              <Link
                to="/jobs"
                className="mt-7 inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-950/40 transition-all"
              >
                <Sparkles size={14} />
                Explore jobs
                <ArrowRight size={14} />
              </Link>

            </div>

          </div>
        )}

        {/* Bottom hint */}
        {savedJobs.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-2 text-[11px] text-slate-600">
            <Clock3 size={13} />
            <span>
              Saved jobs are kept here so you can revisit opportunities later.
            </span>
          </div>
        )}

      </div>
    </div>
  );
}

