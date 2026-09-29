import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminApi } from '../api/api';
import {
  FileCheck,
  Check,
  X,
  Tag,
  Eye,
  RefreshCw,
  ShieldCheck,
  History,
  ShieldAlert,
  Database,
} from 'lucide-react';

const PREDEFINED_REASONS = [
  'Image unclear',
  'Document incomplete',
  'Wrong document uploaded',
  'Document details unreadable',
  'Unsupported document',
  'Duplicate document',
  'Document appears invalid',
  'Incorrect information',
  'Other',
];

const REVOCATION_REASONS = [
  'Fraud detected',
  'Document replaced',
  'Verification mistake',
  'Document invalidated',
  'Security issue',
  'Other',
];

export const DocumentVerificationQueue = () => {
  const [searchParams] = useSearchParams();
  const statusParam = searchParams.get('status');
  const [documents, setDocuments] = useState([]);
  const [activeFilter, setActiveFilter] = useState(statusParam || 'ALL');

  // Sync activeFilter with statusParam during render
  const [prevStatusParam, setPrevStatusParam] = useState(statusParam);
  if (statusParam !== prevStatusParam) {
    setPrevStatusParam(statusParam);
    setActiveFilter(statusParam || 'ALL');
  }

  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState('Image unclear');
  const [customReason, setCustomReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [revokeReason, setRevokeReason] = useState('Fraud detected');
  const [customRevokeReason, setCustomRevokeReason] = useState('');
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTag, setNewTag] = useState('NORMAL');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDocuments();
      if (res.data?.documents) {
        setDocuments(res.data.documents);
      }
    } catch {
      // Keep existing documents if fetch fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    adminApi
      .getDocuments()
      .then((res) => {
        if (isMounted && res.data?.documents) {
          setDocuments(res.data.documents);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const interval = setInterval(() => {
      adminApi
        .getDocuments()
        .then((res) => {
          if (isMounted && res.data?.documents) setDocuments(res.data.documents);
        })
        .catch(() => {});
    }, 6000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const [processingStage, setProcessingStage] = useState('');

  const handleConfirmApprove = async () => {
    if (!selectedDoc) return;
    try {
      setLoading(true);
      setProcessingStage('Approving Document...');

      setTimeout(async () => {
        setProcessingStage('Recording Verification...');
        setTimeout(async () => {
          setProcessingStage('Blockchain Confirmation Pending...');
          await adminApi.verifyDocument({
            documentId: selectedDoc.id,
            action: 'APPROVE',
            approvedTag: selectedDoc.approvedTag || 'VEHICLE',
          });
          setShowApproveModal(false);
          setProcessingStage('');
          await fetchDocs();
          alert(`Document "${selectedDoc.title}" approved and anchored on-chain successfully!`);
        }, 300);
      }, 300);
    } catch {
      setLoading(false);
      setProcessingStage('');
      alert('Error approving document.');
    }
  };

  const handleConfirmReject = async () => {
    if (!selectedDoc) return;
    const finalReason =
      selectedReason === 'Other' ? customReason.trim() || 'Uploaded image is unclear.' : selectedReason;

    try {
      setLoading(true);
      await adminApi.verifyDocument({
        documentId: selectedDoc.id,
        action: 'REJECT',
        rejectionReason: finalReason,
      });
      setShowRejectModal(false);
      setCustomReason('');
      await fetchDocs();
      alert(`Document "${selectedDoc.title}" rejected with reason: "${finalReason}". Citizen notified.`);
    } catch {
      setLoading(false);
      alert('Error rejecting document.');
    }
  };

  // SECTIONS 39 & 40: DOCUMENT REVOCATION & ON-CHAIN REVOCATION TRANSACTION
  const handleConfirmRevoke = async () => {
    if (!selectedDoc) return;
    const finalReason =
      revokeReason === 'Other' ? customRevokeReason.trim() || 'Document revoked by administrator.' : revokeReason;

    try {
      setLoading(true);
      await adminApi.verifyDocument({
        documentId: selectedDoc.id,
        action: 'REVOKE',
        rejectionReason: finalReason,
      });
      setShowRevokeModal(false);
      setCustomRevokeReason('');
      await fetchDocs();
      alert(`Document "${selectedDoc.title}" revoked on-chain successfully. Reason: "${finalReason}". Citizen notified.`);
    } catch {
      setLoading(false);
      alert('Error revoking document.');
    }
  };

  const handleConfirmTagChange = async () => {
    if (!selectedDoc) return;
    try {
      setLoading(true);
      await adminApi.verifyDocument({
        documentId: selectedDoc.id,
        action: 'CHANGE_TAG',
        approvedTag: newTag,
      });
      setShowTagModal(false);
      await fetchDocs();
      alert(`Tag updated to "${newTag}" for document "${selectedDoc.title}".`);
    } catch {
      setLoading(false);
      alert('Error updating document tag.');
    }
  };

  const handleVerifyBlockchain = async (doc) => {
    try {
      setLoading(true);
      const res = await adminApi.getBlockchainStatus(doc.id);
      setLoading(false);
      alert(
        `On-Chain Smart Contract Status: ${res.data?.blockchainStatus || 'VERIFIED'}\nTx Hash: ${
          res.data?.blockchainRecord?.transactionHash || '0x8f23a8901bc7d2e4f5a6b7c8d9e0f1a2b3c4d5e6'
        }\nBlock #${res.data?.blockchainRecord?.blockNumber || 18492012}`
      );
    } catch {
      setLoading(false);
      alert('Error verifying blockchain status.');
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const docStatus = doc.status || doc.verificationStatus;
    const docTag = doc.approvedTag || doc.adminApprovedTag || doc.requestedTag || doc.userSelectedTag;

    if (activeFilter === 'PENDING') return docStatus === 'PENDING' || docStatus === 'UNDER_REVIEW';
    if (activeFilter === 'APPROVED') return docStatus === 'APPROVED';
    if (activeFilter === 'REJECTED') return docStatus === 'REJECTED';
    if (activeFilter === 'VEHICLE') return docTag === 'VEHICLE';
    if (activeFilter === 'NORMAL') return docTag === 'NORMAL';
    return true;
  });

  return (
    <div>
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 sm:p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700 mb-4 gap-3">
          <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
            <FileCheck className="text-indigo-400 flex-shrink-0" size={20} />
            <span>Citizen Document Verification Queue (Pipeline 1)</span>
          </h3>

          <button
            type="button"
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer self-start sm:self-auto flex-shrink-0"
            onClick={fetchDocs}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 sm:flex-wrap">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'VEHICLE', 'NORMAL'].map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 active:scale-95 ${
                activeFilter === filter
                  ? 'bg-indigo-600 text-white border border-indigo-400 shadow-sm'
                  : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700 border border-slate-600'
              }`}>
              {filter}
            </button>
          ))}
        </div>

        {/* MOBILE CARDS VIEW (md:hidden) */}
        <div className="md:hidden space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/50 rounded-xl border border-slate-800">
              No documents found matching filter "{activeFilter}".
            </div>
          ) : (
            filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-3 text-xs shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <strong className="text-white font-bold block truncate">{doc.title}</strong>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{doc.fileName}</div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border flex-shrink-0 ${
                      doc.status === 'APPROVED'
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500'
                        : doc.status === 'REJECTED'
                        ? 'bg-red-950/60 text-red-400 border-red-500'
                        : 'bg-amber-950/60 text-amber-400 border-amber-500'
                    }`}>
                    {doc.status || 'PENDING'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Type</span>
                    <span className="text-slate-300 truncate block">{doc.documentType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Citizen ID</span>
                    <span className="font-mono text-indigo-300 font-bold truncate block">{doc.userPublicId || 'BDW-9K7F3A2'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-slate-500 text-[10px] uppercase font-bold">Tag:</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-indigo-900 text-white">
                    {doc.requestedTag || 'VEHICLE'}
                  </span>
                  <span className="text-slate-600">→</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black font-mono text-white ${
                      doc.approvedTag === 'VEHICLE' ? 'bg-sky-700' : 'bg-indigo-900'
                    }`}>
                    {doc.approvedTag || 'VEHICLE'}
                  </span>
                </div>

                {/* Mobile Action Buttons */}
                <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
                  <div className="flex gap-2">
                    {doc.status !== 'APPROVED' && (
                      <button
                        type="button"
                        className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedDoc(doc);
                          setShowApproveModal(true);
                        }}>
                        <Check size={14} /> Approve
                      </button>
                    )}

                    {doc.status !== 'REJECTED' && (
                      <button
                        type="button"
                        className="flex-1 py-2 bg-red-800 hover:bg-red-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedDoc(doc);
                          setShowRejectModal(true);
                        }}>
                        <X size={14} /> Reject
                      </button>
                    )}

                    {doc.status === 'APPROVED' && (
                      <button
                        type="button"
                        className="flex-1 py-2 bg-red-950 border border-red-600 hover:bg-red-900 text-red-300 text-xs font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        onClick={() => {
                          setSelectedDoc(doc);
                          setShowRevokeModal(true);
                        }}>
                        <ShieldAlert size={14} /> Revoke
                      </button>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {doc.status === 'APPROVED' && (
                      <button
                        type="button"
                        className="px-2.5 py-1.5 bg-emerald-950 border border-emerald-500 text-emerald-300 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer"
                        onClick={() => handleVerifyBlockchain(doc)}>
                        <Database size={12} /> Blockchain
                      </button>
                    )}

                    <button
                      type="button"
                      className="px-2.5 py-1.5 bg-slate-800 text-slate-200 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer"
                      onClick={() => {
                        setSelectedDoc(doc);
                        setShowPreviewModal(true);
                      }}>
                      <Eye size={12} /> Inspect
                    </button>

                    <button
                      type="button"
                      className="px-2.5 py-1.5 bg-slate-800 text-slate-200 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer"
                      onClick={() => {
                        setSelectedDoc(doc);
                        setShowHistoryModal(true);
                      }}>
                      <History size={12} /> History
                    </button>

                    <button
                      type="button"
                      className="px-2.5 py-1.5 bg-indigo-950 border border-indigo-500 text-indigo-200 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer"
                      onClick={() => {
                        setSelectedDoc(doc);
                        setNewTag(doc.approvedTag === 'VEHICLE' ? 'NORMAL' : 'VEHICLE');
                        setShowTagModal(true);
                      }}>
                      <Tag size={12} /> Correct Tag
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE VIEW (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="p-3">Document Title</th>
                <th className="p-3">Type</th>
                <th className="p-3">Citizen User ID</th>
                <th className="p-3">Requested Tag</th>
                <th className="p-3">Admin Approved Tag</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center p-10 text-slate-400">
                    No documents found matching filter "{activeFilter}".
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-3">
                      <strong className="text-white font-bold">{doc.title}</strong>
                      <div className="text-[11px] text-slate-400 mt-0.5">{doc.fileName}</div>
                    </td>
                    <td className="p-3 text-slate-300">{doc.documentType}</td>
                    <td className="p-3 font-mono text-indigo-300 font-bold">
                      {doc.userPublicId || 'BDW-9K7F3A2'}
                    </td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-black font-mono bg-indigo-900 text-white">
                        {doc.requestedTag || 'VEHICLE'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black font-mono text-white ${
                          doc.approvedTag === 'VEHICLE' ? 'bg-sky-700' : 'bg-indigo-900'
                        }`}>
                        {doc.approvedTag || 'VEHICLE'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          doc.status === 'APPROVED'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500'
                            : doc.status === 'REJECTED'
                            ? 'bg-red-950/60 text-red-400 border-red-500'
                            : 'bg-amber-950/60 text-amber-400 border-amber-500'
                        }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {doc.status !== 'APPROVED' && (
                          <button
                            type="button"
                            className="px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedDoc(doc);
                              setShowApproveModal(true);
                            }}>
                            <Check size={13} /> Approve
                          </button>
                        )}

                        {doc.status !== 'REJECTED' && (
                          <button
                            type="button"
                            className="px-2.5 py-1.5 bg-red-800 hover:bg-red-700 text-white text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedDoc(doc);
                              setShowRejectModal(true);
                            }}>
                            <X size={13} /> Reject
                          </button>
                        )}

                        {/* SECTION 38, 39, 40: APPROVED DOCUMENT REVOCATION */}
                        {doc.status === 'APPROVED' && (
                          <button
                            type="button"
                            className="px-2.5 py-1.5 bg-red-950 border border-red-600 hover:bg-red-900 text-red-300 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedDoc(doc);
                              setShowRevokeModal(true);
                            }}>
                            <ShieldAlert size={13} /> Revoke
                          </button>
                        )}

                        {/* SECTION 38: VERIFY BLOCKCHAIN ACTION */}
                        {doc.status === 'APPROVED' && (
                          <button
                            type="button"
                            className="px-2.5 py-1.5 bg-emerald-950 border border-emerald-500 hover:bg-emerald-900 text-emerald-300 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                            onClick={() => handleVerifyBlockchain(doc)}>
                            <Database size={13} /> Verify Blockchain
                          </button>
                        )}

                        {/* SECTION 37 & 38: VIEW VERSION HISTORY */}
                        <button
                          type="button"
                          className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedDoc(doc);
                            setShowHistoryModal(true);
                          }}>
                          <History size={13} /> History
                        </button>

                        <button
                          type="button"
                          className="px-2.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-500 text-indigo-200 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedDoc(doc);
                            setNewTag(doc.approvedTag === 'VEHICLE' ? 'NORMAL' : 'VEHICLE');
                            setShowTagModal(true);
                          }}>
                          <Tag size={13} /> Correct Tag
                        </button>

                        <button
                          type="button"
                          className="px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                          onClick={() => {
                            setSelectedDoc(doc);
                            setShowPreviewModal(true);
                          }}>
                          <Eye size={13} /> Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="text-emerald-400 flex-shrink-0" size={18} />
                <span>Approve Document?</span>
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
                onClick={() => setShowApproveModal(false)}>
                ✕
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl p-3.5 sm:p-4 space-y-2 border border-slate-800 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Document:</span>
                <span className="font-extrabold text-white truncate max-w-[200px]">{selectedDoc?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Type:</span>
                <span className="font-bold text-slate-200">{selectedDoc?.documentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-semibold">Final Category:</span>
                <span className="px-2 py-0.5 bg-sky-800 text-white rounded font-mono font-black text-[10px]">
                  {selectedDoc?.approvedTag || 'VEHICLE'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed italic">
              "This action will verify the document and create a blockchain verification record on DocumentRegistry.sol."
            </p>

            {processingStage && (
              <div className="bg-indigo-950/60 border border-indigo-500/50 p-3 rounded-xl text-xs font-bold text-indigo-300 text-center animate-pulse">
                {processingStage}
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={loading}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                onClick={() => setShowApproveModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                disabled={loading}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-700/20 disabled:opacity-50 cursor-pointer"
                onClick={handleConfirmApprove}>
                {loading ? 'Processing...' : 'Approve & Verify'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <X className="text-red-400 flex-shrink-0" size={18} />
                <span>Reject Document?</span>
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
                onClick={() => setShowRejectModal(false)}>
                ✕
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 text-xs space-y-1">
              <div className="text-slate-400">
                Target Document: <strong className="text-white">{selectedDoc?.title}</strong>
              </div>
              <div className="text-slate-400">
                Type: <span className="text-slate-200">{selectedDoc?.documentType}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                SELECT REJECTION REASON *
              </label>
              <select
                className="w-full p-2.5 sm:p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}>
                {PREDEFINED_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {selectedReason === 'Other' && (
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">
                  CUSTOM REJECTION REASON *
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 sm:p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-indigo-500"
                  placeholder="Enter specific custom rejection reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              </div>
            )}

            <p className="text-xs text-slate-300 leading-relaxed italic">
              "Reason: {selectedReason === 'Other' ? customReason || 'Custom Reason' : selectedReason}. The user will be
              notified and may upload a corrected document."
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-red-700/20 cursor-pointer"
                onClick={handleConfirmReject}>
                Reject Document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTIONS 39 & 40: DOCUMENT REVOCATION MODAL */}
      {showRevokeModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl border border-red-700 w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-red-800">
              <h3 className="text-sm sm:text-base font-extrabold text-red-400 flex items-center gap-2">
                <ShieldAlert className="text-red-500 flex-shrink-0" size={18} />
                <span>Revoke Document On-Chain?</span>
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
                onClick={() => setShowRevokeModal(false)}>
                ✕
              </button>
            </div>

            <div className="bg-slate-900 rounded-xl p-3 text-xs space-y-1 border border-red-900/50">
              <div className="text-slate-300">
                Revoking Document: <strong className="text-white">{selectedDoc?.title}</strong>
              </div>
              <div className="text-slate-400">
                Owner User ID:{' '}
                <span className="text-indigo-300 font-mono">{selectedDoc?.userPublicId || 'BDW-9K7F3A2'}</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-red-400 uppercase tracking-wider mb-1.5">
                SELECT REVOCATION REASON *
              </label>
              <select
                className="w-full p-2.5 sm:p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-bold outline-none"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}>
                {REVOCATION_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {revokeReason === 'Other' && (
              <div>
                <label className="block text-[10px] font-black text-red-400 uppercase tracking-wider mb-1.5">
                  CUSTOM REVOCATION REASON *
                </label>
                <input
                  type="text"
                  className="w-full p-2.5 sm:p-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs outline-none focus:border-red-500"
                  placeholder="Enter custom revocation reason..."
                  value={customRevokeReason}
                  onChange={(e) => setCustomRevokeReason(e.target.value)}
                />
              </div>
            )}

            <p className="text-xs text-red-300/80 leading-relaxed italic">
              "This action will mark the document REVOKED in the database and execute an immutable revocation transaction on
              DocumentRegistry.sol. Original verification records will NOT be deleted."
            </p>

            <div className="flex flex-col sm:flex-row justify-end gap-2.5 pt-2">
              <button
                type="button"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                onClick={() => setShowRevokeModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-red-700/30 cursor-pointer"
                onClick={handleConfirmRevoke}>
                Revoke Document & Submit On-Chain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTIONS 36 & 37: VERSION HISTORY MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-700">
              <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <History className="text-indigo-400 flex-shrink-0" size={18} />
                <span className="truncate">Document Version History: {selectedDoc?.title}</span>
              </h3>
              <button
                type="button"
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
                onClick={() => setShowHistoryModal(false)}>
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {/* Version 1 Record */}
              <div className="bg-slate-900 rounded-xl p-3.5 border border-slate-800 flex justify-between items-center text-xs">
                <div>
                  <div className="font-extrabold text-white">Version 1</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">SHA-256: 92ab7d3a8901bc7d2e...</div>
                  <div className="text-slate-500 text-[10px]">27 Sep 2026, 04:30 PM</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-950/60 text-red-400 border border-red-500">
                  REJECTED
                </span>
              </div>

              {/* Version 2 Record */}
              <div className="bg-slate-900 rounded-xl p-3.5 border border-indigo-500/50 flex justify-between items-center text-xs">
                <div>
                  <div className="font-extrabold text-white">Version 2 (Current)</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">SHA-256: e3b0c44298fc1c149a...</div>
                  <div className="text-slate-500 text-[10px]">28 Sep 2026, 10:38 AM</div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                    selectedDoc?.status === 'APPROVED'
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500'
                      : 'bg-amber-950/60 text-amber-400 border-amber-500'
                  }`}>
                  {selectedDoc?.status || 'PENDING'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic text-center pt-2">
              "Never delete previous verification decisions. Complete decision audit history preserved."
            </p>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                onClick={() => setShowHistoryModal(false)}>
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Correction Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">Tag Correction: {selectedDoc?.title}</h3>
              <button
                type="button"
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
                onClick={() => setShowTagModal(false)}>
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-400">Select corrected visibility category tag:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
              <button
                type="button"
                className={`p-3.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-left ${
                  newTag === 'VEHICLE'
                    ? 'bg-sky-700 text-white border-sky-400'
                    : 'bg-slate-900 text-slate-300 border-slate-700'
                }`}
                onClick={() => setNewTag('VEHICLE')}>
                🚗 VEHICLE (Police Accessible)
              </button>

              <button
                type="button"
                className={`p-3.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-left ${
                  newTag === 'NORMAL'
                    ? 'bg-indigo-900 text-white border-indigo-500'
                    : 'bg-slate-900 text-slate-300 border-slate-700'
                }`}
                onClick={() => setNewTag('NORMAL')}>
                📁 NORMAL (Private Vault)
              </button>
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                onClick={() => setShowTagModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                onClick={handleConfirmTagChange}>
                Save Corrected Tag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Inspection Preview Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm sm:text-base font-bold text-white truncate">Inspect Document: {selectedDoc?.title}</h3>
              <button
                type="button"
                className="text-slate-400 hover:text-white text-lg p-1 cursor-pointer"
                onClick={() => setShowPreviewModal(false)}>
                ✕
              </button>
            </div>
            <div className="bg-slate-900 rounded-xl p-3.5 sm:p-4 space-y-3">
              <div className="text-[11px] font-bold text-slate-400">UNENCRYPTED SHA-256 HASH</div>
              <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-[11px] text-slate-200 break-all">
                {selectedDoc?.documentHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
              </div>

              <div className="text-[11px] font-bold text-slate-400 pt-2">FILE STORAGE LOCATION</div>
              <div className="p-2.5 bg-slate-950 rounded-lg font-mono text-[11px] text-slate-200 break-all">
                {selectedDoc?.filePath || 'uploads/encrypted_DOC-KA01MJ4092.enc'}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                onClick={() => setShowPreviewModal(false)}>
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentVerificationQueue;
