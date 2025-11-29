/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect } from 'vitest'
import {
  parseDecimal,
  formatCurrency,
  calculatePercentage,
  validateDateRange,
  validateDateNotFuture,
  validateQuarter,
  getQuarterlyDueDate,
  formatQuarterLabel,
} from '@/lib/utils/tax-utils'

describe('tax-utils', () => {
  describe('parseDecimal', () => {
    it('should parse valid decimal string', () => {
      expect(parseDecimal('123.45')).toBe(123.45)
    })

    it('should parse integer string', () => {
      expect(parseDecimal('123')).toBe(123)
    })

    it('should return 0 for null', () => {
      expect(parseDecimal(null)).toBe(0)
    })

    it('should return 0 for undefined', () => {
      expect(parseDecimal(undefined)).toBe(0)
    })

    it('should return 0 for empty string', () => {
      expect(parseDecimal('')).toBe(0)
    })

    it('should return 0 for invalid string', () => {
      expect(parseDecimal('invalid')).toBe(0)
    })
  })

  describe('formatCurrency', () => {
    it('should format currency with default options', () => {
      const result = formatCurrency(1234.56)

      expect(result).toContain('$')
      expect(result).toContain('1,234.56')
    })

    it('should format currency with custom currency', () => {
      const result = formatCurrency(1234.56, 'EUR', 'de-DE')

      expect(result).toContain('€')
    })

    it('should format zero amount', () => {
      const result = formatCurrency(0)

      expect(result).toContain('$')
      expect(result).toContain('0')
    })
  })

  describe('calculatePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(calculatePercentage(25, 100)).toBe(25)
    })

    it('should calculate percentage with decimals', () => {
      expect(calculatePercentage(33.33, 100, 2)).toBe(33.33)
    })

    it('should return 0 for zero total', () => {
      expect(calculatePercentage(25, 0)).toBe(0)
    })

    it('should handle negative values', () => {
      expect(calculatePercentage(-25, 100)).toBe(-25)
    })
  })

  describe('validateDateRange', () => {
    it('should validate valid date range', () => {
      const start = new Date('2025-01-01')
      const end = new Date('2025-01-31')

      expect(() => validateDateRange(start, end)).not.toThrow()
    })

    it('should throw error for invalid date objects', () => {
      expect(() => validateDateRange(null as any, new Date())).toThrow('Invalid date objects')
    })

    it('should throw error for NaN dates', () => {
      const invalidDate = new Date('invalid')
      const validDate = new Date('2025-01-01')

      expect(() => validateDateRange(invalidDate, validDate)).toThrow('Invalid date values')
    })

    it('should throw error when start date is after end date', () => {
      const start = new Date('2025-01-31')
      const end = new Date('2025-01-01')

      expect(() => validateDateRange(start, end)).toThrow('Start date must be before or equal')
    })

    it('should allow equal dates', () => {
      const date = new Date('2025-01-15')

      expect(() => validateDateRange(date, date)).not.toThrow()
    })
  })

  describe('validateDateNotFuture', () => {
    it('should validate past date', () => {
      const pastDate = new Date('2020-01-01')

      expect(() => validateDateNotFuture(pastDate)).not.toThrow()
    })

    it('should allow today when allowToday is true', () => {
      const today = new Date()

      expect(() => validateDateNotFuture(today, true)).not.toThrow()
    })

    it('should throw error for future date', () => {
      const futureDate = new Date('2030-01-01')

      expect(() => validateDateNotFuture(futureDate)).toThrow('Date cannot be in the future')
    })

    it('should throw error for today when allowToday is false', () => {
      const today = new Date()

      expect(() => validateDateNotFuture(today, false)).toThrow('Date must be in the past')
    })

    it('should throw error for invalid date object', () => {
      expect(() => validateDateNotFuture(null as any)).toThrow('Invalid date object')
    })
  })

  describe('validateQuarter', () => {
    it('should validate valid quarters', () => {
      expect(() => validateQuarter(1)).not.toThrow()
      expect(() => validateQuarter(2)).not.toThrow()
      expect(() => validateQuarter(3)).not.toThrow()
      expect(() => validateQuarter(4)).not.toThrow()
    })

    it('should throw error for invalid quarter numbers', () => {
      expect(() => validateQuarter(0)).toThrow('Quarter must be an integer between 1 and 4')
      expect(() => validateQuarter(5)).toThrow('Quarter must be an integer between 1 and 4')
      expect(() => validateQuarter(1.5)).toThrow('Quarter must be an integer between 1 and 4')
    })
  })

  describe('getQuarterlyDueDate', () => {
    it('should return correct due date for Q1', () => {
      const result = getQuarterlyDueDate(1, 2025)

      expect(result.getMonth()).toBe(3) // April (0-indexed)
      expect(result.getDate()).toBe(15)
      expect(result.getFullYear()).toBe(2025)
    })

    it('should return correct due date for Q2', () => {
      const result = getQuarterlyDueDate(2, 2025)

      expect(result.getMonth()).toBe(5) // June (0-indexed)
      expect(result.getDate()).toBe(15)
      expect(result.getFullYear()).toBe(2025)
    })

    it('should return correct due date for Q3', () => {
      const result = getQuarterlyDueDate(3, 2025)

      expect(result.getMonth()).toBe(8) // September (0-indexed)
      expect(result.getDate()).toBe(15)
      expect(result.getFullYear()).toBe(2025)
    })

    it('should return correct due date for Q4 (next year)', () => {
      const result = getQuarterlyDueDate(4, 2025)

      expect(result.getMonth()).toBe(0) // January (0-indexed)
      expect(result.getDate()).toBe(15)
      expect(result.getFullYear()).toBe(2026) // Next year
    })

    it('should throw error for invalid quarter', () => {
      expect(() => getQuarterlyDueDate(5, 2025)).toThrow()
    })
  })

  describe('formatQuarterLabel', () => {
    it('should format quarter label correctly', () => {
      expect(formatQuarterLabel(1, 2025)).toBe('Q1 2025')
      expect(formatQuarterLabel(2, 2025)).toBe('Q2 2025')
      expect(formatQuarterLabel(3, 2025)).toBe('Q3 2025')
      expect(formatQuarterLabel(4, 2025)).toBe('Q4 2025')
    })

    it('should throw error for invalid quarter', () => {
      expect(() => formatQuarterLabel(5, 2025)).toThrow()
    })
  })
})

