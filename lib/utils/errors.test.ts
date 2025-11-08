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
	TaxServiceError,
	TaxValidationError,
	TaxNotFoundError,
	TaxUnauthorizedError,
	TaxConflictError,
	createErrorResponse,
} from './errors';

describe('Tax Error Classes', () => {
	describe('TaxServiceError', () => {
		it('should create error with code and status', () => {
			const error = new TaxServiceError('Test error', 'TEST_CODE', 400);
			expect(error.message).toBe('Test error');
			expect(error.code).toBe('TEST_CODE');
			expect(error.statusCode).toBe(400);
			expect(error.name).toBe('TaxServiceError');
		});

		it('should include details', () => {
			const details = { field: 'amount', value: -100 };
			const error = new TaxServiceError('Test', 'CODE', 400, details);
			expect(error.details).toEqual(details);
		});
	});

	describe('TaxValidationError', () => {
		it('should create validation error', () => {
			const error = new TaxValidationError('Invalid amount', 'amount');
			expect(error.message).toBe('Invalid amount');
			expect(error.code).toBe('VALIDATION_ERROR');
			expect(error.statusCode).toBe(400);
			expect(error.field).toBe('amount');
		});
	});

	describe('TaxNotFoundError', () => {
		it('should create not found error', () => {
			const error = new TaxNotFoundError('Obligation not found', 'obligation', '123');
			expect(error.message).toBe('Obligation not found');
			expect(error.code).toBe('NOT_FOUND');
			expect(error.statusCode).toBe(404);
			expect(error.entityType).toBe('obligation');
			expect(error.entityId).toBe('123');
		});
	});

	describe('TaxUnauthorizedError', () => {
		it('should create unauthorized error', () => {
			const error = new TaxUnauthorizedError();
			expect(error.code).toBe('UNAUTHORIZED');
			expect(error.statusCode).toBe(403);
		});
	});

	describe('TaxConflictError', () => {
		it('should create conflict error', () => {
			const error = new TaxConflictError('Duplicate obligation', 'duplicate_obligation');
			expect(error.code).toBe('CONFLICT');
			expect(error.statusCode).toBe(409);
			expect(error.conflictType).toBe('duplicate_obligation');
		});
	});

	describe('createErrorResponse', () => {
		it('should create response for TaxServiceError', () => {
			const error = new TaxValidationError('Invalid', 'amount');
			const response = createErrorResponse(error);
			
			expect(response.success).toBe(false);
			expect(response.error.message).toBe('Invalid');
			expect(response.error.code).toBe('VALIDATION_ERROR');
			expect(response.error.statusCode).toBe(400);
		});

		it('should create response for generic Error', () => {
			const error = new Error('Generic error');
			const response = createErrorResponse(error);
			
			expect(response.success).toBe(false);
			expect(response.error.message).toBe('Generic error');
			expect(response.error.code).toBe('INTERNAL_ERROR');
			expect(response.error.statusCode).toBe(500);
		});
	});
});

