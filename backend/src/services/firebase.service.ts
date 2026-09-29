import dotenv from 'dotenv';
import path from 'path';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';

// Ensure .env is loaded before service instantiation
dotenv.config({ path: path.join(process.cwd(), '.env') });

export class FirebaseService {
  private isInitialized = false;

  constructor() {
    this.initFirebase();
  }

  private initFirebase() {
    try {
      const serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT;

      if (!serviceAccountStr) {
        console.warn('⚠️ [FIREBASE SERVICE] FIREBASE_SERVICE_ACCOUNT not configured in .env');
        return;
      }

      const serviceAccount = JSON.parse(serviceAccountStr);

      // Convert escaped \n newlines in RSA private key string
      if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }

      if (!getApps().length) {
        initializeApp({
          credential: cert(serviceAccount),
        });
        this.isInitialized = true;
        console.log(`🔥 [FIREBASE SERVICE] Initialized Firebase Admin SDK for project: ${serviceAccount.project_id}`);
      } else {
        this.isInitialized = true;
      }
    } catch (error: any) {
      console.warn(`⚠️ [FIREBASE SERVICE WARNING] Could not initialize Firebase Admin SDK:`, error.message);
    }
  }

  /**
   * Sends real-time Firebase FCM Push Notification
   */
  public async sendPushNotification(
    fcmTokenOrTopic: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        this.initFirebase();
      }

      if (!this.isInitialized) {
        console.warn('⚠️ [FIREBASE SERVICE] Firebase Admin SDK is not initialized.');
        return false;
      }

      const androidConfig = {
        priority: 'high' as const,
        notification: {
          title,
          body,
          sound: 'default',
          channelId: 'high_priority_notifications',
          priority: 'high' as const,
          defaultSound: true,
          defaultVibrateTimings: true,
          visibility: 'public' as const,
        },
      };

      const message: Message = fcmTokenOrTopic.startsWith('/topics/') || !fcmTokenOrTopic.startsWith('fcm_')
        ? {
            topic: 'all_users',
            notification: { title, body },
            data: data || {},
            android: androidConfig,
          }
        : {
            token: fcmTokenOrTopic,
            notification: { title, body },
            data: data || {},
            android: androidConfig,
          };

      const response = await getMessaging().send(message);

      console.log('====================================================');
      console.log(`🔥 [FIREBASE PUSH NOTIFICATION SENT] Title: "${title}"`);
      console.log(`📲 Message ID: ${response}`);
      console.log('====================================================');

      return true;
    } catch (error: any) {
      console.warn(`⚠️ [FIREBASE PUSH WARNING] Failed to send push notification:`, error.message);
      return false;
    }
  }
}

export const firebaseService = new FirebaseService();
