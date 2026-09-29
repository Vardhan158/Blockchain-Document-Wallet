import React from 'react';

export const Header = ({ title = 'Dashboard Overview' }) => {
  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-extrabold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-900 px-3.5 py-1.5 rounded-full border border-slate-800 text-xs font-semibold text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10B981]" />
          <span>MongoDB Active • Hardhat EVM Connected</span>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-extrabold text-sm text-white">
            A
          </div>
          <span className="text-xs font-bold text-slate-100">Admin Supervisor</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
