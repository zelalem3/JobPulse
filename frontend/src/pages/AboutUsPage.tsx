import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowRight,
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Compass,
  Globe2,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Search,
    number: "01",
    title: "Discover opportunities",
    description:
      "Bring openings from multiple sources into one focused, searchable experience.",
    accent: "emerald",
  },
  {
    icon: Target,
    number: "02",
    title: "Find your fit",
    description:
      "Explore roles that align with your skills, experience, interests, and goals.",
    accent: "blue",
  },
  {
    icon: BarChart3,
    number: "03",
    title: "Read the market",
    description:
      "Understand in-demand skills, active employers, and changing hiring trends.",
    accent: "violet",
  },
  {
    icon: BellRing,
    number: "04",
    title: "Stay in the loop",
    description:
      "Set useful job alerts and spend less time repeating the same searches.",
    accent: "amber",
  },
];

const capabilities = [
  "Automated job discovery",
  "Personalized recommendations",
  "Skill and market insights",
  "Company hiring activity",
  "Keyword-based job alerts",
  "One organized search experience",
];

const questions = [
  "Which roles fit my skills?",
  "What are employers looking for?",
  "Which companies are hiring?",
  "How is the market changing?",
  "What should I learn next?",
  "Where are new opportunities emerging?",
];

const principles = [
  {
    number: "01",
    title: "Our mission",
    description: "Make meaningful opportunities easier to discover.",
  },
  {
    number: "02",
    title: "Our approach",
    description: "Turn scattered job data into clear, useful signals.",
  },
  {
    number: "03",
    title: "Our vision",
    description: "Help people make more informed career decisions.",
  },
];

const insightCards = [
  {
    icon: Globe2,
    title: "Multiple sources",
    description: "Opportunities collected into one place.",
  },
  {
    icon: Users,
    title: "People first",
    description: "Tools designed around the job seeker.",
  },
  {
    icon: TrendingUp,
    title: "Useful signals",
    description: "See what skills and companies are gaining attention.",
  },
  {
    icon: BriefcaseBusiness,
    title: "A clearer workflow",
    description: "Move from discovering roles to taking action.",
  },
];

