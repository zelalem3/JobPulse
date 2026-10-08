import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlus,
  User,
  Mail,
  Lock,
  MapPin,
  Briefcase,
  FileText,
  
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import api from "../services/axios";
import { useAuthStore } from "../store/authStore";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [role, setRole] = useState("Full Stack Developer");
  const [location, setLocation] = useState("Addis Ababa");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [bio, setBio] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const login = useAuthStore((state) => state.login);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const isLoggedIn = !!token;

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    if (password !== passwordConfirmation) {
      setErrorMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      await api.get("/sanctum/csrf-cookie");

      const response = await api.post("/api/auth/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role,
        location,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
        bio,
      });

      const { user, token } = response.data;

      login(user, token);
      navigate("/");
    } catch (error: any) {
      console.error("Registration failed:", error);

      if (error.response?.status === 422) {
        const errors = error.response.data?.errors;

        if (errors) {
          const messages = Object.values(errors)
            .flat()
            .join("\n");

          setErrorMessage(messages);
        } else {
          setErrorMessage(
            error.response.data?.message ||
              "Please check your information and try again."
          );
        }
      } else {
        setErrorMessage(
          "Unable to create your account. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    "w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500";

  const fieldClass =
    "group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-3 transition-all duration-200 focus-within:border-indigo-500/70 focus-within:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500/10";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-violet-600/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[0.8fr_1.2fr]">
          {/* Left panel */}
          <div className="hidden border-r border-slate-800 bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 p-10 lg:flex lg:flex-col">
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-950/40">
                  <span className="text-sm font-black">JP</span>
                </span>

                <span>
                  Job<span className="text-indigo-400">Pulse</span>
                </span>
              </Link>

              <div className="mt-20">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">
                  Start your journey
                </p>

                <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white">
                  Find opportunities
                  <span className="block text-slate-400">
                    that fit your skills.
                  </span>
                </h2>

                <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
                  Create your JobPulse profile and get a personalized
                  workspace for discovering, saving, and tracking job
                  opportunities.
                </p>
              </div>
            </div>

            <div className="mt-auto space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Personalized job discovery
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Build a profile that helps surface relevant openings.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Save jobs you care about
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Keep interesting opportunities organized in one place.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Stay ahead with alerts
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Track the roles and technologies you're interested in.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form panel */}
          <div className="p-6 sm:p-8 lg:p-10">
            {/* Mobile branding */}
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link
                to="/"
                className="flex items-center gap-2 text-sm font-bold text-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600">
                  <span className="text-sm font-black">JP</span>
                </span>
                Job<span className="text-indigo-400">Pulse</span>
              </Link>

              <Link
                to="/login"
                className="text-xs font-semibold text-slate-400 transition hover:text-white"
              >
                Sign in
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                <UserPlus size={20} />
              </div>

              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Create your account
              </h1>

              <p className="mt-2 max-w-lg text-sm leading-6 text-slate-400">
                Set up your profile to personalize your JobPulse experience.
              </p>
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-rose-900/60 bg-rose-950/30 px-4 py-3.5 text-sm text-rose-300">
                <AlertCircle
                  size={17}
                  className="mt-0.5 shrink-0 text-rose-400"
                />

                <div className="whitespace-pre-line leading-5">
                  {errorMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-7">
              {/* Account */}
              <section>
                <div className="mb-4">
                  <p className="text-sm font-bold text-white">
                    Account details
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Your basic account information.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Name */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-400">
                      Full name <span className="text-indigo-400">*</span>
                    </label>

                    <div className={fieldClass}>
                      <User
                        size={17}
                        className="shrink-0 text-slate-500 transition group-focus-within:text-indigo-400"
                      />

                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        className={inputClass}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-400">
                      Email address <span className="text-indigo-400">*</span>
                    </label>

                    <div className={fieldClass}>
                      <Mail
                        size={17}
                        className="shrink-0 text-slate-500 transition group-focus-within:text-indigo-400"
                      />

                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={inputClass}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-400">
                      Password <span className="text-indigo-400">*</span>
                    </label>

                    <div className={fieldClass}>
                      <Lock
                        size={17}
                        className="shrink-0 text-slate-500 transition group-focus-within:text-indigo-400"
                      />

                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 8 characters"
                        className={inputClass}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-400">
                      Confirm password{" "}
                      <span className="text-indigo-400">*</span>
                    </label>

                    <div className={fieldClass}>
                      <Lock
                        size={17}
                        className="shrink-0 text-slate-500 transition group-focus-within:text-indigo-400"
                      />

                      <input
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) =>
                          setPasswordConfirmation(e.target.value)
                        }
                        placeholder="Repeat your password"
                        className={inputClass}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Professional profile */}
              <section className="border-t border-slate-800 pt-7">
                <div className="mb-4">
                  <p className="text-sm font-bold text-white">
                    Professional profile
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Help JobPulse understand what opportunities you're
                    looking for.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Role */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-400">
                      Job role / title
                    </label>

                    <div className={fieldClass}>
                      <Briefcase
                        size={17}
                        className="shrink-0 text-slate-500 transition group-focus-within:text-indigo-400"
                      />

                      <input
                        type="text"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        placeholder="Full Stack Developer"
                        className={inputClass}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-400">
                      Location
                    </label>

                    <div className={fieldClass}>
                      <MapPin
                        size={17}
                        className="shrink-0 text-slate-500 transition group-focus-within:text-indigo-400"
                      />

                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Addis Ababa"
                        className={inputClass}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Links */}
              <section className="border-t border-slate-800 pt-7">
                <div className="mb-4">
                  <p className="text-sm font-bold text-white">
                    Portfolio links
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Optional links you can add to your profile.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* GitHub */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-400">
                      GitHub
                    </label>

                    <div className={fieldClass}>
                      <Github
                        size={17}
                        className="shrink-0 text-slate-500 transition group-focus-within:text-indigo-400"
                      />

                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username"
                        className={inputClass}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-400">
                      LinkedIn
                    </label>

                    <div className={fieldClass}>
                      <Linkedin
                        size={17}
                        className="shrink-0 text-slate-500 transition group-focus-within:text-indigo-400"
                      />

                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className={inputClass}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Bio */}
              <section className="border-t border-slate-800 pt-7">
                <div className="mb-4">
                  <p className="text-sm font-bold text-white">
                    About you
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Add a short introduction to your professional background.
                  </p>
                </div>

                <div className="group flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-3 transition-all duration-200 focus-within:border-indigo-500/70 focus-within:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500/10">
                  <FileText
                    size={17}
                    className="mt-0.5 shrink-0 text-slate-500 transition group-focus-within:text-indigo-400"
                  />

                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your experience, skills, or what you're looking for..."
                    rows={4}
                    className="w-full resize-none bg-transparent text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500"
                    disabled={isLoading}
                  />
                </div>
              </section>

              {/* Submit */}
              <div className="border-t border-slate-800 pt-7">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-900/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </>
                  )}
                </button>

                <p className="mt-4 text-center text-xs text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-semibold text-indigo-400 transition hover:text-indigo-300"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

