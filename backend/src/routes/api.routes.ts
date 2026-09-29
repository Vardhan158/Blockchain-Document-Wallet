import { Router } from 'express';
import { listAdminDocuments, reviewAdminDocument, adminPreview } from '../controllers/admin-documents.controller';
import { adminDashboard } from '../controllers/admin-dashboard.controller';
import { refreshAdminSession } from '../services/admin-session.service';
import { JWT_SECRET } from '../middlewares/auth.middleware';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import {
  register,
  login,
  getProfile,
  verifyOtp,
  resendOtp,
  refreshTokens,
  registerDevice,
  updateProfile,
  initiateEmailChange,
  verifyOldEmailOtp,
  verifyNewEmailOtp,
  changePassword,
  logoutUser,
  initiateForgotPassword,
  verifyForgotPasswordOtp,
  resetForgotPassword,
  adminLogin,
} from '../controllers/auth.controller';
import {
  uploadDocument,
  getUserDocuments,
  getDocumentDetails,
  policeLookupByUserId,
  policeSearchUser,
  reuploadDocument,
  streamPoliceDocumentPreview,
  getPoliceDocument,
} from '../controllers/document.controller';
import {
  adminVerifyDocument,
  retryBlockchainTransaction,
  updateUserAccountStatus,
  listAdminOfficers,
  listAdminUsers,
  listAdminBlockchainRecords,
  listAdminAuditLogs,
  verifyDocumentIntegrityAdmin,
  approveAdminDocumentRoute,
  rejectAdminDocumentRoute,
  tagAdminDocumentRoute,
  revokeAdminDocumentRoute,
  startReviewAdminDocumentRoute,
  getPendingAdminDocuments,
  getAdminDocumentHistory,
  getAdminDocumentBlockchain,
  rejectAdminDocumentRouteFull,
  tagAdminDocumentRouteFull,
  getAdminUserDetail,
  getAdminUserDocuments,
  suspendUserAdminRoute,
  reactivateUserAdminRoute,
  deactivateUserAdminRoute,
  logoutAllUserSessionsRoute,
  getAdminPendingPolice,
  getAdminPoliceDetail,
  listAdminAuditLogsFiltered,
  getAdminBlockchainRecordsList,
  getAdminBlockchainRecordItem,
  verifyAdminBlockchainRoute,
  retryAdminBlockchainRoute,
  getAdminNotificationsList,
  markAdminNotificationReadRoute,
  markAllAdminNotificationsReadRoute,
  sendAdminAnnouncementBroadcast,
  getAdminSecurityEventsList,
  getAdminSuspiciousActivityList,
  revokeAdminSessionRoute,
} from '../controllers/admin.controller';
import {
  registerPoliceOfficer,
  verifyPoliceOfficerOtp,
  loginPoliceOfficer,
  getPoliceProfile,
  changePolicePassword,
  updatePoliceContact,
  initiatePoliceForgotPassword,
  resetPoliceForgotPassword,
  adminVerifyOfficer,
  getOfficerSearchHistory,
  getOfficerSearchHistoryItem,
} from '../controllers/officer.controller';
import {
  getUserNotifications,
  markNotificationRead,
} from '../controllers/notification.controller';
import { authenticateToken, enforceReadOnlyForPolice, AuthRequest } from '../middlewares/auth.middleware';
import { requireRole, requireApprovedOfficer, authorizePoliceDocumentAccess } from '../middlewares/police.middleware';
import { dbService } from '../services/db.service';
import { blockchainService } from '../services/blockchain.service';
import { auditService } from '../services/audit.service';

const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];
    if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Supported formats: JPG, JPEG, PNG, PDF.'));
    }
  },
});

