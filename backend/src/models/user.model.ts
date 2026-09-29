import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../types';

export interface IUserDocument extends Omit<User, '_id'>, Document {}

const UserSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    phone: { type: String, default: '' },
    dob: { type: String, default: '' },
    dateOfBirth: { type: String, default: '' },
    gender: { type: String, default: '' },
    address: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: true },
    accountStatus: { type: String, default: 'ACTIVE' },
    role: { type: String, default: 'USER' },
    otp: { type: String, default: '' },
    otpExpiresAt: { type: String, default: '' },
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: { type: String, default: '' },
    fcmToken: { type: String, default: '' },
    createdAt: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
