import React, { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Briefcase,
  RefreshCw,
  ExternalLink,
  Calendar,
  Filter,
  Database,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import SearchBar from "../components/SearchBar";
import api from "../services/axios";

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  source: string;
  url: string;
  scraped_at: string;
  tags?: string[];
  type?: string;
  salary?: string;
  isSaved?: boolean;
}

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSource, setSelectedSource] = useState("All");

  const [listings, setListings] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const [searchKeyword] = useState("");
  const [searchLocation] = useState("");

  const [selectedSources] = useState<string[]>([]);
  const [selectedTypes] = useState<string[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const handleSearchLog = (term: string) => {
    console.log("Searching:", term);
  };

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

  const toggleSaveJob = (id: number) => {
    setListings((prev) =>
      prev.map((job) =>
        job.id === id
          ? {
              ...job,
              isSaved: !job.isSaved,
            }
          : job
      )
    );
  };

  const filteredListings = listings.filter((job) => {
    const title = job.title ?? "";
    const company = job.company ?? "";
    const location = job.location ?? "";
    const source = job.source ?? "";
    const type = job.type ?? "";

    const matchesKeyword =
      title
        .toLowerCase()
        .includes(searchKeyword.toLowerCase()) ||
      company
        .toLowerCase()
        .includes(searchKeyword.toLowerCase());

    const matchesLocation = location
      .toLowerCase()
      .includes(searchLocation.toLowerCase());

    const matchesSource =
      selectedSources.length === 0 ||
      selectedSources.includes(source);

    const matchesType =
      selectedTypes.length === 0 ||
      selectedTypes.includes(type);

    const matchesSelectedSource =
      selectedSource === "All" ||
      source === selectedSource;

    return (
      matchesKeyword &&
      matchesLocation &&
      matchesSource &&
      matchesType &&
      matchesSelectedSource
    );
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <SearchBar
        onSearch={handleSearchLog}
        placeholder="Search jobs..."
      />

      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <Database />
              <div>
                <p className="text-sm text-slate-500">
                  Total Jobs
                </p>
                <h3 className="font-bold text-xl">
                  {total}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <RefreshCw />
              <div>
                <p className="text-sm text-slate-500">
                  Scraper
                </p>
                <h3 className="font-bold">
                  Active
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <Briefcase />
              <div>
                <p className="text-sm text-slate-500">
                  Results
                </p>
                <h3 className="font-bold">
                  {filteredListings.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <div className="flex items-center gap-3">
              <Filter />
              <div>
                <p className="text-sm text-slate-500">
                  Sources
                </p>
                <h3 className="font-bold">
                  3
                </h3>
              </div>
            </div>
          </div>
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

                        {job.type && (
                          <span className="text-xs bg-blue-100 px-2 py-1 rounded">
                            {job.type}
                          </span>
                        )}

                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {job.scraped_at}
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

                      <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2"
                      >
                        Apply
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
  );
}