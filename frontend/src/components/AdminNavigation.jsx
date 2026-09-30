import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Activity,
  FileCheck,
  UserCheck,
  Users,
  Database,
  ShieldAlert,
  Bell,
  Shield,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';

function NavigationMenu({
  location,
  docsOpen,
  setDocsOpen,
  policeOpen,
  setPoliceOpen,
  onNavigate,
  pendingDocsCount = 0,
  pendingOfficersCount = 0,
}) {
  return (
    <nav className="flex flex-col gap-1 flex-1 text-xs font-semibold overflow-y-auto pr-1">
      {/* Dashboard Link */}
      <NavLink
        to="/"
        end
        onClick={onNavigate}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
            isActive
              ? 'bg-indigo-950 text-white border border-indigo-500 font-extrabold shadow-sm'
              : 'text-[#596383] hover:bg-[#f4f7fc] hover:text-[#090a23]'
          }`
        }>
        <Activity size={16} className="text-[#6442ff] flex-shrink-0" />
        <span>Dashboard</span>
      </NavLink>

      {/* Documents Group */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setDocsOpen(!docsOpen)}
          className="w-full flex items-center justify-between px-3.5 py-2 text-[#596383] hover:text-[#090a23] rounded-lg transition-colors font-bold text-[11px] uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <FileCheck size={16} className="text-[#6442ff] flex-shrink-0" />
            <span>Documents</span>
          </span>
          <div className="flex items-center gap-1.5">
            {pendingDocsCount > 0 && (
              <span className="bg-amber-500 text-[#ffffff] text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {pendingDocsCount}
              </span>
            )}
            {docsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        </button>

        {docsOpen && (
          <div className="pl-6 pt-1 space-y-1">
            {[
              ['Pending Queue', 'PENDING'],
              ['Under Review', 'UNDER_REVIEW'],
              ['Approved', 'APPROVED'],
              ['Rejected', 'REJECTED'],
            ].map(([label, status]) => {
              const target = `/document-queue?status=${status}`;
              const isActive =
                location.pathname === '/document-queue' && location.search.includes(`status=${status}`);
              return (
                <NavLink
                  key={status}
                  to={target}
                  onClick={onNavigate}
                  className={`block px-3 py-2 rounded-lg text-xs transition-colors ${
                    isActive
                      ? 'bg-indigo-900/60 text-white font-bold border-l-2 border-indigo-500'
                      : 'text-[#596383] hover:text-[#171438] hover:bg-[#f4f7fc]/50'
                  }`}>
                  {label}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      {/* Citizen Users */}
      <div className="pt-2">
        <NavLink
          to="/user-management"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              isActive
                ? 'bg-indigo-950 text-white border border-indigo-500 font-extrabold shadow-sm'
                : 'text-[#596383] hover:bg-[#f4f7fc] hover:text-[#090a23]'
            }`
          }>
          <Users size={16} className="text-[#009df2] flex-shrink-0" />
          <span>Citizen Users</span>
        </NavLink>
      </div>

      {/* Police / Government Group */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setPoliceOpen(!policeOpen)}
          className="w-full flex items-center justify-between px-3.5 py-2 text-[#596383] hover:text-[#090a23] rounded-lg transition-colors font-bold text-[11px] uppercase tracking-wider">
          <span className="flex items-center gap-2">
            <UserCheck size={16} className="text-[#bd8100] flex-shrink-0" />
            <span>Police / Government</span>
          </span>
          <div className="flex items-center gap-1.5">
            {pendingOfficersCount > 0 && (
              <span className="bg-amber-500 text-[#ffffff] text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {pendingOfficersCount}
              </span>
            )}
            {policeOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        </button>

        {policeOpen && (
          <div className="pl-6 pt-1 space-y-1">
            {[
              ['Pending Requests', 'PENDING'],
              ['Approved Officers', 'APPROVED'],
              ['Rejected', 'REJECTED'],
              ['Suspended', 'SUSPENDED'],
            ].map(([label, status]) => {
              const target = `/officer-queue?status=${status}`;
              const isActive =
                location.pathname === '/officer-queue' && location.search.includes(`status=${status}`);
              return (
                <NavLink
                  key={status}
                  to={target}
                  onClick={onNavigate}
                  className={`block px-3 py-2 rounded-lg text-xs transition-colors ${
                    isActive
                      ? 'bg-amber-950/60 text-amber-200 font-bold border-l-2 border-amber-500'
                      : 'text-[#596383] hover:text-[#171438] hover:bg-[#f4f7fc]/50'
                  }`}>
                  {label}
                </NavLink>
              );
            })}
          </div>
        )}
      </div>

      {/* Blockchain Ledger */}
      <div className="pt-2">
        <NavLink
          to="/blockchain-ledger"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              isActive
                ? 'bg-indigo-950 text-white border border-indigo-500 font-extrabold shadow-sm'
                : 'text-[#596383] hover:bg-[#f4f7fc] hover:text-[#090a23]'
            }`
          }>
          <Database size={16} className="text-[#009963] flex-shrink-0" />
          <span>Blockchain Ledger</span>
        </NavLink>
      </div>

      {/* Audit Logs */}
      <div className="pt-1">
        <NavLink
          to="/audit-logs"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              isActive
                ? 'bg-indigo-950 text-white border border-indigo-500 font-extrabold shadow-sm'
                : 'text-[#596383] hover:bg-[#f4f7fc] hover:text-[#090a23]'
            }`
          }>
          <ShieldAlert size={16} className="text-[#ef2547] flex-shrink-0" />
          <span>Audit Logs</span>
        </NavLink>
      </div>

      {/* Notifications */}
      <div className="pt-1">
        <NavLink
          to="/notifications"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              isActive
                ? 'bg-indigo-950 text-white border border-indigo-500 font-extrabold shadow-sm'
                : 'text-[#596383] hover:bg-[#f4f7fc] hover:text-[#090a23]'
            }`
          }>
          <Bell size={16} className="text-[#bd8100] flex-shrink-0" />
          <span>Alerts & Notices</span>
        </NavLink>
      </div>

      {/* Secondary Links */}
      <div className="pt-4 mt-auto border-t border-[#edf0fb]/80 space-y-1">
        <NavLink
          to="/security"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
              isActive ? 'text-white bg-white font-bold' : 'text-[#596383] hover:text-[#171438]'
            }`
          }>
          <Shield size={16} className="flex-shrink-0" />
          <span>Security Policy</span>
        </NavLink>

        <NavLink
          to="/system-settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
              isActive ? 'text-white bg-white font-bold' : 'text-[#596383] hover:text-[#171438]'
            }`
          }>
          <Settings size={16} className="flex-shrink-0" />
          <span>System Settings</span>
        </NavLink>

        <NavLink
          to="/admin-profile"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
              isActive ? 'text-white bg-white font-bold' : 'text-[#596383] hover:text-[#171438]'
            }`
          }>
          <User size={16} className="flex-shrink-0" />
          <span>Admin Profile</span>
        </NavLink>
      </div>
    </nav>
  );
}

