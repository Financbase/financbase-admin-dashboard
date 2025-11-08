/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

/**
 * Parse decimal string to number
 * Safely converts decimal strings to numbers, handling null/undefined
 */
export function parseDecimal(value: string | null | undefined): number {
	if (value === null || value === undefined || value === '') {
		return 0;
	}
	const parsed = Number.parseFloat(value);
	return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Format number as currency string
 * @param amount - Amount to format
 * @param currency - Currency code (default: 'USD')
 * @param locale - Locale string (default: 'en-US')
 */
export function formatCurrency(
	amount: number,
	currency: string = 'USD',
	locale: string = 'en-US'
): string {
	return new Intl.NumberFormat(locale, {
		style: 'currency',
		currency,
	}).format(amount);
}

/**
 * Calculate percentage
 * @param part - Part value
 * @param total - Total value
 * @param decimals - Number of decimal places (default: 2)
 */
export function calculatePercentage(
	part: number,
	total: number,
	decimals: number = 2
): number {
	if (total === 0) {
		return 0;
	}
	const percentage = (part / total) * 100;
	return Number.parseFloat(percentage.toFixed(decimals));
}

/**
 * Validate date range
 * @param startDate - Start date
 * @param endDate - End date
 * @throws Error if dates are invalid
 */
export function validateDateRange(startDate: Date, endDate: Date): void {
	if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
		throw new Error('Invalid date objects provided');
	}

	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
		throw new Error('Invalid date values');
	}

	if (startDate > endDate) {
		throw new Error('Start date must be before or equal to end date');
	}
}

/**
 * Validate date is not in the future
 * @param date - Date to validate
 * @param allowToday - Whether to allow today's date (default: true)
 * @throws Error if date is in the future
 */
export function validateDateNotFuture(date: Date, allowToday: boolean = true): void {
	if (!(date instanceof Date)) {
		throw new Error('Invalid date object provided');
	}

	if (Number.isNaN(date.getTime())) {
		throw new Error('Invalid date value');
	}

	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

	if (allowToday) {
		if (dateOnly > today) {
			throw new Error('Date cannot be in the future');
		}
	} else {
		if (dateOnly >= today) {
			throw new Error('Date must be in the past');
		}
	}
}

/**
 * Validate quarter number
 * @param quarter - Quarter number (1-4)
 * @throws Error if quarter is invalid
 */
export function validateQuarter(quarter: number): void {
	if (!Number.isInteger(quarter) || quarter < 1 || quarter > 4) {
		throw new Error('Quarter must be an integer between 1 and 4');
	}
}

/**
 * Get quarter due date
 * @param quarter - Quarter number (1-4)
 * @param year - Year
 * @returns Due date for the quarter
 */
export function getQuarterlyDueDate(quarter: number, year: number): Date {
	validateQuarter(quarter);
	
	// Quarterly estimated tax due dates:
	// Q1: April 15
	// Q2: June 15
	// Q3: September 15
	// Q4: January 15 (next year)
	const dueDates: Record<number, { month: number; day: number; nextYear?: boolean }> = {
		1: { month: 3, day: 15 }, // April (0-indexed: 3)
		2: { month: 5, day: 15 }, // June (0-indexed: 5)
		3: { month: 8, day: 15 }, // September (0-indexed: 8)
		4: { month: 0, day: 15, nextYear: true }, // January next year (0-indexed: 0)
	};

	const dueDateInfo = dueDates[quarter];
	const dueYear = dueDateInfo.nextYear ? year + 1 : year;
	
	return new Date(dueYear, dueDateInfo.month, dueDateInfo.day);
}

/**
 * Format quarter label
 * @param quarter - Quarter number (1-4)
 * @param year - Year
 */
export function formatQuarterLabel(quarter: number, year: number): string {
	validateQuarter(quarter);
	return `Q${quarter} ${year}`;
}

