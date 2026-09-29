import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/api';
import {
  FileCheck,
  RefreshCw,
  Eye,
  Check,
  X,
  User,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export function DocumentReviewPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || 'PENDING';
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [type, setType] = useState('');
  const [date, setDate] = useState('');
  const [userId, setUserId] = useState('');
  const [approvedTag, setApprovedTag] = useState('');
  const [reason, setReason] = useState('');
  const [preview, setPreview] = useState(null);

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const res = await api.get('/admin/documents');
      if (res.data?.documents) {
        setDocs(res.data.documents);
      }
    } catch {
      setError('Unable to load documents. Retry using Refresh.');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    api.get('/admin/documents')
      .then((res) => {
        if (isMounted && res.data?.documents) {
          setDocs(res.data.documents);
        }
      })
      .catch(() => {
        if (isMounted) setError('Unable to load documents. Retry using Refresh.');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!preview) return;
    const timer = setTimeout(() => setPreview(null), 120000);
    return () => {
      clearTimeout(timer);
      URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const openReview = async (doc) => {
    setBusy(true);
    setError('');
    setPreview(null);
    try {
      const result = await api.post(`/admin/documents/${doc.id}/review`);
      setSelected(result.data.document || doc);
      setApprovedTag(doc.userSelectedTag || 'VEHICLE');
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to open review.');
      setSelected(doc);
      setApprovedTag(doc.userSelectedTag || 'VEHICLE');
    } finally {
      setBusy(false);
    }
  };

  const showPreview = async () => {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const url = `/admin/documents/${selected.id}/preview`;
      const { data } = await api.get(url);
      const file = await api.get(url, {
        headers: { 'X-Preview-Token': data.token },
        responseType: 'blob',
      });
      setPreview(URL.createObjectURL(file.data));
    } catch {
      setError('Preview unavailable or expired. Older files may require re-upload.');
    } finally {
      setBusy(false);
    }
  };

  const decide = async (action) => {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      await api.post('/admin/verify', {
        documentId: selected.id,
        action,
        approvedTag,
        rejectionReason: reason,
      });
      setSelected(null);
      setPreview(null);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to save decision.');
    } finally {
      setBusy(false);
    }
  };

  const filtered = docs.filter(
    (d) =>
      (status === 'ALL' || d.status === status) &&
      (!tag || d.userSelectedTag === tag) &&
      (!type || d.documentType === type) &&
      (!date || d.createdAt?.slice(0, 10) === date) &&
      (!userId || d.userPublicId?.toUpperCase().includes(userId.toUpperCase())) &&
      [d.id, d.userPublicId, d.userName].some((v) =>
        (v || '').toLowerCase().includes(search.toLowerCase())
      )
  );

  const getStatusBadge = (docStatus) => {
    if (docStatus === 'APPROVED')
      return 'bg-emerald-950/60 text-emerald-400 border-emerald-500';
    if (docStatus === 'REJECTED')
      return 'bg-red-950/60 text-red-400 border-red-500';
    return 'bg-amber-950/60 text-amber-400 border-amber-500';
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Card */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 sm:p-5 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-700 gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
              <FileCheck size={22} className="text-indigo-400 flex-shrink-0" />
              <span>Document Verification & Review</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Review citizen uploaded documents, verify tags, and render approval decisions.
            </p>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={load}
            className="px-3.5 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto flex-shrink-0">
            <RefreshCw size={14} className={busy ? 'animate-spin' : ''} />
            <span>Refresh Queue</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-950/60 border border-red-500/80 p-3 rounded-xl flex items-start gap-2 text-xs font-bold text-red-300">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setParams({ status: e.target.value })}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 text-xs">
              {['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ALL'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Tag</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 text-xs">
              <option value="">All Tags</option>
              <option value="VEHICLE">VEHICLE</option>
              <option value="NORMAL">NORMAL</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Doc Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 text-xs">
              <option value="">All Types</option>
              {[...new Set(docs.map((d) => d.documentType).filter(Boolean))].map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Upload Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">User ID</label>
            <input
              placeholder="e.g. BDW-9K7F3A2"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 text-xs placeholder:text-slate-600"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Search</label>
            <input
              placeholder="Title, user or doc ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 text-xs placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* MOBILE CARDS VIEW (md:hidden) */}
        <div className="md:hidden space-y-3 pt-2">
          {busy ? (
            <div className="p-8 text-center text-slate-400 text-xs animate-pulse">Loading documents...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/50 rounded-xl border border-slate-800">
              No documents match these filters.
            </div>
          ) : (
            filtered.map((d) => (
              <div
                key={d.id}
                className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2.5 text-xs shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-white text-xs truncate">{d.documentType || 'Document'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${getStatusBadge(d.status)}`}>
                    {d.status || 'PENDING'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Citizen</span>
                    <span className="text-slate-200 font-semibold truncate block">{d.userName || 'Citizen'}</span>
                    <span className="font-mono text-indigo-300 text-[10px] block truncate">{d.userPublicId || d.userId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Selected Tag</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-700/50 rounded text-[10px] font-bold">
                      {d.userSelectedTag || 'NORMAL'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-500 font-mono">{d.createdAt?.slice(0, 10)}</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => openReview(d)}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer">
                    Review
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE VIEW (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto pt-2">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="p-3">Doc ID</th>
                <th className="p-3">Citizen ID</th>
                <th className="p-3">Citizen Name</th>
                <th className="p-3">Type</th>
                <th className="p-3">Tag</th>
                <th className="p-3">Upload Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {busy ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400 animate-pulse">
                    Loading documents...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-400">
                    No documents match these filters.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 font-mono text-slate-400 max-w-[100px] truncate">{d.id}</td>
                    <td className="p-3 font-mono text-indigo-300 font-bold">{d.userPublicId || 'BDW-001'}</td>
                    <td className="p-3 text-slate-200 font-medium">{d.userName || 'Citizen'}</td>
                    <td className="p-3 text-slate-300">{d.documentType}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black font-mono bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                        {d.userSelectedTag || 'NORMAL'}
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{d.createdAt?.slice(0, 10)}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${getStatusBadge(d.status)}`}>
                        {d.status || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => openReview(d)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer">
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SELECTED DOCUMENT REVIEW SECTION */}
      {selected && (
        <section
          aria-label="Document review"
          className="bg-slate-800 rounded-2xl border border-indigo-500/50 p-4 sm:p-6 space-y-5 shadow-2xl animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-700 gap-3">
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <ShieldCheck className="text-indigo-400 flex-shrink-0" size={20} />
              <span>Reviewing: {selected.documentType || selected.id}</span>
            </h3>

            <button
              type="button"
              onClick={() => {
                setSelected(null);
                setPreview(null);
              }}
              className="px-3.5 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold rounded-xl transition-colors cursor-pointer self-start sm:self-auto">
              Close Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Citizen Information */}
            <article className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <h4 className="text-xs font-black text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <User size={15} />
                <span>Citizen Information</span>
              </h4>
              <div className="space-y-1.5 text-slate-300">
                <p><span className="text-slate-500">Name:</span> <strong className="text-white ml-1">{selected.userName || 'Not recorded'}</strong></p>
                <p><span className="text-slate-500">User ID:</span> <span className="font-mono text-indigo-300 ml-1">{selected.userPublicId || 'Not recorded'}</span></p>
                <p><span className="text-slate-500">Account Status:</span> <span className="text-emerald-400 font-bold ml-1">{selected.accountStatus || 'ACTIVE'}</span></p>
              </div>
            </article>

            {/* Uploaded Document Info */}
            <article className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <h4 className="text-xs font-black text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={15} />
                <span>Uploaded Document</span>
              </h4>
              <div className="space-y-1.5 text-slate-300">
                <p><span className="text-slate-500">Type:</span> <span className="text-white ml-1">{selected.documentType}</span></p>
                <p><span className="text-slate-500">Upload Date:</span> <span className="text-slate-300 ml-1">{selected.createdAt?.slice(0, 10)}</span></p>
                <p><span className="text-slate-500">Version:</span> <span className="text-amber-400 font-bold ml-1">v{selected.version || 1}</span></p>
                <p><span className="text-slate-500">File Size:</span> <span className="text-slate-300 ml-1">{selected.fileSize ? `${selected.fileSize} bytes` : 'Recorded'}</span></p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={showPreview}
                  className="w-full px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                  <Eye size={14} />
                  <span>View Secure Preview</span>
                </button>
                <p className="text-[10px] text-slate-500 mt-1.5 text-center flex items-center justify-center gap-1">
                  <Clock size={11} />
                  <span>Preview closes automatically after 2 minutes</span>
                </p>
              </div>
            </article>

            {/* Verification Decision Controls */}
            <article className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={15} />
                <span>Verification Decision</span>
              </h4>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                  Approved Classification Tag *
                </label>
                <select
                  value={approvedTag}
                  onChange={(e) => setApprovedTag(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-indigo-500 text-xs font-bold">
                  <option value="">Select tag</option>
                  <option value="VEHICLE">VEHICLE</option>
                  <option value="NORMAL">NORMAL</option>
                </select>
              </div>

              <button
                type="button"
                disabled={busy || !approvedTag}
                onClick={() => decide('APPROVE')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-900/30">
                <Check size={14} />
                <span>Approve & Anchor On-Chain</span>
              </button>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase">
                  Rejection Reason (If Rejecting)
                </label>
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Unclear document image"
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-red-500 text-xs"
                />
                <button
                  type="button"
                  disabled={busy || !reason.trim()}
                  onClick={() => decide('REJECT')}
                  className="w-full py-2 bg-red-800 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                  <X size={14} />
                  <span>Reject Document</span>
                </button>
              </div>
            </article>
          </div>

          {/* Secure Document Preview Frame */}
          {preview && (
            <div className="pt-4 border-t border-slate-700 space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Live Secure Preview:</h4>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-700 overflow-hidden flex items-center justify-center min-h-[300px]">
                {selected.mimeType === 'application/pdf' ? (
                  <iframe
                    title="Secure document preview"
                    src={preview}
                    className="w-full h-[400px] sm:h-[600px] rounded-lg border-0"
                  />
                ) : (
                  <img
                    alt="Uploaded document"
                    src={preview}
                    className="max-h-[500px] max-w-full object-contain rounded-lg shadow-md"
                  />
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default DocumentReviewPage;
