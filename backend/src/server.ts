import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.routes';
import { connectDatabase } from './config/database';

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

// Start HTTP server before connecting to MongoDB so health checks remain available.
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

connectDatabase().then(() => {
  console.log('MongoDB connected');
}).catch((error) => {
  console.error('MongoDB connection failed:', error);
});
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
