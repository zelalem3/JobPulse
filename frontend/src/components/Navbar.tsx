import React, { useState } from 'react';
import { Briefcase, User, LogOut, LogIn, Menu, X, Bell, LayoutDashboard } from 'lucide-react';
import { Link } from 'lucide-react';

export default function Navbar() {
  // Mock state to replicate your authentication status (Change to true/false to test states)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);

  // Temporary function to toggle login state for previewing
  const toggleAuth = () => {
    setIsLoggedIn(!isLoggedIn);
    setIsProfileDropdownOpen(false);
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* --- LEFT: LOGO BLOCK --- */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-sm">
              <Briefcase size={20} className="stroke-[2.5]" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Job<span className="text-blue-600">Pulse</span>
            </span>
          </div>

          {/* --- CENTER / RIGHT: DESKTOP NAVIGATION --- */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">
              Explore Jobs
            </a>
            
            {/* Conditional Nav Items based on Auth State */}
            {isLoggedIn && (
              <a href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition flex items-center gap-1.5">
                <LayoutDashboard size={16} /> Dashboard
              </a>
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
                      Z
                    </div>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-1 text-slate-700 animate-in fade-in slide-in-from-top-1 duration-150">
                      <a href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 transition">
                        <User size={16} className="text-slate-400" /> View Profile
                      </a>
                      <button 
                        onClick={toggleAuth}
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
                <button 
                  onClick={toggleAuth}
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition"
                >
                  Sign In
                </button>
                <button 
                  onClick={toggleAuth}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <LogIn size={15} /> Get Started
                </button>
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
          <a href="#" className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50">
            Explore Jobs
          </a>
          
          {isLoggedIn ? (
            <>
              <a href="/dashboard" className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50">
                Dashboard
              </a>
              <a href="/profile" className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-700 hover:bg-slate-50">
                My Profile
              </a>
              <button 
                onClick={toggleAuth}
                className="w-full text-left px-3 py-2 rounded-xl text-base font-semibold text-rose-600 hover:bg-rose-50/50 transition"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button 
                onClick={toggleAuth}
                className="w-full px-4 py-2.5 text-center text-slate-700 font-semibold border border-slate-200 rounded-xl text-sm"
              >
                Sign In
              </button>
              <button 
                onClick={toggleAuth}
                className="w-full px-4 py-2.5 text-center bg-blue-600 text-white font-bold rounded-xl text-sm shadow-sm"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Dev Helper Switch (Bottom right corner badge) */}
      <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-3 py-1.5 text-xs font-mono rounded-full z-50 opacity-40 hover:opacity-100 transition shadow cursor-pointer" onClick={toggleAuth}>
        🛠️ Auth Status: {isLoggedIn ? 'LOGGED_IN' : 'GUEST'}
      </div>
    </nav>
  );
}