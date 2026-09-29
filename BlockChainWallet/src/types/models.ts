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

export interface User {
  id: string;
  userId: string; // Unique Public User ID (e.g. USR-827361)
  fullName: string;
  email: string;
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  isVerified?: boolean;
  createdAt?: string;
}

export interface BlockchainRecord {
  id?: string;
  documentId: string;
  ownerReference?: string;
  documentType?: DocumentType;
  approvedTag?: ApprovedTag;
  documentHash: string;
  transactionHash: string;
  blockNumber?: number;
  network?: string;
  status?: VerificationStatus;
  verificationStatus: VerificationStatus;
  verifiedAt: string;
  createdAt?: string;
  version: number;
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
  filePath?: string;
  fileLocation?: string;
  encryptedFileKey?: string;
  mimeType: string;
  fileSize: number;
  documentHash: string;
  fileHash?: string;
  version: number;
  versionHistory?: VersionHistoryEntry[];
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  blockchainRecord?: BlockchainRecord | null;
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
  | 'SYSTEM';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  documentId?: string;
  createdAt: string;
}
