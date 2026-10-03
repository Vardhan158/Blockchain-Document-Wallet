import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { UserModel } from '../models/user.model';
import { dbService } from '../services/db.service';

dotenv.config();

/**
 * SECTION 7: SYSTEM INITIALIZATION ADMIN SEEDER (ADMIN-001)
 * Admins CANNOT self-register. The initial admin is seeded into the database from .env on startup.
 */
export const seedInitialAdmin = async (): Promise<void> => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@vault.gov.in').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminId = (process.env.ADMIN_ID || process.env.ADMIN_USER_ID || 'ADMIN-001').trim().toUpperCase();
    const adminName = process.env.ADMIN_NAME || process.env.ADMIN_FULL_NAME || 'System Admin Supervisor';
    const adminPhone = process.env.ADMIN_PHONE || '1800112026';

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const isMongoConnected = mongoose.connection.readyState === 1;

    let existingAdmin: any = null;

    if (isMongoConnected) {
      existingAdmin = await UserModel.findOne({
        $or: [{ email: adminEmail }, { userId: adminId }],
      });

      if (existingAdmin) {
        existingAdmin.userId = adminId;
        existingAdmin.fullName = adminName;
        existingAdmin.email = adminEmail;
        existingAdmin.phone = adminPhone;
        existingAdmin.passwordHash = passwordHash;
        existingAdmin.isVerified = true;
        existingAdmin.phoneVerified = true;
        existingAdmin.accountStatus = 'ACTIVE';
        existingAdmin.role = 'ADMIN';
        existingAdmin.failedLoginAttempts = 0;
        existingAdmin.lockoutUntil = '';
        await existingAdmin.save();
        console.log(`👑 [ADMIN SEEDER] Synchronized & updated administrator account: ${adminId} (${adminEmail})`);
      } else {
        existingAdmin = await UserModel.create({
          id: 'admin_001',
          userId: adminId,
          fullName: adminName,
          email: adminEmail,
          phone: adminPhone,
          passwordHash,
          isVerified: true,
          phoneVerified: true,
          accountStatus: 'ACTIVE' as const,
          role: 'ADMIN' as const,
          failedLoginAttempts: 0,
          lockoutUntil: '',
          createdAt: new Date().toISOString(),
        });
        console.log(`👑 [ADMIN SEEDER] Seeded initial administrator account: ${adminId} (${adminEmail})`);
      }
    }

    // Always seed/sync to dbService (in-memory store fallback)
    await dbService.createUser({
      id: existingAdmin?.id || 'admin_001',
      userId: adminId,
      fullName: adminName,
      email: adminEmail,
      phone: adminPhone,
      passwordHash,
      isVerified: true,
      phoneVerified: true,
      accountStatus: 'ACTIVE' as const,
      role: 'ADMIN' as const,
      createdAt: existingAdmin?.createdAt || new Date().toISOString(),
    });

    if (!isMongoConnected) {
      console.log(`👑 [ADMIN SEEDER] Seeded administrator account in memory: ${adminId} (${adminEmail})`);
    }
  } catch (err: any) {
    console.warn('⚠️ [ADMIN SEEDER] Admin seeder warning:', err.message);
  }
};

export const connectDatabase = async (): Promise<void> => {
  const isCloudRun = Boolean(process.env.K_SERVICE);
  const isProduction = process.env.NODE_ENV === 'production' || isCloudRun;
  const mongoUri = process.env.MONGODB_URI?.trim();

  if (!mongoUri && isProduction) {
    throw new Error(
      'MONGODB_URI is required in Cloud Run/production. Configure the shared MongoDB Atlas connection before starting the service.'
    );
  }

  const connectionUri = mongoUri || 'mongodb://127.0.0.1:27017/blockchain_wallet';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(connectionUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('🍃 Connected to MongoDB successfully.');
    await seedInitialAdmin();
  } catch (error: any) {
    console.error(`⚠️ Could not connect to MongoDB: ${error.message}`);
    if (isProduction) {
      throw new Error('MongoDB connection is required in Cloud Run/production. Verify MONGODB_URI and MongoDB Atlas network access.');
    }
    console.warn('ℹ️ Falling back to in-memory store for local development only.');
    await seedInitialAdmin();
  }
};
