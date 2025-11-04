/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { db } from '@/lib/db';
import { mfaSettings, auditLogs } from '@/lib/db/schemas';
import { eq, and } from 'drizzle-orm';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

export interface MFASetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MFAVerification {
  isValid: boolean;
  isBackupCode: boolean;
  remainingAttempts?: number;
}

export class MFAService {
  /**
   * Setup MFA for a user
   */
  static async setupMFA(
    userId: string,
    mfaType: 'totp' | 'sms' | 'email' = 'totp',
    phoneNumber?: string
  ): Promise<MFASetup> {
    try {
      // Check if MFA is already enabled
      const existingMFA = await db
        .select()
        .from(mfaSettings)
        .where(and(
          eq(mfaSettings.userId, userId),
          eq(mfaSettings.isEnabled, true)
        ))
        .limit(1);

      if (existingMFA.length > 0) {
        throw new Error('MFA is already enabled for this user');
      }

      // Generate secret key for TOTP
      const secret = authenticator.generateSecret();
      
      // Generate backup codes
      const backupCodes = this.generateBackupCodes();
      
      // Create MFA settings
      await db.insert(mfaSettings).values({
        userId,
        mfaType,
        secretKey: this.encryptSecret(secret),
        backupCodes,
        phoneNumber: phoneNumber || null,
        isEnabled: false, // Will be enabled after verification
      });

      // Generate QR code URL
      const qrCodeUrl = await this.generateQRCode(userId, secret);

      // Log MFA setup attempt
      await this.logSecurityEvent(userId, 'mfa_setup_initiated', {
        mfaType,
        hasPhoneNumber: !!phoneNumber,
      });

      return {
        secret,
        qrCodeUrl,
        backupCodes,
      };
    } catch (error) {
      console.error('Error setting up MFA:', error);
      throw new Error('Failed to setup MFA');
    }
  }

  /**
   * Verify MFA setup
   */
  static async verifyMFASetup(
    userId: string,
    token: string
  ): Promise<MFAVerification> {
    try {
      const mfaSettings = await this.getMFASettings(userId);
      if (!mfaSettings) {
        throw new Error('MFA not configured');
      }

      const secret = this.decryptSecret(mfaSettings.secretKey);
      const isValid = authenticator.verify({
        token,
        secret,
        window: 2, // Allow 2 time windows for clock drift
      });

      if (isValid) {
        // Enable MFA
        await db
          .update(mfaSettings)
          .set({
            isEnabled: true,
            lastUsed: new Date(),
          })
          .where(eq(mfaSettings.userId, userId));

        // Log successful MFA setup
        await this.logSecurityEvent(userId, 'mfa_setup_completed', {
          mfaType: mfaSettings.mfaType,
        });
      } else {
        // Log failed verification
        await this.logSecurityEvent(userId, 'mfa_verification_failed', {
          mfaType: mfaSettings.mfaType,
          reason: 'invalid_token',
        });
      }

      return {
        isValid,
        isBackupCode: false,
      };
    } catch (error) {
      console.error('Error verifying MFA setup:', error);
      throw new Error('Failed to verify MFA setup');
    }
  }

  /**
   * Verify MFA token
   */
  static async verifyMFA(
    userId: string,
    token: string
  ): Promise<MFAVerification> {
    try {
      const mfaSettings = await this.getMFASettings(userId);
      if (!mfaSettings || !mfaSettings.isEnabled) {
        throw new Error('MFA not enabled');
      }

      // Check if MFA is locked
      if (mfaSettings.isLocked && mfaSettings.lockedUntil && new Date() < mfaSettings.lockedUntil) {
        throw new Error('MFA is temporarily locked');
      }

      let isValid = false;
      let isBackupCode = false;

      // Check if it's a backup code
      if (mfaSettings.backupCodes.includes(token)) {
        isValid = true;
        isBackupCode = true;
        
        // Remove used backup code
        const updatedBackupCodes = mfaSettings.backupCodes.filter(code => code !== token);
        await db
          .update(mfaSettings)
          .set({
            backupCodes: updatedBackupCodes,
            lastUsed: new Date(),
          })
          .where(eq(mfaSettings.userId, userId));
      } else {
        // Verify TOTP token
        const secret = this.decryptSecret(mfaSettings.secretKey);
        isValid = authenticator.verify({
          token,
          secret,
          window: 2,
        });
      }

      if (isValid) {
        // Reset failed attempts
        await db
          .update(mfaSettings)
          .set({
            failedAttempts: 0,
            isLocked: false,
            lockedUntil: null,
            lastUsed: new Date(),
          })
          .where(eq(mfaSettings.userId, userId));

        // Log successful verification
        await this.logSecurityEvent(userId, 'mfa_verification_success', {
          mfaType: mfaSettings.mfaType,
          isBackupCode,
        });
      } else {
        // Increment failed attempts
        const newFailedAttempts = mfaSettings.failedAttempts + 1;
        const shouldLock = newFailedAttempts >= 5;
        
        await db
          .update(mfaSettings)
          .set({
            failedAttempts: newFailedAttempts,
            isLocked: shouldLock,
            lockedUntil: shouldLock ? new Date(Date.now() + 30 * 60 * 1000) : null, // Lock for 30 minutes
          })
          .where(eq(mfaSettings.userId, userId));

        // Log failed verification
        await this.logSecurityEvent(userId, 'mfa_verification_failed', {
          mfaType: mfaSettings.mfaType,
          failedAttempts: newFailedAttempts,
          isLocked: shouldLock,
        });

        return {
          isValid: false,
          isBackupCode: false,
          remainingAttempts: Math.max(0, 5 - newFailedAttempts),
        };
      }

      return {
        isValid,
        isBackupCode,
      };
    } catch (error) {
      console.error('Error verifying MFA:', error);
      throw new Error('Failed to verify MFA');
    }
  }

