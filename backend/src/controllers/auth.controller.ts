import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../services/db.service';
import { emailService } from '../services/email.service';
import { JWT_SECRET, AuthRequest } from '../middlewares/auth.middleware';
import { User } from '../types';
import { PoliceOfficerModel } from '../models/officer.model';
import { UserModel } from '../models/user.model';
import { auditService } from '../services/audit.service';

import crypto from 'crypto';
import { createAdminSession } from '../services/admin-session.service';

// In production this should be backed by a shared Redis/token store.
const revokedRefreshTokens = new Set<string>();

/**
 * Generates a unique, non-sequential, cryptographically random User ID
 * Format: BDW-XXXXXXX (e.g. BDW-9K7F3A2)
 * Meets security requirements: non-sequential, unique, does not expose DB IDs
 */
async function generateUniqueUserId(): Promise<string> {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Unambiguous uppercase alphanumeric
  let isUnique = false;
  let userId = '';

  while (!isUnique) {
    const bytes = crypto.randomBytes(7);
    let code = '';
    for (let i = 0; i < 7; i++) {
      code += chars[bytes[i] % chars.length];
    }
    userId = `BDW-${code}`;

    const existing = await dbService.getUserByPublicId(userId);
    if (!existing) {
      isUnique = true;
    }
  }

  return userId;
}

function validateRegistration(data: any): string | null {
  const { fullName, email, phone, password } = data;

  if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
    return 'Full name is required.';
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
    return 'Mobile number must contain a valid phone number.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return 'Please enter a valid email address.';
  }

  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
  }

  return null;
}

