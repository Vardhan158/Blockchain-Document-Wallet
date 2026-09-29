import mongoose, { Schema, Document } from 'mongoose';
import { DocumentItem } from '../types';

export interface IDocumentItemDocument extends Omit<DocumentItem, '_id'>, Document {}

const DocumentSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    userPublicId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    documentType: { type: String, required: true },
    requestedTag: { type: String, required: true },
    approvedTag: { type: String, required: true },
    userSelectedTag: { type: String },
    adminApprovedTag: { type: String },
    status: { type: String, required: true, default: 'PENDING' },
    verificationStatus: { type: String, default: 'PENDING' },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileLocation: { type: String },
    encryptedFileKey: { type: String, default: 'AES-256-CBC-VAULT-KEY' },
    mimeType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    documentHash: { type: String, required: true },
    fileHash: { type: String },
    version: { type: Number, required: true, default: 1 },
    versionHistory: [
      {
        version: Number,
        status: String,
        rejectionReason: String,
        documentHash: String,
        fileName: String,
        createdAt: String,
      },
    ],
    rejectionReason: { type: String },
    reviewedBy: String,
    reviewStartedAt: String,
    expiryDate: { type: String },
    revocationStatus: { type: String, default: 'ACTIVE', index: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const DocumentModel = mongoose.model<IDocumentItemDocument>('Document', DocumentSchema);
