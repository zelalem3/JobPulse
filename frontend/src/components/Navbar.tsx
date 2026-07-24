import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Briefcase, User, LogOut, LogIn, Menu, X, Bell, LayoutDashboard, Bookmark, Compass } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const navigate = useNavigate();
  
  const token = useAuthStore((state) => state.token);
  const isLoggedIn = !!token;
  const logoutAction = useAuthStore((state) => state.logout);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);

  const handleSignOut = () => {
    logoutAction();
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-slate-900/90 backdrop-blur-2xl border-b border-slate-800/80 sticky top-0 z-50 font-sans text-slate-100 shadow-xl shadow-slate-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 items-center py-3">
          
          {/* --- LEFT: LOGO BLOCK --- */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 rounded-2xl shadow-lg group-hover:bg-indigo-600/20 group-hover:border-indigo-500/40 transition-all">
              <Briefcase size={20} className="stroke-[2.5]" />
            </div>
            <span className="text-xl font-black text-white tracking-tight flex items-center">
              Job<span className="text-indigo-400">Pulse</span>
            </span>
          </Link>

          {/* --- CENTER: PRIMARY NAVIGATION --- */}
          <div className="hidden md:flex items-center gap-1 bg-slate-800/40 border border-slate-800/80 p-1.5 rounded-2xl shadow-inner">
            <Link 
              to="/jobs" 
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all flex items-center gap-2"
            >
              <Compass size={16} className="text-indigo-400" /> Explore Jobs
            </Link>

            {isLoggedIn && (
              <>
                <Link 
                  to="/saved" 
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all flex items-center gap-2"
                >
                  <Bookmark size={16} className="text-blue-400" /> Saved Jobs
                </Link>
                <Link 
                  to="/dashboard" 
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all flex items-center gap-2"
                >
                  <LayoutDashboard size={16} className="text-emerald-400" /> Dashboard
                </Link>
              </>
            )}
          </div>

          {/* --- RIGHT: USER UTILITIES / AUTH --- */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/alerts"
                  className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all relative border border-slate-800 hover:border-slate-700"
                  title="Notifications"
                >
                  <Bell size={18} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </Link>

                {/* Profile Dropdown Container */}
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-3 rounded-2xl hover:bg-slate-800/80 transition-all border border-slate-800 hover:border-slate-700 group"
                  >
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white">Account</span>
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30">
                      Z
                    </div>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 text-slate-200 backdrop-blur-xl animate-in fade-in slide-in-from-top-2">
                      <div className="px-4 py-2 border-b border-slate-800/80 mb-1">
                        <p className="text-xs text-slate-400">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">jobseeker@jobpulse.io</p>
                      </div>
                      <Link to="/profile" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium hover:bg-slate-800/80 transition-colors">
                        <User size={16} className="text-slate-400" /> View Profile
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-slate-800/80 mt-1"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link 
                  to="/login"
                  className="px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-600/20 border border-indigo-500 transition-all flex items-center gap-1.5"
                >
                  <LogIn size={15} /> Get Started
                </Link>
              </div>
            )}
          </div>

          {/* --- MOBILE MENU TOGGLE BUTTON --- */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* --- MOBILE RESPONSIVE DRAWER --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur-2xl px-4 pt-4 pb-6 space-y-2.5 shadow-2xl">
          <Link 
            to="/jobs" 
            onClick={() => setIsMobileMenuOpen(false)} 
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-200 hover:bg-slate-800/80 transition-colors"
          >
            <Compass size={18} className="text-indigo-400" /> Explore Jobs
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link 
                to="/saved" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-200 hover:bg-slate-800/80 transition-colors"
              >
                <Bookmark size={18} className="text-blue-400" /> Saved Jobs
              </Link>
              <Link 
                to="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-200 hover:bg-slate-800/80 transition-colors"
              >
                <LayoutDashboard size={18} className="text-emerald-400" /> Dashboard
              </Link>
              <Link 
                to="/profile" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-200 hover:bg-slate-800/80 transition-colors"
              >
                <User size={18} className="text-slate-400" /> My Profile
              </Link>
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-slate-800 mt-3"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <Link 
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full px-4 py-3 text-center text-slate-200 font-semibold border border-slate-700 bg-slate-900 rounded-xl text-sm hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full px-4 py-3 text-center bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-indigo-600/20 border border-indigo-500 transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}