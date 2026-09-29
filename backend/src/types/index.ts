export type DocumentType =
  | 'AADHAAR'
  | 'PAN'
  | 'VOTER_ID'
  | 'DRIVING_LICENSE'
  | 'VEHICLE_RC'
  | 'VEHICLE_INSURANCE'
  | 'POLLUTION'
  | 'MARKS_CARD'
  | 'DEGREE_CERTIFICATE'
  | 'PASSPORT'
  | 'OTHER';

export type ApprovedTag = 'VEHICLE' | 'NORMAL';

export type VerificationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export type RevocationStatus = 'ACTIVE' | 'REVOKED' | 'SUPERSEDED';

export type ExpiryStatus = 'NOT_APPLICABLE' | 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION' | 'DEACTIVATED';

export interface User {
  id: string;
  userId: string; // Unique User ID e.g. BDW-9K7F3A2
  fullName: string;
  email: string;
  phone: string;
  dob?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  passwordHash: string;
  isVerified?: boolean;
  phoneVerified?: boolean;
  accountStatus?: AccountStatus;
  role?: string;
  otp?: string;
  otpExpiresAt?: string;
  failedLoginAttempts?: number;
  lockoutUntil?: string;
  fcmToken?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminEntity {
  id: string;
  adminId: string; // e.g. ADMIN-001
  fullName: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  accountStatus: AccountStatus;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type PoliceAccountStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED'
  | 'DEACTIVATED';

export interface PoliceOfficer {
  id: string;
  officerId?: string;
  employeeId: string;
  badgeNumber?: string;
  fullName: string;
  rankDesignation: string;
  policeStation: string;
  district: string;
  state: string;
  phone: string;
  email: string;
  department?: string;
  stationCode?: string;
  serviceNumber?: string;
  passwordHash: string;
  isApproved: boolean;
  status: PoliceAccountStatus;
  otp?: string;
  otpExpiresAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface VersionHistoryEntry {
  version: number;
  status: VerificationStatus;
  rejectionReason?: string;
  documentHash: string;
  fileName: string;
  createdAt: string;
}

export interface DocumentItem {
  id: string; // DOC-XXXXXX
  userId: string;
  userPublicId: string;
  title: string;
  documentType: DocumentType;
  requestedTag: ApprovedTag;
  approvedTag: ApprovedTag;
  userSelectedTag?: ApprovedTag;
  adminApprovedTag?: ApprovedTag;
  status: VerificationStatus;
  verificationStatus?: VerificationStatus;
  fileName: string;
  filePath: string;
  fileLocation?: string;
  encryptedFileKey?: string;
  mimeType: string;
  fileSize: number;
  documentHash: string; // SHA-256
  fileHash?: string;
  version: number; // e.g. 1, 2
  currentVersion?: number;
  versionHistory?: VersionHistoryEntry[];
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  expiryDate?: string;
  revocationStatus?: RevocationStatus;
}

// SECTION 111: DOCUMENT REVIEW ENTITY
export interface DocumentReview {
  id: string;
  documentId: string;
  adminId: string;
  decision: 'APPROVE' | 'REJECT' | 'CHANGE_TAG' | 'REVOKE' | 'UNDER_REVIEW';
  previousTag?: ApprovedTag;
  finalTag?: ApprovedTag;
  rejectionReason?: string;
  reviewStartedAt?: string;
  reviewedAt: string;
  notes?: string;
}

// SECTION 113: DOCUMENT VERSION ENTITY
export interface DocumentVersionEntity {
  id: string;
  documentId: string;
  version: number;
  fileLocation: string;
  fileHash: string; // SHA-256
  fileSize: number;
  mimeType: string;
  status: VerificationStatus | 'SUPERSEDED';
  uploadedAt: string;
}

// SECTION 114: BLOCKCHAIN RECORD ENTITY
export interface BlockchainRecord {
  id?: string;
  documentId: string;
  documentVersionId?: string;
  ownerReference?: string; // User Public ID e.g. BDW-9K7F3A2
  documentType?: DocumentType;
  approvedTag?: ApprovedTag;
  documentHash: string; // SHA-256
  transactionHash: string;
  blockNumber: number; // e.g. 18492012
  network?: string; // e.g. 'Hardhat EVM Local Chain ID 31337'
  contractAddress?: string; // e.g. 0x5FbDB2315678afecb367f032d93F642f64180aa3
  recordType?: 'APPROVAL' | 'REVOCATION'; // SECTION 114
  status?: VerificationStatus | 'VERIFIED' | 'BLOCKCHAIN_PENDING' | 'REVOKED';
  verificationStatus: VerificationStatus;
  verifiedAt: string;
  createdAt?: string;
  version: number;
}

// SECTION 115: SECURITY EVENT ENTITY
export type SecuritySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface SecurityEvent {
  id: string;
  type: string;
  severity: SecuritySeverity;
  actorId: string;
  actorRole: ActorRole;
  entityId: string;
  metadata?: Record<string, any>;
  status: 'ACTIVE' | 'RESOLVED' | 'INVESTIGATING';
  createdAt: string;
  resolvedAt?: string;
}

export type NotificationType =
  | 'DOCUMENT_APPROVED'
  | 'DOCUMENT_REJECTED'
  | 'DOCUMENT_TAG_CHANGED'
  | 'DOCUMENT_UNDER_REVIEW'
  | 'SECURITY_ALERT'
  | 'ACCOUNT_UPDATE'
  | 'APPROVAL'
  | 'REJECTION'
  | 'TAG_CHANGE'
  | 'SYSTEM'
  | 'ACCOUNT_APPROVED'
  | 'ACCOUNT_REJECTED'
  | 'ACCOUNT_SUSPENDED'
  | 'PASSWORD_CHANGED'
  | 'NEW_DEVICE_LOGIN'
  | 'SECURITY_ALERT'
  | 'SYSTEM_MAINTENANCE';

export interface NotificationItem {
  id: string;
  userId: string;
  recipientId?: string;
  recipientRole?: 'USER' | 'POLICE' | 'ADMIN';
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  documentId?: string;
  createdAt: string;
}

export type ActorRole = 'USER' | 'ADMIN' | 'POLICE_OFFICER' | 'SYSTEM';

export type AdminRole =
  | 'ADMIN'                  // Main Phase 1 Unified Role
  | 'SUPER_ADMIN'            // Future Expansion
  | 'DOCUMENT_VERIFIER'      // Future Expansion
  | 'POLICE_ACCOUNT_VERIFIER'// Future Expansion
  | 'AUDITOR'                // Future Expansion
  | 'SYSTEM_ADMIN';          // Future Expansion

export type GovernmentRole =
  | 'POLICE'
  | 'RTO'
  | 'EDUCATION_OFFICER'
  | 'BANK_OFFICER'
  | 'GOVERNMENT_VERIFIER';

export interface AuditLog {
  id: string;
  actorId: string;
  actorRole: ActorRole;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  deviceInfo?: string;
  createdAt: string;
}

export type DocumentAccessType = 'METADATA_VIEW' | 'DOCUMENT_PREVIEW' | 'BLOCKCHAIN_VERIFY';
export interface DocumentAccessAudit {
  id: string;
  officerId: string;
  documentId: string;
  citizenReference: string;
  accessType: DocumentAccessType;
  result: 'SUCCESS' | 'DENIED';
  ipAddress: string;
  deviceId?: string;
  createdAt: string;
}
