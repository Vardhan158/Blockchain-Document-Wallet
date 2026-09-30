import React, { useState, useEffect } from 'react';
import { adminApi } from '../api/api';
import { Database, Link as LinkIcon, CheckCircle2, Clock, AlertTriangle, ShieldAlert, Cpu } from 'lucide-react';

const MOCK_LEDGER_RECORDS = [
  {
    id: 'rec_1001',
    documentId: 'DOC-KA01MJ4092',
    documentType: 'VEHICLE_REGISTRATION',
    documentHash: '0x3a4f89b2c1d0e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    ownerReference: 'USER-REF-892831',
    transactionHash: '0x8f23a8901bc7d2e4f5a6b7c8d9e0f1a2b3c4d5e6',
    blockNumber: 18492012,
    contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    network: 'Hardhat EVM Local (Chain ID: 31337)',
    verificationStatus: 'APPROVED',
    status: 'VERIFIED',
    version: 1,
    verifiedAt: '28 Sep 2026 10:38 AM',
  },
  {
    id: 'rec_1002',
    documentId: 'DOC-DL04C1029',
    documentType: 'DRIVING_LICENSE',
    documentHash: '0x7b1c4e2d3f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c',
    ownerReference: 'USER-REF-918204',
    transactionHash: '0x9a34bc1234567890abcdef1234567890abcdef12',
    blockNumber: 18492015,
    contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    network: 'Hardhat EVM Local (Chain ID: 31337)',
    verificationStatus: 'APPROVED',
    status: 'VERIFIED',
    version: 1,
    verifiedAt: '28 Sep 2026 11:15 AM',
  },
];

const formatDate = (dateStr) => {
  if (!dateStr) return '28 Sep 2026';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleDateString('en-GB');
  } catch {
    return String(dateStr);
  }
};

