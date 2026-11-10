import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Bookmark,
  Compass,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? 'bg-emerald-400/10 text-emerald-200'
      : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
    isActive
      ? 'bg-emerald-400/10 text-emerald-200'
      : 'text-slate-200 hover:bg-white/[0.06]'
  }`;

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const logoutAction = useAuthStore((state) => state.logout);
  const isLoggedIn = Boolean(token);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const userEmail = user?.email ?? 'Your account';
  const userInitial = (user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase();

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isProfileDropdownOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsProfileDropdownOpen(false);
    };

    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isProfileDropdownOpen]);

  const handleSignOut = () => {
    logoutAction();
    setIsProfileDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#080d16]/95 text-slate-100 shadow-lg shadow-black/10 backdrop-blur-xl">
      <nav aria-label="Main navigation" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[4.5rem] items-center justify-between gap-4">
          <Link
            to="/"
            aria-label="JobPulse home"
            className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
          >
            <img
              src="/logo.png"
              alt="JobPulse"
              className="h-10 w-auto object-contain sm:h-11"
            />
          </Link>

          <div className="hidden items-center gap-1 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1 lg:flex">
            <NavLink to="/jobs" className={desktopLinkClass}>
              <Compass size={16} aria-hidden="true" />
              Find jobs
            </NavLink>
            {isLoggedIn && (
              <>
                <NavLink to="/saved" className={desktopLinkClass}>
                  <Bookmark size={16} aria-hidden="true" />
                  Saved
                </NavLink>
                <NavLink to="/dashboard" className={desktopLinkClass}>
                  <LayoutDashboard size={16} aria-hidden="true" />
                  Dashboard
                </NavLink>
                <NavLink to="/recommendations" className={desktopLinkClass}>
                  <Sparkles size={16} aria-hidden="true" />
                  For you
                </NavLink>
              </>
            )}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {isLoggedIn ? (
              <>
                <NavLink
                  to="/alerts"
                  aria-label="Job alerts"
                  title="Job alerts"
                  className={({ isActive }) =>
                    `relative rounded-xl border p-2.5 transition-colors ${
                      isActive
                        ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200'
                        : 'border-white/[0.08] text-slate-400 hover:bg-white/[0.06] hover:text-white'
                    }`
                  }
                >
                  <Bell size={18} aria-hidden="true" />
                </NavLink>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsProfileDropdownOpen((open) => !open)}
                    aria-expanded={isProfileDropdownOpen}
                    aria-controls="account-menu"
                    className="flex items-center gap-2 rounded-xl border border-white/[0.08] p-1.5 pl-3 transition-colors hover:border-white/[0.14] hover:bg-white/[0.05]"
                  >
                    <span className="max-w-28 truncate text-xs font-medium text-slate-300">
                      Account
                    </span>
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-400/10 text-xs font-bold text-emerald-200">
                      {userInitial}
                    </span>
                  </button>

                  {isProfileDropdownOpen && (
                    <div
                      id="account-menu"
                      className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-white/[0.1] bg-[#101827] py-2 text-slate-200 shadow-2xl shadow-black/40"
                    >
                      <div className="border-b border-white/[0.08] px-4 py-3">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                          Signed in as
                        </p>
                        <p className="mt-1 truncate text-sm font-medium text-white">
                          {userEmail}
                        </p>
                      </div>
                      <NavLink
                        to="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-3 text-sm transition-colors hover:bg-white/[0.05]"
                      >
                        <User size={16} className="text-slate-400" />
                        Your profile
                      </NavLink>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2.5 border-t border-white/[0.08] px-4 py-3 text-left text-sm text-rose-300 transition-colors hover:bg-rose-400/[0.08]"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-950/25 transition-colors hover:bg-emerald-300"
                >
                  <LogIn size={15} aria-hidden="true" />
                  Create account
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.1] text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white lg:hidden"
          >
            {isMobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-white/[0.08] bg-[#0b111d] px-4 pb-5 pt-3 shadow-xl lg:hidden sm:px-6"
        >
          <div className="mx-auto max-w-7xl space-y-1">
            <NavLink to="/jobs" className={mobileLinkClass}>
              <Compass size={18} aria-hidden="true" />
              Find jobs
            </NavLink>

            {isLoggedIn ? (
              <>
                <NavLink to="/saved" className={mobileLinkClass}>
                  <Bookmark size={18} aria-hidden="true" />
                  Saved jobs
                </NavLink>
                <NavLink to="/dashboard" className={mobileLinkClass}>
                  <LayoutDashboard size={18} aria-hidden="true" />
                  Dashboard
                </NavLink>
                <NavLink to="/recommendations" className={mobileLinkClass}>
                  <Sparkles size={18} aria-hidden="true" />
                  Recommendations
                </NavLink>
                <NavLink to="/alerts" className={mobileLinkClass}>
                  <Bell size={18} aria-hidden="true" />
                  Job alerts
                </NavLink>
                <NavLink to="/profile" className={mobileLinkClass}>
                  <User size={18} aria-hidden="true" />
                  Your profile
                </NavLink>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-semibold text-rose-300 transition-colors hover:bg-rose-400/[0.08]"
                >
                  <LogOut size={18} aria-hidden="true" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="grid gap-2 border-t border-white/[0.08] pt-4 sm:grid-cols-2">
                <Link
                  to="/login"
                  className="rounded-xl border border-white/[0.1] px-4 py-3 text-center text-sm font-semibold text-slate-200 transition-colors hover:bg-white/[0.05]"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-emerald-400 px-4 py-3 text-center text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-300"
                >
                  Create account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
