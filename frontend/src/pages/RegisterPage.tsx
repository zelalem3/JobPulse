import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for routing
import { UserPlus, User, Mail, Lock, AlertCircle, Loader2 } from "lucide-react"; // UI icons
import api from '../services/axios';
import { useAuthStore } from "../store/authStore";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate(); // Hook for standard redirect handling

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Client-side fast verification check before making network requests
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
      });

      console.log('✅ Registration Successful', response.data);
      const { user, token } = response.data;
      
      // Seed global auth state vectors
      login(user, token);

      // Bounce user straight onto the home platform index
      navigate("/");

    } catch (error: any) {
      console.error('❌ Registration Failed', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });

      if (error.response && error.response.status === 422) {
        // Flatten and join nested validation string maps coming from Laravel
        const messages = Object.values(error.response.data.errors).flat().join("\n");
        setErrorMessage(messages);
      } else {
        setErrorMessage("An unexpected network error occurred during profile registration.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        
        {/* --- BRANDING / HEADER HEADER --- */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto border border-blue-100/50">
            <UserPlus size={22} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Create Account
          </h1>
          <p className="text-sm text-slate-400">
            Join JobPulse to setup pipeline streams and monitor remote openings.
          </p>
        </div>

        {/* --- DYNAMIC INLINE VALIDATION TOAST DISMISSAL --- */}
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl flex gap-2.5 items-start text-red-600 text-xs font-medium leading-relaxed">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <div className="whitespace-pre-line">{errorMessage}</div>
          </div>
        )}

        {/* --- SUBMIT ACTIONS FORM --- */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          
          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Full Name
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:bg-white transition duration-150">
              <User size={16} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Email Address
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:bg-white transition duration-150">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Password
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:bg-white transition duration-150">
              <Lock size={16} className="text-slate-400 shrink-0" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Confirmation Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Confirm Password
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus-within:border-blue-500 focus-within:bg-white transition duration-150">
              <Lock size={16} className="text-slate-400 shrink-0" />
              <input
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder="Repeat password"
                className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Core Submission Trigger */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-2 select-none"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Provisioning Node Account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Form Footer */}
        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-400 font-medium">
          Already have clear keys?{" "}
          <a href="/login" className="text-blue-600 font-bold hover:underline">
            Sign In instead
          </a>
        </div>

      </div>
    </div>
  );
};

export default Register;