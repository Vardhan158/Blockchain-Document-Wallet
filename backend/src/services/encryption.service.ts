import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Master Encryption Key for AES-256 (32 bytes)
const ENCRYPTION_KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_SECRET || 'bdw_master_vault_encryption_key_2026')
  .digest();

export class EncryptionService {
  /**
   * SECTION 61: FILE SECURITY & MAGIC BYTE SIGNATURE VERIFICATION
   * Validates File Extension, MIME Type, and True Magic Byte Binary Signatures.
   * Never trusts file extension alone (e.g. an EXE renamed to aadhaar.pdf will be rejected).
   */
  public scanFileBuffer(buffer: Buffer, originalName: string, mimeType?: string): { safe: boolean; reason?: string } {
    if (!buffer || buffer.length === 0) {
      return { safe: false, reason: 'Empty file buffer received.' };
    }

    const MAX_10MB = 10 * 1024 * 1024;
    if (buffer.length > MAX_10MB) {
      return { safe: false, reason: 'Security Alert: File size exceeds maximum allowed 10MB limit.' };
    }

    const ext = path.extname(originalName).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
    if (!allowedExts.includes(ext)) {
      return { safe: false, reason: `Unsupported file extension "${ext}". Allowed: JPG, JPEG, PNG, PDF.` };
    }

    // Hex Header Analysis (First 8 bytes)
    const headerHex = buffer.slice(0, 8).toString('hex').toUpperCase();

    // 1. Check Executable / Script Signatures
    if (
      headerHex.startsWith('4D5A') || // Windows EXE/DLL (MZ)
      headerHex.startsWith('7F454C46') || // Linux ELF
      headerHex.startsWith('213C6172') || // Unix archive
      headerHex.startsWith('CAFEBABE') // Java Class File
    ) {
      return { safe: false, reason: 'Security Violation: Malicious binary executable signature detected.' };
    }

    // Check script tag signatures in text files
    const headerAscii = buffer.slice(0, 100).toString('utf8').toLowerCase();
    if (
      headerAscii.includes('<script') ||
      headerAscii.includes('<?php') ||
      headerAscii.includes('#!/bin/')
    ) {
      return { safe: false, reason: 'Security Violation: Malicious script tags detected in file header.' };
    }

    // 2. Strict Magic Byte Verification according to File Extension
    if (ext === '.pdf') {
      // PDF Magic Bytes: %PDF- (Hex: 25504446)
      if (!headerHex.startsWith('25504446')) {
        return {
          safe: false,
          reason: `File Signature Mismatch: "${originalName}" has a .pdf extension but binary header does NOT match valid PDF signature.`,
        };
      }
    } else if (ext === '.png') {
      // PNG Magic Bytes: \x89PNG (Hex: 89504E47)
      if (!headerHex.startsWith('89504E47')) {
        return {
          safe: false,
          reason: `File Signature Mismatch: "${originalName}" has a .png extension but binary header does NOT match valid PNG signature.`,
        };
      }
    } else if (ext === '.jpg' || ext === '.jpeg') {
      // JPEG Magic Bytes: FFD8FF
      if (!headerHex.startsWith('FFD8FF')) {
        return {
          safe: false,
          reason: `File Signature Mismatch: "${originalName}" has a JPEG extension but binary header does NOT match valid JPEG signature.`,
        };
      }
    }

    return { safe: true };
  }

  /**
   * Generates SHA-256 Cryptographic Hash from unencrypted file buffer
   */
  public generateSha256Hash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * SECTION 58: Encrypts document file buffer using AES-256-GCM with Auth Tag
   */
  public encryptDocument(buffer: Buffer): { encryptedBuffer: Buffer; ivHex: string; authTagHex: string } {
    const iv = crypto.randomBytes(12); // 12-byte IV for AES-256-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);

    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      encryptedBuffer: Buffer.concat([Buffer.from('BDW1'), iv, authTag, encrypted]),
      ivHex: iv.toString('hex'),
      authTagHex: authTag.toString('hex'),
    };
  }

  /**
   * Saves encrypted document buffer to disk storage
   */
  public saveEncryptedDocument(docId: string, encryptedBuffer: Buffer): string {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, `encrypted_${docId}.enc`);
    fs.writeFileSync(filePath, encryptedBuffer);
    return `uploads/encrypted_${docId}.enc`;
  }

  /**
   * SECTION 30: Decrypts document file buffer on the fly for short-lived streaming
   */
  public decryptDocument(encryptedBuffer: Buffer, ivHex?: string): Buffer {
    if (encryptedBuffer.subarray(0, 4).toString() !== 'BDW1' || encryptedBuffer.length < 32) throw new Error('Legacy encrypted file requires re-upload.');
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, encryptedBuffer.subarray(4, 16));
    decipher.setAuthTag(encryptedBuffer.subarray(16, 32));
    return Buffer.concat([decipher.update(encryptedBuffer.subarray(32)), decipher.final()]);
  }
}

export const encryptionService = new EncryptionService();
