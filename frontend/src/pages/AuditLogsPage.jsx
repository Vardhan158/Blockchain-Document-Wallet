import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/api';
import { ShieldAlert, Download, Lock, RefreshCw, FileText, Search, UserCheck } from 'lucide-react';

const MOCK_AUDIT_EVENTS = [
  {
    id: 'audit_1001',
    actorId: 'POL-KA-A8921',
    actorRole: 'POLICE_OFFICER',
    action: 'POLICE_DOCUMENT_VIEW',
    entityType: 'DOCUMENT',
    entityId: 'DOC-892312',
    metadata: { officerBadge: 'POL-KA-A8921', citizenRef: 'USER-HASH-89283', ip: '10.0.2.15', result: 'SUCCESS' },
    createdAt: '28 Sep 2026 11:42 AM',
  },
  {
    id: 'audit_1002',
    actorId: 'POL-8841',
    actorRole: 'POLICE_OFFICER',
    action: 'POLICE_USER_SEARCH',
    entityType: 'USER',
    entityId: 'BDW-9K7F3A2',
    metadata: { result: 'SUCCESS', count: 2 },
    createdAt: '28 Sep 2026 10:32 AM',
  },
  {
    id: 'audit_1003',
    actorId: 'ADMIN-001',
    actorRole: 'ADMIN',
    action: 'DOCUMENT_APPROVED',
    entityType: 'DOCUMENT',
    entityId: 'DOC-KA01MJ4092',
    metadata: { approvedTag: 'VEHICLE', onChainTx: '0x8f23a890...' },
    createdAt: '28 Sep 2026 09:15 AM',
  },
  {
    id: 'audit_1004',
    actorId: 'ADMIN-001',
    actorRole: 'ADMIN',
    action: 'DOCUMENT_TAG_CHANGED',
    entityType: 'DOCUMENT',
    entityId: 'DOC-901827',
    metadata: { oldTag: 'VEHICLE', newTag: 'NORMAL' },
    createdAt: '28 Sep 2026 08:45 AM',
  },
  {
    id: 'audit_1005',
    actorId: 'SYSTEM_GENESIS',
    actorRole: 'SYSTEM',
    action: 'BLOCKCHAIN_TRANSACTION_CREATED',
    entityType: 'BLOCKCHAIN',
    entityId: 'Block #18492012',
    metadata: { smartContract: 'DocumentRegistry.sol', status: 'SUCCESS' },
    createdAt: '28 Sep 2026 08:00 AM',
  },
  {
    id: 'audit_1006',
    actorId: 'ADMIN-001',
    actorRole: 'ADMIN',
    action: 'ADMIN_USER_SUSPENDED',
    entityType: 'USER',
    entityId: 'BDW-OLD9912',
    metadata: { reason: 'Security investigation' },
    createdAt: '27 Sep 2026 04:20 PM',
  },
  {
    id: 'audit_1007',
    actorId: 'user_1790571766756',
    actorRole: 'USER',
    action: 'USER_REGISTERED',
    entityType: 'USER',
    entityId: 'BDW-G567Z7N',
    metadata: { email: 'harshavardhandevang@gmail.com' },
    createdAt: '27 Sep 2026 02:10 PM',
  },
];

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAuditLogs = async () => {
    try {
      const res = await adminApi.getAuditLogs();
      if (res.data?.auditLogs && res.data.auditLogs.length > 0) {
        setLogs(res.data.auditLogs);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.actorId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'USERS') return log.actorRole === 'USER' || log.action.startsWith('USER_') || log.action.startsWith('DOCUMENT_UPLOADED');
    if (activeTab === 'POLICE') return log.actorRole === 'POLICE_OFFICER' || log.action.startsWith('POLICE_');
    if (activeTab === 'ADMINS') return log.actorRole === 'ADMIN' || log.action.startsWith('ADMIN_') || log.action.startsWith('DOCUMENT_APPROVED') || log.action.startsWith('DOCUMENT_REJECTED') || log.action.startsWith('DOCUMENT_TAG_CHANGED');
    if (activeTab === 'SYSTEM_BLOCKCHAIN') return log.actorRole === 'SYSTEM' || log.action.startsWith('BLOCKCHAIN_');
    return true;
  });

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Log ID,Actor ID,Role,Action,Target Entity,Timestamp'].join(',') +
      '\n' +
      filteredLogs.map(l => `${l.id},${l.actorId},${l.actorRole},${l.action},${l.entityType}:${l.entityId},${l.createdAt}`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* SECTION 70: IMMUTABLE AUDIT PRINCIPLE BANNER */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            <Lock size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider">
              Section 70: Immutable Audit Principle Active
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Audit records are strictly append-only. Admins may filter and export reports, but no delete or modification capability exists.
            </p>
          </div>
        </div>

        <button
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30 transition-colors"
          onClick={handleExportCSV}>
          <Download size={14} /> Export Audit Report (CSV)
        </button>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
        <div className="flex justify-between items-center pb-3 border-b border-slate-700 mb-5">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <ShieldAlert className="text-red-400" size={22} />
            Audit Logs Module (Section 68 & 69)
          </h3>

          <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-700">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search Actor ID, Action, Entity..."
              className="bg-transparent text-white text-xs outline-none w-56"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* SECTION 68: CATEGORY FILTER TABS (Users, Police, Admins, System, Blockchain) */}
        <div className="flex gap-2.5 mb-5 flex-wrap">
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'USERS', label: 'Users' },
            { id: 'POLICE', label: 'Police' },
            { id: 'ADMINS', label: 'Admins' },
            { id: 'SYSTEM_BLOCKCHAIN', label: 'System & Blockchain' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white border border-indigo-400'
                  : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Audit Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="p-3">Log ID</th>
                <th className="p-3">Actor ID</th>
                <th className="p-3">Role</th>
                <th className="p-3">Audit Event Action</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Event Metadata</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="p-3 font-mono text-slate-400">{log.id}</td>
                  <td className="p-3 font-bold text-indigo-300">{log.actorId}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black font-mono ${log.actorRole === 'POLICE_OFFICER' ? 'bg-sky-900 text-sky-200' : log.actorRole === 'ADMIN' ? 'bg-amber-900 text-amber-200' : 'bg-indigo-900 text-white'}`}>
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="p-3 font-extrabold text-white">{log.action}</td>
                  <td className="p-3 font-mono text-slate-300">{log.entityType}:{log.entityId}</td>
                  <td className="p-3 text-[11px] text-slate-400 font-mono">
                    {JSON.stringify(log.metadata)}
                  </td>
                  <td className="p-3 text-slate-400">{log.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
