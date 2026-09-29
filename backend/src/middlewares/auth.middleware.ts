import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { validateAdminSession } from '../services/admin-session.service';
import { UserModel } from '../models/user.model';
import { dbService } from '../services/db.service';

export const JWT_SECRET = process.env.JWT_SECRET || 'blockchain_wallet_secret_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    userId: string;
    email: string;
    role?: string;
    badgeNumber?: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required.' });
  }

  jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    if (decoded.tokenType === 'refresh') return res.status(401).json({ message: 'Access token required.' });
    if (decoded.role === 'ADMIN') {
      try {
        if (!decoded.sid || !await validateAdminSession(decoded.sid, decoded.id)) return res.status(401).json({ message: 'Admin session expired. Please sign in again.' });
      } catch { return res.status(503).json({ message: 'Session validation unavailable.' }); }
    }
    req.user = decoded;
    next();
  });
};

/**
 * SECTION 3 & 4: CORE PERMISSION MODEL - ROLE ENFORCEMENT
 * Enforces role-based endpoint access control
 */
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role || 'USER';

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `Permission Denied: Role '${userRole}' is not authorized to access this resource. Required: ${allowedRoles.join(', ')}.`,
      });
    }

    next();
  };
};

/**
 * SECTION 4: STRICT READ-ONLY ENFORCEMENT FOR POLICE ROLE
 * Blocks write/modification attempts by Police Officers with HTTP 403 Forbidden.
 */
export const enforceReadOnlyForPolice = (req: AuthRequest, res: Response, next: NextFunction) => {
  const userRole = req.user?.role || 'USER';

  if (userRole === 'POLICE_OFFICER' || userRole === 'POLICE') {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return res.status(403).json({
        message: 'Permission Denied: POLICE role is strictly READ-ONLY. Police officers cannot upload, delete, modify, or approve citizen documents.',
      });
    }
  }

  next();
};

/**
 * SECTION 116: REQUIRE ACTIVE ADMIN MIDDLEWARE
 * Verifies admin account status === 'ACTIVE'
 */
export const requireActiveAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userRole = req.user?.role;
  if (userRole !== 'ADMIN') {
    return next();
  }

  try {
    const adminEmail = req.user?.email || process.env.ADMIN_EMAIL || 'admin@vault.gov.in';
    let adminUser = await UserModel.findOne({ email: adminEmail.toLowerCase() }).lean();

    if (!adminUser) {
      const memUser = await dbService.getUserByEmail(adminEmail);
      if (memUser && memUser.role === 'ADMIN') {
        adminUser = memUser as any;
      }
    }

    if (adminUser && adminUser.accountStatus !== 'ACTIVE') {
      return res.status(403).json({
        message: 'Permission Denied: Only ACTIVE administrator accounts can perform admin operations.',
        accountStatus: adminUser.accountStatus,
      });
    }

    next();
  } catch (err) {
    next();
  }
};

/**
 * SECTION 116: VALIDATE REQUEST MIDDLEWARE
 */
export const validateRequest = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: 'Request body required.' });
    }
  }
  next();
};
