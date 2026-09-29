import mongoose, { Schema, Document } from 'mongoose';
import { DocumentAccessAudit } from '../types';

export interface IDocumentAccessAudit extends Omit<DocumentAccessAudit, '_id'>, Document {}
const schema = new Schema({
  id: { type: String, required: true, unique: true, index: true },
  officerId: { type: String, required: true, index: true },
  documentId: { type: String, required: true, index: true },
  citizenReference: { type: String, required: true },
  accessType: { type: String, required: true },
  result: { type: String, required: true },
  ipAddress: { type: String, required: true },
  deviceId: { type: String },
  createdAt: { type: String, required: true },
}, { timestamps: true });
export const DocumentAccessAuditModel = mongoose.model<IDocumentAccessAudit>('DocumentAccessAudit', schema);
