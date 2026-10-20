import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BellRing,
  Bookmark,
  Check,
  CheckCircle2,
  Code2,
  Compass,
  Search,
  Sparkles,
  TrendingUp,
  Palette,
  Database,
  Laptop,
} from "lucide-react";
import { useAuthStore } from "../store/authStore";

const popularSearches = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "DevOps",
];

const categories = [
  {
    title: "Software & Engineering",
    description: "Build products, systems, and digital experiences.",
    query: "software engineer",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=85",
    alt: "Developer workspace with a laptop and code on screen",
    icon: Code2,
    tone: "text-emerald-300 bg-emerald-400/10",
  },
  {
    title: "Design & Product",
    description: "Shape useful products and thoughtful experiences.",
    query: "design product",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1000&q=85",
    alt: "Colorful design work and creative materials on a desk",
    icon: Palette,
    tone: "text-violet-300 bg-violet-400/10",
  },
  {
    title: "Data & Analytics",
    description: "Turn information into clearer decisions.",
    query: "data analyst",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=85",
    alt: "Analytics dashboard with charts and data visualizations",
    icon: Database,
    tone: "text-sky-300 bg-sky-400/10",
  },
  {
    title: "Remote & Flexible",
    description: "Find roles that fit the way you work.",
    query: "remote",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1000&q=85",
    alt: "Colleagues collaborating around a table in a bright workspace",
    icon: Laptop,
    tone: "text-amber-300 bg-amber-400/10",
  },
];

const benefits = [
  {
    icon: Search,
    title: "Search with purpose",
    description:
      "Look for jobs by title, skill, or keyword and get to relevant opportunities faster.",
  },
  {
    icon: Sparkles,
    title: "Explore better matches",
    description:
      "Use your profile and skills to discover roles that may fit your next career step.",
  },
  {
    icon: BellRing,
    title: "Keep opportunities close",
    description:
      "Save interesting roles and create alerts so you can return to what matters.",
  },
];

const steps = [
  {
    number: "01",
    title: "Find your direction",
    description: "Search by role, skill, or the kind of work you want to do.",
  },
  {
    number: "02",
    title: "Discover opportunities",
    description: "Explore listings and keep the ones worth a closer look.",
  },
  {
    number: "03",
    title: "Move with intention",
    description: "Use recommendations and alerts to stay organized.",
  },
];

