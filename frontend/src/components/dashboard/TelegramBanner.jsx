export default function TelegramBanner({ user }) {
  // Hide banner if already connected
  if (user?.telegram_username) return null;

  const botUsername = "@JobPulsebot1"; // Replace with your actual Telegram bot handle

  return (
    <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-2xl p-6 mb-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center space-x-4">
        <div className="bg-white/10 p-3 rounded-xl">
          <svg className="w-7 h-7 text-sky-400 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.88.03-.24.37-.49 1.02-.74 3.98-1.73 6.64-2.87 7.98-3.43 3.8-1.58 4.58-1.85 5.09-1.86.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.04.2z"/>
          </svg>
        </div>
        <div>
          <h4 className="text-base font-bold text-white">Never miss a match!</h4>
          <p className="text-sm text-sky-200">Get instant job alerts sent straight to your Telegram chat the moment they're posted.</p>
        </div>
      </div>
      
      <a
        href={`https://t.me/${botUsername}?start=${user?.id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="whitespace-nowrap px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-xl shadow transition"
      >
        Connect Now
      </a>
    </div>
  );
}