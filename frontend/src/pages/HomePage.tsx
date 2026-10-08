import React, { useEffect, useState } from "react";

import {
  Briefcase,
  SlidersHorizontal,
} from "lucide-react";

import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useSearchParams } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import api from "../services/axios";
import { Job } from "../types/job";
import { useDebounce } from "../hooks/useDebounce";

import JobsSidebarFilter from "../components/home/JobsSidebarFilter";
import JobCard from "../components/home/JobCard";
import PaginationControls from "../components/home/PaginationControls";
import ScrollToTopOnPageChange from "../components/ScrollToTopOnPageChange";

const ITEMS_PER_PAGE = 10;

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface JobsResponse {
  data?: Job[];
  total?: number;
  last_page?: number;
}

interface FiltersResponse {
  sources?: string[];
  locations?: string[];
  job_types?: string[];
}

interface JobsQueryResult {
  listings: Job[];
  lastPage: number;
  filteredTotalItems: number;
}

interface SavedJob {
  job_listing_id?: number;
  job?: {
    id?: number;
  };
  id?: number;
}

/*
|--------------------------------------------------------------------------
| Home Page
|--------------------------------------------------------------------------
*/

export default function HomePage() {
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] =
    useSearchParams();

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const initialSearch =
    searchParams.get("q") || "";

  const [searchTerm, setSearchTerm] =
    useState(initialSearch);

  const debouncedSearchTerm =
    useDebounce(searchTerm, 400);

  /*
  |--------------------------------------------------------------------------
  | Pagination
  |--------------------------------------------------------------------------
  */

  const currentPage = Math.max(
    1,
    Number(searchParams.get("page")) || 1
  );

  /*
  |--------------------------------------------------------------------------
  | Filters
  |--------------------------------------------------------------------------
  */

  const parseArrayParam = (
    value: string | null
  ): string[] => {
    if (!value) {
      return [];
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const selectedSources =
    parseArrayParam(
      searchParams.get("source")
    );

  const selectedLocations =
    parseArrayParam(
      searchParams.get("location")
    );

  const selectedJobTypes =
    parseArrayParam(
      searchParams.get("job_type")
    );

  const activeOnly =
    searchParams.get("active_only") ===
    "true";

  const sort =
    searchParams.get("sort") ||
    "newest";

  /*
  |--------------------------------------------------------------------------
  | Mobile filter
  |--------------------------------------------------------------------------
  */

  const [isFilterOpen, setIsFilterOpen] =
    useState(false);

  /*
  |--------------------------------------------------------------------------
  | Save state
  |--------------------------------------------------------------------------
  */

  const [isSaving, setIsSaving] =
    useState<number | null>(null);

  /*
  |--------------------------------------------------------------------------
  | Search synchronization
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const urlSearch =
      searchParams.get("q") || "";

    if (urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }

    // We intentionally only react to URL changes.
    // Search typing itself is handled separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /*
  |--------------------------------------------------------------------------
  | Update URL helper
  |--------------------------------------------------------------------------
  */

  const updateSearchParams = (
    updates: Record<
      string,
      string | null
    >
  ) => {
    const params =
      new URLSearchParams(
        searchParams
      );

    Object.entries(updates).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === ""
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
    );

    setSearchParams(params);
  };

  /*
  |--------------------------------------------------------------------------
  | Search handler
  |--------------------------------------------------------------------------
  */

  const handleSearch = (
    term: string
  ) => {
    const trimmed = term.trim();

    setSearchTerm(trimmed);

    updateSearchParams({
      q: trimmed || null,
      page: "1",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Available filters
  |--------------------------------------------------------------------------
  */

  const {
    data: filterData,
    isLoading: filtersLoading,
  } = useQuery<FiltersResponse>({
    queryKey: ["job-filters"],

    queryFn: async () => {
      const response =
        await api.get(
          "/api/jobs/filters"
        );

      return response.data;
    },

    staleTime:
      30 * 60 * 1000,

    gcTime:
      60 * 60 * 1000,

    refetchOnWindowFocus: false,
  });

  const allSources =
    filterData?.sources || [];

  const allLocations =
    filterData?.locations || [];

  const allJobTypes =
    filterData?.job_types || [];

  /*
  |--------------------------------------------------------------------------
  | Permanent database total
  |--------------------------------------------------------------------------
  */

  const {
    data: totalDatabaseCount = 0,
  } = useQuery<number>({
    queryKey: [
      "jobs",
      "database-total",
    ],

    queryFn: async () => {
      const response =
        await api.get(
          "/api/jobs?per_page=1"
        );

      return response.data.total || 0;
    },

    staleTime:
      10 * 60 * 1000,

    gcTime:
      30 * 60 * 1000,

    refetchOnWindowFocus: false,
  });

  /*
  |--------------------------------------------------------------------------
  | Jobs query
  |--------------------------------------------------------------------------
  */

  const jobsQueryKey = [
    "jobs",
    {
      page: currentPage,
      perPage: ITEMS_PER_PAGE,
      search: debouncedSearchTerm,
      sources: selectedSources,
      locations: selectedLocations,
      jobTypes: selectedJobTypes,
      activeOnly,
      sort,
    },
  ];

  const {
    data: jobsData,
    isPending,
    isFetching,
    isError,
    error,
  } = useQuery<JobsQueryResult>({
    queryKey: jobsQueryKey,

    queryFn: async () => {
      const params =
        new URLSearchParams();

      params.set(
        "page",
        currentPage.toString()
      );

      params.set(
        "per_page",
        ITEMS_PER_PAGE.toString()
      );

      if (
        debouncedSearchTerm
      ) {
        params.set(
          "q",
          debouncedSearchTerm
        );
      }

      if (
        selectedSources.length > 0
      ) {
        params.set(
          "source",
          selectedSources.join(",")
        );
      }

      if (
        selectedLocations.length > 0
      ) {
        params.set(
          "location",
          selectedLocations.join(",")
        );
      }

      if (
        selectedJobTypes.length > 0
      ) {
        params.set(
          "job_type",
          selectedJobTypes.join(",")
        );
      }

      params.set(
        "sort",
        sort
      );

      if (activeOnly) {
        params.set(
          "active_only",
          "true"
        );
      }

      const endpoint =
        debouncedSearchTerm
          ? `/api/jobs/search?${params.toString()}`
          : `/api/jobs?${params.toString()}`;

      const [
        jobsResponse,
        savedResponse,
      ] = await Promise.all([
        api.get(endpoint),

        api
          .get("/api/savedjobs")
          .catch(() => ({
            data: {
              savedjobs: [],
            },
          })),
      ]);

      const responseData =
        jobsResponse.data as JobsResponse;

      const jobs =
        responseData.data || [];

      const total =
        responseData.total || 0;

      const lastPage =
        responseData.last_page || 1;

      /*
      |--------------------------------------------------------------------------
      | Saved jobs
      |--------------------------------------------------------------------------
      */

      const rawSavedJobs =
        savedResponse.data
          ?.savedjobs ||
        savedResponse.data ||
        [];

      const savedJobIds =
        new Set<number>();

      (
        rawSavedJobs as SavedJob[]
      ).forEach((item) => {
        const savedId =
          item.job_listing_id ??
          item.job?.id ??
          item.id;

        if (
          typeof savedId ===
          "number"
        ) {
          savedJobIds.add(
            savedId
          );
        }
      });

      /*
      |--------------------------------------------------------------------------
      | Process jobs
      |--------------------------------------------------------------------------
      */

      const processedJobs: Job[] =
        jobs.map((job) => ({
          ...job,

          isSaved:
            savedJobIds.has(
              job.id
            ),

          skills:
            job.skills || [],
        }));

      return {
        listings:
          processedJobs,

        lastPage,

        filteredTotalItems:
          total,
      };
    },

    /*
    |--------------------------------------------------------------------------
    | Cache configuration
    |--------------------------------------------------------------------------
    */

    staleTime:
      5 * 60 * 1000,

    gcTime:
      30 * 60 * 1000,

    /*
    |--------------------------------------------------------------------------
    | Keep previous page visible
    |--------------------------------------------------------------------------
    */

    placeholderData:
      keepPreviousData,

    /*
    |--------------------------------------------------------------------------
    | Don't refetch just because the
    | user switches browser tabs
    |--------------------------------------------------------------------------
    */

    refetchOnWindowFocus: false,

    refetchOnReconnect: true,

    retry: 1,
  });

  /*
  |--------------------------------------------------------------------------
  | Derived jobs state
  |--------------------------------------------------------------------------
  */

  const listings =
    jobsData?.listings || [];

  const lastPage =
    jobsData?.lastPage || 1;

  const filteredTotalItems =
    jobsData?.filteredTotalItems ||
    0;

  /*
  |--------------------------------------------------------------------------
  | Loading state
  |--------------------------------------------------------------------------
  */

  const loading =
    isPending;

  /*
  |--------------------------------------------------------------------------
  | Error state
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (isError) {
      console.error(
        "Error loading jobs:",
        error
      );
    }
  }, [
    isError,
    error,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Page change
  |--------------------------------------------------------------------------
  */

  const handlePageChange = (
    page: number
  ) => {
    if (
      page < 1 ||
      page > lastPage ||
      page === currentPage
    ) {
      return;
    }

    updateSearchParams({
      page: page.toString(),
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Source filter
  |--------------------------------------------------------------------------
  */

  const handleSourceToggle = (
    source: string
  ) => {
    const next =
      selectedSources.includes(
        source
      )
        ? selectedSources.filter(
            (item) =>
              item !== source
          )
        : [
            ...selectedSources,
            source,
          ];

    updateSearchParams({
      source:
        next.length > 0
          ? next.join(",")
          : null,
      page: "1",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Location filter
  |--------------------------------------------------------------------------
  */

  const handleLocationToggle = (
    location: string
  ) => {
    const next =
      selectedLocations.includes(
        location
      )
        ? selectedLocations.filter(
            (item) =>
              item !== location
          )
        : [
            ...selectedLocations,
            location,
          ];

    updateSearchParams({
      location:
        next.length > 0
          ? next.join(",")
          : null,
      page: "1",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Job type filter
  |--------------------------------------------------------------------------
  */

  const handleJobTypeToggle = (
    jobType: string
  ) => {
    const next =
      selectedJobTypes.includes(
        jobType
      )
        ? selectedJobTypes.filter(
            (item) =>
              item !== jobType
          )
        : [
            ...selectedJobTypes,
            jobType,
          ];

    updateSearchParams({
      job_type:
        next.length > 0
          ? next.join(",")
          : null,
      page: "1",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Active only
  |--------------------------------------------------------------------------
  */

  const handleActiveOnlyChange = (
    value: boolean
  ) => {
    updateSearchParams({
      active_only: value
        ? "true"
        : null,
      page: "1",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Sort
  |--------------------------------------------------------------------------
  */

  const handleSortChange = (
    value: string
  ) => {
    updateSearchParams({
      sort:
        value !== "newest"
          ? value
          : null,
      page: "1",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Clear filters
  |--------------------------------------------------------------------------
  */

  const clearFilters = () => {
    setSearchTerm("");

    setSearchParams({
      page: "1",
    });
  };

  /*
  |--------------------------------------------------------------------------
  | Update saved state in ALL cached
  | job queries
  |--------------------------------------------------------------------------
  */

  const updateCachedJobSaveState = (
    jobId: number,
    isSaved: boolean
  ) => {
    queryClient.setQueriesData<
      JobsQueryResult
    >(
      {
        queryKey: ["jobs"],
      },
      (oldData) => {
        if (!oldData) {
          return oldData;
        }

        return {
          ...oldData,

          listings:
            oldData.listings.map(
              (job) =>
                job.id === jobId
                  ? {
                      ...job,
                      isSaved,
                    }
                  : job
            ),
        };
      }
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Save / unsave job
  |--------------------------------------------------------------------------
  */

  const toggleSaveJob = async (
    id: number
  ) => {
    if (
      isSaving !== null
    ) {
      return;
    }

    const job =
      listings.find(
        (item) =>
          item.id === id
      );

    if (!job) {
      return;
    }

    const previousSavedState =
      !!job.isSaved;

    const nextSavedState =
      !previousSavedState;

    /*
    |--------------------------------------------------------------------------
    | Optimistic update
    |--------------------------------------------------------------------------
    */

    updateCachedJobSaveState(
      id,
      nextSavedState
    );

    setIsSaving(id);

    try {
      await api.post(
        `/api/savejob/${id}`
      );

      /*
      |--------------------------------------------------------------------------
      | Keep every cached page
      | synchronized
      |--------------------------------------------------------------------------
      */

      updateCachedJobSaveState(
        id,
        nextSavedState
      );

      /*
      |--------------------------------------------------------------------------
      | Refresh saved jobs query
      | if you later add one
      |--------------------------------------------------------------------------
      */

      queryClient.invalidateQueries({
        queryKey: [
          "saved-jobs",
        ],
      });
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

      updateCachedJobSaveState(
        id,
        previousSavedState
      );
    } finally {
      setIsSaving(null);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Scroll to top
  |--------------------------------------------------------------------------
  */

  const scrollDependencies = [
    currentPage,
    selectedSources,
    selectedLocations,
    selectedJobTypes,
    searchTerm,
  ];

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
        dependencies={
          scrollDependencies
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">

        {/* Search */}
        <div className="max-w-3xl mx-auto w-full px-2">

          <div className="relative group w-full">

            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-md opacity-50 group-hover:opacity-80 transition duration-500" />

            <div className="relative bg-[#0b0f19] border border-indigo-500/40 rounded-full shadow-2xl w-full">

              <SearchBar
                onSearch={
                  handleSearch
                }
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
            allSources={
              allSources
            }
            allLocations={
              allLocations
            }
            allJobTypes={
              allJobTypes
            }
            selectedSources={
              selectedSources
            }
            selectedLocations={
              selectedLocations
            }
            selectedJobTypes={
              selectedJobTypes
            }
            activeOnly={
              activeOnly
            }
            sort={sort}
            onSourceToggle={
              handleSourceToggle
            }
            onLocationToggle={
              handleLocationToggle
            }
            onJobTypeToggle={
              handleJobTypeToggle
            }
            onActiveOnlyChange={
              handleActiveOnlyChange
            }
            onSortChange={
              handleSortChange
            }
            onClearFilters={
              clearFilters
            }
            isOpen={
              isFilterOpen
            }
            isLoading={
              filtersLoading
            }
          />

          {/* Results */}
          <div className="flex-1 w-full space-y-4">

            {/* Result count */}
            {!loading && (
              <div className="flex items-center justify-between px-1">

                <p className="text-xs text-slate-500">
                  {filteredTotalItems}{" "}
                  {filteredTotalItems ===
                  1
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

            {/* Error */}
            {isError && !jobsData ? (
              <div className="bg-slate-900/60 backdrop-blur-2xl rounded-3xl py-16 px-6 text-center border border-red-500/20 shadow-2xl space-y-4">

                <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-500/20">
                  <Briefcase
                    size={24}
                  />
                </div>

                <div className="space-y-1">

                  <h3 className="font-bold text-white text-base">
                    Unable to load jobs
                  </h3>

                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Something went wrong while loading job opportunities.
                    Please try again.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    queryClient.invalidateQueries(
                      {
                        queryKey:
                          jobsQueryKey,
                      }
                    )
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Try again
                </button>

              </div>
            ) : loading ? (

              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-16 text-center space-y-3 shadow-xl">

                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />

                <p className="text-sm font-medium text-slate-400">
                  Searching job opportunities...
                </p>

              </div>

            ) : listings.length > 0 ? (

              <>
                <div className="space-y-4 relative">

                  {listings.map(
                    (job) => (
                      <JobCard
                        key={
                          job.id
                        }
                        job={
                          job
                        }
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

                  {/* Background fetch indicator */}
                  {isFetching &&
                    !loading && (
                      <div className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 shadow-lg backdrop-blur-xl">
                        <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        Updating...
                      </div>
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
                      handlePageChange
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
                  onClick={
                    clearFilters
                  }
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