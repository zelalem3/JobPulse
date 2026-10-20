
import React, { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  Bell,
  Check,
  Clock3,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
  X,
  Zap,
} from "lucide-react";

import Spinner from "../components/Spinner";
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
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = window.setTimeout(() => {
      setToast(null);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [toast]);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<
        AlertItemType[] | AlertsResponse
      >("/api/alerts");

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
          "We couldn't load your alerts. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAlerts();
  }, [fetchAlerts]);

  const getAlertLabel = (alert: AlertItemType) =>
    (alert.name || alert.keyword || "").trim();

  const handleCreate = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmed = keyword.trim();

    if (!trimmed || isSubmitting) return;

    const alreadyExists = alerts.some(
      (alert) =>
        getAlertLabel(alert).toLowerCase() ===
          trimmed.toLowerCase() &&
        (alert.location || "").trim().toLowerCase() ===
          location.trim().toLowerCase()
    );

    if (alreadyExists) {
      setError(
        `You're already monitoring "${trimmed}" for this location.`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: Record<string, string> = {
        name: trimmed,
      };

      if (location.trim()) {
        payload.location = location.trim();
      }

      const response = await api.post<AlertsResponse>(
        "/api/alerts",
        payload
      );

      const updated = response.data?.alerts;

      if (Array.isArray(updated)) {
        setAlerts(updated);
      } else {
        await fetchAlerts();
      }

      setKeyword("");
      setLocation("");
      showToast(`"${trimmed}" alert created successfully.`);
    } catch (err: any) {
      console.error("Error creating job alert:", err);

      setError(
        err.response?.data?.message ||
          "Couldn't create your alert. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (deletingId !== null) return;

    try {
      setDeletingId(id);
      setError(null);

      const response = await api.delete<AlertsResponse>(
        `/api/alerts/${id}`
      );

      const updated = response.data?.alerts;

      if (Array.isArray(updated)) {
        setAlerts(updated);
      } else {
        setAlerts((prev) =>
          prev.filter((alert) => alert.id !== id)
        );
      }

      showToast("Alert removed successfully.");
    } catch (err: any) {
      console.error("Error deleting job alert:", err);

      setError(
        err.response?.data?.message ||
          "Couldn't remove the alert. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const filteredAlerts = filter.trim()
    ? alerts.filter((alert) => {
        const query = filter.trim().toLowerCase();

        return (
          getAlertLabel(alert).toLowerCase().includes(query) ||
          (alert.location || "").toLowerCase().includes(query)
        );
      })
    : alerts;

  if (loading) {
    return (
      <div className="min-h-[65vh] bg-slate-950 flex flex-col items-center justify-center gap-4 text-slate-400">
        <Spinner size="lg" label="Loading your alerts..." />
        <p className="text-sm">Preparing your monitoring dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Background accents */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-52 left-1/3 h-[440px] w-[440px] rounded-full bg-indigo-600/[0.08] blur-[130px]" />
        <div className="absolute top-[40%] -right-52 h-[420px] w-[420px] rounded-full bg-violet-600/[0.05] blur-[130px]" />
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex max-w-[calc(100vw-2.5rem)] items-center gap-3 rounded-2xl border border-emerald-500/20 bg-slate-900 px-4 py-3.5 shadow-2xl shadow-black/30 animate-in slide-in-from-bottom-3 fade-in duration-200"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <Check size={16} className="text-emerald-400" />
          </div>
          <p className="text-sm font-medium text-slate-100">{toast}</p>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="ml-2 rounded-lg p-1 text-slate-500 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Page heading */}
        <header className="mb-8">
          <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-indigo-400/20 bg-indigo-500/10">
              <Bell size={14} />
            </span>
            JobPulse / Alerts
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Job alerts
                <span className="text-indigo-400">.</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Keep track of opportunities that match your goals.
                Choose your keywords and locations, then manage your
                alerts from one place.
              </p>
            </div>

            <a
              href="#create-alert"
              className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-slate-950"
            >
              <Plus size={17} />
              Create an alert
              <ArrowRight size={15} />
            </a>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/[0.07] p-4"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-rose-400"
            />
            <p className="flex-1 text-sm leading-6 text-rose-200">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss error"
              className="rounded-md p-1 text-rose-300 transition hover:bg-rose-500/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Overview stats */}
        <section
          aria-label="Alert overview"
          className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total alerts</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <Bell size={17} />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-white">
              {alerts.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {alerts.length === 1 ? "Saved monitor" : "Saved monitors"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Keywords tracked</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <Target size={17} />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-white">
              {new Set(
                alerts.map((alert) =>
                  getAlertLabel(alert).toLowerCase()
                )
              ).size}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Unique search terms
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Locations</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Activity size={17} />
              </span>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-white">
              {
                new Set(
                  alerts
                    .map((alert) =>
                      (alert.location || "").trim().toLowerCase()
                    )
                    .filter(Boolean)
                ).size
              }
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Distinct specified locations
            </p>
          </div>
        </section>

        {/* Main content */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[350px_minmax(0,1fr)]">
          {/* Create alert sidebar */}
          <aside id="create-alert" className="space-y-4 scroll-mt-6">
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-black/10">
              <div className="border-b border-slate-800 px-5 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Plus size={19} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">
                      Create a monitor
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Define your next opportunity
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <AlertForm
                  keyword={keyword}
                  setKeyword={setKeyword}
                  location={location}
                  setLocation={setLocation}
                  onSubmit={handleCreate}
                  isSubmitting={isSubmitting}
                />

                <div className="mt-5 flex items-start gap-3 rounded-xl border border-indigo-400/10 bg-indigo-500/[0.05] p-3.5">
                  <Sparkles
                    size={16}
                    className="mt-0.5 shrink-0 text-indigo-400"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-200">
                      Make your search specific
                    </p>
                    <p className="mt-1.5 text-xs leading-5 text-slate-500">
                      Try React Developer, Python, Backend Engineer,
                      or PostgreSQL. Add a location to narrow your
                      search when needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                  <Clock3 size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Stay prepared
                  </h3>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    Keep your alerts focused on roles you actually
                    want. Review your list regularly and remove
                    searches that are no longer relevant.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Alert list */}
          <section
            aria-labelledby="monitors-heading"
            className="min-w-0 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl shadow-black/10"
          >
            <div className="border-b border-slate-800 p-5 sm:p-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2
                      id="monitors-heading"
                      className="text-lg font-semibold text-white"
                    >
                      Your monitors
                    </h2>
                    <span className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs font-medium tabular-nums text-slate-300">
                      {alerts.length}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-500">
                    Manage the searches you have saved.
                  </p>
                </div>

                {alerts.length > 0 && (
                  <div className="relative w-full sm:max-w-[240px]">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      type="search"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="Search alerts..."
                      aria-label="Search alerts by keyword or location"
                      className="w-full rounded-xl border border-slate-700/80 bg-slate-950/70 py-2.5 pl-9 pr-9 text-sm text-slate-200 outline-none transition placeholder:text-slate-600 hover:border-slate-600 focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/10"
                    />
                    {filter && (
                      <button
                        type="button"
                        onClick={() => setFilter("")}
                        aria-label="Clear search"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-white"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {alerts.length === 0 ? (
              <div className="px-6 py-16 text-center sm:py-20">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-800/70 text-indigo-400">
                  <Bell size={26} strokeWidth={1.6} />
                </div>
                <h3 className="mt-5 text-base font-semibold text-white">
                  Your watchlist starts here
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                  Add a keyword or job title to start building a
                  personalized list of opportunities.
                </p>
                <a
                  href="#create-alert"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-indigo-400/20 bg-indigo-500/10 px-4 py-2.5 text-sm font-medium text-indigo-300 transition hover:border-indigo-400/40 hover:bg-indigo-500/15"
                >
                  <Plus size={16} />
                  Create your first alert
                </a>
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
                  <Search size={21} />
                </div>
                <h3 className="mt-4 font-semibold text-slate-200">
                  No matching alerts
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Try a different keyword or location.
                </p>
                <button
                  type="button"
                  onClick={() => setFilter("")}
                  className="mt-4 text-sm font-medium text-indigo-400 transition hover:text-indigo-300"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {filteredAlerts.map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    onDelete={handleDelete}
                    isDeleting={deletingId === alert.id}
                  />
                ))}
              </div>
            )}

            {alerts.length > 0 && (
              <footer className="flex flex-col gap-2 border-t border-slate-800 bg-slate-950/30 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-300">
                    {filteredAlerts.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-slate-300">
                    {alerts.length}
                  </span>{" "}
                  alerts
                </p>

                <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Saved monitors
                </span>
              </footer>
            )}
          </section>
        </div>

        {/* Closing note */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/30 px-4 py-4 sm:items-center sm:px-5">
          <Zap size={17} className="mt-0.5 shrink-0 text-indigo-400 sm:mt-0" />
          <p className="text-xs leading-5 text-slate-500">
            <span className="font-medium text-slate-300">
              Your next opportunity starts with a focused search.
            </span>{" "}
            Create alerts for the technologies and roles you want to
            explore.
          </p>
        </div>
      </main>
    </div>
  );
}
