/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

/**
 * Tax-related constants
 */

// Default tax rates
export const DEFAULT_FREELANCE_TAX_RATE = 0.25; // 25% default for freelancers
export const QUARTERLY_PAYMENT_DIVISOR = 4;

// Cache TTL values (in seconds)
export const CACHE_TTL = {
	TAX_SUMMARY: 300, // 5 minutes
	TAX_DEDUCTIONS: 300, // 5 minutes
	TAX_DOCUMENTS: 300, // 5 minutes
	TAX_OBLIGATIONS: 120, // 2 minutes
	TAX_ALERTS: 120, // 2 minutes
	TAX_LIABILITY: 600, // 10 minutes
	QUARTERLY_ESTIMATES: 900, // 15 minutes
} as const;

// Pagination defaults
export const PAGINATION = {
	DEFAULT_LIMIT: 50,
	MAX_LIMIT: 100,
	DEFAULT_PAGE: 1,
} as const;

// File upload limits
export const FILE_UPLOAD = {
	MAX_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
	MAX_SIZE_MB: 10,
	ALLOWED_MIME_TYPES: [
		'application/pdf',
		'image/jpeg',
		'image/jpg',
		'image/png',
		'image/gif',
	],
	ALLOWED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.gif'],
} as const;

// Rate limiting
export const RATE_LIMIT = {
	TAX_CALCULATION: {
		REQUESTS: 100,
		WINDOW_MS: 60 * 1000, // 1 minute
	},
	TAX_PAYMENT: {
		REQUESTS: 100,
		WINDOW_MS: 60 * 1000, // 1 minute
	},
} as const;

// Tax alert thresholds
export const TAX_ALERTS = {
	UPCOMING_DAYS: 45, // Days before due date to show warning
} as const;

