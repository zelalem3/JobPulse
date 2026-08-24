import React, { useEffect, useState } from "react";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../services/axios";

export default function SavedJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  const fetchJobs = async (page: number) => {
    try {
      setLoading(true);
      // Request only 15 items for the current page
      const response = await api.get(`/api/job-listings?page=${page}&per_page=15`);
      
      setJobs(response.data.data); // Laravel pagination items
      setCurrentPage(response.data.current_page);
      setLastPage(response.data.last_page);
    } catch (err) {
      console.error("Error fetching paginated jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Saved Jobs</h3>
        <span className="text-xs text-slate-400">Page {currentPage} of {lastPage}</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-emerald-400" size={24} />
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
              <div>
                <h4 className="font-medium text-white">{job.title}</h4>
                <p className="text-sm text-slate-400">{job.company} • {job.location || "N/A"}</p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/50 rounded-full">
                {job.salary || "Negotiable"}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex justify-between items-center pt-4 border-t border-slate-800">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1 || loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-sm rounded transition"
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, lastPage))}
          disabled={currentPage === lastPage || loading}
          className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white text-sm rounded transition"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}