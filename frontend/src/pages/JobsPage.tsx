import React, { useEffect, useState } from "react";
// 1. Import Link from react-router-dom for client-side routing
import { Link } from "react-router-dom"; 
import {
  MapPin,
  Briefcase,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
import SearchBar from "../components/SearchBar";
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
  skills: any[]; // Can be string or relational object from backend
}

export default function JobsPage() {
  const [searchKeyword, setSearchKeyword] = useState("");
 
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const [allListings, setAllListings] = useState<JobListing[]>([]);
  const [allSources, setAllSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper function to safely extract skill string names whether they come as strings or objects
  const renderSkillName = (skill: any): string => {
    if (typeof skill === "string") return skill;
    if (skill && typeof skill === "object") {
      return skill.name || skill.title || String(skill.id || "");
    }
    return String(skill);
  };

  // Fetch all jobs and saved states on mount
  useEffect(() => {
    const fetchAllJobs = async () => {
      try {
        setLoading(true);

        const [jobsResponse, savedResponse] = await Promise.all([
          api.get(`/api/jobs?per_page=1000`), // Fetch full dataset for smooth client-side filtering
          api.get(`api/savedjobs`).catch(() => ({ data: { savedjobs: [] } }))
        ]);

        const jobsData = jobsResponse.data.data || jobsResponse.data || [];
        const rawSavedJobs = savedResponse.data.savedjobs || savedResponse.data || [];
        
        const savedJobIds = new Set(
          rawSavedJobs.map((item: any) => String(item.job_listing_id || item.job?.id || item.id))
        );

        const processedJobs = jobsData.map((job: any) => ({
          ...job,
          id: String(job.id),
          isSaved: savedJobIds.has(String(job.id)),
          skills: job.skills || [], // Ensure skills defaults to an array
        }));

        setAllListings(processedJobs);

        // Extract unique sources dynamically
        const uniqueSources = Array.from(
          new Set(processedJobs.map((job: JobListing) => job.source).filter(Boolean))
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

  // Reset to page 1 whenever filters or search keywords change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, selectedSources]);

  const toggleSaveJob = async (id: string) => {
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
      await api.post(`api/savejob/${id}`);
    } catch (e) {
      console.error("Error updating save status:", e);
      setAllListings((prev) =>
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

  // Filter across the entire dataset
  const filteredListings = allListings.filter((job) => {
    const title = (job.title ?? "").toLowerCase();
    const company = (job.company ?? "").toLowerCase();
    const location = (job.location ?? "").toLowerCase();
    const source = (job.source ?? "").trim().toLowerCase();

    const matchesKeyword =
      title.includes(searchKeyword.toLowerCase().trim()) ||
      company.includes(searchKeyword.toLowerCase().trim());

   

    const matchesSource =
      selectedSources.length === 0 ||
      selectedSources.some((s) => s.trim().toLowerCase() === source);

    return (
      matchesKeyword &&
     
      matchesSource 
    );
  });

  // Calculate client-side pagination parameters
  const totalItems = filteredListings.length;
  const lastPage = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPaginatedListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-slate-800 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search Bar Component Row */}
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="w-full">
            <SearchBar
              onSearch={(term) => setSearchKeyword(term)}
              placeholder="Search jobs by title"
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
                {allSources.length > 0 ? (
                  allSources.map((src) => (
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
                        className="rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      {src}
                    </label>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No sources available</p>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800"></div>
            </div>
          </div>

          {/* Jobs Listing Column */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6 px-1">
              <h3 className="font-bold text-sm text-slate-400">
                Showing {totalItems > 0 ? startIndex + 1 : 0}–{Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} Jobs
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
            ) : currentPaginatedListings.length > 0 ? (
              <>
                <div className="space-y-4">
                  {currentPaginatedListings.map((job) => (
                    <div
                      key={job.id}
                      className="bg-slate-900/60 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300"
                    >
                      <div className="flex justify-between flex-col md:flex-row gap-4">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
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
                              {(job.title || "").replace(/\*\*/g, "")}
                            </Link>
                          </h2>

                          <p className="text-slate-400 font-medium text-sm">
                            {job.company} — {job.location}
                          </p>

                          {/* Render Extracted Skills Badges Safely */}
                          {job.skills && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {job.skills.map((skill, index) => (
                                <span
                                  key={index}
                                  className="text-[11px] bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 px-2.5 py-0.5 rounded-lg font-medium"
                                >
                                  {renderSkillName(skill)}
                                </span>
                              ))}
                            </div>
                          )}

                          {job.salary && (
                            <p className="text-xs font-semibold text-slate-300 bg-slate-950/60 inline-block px-3 py-1.5 rounded-xl border border-slate-800 mt-1">
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
                              <BookmarkCheck className="text-amber-400" fill="currentColor" size={18} />
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

                {/* Pagination Controls Footer Container with Colored Accents */}
                <div className="flex justify-center items-center gap-4 mt-10">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl disabled:opacity-40 font-semibold text-sm transition-all hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white shadow-lg cursor-pointer"
                  >
                    Previous
                  </button>

                  <span className="text-sm font-bold text-slate-300 bg-slate-900/60 px-4 py-2.5 rounded-2xl border border-slate-800/80 shadow-inner flex items-center gap-1.5">
                    Page <span className="text-emerald-400 font-black">{currentPage}</span> of <span className="text-slate-100">{lastPage}</span>
                  </span>

                  <button
                    disabled={currentPage === lastPage}
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
                    className="px-5 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl disabled:opacity-40 font-semibold text-sm transition-all hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white shadow-lg cursor-pointer"
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