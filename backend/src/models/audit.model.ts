import mongoose, { Schema, Document } from 'mongoose';
import { AuditLog } from '../types';

export interface IAuditLogDocument extends Omit<AuditLog, '_id'>, Document {}

const AuditLogSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    actorId: { type: String, required: true, index: true },
    actorRole: { type: String, required: true, default: 'USER' },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true },
    entityId: { type: String, required: true, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '127.0.0.1' },
    deviceInfo: { type: String, default: 'Web Admin / Chrome' },
    createdAt: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const AuditLogModel = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
