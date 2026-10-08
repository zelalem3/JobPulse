import React, { useEffect, useState, useCallback } from "react";
import {
  Bell,
  Loader2,
  Check,
  Sparkles,
  Plus,
  AlertCircle,
  Search,
  Activity,
  ArrowRight,
  Zap,
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

    window.setTimeout(() => {
      setToast(null);
    }, 3200);
  }, []);

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

  const handleCreate = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const trimmed = keyword.trim();

    if (!trimmed) {
      return;
    }

    const alreadyExists = alerts.some(
      (alert) =>
        getAlertLabel(alert).toLowerCase() ===
        trimmed.toLowerCase()
    );

    if (alreadyExists) {
      setError(
        `You are already monitoring "${trimmed}".`
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

      showToast(
        `"${trimmed}" is now being monitored.`
      );
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
    ? alerts.filter((alert) => {
        const label =
          getAlertLabel(alert).toLowerCase();

        const loc =
          (alert.location || "").toLowerCase();

        const q = filter.trim().toLowerCase();

        return (
          label.includes(q) ||
          loc.includes(q)
        );
      })
    : alerts;

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-slate-950 text-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-xl animate-pulse" />

            <div className="relative w-12 h-12 rounded-2xl bg-slate-900 border border-indigo-500/20 flex items-center justify-center">
              <Loader2
                size={22}
                className="animate-spin text-indigo-400"
              />
            </div>
          </div>

          <p className="text-sm font-medium text-slate-400">
            Loading your monitors...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">

      {/* Ambient background */}
      <div className="pointer-events-none absolute -top-40 left-1/3 w-[600px] h-[600px] rounded-full bg-indigo-600/[0.08] blur-[130px]" />

      <div className="pointer-events-none absolute top-[35%] -right-40 w-[500px] h-[500px] rounded-full bg-violet-600/[0.06] blur-[130px]" />

      <div className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-500/[0.04] blur-[120px]" />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 fade-in duration-300">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 shadow-2xl shadow-black/40">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <Check
                size={15}
                className="text-indigo-400"
              />
            </div>

            <span className="text-sm font-semibold text-white">
              {toast}
            </span>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Hero */}
        <header className="relative overflow-hidden rounded-[28px] border border-slate-800/80 bg-slate-900/70 backdrop-blur-xl shadow-2xl">

          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative p-6 sm:p-8 lg:p-10">

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">

              <div className="max-w-2xl">

                {/* Status */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold uppercase tracking-wider">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400" />
                  </span>

                  Job monitoring
                </div>

                <h1 className="mt-5 text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                  Never miss the
                  <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                    right opportunity.
                  </span>
                </h1>

                <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
                  Create monitors for the skills, technologies,
                  roles, and locations you care about. JobPulse
                  watches incoming listings so you can focus on
                  applying.
                </p>
              </div>

              {/* Stats */}
              <div className="flex gap-3">

                <div className="min-w-[125px] rounded-2xl bg-slate-950/70 border border-slate-800/80 px-4 py-4">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                    <Activity
                      size={13}
                      className="text-indigo-400"
                    />
                    Active
                  </div>

                  <p className="mt-2 text-2xl font-black text-white">
                    {alerts.length}
                  </p>

                  <p className="text-[11px] text-slate-600 mt-0.5">
                    active monitor
                    {alerts.length === 1
                      ? ""
                      : "s"}
                  </p>
                </div>

                <div className="hidden sm:block min-w-[125px] rounded-2xl bg-slate-950/70 border border-slate-800/80 px-4 py-4">
                  <div className="flex items-center gap-2 text-slate-500 text-[11px] font-semibold uppercase tracking-wider">
                    <Zap
                      size={13}
                      className="text-violet-400"
                    />
                    Tracking
                  </div>

                  <p className="mt-2 text-2xl font-black text-white">
                    Live
                  </p>

                  <p className="text-[11px] text-slate-600 mt-0.5">
                    keyword matching
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 p-4 rounded-2xl bg-rose-950/30 border border-rose-900/50"
          >
            <AlertCircle
              size={18}
              className="text-rose-400 shrink-0 mt-0.5"
            />

            <p className="flex-1 text-sm text-rose-200">
              {error}
            </p>

            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-rose-200 text-lg leading-none"
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">

          {/* Create */}
          <div className="space-y-4">

            <AlertForm
              keyword={keyword}
              setKeyword={setKeyword}
              location={location}
              setLocation={setLocation}
              onSubmit={handleCreate}
              isSubmitting={isSubmitting}
            />

            {/* Small explanation */}
            <div className="rounded-2xl border border-slate-800/70 bg-slate-900/40 backdrop-blur-xl p-5">
              <div className="flex gap-3">

                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/15 flex items-center justify-center shrink-0">
                  <Sparkles
                    size={15}
                    className="text-indigo-400"
                  />
                </div>

                <div>
                  <p className="text-xs font-bold text-white">
                    Build your watchlist
                  </p>

                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    Try specific technologies such as
                    React, Python, Laravel, or PostgreSQL,
                    or broader roles such as Backend
                    Developer.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Monitor list */}
          <section className="min-w-0">

            <div className="rounded-[24px] border border-slate-800/70 bg-slate-900/60 backdrop-blur-xl shadow-xl overflow-hidden">

              {/* List header */}
              <div className="px-5 sm:px-6 py-5 border-b border-slate-800/70">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                  <div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        <Bell
                          size={15}
                          className="text-indigo-400"
                        />
                      </div>

                      <h2 className="text-sm font-bold text-white">
                        Your monitors
                      </h2>
                    </div>

                    <p className="text-xs text-slate-500 mt-2">
                      {alerts.length === 0
                        ? "Nothing is being tracked yet."
                        : "Keywords JobPulse is watching for you."}
                    </p>
                  </div>

                  {alerts.length > 3 && (
                    <div className="relative">
                      <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                      />

                      <input
                        type="search"
                        value={filter}
                        onChange={(e) =>
                          setFilter(
                            e.target.value
                          )
                        }
                        placeholder="Filter monitors"
                        className="pl-9 pr-3 py-2.5 w-full sm:w-48 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/40 focus:ring-2 focus:ring-indigo-500/10 transition"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Empty */}
              {alerts.length === 0 ? (
                <div className="relative py-20 px-6 text-center overflow-hidden">

                  <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/[0.03] to-transparent" />

                  <div className="relative">

                    <div className="relative w-20 h-20 mx-auto">
                      <div className="absolute inset-0 rounded-3xl bg-indigo-500/10 blur-xl" />

                      <div className="relative w-20 h-20 rounded-3xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                        <Bell
                          size={28}
                          className="text-indigo-400"
                        />
                      </div>
                    </div>

                    <h3 className="mt-6 text-base font-bold text-white">
                      Your opportunity radar is empty
                    </h3>

                    <p className="mt-2 max-w-sm mx-auto text-xs sm:text-sm text-slate-500 leading-relaxed">
                      Create a monitor for something you want
                      to work with and JobPulse will keep it
                      on your radar.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        document
                          .getElementById(
                            "alert-keyword-input"
                          )
                          ?.focus()
                      }
                      className="mt-6 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-950/30 transition-all hover:-translate-y-0.5"
                    >
                      <Plus size={14} />
                      Create your first monitor
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ) : filteredAlerts.length === 0 ? (
                <div className="py-16 px-6 text-center">
                  <Search
                    size={22}
                    className="mx-auto text-slate-600"
                  />

                  <p className="mt-3 text-sm font-semibold text-slate-300">
                    No matching monitors
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Try another keyword.
                  </p>
                </div>
              ) : (
                <div className="p-3 sm:p-4 space-y-2">
                  {filteredAlerts.map(
                    (alert) => (
                      <AlertItem
                        key={alert.id}
                        alert={alert}
                        onDelete={handleDelete}
                        isDeleting={
                          deletingId ===
                          alert.id
                        }
                      />
                    )
                  )}
                </div>
              )}

              {/* Footer */}
              {alerts.length > 0 && (
                <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-950/20">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">
                      {filteredAlerts.length} of{" "}
                      {alerts.length} monitors
                    </span>

                    <span className="flex items-center gap-1.5 text-indigo-400/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                      Monitoring
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

