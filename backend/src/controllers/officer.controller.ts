import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PoliceOfficerModel } from '../models/officer.model';
import { emailService } from '../services/email.service';
import { auditService } from '../services/audit.service';
import { JWT_SECRET, AuthRequest } from '../middlewares/auth.middleware';
import { PoliceOfficer, PoliceAccountStatus } from '../types';
import { dbService } from '../services/db.service';

let inMemoryOfficers: Map<string, PoliceOfficer> = new Map();

function generate4DigitOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Section 9 & 10: Police Officer Self-Registration (Model A)
 * Complete Flow: Open App -> Register -> Enter Info -> Verify Email/Mobile -> Status = PENDING_APPROVAL -> Admin Review
 */
export const registerPoliceOfficer = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      employeeId,
      badgeNumber,
      rankDesignation,
      policeStation,
      district,
      state,
      phone,
      email,
      password,
      department,
      stationCode,
      serviceNumber,
    } = req.body;

    const policeId = (employeeId || badgeNumber || '').trim().toUpperCase();

    if (!fullName || !policeId || !rankDesignation || !policeStation || !district || !state || !phone || !email || !password) {
      return res.status(400).json({
        message: 'Full Name, Employee ID/Badge Number, Rank/Designation, Police Station, District, State, Mobile, Email, and Password are required.',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = await PoliceOfficerModel.findOne({ email: trimmedEmail }).lean();
    if (existing) {
      return res.status(400).json({
        message: 'An officer account with this official email address already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = `officer_${Date.now()}`;
    const officerId = `POL-${state.trim().slice(0, 2).toUpperCase()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
    const createdAt = new Date().toISOString();
    const otp = generate4DigitOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const newOfficer: PoliceOfficer = {
      id,
      officerId,
      employeeId: policeId,
      badgeNumber: policeId,
      fullName: fullName.trim(),
      rankDesignation: rankDesignation.trim(),
      policeStation: policeStation.trim(),
      district: district.trim(),
      state: state.trim(),
      phone: phone.trim(),
      email: trimmedEmail,
      department: department ? department.trim() : 'Traffic Enforcement Unit',
      stationCode: stationCode ? stationCode.trim() : '',
      serviceNumber: serviceNumber ? serviceNumber.trim() : '',
      passwordHash,
      isApproved: false,
      status: 'PENDING_APPROVAL', // Section 9 Initial Status
      otp,
      otpExpiresAt,
      createdAt,
    };

    try {
      await PoliceOfficerModel.create(newOfficer);
    } catch (dbErr) {
      console.warn('Saving officer to in-memory fallback:', dbErr);
    }
    inMemoryOfficers.set(id, newOfficer);

    // Section 10: Dispatch 4-digit OTP email to official email address
    const emailResult = await emailService.sendOtpEmail(newOfficer.email, otp);

    // Section 55 Audit Log
    await auditService.logEvent(
      id,
      'POLICE_OFFICER',
      'POLICE_OFFICER_REGISTER',
      'POLICE_OFFICER',
      id,
      { employeeId: policeId, email: trimmedEmail, district, state, status: 'PENDING_APPROVAL' }
    );

    return res.status(201).json({
      message: 'Officer registration submitted! A 4-digit verification OTP has been sent to your official email.',
      requiresVerification: true,
      email: newOfficer.email,
      otpDemo: otp,
      status: 'PENDING_APPROVAL',
      emailSent: emailResult.sent,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error registering police officer account', error: error.message });
  }
};

/**
 * Section 10: Verify Official Email OTP
 */
export const verifyPoliceOfficerOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Official email address and 4-digit OTP are required.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    let officer = await PoliceOfficerModel.findOne({ email: trimmedEmail });

    if (!officer) {
      const mem = Array.from(inMemoryOfficers.values()).find(o => o.email.toLowerCase() === trimmedEmail);
      if (mem) officer = mem as any;
    }

    if (!officer) {
      return res.status(404).json({ message: 'Officer account not found.' });
    }

    if (officer.otp !== otp.toString().trim()) {
      return res.status(400).json({ message: 'Invalid OTP code sent to official email.' });
    }

    officer.otp = undefined;
    officer.otpExpiresAt = undefined;
    if (officer.save) await officer.save();

    return res.json({
      message: 'Official email verified successfully! Your account registration is now in PENDING_APPROVAL status awaiting administrator review.',
      status: officer.status || 'PENDING_APPROVAL',
      email: officer.email,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error verifying officer OTP', error: error.message });
  }
};

/**
 * Section 15 & 16: Police Officer Login & Restrictions
 * Accepts: Officer ID / Badge Number, Official Email, or Mobile Number.
 * Enforces strict Section 16 status restrictions.
 */
export const loginPoliceOfficer = async (req: Request, res: Response) => {
  try {
    const { officerIdentifier, email, phone, password } = req.body;
    const identifier = (officerIdentifier || email || phone || '').toString().trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Officer ID / Email / Mobile Number and password are required.' });
    }

    // Lookup officer by Email, Employee ID/Badge Number, or Phone
    let officer: PoliceOfficer | null = (await PoliceOfficerModel.findOne({
      $or: [
        { email: identifier },
        { employeeId: identifier.toUpperCase() },
        { badgeNumber: identifier.toUpperCase() },
        { phone: identifier },
      ],
    }).lean()) as any;

    if (!officer) {
      const allMems = Array.from(inMemoryOfficers.values());
      officer =
        allMems.find(
          o =>
            o.email.toLowerCase() === identifier ||
            o.employeeId?.toLowerCase() === identifier ||
            o.badgeNumber?.toLowerCase() === identifier ||
            o.phone === identifier
        ) || null;
    }

    if (!officer) {
      return res.status(401).json({ message: 'Invalid official credentials.' });
    }

    const isMatch = await bcrypt.compare(password, officer.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid official credentials.' });
    }

    // SECTION 16: STRICT LOGIN RESTRICTIONS
    const accountStatus: PoliceAccountStatus = officer.status || (officer.isApproved ? 'APPROVED' : 'PENDING_APPROVAL');

    if (accountStatus === 'PENDING_APPROVAL') {
      return res.status(403).json({
        message: 'Your account is currently awaiting administrator approval.',
        status: 'PENDING_APPROVAL',
      });
    }

    if (accountStatus === 'REJECTED') {
      return res.status(403).json({
        message: 'Your registration has not been approved.',
        status: 'REJECTED',
      });
    }

    if (accountStatus === 'SUSPENDED') {
      return res.status(403).json({
        message: 'Your government account has been suspended. Contact the administrator.',
        status: 'SUSPENDED',
      });
    }

    if (accountStatus === 'DEACTIVATED') {
      return res.status(403).json({
        message: 'Your government account has been deactivated.',
        status: 'DEACTIVATED',
      });
    }

    if (accountStatus !== 'APPROVED') {
      return res.status(403).json({
        message: 'Your account is not approved to perform citizen document verifications.',
        status: accountStatus,
      });
    }

    const accessToken = jwt.sign(
      {
        id: officer.id,
        userId: officer.employeeId || officer.badgeNumber,
        email: officer.email,
        role: 'POLICE_OFFICER',
        badgeNumber: officer.employeeId || officer.badgeNumber,
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    // Section 55 Audit Log
    await auditService.logEvent(
      officer.id,
      'POLICE_OFFICER',
      'POLICE_OFFICER_LOGIN',
      'POLICE_OFFICER',
      officer.id,
      { badgeNumber: officer.employeeId || officer.badgeNumber, status: 'APPROVED' }
    );
    const refreshToken = jwt.sign({ id: officer.id, email: officer.email, role: 'POLICE_OFFICER', tokenType: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
    await dbService.createNotification({
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: officer.id,
      title: 'New Device Login',
      message: 'Your police account was used to sign in on a new device.',
      type: 'NEW_DEVICE_LOGIN',
      read: false,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      message: 'Officer login successful.',
      accessToken,
      refreshToken,
      token: accessToken,
      officer: {
        id: officer.id,
        badgeNumber: officer.employeeId || officer.badgeNumber,
        fullName: officer.fullName,
        email: officer.email,
        department: officer.department,
        status: 'APPROVED',
        isApproved: true,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error logging in officer', error: error.message });
  }
};

export const getPoliceProfile = async (req: AuthRequest, res: Response) => {
  const user = req.user;
  if (!user || !['POLICE', 'POLICE_OFFICER'].includes(user.role || '')) return res.status(403).json({ message: 'Police access required.' });
  const officer = await PoliceOfficerModel.findOne({ $or: [{ id: user.id }, { email: user.email }] }).lean();
  if (!officer) return res.status(404).json({ message: 'Officer profile not found.' });
  const { passwordHash, otp, otpExpiresAt, ...safeOfficer } = officer as any;
  return res.json({ officer: safeOfficer });
};

export const changePolicePassword = async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const officer = await PoliceOfficerModel.findOne({ id: req.user?.id });
  if (!officer) return res.status(404).json({ message: 'Officer profile not found.' });
  if (!currentPassword || !newPassword || newPassword !== confirmPassword) return res.status(400).json({ message: 'Current password, new password, and matching confirmation are required.' });
  if (!(await bcrypt.compare(currentPassword, officer.passwordHash))) return res.status(401).json({ message: 'Current password is incorrect.' });
  if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) return res.status(400).json({ message: 'Password must be 8+ characters with upper, lower, number, and special character.' });
  officer.passwordHash = await bcrypt.hash(newPassword, 10);
  await officer.save();
  return res.json({ message: 'Password changed successfully. Please sign in again.' , invalidateRefreshTokens: true });
};

export const updatePoliceContact = async (req: AuthRequest, res: Response) => {
  const { phone, email, otp } = req.body;
  const officer = await PoliceOfficerModel.findOne({ id: req.user?.id });
  if (!officer) return res.status(404).json({ message: 'Officer profile not found.' });
  if (!otp || officer.otp !== otp || !officer.otpExpiresAt || new Date(officer.otpExpiresAt).getTime() < Date.now()) return res.status(400).json({ message: 'Valid verification OTP is required.' });
  if (phone) officer.phone = phone.trim();
  if (email) officer.email = email.trim().toLowerCase();
  officer.otp = ''; officer.otpExpiresAt = '';
  await officer.save();
  return res.json({ message: 'Verified contact details updated.', officer: { phone: officer.phone, email: officer.email } });
};

export const initiatePoliceForgotPassword = async (req: Request, res: Response) => {
  const input = (req.body.emailOrPhone || '').toString().trim().toLowerCase();
  const officer = await PoliceOfficerModel.findOne({ $or: [{ email: input }, { phone: input }] });
  if (!officer) return res.status(404).json({ message: 'No officer account found for that official email or mobile.' });
  officer.otp = generate4DigitOtp(); officer.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); await officer.save();
  const emailResult = await emailService.sendOtpEmail(officer.email, officer.otp);
  return res.json({ message: 'Reset OTP sent to the official contact.', email: officer.email, otpDemo: officer.otp, emailSent: emailResult.sent });
};

export const resetPoliceForgotPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword, confirmPassword } = req.body;
  const officer = await PoliceOfficerModel.findOne({ email: (email || '').toLowerCase() });
  if (!officer || officer.otp !== otp || !officer.otpExpiresAt || new Date(officer.otpExpiresAt).getTime() < Date.now()) return res.status(400).json({ message: 'Invalid or expired OTP.' });
  if (!newPassword || newPassword !== confirmPassword) return res.status(400).json({ message: 'New password and matching confirmation are required.' });
  officer.passwordHash = await bcrypt.hash(newPassword, 10); officer.otp = ''; officer.otpExpiresAt = ''; await officer.save();
  return res.json({ message: 'Password reset successfully. Please sign in again.', invalidateRefreshTokens: true });
};

/**
 * SECTIONS 56, 57, 58, 59 & 60: Admin Administrator Review of Police Officer Account
 * Choices: APPROVE | REJECT | SUSPEND | DEACTIVATE
 */
export const adminVerifyOfficer = async (req: Request, res: Response) => {
  try {
    const { officerId, status, isApproved, rejectionReason } = req.body;

    if (!officerId) {
      return res.status(400).json({ message: 'officerId is required.' });
    }

    let targetStatus: PoliceAccountStatus = 'APPROVED';
    if (status) {
      targetStatus = status as PoliceAccountStatus;
    } else if (isApproved === false) {
      targetStatus = 'REJECTED';
    } else {
      targetStatus = 'APPROVED';
    }

    const now = new Date().toISOString();
    const adminId = (req as AuthRequest).user?.id || 'ADMIN-001';

    let officer = await PoliceOfficerModel.findOne({ id: officerId });
    if (!officer) {
      const memOfficer = inMemoryOfficers.get(officerId);
      if (memOfficer) {
        officer = memOfficer as any;
      }
    }

    if (!officer) {
      return res.status(404).json({ message: 'Police officer account not found.' });
    }

    officer.status = targetStatus;
    officer.isApproved = targetStatus === 'APPROVED';

    let notifTitle = '';
    let notifMessage = '';

    if (targetStatus === 'APPROVED') {
      // SECTION 56 & 57: POLICE APPROVAL BACKEND FLOW & NOTIFICATION
      (officer as any).approvedBy = adminId;
      (officer as any).approvedAt = now;

      notifTitle = 'Account Approved';
      notifMessage = 'Your government officer account has been approved. You can now sign in and verify permitted citizen documents.';

      await auditService.logEvent(adminId, 'ADMIN', 'ADMIN_APPROVE_OFFICER', 'POLICE_OFFICER', officer.id, {
        approvedBy: adminId,
        approvedAt: now,
        badgeNumber: officer.badgeNumber || officer.employeeId,
      });
    } else if (targetStatus === 'REJECTED') {
      // SECTION 58 & 59: POLICE REJECTION BACKEND FLOW & NOTIFICATION
      const reasonText = rejectionReason || 'Unable to verify employee ID';
      (officer as any).rejectionReason = reasonText;
      (officer as any).rejectedBy = adminId;
      (officer as any).rejectedAt = now;

      notifTitle = 'Registration Rejected';
      notifMessage = `Your government officer registration request was rejected by an administrator. Reason: ${reasonText}`;

      await auditService.logEvent(adminId, 'ADMIN', 'ADMIN_REJECT_OFFICER', 'POLICE_OFFICER', officer.id, {
        rejectedBy: adminId,
        rejectedAt: now,
        reason: reasonText,
      });
    } else if (targetStatus === 'SUSPENDED') {
      // SECTION 60 & 61: POLICE SUSPENSION FLOW & IMMEDIATE SESSION REVOCATION
      const reasonText = rejectionReason || 'Security investigation';
      (officer as any).suspensionReason = reasonText;
      (officer as any).suspendedBy = adminId;
      (officer as any).suspendedAt = now;

      notifTitle = 'Account Suspended';
      notifMessage = `Your government officer account has been suspended by an administrator. Reason: ${reasonText}`;

      await auditService.logEvent(adminId, 'ADMIN', 'ADMIN_SUSPEND_OFFICER', 'POLICE_OFFICER', officer.id, {
        suspendedBy: adminId,
        suspendedAt: now,
        reason: reasonText,
      });
    } else if (targetStatus === 'DEACTIVATED') {
      // SECTION 63: POLICE DEACTIVATION
      (officer as any).deactivatedBy = adminId;
      (officer as any).deactivatedAt = now;

      notifTitle = 'Account Deactivated';
      notifMessage = 'Your government officer account has been deactivated.';

      await auditService.logEvent(adminId, 'ADMIN', 'ADMIN_DEACTIVATE_OFFICER', 'POLICE_OFFICER', officer.id, {
        deactivatedBy: adminId,
        deactivatedAt: now,
      });
    }

    if (officer.save) await officer.save();

    // Create in-app notification for officer
    if (notifTitle) {
      const notifType = targetStatus === 'APPROVED' ? 'ACCOUNT_APPROVED' : targetStatus === 'REJECTED' ? 'ACCOUNT_REJECTED' : targetStatus === 'SUSPENDED' ? 'ACCOUNT_SUSPENDED' : 'SYSTEM_MAINTENANCE';
      await dbService.createNotification({
        id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        userId: officer.id,
        title: notifTitle,
        message: notifMessage,
        type: notifType as any,
        read: false,
        createdAt: now,
      });
    }

    // SECTION 57 & 59: Dispatch email to officer's official email address
    if (officer.email && notifTitle) {
      await emailService.sendOtpEmail(officer.email, `INFO: ${notifTitle}`).catch(() => {});
    }

    return res.json({
      message: `Police officer account status updated to ${targetStatus} successfully.`,
      officerId: officer.id,
      status: targetStatus,
      isApproved: targetStatus === 'APPROVED',
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error verifying officer account', error: error.message });
  }
};

/**
 * Section 2: Officer Search Audit History
 */
export const getOfficerSearchHistory = async (req: AuthRequest, res: Response) => {
  try {
    const officerId = req.user?.id || 'POLICE_OFFICER';
    const logs = await auditService.getLogsByActor(officerId);

    return res.json({
      officerId,
      history: logs.map(l => ({ searchId: l.id, createdAt: l.createdAt, result: l.metadata?.matchingVehicleDocumentsCount > 0 ? 'FOUND' : 'NOT_FOUND', citizenReference: l.entityId })),
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching search history', error: error.message });
  }
};

export const getOfficerSearchHistoryItem = async (req: AuthRequest, res: Response) => {
  const logs = await auditService.getLogsByActor(req.user?.id || '');
  const item = logs.find(l => l.id === req.params.searchId);
  if (!item) return res.status(404).json({ message: 'Search history item not found.' });
  return res.json({ searchId: item.id, createdAt: item.createdAt, result: item.metadata?.matchingVehicleDocumentsCount > 0 ? 'FOUND' : 'NOT_FOUND', citizenReference: item.entityId });
};
