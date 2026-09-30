import React, { useState } from 'react';
import { Bell, Send, Lock, ShieldAlert, FileCheck, UserCheck, AlertTriangle, Database } from 'lucide-react';

export const NotificationsPage = () => {
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [recipientRole, setRecipientRole] = useState('ALL');

  const adminAlerts = [
    {
      id: 'alert_001',
      type: 'SUSPICIOUS_POLICE_ACTIVITY',
      title: 'Suspicious Police Search Activity Detected',
      message: 'Officer POL-KA-A8921 performed 58 rapid document searches in 10 minutes.',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-950/60 border-red-500/80',
      time: '28 Sep 2026 11:42 AM',
    },
    {
      id: 'alert_002',
      type: 'INTEGRITY_FAILURE',
      title: 'Document Integrity Failure',
      message: 'The stored file hash for "Vehicle Insurance" (DOC-INS77102) does not match the blockchain record.',
      icon: ShieldAlert,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/60 border-amber-500/80',
      time: '28 Sep 2026 10:15 AM',
    },
    {
      id: 'alert_003',
      type: 'NEW_PENDING_DOC',
      title: 'New Pending Document Uploaded',
      message: 'Citizen BDW-9K7F3A2 uploaded new "Driving Licence" requiring verification.',
      icon: FileCheck,
      color: 'text-sky-400',
      bgColor: 'bg-[#ffffff] border-[#edf0fb]',
      time: '28 Sep 2026 09:30 AM',
    },
    {
      id: 'alert_004',
      type: 'NEW_POLICE_REGISTRATION',
      title: 'New Police Registration Request',
      message: 'Officer Officer Ravi Kumar (KA-POL-28473) requested account approval.',
      icon: UserCheck,
      color: 'text-indigo-400',
      bgColor: 'bg-[#ffffff] border-[#edf0fb]',
      time: '28 Sep 2026 08:50 AM',
    },
  ];

  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      alert('Please enter notification title and message.');
      return;
    }

    alert(`Firebase FCM Push Notification broadcasted to target: [${recipientRole}] successfully!`);
    setBroadcastTitle('');
    setBroadcastBody('');
  };

  return (
    <div className="space-y-6">
      {/* SECTION 85: RECORD RETENTION PRINCIPLE BANNER */}
      <div className="bg-[#fafbff] border border-[#edf0fb] rounded-2xl p-4 flex items-center gap-3">
        <div className="p-2.5 bg-[#6442ff]/10 border border-[#d3c9ff] rounded-xl text-[#6442ff]">
          <Lock size={20} />
        </div>
        <p className="text-xs text-[#424a6b] leading-relaxed">
          <strong className="text-[#6442ff]">Section 85 Non-Destructive Record Retention Principle:</strong> Approved documents, audit records, blockchain references, and police search logs are NEVER hard deleted. System entities use lifecycle statuses (<span className="text-[#009963] font-bold font-mono">ACTIVE</span>, <span className="text-[#596383] font-bold font-mono">INACTIVE</span>, <span className="text-[#ef2547] font-bold font-mono">REVOKED</span>, <span className="text-[#bd8100] font-bold font-mono">DEACTIVATED</span>, <span className="text-[#009df2] font-bold font-mono">SUPERSEDED</span>) to preserve immutable history.
        </p>
      </div>

      {/* SECTION 83: ADMIN NOTIFICATIONS INBOX */}
      <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] p-5 space-y-4">
        <div className="pb-3 border-b border-[#e0e5f4] flex justify-between items-center">
          <h3 className="text-base font-extrabold text-[#090a23] flex items-center gap-2">
            <Bell className="text-[#bd8100]" size={22} />
            Administrator Security Alerts & System Notifications (Section 83)
          </h3>
          <span className="text-xs font-bold text-[#bd8100] bg-amber-950 px-2.5 py-1 rounded-full border border-[#fff0ca]">
            {adminAlerts.length} Active Alerts
          </span>
        </div>

        <div className="space-y-3">
          {adminAlerts.map(alert => {
            const IconComp = alert.icon;
            return (
              <div key={alert.id} className={`p-4 rounded-xl border flex items-center gap-4 ${alert.bgColor}`}>
                <div className={`p-2.5 rounded-xl bg-[#fafbff]/90 ${alert.color}`}>
                  <IconComp size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-extrabold text-[#090a23]">{alert.title}</h4>
                    <span className="text-[11px] font-mono text-[#596383]">{alert.time}</span>
                  </div>
                  <p className="text-xs text-[#424a6b] mt-1">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 81: FIREBASE FCM BROADCAST FORM */}
      <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] p-5 space-y-4">
        <div className="pb-3 border-b border-[#e0e5f4]">
          <h3 className="text-base font-extrabold text-[#090a23] flex items-center gap-2">
            <Send className="text-[#009963]" size={22} />
            Firebase FCM Push Notification Delivery (Section 81)
          </h3>
        </div>

        <form onSubmit={handleSendBroadcast} className="bg-white p-5 rounded-xl border border-[#edf0fb] space-y-4">
          <div>
            <label className="block text-[10px] font-black text-[#596383] uppercase tracking-wider mb-2">
              TARGET RECIPIENT ROLE *
            </label>
            <select
              className="w-full p-3 bg-white shadow-sm border border-[#e0e5f4] rounded-xl text-[#090a23] text-xs font-bold outline-none"
              value={recipientRole}
              onChange={e => setRecipientRole(e.target.value)}>
              <option value="ALL">All Users (Citizens + Police Officers)</option>
              <option value="USER">Citizens Only (Mobile App Users)</option>
              <option value="POLICE">Police Officers Only (Government Terminal)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#596383] uppercase tracking-wider mb-2">
              NOTIFICATION TITLE *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Traffic Verification Policy Update"
              className="w-full p-3 bg-white shadow-sm border border-[#e0e5f4] rounded-xl text-[#090a23] text-xs outline-none focus:border-[#6442ff] font-semibold"
              value={broadcastTitle}
              onChange={e => setBroadcastTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-[#596383] uppercase tracking-wider mb-2">
              NOTIFICATION MESSAGE BODY *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Enter complete push notification message..."
              className="w-full p-3 bg-white shadow-sm border border-[#e0e5f4] rounded-xl text-[#090a23] text-xs outline-none focus:border-[#6442ff] font-semibold"
              value={broadcastBody}
              onChange={e => setBroadcastBody(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="px-5 py-3 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-emerald-700/20">
            <Send size={15} /> Send Real-Time Firebase FCM Broadcast
          </button>
        </form>
      </div>
    </div>
  );
};

export default NotificationsPage;
