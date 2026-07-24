import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";
import axios from "../services/axios";
import { useAuthStore } from '../store/authStore'; 


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loginAction = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await axios.post("/api/auth/login", {
        email,
        password
      });
      
      console.log("login successful", response.data);
      const { user, token } = response.data;
      
      // Update global auth state
      loginAction(user, token);

      // Smoothly bounce user down onto home feed/dashboard
      navigate("/");

    } catch (error: any) {
      if (error.response && error.response.status === 422) {
          console.error("Laravel Validation Error Details:", error.response.data.errors);
          // Extract and flatten validation errors from backend payload safely
          const messages = Object.values(error.response.data.errors).flat().join("\n");
          setErrorMessage(messages);
      } else {
          console.error("Generic Login Failure:", error);
          setErrorMessage("Invalid credentials or server connection issue.");
      }
    } finally {
      setIsLoading(false);
    }
  }
  
  const token = useAuthStore((state) => state.token);
  const isLoggedIn = !!token;

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, navigate]);



  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans selection:bg-slate-800 selection:text-white">
      <div className="max-w-md w-full bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-800/80 shadow-xl space-y-6">
        
        {/* --- BRANDING / HEADER HEADER --- */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-slate-950 text-slate-300 rounded-2xl flex items-center justify-center mx-auto border border-slate-800 shadow-inner">
            <LogIn size={22} className="ml-0.5" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm font-semibold text-slate-400">
            Sign in to manage your pipeline indexes and alerts.
          </p>
        </div>

        {/* --- DYNAMIC INLINE VALIDATION TOAST DISMISSAL --- */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-900/80 rounded-2xl flex gap-2.5 items-start text-rose-300 text-xs font-bold leading-relaxed shadow-xl">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="whitespace-pre-line">{errorMessage}</div>
          </div>
        )}

        {/* --- SUBMIT ACTIONS FORM --- */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {/* Email Block */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Email Address
            </label>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus-within:border-slate-700 transition duration-150 shadow-inner">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <input
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-transparent outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Block */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Password
              </label>
              <a href="#forgot" className="text-xs font-semibold text-slate-300 hover:text-white transition">
                Forgot?
              </a>
            </div>
            <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus-within:border-slate-700 transition duration-150 shadow-inner">
              <Lock size={16} className="text-slate-400 shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Core Submission Trigger */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 border border-slate-700/60 text-white font-bold rounded-2xl text-sm transition shadow-lg flex items-center justify-center gap-2 select-none cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin text-slate-300" /> Verifying Credentials...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Form Footer */}
        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400 font-medium">
          Don't have platform clear keys?{" "}
          <a href="#register" className="text-slate-200 font-bold hover:underline">
            Request Access
          </a>
        </div>

      </div>
    </div>
  );
};

export default Login;