import mongoose, { Schema, Document } from 'mongoose';
import { NotificationItem } from '../types';

export interface INotificationItemDocument extends Omit<NotificationItem, '_id'>, Document {}

const NotificationSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true, index: true },
    recipientId: { type: String, index: true },
    recipientRole: { type: String, default: 'USER' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, required: true },
    read: { type: Boolean, required: true, default: false },
    documentId: { type: String },
    createdAt: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const NotificationModel = mongoose.model<INotificationItemDocument>(
  'Notification',
  NotificationSchema
);
