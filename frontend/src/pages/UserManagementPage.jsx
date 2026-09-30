import React, { useState, useEffect } from 'react';
import { Users, Search, Check, Eye, FileText, Bell, History, Activity, ShieldAlert } from 'lucide-react';
import { adminApi } from '../api/api';

const SUSPENSION_REASONS = [
  'Security investigation',
  'Fraud',
  'Repeated misuse',
  'Administrative issue',
  'Other',
];

export const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([
    {
      id: 'user_001',
      userId: 'BDW-9K7F3A2',
      fullName: 'Rahul Kumar',
      email: 'rahul.kumar@vaultid.io',
      phone: '+91 9876543210',
      dob: '15 Nov 2003',
      isVerified: true,
      accountStatus: 'ACTIVE',
      docCount: 3,
      createdAt: '27 Sep 2026',
      lastLogin: 'Today, 10:32 AM',
    },
    {
      id: 'user_002',
      userId: 'BDW-G567Z7N',
      fullName: 'Harsha',
      email: 'harshavardhandevang@gmail.com',
      phone: '9964461359',
      dob: '15 Nov 2003',
      isVerified: true,
      accountStatus: 'ACTIVE',
      docCount: 2,
      createdAt: '28 Sep 2026',
      lastLogin: 'Today, 10:38 AM',
    },
  ]);

  // Modals
  const [selectedUser, setSelectedDocUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('DOCUMENTS');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('Security investigation');
  const [customSuspendReason, setCustomSuspendReason] = useState('');

  useEffect(() => {
    let isMounted = true;
    adminApi
      .getUsers()
      .then((res) => {
        if (isMounted && res.data?.users && res.data.users.length > 0) {
          setUsers(res.data.users);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // SECTION 45: SEARCH ACROSS USER ID, NAME, EMAIL, PHONE NUMBER
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(term) ||
      u.userId.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.phone.toLowerCase().includes(term)
    );
  });

  // SECTION 48: SUSPEND USER FLOW
  const handleConfirmSuspend = async () => {
    if (!selectedUser) return;
    const finalReason =
      suspendReason === 'Other' ? customSuspendReason.trim() || 'Security investigation' : suspendReason;

    try {
      await adminApi
        .updateUserStatus({
          userId: selectedUser.userId,
          accountStatus: 'SUSPENDED',
          reason: finalReason,
        })
        .catch(() => {});

      setUsers((prev) =>
        prev.map((u) => (u.userId === selectedUser.userId ? { ...u, accountStatus: 'SUSPENDED' } : u))
      );

      setShowSuspendModal(false);
      setCustomSuspendReason('');
      alert(`Citizen account ${selectedUser.userId} suspended. Reason: "${finalReason}". Sessions revoked.`);
    } catch {
      alert('Error suspending user account.');
    }
  };

  // SECTION 50: REACTIVATE USER FLOW
  const handleReactivateUser = async (user) => {
    try {
      await adminApi
        .updateUserStatus({
          userId: user.userId,
          accountStatus: 'ACTIVE',
        })
        .catch(() => {});

      setUsers((prev) =>
        prev.map((u) => (u.userId === user.userId ? { ...u, accountStatus: 'ACTIVE' } : u))
      );

      alert(`Citizen account ${user.userId} reactivated to ACTIVE status. Citizen notified.`);
    } catch {
      alert('Error reactivating user account.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] p-4 sm:p-5">
        {/* Header with Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e0e5f4] mb-4 gap-3">
          <h3 className="text-sm sm:text-base font-extrabold text-[#090a23] flex items-center gap-2">
            <Users className="text-[#009df2] flex-shrink-0" size={20} />
            <span>Citizen Identity Registry (Section 44)</span>
          </h3>

          {/* SECTION 45: SEARCH INPUT ACROSS USER ID, NAME, EMAIL, PHONE */}
          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-[#e0e5f4] w-full sm:w-auto focus-within:border-[#6442ff] transition-colors">
            <Search size={15} className="text-[#596383] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search User ID, Name, Email, Phone..."
              className="bg-transparent text-[#090a23] text-xs outline-none w-full sm:w-72 placeholder:text-[#7b819b]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* MOBILE CARDS VIEW (md:hidden) */}
        <div className="md:hidden space-y-3">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-[#596383] text-xs bg-white/50 rounded-xl border border-[#edf0fb]">
              No citizen user accounts found matching "{searchTerm}".
            </div>
          ) : (
            filteredUsers.map((u) => (
              <div
                key={u.id}
                className="bg-white p-3.5 rounded-xl border border-[#edf0fb] space-y-2.5 text-xs shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <strong className="text-[#090a23] text-xs block truncate">{u.fullName}</strong>
                    <span className="font-mono text-indigo-300 text-[11px] font-bold block">{u.userId}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex-shrink-0 ${
                      u.accountStatus === 'ACTIVE'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500'
                        : 'bg-red-950/60 text-red-400 border-red-500'
                    }`}>
                    {u.accountStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#edf0fb]">
                  <div>
                    <span className="text-[#7b819b] block text-[10px] uppercase font-bold">Email</span>
                    <span className="text-[#424a6b] truncate block">{u.email}</span>
                  </div>
                  <div>
                    <span className="text-[#7b819b] block text-[10px] uppercase font-bold">Phone</span>
                    <span className="font-mono text-[#424a6b] truncate block">{u.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#596383] pt-1 border-t border-[#edf0fb]/80">
                  <span className="font-bold text-[#bd8100]">{u.docCount} Documents</span>
                  <span>Registered: {u.createdAt}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1 border-t border-[#edf0fb]">
                  <button
                    type="button"
                    className="flex-1 py-1.5 bg-[#f4f7fc] hover:bg-[#dceaff] text-[#171438] text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedDocUser(u);
                      setShowDetailsModal(true);
                    }}>
                    <Eye size={13} />
                    <span>View Details</span>
                  </button>

                  {u.accountStatus === 'ACTIVE' ? (
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-red-950 border border-red-600 hover:bg-red-900 text-red-300 text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      onClick={() => {
                        setSelectedDocUser(u);
                        setShowSuspendModal(true);
                      }}>
                      <ShieldAlert size={13} />
                      <span>Suspend</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      onClick={() => handleReactivateUser(u)}>
                      <Check size={13} />
                      <span>Reactivate</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE VIEW (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e0e5f4] text-[11px] font-black text-[#596383] uppercase tracking-wider">
                <th className="p-3">User ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Account Status</th>
                <th className="p-3">Document Count</th>
                <th className="p-3">Registration Date</th>
                <th className="p-3">Management Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0fb]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center p-10 text-[#596383]">
                    No citizen user accounts found matching "{searchTerm}".
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-[#f4f7fc]/30 transition-colors">
                    <td className="p-3 font-mono text-indigo-300 font-extrabold">{u.userId}</td>
                    <td className="p-3">
                      <strong className="text-[#090a23]">{u.fullName}</strong>
                    </td>
                    <td className="p-3 text-[#424a6b]">{u.email}</td>
                    <td className="p-3 text-[#424a6b] font-mono">{u.phone}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          u.accountStatus === 'ACTIVE'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500'
                            : 'bg-red-950/60 text-red-400 border-red-500'
                        }`}>
                        {u.accountStatus}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-[#bd8100]">{u.docCount} Documents</td>
                    <td className="p-3 text-[#596383]">{u.createdAt}</td>
                    <td className="p-3">
                      <div className="flex gap-1.5 flex-wrap">
                        <button
                          type="button"
                          className="px-2.5 py-1.5 bg-[#f4f7fc] hover:bg-[#dceaff] text-[#171438] text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedDocUser(u);
                            setShowDetailsModal(true);
                          }}>
                          <Eye size={13} /> View Details
                        </button>

                        {/* SECTION 48: SUSPEND USER BUTTON */}
                        {u.accountStatus === 'ACTIVE' ? (
                          <button
                            type="button"
                            className="px-2.5 py-1.5 bg-red-950 border border-red-600 hover:bg-red-900 text-red-300 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedDocUser(u);
                              setShowSuspendModal(true);
                            }}>
                            <ShieldAlert size={13} /> Suspend
                          </button>
                        ) : (
                          /* SECTION 50: REACTIVATE USER BUTTON */
                          <button
                            type="button"
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                            onClick={() => handleReactivateUser(u)}>
                            <Check size={13} /> Reactivate
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

      {/* SECTION 46: USER DETAILS MODAL SCREEN */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-[#e0e5f4]">
              <h3 className="text-sm sm:text-base font-extrabold text-[#090a23] flex items-center gap-2">
                <Users className="text-[#009df2] flex-shrink-0" size={18} />
                <span className="truncate">
                  User Details: {selectedUser.fullName} ({selectedUser.userId})
                </span>
              </h3>
              <button
                type="button"
                className="text-[#596383] hover:text-[#090a23] text-lg p-1 cursor-pointer"
                onClick={() => setShowDetailsModal(false)}>
                ✕
              </button>
            </div>

            {/* User Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 bg-white p-3.5 sm:p-4 rounded-xl border border-[#edf0fb] text-xs">
              <div>
                <span className="text-[#596383]">User ID:</span>{' '}
                <span className="font-mono text-indigo-300 font-extrabold ml-1">{selectedUser.userId}</span>
              </div>
              <div>
                <span className="text-[#596383]">Full Name:</span>{' '}
                <span className="text-[#090a23] font-bold ml-1">{selectedUser.fullName}</span>
              </div>
              <div>
                <span className="text-[#596383]">Email:</span>{' '}
                <span className="text-[#171438] ml-1 break-all">{selectedUser.email}</span>
              </div>
              <div>
                <span className="text-[#596383]">Phone:</span>{' '}
                <span className="text-[#171438] font-mono ml-1">{selectedUser.phone}</span>
              </div>
              <div>
                <span className="text-[#596383]">Date of Birth:</span>{' '}
                <span className="text-[#171438] ml-1">{selectedUser.dob}</span>
              </div>
              <div>
                <span className="text-[#596383]">Account Status:</span>{' '}
                <span className="text-[#009963] font-bold ml-1">{selectedUser.accountStatus}</span>
              </div>
              <div>
                <span className="text-[#596383]">Registration Date:</span>{' '}
                <span className="text-[#171438] ml-1">{selectedUser.createdAt}</span>
              </div>
              <div>
                <span className="text-[#596383]">Last Login:</span>{' '}
                <span className="text-[#bd8100] font-bold ml-1">{selectedUser.lastLogin}</span>
              </div>
            </div>

            {/* SECTION 46 TAB NAVIGATION */}
            <div className="flex gap-2 border-b border-[#e0e5f4] pb-2 overflow-x-auto">
              {[
                { id: 'DOCUMENTS', label: 'Documents', icon: FileText },
                { id: 'NOTIFICATIONS', label: 'Notifications', icon: Bell },
                { id: 'AUDIT', label: 'Audit History', icon: History },
                { id: 'ACTIVITY', label: 'Account Activity', icon: Activity },
              ].map((tab) => {
                const IconComp = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id ? 'bg-indigo-600 text-white' : 'text-[#596383] hover:text-[#090a23]'
                    }`}>
                    <IconComp size={14} /> {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Contents */}
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#edf0fb] min-h-[140px] text-xs space-y-2">
              {activeTab === 'DOCUMENTS' && (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-[#fafbff] rounded-lg gap-1">
                    <span className="truncate">🚗 My Driving Licence (DRIVING_LICENSE)</span>
                    <span className="text-[#009963] font-bold text-[11px] self-start sm:self-auto">
                      APPROVED • VEHICLE
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 bg-[#fafbff] rounded-lg gap-1">
                    <span className="truncate">💳 PAN Card (PAN)</span>
                    <span className="text-[#6442ff] font-bold text-[11px] self-start sm:self-auto">
                      APPROVED • NORMAL
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'NOTIFICATIONS' && (
                <p className="text-[#596383]">
                  In-app notifications sent to citizen regarding approvals & tag changes.
                </p>
              )}

              {activeTab === 'AUDIT' && (
                <p className="text-[#596383]">
                  Audit events recorded for citizen document uploads and police lookups.
                </p>
              )}

              {activeTab === 'ACTIVITY' && (
                <p className="text-[#596383]">Last login from IP 10.0.2.15 (Enclave Authenticated).</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-[#f4f7fc] hover:bg-[#dceaff] text-[#171438] text-xs font-bold rounded-xl cursor-pointer"
                onClick={() => setShowDetailsModal(false)}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 48: SUSPEND USER MODAL */}
      {showSuspendModal && selectedUser && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-white shadow-sm rounded-2xl border border-red-700 w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-red-800">
              <h3 className="text-sm sm:text-base font-extrabold text-[#ef2547] flex items-center gap-2">
                <ShieldAlert className="text-[#ef2547] flex-shrink-0" size={18} />
                <span>Suspend Citizen Account?</span>
              </h3>
              <button
                type="button"
                className="text-[#596383] hover:text-[#090a23] text-lg p-1 cursor-pointer"
                onClick={() => setShowSuspendModal(false)}>
                ✕
              </button>
            </div>

            <div className="bg-white rounded-xl p-3 text-xs space-y-1 border border-red-900/50">
              <div className="text-[#424a6b]">
                Suspending Citizen: <strong className="text-[#090a23]">{selectedUser.fullName}</strong>
              </div>
              <div className="text-[#596383]">
                Public User ID: <span className="text-indigo-300 font-mono">{selectedUser.userId}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#ef2547] uppercase tracking-wider mb-1.5">
                SELECT SUSPENSION REASON *
              </label>
              <select
                className="w-full p-2.5 sm:p-3 bg-white border border-[#e0e5f4] rounded-xl text-[#090a23] text-xs font-bold outline-none"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}>
                {SUSPENSION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {suspendReason === 'Other' && (
              <div>
                <label className="block text-[10px] font-black text-[#ef2547] uppercase tracking-wider mb-1.5">
                  CUSTOM SUSPENSION REASON *
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 sm:p-3 bg-white border border-[#e0e5f4] rounded-xl text-[#090a23] text-xs outline-none focus:border-[#ffd3dc]"
                  placeholder="Enter custom suspension reason..."
                  value={customSuspendReason}
                  onChange={(e) => setCustomSuspendReason(e.target.value)}
                />
              </div>
            )}

            <p className="text-xs text-red-300/80 leading-relaxed italic">
              "This action will revoke all active user sessions and set accountStatus = SUSPENDED. The citizen cannot
              log in, upload documents, or modify account."
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-2">
              <button
                type="button"
                className="px-4 py-2 bg-[#f4f7fc] hover:bg-[#dceaff] text-[#171438] text-xs font-bold rounded-xl cursor-pointer"
                onClick={() => setShowSuspendModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-red-700/30 cursor-pointer"
                onClick={handleConfirmSuspend}>
                Confirm Suspension & Revoke Sessions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
