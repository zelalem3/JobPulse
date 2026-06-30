import React, { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Calendar,
  SlidersHorizontal,
  Link,
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

  
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchJobs = async (page = 1) => {
    try {
      setLoading(true);

      const response = await api.get(
        `/api/jobs?page=${page}&per_page=10`
      );

      setListings(response.data.data);
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
      setTotal(response.data.total);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(1);
  }, []);

  const toggleSaveJob = (id: string) => {
    setListings((prev) =>
      prev.map((job) =>
        job.id === id
          ? { ...job, isSaved: !job.isSaved }
          : job
      )
    );
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
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search */}
        <div className="bg-white rounded-2xl p-3 border shadow-sm flex flex-col md:flex-row gap-2 items-center">
          <div className="flex items-center gap-2 px-3 w-full border-b md:border-b-0 md:border-r py-2.5">
            <Search size={18} className="text-slate-400" />

            <input
              type="text"
              placeholder="Job title or company..."
              value={searchKeyword}
              onChange={(e) =>
                setSearchKeyword(e.target.value)
              }
              className="w-full bg-transparent outline-none"
            />
          </div>

          <div className="flex items-center gap-2 px-3 w-full md:w-80 py-2.5">
            <MapPin size={18} className="text-slate-400" />

            <input
              type="text"
              placeholder="Location..."
              value={searchLocation}
              onChange={(e) =>
                setSearchLocation(e.target.value)
              }
              className="w-full bg-transparent outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div
            className={`w-full md:w-60 bg-white rounded-2xl p-5 shadow-sm ${
              isMobileFiltersOpen
                ? "block"
                : "hidden md:block"
            }`}
          >
            <div className="space-y-6">
              <div>
                <h4 className="font-bold mb-3">
                  Sources
                </h4>

                {["RemoteOK", "LinkedIn", "Indeed"].map(
                  (src) => (
                    <label
                      key={src}
                      className="flex items-center gap-2 mb-2"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSources.includes(
                          src
                        )}
                        onChange={() =>
                          handleCheckboxToggle(
                            src,
                            selectedSources,
                            setSelectedSources
                          )
                        }
                      />
                      {src}
                    </label>
                  )
                )}
              </div>

              <div>
                <h4 className="font-bold mb-3">
                  Type
                </h4>

                {[
                  "Remote",
                  "Full-time",
                  "Part-time",
                  "Contract",
                ].map((type) => (
                  <label
                    key={type}
                    className="flex items-center gap-2 mb-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(
                        type
                      )}
                      onChange={() =>
                        handleCheckboxToggle(
                          type,
                          selectedTypes,
                          setSelectedTypes
                        )
                      }
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Jobs */}
          <div className="flex-1">
            <div className="flex justify-between mb-6">
              <h3 className="font-bold text-slate-600">
                Showing {filteredListings.length} of {total} Jobs
              </h3>

              <button
                onClick={() =>
                  setIsMobileFiltersOpen(
                    !isMobileFiltersOpen
                  )
                }
                className="md:hidden"
              >
                <SlidersHorizontal />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-20">
                Loading jobs...
              </div>
            ) : filteredListings.length > 0 ? (
              <>
                <div className="space-y-4">
                  {filteredListings.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white rounded-2xl p-6 shadow-sm border"
                    >
                      <div className="flex justify-between flex-col md:flex-row gap-4">
                        <div>
                          <div className="flex gap-2 mb-2">
                            <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                              {job.source}
                            </span>

                            <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                              {job.type}
                            </span>

                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar size={12} />
                              {job.scrapedAt}
                            </span>
                          </div>

                          <h2 className="text-xl font-bold">
                            {job.title}
                          </h2>

                          <p className="text-slate-500">
                            {job.company} —{" "}
                            {job.location}
                          </p>

                          {job.salary && (
                            <p className="mt-2 text-sm">
                              Salary: {job.salary}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              toggleSaveJob(job.id)
                            }
                            className="p-2 border rounded-lg"
                          >
                            {job.isSaved ? (
                              <BookmarkCheck />
                            ) : (
                              <Bookmark />
                            )}
                          </button>

                          <Link
                            href="ap"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                          >
                            Apply
                            <ExternalLink size={16} />
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
                    onClick={() =>
                      fetchJobs(currentPage - 1)
                    }
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span>
                    Page {currentPage} of {lastPage}
                  </span>

                  <button
                    disabled={
                      currentPage === lastPage
                    }
                    onClick={() =>
                      fetchJobs(currentPage + 1)
                    }
                    className="px-4 py-2 border rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl py-16 text-center">
                <Briefcase
                  className="mx-auto mb-4 text-slate-400"
                  size={40}
                />

                <h3 className="font-bold">
                  No jobs found
                </h3>

                <p className="text-slate-500">
                  Try changing your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}