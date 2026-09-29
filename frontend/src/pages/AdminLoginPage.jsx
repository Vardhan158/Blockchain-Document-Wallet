import React, { useState } from 'react';
import { adminApi } from '../api/api';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, CheckSquare, Square } from 'lucide-react';

export const AdminLoginPage = ({ onLoginSuccess }) => {
  // Section 8 Fields
  const [adminIdentifier, setAdminIdentifier] = useState('admin@vault.gov.in');
  const [password, setPassword] = useState('admin123');
  const [rememberDevice, setRememberDevice] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!adminIdentifier.trim() || !password) {
      setError('Please enter your Admin Email / Admin ID and password.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const res = await adminApi.login(adminIdentifier.trim(), password);
      setLoading(false);

      if (res.data?.token || res.data?.accessToken) {
        sessionStorage.setItem('admin_token', res.data.accessToken || res.data.token);
        sessionStorage.setItem('admin_refresh', res.data.refreshToken);
        sessionStorage.setItem('admin_last_active', String(Date.now()));
        localStorage.removeItem('admin_token');
        if (rememberDevice) {
          localStorage.setItem('admin_remember_device', 'true');
        }
        if (onLoginSuccess) onLoginSuccess();
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Invalid administrator credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-5 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/20">
            🛡️
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">ADMIN PORTAL</h2>
          <p className="text-xs font-semibold text-slate-400">
            Phase 1 — Document Verification & Government Administration
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-950/60 border border-red-500/80 p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-red-300">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 8 FIELD 1: ADMIN EMAIL / ADMIN ID */}
          <div>
            <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-2">
              Admin Email / Admin ID *
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-slate-100 text-xs">
              <Mail size={16} className="text-slate-500" />
              <input
                type="text"
                required
                className="bg-transparent w-full outline-none text-white text-xs font-semibold"
                placeholder="ADMIN-001 or admin@vault.gov.in"
                value={adminIdentifier}
                onChange={(e) => setAdminIdentifier(e.target.value)}
              />
            </div>
          </div>

          {/* SECTION 8 FIELD 2: PASSWORD */}
          <div>
            <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-wider mb-2">
              Password *
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-3 text-slate-100 text-xs">
              <Lock size={16} className="text-slate-500" />
              <input
                type="password"
                required
                className="bg-transparent w-full outline-none text-white text-xs font-semibold"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* SECTION 8 OPTIONAL: REMEMBER THIS DEVICE CHECKBOX */}
          <div
            className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer pt-1"
            onClick={() => setRememberDevice(!rememberDevice)}>
            {rememberDevice ? (
              <CheckSquare size={16} className="text-indigo-400" />
            ) : (
              <Square size={16} className="text-slate-600" />
            )}
            <span>Remember this device</span>
          </div>

          {/* SECTION 8 BUTTON: SIGN IN */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-indigo-600/30">
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* SECTION 8 & 10 SECURITY NOTICE */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 text-center font-medium space-y-1">
          <div>🔒 Seeded Admin <strong className="text-amber-400">ADMIN-001</strong> Active (Status: ACTIVE).</div>
          <div className="text-[10px] text-slate-500">Recommended Security: 2FA Active for Production.</div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
