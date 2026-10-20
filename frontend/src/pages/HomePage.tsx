import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  Search,
  Bell,
  Sparkles,
  ArrowRight,
  MapPin,
  Zap,
  ShieldCheck,
  TrendingUp,
  Users,
  Building2,
  CheckCircle2,
  Star,
  Clock,
  Bookmark,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useState } from "react";

export default function HomePage() {
  const token = useAuthStore((s) => s.token);
  const isLoggedIn = !!token;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e?: React.FormEvent, term?: string) => {
    e?.preventDefault();
    const q = (term ?? searchTerm).trim();
    if (q) navigate(`/jobs?q=${encodeURIComponent(q)}`);
    else navigate("/jobs");
  };

  const popularSearches = [
    "Software Engineer",
    "Frontend",
    "Backend",
    "Remote",
    "DevOps",
    "Data Analyst",
  ];

  const categories = [
    {
      title: "Engineering",
      count: "1.2k+ roles",
      image:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
      to: "/jobs?q=engineer",
    },
    {
      title: "Design & Product",
      count: "340+ roles",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80",
      to: "/jobs?q=design",
    },
    {
      title: "Data & AI",
      count: "520+ roles",
      image:
        "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80",
      to: "/jobs?q=data",
    },
    {
      title: "Remote First",
      count: "890+ roles",
      image:
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
      to: "/jobs?q=remote",
    },
  ];

  // Placeholder featured jobs – replace with real API data later
  const featuredJobs = [
    {
      id: 1,
      title: "Senior Frontend Engineer",
      company: "Addis Tech",
      location: "Addis Ababa · Hybrid",
      tags: ["React", "TypeScript", "Remote-friendly"],
      posted: "2h ago",
    },
    {
      id: 2,
      title: "Backend Engineer (Node.js)",
      company: "PayStack East",
      location: "Remote · Ethiopia",
      tags: ["Node.js", "PostgreSQL", "AWS"],
      posted: "5h ago",
    },
    {
      id: 3,
      title: "Full Stack Developer",
      company: "Gebeya",
      location: "Addis Ababa",
      tags: ["React", "Python", "Django"],
      posted: "1d ago",
    },
  ];

  const stats = [
    { label: "Jobs tracked", value: "12k+", icon: Briefcase },
    { label: "Companies", value: "1.8k+", icon: Building2 },
    { label: "Active seekers", value: "24k+", icon: Users },
    { label: "New this week", value: "860+", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950 text-slate-100 selection:bg-emerald-500/30">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/4 h-[480px] w-[480px] rounded-full bg-emerald-500/[0.07] blur-[130px]" />
        <div className="absolute right-[-120px] top-[20%] h-[420px] w-[420px] rounded-full bg-indigo-500/[0.06] blur-[130px]" />
      </div>

      {/* ================= HERO ================= */}
      <section className="relative border-b border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-8 sm:px-6 sm:pb-14 sm:pt-10 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
            {/* Left */}
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-1 text-xs font-bold text-emerald-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </span>
                Live openings · updated daily
              </div>

              <h1 className="max-w-xl text-4xl font-black leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                Find work that
                <span className="mt-1 block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  actually moves you forward.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-[15px] leading-7 text-slate-400 sm:text-base">
                Discover roles matched to your skills, explore openings from real
                companies, and keep your entire job search organized in one place.
              </p>

              {/* Search bar */}
              <form
                onSubmit={handleSearch}
                className="mt-7 flex flex-col gap-2 rounded-2xl border border-slate-700/80 bg-slate-900/80 p-1.5 shadow-xl shadow-black/25 backdrop-blur sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2">
                  <Search className="h-5 w-5 shrink-0 text-emerald-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Job title, skill, or keyword..."
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400"
                >
                  Find jobs
                  <ArrowRight size={16} />
                </button>
              </form>

              {/* Popular */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">Popular:</span>
                {popularSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSearch(undefined, term)}
                    className="rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs font-medium text-slate-400 transition hover:border-emerald-500/40 hover:text-emerald-300"
                  >
                    {term}
                  </button>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-700"
                >
                  Browse all jobs
                  <ArrowRight size={15} />
                </Link>
                <Link
                  to={isLoggedIn ? "/alerts" : "/register"}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-bold text-slate-300 transition hover:border-emerald-500/40 hover:text-emerald-300"
                >
                  <Bell size={14} />
                  {isLoggedIn ? "Manage alerts" : "Create free profile"}
                </Link>
              </div>
            </div>

            {/* Right card */}
            <div className="relative mx-auto w-full max-w-md lg:ml-auto">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-500/12 via-transparent to-indigo-500/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl shadow-black/40">
                <div className="relative h-40 overflow-hidden sm:h-44">
                  <img
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=80"
                    alt="Team"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                      Your next move
                    </p>
                    <p className="text-lg font-bold text-white">
                      Opportunities, organized.
                    </p>
                  </div>
                </div>

                <div className="space-y-2 p-4">
                  {[
                    {
                      to: "/jobs",
                      icon: Search,
                      title: "Explore jobs",
                      sub: "Search openings",
                      color: "text-emerald-400 bg-emerald-500/10",
                    },
                    {
                      to: isLoggedIn ? "/recommendations" : "/register",
                      icon: Sparkles,
                      title: "Discover matches",
                      sub: "Skill-based roles",
                      color: "text-indigo-400 bg-indigo-500/10",
                    },
                    {
                      to: isLoggedIn ? "/alerts" : "/register",
                      icon: Bell,
                      title: "Stay up to date",
                      sub: "Smart job alerts",
                      color: "text-teal-400 bg-teal-500/10",
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.title}
                        to={item.to}
                        className="group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-3 transition hover:border-slate-600 hover:bg-slate-950"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.color}`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-white">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500">{item.sub}</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-slate-600 transition group-hover:translate-x-0.5 group-hover:text-emerald-400" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Stats – denser */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/50 px-4 py-3.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
                    <Icon className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-white sm:text-xl">
                      {s.value}
                    </p>
                    <p className="text-[11px] text-slate-500">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= FEATURED JOBS ================= */}
      <section className="relative border-b border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
                Fresh opportunities
              </p>
              <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
                Featured roles right now
              </h2>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              View all
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job) => (
              <Link
                key={job.id}
                to={`/jobs/${job.id}`}
                className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition hover:-translate-y-0.5 hover:border-emerald-500/30 hover:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white group-hover:text-emerald-300">
                      {job.title}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">{job.company}</p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
                    <Clock size={10} />
                    {job.posted}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin size={12} />
                  {job.location}
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CATEGORIES ================= */}
      <section className="relative border-b border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
                Explore by path
              </p>
              <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
                Start where you want to grow
              </h2>
            </div>
            <Link
              to="/jobs"
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300"
            >
              All categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.title}
                to={cat.to}
                className="group relative overflow-hidden rounded-2xl border border-slate-800 transition hover:-translate-y-0.5 hover:border-emerald-500/30"
              >
                <div className="relative h-28 sm:h-32">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/10" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-bold text-white">{cat.title}</p>
                  <p className="text-xs text-slate-400">{cat.count}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="relative border-b border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
              Why JobPulse
            </p>
            <h2 className="mt-1 text-xl font-black text-white sm:text-2xl">
              Less searching. More discovering.
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Smart search",
                desc: "Filter by title, skills, and keywords that actually narrow results.",
                color: "text-emerald-400 bg-emerald-500/10",
              },
              {
                icon: Sparkles,
                title: "Skill-matched roles",
                desc: "Recommendations based on your profile so you apply to better fits.",
                color: "text-indigo-400 bg-indigo-500/10",
              },
              {
                icon: Bell,
                title: "Alerts that work",
                desc: "Get notified about roles you care about — without the spam.",
                color: "text-teal-400 bg-teal-500/10",
              },
            ].map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 transition hover:border-slate-700 hover:bg-slate-900"
                >
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${f.color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-400">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= SOCIAL + CTA ================= */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
                Why people stay
              </p>
              <h2 className="mt-2 text-2xl font-black text-white">
                A job search that feels calmer
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                JobPulse reduces noise so you can focus on roles that match your
                skills, track what matters, and move faster without feeling
                overwhelmed.
              </p>
              <ul className="mt-5 space-y-2.5">
                {[
                  "Skill-aware recommendations",
                  "Clean, focused browsing",
                  "Alerts without the spam",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1000&q=80"
                alt="Team"
                className="h-56 w-full object-cover sm:h-64"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-slate-950/75 p-3 backdrop-blur">
                <p className="text-sm font-semibold text-white">
                  “Finally a job board that doesn’t feel chaotic.”
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  — Early JobPulse users
                </p>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div className="relative mt-10 overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/60 p-6 sm:p-8">
            <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
                  Ready when you are
                </p>
                <h3 className="mt-1 text-xl font-black text-white sm:text-2xl">
                  Start exploring real openings
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Free to start. Built for focused job search.
                </p>
              </div>
              <Link
                to="/jobs"
                className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400"
              >
                Explore opportunities
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}