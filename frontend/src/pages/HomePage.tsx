import React, { useEffect, useState } from "react";
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

  const [allListings, setAllListings] = useState<Job[]>([]);
  const [allSources, setAllSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSearchLog = (term: string) => {
    setSearchTerm(term);
  };

  // Fetch all jobs on mount for smooth global filtering and pagination
  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        setLoading(true);

        const [jobsResponse, savedResponse] = await Promise.all([
          api.get(`/api/jobs?per_page=1000`),
          api.get(`api/savedjobs`).catch(() => ({ data: { savedjobs: [] } }))
        ]);

        const jobsData = jobsResponse.data.data || jobsResponse.data || [];
        const rawSavedJobs = savedResponse.data.savedjobs || savedResponse.data || [];
        
        const savedJobIds = new Set(
          rawSavedJobs.map((item: any) => item.job_listing_id || item.job?.id || item.id)
        );

        const processedJobs = jobsData.map((job: Job) => ({
          ...job,
          isSaved: savedJobIds.has(job.id),
        }));

        setAllListings(processedJobs);

        // Extract unique sources dynamically
        const uniqueSources = Array.from(
          new Set(processedJobs.map((job: Job) => job.source).filter(Boolean))
        ) as string[];
        setAllSources(uniqueSources);

      } catch (error) {
        console.log("Error loading jobs or saved states:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllJobs();
  }, []);

  // Reset to page 1 whenever search term or source filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSource]);

  const toggleSaveJob = async (id: number) => {
    if (isSaving !== null) return;

    let previousSavedState = false;
    setAllListings((prev) =>
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
      setAllListings((prev) =>
        prev.map((job) => (job.id === id ? { ...job, isSaved: previousSavedState } : job))
      );
    } finally {
      setIsSaving(null);
    }
  };

  // Filter across the entire dataset
  const filteredListings = allListings.filter((job) => {
    const title = (job.title ?? "").toLowerCase();
    const company = (job.company ?? "").toLowerCase();
    const location = (job.location ?? "").toLowerCase();
    const source = (job.source ?? "").trim();

    const matchesSearch =
      title.includes(searchTerm.toLowerCase().trim()) ||
      company.includes(searchTerm.toLowerCase().trim()) ||
      location.includes(searchTerm.toLowerCase().trim());

    const matchesSelectedSource =
      selectedSource === "All" ||
      source.toLowerCase() === selectedSource.toLowerCase();

    return matchesSearch && matchesSelectedSource;
  });

  // Calculate client-side pagination parameters
  const totalItems = filteredListings.length;
  const lastPage = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPaginatedListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-slate-800 selection:text-white py-8">
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <SearchBar
          onSearch={handleSearchLog}
          placeholder="Search jobs by title, company, or location..."
        />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Metric Cards Top Row Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-800 rounded-2xl border border-slate-700 text-slate-300">
                <Database size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Total Jobs
                </p>
                <h3 className="font-black text-xl text-white">
                  {allListings.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-800 rounded-2xl border border-slate-700 text-slate-300">
                <RefreshCw size={18} className="animate-spin" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Scraper
                </p>
                <h3 className="font-black text-xl text-slate-200">
                  Active
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-800 rounded-2xl border border-slate-700 text-slate-300">
                <Briefcase size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Results
                </p>
                <h3 className="font-black text-xl text-white">
                  {totalItems}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-800 rounded-2xl border border-slate-700 text-slate-300">
                <Filter size={18} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Sources
                </p>
                <h3 className="font-black text-xl text-white">
                  {allSources.length}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Source Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          <button
            onClick={() => setSelectedSource("All")}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
              selectedSource === "All"
                ? "bg-slate-800 text-white border-slate-700 shadow-lg"
                : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200"
            }`}
          >
            All Sources
          </button>
          {allSources.map((src) => (
            <button
              key={src}
              onClick={() => setSelectedSource(src)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                selectedSource === src
                  ? "bg-slate-800 text-white border-slate-700 shadow-lg"
                  : "bg-slate-900/60 text-slate-400 border-slate-800/80 hover:text-slate-200"
              }`}
            >
              {src}
            </button>
          ))}
        </div>

        {/* Core Listings Processing Logic Block */}
        {loading ? (
          <div className="text-center py-20 text-sm font-semibold text-slate-400">
            Loading position indexes...
          </div>
        ) : currentPaginatedListings.length > 0 ? (
          <>
            <div className="space-y-4">
              {currentPaginatedListings.map((job) => (
                <div
                  key={job.id}
                  className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300"
                >
                  <div className="flex justify-between flex-col md:flex-row gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="text-xs bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-xl font-medium text-slate-300">
                          {job.source}
                        </span>

                        {job.type && (
                          <span className="text-xs bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-xl font-medium text-slate-300">
                            {job.type}
                          </span>
                        )}

                        <span className="text-xs text-slate-400 flex items-center gap-1 font-medium px-1">
                          <Calendar size={12} className="text-slate-500" />
                          {job.scraped_at}
                        </span>
                      </div>

                      <h2 className="text-xl font-black tracking-tight transition antialiased">
                        <Link 
                          to={`/jobs/${job.id}`} 
                          className="text-white hover:text-slate-300 transition-colors duration-200"
                        >
                          {job.title}
                        </Link>
                      </h2>

                      <p className="text-slate-400 mt-1 font-medium text-sm">
                        {job.company} — {job.location}
                      </p>

                      {job.salary && (
                        <p className="mt-2 text-xs font-semibold text-slate-300 bg-slate-950/60 inline-block px-3 py-1.5 rounded-xl border border-slate-800">
                          Salary: {job.salary}
                        </p>
                      )}
                    </div>

                    <div className="flex items-start gap-2.5 self-end md:self-start">
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        disabled={isSaving === job.id}
                        className={`p-2.5 bg-slate-900 border border-slate-800 rounded-2xl hover:bg-slate-800 transition-all shadow-lg ${
                          job.isSaved ? "text-slate-200 border-slate-700" : "text-slate-400"
                        } ${isSaving === job.id ? "opacity-50" : ""}`}
                      >
                        {job.isSaved ? (
                          <BookmarkCheck fill="currentColor" size={18} />
                        ) : (
                          <Bookmark size={18} />
                        )}
                      </button>

                      <Link
                        to={`/jobs/${job.id}`}
                        className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-2xl flex items-center gap-2 transition-all shadow-lg border border-slate-700"
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl disabled:opacity-50 font-semibold text-sm transition-all hover:bg-slate-800 text-slate-300 shadow-lg cursor-pointer"
              >
                Previous
              </button>

              <span className="text-sm text-slate-400 font-medium">
                Page {currentPage} of {lastPage}
              </span>

              <button
                disabled={currentPage === lastPage}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
                className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl disabled:opacity-50 font-semibold text-sm transition-all hover:bg-slate-800 text-slate-300 shadow-lg cursor-pointer"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl py-16 text-center border border-slate-800/80 shadow-xl">
            <Briefcase
              className="mx-auto mb-4 text-slate-500"
              size={40}
            />
            <h3 className="font-bold text-white">No jobs found</h3>
            <p className="text-slate-400 text-sm mt-1">
              Try changing your search term or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}