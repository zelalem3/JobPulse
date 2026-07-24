import React, { useEffect, useState } from "react";
import { Briefcase, SlidersHorizontal } from "lucide-react";
import SearchBar from "../components/SearchBar";
import api from "../services/axios";
import { JobListing } from "../types/jobsPage";
import JobsSidebarFilter from "../components/jobs/JobsSidebarFilter";
import JobListingCard from "../components/jobs/JobListingCard";
import JobsPaginationControls from "../components/jobs/JobsPaginationControls";

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
          rawSavedJobs.map((item: any) => String(item.job_listing_id || item.job?.id || item.id))
        );

        const processedJobs = jobsData.map((job: any) => ({
          ...job,
          id: String(job.id),
          isSaved: savedJobIds.has(String(job.id)),
          skills: job.skills || [],
        }));

        setAllListings(processedJobs);

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

  const handleCheckboxToggle = (source: string) => {
    if (selectedSources.includes(source)) {
      setSelectedSources(selectedSources.filter((item) => item !== source));
    } else {
      setSelectedSources([...selectedSources, source]);
    }
  };

  const filteredListings = allListings.filter((job) => {
    const title = (job.title ?? "").toLowerCase();
    const company = (job.company ?? "").toLowerCase();
    const source = (job.source ?? "").trim().toLowerCase();

    const matchesKeyword =
      title.includes(searchKeyword.toLowerCase().trim()) ||
      company.includes(searchKeyword.toLowerCase().trim());

    const matchesSource =
      selectedSources.length === 0 ||
      selectedSources.some((s) => s.trim().toLowerCase() === source);

    return matchesKeyword && matchesSource;
  });

  const totalItems = filteredListings.length;
  const lastPage = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPaginatedListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-slate-800 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="w-full">
            <SearchBar
              onSearch={(term) => setSearchKeyword(term)}
              placeholder="Search jobs by title"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <JobsSidebarFilter
            allSources={allSources}
            selectedSources={selectedSources}
            onCheckboxToggle={handleCheckboxToggle}
            isOpen={isMobileFiltersOpen}
          />

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
                    <JobListingCard
                      key={job.id}
                      job={job}
                      onToggleSave={toggleSaveJob}
                      isSaving={isSaving === job.id}
                    />
                  ))}
                </div>

                <JobsPaginationControls
                  currentPage={currentPage}
                  lastPage={lastPage}
                  onPageChange={setCurrentPage}
                />
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