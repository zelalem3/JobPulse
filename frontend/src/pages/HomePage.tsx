import React, { useEffect, useState, useCallback } from "react";
import { Briefcase, SlidersHorizontal } from "lucide-react";
import SearchBar from "../components/SearchBar";
import api from "../services/axios";
import { Job } from "../types/job";
import HomeMetricsGrid from "../components/home/HomeMetricsGrid";
import JobsSidebarFilter from "../components/home/JobsSidebarFilter";
import JobCard from "../components/home/JobCard";
import PaginationControls from "../components/home/PaginationControls";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [listings, setListings] = useState<Job[]>([]);
  const [allSources, setAllSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<number | null>(null);

  // Pagination states from Laravel
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const handleSearchLog = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  // Fetch unique sources on initial load so checkboxes stay populated
  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await api.get(`/api/jobs?per_page=100`); 
        const data = response.data.data || response.data || [];
        const uniqueSources = Array.from(
          new Set(data.map((job: Job) => job.source).filter(Boolean))
        ) as string[];
        setAllSources(uniqueSources);
      } catch (e) {
        console.error("Error fetching sources:", e);
      }
    };
    fetchSources();
  }, []);

  // Fetch paginated jobs whenever page, search, or filters change
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);

      // Build query parameters for Laravel backend
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: itemsPerPage.toString(),
      });
      
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      
      // Pass the selected sources comma-separated to match your Laravel controller backend logic
      if (selectedSources.length > 0) {
        params.append("source", selectedSources.join(","));
      }

      const [jobsResponse, savedResponse] = await Promise.all([
        api.get(`/api/jobs?${params.toString()}`),
        api.get(`api/savedjobs`).catch(() => ({ data: { savedjobs: [] } }))
      ]);

      const jobsData = jobsResponse.data.data || [];
      setLastPage(jobsResponse.data.last_page || 1);
      setTotalItems(jobsResponse.data.total || 0);

      const rawSavedJobs = savedResponse.data.savedjobs || savedResponse.data || [];
      const savedJobIds = new Set(
        rawSavedJobs.map((item: any) => item.job_listing_id || item.job?.id || item.id)
      );

      const processedJobs = jobsData.map((job: Job) => ({
        ...job,
        isSaved: savedJobIds.has(job.id),
        skills: job.skills || [],
      }));

      setListings(processedJobs);
    } catch (error) {
      console.log("Error loading jobs or saved states:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedSources]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleCheckboxToggle = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const toggleSaveJob = async (id: number) => {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-slate-800 selection:text-white py-8">
      <div className="max-w-6xl mx-auto px-4 mb-6">
        <SearchBar
          onSearch={handleSearchLog}
          placeholder="Search jobs by title, company, or location..."
        />
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <HomeMetricsGrid
          totalJobsLength={totalItems}
          totalItems={totalItems}
          allSourcesCount={allSources.length}
        />

        {/* Mobile Filter Toggle Button */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-lg"
          >
            <SlidersHorizontal size={14} />
            {isFilterOpen ? "Hide Filters" : "Filter Sources"}
          </button>
        </div>

        {/* Main Content Grid: Sidebar + Job Listings */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <JobsSidebarFilter
            allSources={allSources}
            selectedSources={selectedSources}
            onCheckboxToggle={handleCheckboxToggle}
            isOpen={isFilterOpen}
          />

          <div className="flex-1 w-full">
            {loading ? (
              <div className="text-center py-20 text-sm font-semibold text-slate-400">
                Loading position indexes...
              </div>
            ) : listings.length > 0 ? (
              <>
                <div className="space-y-4">
                  {listings.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onToggleSave={toggleSaveJob}
                      isSaving={isSaving === job.id}
                    />
                  ))}
                </div>

                <PaginationControls
                  currentPage={currentPage}
                  lastPage={lastPage}
                  onPageChange={setCurrentPage}
                />
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
      </div>
    </div>
  );
}