import mongoose, { Schema, Document } from 'mongoose';
import { BlockchainRecord } from '../types';

export interface IBlockchainRecordDocument extends Omit<BlockchainRecord, '_id'>, Document {}

const BlockchainRecordSchema: Schema = new Schema(
  {
    id: { type: String, unique: true },
    documentId: { type: String, required: true, unique: true, index: true },
    ownerReference: { type: String, default: '' },
    documentType: { type: String, default: '' },
    approvedTag: { type: String, default: 'NORMAL' },
    documentHash: { type: String, required: true },
    transactionHash: { type: String, required: true },
    blockNumber: { type: Number, required: true, default: 18492012 },
    network: { type: String, default: 'GovChain Mainnet' },
    status: { type: String, default: 'APPROVED' },
    verificationStatus: { type: String, required: true, default: 'APPROVED' },
    verifiedAt: { type: String, required: true },
    version: { type: Number, required: true, default: 1 },
  },
  {
    timestamps: true,
  }
);

export const BlockchainRecordModel = mongoose.model<IBlockchainRecordDocument>(
  'BlockchainRecord',
  BlockchainRecordSchema
);
