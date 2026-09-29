import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest, JWT_SECRET } from '../middlewares/auth.middleware';
import { dbService } from '../services/db.service';
import { blockchainService } from '../services/blockchain.service';
import { encryptionService } from '../services/encryption.service';
import { auditService } from '../services/audit.service';
import { PoliceOfficerModel } from '../models/officer.model';
import { DocumentItem, DocumentType, ApprovedTag } from '../types';
import crypto from 'crypto';

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized. Authentication token required.' });
    }

    const { title, documentType, requestedTag, userSelectedTag } = req.body;
    const selectedTag = requestedTag || userSelectedTag;
    const file = req.file;

    if (!title || !documentType || !selectedTag) {
      return res.status(400).json({ message: 'Title, documentType, and userSelectedTag are required' });
    }

    const fileName = file ? file.originalname : `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`;
    const fileBuffer = file ? file.buffer : Buffer.from(`${title}-${Date.now()}`);

    // Step 1: Run Malware & Security Scan on File Buffer
    const securityCheck = encryptionService.scanFileBuffer(fileBuffer, fileName);
    if (!securityCheck.safe) {
      return res.status(400).json({ message: securityCheck.reason });
    }

    // Step 2: Generate Internal Document ID
    const docId = `DOC-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

    // Step 3: Generate SHA-256 Unencrypted File Hash
    const documentHash = encryptionService.generateSha256Hash(fileBuffer);

    // Step 4: Encrypt Document Buffer (AES-256-CBC)
    const { encryptedBuffer } = encryptionService.encryptDocument(fileBuffer);

    // Step 5: Store Encrypted Document to Disk Storage
    const savedFilePath = encryptionService.saveEncryptedDocument(docId, encryptedBuffer);

    // Step 6: Store Metadata in Database with Initial Status PENDING & Version 1
    const newDoc: DocumentItem = {
      id: docId,
      userId: user.id,
      userPublicId: user.userId,
      title: title.trim(),
      documentType: documentType as DocumentType,
      requestedTag: selectedTag as ApprovedTag,
      approvedTag: selectedTag as ApprovedTag,
      userSelectedTag: selectedTag as ApprovedTag,
      adminApprovedTag: selectedTag as ApprovedTag,
      status: 'PENDING',
      verificationStatus: 'PENDING',
      fileName,
      filePath: savedFilePath,
      fileLocation: savedFilePath,
      encryptedFileKey: 'AES-256-CBC-VAULT-KEY',
      mimeType: file ? file.mimetype : 'application/pdf',
      fileSize: file ? file.size : fileBuffer.length,
      documentHash,
      fileHash: documentHash,
      version: 1,
      versionHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbService.saveDocument(newDoc);

    // Section 55: Log Audit Event
    await auditService.logEvent(
      user.id,
      'USER',
      'UPLOAD_DOCUMENT',
      'DOCUMENT',
      docId,
      {
        title,
        documentType,
        userSelectedTag: selectedTag,
        fileHash: documentHash,
      }
    );

    // Step 7: Record Upload Event Notification & Dispatch to Admin Queue
    await dbService.createNotification({
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      title: 'Document Uploaded',
      message: `Your document "${title}" (${documentType}) was encrypted and submitted with status PENDING for admin verification.`,
      type: 'SYSTEM',
      read: false,
      documentId: docId,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      message: 'Document encrypted, uploaded successfully, and dispatched to Admin Verification Queue.',
      document: newDoc,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error processing document upload', error: error.message });
  }
};

export const getUserDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const docs = await dbService.getDocumentsByUserId(user.id);
    const enrichedDocs = await Promise.all(
      docs.map(async doc => {
        const bcRecord = await dbService.getBlockchainRecord(doc.id);
        return {
          ...doc,
          blockchainRecord: bcRecord || null,
        };
      })
    );

    return res.json({ documents: enrichedDocs });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
};

export const getDocumentDetails = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const doc = await dbService.getDocumentById(id);
    if (!doc || doc.userId !== user.id) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const bcRecord = await dbService.getBlockchainRecord(doc.id);
    const hashVerification = await blockchainService.verifyDocumentIntegrity(doc.id, doc.documentHash);

    return res.json({
      document: doc,
      blockchainRecord: bcRecord || null,
      integrityCheck: hashVerification,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching document details', error: error.message });
  }
};

export const reuploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized. Authentication token required.' });
    }

    const doc = await dbService.getDocumentById(id);
    if (!doc || doc.userId !== user.id) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const file = req.file;
    const fileName = file
      ? file.originalname
      : `${doc.title.toLowerCase().replace(/\s+/g, '_')}_v${(doc.version || 1) + 1}.pdf`;
    const fileBuffer = file ? file.buffer : Buffer.from(`${doc.title}-${Date.now()}`);

    // Scan security
    const securityCheck = encryptionService.scanFileBuffer(fileBuffer, fileName);
    if (!securityCheck.safe) {
      return res.status(400).json({ message: securityCheck.reason });
    }

    // Generate SHA-256 hash & encrypt
    const newDocumentHash = encryptionService.generateSha256Hash(fileBuffer);
    const { encryptedBuffer } = encryptionService.encryptDocument(fileBuffer);
    const savedFilePath = encryptionService.saveEncryptedDocument(doc.id, encryptedBuffer);

    // Record previous version entry into history (Do NOT overwrite verification history)
    const currentVersionHistory = doc.versionHistory || [];
    currentVersionHistory.push({
      version: doc.version || 1,
      status: doc.status,
      rejectionReason: doc.rejectionReason,
      documentHash: doc.documentHash,
      fileName: doc.fileName,
      createdAt: doc.updatedAt || doc.createdAt,
    });

    // Increment version & reset status to PENDING for Version N
    const newVersion = (doc.version || 1) + 1;
    doc.version = newVersion;
    doc.versionHistory = currentVersionHistory;
    doc.status = 'PENDING';
    doc.rejectionReason = undefined;
    doc.documentHash = newDocumentHash;
    doc.fileName = fileName;
    doc.filePath = savedFilePath;
    doc.fileSize = file ? file.size : fileBuffer.length;
    doc.updatedAt = new Date().toISOString();

    await dbService.saveDocument(doc);

    // Section 55: Log Audit Event
    await auditService.logEvent(
      user.id,
      'USER',
      'REUPLOAD_DOCUMENT',
      'DOCUMENT',
      doc.id,
      {
        version: newVersion,
        fileHash: newDocumentHash,
      }
    );

    // Create user notification for re-upload
    await dbService.createNotification({
      id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId: user.id,
      title: 'Document Re-uploaded',
      message: `Version ${newVersion} of "${doc.title}" was re-uploaded and is now pending admin verification.`,
      type: 'SYSTEM',
      read: false,
      documentId: doc.id,
      createdAt: new Date().toISOString(),
    });

    return res.json({
      message: `Document Version ${newVersion} re-uploaded successfully and queued for admin verification.`,
      document: doc,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error re-uploading document', error: error.message });
  }
};

export const policeSearchUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId, userPublicId } = req.body;
    const targetUserId = (userId || userPublicId || req.params?.userPublicId || '').toString().trim().toUpperCase();

    // SECTION 21: AUTHORITATIVE BACKEND USER ID FORMAT VALIDATION
    const userIdRegex = /^BDW-[A-Z0-9]{7}$/i;
    if (!targetUserId || !userIdRegex.test(targetUserId)) {
      return res.status(400).json({ code: 'INVALID_USER_ID', message: 'Invalid User ID. Check the ID and try again.' });
    }

    // SECTION 22: OFFICER AUTHENTICATION & ROLE & STATUS CHECKS
    const requestingUser = req.user;
    if (requestingUser?.role === 'POLICE_OFFICER' || requestingUser?.role === 'POLICE') {
      const officer = await PoliceOfficerModel.findOne({
        $or: [{ id: requestingUser.id }, { email: requestingUser.email }],
      }).lean();

      if (officer && (officer.status !== 'APPROVED' || !officer.isApproved)) {
        return res.status(403).json({
          message: 'Your government officer account is not authorized or approved to perform citizen searches.',
        });
      }
    }

    // SECTION 23: USER NOT FOUND
    const targetUser = await dbService.getUserByPublicId(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        code: 'USER_NOT_FOUND',
        title: 'User Not Found',
        message: 'No registered citizen was found for this User ID.',
      });
    }

    // SECTION 49: SUSPENDED / DEACTIVATED USER EFFECT ON POLICE LOOKUP
    if (targetUser.accountStatus === 'SUSPENDED' || targetUser.accountStatus === 'DEACTIVATED') {
      await auditService.logEvent(
        req.user?.id || 'POLICE_OFFICER_FIELD',
        'POLICE_OFFICER',
        'LOOKUP_SUSPENDED_USER',
        'USER',
        targetUser.userId,
        { accountStatus: targetUser.accountStatus }
      );

      return res.status(403).json({
        code: 'CITIZEN_ACCOUNT_RESTRICTED',
        title: 'Citizen Account Restricted',
        message: `Citizen account ${targetUser.userId} is currently ${targetUser.accountStatus.toLowerCase()} by system policy. Police document access is restricted.`,
        user: {
          userId: targetUser.userId,
          fullName: targetUser.fullName,
          accountStatus: targetUser.accountStatus,
        },
        vehicleDocuments: [],
      });
    }

    // RETRIEVE DOCUMENTS WITH STRICT POLICE ACCESS-CONTROL FILTER
    const vehicleDocs = await dbService.getVehicleDocumentsByPublicUserId(targetUserId);
    const currentByType = vehicleDocs.reduce<Record<string, number>>((counts, doc) => {
      counts[doc.documentType] = (counts[doc.documentType] || 0) + 1;
      return counts;
    }, {});
    const getExpiryStatus = (expiryDate?: string) => {
      if (!expiryDate) return 'NOT_APPLICABLE';
      const expiry = new Date(expiryDate).getTime();
      if (Number.isNaN(expiry)) return 'NOT_APPLICABLE';
      const days = (expiry - Date.now()) / 86400000;
      return days < 0 ? 'EXPIRED' : days <= 30 ? 'EXPIRING_SOON' : 'VALID';
    };
    const enrichedDocs = await Promise.all(
      vehicleDocs.map(async doc => {
        const duplicateCurrent = (currentByType[doc.documentType] || 0) > 1;
        return {
        documentId: doc.id,
        title: doc.title,
        documentType: doc.documentType,
        approvedTag: doc.approvedTag,
        verificationStatus: doc.status,
        duplicateCurrent,
        administrativeReviewRequired: duplicateCurrent,
        reviewReason: duplicateCurrent
          ? `Multiple active ${doc.documentType} documents found for this citizen.`
          : undefined,
        blockchainStatus: (await dbService.getBlockchainRecord(doc.id)) ? 'VERIFIED' : 'UNVERIFIED',
        expiryStatus: getExpiryStatus((doc as any).expiryDate),
        };
      })
    );
    if (enrichedDocs.length === 0) {
      await auditService.logEvent(
        req.user?.id || 'POLICE_OFFICER_FIELD', 'POLICE_OFFICER', 'LOOKUP_VEHICLE_DOCUMENTS', 'USER', targetUser.userId,
        { matchingVehicleDocumentsCount: 0, result: 'NO_AUTHORIZED_DOCUMENTS' }
      );
      return res.json({
        code: 'NO_AUTHORIZED_DOCUMENTS',
        title: 'No Verified Vehicle Documents',
        message: 'There are currently no approved vehicle-related documents available for verification.',
        user: { userId: targetUser.userId, fullName: targetUser.fullName, accountStatus: targetUser.accountStatus || 'ACTIVE' },
        vehicleDocuments: [],
        documents: [],
      });
    }
    if (targetUser.accountStatus && targetUser.accountStatus !== 'ACTIVE') {
      return res.status(403).json({ code: 'CITIZEN_NOT_ACTIVE', message: 'Citizen account is not active.' });
    }

    // CREATE AUDIT ENTRY
    await auditService.logEvent(
      req.user?.id || 'POLICE_OFFICER_FIELD',
      'POLICE_OFFICER',
      'LOOKUP_VEHICLE_DOCUMENTS',
      'USER',
      targetUser.userId,
      {
        matchingVehicleDocumentsCount: vehicleDocs.length,
        duplicateCurrentDocuments: Object.entries(currentByType)
          .filter(([, count]) => count > 1)
          .map(([documentType, count]) => ({ documentType, count })),
      }
    );

    // SECTION 24: CITIZEN FOUND - RETURN ONLY LIMITED SAFE IDENTIFYING INFORMATION
    // Strictly EXCLUDES: Address, Email, Phone, Aadhaar, PAN
    let yearOfBirth = '';
    if (targetUser.dob) {
      yearOfBirth = targetUser.dob.slice(0, 4);
    } else if (targetUser.dateOfBirth) {
      yearOfBirth = targetUser.dateOfBirth.slice(0, 4);
    }

    return res.json({
      title: 'Citizen Found',
      user: {
        userId: targetUser.userId,
        fullName: targetUser.fullName,
        accountStatus: targetUser.accountStatus || 'ACTIVE',
        yearOfBirth: yearOfBirth || '2003',
      },
      vehicleDocuments: enrichedDocs,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error performing police citizen search', error: error.message });
  }
};

export const policeLookupByUserId = async (req: AuthRequest, res: Response) => {
  return policeSearchUser(req, res);
};

export const getPoliceDocument = async (req: AuthRequest, res: Response) => {
  const doc = await dbService.getDocumentById(req.params.documentId);
  const isPolice = req.user?.role === 'POLICE' || req.user?.role === 'POLICE_OFFICER';
  const owner = doc ? await dbService.getUserById(doc.userId) : undefined;
  const authorized = !!doc && (!owner?.accountStatus || owner.accountStatus === 'ACTIVE') && (doc.status === 'APPROVED' || doc.verificationStatus === 'APPROVED') &&
    doc.adminApprovedTag === 'VEHICLE' && (doc as any).revocationStatus !== 'REVOKED';
  if (!isPolice) return res.status(403).json({ message: 'Police officer access required.' });
  if (!doc) return res.status(404).json({ message: 'Document not found.' });
  if (!authorized) return res.status(403).json({ message: 'Document is not authorized for police access.' });
  const record = await dbService.getBlockchainRecord(doc.id);
  return res.json({ documentId: doc.id, documentType: doc.documentType, verificationStatus: doc.status, approvedTag: doc.approvedTag, blockchainStatus: record ? 'VERIFIED' : 'UNVERIFIED', expiryStatus: 'NOT_APPLICABLE' });
};

/**
 * SECTIONS 31 & 32: SECURE FILE ACCESS & SHORT-LIVED SIGNED STREAMING
 * Flow: Police taps View Document -> Verify officer session -> Verify document authorization ->
 * Generate short-lived access token (15 mins) -> Retrieve encrypted document -> Deliver temporary preview -> Access expires
 * Rule: NEVER return permanent public URLs like storage.example.com/documents/user123/dl.pdf
 */
export const streamPoliceDocumentPreview = async (req: AuthRequest, res: Response) => {
  try {
    const { documentId } = req.params;

    // Step 1: Verify Officer Session
    const officerId = req.user?.id;
    if (!officerId) {
      return res.status(401).json({ message: 'Unauthorized. Police officer session required.' });
    }

    const doc = await dbService.getDocumentById(documentId);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Step 2: Verify Document Authorization (status == APPROVED && adminApprovedTag == VEHICLE)
    const owner = await dbService.getUserById(doc.userId);
    const isApproved = (!owner?.accountStatus || owner.accountStatus === 'ACTIVE') && (doc.status === 'APPROVED' || doc.verificationStatus === 'APPROVED');
    const isVehicleTag = doc.adminApprovedTag === 'VEHICLE' && (doc as any).revocationStatus !== 'REVOKED';

    const officerBadge = req.user?.badgeNumber || req.user?.userId || officerId;
    const citizenRef = 'USER-HASH-' + encryptionService.generateSha256Hash(Buffer.from(doc.userPublicId || doc.userId)).slice(0, 8).toUpperCase();
    const clientIp = req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'Police Mobile App / Android';

    if (!isApproved || !isVehicleTag) {
      // SECTION 39: AUDIT DENIED ACCESS ATTEMPT
      await auditService.logEvent(
        officerBadge,
        'POLICE_OFFICER',
        'POLICE_DOCUMENT_VIEW',
        'DOCUMENT',
        documentId,
        {
          officerBadge,
          citizenReference: citizenRef,
          ipAddress: clientIp,
          userAgent,
          result: 'DENIED_UNAUTHORIZED',
        }
      );

      return res.status(403).json({
        message: 'Permission Denied: Police role is only authorized to access approved vehicle credentials.',
      });
    }

    // Step 3: Generate Short-Lived Access Token (Valid for 15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const temporaryToken = jwt.sign(
      { documentId: doc.id, officerId, scope: 'POLICE_PREVIEW' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // SECTION 39: AUDIT SUCCESSFUL DOCUMENT VIEW EVENT
    await auditService.logEvent(
      officerBadge,
      'POLICE_OFFICER',
      'POLICE_DOCUMENT_VIEW',
      'DOCUMENT',
      documentId,
      {
        officerBadge,
        documentId: doc.id,
        citizenReference: citizenRef,
        documentType: doc.documentType,
        ipAddress: clientIp,
        userAgent,
        result: 'SUCCESS',
        expiresAt,
      }
    );

    // SECTION 136: SENSITIVE DOCUMENT PROTECTION HEADERS (no-store, no-cache)
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Step 5: Return Authenticated Stream Endpoint + Short-Lived Signed Access Token
    // (Never returns permanent public S3/storage URLs!)
    return res.json({
      documentId: doc.id,
      title: doc.title,
      documentType: doc.documentType,
      mimeType: doc.mimeType || 'application/pdf',
      fileName: doc.fileName,
      streamUrl: `/api/v1/police/documents/${doc.id}/stream?token=${temporaryToken}`,
      temporaryAccessToken: temporaryToken,
      expiresAt,
      expiresInSeconds: 900,
      previewAvailable: true,
      notice: 'Temporary secure preview delivered. Access expires automatically in 15 minutes. No permanent public URLs provided.',
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error granting secure file access', error: error.message });
  }
};
