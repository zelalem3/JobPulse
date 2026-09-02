import React, { useEffect, useState, useCallback } from "react";
import { Briefcase, SlidersHorizontal, Sparkles } from "lucide-react";
import SearchBar from "../components/SearchBar";
import api from "../services/axios";
import { Job } from "../types/job";
import HomeMetricsGrid from "../components/home/HomeMetricsGrid";
import JobsSidebarFilter from "../components/home/JobsSidebarFilter";
import JobCard from "../components/home/JobCard";
import PaginationControls from "../components/home/PaginationControls";
import ScrollToTopOnPageChange from "../components/ScrollToTopOnPageChange";

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [listings, setListings] = useState<Job[]>([]);
  const [allSources, setAllSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  const handleSearchLog = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Fetch unique sources for filter sidebar
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

  // Fetch jobs based on search, pagination, and selected sources
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: itemsPerPage.toString(),
      });
      
      if (searchTerm) {
        params.append("search", searchTerm);
      }
      
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
    setCurrentPage(1);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white py-10 relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 left-10 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <ScrollToTopOnPageChange dependencies={[currentPage, selectedSources]} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">

        {/* Hero Banner Intro */}
        <div className="text-center space-y-3 max-w-2xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles size={13} /> Discover Your Next Career Move
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Find roles tailored to your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">ambition</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            Aggregated live positions from top tech markets, filtered and optimized for your next career breakthrough.
          </p>
        </div>

        {/* Fully Expanded Glowing Pill Search Bar Wrapper */}
        <div className="max-w-2xl mx-auto w-full px-2">
          <div className="relative group w-full">
            {/* Outer blur gradient ring */}
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-md opacity-60 group-hover:opacity-100 transition duration-500"></div>
            
            {/* Inner pill container */}
            <div className="relative bg-[#0b0f19] border border-indigo-500/40 rounded-full shadow-2xl w-full">
              <SearchBar
                onSearch={handleSearchLog}
                placeholder="Search by job title, tech stack, company, or city..."
                className="" // overrides max-w-md constraint to fill capsule width
              />
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <HomeMetricsGrid
          totalJobsLength={totalItems}
          totalItems={totalItems}
          allSourcesCount={allSources.length}
        />

        {/* Mobile Filter Toggle */}
        <div className="flex justify-between items-center md:hidden">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold shadow-lg"
          >
            <SlidersHorizontal size={14} className="text-indigo-400" />
            {isFilterOpen ? "Hide Source Filters" : "Filter by Sources"}
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <JobsSidebarFilter
            allSources={allSources}
            selectedSources={selectedSources}
            onCheckboxToggle={handleCheckboxToggle}
            isOpen={isFilterOpen}
          />

          <div className="flex-1 w-full space-y-4">
            {loading ? (
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-16 text-center space-y-3 shadow-xl">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-medium text-slate-400">Scanning live position indexes...</p>
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

                <div className="pt-2">
                  <PaginationControls
                    currentPage={currentPage}
                    lastPage={lastPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            ) : (
              <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl py-20 px-6 text-center border border-slate-800/80 shadow-2xl space-y-4">
                <div className="w-14 h-14 bg-slate-950 text-slate-500 rounded-2xl flex items-center justify-center mx-auto border border-slate-800 shadow-inner">
                  <Briefcase size={24} className="text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base">No matching positions found</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Try loosening your keyword search or unchecking active source filters to view more opportunities.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}