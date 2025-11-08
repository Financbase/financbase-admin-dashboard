/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect } from 'vitest';
import {
	validateFileSize,
	validateMimeType,
	validateFileExtension,
	validateFile,
	getFileExtension,
	getMimeTypeFromExtension,
} from './file-validation';

describe('file-validation', () => {
	describe('validateFileSize', () => {
		it('should validate file size within limit', () => {
			const result = validateFileSize(5 * 1024 * 1024); // 5MB
			expect(result.valid).toBe(true);
		});

		it('should reject files exceeding limit', () => {
			const result = validateFileSize(15 * 1024 * 1024); // 15MB
			expect(result.valid).toBe(false);
			expect(result.error).toContain('exceeds maximum');
		});

		it('should reject zero or negative sizes', () => {
			expect(validateFileSize(0).valid).toBe(false);
			expect(validateFileSize(-1).valid).toBe(false);
		});
	});

	describe('validateMimeType', () => {
		it('should validate allowed MIME types', () => {
			expect(validateMimeType('application/pdf').valid).toBe(true);
			expect(validateMimeType('image/jpeg').valid).toBe(true);
			expect(validateMimeType('image/png').valid).toBe(true);
		});

		it('should reject disallowed MIME types', () => {
			const result = validateMimeType('application/zip');
			expect(result.valid).toBe(false);
			expect(result.error).toContain('not allowed');
		});
	});

	describe('validateFileExtension', () => {
		it('should validate allowed extensions', () => {
			expect(validateFileExtension('document.pdf').valid).toBe(true);
			expect(validateFileExtension('image.jpg').valid).toBe(true);
			expect(validateFileExtension('photo.PNG').valid).toBe(true); // Case insensitive
		});

		it('should reject disallowed extensions', () => {
			const result = validateFileExtension('file.exe');
			expect(result.valid).toBe(false);
			expect(result.error).toContain('not allowed');
		});
	});

	describe('validateFile', () => {
		it('should validate complete file', () => {
			const file = {
				size: 5 * 1024 * 1024,
				type: 'application/pdf',
				name: 'document.pdf',
			};
			expect(validateFile(file).valid).toBe(true);
		});

		it('should reject file with invalid size', () => {
			const file = {
				size: 15 * 1024 * 1024,
				type: 'application/pdf',
				name: 'document.pdf',
			};
			expect(validateFile(file).valid).toBe(false);
		});

		it('should reject file with invalid MIME type', () => {
			const file = {
				size: 5 * 1024 * 1024,
				type: 'application/zip',
				name: 'document.pdf',
			};
			expect(validateFile(file).valid).toBe(false);
		});
	});

	describe('getFileExtension', () => {
		it('should extract file extension', () => {
			expect(getFileExtension('document.pdf')).toBe('.pdf');
			expect(getFileExtension('image.jpg')).toBe('.jpg');
			expect(getFileExtension('file.name.png')).toBe('.png');
		});
	});

	describe('getMimeTypeFromExtension', () => {
		it('should return MIME type for known extensions', () => {
			expect(getMimeTypeFromExtension('.pdf')).toBe('application/pdf');
			expect(getMimeTypeFromExtension('.jpg')).toBe('image/jpeg');
			expect(getMimeTypeFromExtension('.PNG')).toBe('image/png'); // Case insensitive
		});

		it('should return null for unknown extensions', () => {
			expect(getMimeTypeFromExtension('.exe')).toBeNull();
		});
	});
});

