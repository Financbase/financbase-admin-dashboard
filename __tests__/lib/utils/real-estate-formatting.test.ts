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
  formatCurrency,
  formatCurrencyCompact,
  formatPercentage,
  formatSquareFootage,
  formatDate,
  formatDateRange,
  formatRelativeTime,
  formatAddress,
  formatPropertyType,
  formatStatus,
  formatNumber,
  formatPricePerSqFt,
  formatOccupancyRate,
  formatROI,
  formatCashFlow,
} from '@/lib/utils/real-estate-formatting'

describe('real-estate-formatting', () => {
  describe('formatCurrency', () => {
    it('should format currency with default options', () => {
      const result = formatCurrency(1234.56)

      expect(result).toContain('$')
      // Default rounds to nearest dollar, so 1234.56 becomes $1,235
      expect(result.replace(/[^0-9]/g, '')).toContain('1235')
    })

    it('should format currency with custom options', () => {
      const result = formatCurrency(1234.56, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        currency: 'USD',
      })

      expect(result).toContain('$')
      expect(result).toContain('1,234.56')
    })

    it('should format zero amount', () => {
      const result = formatCurrency(0)

      expect(result).toContain('$')
      expect(result).toContain('0')
    })

    it('should format negative amounts', () => {
      const result = formatCurrency(-1234.56)

      expect(result).toContain('-')
    })
  })

  describe('formatCurrencyCompact', () => {
    it('should format billions with B suffix', () => {
      const result = formatCurrencyCompact(1500000000)

      expect(result).toBe('$1.5B')
    })

    it('should format millions with M suffix', () => {
      const result = formatCurrencyCompact(2500000)

      expect(result).toBe('$2.5M')
    })

    it('should format thousands with K suffix', () => {
      const result = formatCurrencyCompact(5000)

      expect(result).toBe('$5.0K')
    })

    it('should format small amounts normally', () => {
      const result = formatCurrencyCompact(500)

      expect(result).toContain('$')
      expect(result).toContain('500')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentage with default decimals', () => {
      const result = formatPercentage(75.5)

      expect(result).toBe('75.5%')
    })

    it('should format percentage with custom decimals', () => {
      const result = formatPercentage(75.555, 2)

      expect(result).toBe('75.56%')
    })

    it('should format zero percentage', () => {
      const result = formatPercentage(0)

      expect(result).toBe('0.0%')
    })
  })

  describe('formatSquareFootage', () => {
    it('should format square footage with commas', () => {
      const result = formatSquareFootage(1500)

      expect(result).toBe('1,500 sq ft')
    })

    it('should format large square footage', () => {
      const result = formatSquareFootage(150000)

      expect(result).toBe('150,000 sq ft')
    })
  })

  describe('formatDate', () => {
    it('should format date with default options', () => {
      // Use Date constructor with explicit local time to avoid timezone issues
      const date = new Date(2025, 0, 15) // January 15, 2025 (month is 0-indexed)
      const result = formatDate(date)

      expect(result).toContain('Jan')
      expect(result).toContain('15')
      expect(result).toContain('2025')
    })

    it('should format date string', () => {
      const result = formatDate('2025-01-15')

      expect(result).toContain('Jan')
    })

    it('should format date with custom options', () => {
      const date = new Date('2025-01-15')
      const result = formatDate(date, { year: 'numeric', month: 'long' })

      expect(result).toContain('January')
      expect(result).toContain('2025')
    })
  })

  describe('formatDateRange', () => {
    it('should format date range', () => {
      // Use Date constructor with explicit local time to avoid timezone issues
      const start = new Date(2025, 0, 15) // January 15, 2025 (month is 0-indexed)
      const end = new Date(2025, 0, 20) // January 20, 2025
      const result = formatDateRange(start, end)

      expect(result).toContain('Jan 15')
      expect(result).toContain('Jan 20')
      expect(result).toContain('2025')
    })

    it('should format date range with string dates', () => {
      const result = formatDateRange('2025-01-15', '2025-01-20')

      expect(result).toContain('Jan')
    })
  })

  describe('formatRelativeTime', () => {
    it('should format "Just now" for recent dates', () => {
      const date = new Date(Date.now() - 30 * 1000) // 30 seconds ago
      const result = formatRelativeTime(date)

      expect(result).toBe('Just now')
    })

    it('should format minutes ago', () => {
      const date = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      const result = formatRelativeTime(date)

      expect(result).toBe('5m ago')
    })

    it('should format hours ago', () => {
      const date = new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      const result = formatRelativeTime(date)

      expect(result).toBe('2h ago')
    })

    it('should format days ago', () => {
      const date = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
      const result = formatRelativeTime(date)

      expect(result).toBe('3d ago')
    })

    it('should format months ago', () => {
      // Use a more accurate calculation for months (approximately 30.44 days per month)
      const date = new Date(Date.now() - Math.floor(2 * 30.44 * 24 * 60 * 60 * 1000)) // ~2 months ago
      const result = formatRelativeTime(date)

      expect(result).toContain('mo ago')
    })

    it('should format years ago', () => {
      // Use a more accurate calculation for years (365.25 days per year)
      const date = new Date(Date.now() - Math.floor(2 * 365.25 * 24 * 60 * 60 * 1000)) // ~2 years ago
      const result = formatRelativeTime(date)

      expect(result).toContain('y ago')
    })
  })

  describe('formatAddress', () => {
    it('should format complete address', () => {
      const result = formatAddress('123 Main St', 'New York', 'NY', '10001')

      expect(result).toBe('123 Main St, New York, NY 10001')
    })
  })

  describe('formatPropertyType', () => {
    it('should format property type with underscores', () => {
      const result = formatPropertyType('single_family_home')

      expect(result).toBe('Single Family Home')
    })

    it('should format single word property type', () => {
      const result = formatPropertyType('condo')

      expect(result).toBe('Condo')
    })
  })

  describe('formatStatus', () => {
    it('should format status with underscores', () => {
      const result = formatStatus('for_sale')

      expect(result).toBe('For Sale')
    })

    it('should format single word status', () => {
      const result = formatStatus('active')

      expect(result).toBe('Active')
    })
  })

  describe('formatNumber', () => {
    it('should format number with commas', () => {
      const result = formatNumber(1234567)

      expect(result).toBe('1,234,567')
    })

    it('should format small numbers', () => {
      const result = formatNumber(123)

      expect(result).toBe('123')
    })
  })

  describe('formatPricePerSqFt', () => {
    it('should calculate and format price per square foot', () => {
      const result = formatPricePerSqFt(300000, 1500)

      expect(result).toContain('$')
      expect(result).toContain('200') // 300000 / 1500
    })

    it('should return N/A for zero square footage', () => {
      const result = formatPricePerSqFt(300000, 0)

      expect(result).toBe('N/A')
    })

    it('should return N/A for negative square footage', () => {
      const result = formatPricePerSqFt(300000, -100)

      expect(result).toBe('N/A')
    })
  })

  describe('formatOccupancyRate', () => {
    it('should format occupancy rate', () => {
      const result = formatOccupancyRate(85.5)

      expect(result).toBe('85.5%')
    })

    it('should format zero occupancy', () => {
      const result = formatOccupancyRate(0)

      expect(result).toBe('0.0%')
    })
  })

  describe('formatROI', () => {
    it('should format positive ROI with green color', () => {
      const result = formatROI(15)

      expect(result.value).toBe('15.0%')
      expect(result.color).toBe('text-green-600')
    })

    it('should format medium ROI with blue color', () => {
      const result = formatROI(7)

      expect(result.value).toBe('7.0%')
      expect(result.color).toBe('text-blue-600')
    })

    it('should format low ROI with yellow color', () => {
      const result = formatROI(3)

      expect(result.value).toBe('3.0%')
      expect(result.color).toBe('text-yellow-600')
    })

    it('should format negative ROI with red color', () => {
      const result = formatROI(-5)

      expect(result.value).toBe('-5.0%')
      expect(result.color).toBe('text-red-600')
    })

    it('should format zero ROI with gray color', () => {
      const result = formatROI(0)

      expect(result.value).toBe('0.0%')
      expect(result.color).toBe('text-gray-600')
    })
  })

  describe('formatCashFlow', () => {
    it('should format positive cash flow with green color', () => {
      const result = formatCashFlow(2000)

      expect(result.value).toContain('$')
      expect(result.color).toBe('text-green-600')
    })

    it('should format small positive cash flow with blue color', () => {
      const result = formatCashFlow(500)

      expect(result.value).toContain('$')
      expect(result.color).toBe('text-blue-600')
    })

    it('should format negative cash flow with red color', () => {
      const result = formatCashFlow(-1000)

      expect(result.value).toContain('-')
      expect(result.color).toBe('text-red-600')
    })

    it('should format zero cash flow with gray color', () => {
      const result = formatCashFlow(0)

      expect(result.value).toContain('$')
      expect(result.color).toBe('text-gray-600')
    })
  })
})

