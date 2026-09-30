import React, { useState } from 'react';
import { adminApi } from '../api/api';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  CheckSquare,
  Square,
  Eye,
  EyeOff,
} from 'lucide-react';

export const AdminLoginPage = ({ onLoginSuccess }) => {
  // Section 8 Fields
  const [adminIdentifier, setAdminIdentifier] = useState('admin@vault.gov.in');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleQuickDemoFill = () => {
    setAdminIdentifier('admin@vault.gov.in');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#fafbff] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 font-sans relative overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-[#6442ff]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-[90px] pointer-events-none hidden sm:block" />

      {/* Main Login Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-[#edf0fb]/90 rounded-2xl sm:rounded-3xl p-5 sm:p-8 w-full max-w-sm sm:max-w-md shadow-2xl space-y-5 sm:space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl mx-auto flex items-center justify-center text-2xl sm:text-3xl shadow-xl shadow-indigo-500/25 ring-4 ring-indigo-500/10">
            🛡️
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#090a23] tracking-tight">ADMIN PORTAL</h2>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 mt-1 rounded-full bg-[#6442ff]/80 border border-[#d3c9ff] text-[10px] font-bold text-indigo-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Trust Verification Core</span>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs font-semibold text-[#596383] max-w-xs mx-auto leading-relaxed">
            Phase 1 — Document Verification & Government Administration
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3.5 sm:space-y-4">
          {error && (
            <div className="bg-red-950/60 border border-[#ffd3dc]/80 p-3 rounded-xl flex items-start gap-2.5 text-xs font-bold text-red-300 animate-in fade-in duration-200">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-[#ef2547]" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          {/* Field 1: Admin Email / ID */}
          <div>
            <label className="block text-[10px] font-black text-[#6442ff] uppercase tracking-wider mb-1.5">
              Admin Email / Admin ID <span className="text-[#ef2547]">*</span>
            </label>
            <div className="flex items-center gap-2.5 bg-[#fafbff] border border-[#edf0fb] rounded-xl px-3.5 py-2.5 sm:py-3 text-[#090a23] text-xs focus-within:border-[#6442ff] focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <Mail size={16} className="text-[#7b819b] flex-shrink-0" />
              <input
                type="text"
                required
                className="bg-transparent w-full outline-none text-[#090a23] text-xs sm:text-sm font-semibold placeholder:text-[#7b819b]"
                placeholder="ADMIN-001 or admin@vault.gov.in"
                value={adminIdentifier}
                onChange={(e) => setAdminIdentifier(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          {/* Field 2: Password with Show/Hide Toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-black text-[#6442ff] uppercase tracking-wider">
                Password <span className="text-[#ef2547]">*</span>
              </label>
              <button
                type="button"
                onClick={handleQuickDemoFill}
                className="text-[10px] font-semibold text-[#7b819b] hover:text-[#6442ff] transition-colors cursor-pointer">
                Demo Fill
              </button>
            </div>
            <div className="flex items-center gap-2.5 bg-[#fafbff] border border-[#edf0fb] rounded-xl px-3.5 py-2.5 sm:py-3 text-[#090a23] text-xs focus-within:border-[#6442ff] focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
              <Lock size={16} className="text-[#7b819b] flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="bg-transparent w-full outline-none text-[#090a23] text-xs sm:text-sm font-semibold placeholder:text-[#7b819b]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#7b819b] hover:text-[#424a6b] transition-colors p-0.5 focus:outline-none cursor-pointer flex-shrink-0"
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember Device Checkbox */}
          <div
            className="flex items-center gap-2.5 text-xs font-semibold text-[#424a6b] cursor-pointer pt-1 select-none min-h-[36px]"
            onClick={() => setRememberDevice(!rememberDevice)}>
            {rememberDevice ? (
              <CheckSquare size={16} className="text-[#6442ff] flex-shrink-0" />
            ) : (
              <Square size={16} className="text-[#7b819b] flex-shrink-0" />
            )}
            <span className="text-xs text-[#424a6b]">Remember this device</span>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 sm:py-3.5 bg-[#6442ff] hover:bg-[#5231e3] disabled:bg-indigo-800 text-white font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/30 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-[#6442ff] focus:ring-offset-2 focus:ring-offset-white">
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : (
              <>
                <span>Sign In to Admin Portal</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Security & System Notice */}
        <div className="bg-[#fafbff]/80 border border-[#edf0fb] rounded-xl p-3 text-[11px] text-[#596383] text-center font-medium space-y-1">
          <div>
            🔒 Seeded Admin <strong className="text-[#bd8100]">ADMIN-001</strong> Active (Status: ACTIVE).
          </div>
          <div className="text-[10px] text-[#7b819b]">
            Recommended Security: 2FA Active for Production.
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <footer className="mt-4 text-center text-[10px] sm:text-[11px] text-[#7b819b] font-medium">
        Blockchain Document Wallet • Trust Verification System &copy; {new Date().getFullYear()}
      </footer>
    </div>
  );
};

export default AdminLoginPage;
