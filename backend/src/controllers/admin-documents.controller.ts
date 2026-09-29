import { Response } from 'express';
import { AuthRequest, JWT_SECRET } from '../middlewares/auth.middleware';
import { DocumentModel } from '../models/document.model';
import { UserModel } from '../models/user.model';
import { BlockchainRecordModel } from '../models/blockchain.model';
import { encryptionService } from '../services/encryption.service';
import { auditService } from '../services/audit.service';
import jwt from 'jsonwebtoken';
import fs from 'fs/promises';
import path from 'path';

async function present(doc: any) {
  const user = await UserModel.findOne({ id: doc.userId }).lean();
  const record = await BlockchainRecordModel.findOne({ documentId: doc.id }).lean();
  return { id: doc.id, title: doc.title, userPublicId: user?.userId, userName: user?.fullName, accountStatus: user?.accountStatus,
    documentType: doc.documentType, userSelectedTag: doc.userSelectedTag || doc.requestedTag, adminApprovedTag: doc.adminApprovedTag,
    status: doc.verificationStatus || doc.status, createdAt: doc.createdAt, version: doc.version, mimeType: doc.mimeType, fileSize: doc.fileSize,
    reviewedBy: doc.reviewedBy, reviewStartedAt: doc.reviewStartedAt, blockchainStatus: record ? 'RECORDED' : 'NOT_RECORDED' };
}
export async function listAdminDocuments(req: AuthRequest, res: Response) {
  try {
    const docs = await DocumentModel.find({}).sort({ createdAt: -1 }).lean();
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ documents: await Promise.all(docs.map(present)) });
  } catch { return res.status(503).json({ message: 'Unable to load documents.' }); }
}
export async function reviewAdminDocument(req: AuthRequest, res: Response) {
  try {
    let doc: any = await DocumentModel.findOneAndUpdate({ id: req.params.documentId, status: 'PENDING' },
      { status: 'UNDER_REVIEW', verificationStatus: 'UNDER_REVIEW', reviewedBy: req.user!.id, reviewStartedAt: new Date().toISOString() }, { returnDocument: 'after' }).lean();
    doc ||= await DocumentModel.findOne({ id: req.params.documentId }).lean();
    if (!doc) return res.status(404).json({ message: 'Document not found.' });
    if (doc.status === 'UNDER_REVIEW' && doc.reviewedBy && doc.reviewedBy !== req.user!.id) return res.status(409).json({ message: 'Another administrator is reviewing this document.' });
    await auditService.logEvent(req.user!.id, 'ADMIN', 'DOCUMENT_REVIEW_OPENED', 'DOCUMENT', doc.id);
    res.setHeader('Cache-Control', 'no-store');
    return res.json({ document: await present(doc) });
  } catch { return res.status(503).json({ message: 'Unable to open review.' }); }
}
export async function adminPreview(req: AuthRequest, res: Response) {
  try {
    const doc = await DocumentModel.findOne({ id: req.params.documentId }).lean();
    if (!doc) return res.status(404).json({ message: 'Document not found.' });
    if (!req.headers['x-preview-token']) {
      return res.json({ token: jwt.sign({ scope: 'ADMIN_PREVIEW', documentId: doc.id, adminId: req.user!.id, version: doc.version }, JWT_SECRET, { expiresIn: '2m' }), expiresInSeconds: 120 });
    }
    const grant: any = jwt.verify(String(req.headers['x-preview-token']), JWT_SECRET);
    if (grant.scope !== 'ADMIN_PREVIEW' || grant.adminId !== req.user!.id || grant.documentId !== doc.id || grant.version !== doc.version) return res.status(403).json({ message: 'Preview not authorized.' });
    const root = await fs.realpath(path.resolve('uploads'));
    const file = await fs.realpath(path.resolve(doc.filePath));
    if (!file.startsWith(root + path.sep)) return res.status(403).json({ message: 'Invalid storage location.' });
    const data = encryptionService.decryptDocument(await fs.readFile(file));
    if (!['application/pdf', 'image/png', 'image/jpeg'].includes(doc.mimeType)) return res.status(415).json({ message: 'Unsupported preview format.' });
    await auditService.logEvent(req.user!.id, 'ADMIN', 'DOCUMENT_PREVIEW', 'DOCUMENT', doc.id);
    res.set({ 'Cache-Control': 'no-store, private', 'Content-Type': doc.mimeType, 'X-Content-Type-Options': 'nosniff' });
    return res.send(data);
  } catch { return res.status(410).json({ message: 'Preview unavailable or expired. Legacy files may require re-upload.' }); }
}
