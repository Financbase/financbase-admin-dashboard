/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

/**
 * Base error class for tax service errors
 */
export class TaxServiceError extends Error {
	constructor(
		message: string,
		public code: string,
		public statusCode: number = 500,
		public details?: Record<string, unknown>
	) {
		super(message);
		this.name = 'TaxServiceError';
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Validation error for tax operations
 */
export class TaxValidationError extends TaxServiceError {
	constructor(
		message: string,
		public field?: string,
		details?: Record<string, unknown>
	) {
		super(message, 'VALIDATION_ERROR', 400, { field, ...details });
		this.name = 'TaxValidationError';
	}
}

/**
 * Not found error for tax entities
 */
export class TaxNotFoundError extends TaxServiceError {
	constructor(
		message: string,
		public entityType: string,
		public entityId?: string
	) {
		super(message, 'NOT_FOUND', 404, { entityType, entityId });
		this.name = 'TaxNotFoundError';
	}
}

/**
 * Unauthorized error for tax operations
 */
export class TaxUnauthorizedError extends TaxServiceError {
	constructor(message: string = 'Unauthorized access to tax resource') {
		super(message, 'UNAUTHORIZED', 403);
		this.name = 'TaxUnauthorizedError';
	}
}

/**
 * Conflict error for tax operations (e.g., duplicate quarterly obligation)
 */
export class TaxConflictError extends TaxServiceError {
	constructor(
		message: string,
		public conflictType: string,
		details?: Record<string, unknown>
	) {
		super(message, 'CONFLICT', 409, { conflictType, ...details });
		this.name = 'TaxConflictError';
	}
}

/**
 * Create structured error response
 */
export function createErrorResponse(
	error: Error | TaxServiceError
): {
	success: false;
	error: {
		message: string;
		code: string;
		statusCode: number;
		details?: Record<string, unknown>;
	};
} {
	if (error instanceof TaxServiceError) {
		return {
			success: false,
			error: {
				message: error.message,
				code: error.code,
				statusCode: error.statusCode,
				details: error.details,
			},
		};
	}

	// Generic error
	return {
		success: false,
		error: {
			message: error.message || 'An unexpected error occurred',
			code: 'INTERNAL_ERROR',
			statusCode: 500,
		},
	};
}

