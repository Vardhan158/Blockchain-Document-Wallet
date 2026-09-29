import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { PoliceOfficerModel } from '../models/officer.model';
import { dbService } from '../services/db.service';
import { DocumentAccessAuditModel } from '../models/document-access-audit.model';
import crypto from 'crypto';

export const requireRole = (role: string) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== role && !(role === 'POLICE' && req.user?.role === 'POLICE_OFFICER')) return res.status(403).json({ code: 'UNAUTHORIZED', message: 'Required role not authorized.' });
  next();
};

export const requireApprovedOfficer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const officer = await PoliceOfficerModel.findOne({ $or: [{ id: req.user?.id }, { email: req.user?.email }] }).lean();
  if (!officer) return res.status(403).json({ code: 'OFFICER_NOT_APPROVED', message: 'Approved police officer session required.' });
  if (officer.status === 'SUSPENDED') return res.status(403).json({ code: 'OFFICER_SUSPENDED', message: 'Your police account is suspended.' });
  if (officer.status !== 'APPROVED' || !officer.isApproved) return res.status(403).json({ code: 'OFFICER_NOT_APPROVED', message: 'Approved police officer session required.' });
  next();
};

export const authorizePoliceDocumentAccess = (accessType: 'METADATA_VIEW' | 'DOCUMENT_PREVIEW' | 'BLOCKCHAIN_VERIFY') => async (req: AuthRequest, res: Response, next: NextFunction) => {
  const doc = await dbService.getDocumentById(req.params.documentId);
  const owner = doc ? await dbService.getUserById(doc.userId) : undefined;
  const allowed = !!doc && (!owner?.accountStatus || owner.accountStatus === 'ACTIVE') && (doc.status === 'APPROVED' || doc.verificationStatus === 'APPROVED') &&
    doc.adminApprovedTag === 'VEHICLE' && (doc as any).revocationStatus !== 'REVOKED';
  if (!allowed) return res.status(doc ? 403 : 404).json({ code: doc ? 'DOCUMENT_NOT_AUTHORIZED' : 'USER_NOT_FOUND', message: doc ? 'Document is not authorized for police access.' : 'Document not found.' });
  const citizenReference = 'USER-HASH-' + crypto.createHash('sha256').update(doc.userPublicId || doc.userId).digest('hex').slice(0, 8).toUpperCase();
  await DocumentAccessAuditModel.create({ id: `daa_${Date.now()}_${Math.random().toString(16).slice(2)}`, officerId: req.user!.id, documentId: doc.id, citizenReference, accessType, result: 'SUCCESS', ipAddress: req.ip || 'unknown', deviceId: typeof req.headers['x-device-id'] === 'string' ? req.headers['x-device-id'] : undefined, createdAt: new Date().toISOString() }).catch(() => undefined);
  (req as any).authorizedPoliceDocument = doc;
  next();
};
