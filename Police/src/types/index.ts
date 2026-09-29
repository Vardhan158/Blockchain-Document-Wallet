export interface CitizenProfile {
  userId: string; // Public User ID e.g. BDW-9K7F3A2
  fullName: string;
  accountStatus?: string;
  yearOfBirth?: string;
}

export type RevocationStatus = 'ACTIVE' | 'REVOKED' | 'SUPERSEDED';
export type ExpiryStatus = 'NOT_APPLICABLE' | 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';

export interface VehicleDocument {
  documentId: string;
  title: string;
  documentType: string;
  approvedTag: 'VEHICLE';
  verificationStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'UNDER_REVIEW';
  revocationStatus?: RevocationStatus;
  expiryStatus?: ExpiryStatus;
  expiryDate?: string;
  documentHash?: string;
  blockchainRecord?: {
    transactionHash: string;
    blockNumber: number;
    verifiedAt: string;
    verificationStatus?: string;
    status?: string;
    documentHash?: string;
    valid?: boolean;
  } | null;
}

export interface PoliceLookupResponse {
  user: CitizenProfile;
  vehicleDocuments: VehicleDocument[];
}

export type PoliceTabParamList = {
  PoliceHome: { officer?: any } | undefined;
  PoliceLookup: undefined;
  PoliceHistory: undefined;
  PoliceNotifications: undefined;
  PoliceProfile: undefined;
};

export type PoliceStackParamList = {
  PoliceLogin: undefined;
  PoliceRegister: undefined;
  PoliceForgotPassword: undefined;
  PolicePendingApproval: { officer?: any; email?: string; password?: string };
  PoliceMain: undefined;
  PoliceHome: { officer?: any } | undefined;
  PoliceLookup: undefined;
  PoliceInspection: { lookupData: PoliceLookupResponse };
  DocumentView: { document: VehicleDocument; citizen: CitizenProfile };
};
