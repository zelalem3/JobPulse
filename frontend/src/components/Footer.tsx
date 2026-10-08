
import React from "react";
import { Heart, ShieldCheck } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 font-sans border-t border-slate-800/80 relative overflow-hidden">

      {/* Background ambient lighting accents */}
      <div className="absolute top-0 right-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative z-10">

        {/* Top Section: Brand Info */}
        <div className="pb-16 border-b border-slate-800/80">

          <div className="max-w-xl space-y-5">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl font-black text-white tracking-tight flex items-center gap-1.5">
                job<span className="text-indigo-400">Pulse</span>
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              </span>
            </div>

            <p className="text-sm leading-relaxed text-slate-400 font-medium max-w-lg">
              Discover relevant opportunities, save jobs you're interested in,
              track your applications, and stay updated with personalized job alerts.
            </p>

            {/* Social Icons */}
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://github.com/zelalem3/JobPulse"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all shadow-sm"
                aria-label="GitHub"
              >
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-center text-slate-400 hover:text-white hover:border-indigo-500/40 hover:bg-indigo-500/10 transition-all shadow-sm"
                aria-label="LinkedIn"
              >
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 py-16 border-b border-slate-800/80 text-sm">

          {/* App */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">
              JobPulse
            </h4>

            <ul className="space-y-3 font-medium">
              <li>
                <a
                  href="/jobs"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Browse Jobs
                </a>
              </li>

              <li>
                <a
                  href="/dashboard"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Dashboard
                </a>
              </li>

              <li>
                <a
                  href="/alerts"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Job Alerts
                </a>
              </li>
            </ul>
          </div>

          {/* Job Seekers */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">
              Job Seekers
            </h4>

            <ul className="space-y-3 font-medium">
              <li>
                <a
                  href="/saved"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Saved Jobs
                </a>
              </li>

              <li>
                <a
                  href="/profile"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Profile
                </a>
              </li>

              <li>
                <a
                  href="/alerts"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Personalized Alerts
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="text-white font-bold tracking-wider uppercase text-xs">
              Company
            </h4>

            <ul className="space-y-3 font-medium">
              <li>
                <a
                  href="/contact"
                  className="hover:text-indigo-400 transition-colors"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-medium text-slate-500 gap-4">

          <p className="flex items-center gap-1.5">
            &copy; {new Date().getFullYear()} JobPulse. All rights reserved.
            <span className="hidden sm:inline">Built with</span>
            <Heart
              size={12}
              className="text-rose-500 fill-rose-500"
            />
          </p>

          <div className="flex flex-wrap items-center space-x-6">
            <a
              href="/privacy"
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </a>

            <a
              href="/terms"
              className="hover:text-slate-300 transition-colors"
            >
              Terms of Service
            </a>

            <a
              href="/security"
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              <ShieldCheck
                size={13}
                className="text-indigo-400"
              />
              Security
            </a>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
