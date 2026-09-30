import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminOverview } from './pages/AdminOverview';
import { Sidebar } from './components/AdminNavigation';
import { Header } from './components/Header';
import { DocumentVerificationQueue } from './pages/DocumentVerificationQueue';
import { PoliceOfficerVerificationQueue } from './pages/PoliceOfficerVerificationQueue';
import { UserManagementPage } from './pages/UserManagementPage';
import { BlockchainLedgerPage } from './pages/BlockchainLedgerPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SystemSettingsPage } from './pages/SystemSettingsPage';
import { AdminProfilePage } from './pages/AdminProfilePage';

export function App() {
  const [authenticated, setAuthenticated] = useState(
    !!sessionStorage.getItem('admin_token') || !!localStorage.getItem('admin_token')
  );

  useEffect(() => {
    const expire = () => {
      ['admin_token', 'admin_refresh', 'admin_last_active'].forEach(key => sessionStorage.removeItem(key));
      localStorage.removeItem('admin_token');
      setAuthenticated(false);
    };

    let lastActive = Number(sessionStorage.getItem('admin_last_active')) || Date.now();
    const activity = () => {
      if (Date.now() - lastActive >= 900000) expire();
      else {
        lastActive = Date.now();
        sessionStorage.setItem('admin_last_active', String(lastActive));
      }
    };

    const timer = setInterval(() => {
      if (Date.now() - lastActive >= 900000) expire();
    }, 1000);

    const events = ['pointerdown', 'keydown', 'scroll'];
    events.forEach(e => window.addEventListener(e, activity));
    window.addEventListener('admin-session-expired', expire);

    return () => {
      clearInterval(timer);
      events.forEach(e => window.removeEventListener(e, activity));
      window.removeEventListener('admin-session-expired', expire);
    };
  }, [authenticated]);

  if (!authenticated) {
    return (
      <AdminLoginPage
        onLoginSuccess={() => {
          window.history.replaceState(null, '', '/');
          setAuthenticated(true);
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col lg:flex-row min-h-screen bg-white text-[#090a23] font-sans antialiased">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-white">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Header title="Dashboard Overview" />
                  <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    <AdminOverview />
                  </div>
                </>
              }
            />

            <Route
              path="/document-queue"
              element={
                <>
                  <Header title="Citizen Document Verification Queue (Pipeline 1)" />
                  <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    <DocumentVerificationQueue />
                  </div>
                </>
              }
            />

            <Route
              path="/officer-queue"
              element={
                <>
                  <Header title="Police Officer Verification Queue (Pipeline 2)" />
                  <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    <PoliceOfficerVerificationQueue />
                  </div>
                </>
              }
            />

            <Route
              path="/user-management"
              element={
                <>
                  <Header title="Citizen User Accounts & Identity Registry" />
                  <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    <UserManagementPage />
                  </div>
                </>
              }
            />

            <Route
              path="/blockchain-ledger"
              element={
                <>
                  <Header title="On-Chain Smart Contract Ledger Explorer" />
                  <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    <BlockchainLedgerPage />
                  </div>
                </>
              }
            />

            <Route
              path="/audit-logs"
              element={
                <>
                  <Header title="Immutable System Audit Logs (Section 55)" />
                  <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    <AuditLogsPage />
                  </div>
                </>
              }
            />

            <Route
              path="/notifications"
              element={
                <>
                  <Header title="Alerts & Push Notifications" />
                  <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    <NotificationsPage />
                  </div>
                </>
              }
            />

            <Route
              path="/security"
              element={
                <>
                  <Header title="Security Policy & Inactivity Controls" />
                  <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] p-6 space-y-3">
                      <h2 className="text-base font-extrabold text-[#090a23]">Security & Session Policy</h2>
                      <p className="text-xs text-[#424a6b] leading-relaxed">
                        Admin access tokens expire after 15 minutes. Sessions expire after 15 minutes of inactivity, with a maximum refresh lifetime of 12 hours.
                      </p>
                    </div>
                  </div>
                </>
              }
            />

            <Route
              path="/system-settings"
              element={
                <>
                  <Header title="System Settings & Document Types Governance" />
                  <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    <SystemSettingsPage />
                  </div>
                </>
              }
            />

            <Route
              path="/admin-profile"
              element={
                <>
                  <Header title="Administrator Profile & Security Settings" />
                  <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
                    <AdminProfilePage onLogout={() => {
                      sessionStorage.clear();
                      localStorage.clear();
                      setAuthenticated(false);
                    }} />
                  </div>
                </>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
