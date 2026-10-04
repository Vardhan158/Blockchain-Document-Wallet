import mongoose, { Schema, Document } from 'mongoose';

export interface IRevokedRefreshToken extends Document {
  tokenHash: string;
  expiresAt: Date;
}

const RevokedRefreshTokenSchema = new Schema<IRevokedRefreshToken>(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    // MongoDB removes this record automatically after the original token can
    // no longer be valid, keeping the revocation collection bounded.
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true },
);

export const RevokedRefreshTokenModel = mongoose.model<IRevokedRefreshToken>(
  'RevokedRefreshToken',
  RevokedRefreshTokenSchema,
);
