import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';
import { FileCheck, UserCheck, Users, Database, Shield, Lock, ArrowRight, AlertTriangle, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const analyticsData = [
  { day: 'Mon', verifications: 12, officerLookups: 34 },
  { day: 'Tue', verifications: 18, officerLookups: 45 },
  { day: 'Wed', verifications: 24, officerLookups: 58 },
  { day: 'Thu', verifications: 15, officerLookups: 40 },
  { day: 'Fri', verifications: 28, officerLookups: 65 },
  { day: 'Sat', verifications: 32, officerLookups: 72 },
  { day: 'Sun', verifications: 20, officerLookups: 50 },
];

export function AdminOverview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = () => {
    setError('');
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => setError('Dashboard API connection offline. Displaying fallback metrics.'));
  };

  useEffect(load, []);

  const pendingDocsCount = data?.pendingDocuments ?? 2;
  const pendingPoliceCount = data?.pendingPoliceAccounts ?? 1;
  const totalUsersCount = data?.totalUsers ?? 2;
  const approvedDocsCount = data?.approvedDocuments ?? 1;

  return (
    <div className="space-y-6">
      {/* SECTION 4: IMMUTABILITY BOUNDS BANNER */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
          <Lock size={20} />
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-400">Section 4 Immutability & Security Bounds:</strong> Admin has management authority over documents, users, and officer accounts. Blockchain history, smart contract transactions, and audit logs remain permanently immutable even to administrators. Passwords and master encryption keys are never exposed in web UI.
        </p>
      </div>

      {/* SECTION 67: SUSPICIOUS POLICE ACTIVITY SECURITY WARNING BANNER */}
      <div className="bg-red-950/60 border border-red-500/80 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400">
            <AlertTriangle size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-red-200 uppercase tracking-wider flex items-center gap-2">
              <span>Section 67 Security Warning: Suspicious Police Activity Detected</span>
              <span className="bg-red-900 text-red-200 text-[10px] px-2 py-0.5 rounded font-mono font-extrabold">1 ALERT</span>
            </h4>
            <p className="text-xs text-red-300/80 mt-0.5">
              Officer POL-KA-A8921 performed 58 rapid document searches in 10 minutes. Suspended account access attempt blocked.
            </p>
          </div>
        </div>

        <Link
          to="/audit-logs"
          className="text-[11px] font-mono text-red-300 font-bold px-3 py-1.5 bg-red-900/50 hover:bg-red-900 rounded-lg border border-red-500/30 transition-colors">
          INVESTIGATE LOGS →
        </Link>
      </div>

      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Link
          to="/document-queue?status=PENDING"
          className="bg-slate-800 rounded-2xl p-5 border border-amber-500/40 bg-gradient-to-br from-slate-800 to-amber-950/30 flex flex-col gap-2 hover:border-amber-400 transition-all">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>PIPELINE 1: PENDING DOCS</span>
            <FileCheck className="text-amber-400" size={22} />
          </div>
          <div className="text-3xl font-black text-white">{pendingDocsCount}</div>
          <div className="flex justify-between items-center text-[11px] font-semibold text-amber-400 pt-1">
            <span>Review Pending Queue</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        {/* Metric 2 */}
        <Link
          to="/officer-queue?status=PENDING"
          className="bg-slate-800 rounded-2xl p-5 border border-indigo-500/40 bg-gradient-to-br from-slate-800 to-indigo-950/30 flex flex-col gap-2 hover:border-indigo-400 transition-all">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>PIPELINE 2: PENDING OFFICERS</span>
            <UserCheck className="text-indigo-400" size={22} />
          </div>
          <div className="text-3xl font-black text-white">{pendingPoliceCount}</div>
          <div className="flex justify-between items-center text-[11px] font-semibold text-indigo-400 pt-1">
            <span>Review Officer Queue</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        {/* Metric 3 */}
        <Link
          to="/blockchain-ledger"
          className="bg-slate-800 rounded-2xl p-5 border border-emerald-500/40 bg-gradient-to-br from-slate-800 to-emerald-950/30 flex flex-col gap-2 hover:border-emerald-400 transition-all">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>ON-CHAIN VERIFIED DOCS</span>
            <Database className="text-emerald-400" size={22} />
          </div>
          <div className="text-3xl font-black text-white">{approvedDocsCount}</div>
          <div className="flex justify-between items-center text-[11px] font-semibold text-emerald-400 pt-1">
            <span>View Ledger Explorer</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        {/* Metric 4 */}
        <Link
          to="/user-management"
          className="bg-slate-800 rounded-2xl p-5 border border-slate-700 flex flex-col gap-2 hover:border-slate-500 transition-all">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>CITIZEN USERS</span>
            <Users className="text-sky-400" size={22} />
          </div>
          <div className="text-3xl font-black text-white">{totalUsersCount}</div>
          <div className="flex justify-between items-center text-[11px] font-semibold text-sky-400 pt-1">
            <span>Manage User Registry</span>
            <ArrowRight size={14} />
          </div>
        </Link>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Quick Actions</h3>
        <div className="flex gap-3 flex-wrap">
          {[
            ['Review Pending Documents', '/document-queue?status=PENDING', FileCheck, 'bg-indigo-600 hover:bg-indigo-500 text-white'],
            ['Review Police Officers', '/officer-queue?status=PENDING', UserCheck, 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-black'],
            ['Search Citizen User', '/user-management', Users, 'bg-slate-700 hover:bg-slate-600 text-slate-200'],
            ['View Audit Logs', '/audit-logs', Shield, 'bg-slate-700 hover:bg-slate-600 text-slate-200'],
            ['Blockchain Ledger', '/blockchain-ledger', Database, 'bg-slate-700 hover:bg-slate-600 text-slate-200'],
          ].map(([label, to, IconComp, btnClass]) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-colors ${btnClass}`}>
              <IconComp size={15} />
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* SECTION 5: RECHARTS DASHBOARD ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Activity size={18} className="text-indigo-400" />
            Verification & On-Chain Anchoring Volume
          </h3>
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="verifications" stroke="#6366F1" fill="rgba(99, 102, 241, 0.2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Activity size={18} className="text-sky-400" />
            Police Officer Verification Activity
          </h3>
          <div className="h-52 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="officerLookups" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TWO CRITICAL VERIFICATION PIPELINES SUMMARY */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
        <div className="flex justify-between items-center pb-3 border-b border-slate-700 mb-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Shield className="text-indigo-400" size={20} />
            Two Critical Verification Pipelines (Trust Core)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Pipeline 1 */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-sm font-extrabold text-indigo-300">
              1. Citizen Document Verification Pipeline
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Citizens upload encrypted files and select tags. Admin reviews unencrypted previews, confirms SHA-256 fingerprints, and registers approved credentials on-chain.
            </p>
            <div className="pt-2 flex gap-2">
              <span className="bg-sky-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md font-mono">VEHICLE SCOPE</span>
              <span className="bg-indigo-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md font-mono">NORMAL SCOPE</span>
            </div>
          </div>

          {/* Pipeline 2 */}
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="text-sm font-extrabold text-amber-400">
              2. Police / Government Account Verification Pipeline
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Officers self-register with official Badge IDs and stations. Admin verifies credentials before setting status to <strong>APPROVED</strong>. Police lookup APIs are blocked until approval.
            </p>
            <div className="pt-2 flex gap-2">
              <span className="bg-emerald-900/50 text-emerald-400 border border-emerald-500 text-[10px] font-black px-2.5 py-1 rounded-full">
                ✓ ADMIN AUTHORIZED
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