export function Sidebar({ pendingDocsCount = 0, pendingOfficersCount = 0 }) {
  const location = useLocation();
  const [docsOpen, setDocsOpen] = useState(true);
  const [policeOpen, setPoliceOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Automatically close mobile menu when route/search changes
  const [currentPath, setCurrentPath] = useState(location.pathname + location.search);
  if (location.pathname + location.search !== currentPath) {
    setCurrentPath(location.pathname + location.search);
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  }

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Top Navbar with Hamburger Menu */}
      <header className="lg:hidden sticky top-0 z-30 w-full bg-[#fafbff]/95 backdrop-blur-md border-b border-[#edf0fb] px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="p-2 -ml-1 text-[#424a6b] hover:text-[#090a23] hover:bg-white shadow-sm/90 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#6442ff] cursor-pointer"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}>
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-sm shadow-md shadow-indigo-500/20 text-[#090a23] font-black">
              🛡️
            </div>
            <div>
              <h2 className="text-xs font-black tracking-tight text-[#090a23] leading-tight">ADMIN PORTAL</h2>
              <p className="text-[10px] font-bold text-[#bd8100] leading-tight">Trust Verification Core</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <NavLink
            to="/notifications"
            className="p-2 text-[#596383] hover:text-amber-300 hover:bg-white shadow-sm/80 rounded-xl transition-colors relative"
            aria-label="View notifications">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          </NavLink>
        </div>
      </header>

      {/* Mobile Drawer Backdrop */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-[#fafbff]/90 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Drawer (Collapsible Menu) */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#fafbff] border-r border-[#edf0fb] flex flex-col p-4 shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation">
        {/* Drawer Header with Close Button */}
        <div className="flex items-center justify-between pb-4 border-b border-[#edf0fb] mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-lg shadow-lg shadow-indigo-500/20 text-[#090a23] font-black">
              🛡️
            </div>
            <div>
              <h2 className="text-xs font-extrabold tracking-tight text-[#090a23]">ADMIN PORTAL</h2>
              <p className="text-[10px] font-bold text-[#bd8100] mt-0.5">Trust Verification Core</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 text-[#596383] hover:text-[#090a23] hover:bg-white shadow-sm/80 rounded-xl transition-colors cursor-pointer"
            aria-label="Close navigation menu">
            <X size={20} />
          </button>
        </div>

        <NavigationMenu
          location={location}
          docsOpen={docsOpen}
          setDocsOpen={setDocsOpen}
          policeOpen={policeOpen}
          setPoliceOpen={setPoliceOpen}
          onNavigate={() => setIsMobileMenuOpen(false)}
          pendingDocsCount={pendingDocsCount}
          pendingOfficersCount={pendingOfficersCount}
        />
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#fafbff] border-r border-[#edf0fb] flex-col p-4 flex-shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-5 border-b border-[#edf0fb] mb-6 flex-shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20 text-[#090a23] font-black">
            🛡️
          </div>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-[#090a23]">ADMIN PORTAL</h2>
            <p className="text-[11px] font-bold text-[#bd8100] mt-0.5">Trust Verification Core</p>
          </div>
        </div>

        <NavigationMenu
          location={location}
          docsOpen={docsOpen}
          setDocsOpen={setDocsOpen}
          policeOpen={policeOpen}
          setPoliceOpen={setPoliceOpen}
          onNavigate={() => {}}
          pendingDocsCount={pendingDocsCount}
          pendingOfficersCount={pendingOfficersCount}
        />
      </aside>
    </>
  );
}

export const AdminNavigation = Sidebar;
export default Sidebar;
