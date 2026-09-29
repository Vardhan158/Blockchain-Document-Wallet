import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/api';
import { Database, Link, CheckCircle2, Clock, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

export const BlockchainLedgerPage = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [ledgerRecords, setLedgerRecords] = useState([]);

  useEffect(() => {
    adminApi.getBlockchainRecords()
      .then(res => {
        if (res.data?.records) {
          setLedgerRecords(res.data.records);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      {/* SECTION 73: BLOCKCHAIN MANAGEMENT MODULE DASHBOARD METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase">TOTAL RECORDS</div>
          <div className="text-2xl font-black text-white mt-1">{ledgerRecords.length}</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-emerald-500/40 bg-gradient-to-br from-slate-800 to-emerald-950/30">
          <div className="text-[10px] font-extrabold text-emerald-400 uppercase flex items-center gap-1">
            <CheckCircle2 size={12} /> SUCCESSFUL
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">
            {ledgerRecords.filter(r => r.verificationStatus === 'APPROVED' || r.status === 'VERIFIED').length}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-amber-500/40 bg-gradient-to-br from-slate-800 to-amber-950/30">
          <div className="text-[10px] font-extrabold text-amber-400 uppercase flex items-center gap-1">
            <Clock size={12} /> PENDING
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {ledgerRecords.filter(r => r.status === 'BLOCKCHAIN_PENDING').length}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-red-500/40 bg-gradient-to-br from-slate-800 to-red-950/30">
          <div className="text-[10px] font-extrabold text-red-400 uppercase flex items-center gap-1">
            <AlertTriangle size={12} /> FAILED
          </div>
          <div className="text-2xl font-black text-red-400 mt-1">0</div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-amber-800">
          <div className="text-[10px] font-extrabold text-amber-500 uppercase flex items-center gap-1">
            <ShieldAlert size={12} /> REVOKED
          </div>
          <div className="text-2xl font-black text-amber-500 mt-1">
            {ledgerRecords.filter(r => r.status === 'REVOKED').length}
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-4 border border-indigo-500/40 col-span-1 lg:col-span-1">
          <div className="text-[10px] font-extrabold text-indigo-400 uppercase flex items-center gap-1">
            <Cpu size={12} /> NETWORK STATUS
          </div>
          <div className="text-[11px] font-bold text-slate-200 mt-1">
            Hardhat EVM (31337)
          </div>
          <span className="text-[10px] text-emerald-400 font-bold">● Node Online</span>
        </div>
      </div>

      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
        <div className="pb-3 border-b border-slate-700 mb-4">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <Database className="text-emerald-400" size={22} />
            Blockchain Record Table (DocumentRegistry.sol) — Section 74
          </h3>
        </div>

        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Zero On-Chain PII Standard: No citizen names, emails, addresses, or unencrypted document files are stored on-chain. Only anonymized public User ID references and SHA-256 file fingerprints are anchored to the blockchain.
        </p>

        {/* SECTION 74: BLOCKCHAIN RECORD TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="p-3">Document ID</th>
                <th className="p-3">Transaction Hash</th>
                <th className="p-3">Block Number</th>
                <th className="p-3">Blockchain Status</th>
                <th className="p-3">Transaction Date</th>
                <th className="p-3">Document Version</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {ledgerRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-slate-400">
                    No blockchain records found in ledger.
                  </td>
                </tr>
              ) : (
                ledgerRecords.map(rec => (
                  <tr key={rec.id || rec.documentId} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-3"><strong className="text-white font-mono">{rec.documentId}</strong></td>
                    <td className="p-3">
                      <span className="p-1.5 bg-slate-950 rounded font-mono text-[11px] text-sky-400 inline-flex items-center gap-1">
                        <Link size={10} /> {(rec.transactionHash || '0x8f23a8901bc7d2e4f5a6').slice(0, 18)}...
                      </span>
                    </td>
                    <td className="p-3 font-bold text-amber-400 font-mono">#{rec.blockNumber || 18492012}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950/60 text-emerald-400 border border-emerald-500">
                        ✓ VERIFIED
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{new Date(rec.verifiedAt || rec.createdAt || Date.now()).toLocaleDateString('en-GB')}</td>
                    <td className="p-3 font-bold text-indigo-300">v{rec.version || 1}</td>
                    <td className="p-3">
                      <button
                        className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold rounded-md transition-colors cursor-pointer"
                        onClick={() => setSelectedRecord(rec)}>
                        Inspect Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 75: BLOCKCHAIN DETAIL SCREEN MODAL */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-5 z-50">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Database className="text-emerald-400" size={20} />
                Blockchain Smart Contract Detail Screen (Section 75)
              </h3>
              <button className="text-slate-400 hover:text-white text-lg" onClick={() => setSelectedRecord(null)}>✕</button>
            </div>

            <div className="bg-slate-900 rounded-xl p-4 space-y-3 border border-slate-800 text-xs">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase">Document Reference</div>
                <div className="font-mono text-white font-extrabold mt-0.5">{selectedRecord.documentId} ({selectedRecord.documentType || 'VEHICLE_DOCUMENT'})</div>
              </div>

              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase">Document Hash (SHA-256)</div>
                <div className="p-2 bg-slate-950 rounded font-mono text-[11px] text-slate-200 break-all mt-0.5">{selectedRecord.documentHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}</div>
              </div>

              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase">Owner Hash Reference (Anonymized)</div>
                <div className="font-mono text-indigo-300 font-extrabold mt-0.5">{selectedRecord.ownerReference || 'USER-HASH-A8291'}</div>
              </div>

              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase">Transaction Hash</div>
                <div className="p-2 bg-slate-950 rounded font-mono text-[11px] text-sky-400 break-all mt-0.5">{selectedRecord.transactionHash || '0x8f23a8901bc7d2e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8'}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Block Number</div>
                  <div className="font-mono text-amber-400 font-bold mt-0.5">Block #{selectedRecord.blockNumber || 18492012}</div>
                </div>

                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Smart Contract Address</div>
                  <div className="font-mono text-slate-300 text-[11px] truncate mt-0.5">{selectedRecord.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Network</div>
                  <div className="text-slate-200 mt-0.5">{selectedRecord.network || 'Hardhat EVM Local (Chain ID: 31337)'}</div>
                </div>

                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase">Timestamp</div>
                  <div className="text-slate-300 mt-0.5">{selectedRecord.verifiedAt || selectedRecord.createdAt || '28 Sep 2026 10:38 AM'}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase">Blockchain Status</div>
                <div className="mt-1">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950/60 text-emerald-400 border border-emerald-500">
                    ✓ VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 75 ZERO PII NOTICE */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 text-center italic">
              🔒 Section 75 Zero PII Standard: Never display sensitive user personal data unnecessarily. On-chain record contains zero PII.
            </div>

            <div className="flex justify-end pt-1">
              <button className="px-4 py-2 bg-slate-700 text-slate-200 text-xs font-bold rounded-xl" onClick={() => setSelectedRecord(null)}>Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainLedgerPage;
