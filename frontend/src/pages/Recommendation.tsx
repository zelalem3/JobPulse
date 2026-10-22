import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  MapPin,
  RefreshCw,
  Sparkles,
  XCircle,
} from "lucide-react";
import api from "../services/axios";

interface Skill {
  id?: number;
  name: string;
  created_at?: string;
  updated_at?: string;
  pivot?: unknown;
}

interface RecommendedJob {
  id: number;
  title: string;
  company?: { name?: string } | string | null;
  location?: string | null;
  employment_type?: string | null;
  experience_level?: string | null;
  salary?: string | number | null;
  match_score?: number;
  score?: number;
  recommendation_score?: number;
  matching_skills_count?: number;
  matched_skills?: (string | Skill)[];
  missing_skills?: (string | Skill)[];
  skills?: (string | Skill)[];
  description?: string | null;
}

function getSkillId(skill: string | Skill): number | null {
  if (typeof skill === "object" && skill?.id != null) return Number(skill.id);
  return null;
}

function getSkillName(skill: string | Skill): string {
  if (typeof skill === "string") return skill;
  return skill?.name ?? "Unknown skill";
}

function getCompanyName(company: RecommendedJob["company"]): string {
  if (typeof company === "string") return company;
  return company?.name || "Company not specified";
}

/** Enrich each job so the UI always has match_score + missing_skills */
function enrichJob(job: RecommendedJob): RecommendedJob {
  const allSkills = job.skills ?? [];
  const matched = job.matched_skills ?? [];

  const matchedIds = new Set<number>();
  const matchedNames = new Set<string>();

  for (const s of matched) {
    const id = getSkillId(s);
    if (id != null) matchedIds.add(id);
    matchedNames.add(getSkillName(s).toLowerCase());
  }

  const missing =
    job.missing_skills ??
    allSkills.filter((s) => {
      const id = getSkillId(s);
      if (id != null) return !matchedIds.has(id);
      return !matchedNames.has(getSkillName(s).toLowerCase());
    });

  let matchScore = Number(job.match_score ?? job.score ?? NaN);

  if (Number.isNaN(matchScore) || matchScore === 0) {
    const total = allSkills.length || matched.length + missing.length;
    if (total > 0) {
      matchScore = Math.round((matched.length / total) * 100);
    } else if (
      job.matching_skills_count != null &&
      job.matching_skills_count > 0
    ) {
      matchScore = Math.min(100, Number(job.matching_skills_count) * 20);
    } else {
      matchScore = 0;
    }
  }

  if (matchScore > 0 && matchScore <= 1) {
    matchScore = matchScore * 100;
  }

  return {
    ...job,
    match_score: Math.max(0, Math.min(100, Math.round(matchScore))),
    matched_skills: matched,
    missing_skills: missing,
  };
}

function normalizeJobs(data: unknown): RecommendedJob[] {
  let list: RecommendedJob[] = [];

  if (Array.isArray(data)) {
    list = data as RecommendedJob[];
  } else if (data && typeof data === "object") {
    const response = data as Record<string, unknown>;
    for (const key of ["recommendations", "data", "jobs"]) {
      if (Array.isArray(response[key])) {
        list = response[key] as RecommendedJob[];
        break;
      }
    }
  }

  return list.map(enrichJob);
}

function getMatchScore(job: RecommendedJob): number {
  return Math.max(0, Math.min(100, Number(job.match_score ?? 0)));
}

