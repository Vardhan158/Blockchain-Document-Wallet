import mongoose from 'mongoose';
import { User, DocumentItem, BlockchainRecord, NotificationItem } from '../types';
import { UserModel } from '../models/user.model';
import { DocumentModel } from '../models/document.model';
import { BlockchainRecordModel } from '../models/blockchain.model';
import { NotificationModel } from '../models/notification.model';

class DbService {
  private inMemoryUsers: Map<string, User> = new Map();
  private inMemoryDocs: Map<string, DocumentItem> = new Map();
  private inMemoryLedger: Map<string, BlockchainRecord> = new Map();
  private inMemoryNotifs: Map<string, NotificationItem> = new Map();

  private isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  // --- USER OPERATIONS ---
  public async createUser(user: User): Promise<User> {
    if (this.isMongoConnected()) {
      try {
        await UserModel.findOneAndUpdate({ id: user.id }, user, { upsert: true, returnDocument: 'after' });
      } catch (err) {
        console.warn('Error saving user to MongoDB:', err);
      }
    }
    this.inMemoryUsers.set(user.id, user);
    return user;
  }

  public async saveUser(user: User): Promise<User> {
    return this.createUser(user);
  }

  public async getUserByEmail(email: string): Promise<User | undefined> {
    if (this.isMongoConnected()) {
      try {
        const doc = await UserModel.findOne({ email: email.toLowerCase() }).lean();
        if (doc) return doc as User;
      } catch (err) {
        console.warn('Error fetching user by email from MongoDB:', err);
      }
    }
    return Array.from(this.inMemoryUsers.values()).find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );
  }

  public async getUserById(id: string): Promise<User | undefined> {
    if (this.isMongoConnected()) {
      try {
        const doc = await UserModel.findOne({ id }).lean();
        if (doc) return doc as User;
      } catch (err) {
        console.warn('Error fetching user by id from MongoDB:', err);
      }
    }
    return this.inMemoryUsers.get(id);
  }

  public async getUserByPublicId(publicUserId: string): Promise<User | undefined> {
    if (this.isMongoConnected()) {
      try {
        const doc = await UserModel.findOne({ userId: publicUserId }).lean();
        if (doc) return doc as User;
      } catch (err) {
        console.warn('Error fetching user by public id from MongoDB:', err);
      }
    }
    return Array.from(this.inMemoryUsers.values()).find(u => u.userId === publicUserId);
  }

  // --- DOCUMENT OPERATIONS ---
  public async saveDocument(doc: DocumentItem): Promise<DocumentItem> {
    if (this.isMongoConnected()) {
      try {
        await DocumentModel.findOneAndUpdate({ id: doc.id }, doc, { upsert: true, returnDocument: 'after' });
      } catch (err) {
        console.warn('Error saving document to MongoDB:', err);
      }
    }
    this.inMemoryDocs.set(doc.id, doc);
    return doc;
  }

  public async getDocumentById(id: string): Promise<DocumentItem | undefined> {
    if (this.isMongoConnected()) {
      try {
        const doc = await DocumentModel.findOne({ id }).lean();
        if (doc) return doc as DocumentItem;
      } catch (err) {
        console.warn('Error fetching document by id from MongoDB:', err);
      }
    }
    return this.inMemoryDocs.get(id);
  }

  public async getDocumentsByUserId(userId: string): Promise<DocumentItem[]> {
    if (this.isMongoConnected()) {
      try {
        const docs = await DocumentModel.find({ userId }).lean();
        if (docs && docs.length > 0) return docs as DocumentItem[];
      } catch (err) {
        console.warn('Error fetching documents by user id from MongoDB:', err);
      }
    }
    return Array.from(this.inMemoryDocs.values()).filter(doc => doc.userId === userId);
  }

  /**
   * SECTIONS 47, 48, 56 & 57: Police Visibility & Version Superseding Rule
   * Condition: (verificationStatus == 'APPROVED' || status == 'APPROVED')
   *            AND (adminApprovedTag == 'VEHICLE' || approvedTag == 'VEHICLE')
   *            AND revocationStatus != 'SUPERSEDED' AND revocationStatus != 'REVOKED'
   * Note: Police receives ONLY the current active version (e.g. Version 2, not Version 1).
   */
  public async getVehicleDocumentsByPublicUserId(userPublicId: string): Promise<DocumentItem[]> {
    if (this.isMongoConnected()) {
      try {
        const docs = await DocumentModel.find({
          userPublicId,
          $and: [
            { $or: [{ status: 'APPROVED' }, { verificationStatus: 'APPROVED' }] },
            { adminApprovedTag: 'VEHICLE' },
            { revocationStatus: { $nin: ['SUPERSEDED', 'REVOKED'] } },
          ],
        }).lean();
        if (docs && docs.length > 0) return docs as DocumentItem[];
      } catch (err) {
        console.warn('Error fetching vehicle documents from MongoDB:', err);
      }
    }
    return Array.from(this.inMemoryDocs.values()).filter(doc => {
      const isApproved = doc.status === 'APPROVED' || doc.verificationStatus === 'APPROVED';
      const isAdminVehicleTag = doc.adminApprovedTag === 'VEHICLE';
      const isActiveVersion = (doc as any).revocationStatus !== 'SUPERSEDED' && (doc as any).revocationStatus !== 'REVOKED';
      return doc.userPublicId === userPublicId && isApproved && isAdminVehicleTag && isActiveVersion;
    });
  }

  // --- BLOCKCHAIN OPERATIONS ---
  public async saveBlockchainRecord(record: BlockchainRecord): Promise<BlockchainRecord> {
    if (this.isMongoConnected()) {
      try {
        await BlockchainRecordModel.findOneAndUpdate(
          { documentId: record.documentId },
          record,
          { upsert: true, returnDocument: 'after' }
        );
      } catch (err) {
        console.warn('Error saving blockchain record to MongoDB:', err);
      }
    }
    this.inMemoryLedger.set(record.documentId, record);
    return record;
  }

  public async getBlockchainRecord(documentId: string): Promise<BlockchainRecord | undefined> {
    if (this.isMongoConnected()) {
      try {
        const rec = await BlockchainRecordModel.findOne({ documentId }).lean();
        if (rec) return rec as BlockchainRecord;
      } catch (err) {
        console.warn('Error fetching blockchain record from MongoDB:', err);
      }
    }
    return this.inMemoryLedger.get(documentId);
  }

  // --- NOTIFICATION OPERATIONS ---
  public async createNotification(notif: NotificationItem): Promise<NotificationItem> {
    if (this.isMongoConnected()) {
      try {
        await NotificationModel.create(notif);
      } catch (err) {
        console.warn('Error creating notification in MongoDB:', err);
      }
    }
    this.inMemoryNotifs.set(notif.id, notif);
    return notif;
  }

  public async getNotificationsByUserId(userId: string, role?: string): Promise<NotificationItem[]> {
    // Police accounts only receive account/security/system notifications. In particular,
    // document lifecycle events must never leak into the Police notification feed.
    const policeNotificationTypes: NotificationItem['type'][] = [
      'ACCOUNT_APPROVED',
      'ACCOUNT_REJECTED',
      'ACCOUNT_SUSPENDED',
      'SECURITY_ALERT',
      'PASSWORD_CHANGED',
      'NEW_DEVICE_LOGIN',
      'SYSTEM_MAINTENANCE',
    ];
    if (this.isMongoConnected()) {
      try {
        const query: any = { userId };
        if (role === 'POLICE' || role === 'POLICE_OFFICER') {
          query.type = { $in: policeNotificationTypes };
        }
        const notifs = await NotificationModel.find(query).sort({ createdAt: -1 }).lean();
        if (notifs && notifs.length > 0) return notifs as NotificationItem[];
      } catch (err) {
        console.warn('Error fetching notifications from MongoDB:', err);
      }
    }
    return Array.from(this.inMemoryNotifs.values())
      .filter(n => n.userId === userId &&
        (!(role === 'POLICE' || role === 'POLICE_OFFICER') || policeNotificationTypes.includes(n.type)))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async markNotificationAsRead(notifId: string, userId: string): Promise<boolean> {
    if (this.isMongoConnected()) {
      try {
        const res = await NotificationModel.updateOne({ id: notifId, userId }, { read: true });
        if (res.modifiedCount > 0) {
          const notif = this.inMemoryNotifs.get(notifId);
          if (notif) notif.read = true;
          return true;
        }
      } catch (err) {
        console.warn('Error marking notification as read in MongoDB:', err);
      }
    }
    const notif = this.inMemoryNotifs.get(notifId);
    if (notif && notif.userId === userId) {
      notif.read = true;
      return true;
    }
    return false;
  }
}

export const dbService = new DbService();
