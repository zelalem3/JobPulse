import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import { Briefcase, User, LogOut, LogIn, Menu, X, Bell, LayoutDashboard } from 'lucide-react';
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
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-50 font-sans text-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* --- LEFT: LOGO BLOCK --- */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-slate-800 text-slate-200 border border-slate-700 rounded-xl shadow-lg group-hover:border-slate-600 transition-colors">
              <Briefcase size={20} className="stroke-[2.5]" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              Job<span className="text-slate-400">Pulse</span>
            </span>
          </Link>

          {/* --- CENTER / RIGHT: DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
              Explore Jobs
            </Link>
            
            {isLoggedIn && (
              <Link to="/dashboard" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors flex items-center gap-1.5">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            )}

            <div className="h-4 w-px bg-slate-800" />

            {isLoggedIn ? (
              /* --- STATE: LOGGED IN --- */
              <div className="flex items-center gap-4">
                <Link
                  to="/alerts"
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all relative border border-transparent hover:border-slate-700/80"
                >
                  <Bell size={18} />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-slate-300 rounded-full animate-pulse" />
                </Link>

                {/* Profile Dropdown Container */}
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/80 transition-all border border-slate-800 hover:border-slate-700"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-700">
                      Z
                    </div>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-1.5 text-slate-200 backdrop-blur-xl">
                      <Link to="/profile" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-slate-800 transition-colors">
                        <User size={16} className="text-slate-400" /> View Profile
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-slate-800 mt-1"
                      >
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* --- STATE: GUEST / NOT LOGGED IN --- */
              <div className="flex items-center gap-3">
                <Link 
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl shadow-lg border border-slate-700 transition-all flex items-center gap-1.5"
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
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* --- MOBILE RESPONSIVE DRAWER --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2 shadow-2xl">
          <Link to="/jobs" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
            Explore Jobs
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
                Dashboard
              </Link>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-base font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
                My Profile
              </Link>
              <button 
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2.5 rounded-xl text-base font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors border-t border-slate-800 mt-2"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-3 border-t border-slate-800 space-y-2.5">
              <Link 
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full px-4 py-2.5 text-center text-slate-300 font-semibold border border-slate-700 bg-slate-900 rounded-xl text-sm hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full px-4 py-2.5 text-center bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-sm shadow-lg border border-slate-700 transition-all"
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