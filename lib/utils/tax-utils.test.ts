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
	parseDecimal,
	formatCurrency,
	calculatePercentage,
	validateDateRange,
	validateDateNotFuture,
	validateQuarter,
	getQuarterlyDueDate,
	formatQuarterLabel,
} from './tax-utils';

describe('tax-utils', () => {
	describe('parseDecimal', () => {
		it('should parse valid decimal strings', () => {
			expect(parseDecimal('100.50')).toBe(100.5);
			expect(parseDecimal('0')).toBe(0);
			expect(parseDecimal('1000')).toBe(1000);
		});

		it('should handle null and undefined', () => {
			expect(parseDecimal(null)).toBe(0);
			expect(parseDecimal(undefined)).toBe(0);
			expect(parseDecimal('')).toBe(0);
		});

		it('should handle invalid strings', () => {
			expect(parseDecimal('invalid')).toBe(0);
			expect(parseDecimal('abc123')).toBe(0);
		});
	});

	describe('formatCurrency', () => {
		it('should format USD currency correctly', () => {
			const result = formatCurrency(1000.50, 'USD');
			expect(result).toContain('1,000.50');
			expect(result).toContain('$');
		});

		it('should handle zero', () => {
			const result = formatCurrency(0);
			expect(result).toContain('0.00');
		});

		it('should handle negative amounts', () => {
			const result = formatCurrency(-100);
			expect(result).toContain('-');
		});
	});

	describe('calculatePercentage', () => {
		it('should calculate percentage correctly', () => {
			expect(calculatePercentage(25, 100)).toBe(25);
			expect(calculatePercentage(1, 3)).toBe(33.33);
			expect(calculatePercentage(50, 200)).toBe(25);
		});

		it('should handle zero total', () => {
			expect(calculatePercentage(10, 0)).toBe(0);
		});

		it('should respect decimal places', () => {
			expect(calculatePercentage(1, 3, 4)).toBe(33.3333);
		});
	});

	describe('validateDateRange', () => {
		it('should validate valid date range', () => {
			const start = new Date('2025-01-01');
			const end = new Date('2025-12-31');
			expect(() => validateDateRange(start, end)).not.toThrow();
		});

		it('should throw if start date is after end date', () => {
			const start = new Date('2025-12-31');
			const end = new Date('2025-01-01');
			expect(() => validateDateRange(start, end)).toThrow();
		});

		it('should throw if dates are invalid', () => {
			expect(() => validateDateRange(new Date('invalid'), new Date())).toThrow();
		});
	});

	describe('validateDateNotFuture', () => {
		it('should allow past dates', () => {
			const pastDate = new Date('2020-01-01');
			expect(() => validateDateNotFuture(pastDate)).not.toThrow();
		});

		it('should allow today by default', () => {
			const today = new Date();
			expect(() => validateDateNotFuture(today)).not.toThrow();
		});

		it('should throw for future dates', () => {
			const futureDate = new Date();
			futureDate.setFullYear(futureDate.getFullYear() + 1);
			expect(() => validateDateNotFuture(futureDate)).toThrow();
		});
	});

	describe('validateQuarter', () => {
		it('should validate valid quarters', () => {
			expect(() => validateQuarter(1)).not.toThrow();
			expect(() => validateQuarter(2)).not.toThrow();
			expect(() => validateQuarter(3)).not.toThrow();
			expect(() => validateQuarter(4)).not.toThrow();
		});

		it('should throw for invalid quarters', () => {
			expect(() => validateQuarter(0)).toThrow();
			expect(() => validateQuarter(5)).toThrow();
			expect(() => validateQuarter(1.5)).toThrow();
		});
	});

	describe('getQuarterlyDueDate', () => {
		it('should return correct due dates for each quarter', () => {
			const q1 = getQuarterlyDueDate(1, 2025);
			expect(q1.getMonth()).toBe(3); // April (0-indexed)
			expect(q1.getDate()).toBe(15);
			expect(q1.getFullYear()).toBe(2025);

			const q4 = getQuarterlyDueDate(4, 2025);
			expect(q4.getMonth()).toBe(0); // January (0-indexed)
			expect(q4.getDate()).toBe(15);
			expect(q4.getFullYear()).toBe(2026); // Next year
		});
	});

	describe('formatQuarterLabel', () => {
		it('should format quarter labels correctly', () => {
			expect(formatQuarterLabel(1, 2025)).toBe('Q1 2025');
			expect(formatQuarterLabel(4, 2024)).toBe('Q4 2024');
		});
	});
});

