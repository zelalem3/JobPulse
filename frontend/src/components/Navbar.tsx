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
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* --- LEFT: LOGO BLOCK --- */}
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
              <Briefcase size={20} className="stroke-[2.5]" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Job<span className="text-blue-600">Pulse</span>
            </span>
          </Link>

          {/* --- CENTER / RIGHT: DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">
              Explore Jobs
            </Link>
            
            {isLoggedIn && (
              <Link to="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition flex items-center gap-1.5">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            )}

            <div className="h-4 w-px bg-slate-200" />

            {isLoggedIn ? (
              /* --- STATE: LOGGED IN --- */
              <div className="flex items-center gap-4">
                <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition relative">
                  <Bell size={18} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
                </button>

                {/* Profile Dropdown Container */}
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      U
                    </div>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150">
                      <Link to="/profile" onClick={() => setIsProfileDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 transition">
                        <User size={16} className="text-slate-400" /> View Profile
                      </Link>
                      <button 
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50/50 transition border-t border-slate-100 mt-1"
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
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
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
              className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

        </div>
      </div>

      {/* --- MOBILE RESPONSIVE DRAWER --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-2 pb-4 space-y-3 shadow-inner">
          <Link to="/jobs" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50">
            Explore Jobs
          </Link>
          
          {isLoggedIn ? (
            <>
              <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50">
                Dashboard
              </Link>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50">
                My Profile
              </Link>
              <button 
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 rounded-xl text-base font-semibold text-rose-600 hover:bg-rose-50/50 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <Link 
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full px-4 py-2.5 text-center text-slate-700 font-semibold border border-slate-200 rounded-xl text-sm"
              >
                Sign In
              </Link>
              <Link 
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full px-4 py-2.5 text-center bg-blue-600 text-white font-bold rounded-xl text-sm shadow-sm"
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