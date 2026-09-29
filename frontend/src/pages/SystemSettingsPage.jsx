import React, { useState } from 'react';
import { Settings, Shield, Lock, FileCode, Clock, Bell, Cpu, Save } from 'lucide-react';

const DOCUMENT_TYPES_CONFIG = [
  { name: 'Driving Licence', code: 'DRIVING_LICENSE', defaultTag: 'VEHICLE', expirySupported: true, policeEligible: true, active: true },
  { name: 'Vehicle Registration (RC)', code: 'VEHICLE_RC', defaultTag: 'VEHICLE', expirySupported: true, policeEligible: true, active: true },
  { name: 'Vehicle Insurance', code: 'VEHICLE_INSURANCE', defaultTag: 'VEHICLE', expirySupported: true, policeEligible: true, active: true },
  { name: 'Pollution Certificate (PUC)', code: 'POLLUTION', defaultTag: 'VEHICLE', expirySupported: true, policeEligible: true, active: true },
  { name: 'PAN Card', code: 'PAN', defaultTag: 'NORMAL', expirySupported: false, policeEligible: false, active: true },
  { name: 'Aadhaar Card', code: 'AADHAAR', defaultTag: 'NORMAL', expirySupported: false, policeEligible: false, active: true },
  { name: 'Voter ID', code: 'VOTER_ID', defaultTag: 'NORMAL', expirySupported: false, policeEligible: false, active: true },
  { name: 'Marks Card', code: 'MARKS_CARD', defaultTag: 'NORMAL', expirySupported: false, policeEligible: false, active: true },
  { name: 'Degree Certificate', code: 'DEGREE_CERTIFICATE', defaultTag: 'NORMAL', expirySupported: false, policeEligible: false, active: true },
  { name: 'Passport', code: 'PASSPORT', defaultTag: 'NORMAL', expirySupported: true, policeEligible: false, active: true },
];

export const SystemSettingsPage = () => {
  const [maxUploadMb, setMaxUploadMb] = useState('10');
  const [allowedExts, setAllowedExts] = useState('JPG, JPEG, PNG, PDF');
  const [otpExpiryMins, setOtpExpiryMins] = useState('10');
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState('15');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    alert('System settings updated successfully! Server parameters saved.');
  };

  return (
    <div className="space-y-6">
      {/* SUPER ADMIN RESTRICTION BANNER */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-3">
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
          <Lock size={20} />
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-amber-400">Section 90 System Settings Governance:</strong> Configures file scanners, upload limits, OTP lifespans, and document tag defaults. Sensitive infrastructure parameters are restricted to Super Admin.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Core System Parameters */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-4">
          <div className="pb-3 border-b border-slate-700">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Settings className="text-indigo-400" size={22} />
              Core System & Security Configuration (Section 90)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Allowed File Extensions
              </label>
              <input
                type="text"
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none font-mono font-bold"
                value={allowedExts}
                onChange={e => setAllowedExts(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Maximum File Upload Size (MB)
              </label>
              <input
                type="number"
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none font-bold"
                value={maxUploadMb}
                onChange={e => setMaxUploadMb(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                OTP Expiry Duration (Minutes)
              </label>
              <input
                type="number"
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none font-bold"
                value={otpExpiryMins}
                onChange={e => setOtpExpiryMins(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                Session Inactivity Timeout (Minutes)
              </label>
              <input
                type="number"
                className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none font-bold"
                value={sessionTimeoutMins}
                onChange={e => setSessionTimeoutMins(e.target.value)}
              />
            </div>
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="pt-2 flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-700">
            <div>
              <div className="text-xs font-extrabold text-white">Application Maintenance Mode</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Temporarily blocks citizen uploads and police lookups during maintenance.</p>
            </div>

            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-colors ${maintenanceMode ? 'bg-red-700 text-white' : 'bg-slate-700 text-slate-300'}`}>
              {maintenanceMode ? 'MAINTENANCE MODE ON' : 'OFF (Normal Operation)'}
            </button>
          </div>
        </div>

        {/* SECTIONS 86 & 87: DOCUMENT TYPES CONFIGURATION TABLE */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 space-y-4">
          <div className="pb-3 border-b border-slate-700">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileCode className="text-sky-400" size={22} />
              Allowed Document Types Configuration (Sections 86 & 87)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="p-3">Document Type Name</th>
                  <th className="p-3">System Code</th>
                  <th className="p-3">Default Recommended Tag</th>
                  <th className="p-3">Expiry Supported</th>
                  <th className="p-3">Police Eligible</th>
                  <th className="p-3">Active Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-xs">
                {DOCUMENT_TYPES_CONFIG.map(doc => (
                  <tr key={doc.code} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 font-bold text-white">{doc.name}</td>
                    <td className="p-3 font-mono text-indigo-300 font-bold">{doc.code}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black font-mono text-white ${doc.defaultTag === 'VEHICLE' ? 'bg-sky-700' : 'bg-indigo-900'}`}>
                        {doc.defaultTag}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-300">{doc.expirySupported ? '✓ Yes' : '✕ No (N/A)'}</td>
                    <td className="p-3 font-bold text-slate-300">{doc.policeEligible ? '✓ Yes' : '✕ No'}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950/60 text-emerald-400 border border-emerald-500">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-colors cursor-pointer">
            <Save size={16} /> Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettingsPage;