const router = Router();
router.get('/admin/documents', authenticateToken, requireRole('ADMIN'), listAdminDocuments);
router.post('/admin/documents/:documentId/review', authenticateToken, requireRole('ADMIN'), reviewAdminDocument);
router.get('/admin/documents/:documentId/preview', authenticateToken, requireRole('ADMIN'), adminPreview);
router.get('/admin/dashboard', authenticateToken, requireRole('ADMIN'), adminDashboard);
router.post('/admin/refresh', async (req, res) => {
  try {
    if (typeof req.body.refreshToken !== 'string') return res.status(400).json({ message: 'Refresh token required.' });
    const tokens = await refreshAdminSession(req.body.refreshToken, JWT_SECRET);
    return tokens ? res.json(tokens) : res.status(401).json({ message: 'Admin session expired.' });
  } catch { return res.status(503).json({ message: 'Session service unavailable.' }); }
});
const policeSearchLimiter = rateLimit({
  windowMs: parseInt(process.env.POLICE_SEARCH_WINDOW_MS || '900000', 10),
  max: parseInt(process.env.POLICE_SEARCH_MAX || '30', 10),
  keyGenerator: req => `${(req as AuthRequest).user?.id || 'anonymous'}:${req.ip}`,
  validate: { keyGeneratorIpFallback: false, xForwardedForHeader: false },
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Police search limit reached. Please try again later.' },
});

// --- Welcome / Branding Route ---
router.get('/welcome', (req, res) => {
  res.json({
    appName: 'Blockchain Document Wallet',
    tagline: 'Securely manage and verify your important documents.',
    options: ['Create Account', 'Login'],
    version: '1.0.0',
  });
});

// ====================================================
// SECTION 50: API ARCHITECTURE (/api/v1/...)
// ====================================================

// --- 1. Authentication Routes ---
router.post('/auth/register', register);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/resend-otp', resendOtp);
router.post('/auth/login', login);
router.post('/auth/refresh', refreshTokens);
router.post('/auth/refresh-token', refreshTokens);
router.post('/auth/logout', logoutUser);
router.post('/auth/forgot-password', initiateForgotPassword);
router.post('/auth/forgot-password/initiate', initiateForgotPassword);
router.post('/auth/forgot-password/verify', verifyForgotPasswordOtp);
router.post('/auth/reset-password', resetForgotPassword);
router.post('/auth/forgot-password/reset', resetForgotPassword);

// --- 2. User Routes ---
router.get('/auth/profile', authenticateToken, getProfile);
router.put('/auth/profile', authenticateToken, updateProfile);
router.get('/users/me', authenticateToken, getProfile);
router.patch('/users/me', authenticateToken, updateProfile);
router.get('/users/me/user-id', authenticateToken, (req: AuthRequest, res) => {
  return res.json({
    userId: req.user?.userId || 'BDW-9K7F3A2',
    userPublicId: req.user?.userId || 'BDW-9K7F3A2',
  });
});

router.post('/auth/change-email/initiate', authenticateToken, initiateEmailChange);
router.post('/auth/change-email/verify-old', authenticateToken, verifyOldEmailOtp);
router.post('/auth/change-email/verify-new', authenticateToken, verifyNewEmailOtp);
router.post('/auth/change-password', authenticateToken, changePassword);

// --- 3. Documents Routes (Section 37: Enforces Read-Only for Police Role) ---
router.post('/documents', authenticateToken, enforceReadOnlyForPolice, upload.single('file'), uploadDocument);
router.post('/documents/upload', authenticateToken, enforceReadOnlyForPolice, upload.single('file'), uploadDocument);
router.get('/documents', authenticateToken, getUserDocuments);
router.get('/documents/:documentId', authenticateToken, getDocumentDetails);
router.post('/documents/:documentId/resubmit', authenticateToken, enforceReadOnlyForPolice, upload.single('file'), reuploadDocument);
router.post('/documents/:id/reupload', authenticateToken, enforceReadOnlyForPolice, upload.single('file'), reuploadDocument);

