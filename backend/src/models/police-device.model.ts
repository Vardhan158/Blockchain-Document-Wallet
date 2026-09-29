import mongoose, { Schema, Document } from 'mongoose';

export interface PoliceDevice extends Document {
  id: string; officerId: string; deviceIdentifier: string; pushToken?: string; lastLoginAt: string; status: 'TRUSTED' | 'UNTRUSTED' | 'REVOKED';
}
const schema = new Schema({
  id: { type: String, required: true, unique: true }, officerId: { type: String, required: true, index: true },
  deviceIdentifier: { type: String, required: true, index: true }, pushToken: String,
  lastLoginAt: { type: String, required: true }, status: { type: String, default: 'UNTRUSTED' },
}, { timestamps: true });
export const PoliceDeviceModel = mongoose.model<PoliceDevice>('PoliceDevice', schema);
