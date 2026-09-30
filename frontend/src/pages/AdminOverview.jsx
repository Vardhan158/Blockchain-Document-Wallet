import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/api';
import {
  FileCheck,
  UserCheck,
  Users,
  Database,
  Shield,
  Lock,
  ArrowRight,
  AlertTriangle,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

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
  const [, setError] = useState('');

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(r => setData(r.data))
      .catch(() => setError('Dashboard API connection offline. Displaying fallback metrics.'));
  }, []);

  const pendingDocsCount = data?.pendingDocuments ?? 2;
  const pendingPoliceCount = data?.pendingPoliceAccounts ?? 1;
  const totalUsersCount = data?.totalUsers ?? 2;
  const approvedDocsCount = data?.approvedDocuments ?? 1;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* SECTION 4: IMMUTABILITY BOUNDS BANNER */}
      <div className="bg-[#fafbff] border border-[#edf0fb] rounded-2xl p-3.5 sm:p-4 flex items-start sm:items-center gap-3">
        <div className="p-2 sm:p-2.5 bg-[#fff8e4] border border-[#fff0ca] rounded-xl text-[#bd8100] flex-shrink-0 mt-0.5 sm:mt-0">
          <Lock size={18} />
        </div>
        <p className="text-xs text-[#424a6b] leading-relaxed">
          <strong className="text-[#bd8100]">Section 4 Immutability & Security Bounds:</strong> Admin has management authority over documents, users, and officer accounts. Blockchain history, smart contract transactions, and audit logs remain permanently immutable even to administrators. Passwords and master encryption keys are never exposed in web UI.
        </p>
      </div>

      {/* SECTION 67: SUSPICIOUS POLICE ACTIVITY SECURITY WARNING BANNER */}
      <div className="bg-red-950/60 border border-[#ffd3dc]/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 bg-red-500/20 border border-[#ffd3dc]/40 rounded-xl text-[#ef2547] flex-shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-red-200 uppercase tracking-wider flex items-center gap-2 flex-wrap">
              <span>Section 67 Security Warning: Suspicious Activity</span>
              <span className="bg-red-900 text-red-200 text-[10px] px-2 py-0.5 rounded font-mono font-extrabold">1 ALERT</span>
            </h4>
            <p className="text-xs text-red-300/80 mt-1 leading-relaxed">
              Officer POL-KA-A8921 performed 58 rapid document searches in 10 minutes. Suspended account access attempt blocked.
            </p>
          </div>
        </div>

        <Link
          to="/audit-logs"
          className="text-xs font-mono text-red-300 font-bold px-3.5 py-2 bg-red-900/50 hover:bg-red-900 rounded-xl border border-[#ffd3dc]/30 transition-colors flex items-center justify-center gap-1.5 flex-shrink-0 self-start sm:self-auto">
          <span>INVESTIGATE LOGS</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1 */}
        <Link
          to="/document-queue?status=PENDING"
          className="bg-white shadow-sm rounded-2xl p-4 sm:p-5 border border-[#fff0ca]/40 bg-gradient-to-br from-white to-[#fff8e4] flex flex-col justify-between gap-2 hover:border-amber-400 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-amber-500/10">
          <div className="flex justify-between items-center text-[#596383] text-xs font-bold">
            <span className="truncate pr-2">PIPELINE 1: PENDING DOCS</span>
            <FileCheck className="text-[#bd8100] flex-shrink-0" size={20} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#090a23]">{pendingDocsCount}</div>
          <div className="flex justify-between items-center text-[11px] font-semibold text-[#bd8100] pt-1 border-t border-[#fff0ca]/10">
            <span>Review Pending Queue</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        {/* Metric 2 */}
        <Link
          to="/officer-queue?status=PENDING"
          className="bg-white shadow-sm rounded-2xl p-4 sm:p-5 border border-[#6442ff]/40 bg-gradient-to-br from-white to-[#f1eeff] flex flex-col justify-between gap-2 hover:border-indigo-400 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-[#6442ff]/10">
          <div className="flex justify-between items-center text-[#596383] text-xs font-bold">
            <span className="truncate pr-2">PIPELINE 2: PENDING OFFICERS</span>
            <UserCheck className="text-[#6442ff] flex-shrink-0" size={20} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#090a23]">{pendingPoliceCount}</div>
          <div className="flex justify-between items-center text-[11px] font-semibold text-[#6442ff] pt-1 border-t border-[#6442ff]/10">
            <span>Review Officer Queue</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        {/* Metric 3 */}
        <Link
          to="/blockchain-ledger"
          className="bg-white shadow-sm rounded-2xl p-4 sm:p-5 border border-[#c7f4e4]/40 bg-gradient-to-br from-white to-[#edfbf5] flex flex-col justify-between gap-2 hover:border-emerald-400 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-emerald-500/10">
          <div className="flex justify-between items-center text-[#596383] text-xs font-bold">
            <span className="truncate pr-2">ON-CHAIN VERIFIED DOCS</span>
            <Database className="text-[#009963] flex-shrink-0" size={20} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#090a23]">{approvedDocsCount}</div>
          <div className="flex justify-between items-center text-[11px] font-semibold text-[#009963] pt-1 border-t border-[#c7f4e4]/10">
            <span>View Ledger Explorer</span>
            <ArrowRight size={14} />
          </div>
        </Link>

        {/* Metric 4 */}
        <Link
          to="/user-management"
          className="bg-white shadow-sm rounded-2xl p-4 sm:p-5 border border-[#e0e5f4] flex flex-col justify-between gap-2 hover:border-[#c7f4e4] transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-black/5">
          <div className="flex justify-between items-center text-[#596383] text-xs font-bold">
            <span className="truncate pr-2">CITIZEN USERS</span>
            <Users className="text-[#009df2] flex-shrink-0" size={20} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#090a23]">{totalUsersCount}</div>
          <div className="flex justify-between items-center text-[11px] font-semibold text-[#009df2] pt-1 border-t border-[#e0e5f4]/50">
            <span>Manage User Registry</span>
            <ArrowRight size={14} />
          </div>
        </Link>
      </div>

      {/* QUICK ACTIONS BAR */}
      <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-black uppercase text-[#596383] tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:flex-wrap gap-2.5 sm:gap-3">
          {[
            ['Review Pending Documents', '/document-queue?status=PENDING', FileCheck, 'bg-indigo-600 hover:bg-indigo-500 text-white'],
            ['Review Police Officers', '/officer-queue?status=PENDING', UserCheck, 'bg-amber-600 hover:bg-amber-500 text-[#ffffff] font-black'],
            ['Search Citizen User', '/user-management', Users, 'bg-[#e0e5f4] hover:bg-[#dceaff] text-[#171438]'],
            ['View Audit Logs', '/audit-logs', Shield, 'bg-[#e0e5f4] hover:bg-[#dceaff] text-[#171438]'],
            ['Blockchain Ledger', '/blockchain-ledger', Database, 'bg-[#e0e5f4] hover:bg-[#dceaff] text-[#171438]'],
          ].map(([label, to, IconComp, btnClass]) => (
            <Link
              key={to}
              to={to}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center sm:justify-start gap-2 transition-all active:scale-[0.98] ${btnClass}`}>
              <IconComp size={15} className="flex-shrink-0" />
              <span className="truncate">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* SECTION 5: RECHARTS DASHBOARD ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] p-4 sm:p-5 space-y-3 min-w-0">
          <h3 className="text-xs sm:text-sm font-extrabold text-[#090a23] flex items-center gap-2">
            <Activity size={18} className="text-[#6442ff] flex-shrink-0" />
            <span className="truncate">Verification & On-Chain Anchoring Volume</span>
          </h3>
          <div className="h-48 sm:h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="verifications" stroke="#6366F1" fill="rgba(99, 102, 241, 0.2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] p-4 sm:p-5 space-y-3 min-w-0">
          <h3 className="text-xs sm:text-sm font-extrabold text-[#090a23] flex items-center gap-2">
            <Activity size={18} className="text-[#009df2] flex-shrink-0" />
            <span className="truncate">Police Officer Verification Activity</span>
          </h3>
          <div className="h-48 sm:h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="officerLookups" fill="#38BDF8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TWO CRITICAL VERIFICATION PIPELINES SUMMARY */}
      <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-[#e0e5f4] mb-4 gap-2">
          <h3 className="text-sm sm:text-base font-extrabold text-[#090a23] flex items-center gap-2">
            <Shield className="text-[#6442ff] flex-shrink-0" size={18} />
            <span>Two Critical Verification Pipelines (Trust Core)</span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pipeline 1 */}
          <div className="bg-white p-4 rounded-xl border border-[#edf0fb] space-y-2">
            <h4 className="text-xs sm:text-sm font-extrabold text-indigo-300">
              1. Citizen Document Verification Pipeline
            </h4>
            <p className="text-xs text-[#596383] leading-relaxed">
              Citizens upload encrypted files and select tags. Admin reviews unencrypted previews, confirms SHA-256 fingerprints, and registers approved credentials on-chain.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="bg-sky-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md font-mono">VEHICLE SCOPE</span>
              <span className="bg-indigo-900 text-white text-[10px] font-black px-2.5 py-1 rounded-md font-mono">NORMAL SCOPE</span>
            </div>
          </div>

          {/* Pipeline 2 */}
          <div className="bg-white p-4 rounded-xl border border-[#edf0fb] space-y-2">
            <h4 className="text-xs sm:text-sm font-extrabold text-[#bd8100]">
              2. Police / Government Account Verification Pipeline
            </h4>
            <p className="text-xs text-[#596383] leading-relaxed">
              Officers self-register with official Badge IDs and stations. Admin verifies credentials before setting status to <strong>APPROVED</strong>. Police lookup APIs are blocked until approval.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <span className="bg-emerald-900/50 text-[#009963] border border-[#c7f4e4] text-[10px] font-black px-2.5 py-1 rounded-full">
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
