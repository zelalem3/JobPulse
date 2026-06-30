import React, { useEffect, useState } from "react";
// 1. Correctly import Link from react-router-dom for SPA routing
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Briefcase,
  RefreshCw,
  ExternalLink,
  Calendar,
  Filter,
  Database,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import SearchBar from "../components/SearchBar";
import api from "../services/axios";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  source: string;
  url: string;
  scraped_at: string;
  tags?: string[];
  type?: string;
  salary?: string;
  isSaved?: boolean;
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("All");

  const [listings, setListings] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<number | null>(null); // Track specific job saving status

  const [searchKeyword] = useState("");
  const [searchLocation] = useState("");

  const [selectedSources] = useState<string[]>([]);
  const [selectedTypes] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const handleSearchLog = (term: string) => {
    console.log("Searching:", term);
  };

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);

      const response = await api.get(
        `/api/jobs?page=${page}&per_page=10`
      );

      setListings(response.data.data);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
      setTotal(response.data.total);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, []);

  // 2. Fixed bookmark state loop to post async payloads to database with fallbacks
  const toggleSaveJob = async (id: number) => {
    if (isSaving !== null) return;

    // Optimistic UI update
    let previousSavedState = false;
    setListings((prev) =>
      prev.map((job) => {
        if (job.id === id) {
          previousSavedState = !!job.isSaved;
          return { ...job, isSaved: !job.isSaved };
        }
        return job;
      })
    );
    setIsSaving(id);

    try {
      const response = await api.post(`api/savejob/${id}`);
      console.log("Save status updated successfully", response.data);
    } catch (e) {
      console.error("Error updating save status:", e);
      // Revert if API engine drops connection
      setListings((prev) =>
        prev.map((job) => (job.id === id ? { ...job, isSaved: previousSavedState } : job))
      );
    } finally {
      setIsSaving(null);
    }
  };

  const filteredListings = listings.filter((job) => {
    const title = job.title ?? "";
    const company = job.company ?? "";
    const location = job.location ?? "";
    const source = job.source ?? "";
    const type = job.type ?? "";

    const matchesKeyword =
      title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      company.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchesLocation = location
      .toLowerCase()
      .includes(searchLocation.toLowerCase());

    const matchesSource =
      selectedSources.length === 0 ||
      selectedSources.includes(source);

    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.includes(type);

    const matchesSelectedSource =
      selectedSource === "All" ||
      source === selectedSource;

    return (
      matchesKeyword &&
      matchesLocation &&
      matchesSource &&
      matchesType &&
      matchesSelectedSource
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <SearchBar
        onSearch={handleSearchLog}
        placeholder="Search jobs..."
      />

      <div className="max-w-6xl mx-auto py-10 px-4">
        {/* Metric Cards Top Row Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <Database className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Total Jobs
                </p>
                <h3 className="font-black text-xl text-slate-900">
                  {total}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <RefreshCw className="text-emerald-500 animate-spin-slow" size={20} />
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Scraper
                </p>
                <h3 className="font-black text-xl text-emerald-600">
                  Active
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <Briefcase className="text-amber-500" size={20} />
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Results
                </p>
                <h3 className="font-black text-xl text-slate-900">
                  {filteredListings.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <Filter className="text-purple-500" size={20} />
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Sources
                </p>
                <h3 className="font-black text-xl text-slate-900">
                  3
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Core Listings Processing Logic Block */}
        {loading ? (
          <div className="text-center py-20 text-sm font-semibold text-slate-500">
            Loading position indexes...
          </div>
        ) : filteredListings.length > 0 ? (
          <>
            <div className="space-y-4">
              {filteredListings.map((job) => (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border hover:border-slate-300 transition"
                >
                  <div className="flex justify-between flex-col md:flex-row gap-4">
                    <div>
                      <div className="flex gap-2 mb-2">
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded font-medium text-slate-600">
                          {job.source}
                        </span>

                        {job.type && (
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded font-medium text-blue-700">
                            {job.type}
                          </span>
                        )}

                        <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <Calendar size={12} />
                          {job.scraped_at}
                        </span>
                      </div>

                      {/* 3. Pure bold black link targeting dynamic details route mapping */}
                      <h2 className="text-xl font-black text-slate-900 hover:text-blue-600 tracking-tight transition antialiased">
                        <Link to={`/jobs/${job.id}`}>
                          {job.title}
                        </Link>
                      </h2>

                      <p className="text-slate-500 mt-1 font-medium text-sm">
                        {job.company} — {job.location}
                      </p>

                      {job.salary && (
                        <p className="mt-2 text-xs font-semibold text-slate-600 bg-slate-50 inline-block px-2.5 py-1 rounded-md border border-slate-100">
                          Salary: {job.salary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-2 self-end md:self-start">
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        disabled={isSaving === job.id}
                        className={`p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition ${
                          job.isSaved ? "text-amber-500" : "text-slate-400"
                        } ${isSaving === job.id ? "opacity-50" : ""}`}
                      >
                        {job.isSaved ? (
                          <BookmarkCheck fill="currentColor" size={20} />
                        ) : (
                          <Bookmark size={20} />
                        )}
                      </button>

                      {/* 4. Swapped layout anchor targeting the SPA JobDetails container views cleanly */}
                      <Link
                        to={`/jobs/${job.id}`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg flex items-center gap-2 transition shadow-sm"
                      >
                        View Details
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls Footer Container */}
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                disabled={currentPage === 1}
                onClick={() => fetchJobs(currentPage - 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 font-medium text-sm transition hover:bg-slate-50"
              >
                Previous
              </button>

              <span className="text-sm text-slate-600 font-medium">
                Page {currentPage} of {lastPage}
              </span>

              <button
                disabled={currentPage === lastPage}
                onClick={() => fetchJobs(currentPage + 1)}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 font-medium text-sm transition hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl py-16 text-center border">
            <Briefcase
              className="mx-auto mb-4 text-slate-400"
              size={40}
            />
            <h3 className="font-bold text-slate-800">No jobs found</h3>
            <p className="text-slate-500 text-sm mt-1">
              Try changing your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}