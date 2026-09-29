import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  CheckCircle2,
} from 'lucide-react';

export const Header = ({
  title = 'Dashboard Overview',
  subtitle = '',
  statusText = 'MongoDB Active • Hardhat EVM Connected',
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [statusTooltipOpen, setStatusTooltipOpen] = useState(false);
  const headerRef = useRef(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
        setStatusTooltipOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setProfileDropdownOpen(false);
        setStatusTooltipOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    setProfileDropdownOpen(false);
    sessionStorage.clear();
    localStorage.clear();
    window.dispatchEvent(new Event('admin-session-expired'));
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-20 h-16 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-3.5 sm:px-6 transition-all">
      {/* Title & Page Header */}
      <div className="min-w-0 pr-2 flex flex-col justify-center">
        <h1 className="text-sm sm:text-base lg:text-lg font-extrabold text-white tracking-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[11px] text-slate-400 font-medium truncate hidden sm:block">
            {subtitle}
          </p>
        )}
      </div>

      {/* Action / Status Controls */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* System Health / Status Badge */}
        <div className="relative">
          {/* Desktop & Tablet Badge */}
          <div
            className="hidden md:flex items-center gap-2 bg-slate-900/90 hover:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-xs font-semibold text-slate-300 shadow-sm transition-colors cursor-default"
            title={statusText}>
            <div className="relative flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="absolute w-3.5 h-3.5 rounded-full bg-emerald-500/30 animate-ping" />
            </div>
            <span className="truncate max-w-[220px] lg:max-w-none">{statusText}</span>
          </div>

          {/* Mobile Status Dot (Clickable with Tooltip Popover) */}
          <button
            type="button"
            onClick={() => setStatusTooltipOpen((prev) => !prev)}
            className="md:hidden flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-full border border-slate-800 text-[11px] font-semibold text-emerald-400 active:scale-95 transition-all cursor-pointer"
            aria-label="View system status"
            aria-expanded={statusTooltipOpen}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
            <span className="text-[10px] font-bold tracking-wide">EVM LIVE</span>
          </button>

          {/* Mobile Status Tooltip Dropdown */}
          {statusTooltipOpen && (
            <div className="md:hidden absolute right-0 top-full mt-2 w-64 bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-xl z-50 text-xs text-slate-300 space-y-1.5 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-2 text-emerald-400 font-bold pb-1 border-b border-slate-800">
                <CheckCircle2 size={14} />
                <span>System Operational</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {statusText}
              </p>
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span>EVM Chain ID: 31337</span>
                <span className="text-emerald-500">Latency: 24ms</span>
              </div>
            </div>
          )}
        </div>

        {/* Notifications Quick Icon (Desktop) */}
        <Link
          to="/notifications"
          className="hidden sm:flex p-2 text-slate-400 hover:text-amber-300 hover:bg-slate-900 rounded-xl border border-transparent hover:border-slate-800 transition-all relative"
          aria-label="System Notifications">
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-slate-950 animate-pulse" />
        </Link>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-1 pr-2 sm:px-3 py-1 bg-slate-900 hover:bg-slate-800/80 rounded-full border border-slate-800 text-slate-100 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            aria-label="Admin User Menu"
            aria-expanded={profileDropdownOpen}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-black text-xs sm:text-sm text-white shadow-md shadow-indigo-600/30 flex-shrink-0">
              A
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-100 leading-tight">Admin Supervisor</span>
              <span className="text-[10px] font-semibold text-indigo-400 leading-none">Super Admin</span>
            </div>
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform duration-200 ${
                profileDropdownOpen ? 'rotate-180 text-white' : ''
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
              {/* Profile Header */}
              <div className="px-3 py-2.5 border-b border-slate-800 mb-1">
                <p className="text-xs font-extrabold text-white">Admin Supervisor</p>
                <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">admin@verify.gov.in</p>
                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-500/50 text-[10px] font-bold text-indigo-300">
                  Role: Master Authority
                </div>
              </div>

              {/* Menu Links */}
              <Link
                to="/admin-profile"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-semibold">
                <User size={15} className="text-indigo-400" />
                <span>My Profile & MFA</span>
              </Link>

              <Link
                to="/system-settings"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-semibold">
                <Settings size={15} className="text-sky-400" />
                <span>System Settings</span>
              </Link>

              <Link
                to="/security"
                onClick={() => setProfileDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-semibold">
                <Shield size={15} className="text-amber-400" />
                <span>Security Policy</span>
              </Link>

              <div className="border-t border-slate-800 my-1 pt-1">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-950/40 transition-colors font-semibold text-left cursor-pointer">
                  <LogOut size={15} />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