function SectionEyebrow({
  children,
  icon: Icon,
}: {
  children: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-3 py-1.5 text-xs font-semibold tracking-wide text-emerald-300">
      {Icon ? <Icon size={14} aria-hidden="true" /> : <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
      {children}
    </div>
  );
}

export default function AboutUs() {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#080d16] text-slate-100">
      {/* Subtle background lighting and texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[-180px] top-[900px] -z-10 h-[460px] w-[460px] rounded-full bg-blue-500/[0.06] blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-200px] top-[1750px] -z-10 h-[420px] w-[420px] rounded-full bg-emerald-500/[0.05] blur-[120px]"
      />

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:px-10 lg:pb-28 lg:pt-28">
          <div className="relative z-10">
            <SectionEyebrow icon={Sparkles}>A smarter way to find your next move</SectionEyebrow>

            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white sm:text-5xl md:text-6xl xl:text-[4.5rem]">
              Your next opportunity
              <span className="mt-1 block bg-gradient-to-r from-emerald-300 via-teal-300 to-sky-300 bg-clip-text pb-2 text-transparent">
                starts with clarity.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
              JobPulse brings job openings, career insights, and useful alerts
              together—so you can spend less time searching and more time moving
              forward.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/jobs"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-950/30 transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:ring-offset-2 focus:ring-offset-[#080d16]"
              >
                Explore jobs
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-6 py-3 text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Create your free account
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                One organized job search
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                Insights that help you plan
              </span>
            </div>
          </div>

          {/* Product-style preview */}
          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div
              aria-hidden="true"
              className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 via-sky-500/[0.04] to-violet-500/10 blur-2xl"
            />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0d1421]/95 shadow-2xl shadow-black/40 sm:rounded-3xl">
              <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                    <Zap size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Your opportunity feed</p>
                    <p className="mt-0.5 text-xs text-slate-500">A clearer view of what’s next</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/15 bg-emerald-400/[0.07] px-2.5 py-1 text-[10px] font-semibold text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Organized
                </span>
              </div>

              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3">
                  <Search size={17} className="shrink-0 text-slate-500" />
                  <span className="text-sm text-slate-500">Role, skill, or company...</span>
                  <span className="ml-auto hidden rounded-md border border-white/10 px-2 py-1 text-[10px] text-slate-500 sm:inline">
                    Search
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Explore roles</p>
                    <p className="mt-1 text-xs text-slate-500">A sample of the JobPulse experience</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400">
                    <Compass size={16} />
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl border border-white/[0.08] bg-[#111b2a] p-4 transition hover:border-emerald-400/25">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                        <BriefcaseBusiness size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-white">Backend Developer</p>
                          <span className="rounded-md bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                            Recommended
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">Technology · Full-time</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {["Python", "API", "PostgreSQL"].map((skill) => (
                            <span key={skill} className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[10px] text-slate-400">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ArrowDownRight size={16} className="text-slate-600" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/[0.08] bg-[#111b2a] p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                        <BarChart3 size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white">Data Analyst</p>
                        <p className="mt-1 text-xs text-slate-400">Research · Hybrid</p>
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {["SQL", "Reporting", "Analytics"].map((skill) => (
                            <span key={skill} className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 text-[10px] text-slate-400">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <ArrowDownRight size={16} className="text-slate-600" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.055] p-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                    <BellRing size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-200">Your search, on your terms</p>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">Save roles and set alerts for opportunities that matter.</p>
                  </div>
                  <Check size={16} className="shrink-0 text-emerald-300" />
                </div>
              </div>
              <div className="h-1 w-full bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Mission / approach / vision */}
      <section className="border-y border-white/[0.07] bg-white/[0.018]">
        <div className="mx-auto grid max-w-7xl gap-0 px-5 sm:px-8 md:grid-cols-3 lg:px-10">
          {principles.map((item, index) => (
            <article
              key={item.number}
              className={`py-7 sm:py-8 md:px-7 lg:py-10 ${index !== 0 ? "border-t border-white/[0.07] md:border-l md:border-t-0" : ""}`}
            >
              <p className="text-xs font-semibold tracking-[0.18em] text-emerald-300/80">{item.number}</p>
              <h2 className="mt-3 text-lg font-semibold tracking-tight text-white">{item.title}</h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
            <SectionEyebrow>What JobPulse helps you do</SectionEyebrow>
            <h2 className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
              More signal. Less searching.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              A practical set of tools to help you discover openings, understand
              the market, and take your next step with more confidence.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, number, title, description, accent }) => {
              const accents: Record<string, string> = {
                emerald: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/15",
                blue: "bg-sky-400/10 text-sky-300 ring-sky-400/15",
                violet: "bg-violet-400/10 text-violet-300 ring-violet-400/15",
                amber: "bg-amber-400/10 text-amber-300 ring-amber-400/15",
              };

              return (
                <article
                  key={title}
                  className="group rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition duration-200 hover:-translate-y-1 hover:border-white/[0.14] hover:bg-white/[0.045] sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${accents[accent]}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-medium tracking-widest text-slate-600">{number}</span>
                  </div>
                  <h3 className="mt-6 text-base font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                  <div className="mt-6 h-px w-full bg-white/[0.07] transition-colors group-hover:bg-emerald-400/25" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Questions */}
      <section className="border-y border-white/[0.07] bg-[#0b111c] py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16 lg:px-10">
          <div>
            <SectionEyebrow icon={Target}>Think beyond listings</SectionEyebrow>
            <h2 className="max-w-lg text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
              Better questions lead to better career moves.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-400 sm:text-base">
              Finding a job is only part of the journey. JobPulse is designed to
              help you explore the signals behind the listings and decide where
              to focus next.
            </p>
            <Link
              to="/jobs"
              className="group mt-7 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200"
            >
              Explore opportunities
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {questions.map((question, index) => (
              <div
                key={question}
                className="flex min-h-[92px] items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition hover:border-emerald-400/20 hover:bg-white/[0.04] sm:p-5"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-400/[0.08] text-xs font-semibold text-emerald-300">
                  0{index + 1}
                </span>
                <p className="pt-1 text-sm font-medium leading-6 text-slate-200">{question}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform details */}
      <section className="py-20 sm:py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:gap-20">
            <div>
              <SectionEyebrow icon={Zap}>The platform</SectionEyebrow>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-white sm:text-4xl">
                Everything starts with a clearer view.
              </h2>
              <p className="mt-5 text-sm leading-7 text-slate-400 sm:text-base">
                Job opportunities can be scattered across job boards, company
                websites, and online communities. JobPulse brings listings
                together and helps you organize your search, save roles, follow
                relevant alerts, and explore career insights in one place.
              </p>

              <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {capabilities.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                      <Check size={12} strokeWidth={2.5} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              {insightCards.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.045] to-white/[0.015] p-5 transition hover:border-emerald-400/20 sm:p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.07] text-emerald-300">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-5 text-sm font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision and CTA */}
      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl border border-emerald-300/15 bg-[#0d1b20] px-6 py-14 text-center sm:px-12 sm:py-16 lg:px-20 lg:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.14),transparent_60%)]"
          />
          <div className="relative mx-auto max-w-3xl">
            <SectionEyebrow>Looking ahead</SectionEyebrow>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl lg:text-5xl">
              A clearer path to opportunity.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              We believe better information can help people find better
              opportunities. JobPulse aims to make the job search more
              organized, more insightful, and more human.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/jobs"
                className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                Find your next opportunity
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/register"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Join JobPulse
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
