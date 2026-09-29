import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model';

/**
 * SECTION 7: SYSTEM INITIALIZATION ADMIN SEEDER (ADMIN-001)
 * Admins CANNOT self-register. The initial admin is seeded into the database.
 */
export const seedInitialAdmin = async (): Promise<void> => {
  try {
    const adminEmail = 'admin@vault.gov.in';
    const existing = await UserModel.findOne({ email: adminEmail });

    if (!existing) {
      const passwordHash = await bcrypt.hash('admin123', 10);
      await UserModel.create({
        id: 'admin_001',
        userId: 'ADMIN-001',
        fullName: 'System Admin Supervisor',
        email: adminEmail,
        phone: '1800112026',
        passwordHash,
        isVerified: true,
        accountStatus: 'ACTIVE',
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
      });
      console.log(`👑 [ADMIN SEEDER] Seeded initial administrator account: ADMIN-001 (${adminEmail})`);
    }
  } catch (err: any) {
    console.warn('Admin seeder error:', err.message);
  }
};

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/blockchain_wallet';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`🍃 Connected to MongoDB successfully at: ${mongoUri}`);
    await seedInitialAdmin();
  } catch (error: any) {
    console.warn(`⚠️ Could not connect to MongoDB at ${mongoUri}: ${error.message}`);
    console.warn('ℹ️ Falling back to in-memory store for local testing.');
  }
};
