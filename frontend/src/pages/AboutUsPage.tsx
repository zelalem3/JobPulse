import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  CheckCircle2,
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
    title: "Discover more",
    description:
      "Opportunities from multiple sources in one organized job-search experience.",
    accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25",
  },
  {
    icon: Target,
    title: "Better matches",
    description:
      "Roles that align with your skills, experience, interests, and career goals.",
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  },
  {
    icon: BarChart3,
    title: "Understand the market",
    description:
      "See which skills are in demand, who’s hiring, and how the market is shifting.",
    accent: "text-sky-400 bg-sky-500/10 border-sky-500/25",
  },
  {
    icon: Bell,
    title: "Stay ahead",
    description:
      "Relevant alerts and recommendations instead of constantly searching by hand.",
    accent: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  },
];

const capabilities = [
  "Automated job discovery",
  "Personalized recommendations",
  "Skill and market intelligence",
  "Company hiring insights",
  "Keyword job alerts",
  "Centralized search experience",
];

const pillars = [
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

const questions = [
  "Which jobs are right for me?",
  "What skills are employers looking for?",
  "Which companies are hiring?",
  "How is the market changing?",
  "What skills should I learn next?",
  "Where are opportunities growing?",
];

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative overflow-hidden">
      {/* Ambient */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px] bg-emerald-600/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none absolute top-[40%] right-0 w-[360px] h-[360px] bg-indigo-600/8 rounded-full blur-[100px]" />

      {/* Hero */}
      <section className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-16 sm:pb-24 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles size={13} />
            About JobPulse
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight max-w-4xl mx-auto">
            Making the job search{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              smarter
            </span>
          </h1>

          <p className="mt-5 sm:mt-6 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            JobPulse brings openings together, turns market data into clear
            insights, and helps you find roles that match your goals—not just
            whatever is posted today.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/jobs"
              className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-950/40 border border-emerald-400/20 transition-all"
            >
              Explore jobs
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900/80 border border-slate-800 hover:border-slate-600 hover:bg-slate-800 transition-all"
            >
              Create free account
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="relative z-10 border-y border-slate-800/70 bg-slate-900/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {pillars.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-5 sm:p-6 hover:border-emerald-500/25 transition-colors"
              >
                <p className="text-xs font-bold text-emerald-400/90 tabular-nums tracking-wider">
                  {item.value}
                </p>
                <h3 className="mt-2 text-base font-bold text-white">
                  {item.label}
                </h3>
                <p className="mt-1.5 text-sm text-slate-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
              What you get
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-tight">
              Built for serious job seekers
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Less noise, more signal—tools that help you act on the market
              instead of chasing every listing.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {features.map(({ icon: Icon, title, description, accent }) => (
              <div
                key={title}
                className="group rounded-2xl sm:rounded-3xl border border-slate-800/70 bg-slate-900/60 p-5 sm:p-6 hover:border-slate-700 hover:bg-slate-900/80 transition-all"
              >
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center ${accent}`}
                >
                  <Icon size={18} />
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More than a board */}
      <section className="relative z-10 border-t border-slate-800/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-400">
              More than a job board
            </p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-tight">
              Don’t just ask “what’s available?”
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Ask the questions that improve your next career move.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {questions.map((q) => (
              <div
                key={q}
                className="flex items-start gap-3 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-4 sm:p-5 hover:border-indigo-500/30 transition-colors"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 shadow-sm shadow-indigo-400/50" />
                <p className="text-sm font-medium text-slate-300">{q}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities + story */}
      <section className="relative z-10 border-t border-slate-800/70 bg-slate-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Zap size={14} />
                Platform
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                One place for discovery and insight
              </h2>
              <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                Job listings are scattered across boards, company sites, and
                channels. JobPulse aggregates and organizes them so you can
                search once, save what matters, and track skills that employers
                actually want.
              </p>

              <ul className="mt-6 space-y-3">
                {capabilities.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-400 shrink-0"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: Globe2,
                  title: "Multi-source intake",
                  body: "Jobs pulled from diverse channels into a single feed.",
                },
                {
                  icon: Users,
                  title: "Built for people",
                  body: "Save roles, set alerts, and focus on fit—not noise.",
                },
                {
                  icon: TrendingUp,
                  title: "Market signals",
                  body: "Trends, sources, and hiring activity at a glance.",
                },
                {
                  icon: Briefcase,
                  title: "Career workflow",
                  body: "From discovery to application tracking in one product.",
                },
              ].map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-5 hover:border-slate-700 transition-colors"
                >
                  <Icon size={18} className="text-teal-400" />
                  <h3 className="mt-3 text-sm font-bold text-white">{title}</h3>
                  <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="relative z-10 border-t border-slate-800/70">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-400">
            Vision
          </p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-black text-white tracking-tight">
            A clearer path to opportunity
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 leading-relaxed">
            A future where job seekers get better information, employers reach
            the right talent, and data helps everyone make smarter career
            decisions. Our aim is to be a trusted job intelligence platform—
            starting where talent and opportunity need connection most.
          </p>
          <div className="mt-8">
            <Link
              to="/jobs"
              className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-950/40 border border-indigo-400/20 transition-all"
            >
              Start exploring
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 border-t border-slate-800/70 bg-slate-900/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Your next role could be closer than you think
          </h2>
          <p className="mt-4 text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Explore openings, see what’s in demand, and take the next step with
            JobPulse.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              to="/jobs"
              className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all"
            >
              Explore jobs
              <ArrowRight
                size={16}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-200 border border-slate-700 bg-slate-900 hover:bg-slate-800 transition-all"
            >
              Join JobPulse
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
