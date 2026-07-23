import React from 'react';
import { Search, ArrowLeft, Home, HelpCircle } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-slate-800 selection:text-white">
      <div className="max-w-md w-full text-center space-y-8 bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-800/80 shadow-xl">
        
        {/* --- VISUAL GRAPHIC HUB --- */}
        <div className="relative w-32 h-32 mx-auto flex items-center justify-center bg-slate-950 text-slate-300 rounded-3xl border border-slate-800 shadow-inner">
          <span className="text-5xl font-black tracking-tight select-none">4</span>
          <div className="w-10 h-10 bg-slate-800 border-4 border-slate-950 text-slate-100 rounded-2xl shadow-xl flex items-center justify-center animate-bounce duration-1000">
            <Search size={18} className="stroke-[2.5]" />
          </div>
          <span className="text-5xl font-black tracking-tight select-none">4</span>
        </div>

        {/* --- COPY / MESSAGE SECTION --- */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-white tracking-tight sm:text-3xl">
            Listing Not Located
          </h1>
          <p className="text-sm font-semibold text-slate-400 leading-relaxed max-w-xs mx-auto">
            The page or job post you are chasing down has been archived, removed, or never synced into our PostgreSQL index.
          </p>
        </div>

        {/* --- ACTION NAVIGATION CONTROLS --- */}
        <div className="flex flex-col gap-2.5 pt-2">
          <a
            href="/"
            className="w-full px-5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-white font-bold rounded-2xl text-sm transition shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Home size={16} /> Return Home
          </a>
          
          <button
            onClick={() => window.history.back()}
            className="w-full px-5 py-3 bg-slate-950 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-slate-800 rounded-2xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <ArrowLeft size={16} /> Back to Prev Page
          </button>
        </div>

        {/* --- FOOTER COMPONENT METADATA --- */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
          <HelpCircle size={14} className="text-slate-500" /> Ref: <code className="text-slate-300">HTTP_STATUS_404_ROUTE</code>
        </div>

      </div>
    </div>
  );
}