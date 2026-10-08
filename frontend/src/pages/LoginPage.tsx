import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import axios from "../services/axios";
import { useAuthStore } from "../store/authStore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginAction = useAuthStore((state) => state.login);
  const token = useAuthStore((state) => state.token);
  const navigate = useNavigate();

  const isLoggedIn = !!token;

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      });

      const { user, token } = response.data;

      loginAction(user, token);
      navigate("/");
    } catch (error: any) {
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
              "Please check your email and password."
          );
        }
      } else {
        setErrorMessage(
          "Unable to sign in. Please check your credentials and try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  }

  const fieldClass =
    "group flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/70 px-3.5 py-3 transition-all duration-200 focus-within:border-indigo-500/70 focus-within:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500/10";

  const inputClass =
    "w-full bg-transparent outline-none text-sm text-slate-100 placeholder:text-slate-500";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-violet-600/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left panel */}
          <div className="hidden border-r border-slate-800 bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 p-10 lg:flex lg:flex-col">
            <div>
              {/* Brand */}
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
                  Welcome back
                </p>

                <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight text-white">
                  Your next
                  <span className="block text-slate-400">
                    opportunity is waiting.
                  </span>
                </h2>

                <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
                  Sign in to continue discovering jobs, managing saved
                  opportunities, and keeping your job search organized.
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
                    Discover relevant jobs
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Browse opportunities collected from multiple sources.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <CheckCircle2 size={16} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Keep your search organized
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Save interesting jobs and manage them from one place.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                  <CheckCircle2 size={16} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    Stay informed
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Set up alerts for the roles you're looking for.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Login panel */}
          <div className="p-6 sm:p-8 lg:p-12">
            {/* Mobile branding */}
            <div className="mb-10 flex items-center justify-between lg:hidden">
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
                to="/register"
                className="text-xs font-semibold text-slate-400 transition hover:text-white"
              >
                Create account
              </Link>
            </div>

            {/* Header */}
            <div className="mb-8">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                <LogIn size={20} />
              </div>

              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Welcome back
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Sign in to continue your job search.
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

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-400">
                  Email address
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
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-400">
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-semibold text-indigo-400 transition hover:text-indigo-300"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className={fieldClass}>
                  <Lock
                    size={17}
                    className="shrink-0 text-slate-500 transition group-focus-within:text-indigo-400"
                  />

                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={inputClass}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/30 transition-all duration-200 hover:bg-indigo-500 hover:shadow-indigo-900/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Register */}
            <div className="mt-8 border-t border-slate-800 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-400 transition hover:text-indigo-300"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