export default function Recommendation() {
  const navigate = useNavigate();

  const [jobs, setJobs] = useState<RecommendedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecommendations = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/recommendations");
      setJobs(normalizeJobs(response.data));
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as { response?: { status?: number } }).response?.status === 401
      ) {
        setError("Please sign in to view your recommendations.");
      } else if (err instanceof Error) {
        setError(
          err.message || "Unable to load recommendations. Please try again."
        );
      } else {
        setError("Unable to load recommendations. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRecommendations();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <section className="relative mb-8 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/50 p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-xs font-semibold text-indigo-300">
                <Sparkles size={14} />
                Personalized for you
              </div>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Recommended Jobs
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
                Discover opportunities that align with your skills, experience,
                and career goals.
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-700/70 bg-slate-950/40 px-4 py-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-300">
                <BriefcaseBusiness size={22} />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{jobs.length}</p>
                <p className="text-xs text-slate-400">Recommendations</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section heading */}
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Your job matches</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ranked by your compatibility
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchRecommendations()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:border-indigo-500/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60 p-6"
              >
                <div className="mb-4 h-5 w-2/3 rounded bg-slate-800" />
                <div className="mb-3 h-4 w-1/3 rounded bg-slate-800" />
                <div className="mb-6 h-3 w-full rounded bg-slate-800" />
                <div className="h-10 rounded-xl bg-slate-800" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
            <XCircle className="mx-auto mb-3 text-rose-400" size={30} />
            <h3 className="font-semibold text-white">
              Couldn&apos;t load recommendations
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void fetchRecommendations()}
              className="mt-5 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && jobs.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
              <Sparkles size={26} />
            </div>
            <h3 className="mt-5 text-lg font-semibold">
              Your next opportunity starts here
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              We don&apos;t have recommendations for you yet. Update your
              profile and skills to help us find relevant jobs.
            </p>
            <button
              type="button"
              onClick={() => navigate("/jobs")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              Explore all jobs <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Recommendation cards */}
        {!loading && !error && jobs.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {jobs.map((job) => {
              const score = getMatchScore(job);
              const matched = job.matched_skills ?? [];
              const missing = job.missing_skills ?? [];
              const company = getCompanyName(job.company);

              return (
                <article
                  key={job.id}
                  className="group flex flex-col rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/40 hover:bg-slate-900 sm:p-6"
                >
                  {/* Job title and match score */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold leading-snug text-slate-100 transition-colors group-hover:text-indigo-300">
                        {job.title}
                      </h3>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-400">
                        <Building2 size={15} className="shrink-0" />
                        <span className="truncate">{company}</span>
                      </p>
                    </div>

                    <div className="shrink-0 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-center">
                      <p className="text-xl font-bold text-emerald-400">
                        {score}%
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400/70">
                        Match
                      </p>
                    </div>
                  </div>

                  {/* Match progress */}
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs text-slate-500">
                      <span>Compatibility</span>
                      <span>{score}%</span>
                    </div>
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-slate-800"
                      role="progressbar"
                      aria-label={`Match score for ${job.title}`}
                      aria-valuenow={score}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>

                  {/* Job details */}
                  <div className="mt-5 flex flex-wrap gap-2">
                    {job.location && (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-400">
                        <MapPin size={13} />
                        {job.location}
                      </span>
                    )}

                    {job.employment_type && (
                      <span className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-400">
                        {job.employment_type}
                      </span>
                    )}

                    {job.experience_level && (
                      <span className="rounded-lg border border-slate-800 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-400">
                        {job.experience_level}
                      </span>
                    )}
                  </div>

                  {/* Skills */}
                  {(matched.length > 0 || missing.length > 0) && (
                    <div className="mt-6 space-y-4">
                      {matched.length > 0 && (
                        <div>
                          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                            <CheckCircle2 size={14} />
                            Matching skills
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {matched.map((skill, index) => {
                              const name = getSkillName(skill);
                              const key =
                                typeof skill === "object" && skill.id != null
                                  ? `m-${skill.id}`
                                  : `m-${name}-${index}`;
                              return (
                                <span
                                  key={key}
                                  className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-2.5 py-1 text-xs text-emerald-300"
                                >
                                  {name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {missing.length > 0 && (
                        <div>
                          <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber-400">
                            <XCircle size={14} />
                            Skills to develop
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {missing.map((skill, index) => {
                              const name = getSkillName(skill);
                              const key =
                                typeof skill === "object" && skill.id != null
                                  ? `x-${skill.id}`
                                  : `x-${name}-${index}`;
                              return (
                                <span
                                  key={key}
                                  className="rounded-lg border border-amber-500/15 bg-amber-500/5 px-2.5 py-1 text-xs text-amber-300"
                                >
                                  {name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto mt-6 flex items-center justify-between gap-3 border-t border-slate-800/80 pt-5">
                    <span className="text-xs text-slate-500">
                      {score >= 80
                        ? "Strong match"
                        : score >= 50
                          ? "Potential match"
                          : "Explore this opportunity"}
                    </span>

                    <button
                      type="button"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-indigo-500/10 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500 hover:text-white"
                    >
                      View job <ArrowRight size={15} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}