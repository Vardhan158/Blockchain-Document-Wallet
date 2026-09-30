import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/api';
import { FileCheck, UserCheck, Database, Shield, Lock, AlertTriangle } from 'lucide-react';
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

export const DashboardPage = () => {
  const [documents, setDocuments] = useState([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    adminApi.getDocuments()
      .then(docRes => {
        if (isMounted && docRes.data?.documents) {
          setDocuments(docRes.data.documents);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const pendingDocs = documents.filter(d => d.status === 'PENDING' || d.status === 'UNDER_REVIEW');
  const approvedDocs = documents.filter(d => d.status === 'APPROVED');

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* SECTION 4: STRICT IMMUTABILITY & PERMISSION BOUNDARIES NOTICE */}
      <div className="bg-[#fafbff] border border-[#edf0fb] rounded-2xl p-3.5 sm:p-4 flex items-start sm:items-center gap-3">
        <div className="p-2 sm:p-2.5 bg-[#fff8e4] border border-[#fff0ca] rounded-xl text-[#bd8100] flex-shrink-0 mt-0.5 sm:mt-0">
          <Lock size={18} />
        </div>
        <p className="text-xs text-[#424a6b] leading-relaxed">
          <strong className="text-[#bd8100]">Section 4 Immutability & Security Bounds:</strong> Admin has management authority over documents, users, and officer accounts. Blockchain history, smart contract transactions, and audit logs remain permanently immutable even to administrators. Passwords and master encryption keys are never exposed in web UI.
        </p>
      </div>

      {/* SECTION 67: SUSPICIOUS POLICE ACTIVITY WARNING BANNER */}
      <div className="bg-red-950/60 border border-[#ffd3dc]/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 bg-red-500/20 border border-[#ffd3dc]/40 rounded-xl text-[#ef2547] flex-shrink-0 mt-0.5 sm:mt-0">
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-red-200 uppercase tracking-wider flex items-center gap-2 flex-wrap">
              <span>Section 67 Security Warning: Suspicious Activity Detected</span>
              <span className="bg-red-900 text-red-200 text-[10px] px-2 py-0.5 rounded font-mono font-extrabold">1 ALERT</span>
            </h4>
            <p className="text-xs text-red-300/80 mt-1 leading-relaxed">
              Officer POL-KA-A8921 performed 58 rapid document searches in 10 minutes. Suspended account access attempt blocked.
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-red-300 font-bold px-3 py-1.5 bg-red-900/50 rounded-lg border border-[#ffd3dc]/30 self-start sm:self-auto flex-shrink-0">
          SECURITY INVESTIGATION REQUIRED
        </span>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white shadow-sm rounded-2xl p-4 sm:p-5 border border-[#fff0ca]/40 bg-gradient-to-br from-white to-[#fff8e4] flex flex-col gap-2 shadow-sm">
          <div className="flex justify-between items-center text-[#596383] text-xs font-bold">
            <span className="truncate pr-2">PIPELINE 1: PENDING DOCS</span>
            <FileCheck className="text-[#bd8100] flex-shrink-0" size={20} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#090a23]">{pendingDocs.length}</div>
          <span className="text-[11px] font-semibold text-[#bd8100]">Awaiting Admin Verification</span>
        </div>

        {/* Metric 2 */}
        <div className="bg-white shadow-sm rounded-2xl p-4 sm:p-5 border border-[#6442ff]/40 bg-gradient-to-br from-white to-[#f1eeff] flex flex-col gap-2 shadow-sm">
          <div className="flex justify-between items-center text-[#596383] text-xs font-bold">
            <span className="truncate pr-2">PIPELINE 2: PENDING OFFICERS</span>
            <UserCheck className="text-[#6442ff] flex-shrink-0" size={20} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#090a23]">1</div>
          <span className="text-[11px] font-semibold text-[#6442ff]">Pending Account Approval</span>
        </div>

        {/* Metric 3 */}
        <div className="bg-white shadow-sm rounded-2xl p-4 sm:p-5 border border-[#c7f4e4]/40 bg-gradient-to-br from-white to-[#edfbf5] flex flex-col gap-2 shadow-sm">
          <div className="flex justify-between items-center text-[#596383] text-xs font-bold">
            <span className="truncate pr-2">ON-CHAIN VERIFIED DOCS</span>
            <Database className="text-[#009963] flex-shrink-0" size={20} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#090a23]">{approvedDocs.length}</div>
          <span className="text-[11px] font-semibold text-[#009963]">Anchored on Smart Contract</span>
        </div>

        {/* Metric 4 */}
        <div className="bg-white shadow-sm rounded-2xl p-4 sm:p-5 border border-[#e0e5f4] flex flex-col gap-2 shadow-sm">
          <div className="flex justify-between items-center text-[#596383] text-xs font-bold">
            <span className="truncate pr-2">SYSTEM AUDIT TRAIL</span>
            <Shield className="text-[#596383] flex-shrink-0" size={20} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#090a23]">24</div>
          <span className="text-[11px] font-semibold text-[#596383]">Logged System Events</span>
        </div>
      </div>

      {/* SECTION 5: RECHARTS DASHBOARD ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
        <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] p-4 sm:p-5 space-y-3 min-w-0">
          <h3 className="text-xs sm:text-sm font-extrabold text-[#090a23] truncate">Verification & On-Chain Anchoring Volume</h3>
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
          <h3 className="text-xs sm:text-sm font-extrabold text-[#090a23] truncate">Police Officer Verification Activity</h3>
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

      {/* Two Critical Verification Pipelines Box */}
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
};

export default DashboardPage;
