import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  SlidersHorizontal,
  Search,
  Bell,
  Sparkles,
  ArrowRight,
  MapPin,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
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
  employment_types?: string[];
  experience_levels?: string[];
  categories?: string[];
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
  const token = useAuthStore((s) => s.token);
  const isLoggedIn = !!token;

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

  const selectedCategories =
    parseArrayParam(
      searchParams.get("category")
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
    filterData?.employment_types ||
    filterData?.job_types ||
    [];

  const allCategories =
    filterData?.categories || [];

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
      categories: selectedCategories,
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

      if (debouncedSearchTerm) {
        params.set(
          "search",
          debouncedSearchTerm
        );
      }

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
          "employment_type",
          selectedJobTypes.join(",")
        );
      }

      if (selectedCategories.length > 0) {
        params.set(
          "category",
          selectedCategories.join(",")
        );
      }

      params.set("sort", sort);

      if (activeOnly) {
        params.set(
          "active_only",
          "true"
        );
      }

      // Use main jobs endpoint (supports category + filters)
      const endpoint = `/api/jobs?${params.toString()}`;

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

    staleTime:
      5 * 60 * 1000,

    gcTime:
      30 * 60 * 1000,

    placeholderData:
      keepPreviousData,

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
  | Category filter
  |--------------------------------------------------------------------------
  */

  const handleCategoryToggle = (
    category: string
  ) => {
    const next =
      selectedCategories.includes(
        category
      )
        ? selectedCategories.filter(
            (item) =>
              item !== category
          )
        : [
            ...selectedCategories,
            category,
          ];

    updateSearchParams({
      category:
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

    updateCachedJobSaveState(
      id,
      nextSavedState
    );

    setIsSaving(id);

    try {
      await api.post(
        `/api/savejob/${id}`
      );

      updateCachedJobSaveState(
        id,
        nextSavedState
      );

      queryClient.invalidateQueries({
        queryKey: [
          "saved-jobs",
        ],
      });
    } catch (err) {
      console.error(
        "Error updating save status:",
        err
      );

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
    selectedCategories,
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
                                    {/* ========== LANDING HERO ========== */}
      <section className="relative overflow-hidden border-b border-slate-800/80">
        {/* Ambient glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_55%)]" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-800/50 bg-emerald-950/40 px-3.5 py-1.5 text-xs font-bold text-emerald-300">
              <Sparkles size={14} className="text-emerald-400" />
              Smart job discovery 
            </div>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find work that
              <span className="block bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                fits your skills
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
              JobPulse pulls openings from across the web, matches them to your profile,
              and helps you track what matters — without the noise.
            </p>

            {/* Search CTA */}
            <div className="mx-auto mt-8 max-w-xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch(searchTerm);
                }}
                className="flex flex-col gap-3 sm:flex-row sm:items-center"
              >
                <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-900/80 px-4 py-3.5 shadow-xl shadow-black/20 backdrop-blur-sm focus-within:border-emerald-500/50 focus-within:ring-2 focus-within:ring-emerald-500/10">
                  <Search size={18} className="shrink-0 text-slate-500" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Role, skill, or company…"
                    className="w-full bg-transparent text-sm font-medium text-slate-100 outline-none placeholder:text-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-500"
                >
                  Search jobs
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>

            {/* Stats */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-slate-400">
                <Briefcase size={16} className="text-emerald-500" />
                <span>
                  <strong className="font-bold text-white">
                    {totalDatabaseCount.toLocaleString()}
                  </strong>{" "}
                  openings tracked
                </span>
              </div>
              <div className="hidden h-4 w-px bg-slate-700 sm:block" />
              <div className="flex items-center gap-2 text-slate-400">
                <Zap size={16} className="text-amber-400" />
                <span>Updated continuously</span>
              </div>
              <div className="hidden h-4 w-px bg-slate-700 sm:block" />
              <div className="flex items-center gap-2 text-slate-400">
                <ShieldCheck size={16} className="text-indigo-400" />
                <span>Free to start</span>
              </div>
            </div>

            {/* Secondary CTAs */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-4 py-2.5 text-sm font-bold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
              >
                Browse all jobs
              </Link>
              {!isLoggedIn ? (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-800/50 bg-emerald-950/40 px-4 py-2.5 text-sm font-bold text-emerald-300 transition hover:bg-emerald-950/70"
                >
                  Create free profile
                  <ArrowRight size={14} />
                </Link>
              ) : (
                <Link
                  to="/alerts"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-800/50 bg-emerald-950/40 px-4 py-2.5 text-sm font-bold text-emerald-300 transition hover:bg-emerald-950/70"
                >
                  <Bell size={14} />
                  Set job alerts
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========== VALUE PROPS ========== */}
      <section className="border-b border-slate-800/80 bg-slate-950/50">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
              icon: <Search size={20} className="text-emerald-400" />,
              title: "Search that understands you",
              body: "Filter by skill, location, and type — or let recommendations surface roles that match your profile.",
            },
            {
              icon: <Bell size={20} className="text-indigo-400" />,
              title: "Alerts when it matters",
              body: "Save keywords and get notified when new openings appear, so you never miss a fit.",
            },
            {
              icon: <MapPin size={20} className="text-teal-400" />,
              title: "One place for your hunt",
              body: "Save jobs, track alerts, and keep your profile ready — without juggling a dozen tabs.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5 transition hover:border-slate-700 hover:bg-slate-900/70"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/80">
                {item.icon}
              </div>
              <h3 className="text-sm font-black text-white">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
      
      {/* ========== JOBS SECTION LABEL ========== */}
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-500/90">
              Live openings
            </p>
            <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
              Explore roles right now
            </h2>
          </div>
          {filteredTotalItems > 0 && (
            <p className="text-sm font-medium text-slate-400">
              Showing{" "}
              <span className="font-bold text-slate-200">
                {filteredTotalItems.toLocaleString()}
              </span>{" "}
              matches
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 relative z-10">

        

        {/* Category chips */}
        {allCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1 justify-center">
            <button
              type="button"
              onClick={() =>
                updateSearchParams({
                  category: null,
                  page: "1",
                })
              }
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedCategories.length === 0
                  ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-200"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              All
            </button>

            {allCategories.map((cat) => {
              const active =
                selectedCategories.includes(cat);

              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() =>
                    handleCategoryToggle(cat)
                  }
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    active
                      ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-200"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        )}

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
            allCategories={
              allCategories
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
            selectedCategories={
              selectedCategories
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
            onCategoryToggle={
              handleCategoryToggle
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
                  {totalDatabaseCount > 0 && (
                    <span className="text-slate-600">
                      {" "}
                      · {totalDatabaseCount} total
                    </span>
                  )}
                </p>

                {searchTerm && (
                  <p className="text-xs text-slate-500">
                    Results for{" "}
                    <span className="text-slate-300 font-medium">
                      &quot;{searchTerm}&quot;
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