  /**
   * Disable MFA for a user
   */
  static async disableMFA(userId: string, password: string): Promise<void> {
    try {
      // Verify password before disabling MFA
      // In a real implementation, you'd verify the user's password here
      
      await db
        .update(mfaSettings)
        .set({
          isEnabled: false,
          secretKey: null,
          backupCodes: [],
          phoneNumber: null,
        })
        .where(eq(mfaSettings.userId, userId));

      // Log MFA disable
      await this.logSecurityEvent(userId, 'mfa_disabled', {
        reason: 'user_request',
      });
    } catch (error) {
      console.error('Error disabling MFA:', error);
      throw new Error('Failed to disable MFA');
    }
  }

  /**
   * Generate new backup codes
   */
  static async generateNewBackupCodes(userId: string): Promise<string[]> {
    try {
      const newBackupCodes = this.generateBackupCodes();
      
      await db
        .update(mfaSettings)
        .set({
          backupCodes: newBackupCodes,
        })
        .where(eq(mfaSettings.userId, userId));

      // Log backup codes regeneration
      await this.logSecurityEvent(userId, 'mfa_backup_codes_regenerated', {});

      return newBackupCodes;
    } catch (error) {
      console.error('Error generating backup codes:', error);
      throw new Error('Failed to generate backup codes');
    }
  }

  /**
   * Get MFA settings for a user
   */
  static async getMFASettings(userId: string): Promise<any> {
    try {
      const settings = await db
        .select()
        .from(mfaSettings)
        .where(eq(mfaSettings.userId, userId))
        .limit(1);

      return settings[0] || null;
    } catch (error) {
      console.error('Error fetching MFA settings:', error);
      throw new Error('Failed to fetch MFA settings');
    }
  }

  /**
   * Check if MFA is required for a user
   */
  static async isMFARequired(userId: string): Promise<boolean> {
    try {
      const settings = await this.getMFASettings(userId);
      return settings?.isRequired || false;
    } catch (error) {
      console.error('Error checking MFA requirement:', error);
      return false;
    }
  }

  /**
   * Generate backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  /**
   * Generate QR code for TOTP setup
   */
  private static async generateQRCode(userId: string, secret: string): Promise<string> {
    try {
      const appName = 'Financbase';
      const accountName = userId;
      const otpUrl = authenticator.keyuri(accountName, appName, secret);
      
      return await QRCode.toDataURL(otpUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Encrypt secret key
   */
  private static encryptSecret(secret: string): string {
    // In a real implementation, use proper encryption
    // For now, just base64 encode (NOT SECURE for production)
    return Buffer.from(secret).toString('base64');
  }

  /**
   * Decrypt secret key
   */
  private static decryptSecret(encryptedSecret: string): string {
    // In a real implementation, use proper decryption
    // For now, just base64 decode (NOT SECURE for production)
    return Buffer.from(encryptedSecret, 'base64').toString();
  }

  /**
   * Log security event
   */
  private static async logSecurityEvent(
    userId: string,
    eventType: string,
    eventData: Record<string, any>
  ): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        userId,
        eventType,
        eventCategory: 'security',
        eventAction: eventType,
        eventDescription: `MFA ${eventType}`,
        eventData,
        riskLevel: 'medium',
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error logging security event:', error);
      // Don't throw error for logging failures
    }
  }
}
