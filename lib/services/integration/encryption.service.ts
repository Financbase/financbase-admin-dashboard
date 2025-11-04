/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import crypto from "node:crypto";
import { Landmark, Shield, XCircle } from "lucide-react";

/**
 * Encryption Service
 *
 * Provides AES-256 encryption for sensitive data like bank credentials
 * and financial information to ensure data security and compliance.
 */

export class EncryptionService {
	private static readonly ALGORITHM = "aes-256-gcm";
	private static readonly KEY_LENGTH = 32; // 256 bits
	private static readonly IV_LENGTH = 16; // 128 bits

	/**
	 * Encrypt sensitive data using AES-256-GCM
	 */
	static async encrypt(data: string, key: string): Promise<string> {
		if (!data || !key) {
			throw new Error("Data and key are required for encryption");
		}

		if (key.length !== EncryptionService.KEY_LENGTH * 2) {
			// hex string length
			throw new Error(
				`Key must be ${EncryptionService.KEY_LENGTH * 2} characters long (hex string)`,
			);
		}

		try {
			const keyBuffer = Buffer.from(key, "hex");
			const iv = crypto.randomBytes(EncryptionService.IV_LENGTH);
			const cipher = crypto.createCipherGCM(
				EncryptionService.ALGORITHM,
				keyBuffer,
				iv,
			);
			cipher.setAAD(Buffer.from("financbase-banking", "utf8"));

			let encrypted = cipher.update(data, "utf8", "hex");
			encrypted += cipher.final("hex");

			const tag = cipher.getAuthTag();

			// Combine IV, tag, and encrypted data
			const combined = `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;

			return Buffer.from(combined).toString("base64");
		} catch (error) {
			console.error("Encryption failed:", error);
			throw new Error("Failed to encrypt data");
		}
	}

	/**
	 * Decrypt sensitive data using AES-256-GCM
	 */
	static async decrypt(encryptedData: string, key: string): Promise<string> {
		if (!encryptedData || !key) {
			throw new Error("Encrypted data and key are required for decryption");
		}

		if (key.length !== EncryptionService.KEY_LENGTH * 2) {
			// hex string length
			throw new Error(
				`Key must be ${EncryptionService.KEY_LENGTH * 2} characters long (hex string)`,
			);
		}

		try {
			const combined = Buffer.from(encryptedData, "base64").toString("hex");
			const parts = combined.split(":");

			if (parts.length !== 3) {
				throw new Error("Invalid encrypted data format");
			}

			const keyBuffer = Buffer.from(key, "hex");
			const iv = Buffer.from(parts[0], "hex");
			const tag = Buffer.from(parts[1], "hex");
			const encrypted = parts[2];

			const decipher = crypto.createDecipherGCM(
				EncryptionService.ALGORITHM,
				keyBuffer,
				iv,
			);
			decipher.setAAD(Buffer.from("financbase-banking", "utf8"));
			decipher.setAuthTag(tag);

			let decrypted = decipher.update(encrypted, "hex", "utf8");
			decrypted += decipher.final("utf8");

			return decrypted;
		} catch (error) {
			console.error("Decryption failed:", error);
			throw new Error("Failed to decrypt data");
		}
	}

	/**
	 * Generate a secure encryption key
	 */
	static async generateKey(): Promise<string> {
		return crypto.randomBytes(EncryptionService.KEY_LENGTH).toString("hex");
	}

	/**
	 * Validate encryption key format
	 */
	static validateKey(key: string): boolean {
		try {
			return (
				key &&
				key.length === EncryptionService.KEY_LENGTH * 2 &&
				/^[0-9a-fA-F]+$/.test(key)
			);
		} catch {
			return false;
		}
	}

	/**
	 * Hash data using SHA-256 (for non-reversible operations)
	 */
	static hash(data: string): string {
		return crypto.createHash("sha256").update(data).digest("hex");
	}

	/**
	 * Generate a secure random string
	 */
	static generateRandomString(length = 32): string {
		return crypto.randomBytes(length).toString("hex");
	}

	/**
	 * Create HMAC for data integrity verification
	 */
	static createHMAC(data: string, secret: string): string {
		return crypto.createHmac("sha256", secret).update(data).digest("hex");
	}

	/**
	 * Verify HMAC for data integrity
	 */
	static verifyHMAC(data: string, secret: string, hmac: string): boolean {
		const expectedHmac = EncryptionService.createHMAC(data, secret);
		return crypto.timingSafeEqual(
			Buffer.from(hmac, "hex"),
			Buffer.from(expectedHmac, "hex"),
		);
	}
}
