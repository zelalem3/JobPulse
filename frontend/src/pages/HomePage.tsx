import React, { useEffect, useState } from "react";
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

  const [allListings, setAllListings] = useState<Job[]>([]);
  const [allSources, setAllSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSearchLog = (term: string) => {
    setSearchTerm(term);
  };

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
          skills: job.skills || [],
        }));

        setAllListings(processedJobs);

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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSources]);

  const handleCheckboxToggle = (source: string) => {
    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter((s) => s !== source)
        : [...prev, source]
    );
  };

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

  const filteredListings = allListings.filter((job) => {
    const title = (job.title ?? "").toLowerCase();
    const company = (job.company ?? "").toLowerCase();
    const location = (job.location ?? "").toLowerCase();
    const source = (job.source ?? "").trim();

    const matchesSearch =
      title.includes(searchTerm.toLowerCase().trim()) ||
      company.includes(searchTerm.toLowerCase().trim()) ||
      location.includes(searchTerm.toLowerCase().trim());

    const matchesSelectedSources =
      selectedSources.length === 0 ||
      selectedSources.some((s) => s.toLowerCase() === source.toLowerCase());

    return matchesSearch && matchesSelectedSources;
  });

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
        <HomeMetricsGrid
          totalJobsLength={allListings.length}
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
            ) : currentPaginatedListings.length > 0 ? (
              <>
                <div className="space-y-4">
                  {currentPaginatedListings.map((job) => (
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