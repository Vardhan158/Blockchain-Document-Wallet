import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/api';
import { ShieldAlert, Download, Lock, Search } from 'lucide-react';

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
  const [logs, setLogs] = useState(MOCK_AUDIT_EVENTS);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let isMounted = true;
    adminApi.getAuditLogs()
      .then(res => {
        if (isMounted && res.data?.auditLogs && res.data.auditLogs.length > 0) {
          setLogs(res.data.auditLogs);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLogs = logs.filter(log => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      log.actorId.toLowerCase().includes(term) ||
      log.action.toLowerCase().includes(term) ||
      log.entityId.toLowerCase().includes(term);

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

  const getRoleBadgeClass = (role) => {
    if (role === 'POLICE_OFFICER') return 'bg-sky-950 text-sky-300 border border-sky-600/40';
    if (role === 'ADMIN') return 'bg-amber-950 text-amber-300 border border-amber-600/40';
    if (role === 'SYSTEM') return 'bg-emerald-950 text-emerald-300 border border-emerald-600/40';
    return 'bg-indigo-950 text-indigo-300 border border-indigo-600/40';
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* SECTION 70: IMMUTABLE AUDIT PRINCIPLE BANNER */}
      <div className="bg-[#fafbff] border border-[#edf0fb] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 bg-[#fff0f2] border border-[#ffd3dc]/30 rounded-xl text-[#ef2547] flex-shrink-0 mt-0.5 sm:mt-0">
            <Lock size={18} />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-black text-[#090a23] uppercase tracking-wider truncate">
              Section 70: Immutable Audit Principle Active
            </h4>
            <p className="text-xs text-[#596383] mt-0.5 leading-relaxed">
              Audit records are strictly append-only. Admins may filter and export reports, but no delete or modification capability exists.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="w-full sm:w-auto px-4 py-2.5 bg-[#6442ff] hover:bg-[#5231e3] text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex-shrink-0"
          onClick={handleExportCSV}>
          <Download size={14} />
          <span>Export CSV</span>
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] p-4 sm:p-5">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e0e5f4] mb-4 gap-3">
          <h3 className="text-sm sm:text-base font-extrabold text-[#090a23] flex items-center gap-2">
            <ShieldAlert className="text-[#ef2547] flex-shrink-0" size={20} />
            <span>Audit Logs Module (Section 68 & 69)</span>
          </h3>

          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#e0e5f4] w-full sm:w-auto focus-within:border-[#6442ff] transition-colors">
            <Search size={15} className="text-[#596383] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search Actor, Action, Entity..."
              className="bg-transparent text-[#090a23] text-xs outline-none w-full sm:w-60"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* SECTION 68: CATEGORY FILTER TABS */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 sm:flex-wrap">
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'USERS', label: 'Users' },
            { id: 'POLICE', label: 'Police' },
            { id: 'ADMINS', label: 'Admins' },
            { id: 'SYSTEM_BLOCKCHAIN', label: 'System & Chain' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 active:scale-95 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white border border-indigo-400 shadow-sm'
                  : 'bg-[#e0e5f4]/80 text-[#424a6b] hover:bg-[#e0e5f4] border border-[#dceaff]'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* MOBILE CARDS VIEW (md:hidden) */}
        <div className="md:hidden space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="text-center p-8 text-[#596383] text-xs bg-white/50 rounded-xl border border-[#edf0fb]">
              No matching audit logs found.
            </div>
          ) : (
            filteredLogs.map(log => (
              <div
                key={log.id}
                className="bg-white p-3.5 rounded-xl border border-[#edf0fb] space-y-2.5 text-xs shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-[#090a23] text-xs truncate">{log.action}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono flex-shrink-0 ${getRoleBadgeClass(log.actorRole)}`}>
                    {log.actorRole}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#edf0fb]">
                  <div>
                    <span className="text-[#7b819b] block text-[10px] uppercase font-bold">Actor</span>
                    <span className="font-mono text-indigo-300 font-bold truncate block">{log.actorId}</span>
                  </div>
                  <div>
                    <span className="text-[#7b819b] block text-[10px] uppercase font-bold">Target Entity</span>
                    <span className="font-mono text-[#424a6b] truncate block">{log.entityType}:{log.entityId}</span>
                  </div>
                </div>

                {log.metadata && (
                  <div className="bg-[#fafbff] p-2 rounded-lg text-[10px] font-mono text-[#596383] break-all border border-[#edf0fb]/80">
                    {JSON.stringify(log.metadata)}
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-[#7b819b] pt-0.5">
                  <span className="font-mono">{log.id}</span>
                  <span>{log.createdAt}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE VIEW (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e0e5f4] text-[11px] font-black text-[#596383] uppercase tracking-wider">
                <th className="p-3">Log ID</th>
                <th className="p-3">Actor ID</th>
                <th className="p-3">Role</th>
                <th className="p-3">Audit Event Action</th>
                <th className="p-3">Target Entity</th>
                <th className="p-3">Event Metadata</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0fb] text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-[#596383]">
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-[#f4f7fc]/30 transition-colors">
                    <td className="p-3 font-mono text-[#596383]">{log.id}</td>
                    <td className="p-3 font-bold text-indigo-300">{log.actorId}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${getRoleBadgeClass(log.actorRole)}`}>
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-[#090a23]">{log.action}</td>
                    <td className="p-3 font-mono text-[#424a6b]">{log.entityType}:{log.entityId}</td>
                    <td className="p-3 text-[11px] text-[#596383] font-mono max-w-[200px] truncate" title={JSON.stringify(log.metadata)}>
                      {JSON.stringify(log.metadata)}
                    </td>
                    <td className="p-3 text-[#596383] whitespace-nowrap">{log.createdAt}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditLogsPage;
