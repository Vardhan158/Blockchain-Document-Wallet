import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  ShieldAlert,
  FileCheck,
  UserCheck,
  Users,
  Database,
  Activity,
  Bell
} from 'lucide-react';

export const Sidebar = ({ pendingDocsCount = 0, pendingOfficersCount = 0 }) => {
  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col p-4 flex-shrink-0 min-h-screen">
      <div className="flex items-center gap-3 pb-5 border-b border-slate-800 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-xl shadow-lg shadow-indigo-500/20">
          🛡️
        </div>
        <div>
          <h2 className="text-sm font-extrabold tracking-tight text-white">ADMIN PORTAL</h2>
          <p className="text-[11px] font-bold text-amber-400 mt-0.5">Trust Verification Core</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-indigo-950 text-white border border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
            }`
          }>
          <Activity size={18} />
          <span>Dashboard Overview</span>
        </NavLink>

        <NavLink
          to="/document-queue"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-indigo-950 text-white border border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
            }`
          }>
          <FileCheck size={18} />
          <span>Document Queue</span>
          {pendingDocsCount > 0 && (
            <span className="ml-auto bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
              {pendingDocsCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/officer-queue"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-indigo-950 text-white border border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
            }`
          }>
          <UserCheck size={18} />
          <span>Officer Queue</span>
          {pendingOfficersCount > 0 && (
            <span className="ml-auto bg-indigo-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {pendingOfficersCount}
            </span>
          )}
        </NavLink>

        <NavLink
          to="/user-management"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-indigo-950 text-white border border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
            }`
          }>
          <Users size={18} />
          <span>Citizen Users</span>
        </NavLink>

        <NavLink
          to="/blockchain-ledger"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-indigo-950 text-white border border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
            }`
          }>
          <Database size={18} />
          <span>Blockchain Ledger</span>
        </NavLink>

        <NavLink
          to="/audit-logs"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-indigo-950 text-white border border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
            }`
          }>
          <ShieldAlert size={18} />
          <span>Audit Logs</span>
        </NavLink>

        <NavLink
          to="/notifications"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-indigo-950 text-white border border-indigo-500 shadow-md shadow-indigo-500/10'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-100'
            }`
          }>
          <Bell size={18} />
          <span>Alerts & Notices</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
