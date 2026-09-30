import React, { useState } from 'react';
import { Settings, Lock, FileCode, Save } from 'lucide-react';

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
    <div className="space-y-5 sm:space-y-6">
      {/* SUPER ADMIN RESTRICTION BANNER */}
      <div className="bg-[#fafbff] border border-[#edf0fb] rounded-2xl p-3.5 sm:p-4 flex items-start sm:items-center gap-3">
        <div className="p-2 sm:p-2.5 bg-[#fff8e4] border border-[#fff0ca] rounded-xl text-[#bd8100] flex-shrink-0 mt-0.5 sm:mt-0">
          <Lock size={18} />
        </div>
        <p className="text-xs text-[#424a6b] leading-relaxed">
          <strong className="text-[#bd8100]">Section 90 System Settings Governance:</strong> Configures file scanners, upload limits, OTP lifespans, and document tag defaults. Sensitive infrastructure parameters are restricted to Super Admin.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-5 sm:space-y-6">
        {/* Core System Parameters */}
        <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] p-4 sm:p-5 space-y-4">
          <div className="pb-3 border-b border-[#e0e5f4]">
            <h3 className="text-sm sm:text-base font-extrabold text-[#090a23] flex items-center gap-2">
              <Settings className="text-[#6442ff] flex-shrink-0" size={20} />
              <span>Core System & Security Configuration (Section 90)</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 text-xs">
            <div>
              <label className="block text-[10px] font-black text-[#596383] uppercase mb-1.5">
                Allowed File Extensions
              </label>
              <input
                type="text"
                className="w-full p-2.5 sm:p-3 bg-white border border-[#e0e5f4] rounded-xl text-[#090a23] outline-none font-mono font-bold focus:border-[#6442ff] text-xs"
                value={allowedExts}
                onChange={(e) => setAllowedExts(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#596383] uppercase mb-1.5">
                Maximum File Upload Size (MB)
              </label>
              <input
                type="number"
                className="w-full p-2.5 sm:p-3 bg-white border border-[#e0e5f4] rounded-xl text-[#090a23] outline-none font-bold focus:border-[#6442ff] text-xs"
                value={maxUploadMb}
                onChange={(e) => setMaxUploadMb(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#596383] uppercase mb-1.5">
                OTP Expiry Duration (Minutes)
              </label>
              <input
                type="number"
                className="w-full p-2.5 sm:p-3 bg-white border border-[#e0e5f4] rounded-xl text-[#090a23] outline-none font-bold focus:border-[#6442ff] text-xs"
                value={otpExpiryMins}
                onChange={(e) => setOtpExpiryMins(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-[#596383] uppercase mb-1.5">
                Session Inactivity Timeout (Minutes)
              </label>
              <input
                type="number"
                className="w-full p-2.5 sm:p-3 bg-white border border-[#e0e5f4] rounded-xl text-[#090a23] outline-none font-bold focus:border-[#6442ff] text-xs"
                value={sessionTimeoutMins}
                onChange={(e) => setSessionTimeoutMins(e.target.value)}
              />
            </div>
          </div>

          {/* Maintenance Mode Toggle */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between bg-white p-3.5 sm:p-4 rounded-xl border border-[#e0e5f4] gap-3">
            <div>
              <div className="text-xs font-extrabold text-[#090a23]">Application Maintenance Mode</div>
              <p className="text-[11px] text-[#596383] mt-0.5">
                Temporarily blocks citizen uploads and police lookups during maintenance.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-black transition-colors cursor-pointer self-start sm:self-auto flex-shrink-0 ${
                maintenanceMode ? 'bg-red-700 text-white' : 'bg-[#e0e5f4] text-[#424a6b] hover:bg-[#dceaff]'
              }`}>
              {maintenanceMode ? 'MAINTENANCE MODE ON' : 'OFF (Normal Operation)'}
            </button>
          </div>
        </div>

        {/* SECTIONS 86 & 87: DOCUMENT TYPES CONFIGURATION */}
        <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] p-4 sm:p-5 space-y-4">
          <div className="pb-3 border-b border-[#e0e5f4]">
            <h3 className="text-sm sm:text-base font-extrabold text-[#090a23] flex items-center gap-2">
              <FileCode className="text-[#009df2] flex-shrink-0" size={20} />
              <span>Allowed Document Types Configuration (Sections 86 & 87)</span>
            </h3>
          </div>

          {/* MOBILE CARDS VIEW (md:hidden) */}
          <div className="md:hidden space-y-3">
            {DOCUMENT_TYPES_CONFIG.map((doc) => (
              <div
                key={doc.code}
                className="bg-white p-3.5 rounded-xl border border-[#edf0fb] space-y-2.5 text-xs shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-[#090a23] font-bold truncate">{doc.name}</strong>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/60 text-[#009963] border border-[#c7f4e4] flex-shrink-0">
                    ACTIVE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-[#edf0fb]">
                  <div>
                    <span className="text-[#7b819b] block text-[10px] uppercase font-bold">System Code</span>
                    <span className="font-mono text-indigo-300 font-bold truncate block">{doc.code}</span>
                  </div>
                  <div>
                    <span className="text-[#7b819b] block text-[10px] uppercase font-bold">Default Tag</span>
                    <span
                      className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-black font-mono text-white ${
                        doc.defaultTag === 'VEHICLE' ? 'bg-sky-700' : 'bg-indigo-900'
                      }`}>
                      {doc.defaultTag}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#596383] pt-1 border-t border-[#edf0fb]/80">
                  <span>Expiry: {doc.expirySupported ? '✓ Yes' : '✕ No'}</span>
                  <span>Police Lookup: {doc.policeEligible ? '✓ Yes' : '✕ No'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE VIEW (hidden md:block) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e0e5f4] text-[11px] font-black text-[#596383] uppercase tracking-wider">
                  <th className="p-3">Document Type Name</th>
                  <th className="p-3">System Code</th>
                  <th className="p-3">Default Recommended Tag</th>
                  <th className="p-3">Expiry Supported</th>
                  <th className="p-3">Police Eligible</th>
                  <th className="p-3">Active Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0fb] text-xs">
                {DOCUMENT_TYPES_CONFIG.map((doc) => (
                  <tr key={doc.code} className="hover:bg-[#f4f7fc]/30 transition-colors">
                    <td className="p-3 font-bold text-[#090a23]">{doc.name}</td>
                    <td className="p-3 font-mono text-indigo-300 font-bold">{doc.code}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black font-mono text-white ${
                          doc.defaultTag === 'VEHICLE' ? 'bg-sky-700' : 'bg-indigo-900'
                        }`}>
                        {doc.defaultTag}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-[#424a6b]">{doc.expirySupported ? '✓ Yes' : '✕ No (N/A)'}</td>
                    <td className="p-3 font-bold text-[#424a6b]">{doc.policeEligible ? '✓ Yes' : '✕ No'}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950/60 text-[#009963] border border-[#c7f4e4]">
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
            className="w-full sm:w-auto px-6 py-3 bg-[#6442ff] hover:bg-[#5231e3] text-white text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] cursor-pointer">
            <Save size={16} />
            <span>Save System Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettingsPage;