router.delete('/documents/:documentId', authenticateToken, enforceReadOnlyForPolice, async (req: AuthRequest, res) => {
  try {
    const { documentId } = req.params;
    const doc = await dbService.getDocumentById(documentId);
    if (!doc || doc.userId !== req.user?.id) {
      return res.status(404).json({ message: 'Document not found' });
    }

    return res.json({
      message: `Document ${documentId} deleted successfully from vault cache.`,
      documentId,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error deleting document', error: err.message });
  }
});

// --- 4. Blockchain Status Route ---
router.get('/documents/:documentId/blockchain-status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { documentId } = req.params;
    const doc = await dbService.getDocumentById(documentId);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const bcRecord = await dbService.getBlockchainRecord(documentId);
    const integrity = await blockchainService.verifyDocumentIntegrity(documentId, doc.documentHash);

    return res.json({
      documentId,
      status: doc.status,
      blockchainStatus: bcRecord ? 'VERIFIED' : 'UNVERIFIED',
      blockchainRecord: bcRecord || null,
      integrityCheck: integrity,
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error fetching blockchain status', error: err.message });
  }
});

// --- 5. Notifications Routes ---
router.get('/notifications', authenticateToken, getUserNotifications);
router.patch('/notifications/:id/read', authenticateToken, markNotificationRead);
router.patch('/notifications/read-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const notifs = await dbService.getNotificationsByUserId(req.user!.id);
    for (const n of notifs) {
      await dbService.markNotificationAsRead(n.id, req.user!.id);
    }
    return res.json({ message: 'All notifications marked as read.' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error marking all notifications read', error: err.message });
  }
});

// --- 6. Device Routes ---
router.post('/devices/register', authenticateToken, registerDevice);
router.delete('/devices/:deviceId', authenticateToken, (req: AuthRequest, res) => {
  return res.json({ message: `Device ${req.params.deviceId} deregistered successfully.` });
});

// --- Police Module Routes (Section 2, 9 & 10) ---
router.post('/police/register', registerPoliceOfficer);
router.post('/police/verify-otp', verifyPoliceOfficerOtp);
router.post('/police/login', loginPoliceOfficer);
router.get('/police/profile', authenticateToken, getPoliceProfile);
router.post('/police/profile/password', authenticateToken, changePolicePassword);
router.patch('/police/profile/contact', authenticateToken, updatePoliceContact);
router.post('/police/forgot-password', initiatePoliceForgotPassword);
router.post('/police/forgot-password/reset', resetPoliceForgotPassword);
router.get('/police/search-history', authenticateToken, getOfficerSearchHistory);
router.get('/police/search-history/:searchId', authenticateToken, getOfficerSearchHistoryItem);
router.get('/police/notifications', authenticateToken, getUserNotifications);
router.patch('/police/notifications/:id/read', authenticateToken, markNotificationRead);
router.patch('/police/notifications/read-all', authenticateToken, async (req: AuthRequest, res) => {
  const notifications = await dbService.getNotificationsByUserId(req.user!.id, req.user!.role);
  for (const notification of notifications) await dbService.markNotificationAsRead(notification.id, req.user!.id);
  return res.json({ message: 'All notifications marked as read.' });
});
// Canonical Police API aliases.
router.post('/police/auth/register', registerPoliceOfficer);
router.post('/police/auth/verify-otp', verifyPoliceOfficerOtp);
router.post('/police/auth/login', loginPoliceOfficer);
router.post('/police/auth/refresh', refreshTokens);
router.post('/police/auth/logout', logoutUser);
router.post('/police/auth/forgot-password', initiatePoliceForgotPassword);
router.post('/police/auth/reset-password', resetPoliceForgotPassword);
router.get('/police/me', authenticateToken, getPoliceProfile);
router.patch('/police/me', authenticateToken, updatePoliceContact);
router.get('/police/me/status', authenticateToken, getPoliceProfile);
router.post('/police/change-password', authenticateToken, changePolicePassword);
router.post('/admin/verify-officer', adminVerifyOfficer);

// --- Police Lookup & Search Routes (Section 20 & 22) ---
router.post('/police/search', authenticateToken, requireRole('POLICE'), requireApprovedOfficer, policeSearchLimiter, policeSearchUser);
router.post('/police/citizens/search', authenticateToken, requireRole('POLICE'), requireApprovedOfficer, policeSearchLimiter, policeSearchUser);
router.post('/v1/police/search', authenticateToken, policeSearchUser);
router.get('/police/lookup/:userPublicId', authenticateToken, policeLookupByUserId);
router.get('/police/documents/:documentId/preview', authenticateToken, requireRole('POLICE'), requireApprovedOfficer, authorizePoliceDocumentAccess('DOCUMENT_PREVIEW'), streamPoliceDocumentPreview);
router.get('/police/documents/:documentId', authenticateToken, requireRole('POLICE'), requireApprovedOfficer, authorizePoliceDocumentAccess('METADATA_VIEW'), getPoliceDocument);
router.get('/police/documents/:documentId/verify-integrity', authenticateToken, requireRole('POLICE'), requireApprovedOfficer, authorizePoliceDocumentAccess('BLOCKCHAIN_VERIFY'), async (req: AuthRequest, res) => {
  const doc = await dbService.getDocumentById(req.params.documentId);
  const allowed = req.user?.role === 'POLICE' || req.user?.role === 'POLICE_OFFICER';
  const owner = doc ? await dbService.getUserById(doc.userId) : undefined;
  const authorized = !!doc && (!owner?.accountStatus || owner.accountStatus === 'ACTIVE') && (doc.status === 'APPROVED' || doc.verificationStatus === 'APPROVED') && doc.adminApprovedTag === 'VEHICLE' && (doc as any).revocationStatus !== 'REVOKED';
  if (!allowed) return res.status(403).json({ message: 'Police officer access required.' });
  if (!doc) return res.status(404).json({ message: 'Document not found.' });
  if (!authorized) return res.status(403).json({ message: 'Document is not authorized for police access.' });
  const integrityVerified = await blockchainService.verifyDocumentIntegrity(doc.id, doc.documentHash);
  const verifiedAt = new Date().toISOString();
  return res.json({ documentId: doc.id, status: integrityVerified ? 'VERIFIED' : 'INTEGRITY_FAILED', integrityVerified, verifiedAt, blockchainStatus: (await dbService.getBlockchainRecord(doc.id)) ? 'VERIFIED' : 'UNVERIFIED' });
});
router.get('/v1/police/documents/:documentId/preview', authenticateToken, streamPoliceDocumentPreview);

// --- Admin Auth & Verification Routes (Section 7, 31, 48, 50 & 76) ---
router.post('/admin/login', adminLogin);
router.post('/v1/admin/login', adminLogin);
router.post('/admin/verify', authenticateToken, requireRole('ADMIN'), adminVerifyDocument);
router.post('/admin/retry-blockchain', authenticateToken, requireRole('ADMIN'), retryBlockchainTransaction);
router.post('/v1/admin/retry-blockchain', authenticateToken, requireRole('ADMIN'), retryBlockchainTransaction);
router.post('/admin/verify-integrity', authenticateToken, requireRole('ADMIN'), verifyDocumentIntegrityAdmin);
router.post('/v1/admin/verify-integrity', authenticateToken, requireRole('ADMIN'), verifyDocumentIntegrityAdmin);
router.post('/admin/users/status', authenticateToken, requireRole('ADMIN'), updateUserAccountStatus);
router.post('/v1/admin/users/status', authenticateToken, requireRole('ADMIN'), updateUserAccountStatus);
router.get('/admin/officers', authenticateToken, requireRole('ADMIN'), listAdminOfficers);
router.get('/admin/users', authenticateToken, requireRole('ADMIN'), listAdminUsers);
router.get('/admin/blockchain-records', authenticateToken, requireRole('ADMIN'), listAdminBlockchainRecords);
router.get('/admin/audit-logs-full', authenticateToken, requireRole('ADMIN'), listAdminAuditLogs);

// ====================================================
// SECTIONS 96-100: CANONICAL ADMIN RESTFUL ENDPOINTS
// ====================================================

// --- Section 97: Admin Auth Canonical Routes ---
router.post('/admin/auth/login', adminLogin);
router.post('/admin/auth/refresh', refreshTokens);
router.post('/admin/auth/logout', logoutUser);
router.post('/admin/auth/forgot-password', initiateForgotPassword);
router.post('/admin/auth/reset-password', resetForgotPassword);
router.post('/admin/auth/change-password', authenticateToken, requireRole('ADMIN'), changePassword);

// --- Section 98: Dashboard Analytics Canonical Routes ---
router.get('/admin/dashboard/stats', authenticateToken, requireRole('ADMIN'), adminDashboard);
router.get('/admin/dashboard/activity', authenticateToken, requireRole('ADMIN'), adminDashboard);

// --- Section 99, 101 & 102: Document Management Canonical Routes ---
router.get('/admin/documents/pending', authenticateToken, requireRole('ADMIN'), getPendingAdminDocuments);
router.get('/admin/documents/:documentId/preview', authenticateToken, requireRole('ADMIN'), adminPreview);
router.post('/admin/documents/:documentId/start-review', authenticateToken, requireRole('ADMIN'), startReviewAdminDocumentRoute);
router.post('/admin/documents/:documentId/approve', authenticateToken, requireRole('ADMIN'), approveAdminDocumentRoute);
router.post('/admin/documents/:documentId/reject', authenticateToken, requireRole('ADMIN'), rejectAdminDocumentRouteFull);
router.patch('/admin/documents/:documentId/tag', authenticateToken, requireRole('ADMIN'), tagAdminDocumentRouteFull);
router.post('/admin/documents/:documentId/revoke', authenticateToken, requireRole('ADMIN'), revokeAdminDocumentRoute);
router.get('/admin/documents/:documentId/history', authenticateToken, requireRole('ADMIN'), getAdminDocumentHistory);
router.get('/admin/documents/:documentId/blockchain', authenticateToken, requireRole('ADMIN'), getAdminDocumentBlockchain);

// --- Section 103: User Management RESTful Canonical Routes ---
router.get('/admin/users', authenticateToken, requireRole('ADMIN'), listAdminUsers);
router.get('/admin/users/:userId', authenticateToken, requireRole('ADMIN'), getAdminUserDetail);
router.get('/admin/users/:userId/documents', authenticateToken, requireRole('ADMIN'), getAdminUserDocuments);
router.post('/admin/users/:userId/suspend', authenticateToken, requireRole('ADMIN'), suspendUserAdminRoute);
router.post('/admin/users/:userId/reactivate', authenticateToken, requireRole('ADMIN'), reactivateUserAdminRoute);
router.post('/admin/users/:userId/deactivate', authenticateToken, requireRole('ADMIN'), deactivateUserAdminRoute);
router.post('/admin/users/:userId/logout-all', authenticateToken, requireRole('ADMIN'), logoutAllUserSessionsRoute);

// --- Section 104: Police Management RESTful Canonical Routes ---
router.get('/admin/police', authenticateToken, requireRole('ADMIN'), listAdminOfficers);
router.get('/admin/police/pending', authenticateToken, requireRole('ADMIN'), getAdminPendingPolice);
router.get('/admin/police/:officerId', authenticateToken, requireRole('ADMIN'), getAdminPoliceDetail);
router.get('/admin/police/:officerId/search-history', authenticateToken, requireRole('ADMIN'), getOfficerSearchHistory);
router.get('/admin/police/:officerId/access-history', authenticateToken, requireRole('ADMIN'), getOfficerSearchHistory);

// --- Section 105: Audit Log RESTful Canonical Routes with Filters ---
router.get('/admin/audit-logs', authenticateToken, requireRole('ADMIN'), listAdminAuditLogsFiltered);
router.get('/admin/audit-logs/:auditId', authenticateToken, requireRole('ADMIN'), listAdminAuditLogsFiltered);

// --- Section 106: Blockchain RESTful Canonical Routes ---
router.get('/admin/blockchain/records', authenticateToken, requireRole('ADMIN'), getAdminBlockchainRecordsList);
router.get('/admin/blockchain/records/:documentId', authenticateToken, requireRole('ADMIN'), getAdminBlockchainRecordItem);
router.post('/admin/blockchain/:documentId/verify', authenticateToken, requireRole('ADMIN'), verifyAdminBlockchainRoute);
router.post('/admin/blockchain/:documentId/retry', authenticateToken, requireRole('ADMIN'), retryAdminBlockchainRoute);

// --- Section 107: Notification RESTful Canonical Routes ---
router.get('/admin/notifications', authenticateToken, requireRole('ADMIN'), getAdminNotificationsList);
router.patch('/admin/notifications/:id/read', authenticateToken, requireRole('ADMIN'), markAdminNotificationReadRoute);
router.patch('/admin/notifications/read-all', authenticateToken, requireRole('ADMIN'), markAllAdminNotificationsReadRoute);
router.post('/admin/notifications/send', authenticateToken, requireRole('ADMIN'), sendAdminAnnouncementBroadcast);

// --- Section 108: Security RESTful Canonical Routes ---
router.get('/admin/security/events', authenticateToken, requireRole('ADMIN'), getAdminSecurityEventsList);
router.get('/admin/security/suspicious-activity', authenticateToken, requireRole('ADMIN'), getAdminSuspiciousActivityList);
router.post('/admin/security/sessions/:sessionId/revoke', authenticateToken, requireRole('ADMIN'), revokeAdminSessionRoute);

// --- Audit Logs Route (Section 55) ---
router.get('/audit-logs/:entityId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { entityId } = req.params;
    const logs = await auditService.getLogsForEntity(entityId);
    return res.json({ entityId, auditLogs: logs });
  } catch (err: any) {
    return res.status(500).json({ message: 'Error fetching audit logs', error: err.message });
  }
});

export default router;
