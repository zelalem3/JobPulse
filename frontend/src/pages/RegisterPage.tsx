import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, User, Mail, Lock, MapPin, Briefcase,  FileText, AlertCircle, Loader2 } from "lucide-react";
import api from '../services/axios';
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
  const navigate = useNavigate();

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
      console.log("🔄 Fetching CSRF cookie...");
      await api.get('/sanctum/csrf-cookie');

      console.log("🔄 Sending registration request...");
      const response = await api.post('/api/auth/register', {
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

      console.log('✅ Registration Successful', response.data);
      const { user, token } = response.data;
      
      login(user, token);
      navigate("/");

    } catch (error: any) {
      console.error('❌ Registration Failed', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });

      if (error.response && error.response.status === 422) {
        const messages = Object.values(error.response.data.errors).flat().join("\n");
        setErrorMessage(messages);
      } else {
        setErrorMessage("An unexpected network error occurred during profile registration.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const token = useAuthStore((state) => state.token);
  const isLoggedIn = !!token;

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-slate-800 selection:text-white">
      <div className="max-w-xl w-full bg-slate-900/60 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
        
        {/* --- BRANDING / HEADER --- */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-slate-950 text-slate-300 rounded-2xl flex items-center justify-center mx-auto border border-slate-800 shadow-inner">
            <UserPlus size={22} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Create Profile & Account
          </h1>
          <p className="text-sm font-semibold text-slate-400">
            Join JobPulse to setup pipeline streams, portfolio links, and monitor remote openings.
          </p>
        </div>

        {/* --- VALIDATION TOAST --- */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-900/80 rounded-2xl flex gap-2.5 items-start text-rose-300 text-xs font-bold leading-relaxed shadow-xl">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="whitespace-pre-line">{errorMessage}</div>
          </div>
        )}

        {/* --- REGISTRATION FORM --- */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Full Name *
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus-within:border-slate-700 transition duration-150 shadow-inner">
                <User size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Zelalem Getnet"
                  className="w-full bg-transparent outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Email Address *
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Password *
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus-within:border-slate-700 transition duration-150 shadow-inner">
                <Lock size={16} className="text-slate-400 shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full bg-transparent outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Confirm Password *
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus-within:border-slate-700 transition duration-150 shadow-inner">
                <Lock size={16} className="text-slate-400 shrink-0" />
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full bg-transparent outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Role / Job Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Job Role / Title
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus-within:border-slate-700 transition duration-150 shadow-inner">
                <Briefcase size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Full Stack Developer"
                  className="w-full bg-transparent outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                Location
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus-within:border-slate-700 transition duration-150 shadow-inner">
                <MapPin size={16} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Addis Ababa"
                  className="w-full bg-transparent outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* GitHub URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                GitHub URL
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus-within:border-slate-700 transition duration-150 shadow-inner">
          
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full bg-transparent outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* LinkedIn URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                LinkedIn URL
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus-within:border-slate-700 transition duration-150 shadow-inner">
                
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full bg-transparent outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Bio Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Short Bio
            </label>
            <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-slate-950/60 border border-slate-800 rounded-2xl focus-within:border-slate-700 transition duration-150 shadow-inner">
              <FileText size={16} className="text-slate-400 shrink-0 mt-1" />
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us a bit about your engineering background..."
                rows={3}
                className="w-full bg-transparent outline-none text-sm font-semibold text-slate-100 placeholder:text-slate-500 resize-none"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 border border-slate-700/60 text-white font-bold rounded-2xl text-sm transition shadow-lg flex items-center justify-center gap-2 select-none cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin text-slate-300" /> Provisioning Node Account...
              </>
            ) : (
              "Create Account & Profile"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400 font-medium">
          Already have clear keys?{" "}
          <a href="/login" className="text-slate-200 font-bold hover:underline">
            Sign In instead
          </a>
        </div>

      </div>
    </div>
  );
};

export default Register;