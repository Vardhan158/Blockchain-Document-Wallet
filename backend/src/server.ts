import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import apiRoutes from './routes/api.routes';
import { connectDatabase } from './config/database';
import { UserModel } from './models/user.model';

dotenv.config();

const app = express();
app.set('trust proxy', 1);
const PORT = Number(process.env.PORT) || 8080;

if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    const forwardedProto = req.headers['x-forwarded-proto'];
    if (req.path !== '/health' && forwardedProto !== 'https' && !req.secure) return res.status(426).json({ code: 'HTTPS_REQUIRED', message: 'HTTPS is required.' });
    next();
  });
}

// SECTION 60: SECURE HTTP HEADERS VIA HELMET
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows cross-origin REST API calls
    crossOriginEmbedderPolicy: false,
  })
);

// SECTION 60: CORS RESTRICTIONS
app.use(
  cors({
    origin: '*', // Configured for mobile app / web client access
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Preview-Token'],
  })
);

// SECTION 60: RATE LIMITING (Max 100 requests per 15 minutes)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many API requests from this IP. Please try again after 15 minutes.',
  },
});

app.use('/api', apiLimiter);
app.use('/api/v1', apiLimiter);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Health Check
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'blockchain-wallet-backend',
  });
});

// SECTION 50: API ROUTES (/api/v1 AND /api)
app.use('/api/v1', apiRoutes);
app.use('/api', apiRoutes);

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vault.gov.in';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminId = process.env.ADMIN_ID || 'ADMIN-001';

  try {
    const existingAdmin = await UserModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await UserModel.create({
        id: `admin_${Date.now()}`,
        userId: adminId,
        fullName: process.env.ADMIN_NAME || 'System Admin Supervisor',
        email: adminEmail,
        phone: process.env.ADMIN_PHONE || '1800112026',
        passwordHash,
        isVerified: true,
        phoneVerified: true,
        accountStatus: 'ACTIVE',
        role: 'ADMIN',
        createdAt: new Date().toISOString(),
      });
      console.log(`[SEED] Admin account seeded: ${adminEmail}`);
    } else {
      console.log(`[SEED] Admin account already exists: ${adminEmail}`);
    }
  } catch (error) {
    console.error('[SEED] Failed to seed admin:', error);
  }
}

async function startServer() {
  try {
    await connectDatabase();
    console.log('MongoDB connected');
    await seedAdmin();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed; server will not start:', error);
    process.exit(1);
  }
}

void startServer();
/*
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`====================================================`);
    console.log(`🚀 Blockchain Wallet Backend running on port ${PORT}`);
    console.log(`👉 API Health Check: http://localhost:${PORT}/health`);
    console.log(`🛡️ Security: Helmet HTTP Headers & Rate Limiting Active`);
    console.log(`====================================================`);
  });
}); */

export default app;
