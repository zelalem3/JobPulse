import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  SlidersHorizontal,
  Search,
  Bell,
  Sparkles,
  ArrowRight,
  MapPin,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useSearchParams } from "react-router-dom";

import SearchBar from "../components/SearchBar";
import api from "../services/axios";
import { Job } from "../types/job";
import { useDebounce } from "../hooks/useDebounce";

import JobsSidebarFilter from "../components/home/JobsSidebarFilter";
import JobCard from "../components/home/JobCard";
import PaginationControls from "../components/home/PaginationControls";
import ScrollToTopOnPageChange from "../components/ScrollToTopOnPageChange";


export default function HomePage  (){
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const isLoggedIn = !!token;

return (
  <div className="min-h-screen overflow-hidden bg-slate-950 text-slate-100 selection:bg-emerald-500/30">


    {/* Ambient background */}
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-48 left-1/3 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.07] blur-[130px]" />
      <div className="absolute right-[-180px] top-[35%] h-[450px] w-[450px] rounded-full bg-indigo-500/[0.06] blur-[130px]" />
    </div>

    {/* HERO */}
    <section className="relative border-b border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:px-8">
        {/* Small intro */}
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
            <Briefcase className="h-5 w-5 text-emerald-400" />
          </div>

          <div>
            <p className="text-lg font-black tracking-tight text-white">
              JobPulse
            </p>
            <p className="text-xs text-slate-500">
              Your next opportunity starts here
            </p>
          </div>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Main content */}
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/[0.07] px-3 py-1.5 text-xs font-bold text-emerald-300">
              <Sparkles size={14} />
              Smarter job discovery
            </div>

            <h1 className="max-w-2xl text-4xl font-black leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Find work that
              <span className="mt-2 block bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                moves you forward.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-400 sm:text-lg">
              Discover opportunities, find jobs that match your skills,
              and keep your job search organized — all in one place.
            </p>

            {/* Search
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch(searchTerm);
              }}
              className="mt-8 flex flex-col gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-2 shadow-2xl shadow-black/20 backdrop-blur-xl sm:flex-row sm:items-center"
            > */}
              {/* <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2">
                <Search className="h-5 w-5 shrink-0 text-emerald-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Job title, skill, or keyword..."
                  className="w-full bg-transparent py-2 text-sm text-white outline-none placeholder:text-slate-500"
                  aria-label="Search jobs"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Find jobs
                <ArrowRight size={17} />
              </button>
            </form> */}

            {/* Popular searches */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium text-slate-500">
                Popular:
              </span>

              {["Software Engineer", "Frontend", "Backend", "Remote"].map(
                (term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSearch(term)}
                    className="rounded-full border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-emerald-500/40 hover:bg-emerald-500/10 hover:text-emerald-300"
                  >
                    {term}
                  </button>
                )
              )}
            </div>

            {/* CTAs */}
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-700"
              >
                Browse all jobs
                <ArrowRight size={15} />
              </Link>

              {!isLoggedIn ? (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-300"
                >
                  Create free profile
                </Link>
              ) : (
                <Link
                  to="/alerts"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm font-bold text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-300"
                >
                  <Bell size={15} />
                  Manage job alerts
                </Link>
              )}
            </div>
          </div>

          {/* Right-hand discovery panel */}
          <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-500/[0.09] via-transparent to-indigo-500/[0.08] blur-2xl" />

            <div className="relative rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-2xl shadow-black/30 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                    Your next move
                  </p>
                  <h2 className="mt-2 text-xl font-bold text-white">
                    Opportunities, organized.
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Everything you need for your job search.
                  </p>
                </div>

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  to="/jobs"
                  className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-emerald-500/30 hover:bg-slate-950"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Search className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white">Explore jobs</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Search across available openings
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-emerald-400" />
                </Link>

                <Link
                  to={isLoggedIn ? "/recommendations" : "/register"}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-indigo-500/30 hover:bg-slate-950"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
                    <Sparkles className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white">
                      Discover your matches
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Find roles suited to your skills
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-indigo-400" />
                </Link>

                <Link
                  to={isLoggedIn ? "/alerts" : "/register"}
                  className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:border-teal-500/30 hover:bg-slate-950"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-500/10">
                    <Bell className="h-5 w-5 text-teal-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-white">Stay up to date</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Set up alerts for new opportunities
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-1 group-hover:text-teal-400" />
                </Link>
              </div>

              <div className="mt-5 flex items-center gap-3 border-t border-slate-800 pt-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Your job search, simplified
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Free to start, built around your goals.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-14 grid grid-cols-1 gap-3 border-t border-slate-800/80 pt-6 sm:grid-cols-3 sm:gap-5">
          <div className="flex items-center gap-3 rounded-xl bg-slate-900/40 p-4 sm:bg-transparent sm:p-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <Briefcase className="h-5 w-5 text-emerald-400" />
            </div>
            <div>

              <p className="text-xs text-slate-500">Openings tracked</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-900/40 p-4 sm:bg-transparent sm:p-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Zap className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                Continuously updated
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Discover newly collected opportunities
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-900/40 p-4 sm:bg-transparent sm:p-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
              <ShieldCheck className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Free to start</p>
              <p className="mt-1 text-xs text-slate-500">
                Search and organize your job hunt
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* VALUE PROPOSITIONS */}
    <section className="relative border-b border-slate-800/80">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
            Made for your next step
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
            Less searching. More discovering.
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
            Keep your search focused and spend more time finding opportunities
            that matter to you.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Search,
              title: "Find the right roles",
              description:
                "Search by job title, skills, and keywords to discover opportunities relevant to your goals.",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10",
              border: "hover:border-emerald-500/30",
            },
            {
              icon: Sparkles,
              title: "Personalized recommendations",
              description:
                "Use your profile and skills to discover roles that may be a good match for your experience.",
              color: "text-indigo-400",
              bg: "bg-indigo-500/10",
              border: "hover:border-indigo-500/30",
            },
            {
              icon: Bell,
              title: "Stay ahead with alerts",
              description:
                "Create job alerts around the opportunities you care about and keep track of your search.",
              color: "text-teal-400",
              bg: "bg-teal-500/10",
              border: "hover:border-teal-500/30",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className={`rounded-2xl border border-slate-800 bg-slate-900/50 p-6 transition duration-300 hover:-translate-y-1 hover:bg-slate-900 ${item.border}`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${item.bg}`}
                >
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>

                <h3 className="mt-5 text-base font-bold text-white">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>

    {/* JOB DISCOVERY CTA */}
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/60 via-slate-900 to-indigo-950/40 p-7 sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-emerald-500/[0.09] blur-3xl" />

          <div className="relative flex flex-col items-start justify-between gap-7 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
                <Sparkles size={14} />
                Your next opportunity awaits
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Ready to find your next role?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-400 sm:text-base">
                Start exploring available jobs and build a more organized,
                focused job search with JobPulse.
              </p>
            </div>

            <Link
              to="/jobs"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-black text-slate-950 transition hover:bg-emerald-400"
            >
              Explore opportunities
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  </div>
);

}
