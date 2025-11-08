/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { FILE_UPLOAD } from '@/lib/constants/tax-constants';

export interface FileValidationResult {
	valid: boolean;
	error?: string;
}

/**
 * Validate file size
 */
export function validateFileSize(size: number): FileValidationResult {
	if (size > FILE_UPLOAD.MAX_SIZE_BYTES) {
		return {
			valid: false,
			error: `File size exceeds maximum allowed size of ${FILE_UPLOAD.MAX_SIZE_MB}MB`,
		};
	}

	if (size <= 0) {
		return {
			valid: false,
			error: 'File size must be greater than 0',
		};
	}

	return { valid: true };
}

/**
 * Validate MIME type
 */
export function validateMimeType(mimeType: string): FileValidationResult {
	if (!FILE_UPLOAD.ALLOWED_MIME_TYPES.includes(mimeType)) {
		return {
			valid: false,
			error: `MIME type ${mimeType} is not allowed. Allowed types: ${FILE_UPLOAD.ALLOWED_MIME_TYPES.join(', ')}`,
		};
	}

	return { valid: true };
}

/**
 * Validate file extension
 */
export function validateFileExtension(filename: string): FileValidationResult {
	const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
	
	if (!FILE_UPLOAD.ALLOWED_EXTENSIONS.includes(extension)) {
		return {
			valid: false,
			error: `File extension ${extension} is not allowed. Allowed extensions: ${FILE_UPLOAD.ALLOWED_EXTENSIONS.join(', ')}`,
		};
	}

	return { valid: true };
}

/**
 * Validate file (size, MIME type, and extension)
 */
export function validateFile(
	file: {
		size: number;
		type: string;
		name: string;
	}
): FileValidationResult {
	// Validate size
	const sizeValidation = validateFileSize(file.size);
	if (!sizeValidation.valid) {
		return sizeValidation;
	}

	// Validate MIME type
	const mimeValidation = validateMimeType(file.type);
	if (!mimeValidation.valid) {
		return mimeValidation;
	}

	// Validate extension
	const extensionValidation = validateFileExtension(file.name);
	if (!extensionValidation.valid) {
		return extensionValidation;
	}

	return { valid: true };
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
	return filename.toLowerCase().substring(filename.lastIndexOf('.'));
}

/**
 * Get MIME type from file extension
 */
export function getMimeTypeFromExtension(extension: string): string | null {
	const mimeMap: Record<string, string> = {
		'.pdf': 'application/pdf',
		'.jpg': 'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.png': 'image/png',
		'.gif': 'image/gif',
	};

	return mimeMap[extension.toLowerCase()] || null;
}

