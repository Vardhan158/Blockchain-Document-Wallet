import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/api';

export function DocumentReviewPage() {
  const [params,setParams] = useSearchParams();
  const status = params.get('status') || 'PENDING';
  const [docs,setDocs] = useState([]), [selected,setSelected] = useState(null), [error,setError] = useState(''), [busy,setBusy] = useState(false);
  const [search,setSearch] = useState(''), [tag,setTag] = useState(''), [type,setType] = useState(''), [date,setDate] = useState(''), [userId,setUserId] = useState('');
  const [approvedTag,setApprovedTag] = useState(''), [reason,setReason] = useState(''), [preview,setPreview] = useState(null);
  const load = async () => { setBusy(true); try { setDocs((await api.get('/admin/documents')).data.documents); } catch { setError('Unable to load documents. Retry using Refresh.'); } finally { setBusy(false); } };
  useEffect(() => { load(); }, []);
  useEffect(() => { if (!preview) return; const timer = setTimeout(() => setPreview(null), 120000); return () => { clearTimeout(timer); URL.revokeObjectURL(preview); }; }, [preview]);
  const open = async doc => { setBusy(true); setError(''); setPreview(null); try { const result = await api.post(`/admin/documents/${doc.id}/review`); setSelected(result.data.document); setApprovedTag(''); await load(); } catch(e) { setError(e.response?.data?.message || 'Unable to open review.'); } finally { setBusy(false); } };
  const showPreview = async () => { setBusy(true); setError(''); try { const url = `/admin/documents/${selected.id}/preview`; const {data} = await api.get(url); const file = await api.get(url, { headers: {'X-Preview-Token':data.token}, responseType:'blob' }); setPreview(URL.createObjectURL(file.data)); } catch { setError('Preview unavailable or expired. Older files may require re-upload.'); } finally { setBusy(false); } };
  const decide = async action => { setBusy(true); setError(''); try { await api.post('/admin/verify', {documentId:selected.id,action,approvedTag,rejectionReason:reason}); setSelected(null); setPreview(null); await load(); } catch(e) { setError(e.response?.data?.message || 'Unable to save decision.'); } finally { setBusy(false); } };
  const filtered = docs.filter(d => (status === 'ALL' || d.status === status) && (!tag || d.userSelectedTag === tag) && (!type || d.documentType === type) && (!date || d.createdAt?.slice(0,10) === date) && (!userId || d.userPublicId?.toUpperCase().includes(userId.toUpperCase())) && [d.id,d.userPublicId,d.userName].some(v => (v || '').toLowerCase().includes(search.toLowerCase())));
  const field = (label,value) => <p><strong>{label}: </strong>{value ?? 'Not recorded'}</p>;
  return <div className="space-y-5"><h2>Document verification</h2>{error && <p role="alert">{error}</p>}
    <div className="flex flex-wrap gap-3"><label>Status <select value={status} onChange={e=>setParams({status:e.target.value})}>{['PENDING','UNDER_REVIEW','APPROVED','REJECTED','ALL'].map(s=><option key={s}>{s}</option>)}</select></label>
      <label>Selected tag <select value={tag} onChange={e=>setTag(e.target.value)}><option value="">All tags</option><option>VEHICLE</option><option>NORMAL</option></select></label>
      <label>Document type <select value={type} onChange={e=>setType(e.target.value)}><option value="">All types</option>{[...new Set(docs.map(d=>d.documentType))].map(t=><option key={t}>{t}</option>)}</select></label>
      <label>Upload date (UTC) <input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>User ID <input value={userId} onChange={e=>setUserId(e.target.value)}/></label>
      <label>Search ID or name <input value={search} onChange={e=>setSearch(e.target.value)}/></label><button disabled={busy} onClick={load}>Refresh</button></div>
    {busy && <p role="status">Loading…</p>}<div className="overflow-x-auto"><table className="w-full text-left"><thead><tr>{['Document ID','User ID','User Name','Document Type','User Selected Tag','Upload Date','Status','Review'].map(h=><th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{filtered.map(d=><tr key={d.id}>{[d.id,d.userPublicId,d.userName,d.documentType,d.userSelectedTag,d.createdAt?.slice(0,10),d.status].map((v,i)=><td key={i} className="p-3">{v || 'Not recorded'}</td>)}<td><button disabled={busy} onClick={()=>open(d)}>Open</button></td></tr>)}</tbody></table>{!busy && filtered.length===0 && <p>No documents match these filters.</p>}</div>
    {selected && <section aria-label="Document review" className="space-y-4"><button onClick={()=>{setSelected(null);setPreview(null);}}>Close review</button><div className="grid md:grid-cols-3 gap-5">
      <article className="border rounded-xl p-4"><h3>Citizen Information</h3>{field('User Name',selected.userName)}{field('User ID',selected.userPublicId)}{field('Account Status',selected.accountStatus)}</article>
      <article className="border rounded-xl p-4"><h3>Uploaded Document</h3>{field('Document Type',selected.documentType)}{field('Upload Date',selected.createdAt)}{field('Version',selected.version)}{field('File Type',selected.mimeType)}{field('File Size',`${selected.fileSize} bytes`)}<button disabled={busy} onClick={showPreview}>View secure preview</button><p>Preview closes after two minutes.</p></article>
      <article className="border rounded-xl p-4"><h3>Verification Information</h3>{field('User Selected Tag',selected.userSelectedTag)}{field('Admin Approved Tag',selected.adminApprovedTag)}{field('Verification Status',selected.status)}{field('Blockchain Status',selected.blockchainStatus)}<label>Choose appropriate classification <select value={approvedTag} onChange={e=>setApprovedTag(e.target.value)}><option value="">Select tag</option><option>VEHICLE</option><option>NORMAL</option></select></label><button disabled={busy || !approvedTag} onClick={()=>decide('APPROVE')}>Approve</button><label>Rejection reason <input value={reason} onChange={e=>setReason(e.target.value)}/></label><button disabled={busy || !reason.trim()} onClick={()=>decide('REJECT')}>Reject</button></article></div>
      {preview && (selected.mimeType==='application/pdf' ? <iframe title="Secure document preview" src={preview} style={{width:'100%',height:600}}/> : <img alt="Uploaded document" src={preview} style={{maxWidth:'100%'}}/>)}</section>}
  </div>;
}