function generate4DigitOtp(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, dob, phone, email, password, gender, address, fcmToken } = req.body;

    const validationError = validateRegistration(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const existingUser = await dbService.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = await generateUniqueUserId();
    const id = `user_${Date.now()}`;
    const otp = generate4DigitOtp();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const activeFcmToken = fcmToken ? fcmToken.trim() : `fcm_device_${userId}`;

    const newUser: User = {
      id,
      userId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      dob: dob ? dob.trim() : '',
      gender: gender ? gender.trim() : '',
      address: address ? address.trim() : '',
      passwordHash,
      isVerified: false,
      otp,
      otpExpiresAt,
      fcmToken: activeFcmToken,
      createdAt: new Date().toISOString(),
    };

    await dbService.createUser(newUser);

    // Dispatch real-time OTP email to user's registered address
    const emailResult = await emailService.sendOtpEmail(newUser.email, otp);

    return res.status(201).json({
      message: `Registration successful! 4-digit OTP sent to ${newUser.email}.`,
      requiresVerification: true,
      email: newUser.email,
      otpDemo: otp,
      emailSent: emailResult.sent,
      emailPreviewUrl: emailResult.previewUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp, fcmToken } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email address and 4-digit OTP are required.' });
    }

    const user = await dbService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    if (user.isVerified) {
      const token = jwt.sign(
        { id: user.id, userId: user.userId, email: user.email },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      return res.json({
        message: 'Account is already active.',
        token,
        user: {
          id: user.id,
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          isVerified: true,
        },
      });
    }

    if (user.otp !== otp.toString().trim()) {
      return res.status(400).json({ message: 'Invalid OTP code. Please check your email and try again.' });
    }

    // Mark account active & verified + set active FCM Token
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    if (fcmToken || !user.fcmToken) {
      user.fcmToken = fcmToken ? fcmToken.trim() : user.fcmToken || `fcm_device_${user.userId}`;
    }
    await dbService.saveUser(user);

    const accessToken = jwt.sign(
      { id: user.id, userId: user.userId, email: user.email, tokenType: 'access' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, userId: user.userId, tokenType: 'refresh' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Email ID verified successfully! Account is now active.',
      accessToken,
      refreshToken,
      token: accessToken,
      user: {
        id: user.id,
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isVerified: true,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email address is required.' });
    }

    const user = await dbService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    const freshOtp = generate4DigitOtp();
    user.otp = freshOtp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await dbService.createUser(user);

    // Dispatch real-time OTP email
    const emailResult = await emailService.sendOtpEmail(user.email, freshOtp);

    return res.json({
      message: `A fresh 4-digit OTP has been sent to ${user.email}.`,
      email: user.email,
      otpDemo: freshOtp,
      emailSent: emailResult.sent,
      emailPreviewUrl: emailResult.previewUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error resending OTP', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email address and password are required.' });
    }

    const user = await dbService.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Section 60: Account Lockout Check (5 failed attempts locks for 15 mins)
    if (user.lockoutUntil && new Date(user.lockoutUntil).getTime() > Date.now()) {
      const remainingMins = Math.ceil((new Date(user.lockoutUntil).getTime() - Date.now()) / 60000);
      return res.status(423).json({
        message: `Account temporarily locked due to 5 consecutive failed login attempts. Please try again in ${remainingMins} minute(s).`,
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      user.failedLoginAttempts = attempts;

      if (attempts >= 5) {
        user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        user.failedLoginAttempts = 0;
        await dbService.saveUser(user);
        return res.status(423).json({
          message: 'Account locked! 5 consecutive failed login attempts detected. Locked for 15 minutes.',
        });
      }

      await dbService.saveUser(user);
      return res.status(401).json({
        message: `Invalid email or password. (${5 - attempts} attempt(s) remaining before account lockout)`,
      });
    }

    // SECTION 49: SUSPENDED USER LOGIN RESTRICTION
    if (user.accountStatus === 'SUSPENDED') {
      return res.status(403).json({
        message: 'Your account is currently suspended for security investigation. Please contact administrator.',
        accountStatus: 'SUSPENDED',
      });
    }

    if (user.accountStatus === 'DEACTIVATED') {
      return res.status(403).json({
        message: 'Your account has been deactivated.',
        accountStatus: 'DEACTIVATED',
      });
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockoutUntil = undefined;
    await dbService.saveUser(user);

    // Check email verification status
    if (user.isVerified === false) {
      return res.status(403).json({
        message: 'Your email address is not verified yet. Please complete OTP verification.',
        requiresVerification: true,
        email: user.email,
      });
    }

    // Generate Access Token (short-lived 15m) & Refresh Token (long-lived 7d)
    const accessToken = jwt.sign(
      { id: user.id, userId: user.userId, email: user.email, tokenType: 'access' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, userId: user.userId, tokenType: 'refresh' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      token: accessToken, // Backwards compatibility for bearer token header
      user: {
        id: user.id,
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        isVerified: user.isVerified ?? true,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error logging in', error: error.message });
  }
};

export const refreshTokens = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Refresh token is required.' });
    }
    if (revokedRefreshTokens.has(token)) return res.status(401).json({ code: 'SESSION_EXPIRED', message: 'Session expired. Please sign in again.' });

    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      if (decoded.tokenType !== 'refresh') return res.status(401).json({ message: 'Invalid refresh token.' });
      revokedRefreshTokens.add(token); // rotate: a refresh token is single-use

      if (decoded.role === 'POLICE_OFFICER' || decoded.role === 'POLICE') {
        const officer = await PoliceOfficerModel.findOne({ id: decoded.id }).lean();
        if (!officer || officer.status !== 'APPROVED' || !officer.isApproved) return res.status(401).json({ code: 'OFFICER_NOT_APPROVED', message: 'Officer session is no longer approved.' });
        const newAccessToken = jwt.sign({ id: officer.id, userId: officer.employeeId, email: officer.email, role: 'POLICE_OFFICER', badgeNumber: officer.employeeId }, JWT_SECRET, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ id: officer.id, email: officer.email, role: 'POLICE_OFFICER', tokenType: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken, token: newAccessToken });
      }

      const user = await dbService.getUserById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'User not found.' });
      }

      // Re-issue 15-minute Access Token & 7-day Refresh Token
      const newAccessToken = jwt.sign(
        { id: user.id, userId: user.userId, email: user.email, tokenType: 'access' },
        JWT_SECRET,
        { expiresIn: '15m' }
      );

      const newRefreshToken = jwt.sign(
        { id: user.id, userId: user.userId, tokenType: 'refresh' },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        token: newAccessToken,
      });
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired refresh token.' });
    }
  } catch (error: any) {
    return res.status(500).json({ message: 'Error refreshing token', error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      user: {
        id: user.id,
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

export const registerDevice = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { fcmToken } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. Authentication token required.' });
    }

    if (!fcmToken) {
      return res.status(400).json({ message: 'fcmToken is required.' });
    }

    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    user.fcmToken = fcmToken;
    await dbService.saveUser(user);

    console.log(`📲 [DEVICE REGISTRATION] Registered FCM Device Token for User ID ${user.userId}: ${fcmToken.slice(0, 16)}...`);

    return res.json({
      message: 'FCM Device token registered successfully for Push Notifications.',
      userId: user.userId,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error registering device token', error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { fullName, phone, dob } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (fullName) user.fullName = fullName.trim();
    if (phone) user.phone = phone.trim();
    if (dob) user.dob = dob.trim();

    await dbService.saveUser(user);

    return res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user.id,
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

// Section 47: Sensitive Email Change Flow - Step 1: Initiate & Send OTP to Old Email
export const initiateEmailChange = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { newEmail } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      return res.status(400).json({ message: 'Valid new email address is required.' });
    }

    const existing = await dbService.getUserByEmail(newEmail.trim());
    if (existing) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const oldEmailOtp = generate4DigitOtp();
    user.otp = oldEmailOtp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await dbService.saveUser(user);

    // Send OTP to old (current) email address
    const emailResult = await emailService.sendOtpEmail(user.email, oldEmailOtp);

    return res.json({
      message: `Step 1/2: Verification OTP sent to current email address (${user.email}).`,
      oldEmail: user.email,
      newEmail: newEmail.trim().toLowerCase(),
      otpDemo: oldEmailOtp,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error initiating email change', error: error.message });
  }
};

// Section 47: Step 2: Verify Old Email OTP & Send OTP to New Email
export const verifyOldEmailOtp = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { otp, newEmail } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp.toString().trim()) {
      return res.status(400).json({ message: 'Invalid OTP code sent to current email.' });
    }

    const newEmailOtp = generate4DigitOtp();
    user.otp = newEmailOtp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await dbService.saveUser(user);

    // Send OTP to requested NEW email address
    const emailResult = await emailService.sendOtpEmail(newEmail.trim().toLowerCase(), newEmailOtp);

    return res.json({
      message: `Step 2/2: Verification OTP sent to requested new email address (${newEmail}).`,
      newEmail: newEmail.trim().toLowerCase(),
      otpDemo: newEmailOtp,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error verifying old email OTP', error: error.message });
  }
};

// Section 47: Step 3: Verify New Email OTP & Finalize Email Update
export const verifyNewEmailOtp = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { otp, newEmail } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.otp !== otp.toString().trim()) {
      return res.status(400).json({ message: 'Invalid OTP code sent to new email address.' });
    }

    user.email = newEmail.trim().toLowerCase();
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await dbService.saveUser(user);

    // Re-issue JWT tokens with updated email
    const accessToken = jwt.sign(
      { id: user.id, userId: user.userId, email: user.email, tokenType: 'access' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id, userId: user.userId, tokenType: 'refresh' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Email address updated successfully after 2-factor email verification!',
      accessToken,
      refreshToken,
      token: accessToken,
      user: {
        id: user.id,
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        dob: user.dob,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating email address', error: error.message });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' });
    }

    const user = await dbService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await dbService.saveUser(user);

    return res.json({ message: 'Password changed successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

// Section 49: Logout & Refresh Token Revocation
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      revokedRefreshTokens.add(token);
      console.log(`🔒 [AUTH REVOCATION] Refresh Token revoked successfully.`);
    }
    return res.json({ message: 'Logged out successfully and refresh tokens revoked.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error logging out', error: error.message });
  }
};

// Section 48: Forgot Password Flow - Step 1: Enter mobile/email & Receive OTP
export const initiateForgotPassword = async (req: Request, res: Response) => {
  try {
    const { emailOrPhone } = req.body;

    if (!emailOrPhone) {
      return res.status(400).json({ message: 'Email address or mobile number is required.' });
    }

    const trimmedInput = emailOrPhone.trim().toLowerCase();
    let user = await dbService.getUserByEmail(trimmedInput);

    if (!user) {
      const allUsers = Array.from((dbService as any).inMemoryUsers?.values() || []);
      user = allUsers.find((u: any) => u.phone && u.phone.trim() === emailOrPhone.trim()) as any;
    }

    if (!user) {
      return res.status(404).json({ message: 'No account found matching the provided email or mobile number.' });
    }

    const resetOtp = generate4DigitOtp();
    user.otp = resetOtp;
    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    await dbService.saveUser(user);

    // Dispatch real-time OTP email
    const emailResult = await emailService.sendOtpEmail(user.email, resetOtp);

    return res.json({
      message: `Password reset 4-digit OTP sent to ${user.email}.`,
      email: user.email,
      otpDemo: resetOtp,
      emailSent: emailResult.sent,
      emailPreviewUrl: emailResult.previewUrl,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error processing forgot password request', error: error.message });
  }
};

// Section 48: Step 2: Verify Forgot Password OTP
export const verifyForgotPasswordOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email address and 4-digit OTP are required.' });
    }

    const user = await dbService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    if (user.otp !== otp.toString().trim()) {
      return res.status(400).json({ message: 'Invalid 4-digit OTP code.' });
    }

    return res.json({
      message: 'OTP verified successfully. You may now set your new password.',
      email: user.email,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error verifying OTP', error: error.message });
  }
};

// Section 48: Step 3: Set New Password
export const resetForgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required.' });
    }

    const user = await dbService.getUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    if (user.otp !== otp.toString().trim()) {
      return res.status(400).json({ message: 'Invalid or expired OTP session.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' });
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await dbService.saveUser(user);

    return res.json({
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};

/**
 * SECTIONS 8, 9 & 10: Admin Login & Account Status Enforcement
 * Accepts: Admin ID (ADMIN-001) or Admin Email.
 * Enforces: Account Status = ACTIVE (Blocks SUSPENDED or DEACTIVATED admins).
 */
export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { adminIdentifier, email, password } = req.body;
    const identifier = (adminIdentifier || email || '').toString().trim().toLowerCase();

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Admin ID / Email and password are required.' });
    }

    const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@vault.gov.in').trim().toLowerCase();
    const envAdminId = (process.env.ADMIN_ID || process.env.ADMIN_USER_ID || 'ADMIN-001').trim().toUpperCase();

    let adminUser = await UserModel.findOne({
      $or: [
        { email: identifier },
        { userId: identifier.toUpperCase() },
      ],
    });

    if (!adminUser) {
      const memUser = (await dbService.getUserByEmail(identifier)) || (await dbService.getUserByPublicId(identifier.toUpperCase()));
      if (memUser && memUser.role === 'ADMIN') {
        adminUser = memUser as any;
      }
    }

    // Seed fallback if missing
    if (!adminUser && (identifier === envAdminEmail || identifier === envAdminId.toLowerCase() || identifier === 'admin@vault.gov.in' || identifier === 'admin-001')) {
      const envAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const envAdminName = process.env.ADMIN_NAME || process.env.ADMIN_FULL_NAME || 'System Admin Supervisor';
      const envAdminPhone = process.env.ADMIN_PHONE || '1800112026';
      const passwordHash = await bcrypt.hash(envAdminPassword, 10);
      const adminData = {
        id: 'admin_001',
        userId: envAdminId,
        fullName: envAdminName,
        email: envAdminEmail,
        phone: envAdminPhone,
        passwordHash,
        isVerified: true,
        phoneVerified: true,
        accountStatus: 'ACTIVE' as const,
        role: 'ADMIN' as const,
        failedLoginAttempts: 0,
        lockoutUntil: '',
        createdAt: new Date().toISOString(),
      };
      try {
        adminUser = await UserModel.create(adminData);
      } catch (e) {
        // Fallback if Mongo is unavailable
      }
      await dbService.createUser(adminData as any);
      if (!adminUser) {
        adminUser = adminData as any;
      }
    }

    if (!adminUser) {
      return res.status(401).json({ message: 'Invalid administrator credentials.' });
    }

    // SECTION 135: ADMIN LOGIN ATTEMPT LIMITS & LOCKOUT COOLDOWN
    if (adminUser.lockoutUntil && new Date(adminUser.lockoutUntil).getTime() > Date.now()) {
      const remainingMins = Math.ceil((new Date(adminUser.lockoutUntil).getTime() - Date.now()) / 60000);
      return res.status(423).json({
        message: `Admin account temporarily locked due to 5 consecutive failed login attempts. Please try again in ${remainingMins} minute(s).`,
      });
    }

    const isMatch = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isMatch) {
      const attempts = (adminUser.failedLoginAttempts || 0) + 1;
      adminUser.failedLoginAttempts = attempts;

      if (attempts >= 5) {
        adminUser.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        adminUser.failedLoginAttempts = 0;
        await dbService.saveUser(adminUser);
        return res.status(423).json({
          message: 'Admin account locked! 5 consecutive failed login attempts detected. Temporary 15-minute cooldown active.',
        });
      }

      await dbService.saveUser(adminUser);
      return res.status(401).json({
        message: `Invalid administrator credentials. (${5 - attempts} attempt(s) remaining before temporary cooldown)`,
      });
    }

    // Reset failed login attempts on success
    adminUser.failedLoginAttempts = 0;
    adminUser.lockoutUntil = undefined;
    if (typeof (adminUser as any).save === 'function') {
      try {
        await (adminUser as any).save();
      } catch (e) {}
    }
    await dbService.saveUser(adminUser as any);

    // SECTION 10: STRICT ACCOUNT STATUS CHECK (MUST BE ACTIVE)
    const status = adminUser.accountStatus || 'ACTIVE';
    if (status === 'SUSPENDED') {
      return res.status(403).json({
        message: 'Your administrator account has been suspended by system security.',
        status: 'SUSPENDED',
      });
    }

    if (status === 'DEACTIVATED') {
      return res.status(403).json({
        message: 'Your administrator account has been deactivated.',
        status: 'DEACTIVATED',
      });
    }

    if (status !== 'ACTIVE') {
      return res.status(403).json({
        message: 'Only ACTIVE administrator accounts can access the Admin Portal.',
        status,
      });
    }

    const session = await createAdminSession(adminUser.id);
    const accessToken = jwt.sign(
      {
        id: adminUser.id,
        userId: adminUser.userId,
        email: adminUser.email,
        role: 'ADMIN',
        sid: session.id,
        tokenType: 'access',
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = session.refreshToken;

    // Section 55 Audit Log
    await auditService.logEvent(
      adminUser.userId,
      'ADMIN',
      'ADMIN_LOGIN',
      'ADMIN',
      adminUser.id,
      { email: adminUser.email, status: 'ACTIVE' }
    );

    return res.json({
      message: 'Administrator login successful.',
      accessToken,
      refreshToken,
      token: accessToken,
      admin: {
        id: adminUser.id,
        userId: adminUser.userId,
        fullName: adminUser.fullName,
        email: adminUser.email,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error logging in administrator', error: error.message });
  }
};
