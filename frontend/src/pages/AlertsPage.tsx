import React, { useEffect, useState } from 'react';
import {
  Bell,
  ShieldAlert,
  Loader2,
  Check,
  Sparkles,
  Layers,
  Plus,
  Trash2,
} from 'lucide-react';

import api from '../services/axios';
import AlertForm from '../components/alert/AlertForm';
import AlertItem from '../components/alert/AlertItem';

interface AlertItemType {
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newName, setNewName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  /**
   * Fetch all active alerts for the authenticated user.
   */
  const fetchAlerts = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get<AlertItemType[] | AlertsResponse>(
        '/api/alerts'
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
      console.error('Error fetching job alerts:', err);

      setError(
        err.response?.data?.message ||
          'Could not retrieve your active job alerts.'
      );

      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Show a temporary success notification.
   */
  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);

    window.setTimeout(() => {
      setShowToast(false);
    }, 3500);
  };

  /**
   * Create a new skill/job alert.
   *
   * The profile page treats skills as strings, so alerts use
   * the same normalized representation.
   */
  const handleCreateSkill = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    const trimmedName = newName.trim();

    if (!trimmedName) {
      return;
    }

    /**
     * Prevent duplicate alerts locally.
     */
    const alreadyExists = alerts.some((alert) => {
      const existingName = (
        alert.name ||
        alert.keyword ||
        ''
      )
        .trim()
        .toLowerCase();

      return existingName === trimmedName.toLowerCase();
    });

    if (alreadyExists) {
      setError(`You are already monitoring "${trimmedName}".`);
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await api.post<AlertsResponse>(
        '/api/alerts',
        {
          name: trimmedName,
        }
      );

      const updatedAlerts = response.data?.alerts;

      if (Array.isArray(updatedAlerts)) {
        setAlerts(updatedAlerts);
      } else {
        /**
         * Some backend responses only return the created alert/message.
         * Refresh the registry in that case.
         */
        await fetchAlerts();
      }

      setNewName('');

      showSuccessToast(
        `"${trimmedName}" is now being monitored.`
      );
    } catch (err: any) {
      console.error('Error creating job alert:', err);

      setError(
        err.response?.data?.message ||
          'Could not create job alert. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Delete an alert.
   *
   * Important:
   * The backend currently returns HTTP 200 but may not return
   * the complete updated alert list. Therefore we optimistically
   * remove the item from local state after a successful DELETE.
   */
  const handleDeleteAlert = async (id: number): Promise<void> => {
    try {
      setDeletingId(id);
      setError(null);

      const response = await api.delete<AlertsResponse>(
        `/api/alerts/${id}`
      );

      console.log('Delete response:', response.data);

      const updatedAlerts = response.data?.alerts;

      if (Array.isArray(updatedAlerts)) {
        setAlerts(updatedAlerts);
      } else {
        setAlerts((previousAlerts) =>
          previousAlerts.filter((alert) => alert.id !== id)
        );
      }

      showSuccessToast('Alert monitor removed.');
    } catch (err: any) {
      console.error(
        'Error deleting job alert:',
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.message ||
          'Could not delete the alert. Please try again.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Keep compatibility with any existing AlertItem usage.
   */
  const handleDeleteSkill = handleDeleteAlert;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center w-full">
        <div className="text-center space-y-4 flex flex-col items-center">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Loader2
                className="animate-spin text-emerald-400"
                size={25}
              />
            </div>

            <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 blur-xl" />
          </div>

          <p className="text-sm font-semibold text-slate-400">
            Loading your monitoring suite...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-emerald-900 selection:text-white w-full relative overflow-hidden">

      {/* Ambient background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-8 relative z-10">

        {/* Toast */}
        {showToast && (
          <div className="fixed bottom-6 right-6 bg-slate-900/95 backdrop-blur-xl border border-emerald-500/30 text-white px-5 py-4 rounded-2xl shadow-2xl shadow-emerald-950/50 flex items-center gap-3 text-sm font-semibold z-50">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Check size={17} />
            </div>

            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-emerald-950/30 backdrop-blur-2xl rounded-3xl p-8 border border-slate-800/80 shadow-2xl">

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(16,185,129,0.10),transparent_35%)] pointer-events-none" />

          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles
              size={120}
              className="text-emerald-400"
            />
          </div>

          <div className="relative z-10 space-y-4">

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 text-xs font-black tracking-wide uppercase">
              <Layers size={13} />
              Active System
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
                <Bell
                  size={30}
                  className="text-emerald-400"
                />
                Job Alerts & Skill Monitors
              </h1>

              <p className="text-sm text-slate-400 max-w-2xl mt-3 leading-relaxed font-medium">
                Monitor the technologies and skills you care about.
                JobPulse can use these monitors to keep you informed
                when matching opportunities enter the system.
              </p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 pt-2">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/60 border border-slate-800">
                <Bell
                  size={15}
                  className="text-emerald-400"
                />

                <span className="text-xs font-bold text-slate-300">
                  {alerts.length} Active Monitor
                  {alerts.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-950/60 border border-slate-800">
                <Sparkles
                  size={15}
                  className="text-emerald-400"
                />

                <span className="text-xs font-bold text-slate-300">
                  Personalized Tracking
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-rose-950/50 border border-rose-900/60 text-rose-300 rounded-2xl text-sm font-semibold flex items-center gap-3 shadow-xl backdrop-blur-xl">

            <ShieldAlert
              size={18}
              className="text-rose-400 shrink-0"
            />

            <span className="flex-1">
              {error}
            </span>

            <button
              type="button"
              onClick={() => setError(null)}
              className="text-rose-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full">

          {/* Create monitor */}
          <div className="lg:col-span-1">

            <div className="bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden">

              <div className="px-6 pt-6 pb-4 border-b border-slate-800/80">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center">
                    <Plus
                      size={19}
                      className="text-emerald-400"
                    />
                  </div>

                  <div>
                    <h2 className="text-sm font-black text-white">
                      Add Skill Monitor
                    </h2>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Track a technology or keyword
                    </p>
                  </div>

                </div>
              </div>

              <div className="p-6">
                <AlertForm
                  newName={newName}
                  setNewName={setNewName}
                  onSubmit={handleCreateSkill}
                  isSubmitting={isSubmitting}
                />
              </div>

            </div>

            {/* Helpful explanation */}
            <div className="mt-6 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-800/60 p-6">

              <div className="flex items-start gap-3">

                <div className="w-9 h-9 rounded-xl bg-emerald-950/70 border border-emerald-800/50 flex items-center justify-center shrink-0">
                  <Sparkles
                    size={16}
                    className="text-emerald-400"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-black text-white">
                    How it works
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed mt-2">
                    Add technologies such as React, Python,
                    PostgreSQL, Node.js, or Laravel. JobPulse
                    monitors incoming listings for these keywords.
                  </p>
                </div>

              </div>
            </div>

          </div>

          {/* Active monitors */}
          <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden">

            {/* List header */}
            <div className="px-6 py-5 border-b border-slate-800/80 bg-slate-900/40 flex justify-between items-center">

              <div>

                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Bell
                    size={16}
                    className="text-emerald-400"
                  />

                  Active Monitors
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  Skills and keywords you're currently tracking.
                </p>

              </div>

              <span className="px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-800/50 text-emerald-300 text-xs font-black">
                {alerts.length}
              </span>

            </div>

            {/* Empty state */}
            {alerts.length === 0 ? (

              <div className="py-20 px-6 text-center space-y-5">

                <div className="w-16 h-16 bg-slate-950 text-slate-500 rounded-2xl flex items-center justify-center mx-auto border border-slate-800 shadow-inner">
                  <Bell size={27} />
                </div>

                <div className="space-y-2 max-w-sm mx-auto">

                  <p className="text-sm font-black text-white">
                    No skill monitors yet
                  </p>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Add a technology or job keyword on the left
                    to start monitoring new opportunities.
                  </p>

                </div>

              </div>

            ) : (

              <div className="divide-y divide-slate-800/60">

                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="relative"
                  >
                    <AlertItem
                      skill={alert}
                      onDelete={handleDeleteAlert}
                    />

                    {deletingId === alert.id && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-10">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-xl">
                          <Loader2
                            size={15}
                            className="animate-spin text-emerald-400"
                          />

                          <span className="text-xs font-bold text-slate-300">
                            Removing monitor...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
