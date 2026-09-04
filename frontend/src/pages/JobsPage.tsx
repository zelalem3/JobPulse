import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  Briefcase,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import SearchBar from "../components/SearchBar";
import api from "../services/axios";
import { Job } from "../types/job";
import { useDebounce } from '../hooks/useDebounce';


import JobsSidebarFilter from "../components/home/JobsSidebarFilter";
import JobCard from "../components/home/JobCard";
import PaginationControls from "../components/home/PaginationControls";
import ScrollToTopOnPageChange from "../components/ScrollToTopOnPageChange";

export default function HomePage() {

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  const [selectedSources, setSelectedSources] =
    useState<string[]>([]);

  const [selectedLocations, setSelectedLocations] =
    useState<string[]>([]);

  const [selectedJobTypes, setSelectedJobTypes] =
    useState<string[]>([]);

  const [activeOnly, setActiveOnly] =
    useState(false);

  const [sort, setSort] =
    useState("newest");

  /*
  |--------------------------------------------------------------------------
  | Filter options
  |--------------------------------------------------------------------------
  */

  const [allSources, setAllSources] =
    useState<string[]>([]);

  const [allLocations, setAllLocations] =
    useState<string[]>([]);

  const [allJobTypes, setAllJobTypes] =
    useState<string[]>([]);

  const [filtersLoading, setFiltersLoading] =
    useState(true);

  /*
  |--------------------------------------------------------------------------
  | Jobs
  |--------------------------------------------------------------------------
  */

  const [listings, setListings] =
    useState<Job[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState<number | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const [currentPage, setCurrentPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  /*
  |--------------------------------------------------------------------------
  | Metrics
  |--------------------------------------------------------------------------
  */

  const [totalDatabaseCount, setTotalDatabaseCount] =
    useState(0);

  const [filteredTotalItems, setFilteredTotalItems] =
    useState(0);

  /*
  |--------------------------------------------------------------------------
  | Mobile filter
  |--------------------------------------------------------------------------
  */

  const [isFilterOpen, setIsFilterOpen] =
    useState(false);

  const itemsPerPage = 10;

  /*
  |--------------------------------------------------------------------------
  | Search Handler
  |--------------------------------------------------------------------------
  */

  const handleSearch = (term: string) => {
    setSearchTerm(term.trim());
    setCurrentPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Load available filters
  |--------------------------------------------------------------------------
  */

     useEffect(() => {
    const fetchFilters = async () => {
      setFiltersLoading(true); // ⬅️ Set loading to true
      try {
        const response = await api.get(
          "/api/jobs/filters"
        );

        setAllSources(
          response.data.sources || []
        );

        setAllLocations(
          response.data.locations || []
        );

        setAllJobTypes(
          response.data.job_types || []
        );

      } catch (error) {
        console.error(
          "Error loading job filters:",
          error
        );
      } finally {
        setFiltersLoading(false); // ⬅️ Turn off loading when done
      }
    };

    fetchFilters();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Load permanent database total
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const fetchDatabaseTotal = async () => {
      try {
        const response = await api.get(
          "/api/jobs?per_page=1"
        );

        setTotalDatabaseCount(
          response.data.total || 0
        );

      } catch (error) {
        console.error(
          "Error loading database count:",
          error
        );
      }
    };

    fetchDatabaseTotal();
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Fetch jobs
  |--------------------------------------------------------------------------
  */

  const fetchJobs = useCallback(async () => {

    try {
      setLoading(true);

      const params = new URLSearchParams();

      params.set(
        "page",
        currentPage.toString()
      );

      params.set(
        "per_page",
        itemsPerPage.toString()
      );

      /*
      |--------------------------------------------------------------------------
      | Search / filters
      |--------------------------------------------------------------------------
      */

      if (debouncedSearchTerm) {
        params.set("q", debouncedSearchTerm);

        if (selectedSources.length > 0) {
          params.set(
            "source",
            selectedSources.join(",")
          );
        }

        if (selectedLocations.length > 0) {
          params.set(
            "location",
            selectedLocations.join(",")
          );
        }

        if (selectedJobTypes.length > 0) {
          params.set(
            "job_type",
            selectedJobTypes.join(",")
          );
        }

        params.set("sort", sort);

        if (activeOnly) {
          params.set(
            "active_only",
            "true"
          );
        }

      } else {

        /*
        |--------------------------------------------------------------------------
        | Normal jobs endpoint
        |--------------------------------------------------------------------------
        */

        if (selectedSources.length > 0) {
          params.set(
            "source",
            selectedSources.join(",")
          );
        }

        if (selectedLocations.length > 0) {
          params.set(
            "location",
            selectedLocations.join(",")
          );
        }

        if (selectedJobTypes.length > 0) {
          params.set(
            "job_type",
            selectedJobTypes.join(",")
          );
        }

        params.set("sort", sort);

        if (activeOnly) {
          params.set(
            "active_only",
            "true"
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | API endpoint
      |--------------------------------------------------------------------------
      */

      const endpoint = debouncedSearchTerm
        ? `/api/jobs/search?${params.toString()}`
        : `/api/jobs?${params.toString()}`;

      /*
      |--------------------------------------------------------------------------
      | Load jobs + saved jobs
      |--------------------------------------------------------------------------
      */

      const [jobsResponse, savedResponse] =
        await Promise.all([
          api.get(endpoint),

          api
            .get("/api/savedjobs")
            .catch(() => ({
              data: {
                savedjobs: [],
              },
            })),
        ]);

      const jobsData =
        jobsResponse.data.data || [];

      const currentTotal =
        jobsResponse.data.total || 0;

      setLastPage(
        jobsResponse.data.last_page || 1
      );

      setFilteredTotalItems(
        currentTotal
      );

      /*
      |--------------------------------------------------------------------------
      | Saved jobs
      |--------------------------------------------------------------------------
      */

      const rawSavedJobs =
        savedResponse.data.savedjobs ||
        savedResponse.data ||
        [];

      const savedJobIds = new Set(
        rawSavedJobs.map(
          (item: any) =>
            item.job_listing_id ||
            item.job?.id ||
            item.id
        )
      );

      /*
      |--------------------------------------------------------------------------
      | Process jobs
      |--------------------------------------------------------------------------
      */

      const processedJobs: Job[] =
        jobsData.map((job: Job) => ({
          ...job,

          isSaved: savedJobIds.has(
            job.id
          ),

          skills: job.skills || [],
        }));

      setListings(processedJobs);

    } catch (error) {

      console.error(
        "Error loading jobs:",
        error
      );

      setListings([]);

    } finally {

      setLoading(false);
    }

  }, [
    currentPage,
    debouncedSearchTerm,
    selectedSources,
    selectedLocations,
    selectedJobTypes,
    activeOnly,
    sort,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  /*
  |--------------------------------------------------------------------------
  | Source filter
  |--------------------------------------------------------------------------
  */

  const handleSourceToggle = (
    source: string
  ) => {

    setSelectedSources((prev) =>
      prev.includes(source)
        ? prev.filter(
            (item) => item !== source
          )
        : [...prev, source]
    );

    setCurrentPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Location filter
  |--------------------------------------------------------------------------
  */

  const handleLocationToggle = (
    location: string
  ) => {

    setSelectedLocations((prev) =>
      prev.includes(location)
        ? prev.filter(
            (item) => item !== location
          )
        : [...prev, location]
    );

    setCurrentPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Job type filter
  |--------------------------------------------------------------------------
  */

  const handleJobTypeToggle = (
    jobType: string
  ) => {

    setSelectedJobTypes((prev) =>
      prev.includes(jobType)
        ? prev.filter(
            (item) => item !== jobType
          )
        : [...prev, jobType]
    );

    setCurrentPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Active only
  |--------------------------------------------------------------------------
  */

  const handleActiveOnlyChange = (
    value: boolean
  ) => {

    setActiveOnly(value);
    setCurrentPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Sort
  |--------------------------------------------------------------------------
  */

  const handleSortChange = (
    value: string
  ) => {

    setSort(value);
    setCurrentPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Clear filters
  |--------------------------------------------------------------------------
  */

  const clearFilters = () => {

    setSelectedSources([]);
    setSelectedLocations([]);
    setSelectedJobTypes([]);
    setActiveOnly(false);
    setSort("newest");

    setCurrentPage(1);
  };

  /*
  |--------------------------------------------------------------------------
  | Save job
  |--------------------------------------------------------------------------
  */

  const toggleSaveJob = async (
    id: number
  ) => {

    if (isSaving !== null) {
      return;
    }

    const job =
      listings.find(
        (item) => item.id === id
      );

    if (!job) {
      return;
    }

    const previousSavedState =
      !!job.isSaved;

    /*
    |--------------------------------------------------------------------------
    | Optimistic update
    |--------------------------------------------------------------------------
    */

    setListings((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              isSaved:
                !item.isSaved,
            }
          : item
      )
    );

    setIsSaving(id);

    try {

      await api.post(
        `/api/savejob/${id}`
      );

    } catch (error) {

      console.error(
        "Error updating save status:",
        error
      );

      /*
      |--------------------------------------------------------------------------
      | Rollback
      |--------------------------------------------------------------------------
      */

      setListings((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                isSaved:
                  previousSavedState,
              }
            : item
        )
      );

    } finally {

      setIsSaving(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white py-10 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="absolute top-1/4 left-10 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <ScrollToTopOnPageChange
        dependencies={[
          currentPage,
          selectedSources,
          selectedLocations,
          selectedJobTypes,
          searchTerm,
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">

        

        {/* Search */}
        <div className="max-w-3xl mx-auto w-full px-2">

          <div className="relative group w-full">

            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-md opacity-50 group-hover:opacity-80 transition duration-500" />

            <div className="relative bg-[#0b0f19] border border-indigo-500/40 rounded-full shadow-2xl w-full">

              <SearchBar
                onSearch={handleSearch}
                placeholder="Search jobs, skills, companies, or locations..."
                className=""
              />

            </div>
          </div>
        </div>

        

        {/* Mobile filter button */}
        <div className="flex justify-between items-center md:hidden">

          <button
            type="button"
            onClick={() =>
              setIsFilterOpen(
                !isFilterOpen
              )
            }
            className="w-full px-4 py-3 bg-slate-900 border border-slate-800 text-slate-200 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold shadow-lg"
          >
            <SlidersHorizontal
              size={14}
              className="text-indigo-400"
            />

            {isFilterOpen
              ? "Hide Filters"
              : "Show Filters"}
          </button>

        </div>

        {/* Main */}
        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* Sidebar */}
          <JobsSidebarFilter
            allSources={allSources}
            allLocations={allLocations}
            allJobTypes={allJobTypes}
            selectedSources={selectedSources}
            selectedLocations={selectedLocations}
            selectedJobTypes={selectedJobTypes}
            activeOnly={activeOnly}
            sort={sort}
            onSourceToggle={handleSourceToggle}
            onLocationToggle={handleLocationToggle}
            onJobTypeToggle={handleJobTypeToggle}
            onActiveOnlyChange={handleActiveOnlyChange}
            onSortChange={handleSortChange}
            onClearFilters={clearFilters}
            isOpen={isFilterOpen}
            isLoading={filtersLoading}
          />

          {/* Results */}
          <div className="flex-1 w-full space-y-4">

            {/* Result count */}
            {!loading && (
              <div className="flex items-center justify-between px-1">

                <p className="text-xs text-slate-500">
                  {filteredTotalItems}{" "}
                  {filteredTotalItems === 1
                    ? "job"
                    : "jobs"}{" "}
                  found
                </p>

                {searchTerm && (
                  <p className="text-xs text-slate-500">
                    Results for{" "}
                    <span className="text-slate-300 font-medium">
                      "{searchTerm}"
                    </span>
                  </p>
                )}

              </div>
            )}

            {/* Loading */}
            {loading ? (

              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-16 text-center space-y-3 shadow-xl">

                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />

                <p className="text-sm font-medium text-slate-400">
                  Searching job opportunities...
                </p>

              </div>

            ) : listings.length > 0 ? (

              <>
                <div className="space-y-4">

                  {listings.map(
                    (job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        onToggleSave={
                          toggleSaveJob
                        }
                        isSaving={
                          isSaving ===
                          job.id
                        }
                      />
                    )
                  )}

                </div>

                <div className="pt-2">

                  <PaginationControls
                    currentPage={
                      currentPage
                    }
                    lastPage={
                      lastPage
                    }
                    onPageChange={
                      setCurrentPage
                    }
                  />

                </div>
              </>

            ) : (

              <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl py-20 px-6 text-center border border-slate-800/80 shadow-2xl space-y-4">

                <div className="w-14 h-14 bg-slate-950 text-slate-500 rounded-2xl flex items-center justify-center mx-auto border border-slate-800 shadow-inner">

                  <Briefcase
                    size={24}
                    className="text-indigo-400"
                  />

                </div>

                <div className="space-y-1">

                  <h3 className="font-bold text-white text-base">
                    No matching positions found
                  </h3>

                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Try changing your search,
                    removing some filters, or
                    searching for a broader role.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors"
                >
                  Clear filters
                </button>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}