import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Send, Unplug } from "lucide-react";

import api from "../../services/axios";

interface TelegramUser {
  id?: number;
  telegram_username?: string | null;
  telegram_chat_id?: string | null;
  telegram_enabled?: boolean;
}

interface TelegramStatus {
  connected?: boolean;
  username?: string | null;
  telegram_username?: string | null;
  enabled?: boolean;
  telegram_enabled?: boolean;
}

interface TelegramSettingsProps {
  user?: TelegramUser | null;
  onUpdate?: () => void | Promise<void>;
}

export default function TelegramSettings({
  user,
  onUpdate,
}: TelegramSettingsProps) {
  const [telegramData, setTelegramData] = useState({
    username: user?.telegram_username ?? null,
    connected: Boolean(
      user?.telegram_chat_id || user?.telegram_username
    ),
    enabled: user?.telegram_enabled ?? true,
  });

  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const botUsername = "JobPulse1bot";

  useEffect(() => {
    setTelegramData({
      username: user?.telegram_username ?? null,
      connected: Boolean(
        user?.telegram_chat_id || user?.telegram_username
      ),
      enabled: user?.telegram_enabled ?? true,
    });
  }, [
    user?.telegram_username,
    user?.telegram_chat_id,
    user?.telegram_enabled,
  ]);

  useEffect(() => {
    const loadTelegramStatus = async () => {
      setStatusLoading(true);
      setError(null);

      try {
        const response = await api.get<TelegramStatus>(
          "/api/telegram/status"
        );

        const data = response.data;

        const username =
          data.username ??
          data.telegram_username ??
          user?.telegram_username ??
          null;

        const connected =
          data.connected ??
          Boolean(username || user?.telegram_chat_id);

        const enabled =
          data.enabled ??
          data.telegram_enabled ??
          user?.telegram_enabled ??
          true;

        setTelegramData({
          username,
          connected,
          enabled,
        });
      } catch (err: any) {
        // The profile data can still be used if the status endpoint
        // is unavailable.
        console.error("Failed to load Telegram status:", err);

        setTelegramData({
          username: user?.telegram_username ?? null,
          connected: Boolean(
            user?.telegram_chat_id || user?.telegram_username
          ),
          enabled: user?.telegram_enabled ?? true,
        });
      } finally {
        setStatusLoading(false);
      }
    };

    loadTelegramStatus();
  }, [
    user?.telegram_username,
    user?.telegram_chat_id,
    user?.telegram_enabled,
  ]);

  const handleDisconnect = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to disconnect your Telegram account?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.delete("/api/telegram/disconnect");

      setTelegramData({
        username: null,
        connected: false,
        enabled: false,
      });

      await onUpdate?.();
    } catch (err: any) {
      console.error("Failed to disconnect Telegram:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to disconnect Telegram. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (!user?.id) {
      setError("Your user ID is missing. Please refresh the page.");
      return;
    }

    const telegramUrl = `https://t.me/${botUsername}?start=${user.id}`;

    window.open(
      telegramUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-sky-100 p-3 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400">
            <Send className="h-6 w-6" aria-hidden="true" />
          </div>

          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              Telegram Instant Alerts
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Receive real-time job matches directly in your Telegram chat.
            </p>
          </div>
        </div>

        {statusLoading && (
          <Loader2
            className="h-5 w-5 animate-spin text-slate-400"
            aria-label="Loading Telegram status"
          />
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      <div className="mt-6 border-t border-slate-100 pt-4 dark:border-slate-700">
        {telegramData.connected && telegramData.username ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-900/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />

                <div>
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                    Telegram connected
                  </p>

                  <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-400">
                    Connected as{" "}
                    <strong>@{telegramData.username}</strong>
                  </p>

                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-500">
                    Your Telegram account is linked to JobPulse.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDisconnect}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900/60 dark:bg-slate-900 dark:hover:bg-rose-950/30"
              >
                {loading ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Unplug className="h-4 w-4" aria-hidden="true" />
                )}

                {loading ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Connect your Telegram account to receive job alerts and
              personalized recommendations.
            </p>

            <button
              type="button"
              onClick={handleConnect}
              disabled={loading || !user?.id}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              Connect Telegram Bot
            </button>

            <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
              Telegram will open in a new tab. Press Start in the bot chat to
              complete the connection.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}