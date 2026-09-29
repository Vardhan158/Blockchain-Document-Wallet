import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { DocumentModel } from '../models/document.model';
import { PoliceOfficerModel } from '../models/officer.model';
import { BlockchainRecordModel } from '../models/blockchain.model';
import { AuditLogModel } from '../models/audit.model';
import { NotificationModel } from '../models/notification.model';

/**
 * SECTIONS 127 & 128: ACTIONABLE DASHBOARD METRICS & ANALYTICS
 * Top Priorities: Pending Documents, Pending Police Approvals, Blockchain Failures, Security Alerts
 */
export async function adminDashboard(_req: Request, res: Response) {
  try {
    const since = new Date();
    since.setUTCHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalPoliceOfficers,
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments,
      documentsApprovedToday,
      documentsRejectedToday,
      pendingPoliceAccounts,
      approvedPoliceAccounts,
      todaysPoliceSearches,
      blockchainTransactions,
      blockchainFailures,
      securityAlerts,
    ] = await Promise.all([
      UserModel.countDocuments({ role: { $nin: ['ADMIN', 'POLICE', 'POLICE_OFFICER'] } }),
      PoliceOfficerModel.countDocuments({}),
      DocumentModel.countDocuments({ status: { $in: ['PENDING', 'UNDER_REVIEW'] } }),
      DocumentModel.countDocuments({ status: 'APPROVED' }),
      DocumentModel.countDocuments({ status: 'REJECTED' }),
      DocumentModel.countDocuments({ status: 'APPROVED', updatedAt: { $gte: since.toISOString() } }),
      DocumentModel.countDocuments({ status: 'REJECTED', updatedAt: { $gte: since.toISOString() } }),
      PoliceOfficerModel.countDocuments({ status: 'PENDING_APPROVAL' }),
      PoliceOfficerModel.countDocuments({ status: 'APPROVED' }),
      AuditLogModel.countDocuments({ action: 'USER_LOOKUP', createdAt: { $gte: since.toISOString() } }),
      BlockchainRecordModel.countDocuments({}),
      DocumentModel.countDocuments({ blockchainStatus: 'BLOCKCHAIN_PENDING' }),
      NotificationModel.countDocuments({ type: 'SECURITY_ALERT', read: false }),
    ]);

    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      totalUsers,
      totalPoliceOfficers,
      pendingDocuments,
      approvedDocuments,
      rejectedDocuments,
      documentsApprovedToday,
      documentsRejectedToday,
      pendingPoliceAccounts,
      approvedPoliceAccounts,
      todaysPoliceSearches,
      blockchainTransactions,
      blockchainFailures,
      securityAlerts,
      dayTimezone: 'UTC',
    });
  } catch {
    return res.status(503).json({ message: 'Dashboard data is temporarily unavailable.' });
  }
}
