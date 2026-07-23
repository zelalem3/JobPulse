import React, { useEffect, useState } from "react";
// 1. Import Link from react-router-dom for client-side routing
import { Link } from "react-router-dom"; 
import {
  Search,
  MapPin,
  Briefcase,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
import api from "../services/axios";

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  source: string;
  salary: string;
  scrapedAt: string;
  isSaved: boolean;
}

export default function JobsPage() {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [listings, setListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);

      // Fetch jobs and user's saved IDs concurrently to sync bookmark states accurately
      const [jobsResponse, savedResponse] = await Promise.all([
        api.get(`/api/jobs?page=${page}&per_page=10`),
        api.get(`api/savedjobs`).catch(() => ({ data: { savedjobs: [] } }))
      ]);

      const jobsData = jobsResponse.data.data || [];
      const rawSavedJobs = savedResponse.data.savedjobs || savedResponse.data || [];
      
      // Extract array of saved job listing IDs belonging to this user
      const savedJobIds = new Set(
        rawSavedJobs.map((item: any) => String(item.job_listing_id || item.job?.id || item.id))
      );

      // Map listings and attach initial isSaved status
      const processedJobs = jobsData.map((job: any) => ({
        ...job,
        id: String(job.id),
        isSaved: savedJobIds.has(String(job.id)),
      }));

      setListings(processedJobs);
      setCurrentPage(jobsResponse.data.current_page);
      setLastPage(jobsResponse.data.last_page);
      setTotal(jobsResponse.data.total);
    } catch (error) {
      console.log("Error loading jobs or saved states:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, []);

  const toggleSaveJob = async (id: string) => {
    if (isSaving !== null) return;

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
      await api.post(`api/savejob/${id}`);
    } catch (e) {
      console.error("Error updating save status:", e);
      setListings((prev) =>
        prev.map((job) => (job.id === id ? { ...job, isSaved: previousSavedState } : job))
      );
    } finally {
      setIsSaving(null);
    }
  };

  const handleCheckboxToggle = (
    value: string,
    currentList: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (currentList.includes(value)) {
      setList(currentList.filter((item) => item !== value));
    } else {
      setList([...currentList, value]);
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

    return (
      matchesKeyword &&
      matchesLocation &&
      matchesSource &&
      matchesType
    );
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-slate-800 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search */}
        <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-3 border border-slate-800/80 shadow-xl flex flex-col md:flex-row gap-2 items-center">
          <div className="flex items-center gap-2.5 px-3 w-full border-b md:border-b-0 md:border-r border-slate-800 py-2.5">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Job title or company..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full bg-transparent outline-none text-slate-100 placeholder:text-slate-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-2.5 px-3 w-full md:w-80 py-2.5">
            <MapPin size={18} className="text-slate-400" />
            <input
              type="text"
              placeholder="Location..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="w-full bg-transparent outline-none text-slate-100 placeholder:text-slate-500 text-sm"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div
            className={`w-full md:w-60 bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-800/80 ${
              isMobileFiltersOpen ? "block" : "hidden md:block"
            }`}
          >
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-sm text-white mb-3 tracking-wide">Sources</h4>
                {["EthioReporter", "Afriwork", "EthioJobs","Josad software","ET carrers","Jobs in Ethio"].map((src) => (
                  <label key={src} className="flex items-center gap-2.5 mb-2.5 text-sm text-slate-300 hover:text-white cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedSources.includes(src)}
                      onChange={() =>
                        handleCheckboxToggle(
                          src,
                          selectedSources,
                          setSelectedSources
                        )
                      }
                      className="rounded bg-slate-950 border-slate-700 text-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    {src}
                  </label>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800">
                <h4 className="font-bold text-sm text-white mb-3 tracking-wide">Type</h4>
                {["Remote", "Full-time", "Part-time", "Contract"].map((type) => (
                  <label key={type} className="flex items-center gap-2.5 mb-2.5 text-sm text-slate-300 hover:text-white cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() =>
                        handleCheckboxToggle(
                          type,
                          selectedTypes,
                          setSelectedTypes
                        )
                      }
                      className="rounded bg-slate-950 border-slate-700 text-slate-700 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Jobs Listing Column */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 px-1">
              <h3 className="font-bold text-sm text-slate-400">
                Showing {filteredListings.length} of {total} Jobs
              </h3>

              <button
                onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                className="md:hidden p-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-300 hover:bg-slate-800 transition-colors shadow-lg"
              >
                <SlidersHorizontal size={16} />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20 text-slate-400 font-medium text-sm">
                Loading jobs...
              </div>
            ) : filteredListings.length > 0 ? (
              <>
                <div className="space-y-4">
                  {filteredListings.map((job) => (
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
                            <span className="text-xs bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-xl font-medium text-slate-300">
                              {job.type}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1 font-medium px-1">
                              <Calendar size={12} className="text-slate-500" />
                              {job.scrapedAt}
                            </span>
                          </div>

                          <h2 className="text-xl font-black tracking-tight transition antialiased">
                            <Link to={`/jobs/${job.id}`} className="text-white hover:text-slate-300 transition-colors duration-200">
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
                              <BookmarkCheck className="text-slate-200" fill="currentColor" size={18} />
                            ) : (
                              <Bookmark size={18} />
                            )}
                          </button>

                          <Link
                            to={`/jobs/${job.id}`}
                            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg border border-slate-700"
                          >
                            View Details
                            <ExternalLink size={14} />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4 mt-10">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => fetchJobs(currentPage - 1)}
                    className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl disabled:opacity-50 font-semibold text-sm transition-all hover:bg-slate-800 text-slate-300 shadow-lg"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-slate-400 font-medium">
                    Page {currentPage} of {lastPage}
                  </span>

                  <button
                    disabled={currentPage === lastPage}
                    onClick={() => fetchJobs(currentPage + 1)}
                    className="px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl disabled:opacity-50 font-semibold text-sm transition-all hover:bg-slate-800 text-slate-300 shadow-lg"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl py-16 text-center border border-slate-800/80 shadow-xl">
                <Briefcase className="mx-auto mb-4 text-slate-500" size={40} />
                <h3 className="font-bold text-white">No jobs found</h3>
                <p className="text-slate-400 text-sm mt-1">Try changing your filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}