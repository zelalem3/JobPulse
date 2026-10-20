import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Heart, MapPin, Sparkles } from "lucide-react";

const footerGroups = [
  {
    title: "Explore",
    links: [
      { label: "Browse jobs", to: "/jobs" },
      { label: "Recommendations", to: "/recommendations" },
      { label: "Saved jobs", to: "/saved" },
    ],
  },
  {
    title: "Your career",
    links: [
      { label: "Job alerts", to: "/alerts" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Your profile", to: "/profile" },
    ],
  },
  {
    title: "JobPulse",
    links: [
      { label: "About us", to: "/about" },
      { label: "Contact us", to: "/contact" },
    ],
  },
];

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden border-t border-white/[0.07] bg-[#080d16] font-sans text-slate-400">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-36 -z-10 h-96 w-96 rounded-full bg-emerald-400/[0.07] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-[15%] -z-10 h-96 w-96 rounded-full bg-cyan-500/[0.05] blur-3xl"
      />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        {/* Brand and call to action */}
        <div className="grid gap-10 border-b border-white/[0.08] py-12 sm:py-16 lg:grid-cols-[1.4fr_0.8fr] lg:items-center lg:gap-16 lg:py-20">
          <div className="max-w-2xl">
            <Link
              to="/"
              aria-label="JobPulse home"
              className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-400/10 text-emerald-300 shadow-lg shadow-emerald-950/20 transition-colors group-hover:bg-emerald-400/15">
                <Sparkles size={19} strokeWidth={2.2} />
              </span>
              <span className="text-2xl font-extrabold tracking-tight text-white">
                job<span className="text-emerald-400">Pulse</span>
              </span>
              <span className="mb-3 h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </Link>

            <h2 className="mt-6 max-w-xl text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              Your next opportunity starts with{" "}
              <span className="text-emerald-400">a better search.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              Discover opportunities, keep track of the roles that interest you,
              and stay in the loop with job alerts built around your search.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-medium text-slate-500 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Opportunities in one place
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin size={14} className="text-emerald-400" />
                Built with job seekers in mind
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/[0.09] bg-white/[0.025] p-6 shadow-2xl shadow-black/10 sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Take the next step
            </p>
            <h3 className="mt-3 text-xl font-bold text-white">
              Find roles worth exploring.
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Start with a search and discover opportunities that fit your goals.
            </p>
            <Link
              to="/jobs"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080d16]"
            >
              Explore jobs
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-b border-white/[0.08] py-10 sm:grid-cols-3 sm:gap-8 sm:py-12">
          {footerGroups.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
                {group.title}
              </h3>
              <ul className="mt-5 space-y-3.5">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="group inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-emerald-300 focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                    >
                      {link.label}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-6 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
            <p className="text-xs leading-5 text-slate-500">
              © {year} JobPulse. All rights reserved.
            </p>
            <span className="hidden h-1 w-1 rounded-full bg-slate-700 sm:block" />
            <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
              Made for the next step in your career
              <Heart size={12} className="fill-rose-400 text-rose-400" />
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-xs font-medium">
            <Link
              to="/privacy"
              className="text-slate-500 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              Privacy
            </Link>
            <Link
              to="/terms"
              className="text-slate-500 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              Terms
            </Link>
            <a
              href="https://github.com/zelalem3/JobPulse"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="JobPulse on GitHub (opens in a new tab)"
              className="inline-flex items-center gap-1.5 text-slate-500 transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              GitHub
              <ArrowUpRight size={12} />
            </a>
            <a
              href="https://www.linkedin.com/in/zelalem-getnet-533326246/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn profile (opens in a new tab)"
              className="text-slate-500 transition-colors hover:text-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;