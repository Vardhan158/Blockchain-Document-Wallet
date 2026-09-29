import { AuditLog, ActorRole } from '../types';
import { AuditLogModel } from '../models/audit.model';
import mongoose from 'mongoose';

export class AuditService {
  private inMemoryLogs: Map<string, AuditLog> = new Map();

  private isMongoConnected(): boolean {
    return mongoose.connection.readyState === 1;
  }

  /**
   * SECTION 137: PII LOGGING RULE & MASKING
   * Sanitizes metadata to mask sensitive PII (Passwords, OTPs, Aadhaar, PAN, Encryption Keys).
   */
  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> {
    if (!metadata) return {};
    const sanitized = { ...metadata };

    const piiKeys = ['password', 'passwordHash', 'otp', 'aadhaar', 'pan', 'encryptionKey', 'secret', 'masterKey', 'privateKey'];
    for (const key of Object.keys(sanitized)) {
      const lowerKey = key.toLowerCase();
      if (piiKeys.some(k => lowerKey.includes(k.toLowerCase()))) {
        sanitized[key] = '***MASKED_PII***';
      }
    }

    return sanitized;
  }

  /**
   * Logs a security or administrative audit event
   */
  public async logEvent(
    actorId: string,
    actorRole: ActorRole,
    action: string,
    entityType: string,
    entityId: string,
    metadata?: Record<string, any>
  ): Promise<AuditLog> {
    const id = `audit_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const createdAt = new Date().toISOString();
    const cleanMetadata = this.sanitizeMetadata(metadata);

    const auditEntry: AuditLog = {
      id,
      actorId,
      actorRole,
      action,
      entityType,
      entityId,
      metadata: cleanMetadata,
      createdAt,
    };

    if (this.isMongoConnected()) {
      try {
        await AuditLogModel.create(auditEntry);
      } catch (err: any) {
        console.warn('⚠️ [AUDIT SERVICE WARNING] Could not persist audit log to MongoDB:', err.message);
      }
    }

    this.inMemoryLogs.set(id, auditEntry);

    console.log(`📜 [AUDIT LOG RECORDED] Actor: ${actorId} (${actorRole}) -> Action: "${action}" on ${entityType}:${entityId}`);

    return auditEntry;
  }

  /**
   * Retrieves audit logs for a specific entity or actor
   */
  public async getLogsForEntity(entityId: string): Promise<AuditLog[]> {
    if (this.isMongoConnected()) {
      try {
        const logs = await AuditLogModel.find({ entityId }).sort({ createdAt: -1 }).lean();
        if (logs && logs.length > 0) return logs as AuditLog[];
      } catch (err: any) {
        console.warn('Error fetching audit logs from MongoDB:', err.message);
      }
    }

    return Array.from(this.inMemoryLogs.values())
      .filter(l => l.entityId === entityId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getLogsByActor(actorId: string): Promise<AuditLog[]> {
    if (this.isMongoConnected()) {
      const logs = await AuditLogModel.find({ actorId, action: 'LOOKUP_VEHICLE_DOCUMENTS' }).sort({ createdAt: -1 }).lean();
      if (logs) return logs as AuditLog[];
    }
    return Array.from(this.inMemoryLogs.values()).filter(l => l.actorId === actorId && l.action === 'LOOKUP_VEHICLE_DOCUMENTS').sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const auditService = new AuditService();
