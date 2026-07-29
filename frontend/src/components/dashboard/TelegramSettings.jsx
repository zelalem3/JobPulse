import { useState,  } from 'react';

export default function TelegramSettings({ user, onUpdate }) {
  const [telegramData, setTelegramData] = useState({
    username: user?.telegram_username || null,
    enabled: user?.telegram_enabled ?? true,
  });
  const [loading, setLoading] = useState(false);

  const botUsername = "JobPulseBot"; // Replace with your actual Telegram bot handle

  const handleToggle = async () => {
    const newStatus = !telegramData.enabled;
    setLoading(true);
    try {
      const res = await fetch('/api/user/telegram-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ telegram_enabled: newStatus }),
      });
      if (res.ok) {
        setTelegramData(prev => ({ ...prev, enabled: newStatus }));
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Failed to update Telegram setting', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Telegram account?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/user/telegram-disconnect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.ok) {
        setTelegramData({ username: null, enabled: false });
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Failed to disconnect Telegram', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-sky-100 text-sky-600 p-3 rounded-lg">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.98-1.73 6.64-2.87 7.98-3.43 3.8-1.58 4.58-1.85 5.09-1.86.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.04.2z"/>
            </svg>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Telegram Instant Alerts</h3>
            <p className="text-sm text-slate-500">Receive real-time job matches straight to your chat.</p>
          </div>
        </div>

        {telegramData.username && (
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={telegramData.enabled} 
              onChange={handleToggle}
              disabled={loading}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
            <span className="ml-3 text-sm font-medium text-slate-700">
              {telegramData.enabled ? 'Active' : 'Paused'}
            </span>
          </label>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        {telegramData.username ? (
          <div className="flex items-center justify-between bg-emerald-50 px-4 py-3 rounded-lg border border-emerald-200">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-emerald-900">
                Connected as <strong className="font-bold">@{telegramData.username}</strong>
              </span>
            </div>
            <button 
              onClick={handleDisconnect}
              disabled={loading}
              className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <a
            href={`https://t.me/${botUsername}?start=${user?.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg shadow-sm transition"
          >
            Connect Telegram Bot
          </a>
        )}
      </div>
    </div>
  );
}