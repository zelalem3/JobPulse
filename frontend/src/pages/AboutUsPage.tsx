import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Globe2,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const AboutUs: React.FC = () => {
  const features = [
    {
      icon: Search,
      title: "Discover More",
      description:
        "Find opportunities collected from multiple sources in one organized job-search experience.",
    },
    {
      icon: Target,
      title: "Better Matches",
      description:
        "Discover jobs that align with your skills, experience, interests, and career goals.",
    },
    {
      icon: BarChart3,
      title: "Understand the Market",
      description:
        "See which skills are in demand, who's hiring, and how the job market is changing.",
    },
    {
      icon: Bell,
      title: "Stay Ahead",
      description:
        "Get relevant job alerts and recommendations instead of constantly searching for new openings.",
    },
  ];

  const capabilities = [
    "Automated job discovery",
    "Personalized job recommendations",
    "Skill and market intelligence",
    "Company hiring insights",
    "Job alerts",
    "Centralized job discovery",
  ];

  const stats = [
    {
      value: "01",
      label: "Mission",
      description: "Make opportunities easier to discover.",
    },
    {
      value: "02",
      label: "Approach",
      description: "Turn scattered job data into useful intelligence.",
    },
    {
      value: "03",
      label: "Vision",
      description: "Build a smarter employment ecosystem.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#07111f] text-white overflow-hidden">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative isolate">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute left-1/2 top-[-180px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[120px]" />
          <div className="absolute right-[-150px] top-[300px] h-[400px] w-[400px] rounded-full bg-cyan-500/5 blur-[100px]" />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="mx-auto max-w-7xl px-6 pb-24 pt-20 sm:px-8 lg:px-12 lg:pb-32 lg:pt-28">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
              <Sparkles className="h-4 w-4" />
              About JobPulse
            </div>

            {/* Heading */}
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl">
              Making the job search{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">
                smarter.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
              JobPulse brings job opportunities together, transforms job-market
              data into useful insights, and helps people discover opportunities
              that actually match their career goals.
            </p>

            {/* CTA */}
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/jobs"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 sm:w-auto"
              >
                Explore Jobs
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800 sm:w-auto"
              >
                Create Your Profile
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="mx-auto mt-20 max-w-5xl">
            <div className="relative">
              <div className="absolute -inset-4 rounded-[2rem] bg-blue-500/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0b1728]/90 shadow-2xl shadow-black/30 backdrop-blur">
                {/* Fake dashboard header */}
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                  </div>

                  <div className="hidden h-8 w-48 rounded-lg bg-slate-800/70 sm:block" />

                  <div className="h-8 w-8 rounded-full bg-blue-500/20" />
                </div>

                <div className="grid gap-5 p-5 sm:grid-cols-3 sm:p-7">
                  {/* Search card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 sm:col-span-2">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3">
                      <Search className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-500">
                        Search jobs, skills, companies...
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={item}
                          className="rounded-xl border border-slate-800 bg-[#0d1b2d] p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                              <BriefcaseBusiness className="h-4 w-4 text-blue-400" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="h-3 w-24 rounded bg-slate-700" />
                              <div className="mt-2 h-2.5 w-32 rounded bg-slate-800" />
                              <div className="mt-3 h-2 w-20 rounded bg-slate-800" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insights card */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">
                          Market Insight
                        </p>
                        <p className="mt-1 text-lg font-semibold text-white">
                          Growing Skills
                        </p>
                      </div>

                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                    </div>

                    <div className="mt-8 flex items-end gap-2">
                      {[30, 45, 38, 62, 55, 72, 88].map((height, index) => (
                        <div
                          key={index}
                          className="flex-1 rounded-t bg-blue-500/30"
                          style={{ height: `${height}px` }}
                        />
                      ))}
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                      <span>Demand</span>
                      <span className="text-emerald-400">+24%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MISSION
      ========================================================= */}
      <section className="border-y border-slate-800/70 bg-[#091525]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                Our Mission
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Connecting people with better opportunities.
              </h2>
            </div>

            <div>
              <p className="text-lg leading-8 text-slate-400">
                Finding the right job shouldn't mean checking dozens of
                websites, scrolling through endless channels, or discovering
                opportunities after they're already gone.
              </p>

              <p className="mt-5 text-lg leading-8 text-slate-400">
                JobPulse is built to make the job search more accessible,
                organized, and intelligent by bringing opportunities and
                meaningful job-market information into one place.
              </p>

              <div className="mt-7 flex items-center gap-3 text-base font-semibold text-white">
                <span className="h-px w-8 bg-blue-500" />
                Connect the right people with the right opportunities.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHY JOBPULSE
      ========================================================= */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              Why JobPulse
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
              A better way to navigate the job market
            </h2>

            <p className="mt-5 text-slate-400">
              We don't just want to show you more jobs. We want to help you
              understand which opportunities are worth your attention.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-slate-800 bg-[#0b1728] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:bg-[#0d1b2d]"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                    <Icon className="h-5 w-5 text-blue-400" />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {feature.description}
                  </p>

                  <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-blue-400 opacity-0 transition group-hover:opacity-100">
                    Learn more
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          ETHIOPIA / LOCAL MARKET
      ========================================================= */}
      <section className="border-y border-slate-800/70 bg-[#091525]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
            {/* Visual */}
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-5 rounded-[2rem] bg-blue-500/5 blur-2xl" />

              <div className="relative rounded-3xl border border-slate-800 bg-[#0b1728] p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
                    <Globe2 className="h-5 w-5 text-blue-400" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Built for the local market
                    </p>
                    <p className="text-xs text-slate-500">
                      Designed around real job-search challenges
                    </p>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {capabilities.map((capability) => (
                    <div
                      key={capability}
                      className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-400" />
                      <span className="text-sm text-slate-300">
                        {capability}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Copy */}
            <div className="order-1 lg:order-2">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                Built for Ethiopia
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Local opportunities. Better intelligence.
              </h2>

              <p className="mt-6 leading-8 text-slate-400">
                The Ethiopian job market has its own challenges. Opportunities
                are often scattered across different job boards, company
                websites, communities, and messaging channels.
              </p>

              <p className="mt-5 leading-8 text-slate-400">
                JobPulse is being built with these realities in mind. We're
                focused on making local opportunities easier to discover while
                turning job-market data into information that people can
                actually use.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.value}>
                    <p className="text-2xl font-bold text-blue-400">
                      {stat.value}
                    </p>

                    <p className="mt-2 text-sm font-semibold text-white">
                      {stat.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {stat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          MORE THAN A JOB BOARD
      ========================================================= */}
      <section className="relative overflow-hidden">
        <div className="absolute left-1/2 top-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-[120px]" />

        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              More Than a Job Board
            </p>

            <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Don't just ask{" "}
              <span className="text-slate-500">"what jobs are available?"</span>
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Ask the questions that actually help you make better career
              decisions.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Which jobs are right for me?",
              "What skills are employers looking for?",
              "Which companies are hiring?",
              "How is the market changing?",
              "What skills should I learn?",
              "Where are opportunities growing?",
            ].map((question) => (
              <div
                key={question}
                className="group rounded-2xl border border-slate-800 bg-[#0b1728] p-6 transition hover:border-blue-500/30"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-400 shadow-lg shadow-blue-400/40" />

                  <p className="text-sm font-medium leading-6 text-slate-300 transition group-hover:text-white">
                    {question}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          TECHNOLOGY
      ========================================================= */}
      <section className="border-y border-slate-800/70 bg-[#091525]">
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
              <Zap className="h-5 w-5 text-blue-400" />
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Powered by technology
            </h2>

            <p className="mt-5 leading-8 text-slate-400">
              JobPulse combines automated data collection, intelligent
              matching, market analytics, and personalized recommendations to
              create a more useful job-search experience.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {[
                "Job Discovery",
                "Smart Matching",
                "Market Analytics",
                "Recommendations",
                "Job Alerts",
                "Career Intelligence",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-medium text-slate-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VISION
      ========================================================= */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
          <div className="relative overflow-hidden rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-600/10 via-[#0b1728] to-[#0b1728] px-6 py-16 text-center sm:px-12">
            <div className="absolute left-1/2 top-0 h-40 w-80 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative mx-auto max-w-3xl">
              <Users className="mx-auto h-8 w-8 text-blue-400" />

              <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                Our Vision
              </p>

              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                A smarter employment ecosystem.
              </h2>

              <p className="mt-6 leading-8 text-slate-400">
                We envision a future where finding meaningful work isn't
                limited by where someone happens to discover a job posting.
              </p>

              <p className="mt-4 leading-8 text-slate-400">
                A future where job seekers have better information, employers
                can reach the right talent, and data helps people make smarter
                career decisions.
              </p>

              <p className="mt-8 text-lg font-semibold text-white">
                Our vision is to become Ethiopia's trusted job intelligence
                platform.
              </p>

              <div className="mt-8">
                <Link
                  to="/jobs"
                  className="group inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500"
                >
                  Start Exploring
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="border-t border-slate-800 bg-[#06101d]">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:px-8 lg:py-24">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your next opportunity could be closer than you think.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-slate-400">
            Explore opportunities, discover what's in demand, and take the
            next step in your career with JobPulse.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/jobs"
              className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Explore Jobs
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
            >
              Join JobPulse
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;