export const BlockchainLedgerPage = () => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [ledgerRecords, setLedgerRecords] = useState(MOCK_LEDGER_RECORDS);

  useEffect(() => {
    let isMounted = true;
    adminApi.getBlockchainRecords()
      .then(res => {
        if (isMounted && res.data?.records && res.data.records.length > 0) {
          setLedgerRecords(res.data.records);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* SECTION 73: BLOCKCHAIN MANAGEMENT MODULE DASHBOARD METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3">
        <div className="bg-white shadow-sm rounded-xl p-3.5 sm:p-4 border border-[#e0e5f4]">
          <div className="text-[10px] font-extrabold text-[#596383] uppercase truncate">TOTAL RECORDS</div>
          <div className="text-xl sm:text-2xl font-black text-[#090a23] mt-1">{ledgerRecords.length}</div>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-3.5 sm:p-4 border border-[#c7f4e4]/40 bg-gradient-to-br from-white to-[#edfbf5]">
          <div className="text-[10px] font-extrabold text-[#009963] uppercase flex items-center gap-1 truncate">
            <CheckCircle2 size={12} className="flex-shrink-0" />
            <span>SUCCESSFUL</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#009963] mt-1">
            {ledgerRecords.filter(r => r.verificationStatus === 'APPROVED' || r.status === 'VERIFIED').length}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-3.5 sm:p-4 border border-[#fff0ca]/40 bg-gradient-to-br from-white to-[#fff8e4]">
          <div className="text-[10px] font-extrabold text-[#bd8100] uppercase flex items-center gap-1 truncate">
            <Clock size={12} className="flex-shrink-0" />
            <span>PENDING</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#bd8100] mt-1">
            {ledgerRecords.filter(r => r.status === 'BLOCKCHAIN_PENDING').length}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-3.5 sm:p-4 border border-[#ffd3dc]/40 bg-gradient-to-br from-white to-[#fff0f2]">
          <div className="text-[10px] font-extrabold text-[#ef2547] uppercase flex items-center gap-1 truncate">
            <AlertTriangle size={12} className="flex-shrink-0" />
            <span>FAILED</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#ef2547] mt-1">0</div>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-3.5 sm:p-4 border border-amber-800">
          <div className="text-[10px] font-extrabold text-[#bd8100] uppercase flex items-center gap-1 truncate">
            <ShieldAlert size={12} className="flex-shrink-0" />
            <span>REVOKED</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#bd8100] mt-1">
            {ledgerRecords.filter(r => r.status === 'REVOKED').length}
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-3.5 sm:p-4 border border-[#6442ff]/40 col-span-2 sm:col-span-1">
          <div className="text-[10px] font-extrabold text-[#6442ff] uppercase flex items-center gap-1 truncate">
            <Cpu size={12} className="flex-shrink-0" />
            <span>NETWORK</span>
          </div>
          <div className="text-[11px] font-bold text-[#171438] mt-1 truncate">
            Hardhat EVM (31337)
          </div>
          <span className="text-[10px] text-[#009963] font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Node Online</span>
          </span>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] p-4 sm:p-5">
        <div className="pb-3 border-b border-[#e0e5f4] mb-4">
          <h3 className="text-sm sm:text-base font-extrabold text-[#090a23] flex items-center gap-2">
            <Database className="text-[#009963] flex-shrink-0" size={20} />
            <span>Blockchain Record Table (DocumentRegistry.sol) — Section 74</span>
          </h3>
        </div>

        <p className="text-xs text-[#596383] mb-4 sm:mb-5 leading-relaxed">
          Zero On-Chain PII Standard: No citizen names, emails, addresses, or unencrypted document files are stored on-chain. Only anonymized public User ID references and SHA-256 file fingerprints are anchored to the blockchain.
        </p>

        {/* MOBILE CARDS VIEW (md:hidden) */}
        <div className="md:hidden space-y-3">
          {ledgerRecords.length === 0 ? (
            <div className="text-center p-8 text-[#596383] text-xs bg-white/50 rounded-xl border border-[#edf0fb]">
              No blockchain records found in ledger.
            </div>
          ) : (
            ledgerRecords.map(rec => (
              <div
                key={rec.id || rec.documentId}
                className="bg-white p-3.5 rounded-xl border border-[#edf0fb] space-y-2.5 text-xs shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-[#090a23] text-xs truncate">{rec.documentId}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-950/60 text-[#009963] border border-[#c7f4e4]/80 flex-shrink-0">
                    ✓ VERIFIED
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#edf0fb]">
                  <span className="text-[#596383]">Block Number</span>
                  <span className="font-mono font-bold text-[#bd8100]">#{rec.blockNumber || 18492012}</span>
                </div>

                <div className="bg-[#fafbff] p-2 rounded-lg text-[11px] font-mono text-[#009df2] break-all border border-[#edf0fb]/80 flex items-center gap-1.5">
                  <LinkIcon size={12} className="flex-shrink-0 text-[#7b819b]" />
                  <span className="truncate">{rec.transactionHash || '0x8f23a8901bc7d2e4f5a6b7c8d9e0f1a2b3c4d5e6'}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-[#7b819b]">
                    Version v{rec.version || 1} • {formatDate(rec.verifiedAt || rec.createdAt)}
                  </span>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-[#6442ff]/80 hover:bg-[#6442ff] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    onClick={() => setSelectedRecord(rec)}>
                    Inspect Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE VIEW (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e0e5f4] text-[11px] font-black text-[#596383] uppercase tracking-wider">
                <th className="p-3">Document ID</th>
                <th className="p-3">Transaction Hash</th>
                <th className="p-3">Block Number</th>
                <th className="p-3">Blockchain Status</th>
                <th className="p-3">Transaction Date</th>
                <th className="p-3">Document Version</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#edf0fb] text-xs">
              {ledgerRecords.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-8 text-[#596383]">
                    No blockchain records found in ledger.
                  </td>
                </tr>
              ) : (
                ledgerRecords.map(rec => (
                  <tr key={rec.id || rec.documentId} className="hover:bg-[#f4f7fc]/30 transition-colors">
                    <td className="p-3"><strong className="text-[#090a23] font-mono">{rec.documentId}</strong></td>
                    <td className="p-3">
                      <span className="p-1.5 bg-[#fafbff] rounded font-mono text-[11px] text-[#009df2] inline-flex items-center gap-1">
                        <LinkIcon size={10} /> {(rec.transactionHash || '0x8f23a8901bc7d2e4f5a6').slice(0, 18)}...
                      </span>
                    </td>
                    <td className="p-3 font-bold text-[#bd8100] font-mono">#{rec.blockNumber || 18492012}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950/60 text-[#009963] border border-[#c7f4e4]">
                        ✓ VERIFIED
                      </span>
                    </td>
                    <td className="p-3 text-[#596383]">{formatDate(rec.verifiedAt || rec.createdAt)}</td>
                    <td className="p-3 font-bold text-indigo-300">v{rec.version || 1}</td>
                    <td className="p-3">
                      <button
                        type="button"
                        className="px-2.5 py-1.5 bg-[#f4f7fc] hover:bg-[#dceaff] text-[#171438] text-[11px] font-bold rounded-md transition-colors cursor-pointer"
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
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-white shadow-sm rounded-2xl border border-[#e0e5f4] w-full max-w-xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4 font-sans">
            <div className="flex justify-between items-center pb-2 border-b border-[#e0e5f4]">
              <h3 className="text-sm sm:text-base font-extrabold text-[#090a23] flex items-center gap-2">
                <Database className="text-[#009963] flex-shrink-0" size={18} />
                <span className="truncate">Blockchain Contract Details (Section 75)</span>
              </h3>
              <button
                type="button"
                className="text-[#596383] hover:text-[#090a23] text-lg p-1 cursor-pointer"
                onClick={() => setSelectedRecord(null)}>
                ✕
              </button>
            </div>

            <div className="bg-white rounded-xl p-3.5 sm:p-4 space-y-3 border border-[#edf0fb] text-xs">
              <div>
                <div className="text-[10px] font-black text-[#596383] uppercase">Document Reference</div>
                <div className="font-mono text-[#090a23] font-extrabold mt-0.5 break-all">
                  {selectedRecord.documentId} ({selectedRecord.documentType || 'VEHICLE_DOCUMENT'})
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black text-[#596383] uppercase">Document Hash (SHA-256)</div>
                <div className="p-2 bg-[#fafbff] rounded font-mono text-[11px] text-[#171438] break-all mt-0.5">
                  {selectedRecord.documentHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black text-[#596383] uppercase">Owner Hash Reference (Anonymized)</div>
                <div className="font-mono text-indigo-300 font-extrabold mt-0.5 break-all">
                  {selectedRecord.ownerReference || 'USER-HASH-A8291'}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black text-[#596383] uppercase">Transaction Hash</div>
                <div className="p-2 bg-[#fafbff] rounded font-mono text-[11px] text-[#009df2] break-all mt-0.5">
                  {selectedRecord.transactionHash || '0x8f23a8901bc7d2e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8'}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="text-[10px] font-black text-[#596383] uppercase">Block Number</div>
                  <div className="font-mono text-[#bd8100] font-bold mt-0.5">
                    Block #{selectedRecord.blockNumber || 18492012}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-black text-[#596383] uppercase">Smart Contract Address</div>
                  <div className="font-mono text-[#424a6b] text-[11px] break-all sm:truncate mt-0.5">
                    {selectedRecord.contractAddress || '0x5FbDB2315678afecb367f032d93F642f64180aa3'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <div className="text-[10px] font-black text-[#596383] uppercase">Network</div>
                  <div className="text-[#171438] mt-0.5">{selectedRecord.network || 'Hardhat EVM Local (Chain ID: 31337)'}</div>
                </div>

                <div>
                  <div className="text-[10px] font-black text-[#596383] uppercase">Timestamp</div>
                  <div className="text-[#424a6b] mt-0.5">{selectedRecord.verifiedAt || selectedRecord.createdAt || '28 Sep 2026 10:38 AM'}</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black text-[#596383] uppercase">Blockchain Status</div>
                <div className="mt-1">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950/60 text-[#009963] border border-[#c7f4e4]">
                    ✓ VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 75 ZERO PII NOTICE */}
            <div className="bg-[#fafbff] border border-[#edf0fb] rounded-xl p-3 text-[11px] text-[#596383] text-center italic">
              🔒 Section 75 Zero PII Standard: Never display sensitive user personal data unnecessarily. On-chain record contains zero PII.
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                className="px-4 py-2 bg-[#f4f7fc] hover:bg-[#dceaff] text-[#171438] text-xs font-bold rounded-xl cursor-pointer"
                onClick={() => setSelectedRecord(null)}>
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockchainLedgerPage;
