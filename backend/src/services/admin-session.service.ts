import crypto from 'crypto';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const Session = mongoose.model('AdminSession', new mongoose.Schema({
  id: { type: String, unique: true }, adminId: String, refreshHash: String,
  lastActiveAt: Date, expiresAt: { type: Date, expires: 0 },
}));
const hash = (value: string) => crypto.createHash('sha256').update(value).digest('hex');
export async function createAdminSession(adminId: string) {
  const refreshToken = crypto.randomBytes(48).toString('hex');
  const id = crypto.randomUUID();
  await Session.create({ id, adminId, refreshHash: hash(refreshToken), lastActiveAt: new Date(), expiresAt: new Date(Date.now() + 12 * 3600000) });
  return { id, refreshToken };
}
export async function validateAdminSession(id: string, adminId: string) {
  return Session.findOneAndUpdate({ id, adminId, expiresAt: { $gt: new Date() }, lastActiveAt: { $gt: new Date(Date.now() - 15 * 60000) } }, { lastActiveAt: new Date() });
}
export async function refreshAdminSession(token: string, secret: string) {
  const refreshToken = crypto.randomBytes(48).toString('hex');
  const session = await Session.findOneAndUpdate({ refreshHash: hash(token), expiresAt: { $gt: new Date() }, lastActiveAt: { $gt: new Date(Date.now() - 15 * 60000) } }, { refreshHash: hash(refreshToken) });
  if (!session) return null;
  return { accessToken: jwt.sign({ id: session.adminId, role: 'ADMIN', sid: session.id, tokenType: 'access' }, secret, { expiresIn: '15m' }), refreshToken };
}
