import React, { useEffect, useState, useCallback } from "react";
import {
  Bell,
  Loader2,
  Check,
  Sparkles,
  Plus,
  AlertCircle,
  Search,
} from "lucide-react";

import api from "../services/axios";
import AlertForm from "../components/alert/AlertForm";
import AlertItem from "../components/alert/AlertItem";

export interface AlertItemType {
  id: number;
  user_id: number;
  keyword: string;
  name?: string | null;
  location?: string | null;
  created_at?: string;
}

interface AlertsResponse {
  alerts?: AlertItemType[];
  message?: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 3200);
  }, []);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<AlertItemType[] | AlertsResponse>(
        "/api/alerts"
      );
      const data = response.data;

      if (Array.isArray(data)) {
        setAlerts(data);
      } else if (data && Array.isArray(data.alerts)) {
        setAlerts(data.alerts);
      } else {
        setAlerts([]);
      }
    } catch (err: any) {
      console.error("Error fetching job alerts:", err);
      setError(
        err.response?.data?.message ||
          "Could not retrieve your active job alerts."
      );
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const getAlertLabel = (alert: AlertItemType) =>
    (alert.name || alert.keyword || "").trim();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const trimmed = keyword.trim();
    if (!trimmed) return;

    const alreadyExists = alerts.some(
      (a) => getAlertLabel(a).toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) {
      setError(`You are already monitoring "${trimmed}".`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: Record<string, string> = { name: trimmed };
      if (location.trim()) {
        payload.location = location.trim();
      }

      const response = await api.post<AlertsResponse>("/api/alerts", payload);
      const updated = response.data?.alerts;

      if (Array.isArray(updated)) {
        setAlerts(updated);
      } else {
        await fetchAlerts();
      }

      setKeyword("");
      setLocation("");
      showToast(`"${trimmed}" is now being monitored.`);
    } catch (err: any) {
      console.error("Error creating job alert:", err);
      setError(
        err.response?.data?.message ||
          "Could not create job alert. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      setError(null);

      const response = await api.delete<AlertsResponse>(`/api/alerts/${id}`);
      const updated = response.data?.alerts;

      if (Array.isArray(updated)) {
        setAlerts(updated);
      } else {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }

      showToast("Alert removed.");
    } catch (err: any) {
      console.error("Error deleting job alert:", err);
      setError(
        err.response?.data?.message ||
          "Could not delete the alert. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAlerts = filter.trim()
    ? alerts.filter((a) => {
        const label = getAlertLabel(a).toLowerCase();
        const loc = (a.location || "").toLowerCase();
        const q = filter.trim().toLowerCase();
        return label.includes(q) || loc.includes(q);
      })
    : alerts;

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-3 flex flex-col items-center">
          <Loader2 className="animate-spin text-emerald-400" size={32} />
          <p className="text-sm font-medium text-slate-400">
            Loading alerts…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Ambient */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-[400px] h-[400px] bg-emerald-600/8 rounded-full blur-[100px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-0 w-[320px] h-[320px] bg-indigo-600/8 rounded-full blur-[100px]" />

      {/* Toast */}
      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 text-sm font-semibold text-white shadow-2xl shadow-emerald-950/40 animate-in fade-in"
        >
          <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check size={16} />
          </span>
          {toast}
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Header */}
        <header className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-emerald-950/30 p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 p-6 opacity-[0.07] pointer-events-none">
            <Sparkles size={100} className="text-emerald-400" />
          </div>

          <div className="relative space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
              <Bell size={12} />
              Notifications
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
                Job Alerts
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </h1>
              <p className="mt-2 text-sm text-slate-400 max-w-xl leading-relaxed">
                Track skills and keywords. When matching roles appear, your
                monitors help surface them faster.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold text-slate-300">
                <Bell size={13} className="text-emerald-400" />
                {alerts.length} active monitor{alerts.length === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-semibold text-slate-300">
                <Sparkles size={13} className="text-indigo-400" />
                Keyword tracking
              </span>
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-rose-950/40 border border-rose-800/50 text-sm text-rose-200"
          >
            <AlertCircle size={18} className="text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-400/80 hover:text-rose-300 text-lg leading-none px-1"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Create form */}
          <aside className="lg:col-span-1 space-y-5">
            <AlertForm
              keyword={keyword}
              setKeyword={setKeyword}
              location={location}
              setLocation={setLocation}
              onSubmit={handleCreate}
              isSubmitting={isSubmitting}
            />

            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/40 p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-950/70 border border-emerald-800/40 flex items-center justify-center shrink-0">
                  <Sparkles size={15} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">How it works</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                    Add keywords like React, Python, or DevOps. JobPulse watches
                    incoming listings for matches against your monitors.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Alerts list */}
          <section className="lg:col-span-2 rounded-2xl sm:rounded-3xl border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="px-5 sm:px-6 py-4 border-b border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-white">
                  Active monitors
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Skills and keywords you are tracking
                </p>
              </div>

              <div className="flex items-center gap-2">
                {alerts.length > 3 && (
                  <div className="relative">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type="search"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="Filter…"
                      className="pl-8 pr-3 py-2 w-36 sm:w-44 text-xs rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 placeholder:text-slate-600 outline-none focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/15"
                    />
                  </div>
                )}
                <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-xs font-bold tabular-nums">
                  {filteredAlerts.length}
                  {filter.trim() ? ` / ${alerts.length}` : ""}
                </span>
              </div>
            </div>

            {alerts.length === 0 ? (
              <div className="py-16 px-6 text-center space-y-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                  <Bell size={24} />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <p className="text-sm font-bold text-white">
                    No monitors yet
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Create your first alert on the left to start tracking
                    keywords and skills.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("alert-keyword-input")?.focus()
                  }
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  <Plus size={14} />
                  Add first alert
                </button>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="py-12 px-6 text-center">
                <p className="text-sm text-slate-400">
                  No monitors match “{filter}”.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-800/60">
                {filteredAlerts.map((alert) => (
                  <li key={alert.id} className="relative">
                    <AlertItem
                      alert={alert}
                      onDelete={handleDelete}
                      isDeleting={deletingId === alert.id}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
