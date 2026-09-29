import mongoose, { Schema, Document } from 'mongoose';
import { PoliceOfficer } from '../types';

export interface IPoliceOfficerDocument extends Omit<PoliceOfficer, '_id'>, Document {}

const PoliceOfficerSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    officerId: { type: String, required: true, unique: true, index: true },
    employeeId: { type: String, required: true, index: true },
    badgeNumber: { type: String, default: '' },
    fullName: { type: String, required: true },
    rankDesignation: { type: String, required: true, default: 'Inspector' },
    policeStation: { type: String, required: true, default: 'Central Traffic Station' },
    district: { type: String, required: true, default: 'Bangalore Urban' },
    state: { type: String, required: true, default: 'Karnataka' },
    phone: { type: String, required: true, default: '' },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    department: { type: String, default: 'Traffic Enforcement Unit' },
    stationCode: { type: String, default: '' },
    serviceNumber: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    isApproved: { type: Boolean, required: true, default: false },
    status: { type: String, required: true, default: 'PENDING_APPROVAL' },
    otp: { type: String, default: '' },
    otpExpiresAt: { type: String, default: '' },
    createdAt: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const PoliceOfficerModel = mongoose.model<IPoliceOfficerDocument>(
  'PoliceOfficer',
  PoliceOfficerSchema
);
