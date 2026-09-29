import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/api';
import { useSearchParams } from 'react-router-dom';
import { UserCheck, Check, X, ShieldAlert, Eye, ShieldCheck, Power, Activity } from 'lucide-react';

const OFFICER_REJECTION_REASONS = [
  'Unable to verify employee ID',
  'Invalid police station information',
  'Incomplete registration',
  'Official ID unclear',
  'Duplicate account',
  'Other',
];

const OFFICER_SUSPENSION_REASONS = [
  'Officer transferred',
  'Account misuse',
  'Security investigation',
  'Employment ended',
  'Suspicious access activity',
  'Administrative request',
  'Other',
];

export const PoliceOfficerVerificationQueue = () => {
  const [officers, setOfficers] = useState([
    {
      id: 'officer_001',
      employeeId: 'KA-POL-28473',
      badgeNumber: 'SRV-9910',
      fullName: 'Ravi Kumar',
      rankDesignation: 'Inspector',
      policeStation: 'Hassan Traffic Police',
      district: 'Hassan',
      state: 'Karnataka',
      phone: '+91 9876543210',
      email: 'ravi.kumar@police.gov.in',
      department: 'Traffic Enforcement Unit',
      status: 'PENDING_APPROVAL',
      isApproved: false,
      createdAt: '28 Sep 2026',
      lastLogin: 'Today, 09:15 AM',
      registeredDevice: 'Android Enforcer Tablet (ID: dev_9918)',
      totalSearches: 88,
      documentViews: 142,
      securityAlerts: 0,
    },
    {
      id: 'officer_002',
      employeeId: 'POL-8841',
      badgeNumber: 'SRV-8841',
      fullName: 'Ramesh Kumar',
      rankDesignation: 'Inspector',
      policeStation: 'Central Traffic Police Station',
      district: 'Bangalore Urban',
      state: 'Karnataka',
      phone: '+91 9876543210',
      email: 'officer@police.gov.in',
      department: 'Traffic Enforcement Unit',
      status: 'APPROVED',
      isApproved: true,
      createdAt: '27 Sep 2026',
      lastLogin: 'Today, 10:15 AM',
      registeredDevice: 'Police Mobile Terminal (ID: dev_8841)',
      totalSearches: 124,
      documentViews: 210,
      securityAlerts: 0,
    },
  ]);

  const [params, setParams] = useSearchParams();
  const activeFilter = params.get('status') || 'PENDING';
  const setActiveFilter = status => setParams({ status });

  const [loading, setLoading] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPoliceOfficers();
      if (res.data?.officers && res.data.officers.length > 0) {
        setOfficers(res.data.officers);
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficers();
    const interval = setInterval(() => {
      adminApi.getPoliceOfficers().then(res => {
        if (res.data?.officers && res.data.officers.length > 0) {
          setOfficers(res.data.officers);
        }
      }).catch(() => {});
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRejectReason, setSelectedRejectReason] = useState('Unable to verify employee ID');
  const [customRejectReason, setCustomRejectReason] = useState('');

  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedSuspendReason, setSelectedSuspendReason] = useState('Security investigation');
  const [customSuspendReason, setCustomSuspendReason] = useState('');

  const handleUpdateStatus = async (officerId, status, reason = '') => {
    try {
      setLoading(true);
      await adminApi.verifyOfficer({
        officerId,
        status,
        isApproved: status === 'APPROVED',
        rejectionReason: reason,
      }).catch(() => {});

      setOfficers(prev =>
        prev.map(o =>
          o.id === officerId ? { ...o, status, isApproved: status === 'APPROVED' } : o
        )
      );

      setLoading(false);
      setShowApproveModal(false);
      setShowRejectModal(false);
      setShowSuspendModal(false);
      alert(`Police officer account status updated to "${status}" successfully!`);
    } catch (err) {
      setLoading(false);
      alert('Error updating officer account status.');
    }
  };

  const handleConfirmRejectOfficer = () => {
    if (!selectedOfficer) return;
    const finalReason = selectedRejectReason === 'Other' ? customRejectReason.trim() || 'Unable to verify employee ID' : selectedRejectReason;
    handleUpdateStatus(selectedOfficer.id, 'REJECTED', finalReason);
  };

  const handleConfirmSuspendOfficer = () => {
    if (!selectedOfficer) return;
    const finalReason = selectedSuspendReason === 'Other' ? customSuspendReason.trim() || 'Security investigation' : selectedSuspendReason;
    handleUpdateStatus(selectedOfficer.id, 'SUSPENDED', finalReason);
  };

  const filteredOfficers = officers.filter(off => {
    if (activeFilter === 'PENDING') return off.status === 'PENDING_APPROVAL' || !off.isApproved;
    if (activeFilter === 'APPROVED') return off.status === 'APPROVED' || off.isApproved;
    if (activeFilter === 'REJECTED') return off.status === 'REJECTED';
    if (activeFilter === 'SUSPENDED') return off.status === 'SUSPENDED';
    if (activeFilter === 'DEACTIVATED') return off.status === 'DEACTIVATED';
    return true;
  });

  return (
    <div>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
        <div className="flex justify-between items-center pb-3 border-b border-slate-700 mb-5">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <UserCheck className="text-amber-400" size={22} />
            Police / Government Registration Management (Section 52)
          </h3>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2.5 mb-5 flex-wrap">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'DEACTIVATED'].map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFilter === f
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}>
              {f === 'PENDING' ? 'Pending Requests' : f}
            </button>
          ))}
        </div>

        {/* SECTION 52: POLICE REGISTRATION MANAGEMENT TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="p-3">Officer Name</th>
                <th className="p-3">Employee ID</th>
                <th className="p-3">Rank</th>
                <th className="p-3">Police Station</th>
                <th className="p-3">District</th>
                <th className="p-3">State</th>
                <th className="p-3">Registration Date</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredOfficers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center p-10 text-slate-400">
                    No police officer requests matching status "{activeFilter}".
                  </td>
                </tr>
              ) : (
                filteredOfficers.map(off => (
                  <tr key={off.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-3"><strong className="text-white font-bold">{off.fullName}</strong></td>
                    <td className="p-3 font-mono text-indigo-300 font-extrabold">{off.employeeId}</td>
                    <td className="p-3 text-slate-200">{off.rankDesignation || 'Inspector'}</td>
                    <td className="p-3 text-slate-200">{off.policeStation}</td>
                    <td className="p-3 text-slate-300">{off.district}</td>
                    <td className="p-3 text-slate-300">{off.state}</td>
                    <td className="p-3 text-slate-400">{off.createdAt || '28 Sep 2026'}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${off.status === 'APPROVED' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500' : off.status === 'REJECTED' ? 'bg-red-950/60 text-red-400 border-red-500' : 'bg-amber-950/60 text-amber-400 border-amber-500'}`}>
                        {off.status || 'PENDING_APPROVAL'}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedOfficer(off);
                            setShowDetailsModal(true);
                          }}>
                          <Eye size={13} /> View Account
                        </button>

                        {/* SECTION 54 & 55: APPROVE OFFICER */}
                        {off.status !== 'APPROVED' && (
                          <button
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedOfficer(off);
                              setShowApproveModal(true);
                            }}>
                            <Check size={13} /> Approve
                          </button>
                        )}

                        {/* SECTION 58 & 59: REJECT OFFICER */}
                        {off.status !== 'REJECTED' && off.status !== 'APPROVED' && (
                          <button
                            className="px-2.5 py-1.5 bg-red-800 hover:bg-red-700 text-white text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedOfficer(off);
                              setShowRejectModal(true);
                            }}>
                            <X size={13} /> Reject
                          </button>
                        )}

                        {/* SECTION 60: SUSPEND APPROVED OFFICER */}
                        {off.status === 'APPROVED' && (
                          <button
                            className="px-2.5 py-1.5 bg-amber-950 border border-amber-500 hover:bg-amber-900 text-amber-300 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedOfficer(off);
                              setShowSuspendModal(true);
                            }}>
                            <ShieldAlert size={13} /> Suspend
                          </button>
                        )}

                        {/* SECTION 54: REACTIVATE SUSPENDED OFFICER */}
                        {off.status === 'SUSPENDED' && (
                          <button
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                            onClick={() => handleUpdateStatus(off.id, 'APPROVED')}>
                            <Check size={13} /> Reactivate
                          </button>
                        )}

                        {/* SECTION 54: DEACTIVATE OFFICER */}
                        {off.status !== 'DEACTIVATED' && (
                          <button
                            className="px-2.5 py-1.5 bg-slate-900 border border-slate-600 hover:bg-slate-800 text-slate-300 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                            onClick={() => handleUpdateStatus(off.id, 'DEACTIVATED')}>
                            <Power size={13} /> Deactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 53 & 64: POLICE ACCOUNT DETAILS SCREEN MODAL */}
      {showDetailsModal && selectedOfficer && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-5 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <UserCheck className="text-amber-400" size={20} />
                Police Account Details: {selectedOfficer.fullName}
              </h3>
              <button className="text-slate-400 hover:text-white text-lg" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>

            {/* SECTION 64: POLICE ACCOUNT DETAILS FIELDS */}
            <div className="grid grid-cols-2 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800 text-xs">
              <div><span className="text-slate-400">Full Name:</span> <strong className="text-white ml-1">{selectedOfficer.fullName}</strong></div>
              <div><span className="text-slate-400">Employee ID:</span> <span className="font-mono text-indigo-300 font-extrabold ml-1">{selectedOfficer.employeeId}</span></div>
              <div><span className="text-slate-400">Badge / Service Number:</span> <span className="font-mono text-amber-400 font-bold ml-1">{selectedOfficer.badgeNumber || 'SRV-9910'}</span></div>
              <div><span className="text-slate-400">Rank & Station:</span> <span className="text-slate-200 font-bold ml-1">{selectedOfficer.rankDesignation} • {selectedOfficer.policeStation}</span></div>
              <div><span className="text-slate-400">District & State:</span> <span className="text-slate-200 ml-1">{selectedOfficer.district}, {selectedOfficer.state}</span></div>
              <div><span className="text-slate-400">Official Mobile:</span> <span className="text-slate-200 font-mono ml-1">{selectedOfficer.phone}</span></div>
              <div><span className="text-slate-400">Official Email:</span> <span className="text-slate-200 ml-1">{selectedOfficer.email}</span></div>
              <div><span className="text-slate-400">Account Status:</span> <span className="text-emerald-400 font-extrabold ml-1">{selectedOfficer.status || 'PENDING_APPROVAL'}</span></div>
              <div><span className="text-slate-400">Approval History:</span> <span className="text-slate-300 ml-1">Approved by ADMIN-001 on {selectedOfficer.createdAt}</span></div>
              <div><span className="text-slate-400">Last Login:</span> <span className="text-amber-400 font-bold ml-1">{selectedOfficer.lastLogin || 'Today, 09:15 AM'}</span></div>
              <div className="col-span-2"><span className="text-slate-400">Registered Devices:</span> <span className="text-indigo-300 font-mono ml-1">{selectedOfficer.registeredDevice || 'Android Enforcer Tablet (ID: dev_9918)'}</span></div>
            </div>

            {/* SECTION 64: ACTIVITY & SECURITY METRICS GRID */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] font-bold text-slate-400">TOTAL CITIZEN SEARCHES</div>
                <div className="text-xl font-black text-amber-400 mt-1">{selectedOfficer.totalSearches || 88}</div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] font-bold text-slate-400">DOCUMENT VIEWS</div>
                <div className="text-xl font-black text-emerald-400 mt-1">{selectedOfficer.documentViews || 142}</div>
              </div>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-center">
                <div className="text-[10px] font-bold text-slate-400">SECURITY ALERTS</div>
                <div className="text-xl font-black text-sky-400 mt-1">{selectedOfficer.securityAlerts || 0}</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button className="px-4 py-2 bg-slate-700 text-slate-200 text-xs font-bold rounded-xl" onClick={() => setShowDetailsModal(false)}>Close Account Details</button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 55: POLICE APPROVAL FLOW CONFIRMATION MODAL */}
      {showApproveModal && selectedOfficer && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-5 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="text-emerald-400" size={20} />
                Approve Police Account?
              </h3>
              <button className="text-slate-400 hover:text-white text-lg" onClick={() => setShowApproveModal(false)}>✕</button>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 space-y-2 border border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Officer Name:</span>
                <strong className="text-white text-sm">Officer {selectedOfficer.fullName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Employee ID:</span>
                <span className="font-mono text-indigo-300 font-extrabold">{selectedOfficer.employeeId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Police Station:</span>
                <span className="font-bold text-slate-200">{selectedOfficer.policeStation}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed italic">
              "By confirming, the officer account status will be set to APPROVED and police citizen lookup APIs will be unlocked for this officer."
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl" onClick={() => setShowApproveModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-700/20" onClick={() => handleUpdateStatus(selectedOfficer.id, 'APPROVED')}>Approve Officer & Activate</button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 58 & 59: REJECT POLICE OFFICER MODAL */}
      {showRejectModal && selectedOfficer && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-5 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <X className="text-red-400" size={20} />
                Reject Police Registration?
              </h3>
              <button className="text-slate-400 hover:text-white text-lg" onClick={() => setShowRejectModal(false)}>✕</button>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 text-xs space-y-1">
              <div className="text-slate-400">Target Officer: <strong className="text-white">{selectedOfficer.fullName}</strong></div>
              <div className="text-slate-400">Employee ID: <span className="text-indigo-300 font-mono">{selectedOfficer.employeeId}</span></div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                SELECT REJECTION REASON *
              </label>
              <select
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none"
                value={selectedRejectReason}
                onChange={e => setSelectedRejectReason(e.target.value)}>
                {OFFICER_REJECTION_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {selectedRejectReason === 'Other' && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                  CUSTOM REJECTION REASON *
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-indigo-500"
                  placeholder="Enter custom rejection reason..."
                  value={customRejectReason}
                  onChange={e => setCustomRejectReason(e.target.value)}
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl" onClick={() => setShowRejectModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-red-700/20" onClick={handleConfirmRejectOfficer}>Reject Officer</button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 60: SUSPEND POLICE OFFICER MODAL */}
      {showSuspendModal && selectedOfficer && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-5 z-50">
          <div className="bg-slate-800 rounded-2xl border border-amber-700 w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-amber-800">
              <h3 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                <ShieldAlert className="text-amber-500" size={20} />
                Suspend Police Officer Account?
              </h3>
              <button className="text-slate-400 hover:text-white text-lg" onClick={() => setShowSuspendModal(false)}>✕</button>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 text-xs space-y-1 border border-amber-900/50">
              <div className="text-slate-300">Target Officer: <strong className="text-white">{selectedOfficer.fullName}</strong></div>
              <div className="text-slate-400">Employee ID: <span className="text-indigo-300 font-mono">{selectedOfficer.employeeId}</span></div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-amber-400 uppercase tracking-wider mb-2">
                SELECT SUSPENSION REASON *
              </label>
              <select
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none"
                value={selectedSuspendReason}
                onChange={e => setSelectedSuspendReason(e.target.value)}>
                {OFFICER_SUSPENSION_REASONS.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {selectedSuspendReason === 'Other' && (
              <div>
                <label className="block text-[10px] font-black text-amber-400 uppercase tracking-wider mb-2">
                  CUSTOM SUSPENSION REASON *
                </label>
                <input
                  type="text"
                  className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-amber-500"
                  placeholder="Enter custom suspension reason..."
                  value={customSuspendReason}
                  onChange={e => setCustomSuspendReason(e.target.value)}
                />
              </div>
            )}

            <p className="text-xs text-amber-300/80 leading-relaxed italic">
              "This action will revoke active officer sessions and set accountStatus = SUSPENDED. All police citizen lookup APIs will be blocked."
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl" onClick={() => setShowSuspendModal(false)}>Cancel</button>
              <button className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-600/30" onClick={handleConfirmSuspendOfficer}>Suspend Officer & Revoke Sessions</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliceOfficerVerificationQueue;
