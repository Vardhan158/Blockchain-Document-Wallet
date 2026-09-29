import React, { useState } from 'react';
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
} from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const [docsOpen, setDocsOpen] = useState(true);
  const [policeOpen, setPoliceOpen] = useState(true);

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-4 flex-shrink-0 min-h-screen sticky top-0 h-screen overflow-y-auto">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-5 border-b border-slate-800 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20 text-white font-black">
          🛡️
        </div>
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-white">ADMIN PORTAL</h2>
          <p className="text-[11px] font-bold text-amber-400 mt-0.5">Trust Verification Core</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex flex-col gap-1 flex-1 text-xs font-semibold">
        {/* Dashboard Link */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
              isActive
                ? 'bg-indigo-950 text-white border border-indigo-500 font-extrabold shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
            }`
          }>
          <Activity size={16} className="text-indigo-400" />
          <span>Dashboard</span>
        </NavLink>

        {/* Documents Group */}
        <div className="pt-2">
          <button
            onClick={() => setDocsOpen(!docsOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-slate-400 hover:text-white rounded-lg transition-colors font-bold text-[11px] uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <FileCheck size={16} className="text-indigo-400" />
              <span>Documents</span>
            </span>
            {docsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>

          {docsOpen && (
            <div className="pl-6 pt-1 space-y-1">
              {[
                ['Pending Queue', 'PENDING', 'bg-amber-500 text-slate-950'],
                ['Under Review', 'UNDER_REVIEW', 'bg-sky-500 text-white'],
                ['Approved', 'APPROVED', 'bg-emerald-500 text-slate-950'],
                ['Rejected', 'REJECTED', 'bg-red-500 text-white'],
              ].map(([label, status, badgeClass]) => {
                const target = `/document-queue?status=${status}`;
                const isActive = location.pathname === '/document-queue' && location.search.includes(`status=${status}`);
                return (
                  <NavLink
                    key={status}
                    to={target}
                    className={`block px-3 py-2 rounded-lg text-xs transition-colors ${
                      isActive
                        ? 'bg-indigo-900/60 text-white font-bold border-l-2 border-indigo-500'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-950 text-white border border-indigo-500 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
              }`
            }>
            <Users size={16} className="text-sky-400" />
            <span>Citizen Users</span>
          </NavLink>
        </div>

        {/* Police / Government Group */}
        <div className="pt-2">
          <button
            onClick={() => setPoliceOpen(!policeOpen)}
            className="w-full flex items-center justify-between px-3.5 py-2 text-slate-400 hover:text-white rounded-lg transition-colors font-bold text-[11px] uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <UserCheck size={16} className="text-amber-400" />
              <span>Police / Government</span>
            </span>
            {policeOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
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
                const isActive = location.pathname === '/officer-queue' && location.search.includes(`status=${status}`);
                return (
                  <NavLink
                    key={status}
                    to={target}
                    className={`block px-3 py-2 rounded-lg text-xs transition-colors ${
                      isActive
                        ? 'bg-amber-950/60 text-amber-200 font-bold border-l-2 border-amber-500'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
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
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-950 text-white border border-indigo-500 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
              }`
            }>
            <Database size={16} className="text-emerald-400" />
            <span>Blockchain Ledger</span>
          </NavLink>
        </div>

        {/* Audit Logs */}
        <div className="pt-1">
          <NavLink
            to="/audit-logs"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-950 text-white border border-indigo-500 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
              }`
            }>
            <ShieldAlert size={16} className="text-red-400" />
            <span>Audit Logs</span>
          </NavLink>
        </div>

        {/* Notifications */}
        <div className="pt-1">
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-950 text-white border border-indigo-500 font-extrabold shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
              }`
            }>
            <Bell size={16} className="text-amber-400" />
            <span>Alerts & Notices</span>
          </NavLink>
        </div>

        {/* Secondary Links */}
        <div className="pt-4 border-t border-slate-800/80 space-y-1">
          <NavLink
            to="/security"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                isActive ? 'text-white bg-slate-800 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`
            }>
            <Shield size={16} />
            <span>Security Policy</span>
          </NavLink>

          <NavLink
            to="/system-settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                isActive ? 'text-white bg-slate-800 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`
            }>
            <Settings size={16} />
            <span>System Settings</span>
          </NavLink>

          <NavLink
            to="/admin-profile"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-colors ${
                isActive ? 'text-white bg-slate-800 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`
            }>
            <User size={16} />
            <span>Admin Profile</span>
          </NavLink>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