export default function HomePage() {
  const token = useAuthStore((state) => state.token);
  const isLoggedIn = Boolean(token);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (event?: React.FormEvent, term?: string) => {
    event?.preventDefault();
    const query = (term ?? searchTerm).trim();
    navigate(query ? `/jobs?q=${encodeURIComponent(query)}` : "/jobs");
  };

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#080d16] text-slate-100 selection:bg-emerald-400/30">
      {/* Background atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_58%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-180px] top-[900px] -z-10 h-[420px] w-[420px] rounded-full bg-sky-500/[0.05] blur-[120px]"
      />

      {/* Hero */}
      <section className="relative border-b border-white/[0.07]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:px-10 lg:pb-24 lg:pt-24">
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3.5 py-2 text-xs font-semibold text-emerald-200">
              <Sparkles size={14} />
              A clearer way to navigate your job search
            </div>

            <h1 className="max-w-2xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl lg:text-[4.25rem]">
              Find work that
              <span className="mt-1 block bg-gradient-to-r from-emerald-300 via-teal-300 to-sky-300 bg-clip-text pb-2 text-transparent">
                moves you forward.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
              Discover opportunities, explore roles that fit your skills, and
              keep your job search organized—all in one place with JobPulse.
            </p>

            <form
              onSubmit={handleSearch}
              role="search"
              className="mt-8 flex flex-col gap-2 rounded-2xl border border-white/[0.12] bg-[#0d1421]/90 p-1.5 shadow-2xl shadow-black/20 backdrop-blur sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5">
                <Search size={20} className="shrink-0 text-emerald-300" />
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Job title, skill, or keyword"
                  aria-label="Search jobs by title, skill, or keyword"
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-[#080d16]"
              >
                Find jobs <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-medium text-slate-500">
                Try searching
              </span>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => handleSearch(undefined, term)}
                  className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-emerald-400/30 hover:bg-emerald-400/[0.06] hover:text-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                >
                  {term}
                </button>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/jobs"
                className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/[0.1]"
              >
                Browse all jobs
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to={isLoggedIn ? "/alerts" : "/register"}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-slate-300 transition hover:text-emerald-200"
              >
                <BellRing size={15} />
                {isLoggedIn ? "Manage job alerts" : "Create a free account"}
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-300" />
                Search in one place
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-300" />
                Save roles worth revisiting
              </span>
            </div>
          </div>

          {/* Contextual image and product overlay */}
          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-emerald-400/10 via-transparent to-sky-400/10 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0d1421] shadow-2xl shadow-black/40">
              <div className="relative h-[310px] sm:h-[390px]">
                <img
                  src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=90"
                  alt="Developer working at a laptop in a modern workspace"
                  className="h-full w-full object-cover object-center"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080d16] via-[#080d16]/25 to-[#080d16]/5" />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4 sm:p-5">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#080d16]/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Your next chapter
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#080d16]/50 text-white backdrop-blur-md">
                    <Compass size={17} />
                  </span>
                </div>

                <div className="absolute inset-x-4 bottom-4 sm:inset-x-5 sm:bottom-5">
                  <div className="max-w-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
                      Find your direction
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
                      Your skills have somewhere to go.
                    </h2>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-px border-t border-white/[0.07] bg-white/[0.07]">
                <div className="bg-[#0d1421] p-3.5 sm:p-4">
                  <Search size={17} className="text-emerald-300" />
                  <p className="mt-2 text-xs font-semibold text-white sm:text-sm">Discover</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">Search roles</p>
                </div>
                <div className="bg-[#0d1421] p-3.5 sm:p-4">
                  <Bookmark size={17} className="text-sky-300" />
                  <p className="mt-2 text-xs font-semibold text-white sm:text-sm">Organize</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">Save favorites</p>
                </div>
                <div className="bg-[#0d1421] p-3.5 sm:p-4">
                  <BellRing size={17} className="text-violet-300" />
                  <p className="mt-2 text-xs font-semibold text-white sm:text-sm">Stay ready</p>
                  <p className="mt-1 text-[10px] leading-4 text-slate-500 sm:text-xs">Create alerts</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Career categories */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                Explore your next step
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
                Where would you like to grow?
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
                Start with a career area that interests you. Search results will
                help you explore the opportunities available.
              </p>
            </div>
            <Link
              to="/jobs"
              className="group inline-flex w-fit items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
            >
              Explore all jobs
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map(({ title, description, query, image, alt, icon: Icon, tone }) => (
              <Link
                key={title}
                to={`/jobs?q=${encodeURIComponent(query)}`}
                className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] transition duration-300 hover:-translate-y-1 hover:border-emerald-400/25 hover:bg-white/[0.04]"
              >
                <div className="relative h-48 overflow-hidden sm:h-44 xl:h-48">
                  <img
                    src={image}
                    alt={alt}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080d16] via-[#080d16]/15 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 backdrop-blur ${tone}`}>
                      <Icon size={19} />
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-white">{title}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{description}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    Explore roles
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="border-y border-white/[0.07] bg-white/[0.018] py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
              The JobPulse approach
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">
              Less noise. More direction.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
              A focused job search should help you make progress—not give you
              another thing to manage.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {benefits.map(({ icon: Icon, title, description }, index) => (
              <article
                key={title}
                className="group rounded-2xl border border-white/[0.08] bg-[#0b111c] p-6 transition duration-200 hover:-translate-y-1 hover:border-emerald-400/20 sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.07] text-emerald-300">
                    <Icon size={20} />
                  </div>
                  <span className="text-xs font-medium tracking-[0.16em] text-slate-600">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-base font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Simple workflow */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                A simpler workflow
              </p>
              <h2 className="mt-3 max-w-md text-2xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-3xl">
                From searching to taking your next step.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-400 sm:text-base">
                Keep your search moving with a straightforward flow that helps
                you discover, organize, and revisit opportunities on your terms.
              </p>
              <Link
                to="/jobs"
                className="group mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
              >
                Start exploring
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="space-y-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-white/[0.14] sm:gap-5 sm:p-6"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-400/[0.07] text-xs font-bold tracking-wide text-emerald-300">
                    {step.number}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white sm:text-base">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-slate-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA with contextual photo */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-white/10 bg-[#0c1720]">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1800&q=85"
              alt=""
              aria-hidden="true"
              loading="lazy"
              className="h-full w-full object-cover object-center opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#08110f] via-[#08110f]/95 to-[#08111b]/75" />
          </div>

          <div className="relative grid gap-8 p-7 sm:p-10 md:grid-cols-[1fr_auto] md:items-center md:p-12 lg:p-14">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-200">
                <TrendingUp size={14} />
                Your next step starts here
              </div>
              <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-3xl lg:text-4xl">
                Make your next opportunity easier to find.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300/80 sm:text-base">
                Explore available roles, save the ones that interest you, and
                build a job search that works for you.
              </p>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-300/80">
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-300" /> Search and explore</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-300" /> Save roles</span>
                <span className="inline-flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-300" /> Set alerts</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link
                to="/jobs"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
              >
                Explore jobs <ArrowRight size={16} />
              </Link>
              <Link
                to={isLoggedIn ? "/alerts" : "/register"}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.1]"
              >
                {isLoggedIn ? "Manage alerts" : "Create an account"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
