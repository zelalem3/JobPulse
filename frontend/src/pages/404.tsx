import React from 'react';
import { Search, ArrowLeft, Home, HelpCircle } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-100 shadow-sm">
        
        {/* --- VISUAL GRAPHIC HUB --- */}
        <div className="relative w-32 h-32 mx-auto flex items-center justify-center bg-blue-50 text-blue-600 rounded-2xl border border-blue-100/60 shadow-inner">
          <span className="text-5xl font-black tracking-tight select-none">4</span>
          <div className="w-10 h-10 bg-slate-900 border-4 border-white text-white rounded-xl shadow flex items-center justify-center animate-bounce duration-1000">
            <Search size={18} className="stroke-[2.5]" />
          </div>
          <span className="text-5xl font-black tracking-tight select-none">4</span>
        </div>

        {/* --- COPY / MESSAGE SECTION --- */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Listing Not Located
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
            The page or job post you are chasing down has been archived, removed, or never synced into our PostgreSQL index.
          </p>
        </div>

        {/* --- ACTION NAVIGATION CONTROLS --- */}
        <div className="flex flex-col gap-2.5 pt-2">
          <a
            href="/"
            className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 group"
          >
            <Home size={16} /> Return Home
          </a>
          
          <button
            onClick={() => window.history.back()}
            className="w-full px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Prev Page
          </button>
        </div>

        {/* --- FOOTER COMPONENT METADATA --- */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium">
          <HelpCircle size={14} /> Ref: <code>HTTP_STATUS_404_ROUTE</code>
        </div>

      </div>
    </div>
  );
}