import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 font-sans border-t border-slate-800/80 relative overflow-hidden">
      
      {/* Background ambient lighting accents */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">
        
        {/* Top Section: Brand Info & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-16 border-b border-slate-800/80">
          
          {/* Brand Info */}
          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                job<span className="text-indigo-400">Pulse</span>
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              </span>
            </div>
            <p className="text-sm max-w-sm leading-relaxed text-slate-400 font-medium">
              Connecting ambitious talent with forward-thinking companies instantly. Real-time tracking, seamless applications, and smart hiring workflows.
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a href="#" className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all shadow-sm" aria-label="Twitter">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all shadow-sm" aria-label="LinkedIn">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all shadow-sm" aria-label="GitHub">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>

          {/* Newsletter Box */}
          <div className="lg:col-span-7 flex flex-col justify-center bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-8 rounded-3xl shadow-xl">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles size={14} /> Stay ahead of the hiring curve
            </div>
            <h3 className="text-white font-bold text-base mb-1">Get curated job insights & remote roles</h3>
            <p className="text-sm mb-5 text-slate-400">Salary trends and high-paying matching positions straight to your inbox weekly.</p>
            
            <form className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your work email..." 
                required 
                className="bg-slate-950/80 border border-slate-800 text-white px-4 py-3 rounded-2xl text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 flex-grow font-medium placeholder:text-slate-600 transition-all shadow-inner" 
              />
              <button 
                type="submit" 
                className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-2xl text-sm transition-all shadow-lg shadow-indigo-950/50 cursor-pointer inline-flex items-center justify-center gap-2 border border-indigo-500/30 shrink-0"
              >
                <span>Subscribe</span>
                <ArrowRight size={16} />
              </button>
            </form>
          </div>

        </div>

        {/* Middle Section: Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-16 border-b border-slate-800/80 text-sm">
          
          {/* Col 1: Product */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">Product</h4>
            <ul className="space-y-3 font-medium">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Enterprise</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">What's New</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Integrations</a></li>
            </ul>
          </div>

          {/* Col 2: Job Seekers */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">Job Seekers</h4>
            <ul className="space-y-3 font-medium">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Browse Jobs</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Salary Calculator</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Resume Builder</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Career Advice</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Remote Hub</a></li>
            </ul>
          </div>

          {/* Col 3: Employers */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">Employers</h4>
            <ul className="space-y-3 font-medium">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Post a Job</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Talent Solutions</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Recruiter Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Success Stories</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Recruiter Portal</a></li>
            </ul>
          </div>

          {/* Col 4: Company */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">Company</h4>
            <ul className="space-y-3 font-medium">
              <li><a href="#" className="hover:text-indigo-400 transition-colors">About Us</a></li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5">
                  Careers 
                  <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] px-2 py-0.5 rounded-full font-bold">
                    We're hiring
                  </span>
                </a>
              </li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Press Kit</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-indigo-400 transition-colors">Partners</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-medium text-slate-500 gap-4">
          <p className="flex items-center gap-1.5">
            &copy; {new Date().getFullYear()} JobPulse, Inc. All rights reserved. Built with <Heart size={12} className="text-rose-500 fill-rose-500" /> for tech talent.
          </p>
          <div className="flex flex-wrap items-center space-x-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-300 transition-colors flex items-center gap-1">
              <ShieldCheck size={13} className="text-indigo-400" /> Security
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">Cookies</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;