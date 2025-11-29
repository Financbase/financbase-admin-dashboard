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
  calculateMortgagePayment,
  calculateROI,
  calculateCashFlow,
  calculateAffordability,
  calculateAppreciation,
  calculateCapRate,
  calculateDebtToIncomeRatio,
  calculateLoanToValueRatio,
} from '@/lib/utils/real-estate-calculations'

describe('real-estate-calculations', () => {
  describe('calculateMortgagePayment', () => {
    it('should calculate monthly mortgage payment', () => {
      const result = calculateMortgagePayment(300000, 4.5, 30)

      expect(result.monthlyPayment).toBeGreaterThan(0)
      expect(result.totalInterest).toBeGreaterThan(0)
      expect(result.totalPayment).toBe(result.monthlyPayment * result.termMonths)
      expect(result.principal).toBe(300000)
      expect(result.interestRate).toBe(4.5)
      expect(result.termMonths).toBe(360)
    })

    it('should calculate correct monthly payment for standard loan', () => {
      const result = calculateMortgagePayment(200000, 3.5, 30)

      // Approximate monthly payment for $200k at 3.5% for 30 years
      expect(result.monthlyPayment).toBeCloseTo(898.09, 1)
    })

    it('should handle 15-year mortgage', () => {
      const result = calculateMortgagePayment(200000, 3.5, 15)

      expect(result.termMonths).toBe(180)
      expect(result.monthlyPayment).toBeGreaterThan(0)
      // 15-year mortgage should have higher monthly payment than 30-year
      const result30 = calculateMortgagePayment(200000, 3.5, 30)
      expect(result.monthlyPayment).toBeGreaterThan(result30.monthlyPayment)
    })

    it('should calculate higher payment for higher interest rate', () => {
      const lowRate = calculateMortgagePayment(200000, 3.0, 30)
      const highRate = calculateMortgagePayment(200000, 6.0, 30)

      expect(highRate.monthlyPayment).toBeGreaterThan(lowRate.monthlyPayment)
    })
  })

  describe('calculateROI', () => {
    it('should calculate ROI correctly', () => {
      const result = calculateROI(
        200000, // totalInvestment
        250000, // currentValue
        24000,  // totalIncome
        12000,  // totalExpenses
        1       // timePeriodYears
      )

      expect(result.totalInvestment).toBe(200000)
      expect(result.currentValue).toBe(250000)
      expect(result.netIncome).toBe(12000) // 24000 - 12000
      expect(result.appreciation).toBe(50000) // 250000 - 200000
      expect(result.roi).toBeGreaterThan(0)
      expect(result.capRate).toBeGreaterThan(0)
      expect(result.cashOnCashReturn).toBeGreaterThan(0)
    })

    it('should handle zero investment', () => {
      const result = calculateROI(0, 100000, 10000, 5000)

      expect(result.roi).toBe(0)
      expect(result.cashOnCashReturn).toBe(0)
    })

    it('should handle zero current value', () => {
      const result = calculateROI(200000, 0, 10000, 5000)

      expect(result.capRate).toBe(0)
    })

    it('should calculate negative ROI for losing investment', () => {
      const result = calculateROI(200000, 150000, 10000, 15000)

      expect(result.netIncome).toBeLessThan(0)
      expect(result.appreciation).toBeLessThan(0)
    })
  })

  describe('calculateCashFlow', () => {
    it('should calculate positive cash flow', () => {
      const result = calculateCashFlow(5000, 3000)

      expect(result.monthlyIncome).toBe(5000)
      expect(result.monthlyExpenses).toBe(3000)
      expect(result.netCashFlow).toBe(2000)
      expect(result.annualCashFlow).toBe(24000)
    })

    it('should calculate negative cash flow', () => {
      const result = calculateCashFlow(3000, 5000)

      expect(result.netCashFlow).toBe(-2000)
      expect(result.annualCashFlow).toBe(-24000)
    })

    it('should handle zero expenses', () => {
      const result = calculateCashFlow(5000, 0)

      expect(result.netCashFlow).toBe(5000)
      expect(result.annualCashFlow).toBe(60000)
    })
  })

  describe('calculateAffordability', () => {
    it('should calculate affordability based on income', () => {
      const result = calculateAffordability(10000, 2000, 20, 28)

      expect(result.maxMonthlyPayment).toBeGreaterThan(0)
      expect(result.maxLoanAmount).toBeGreaterThan(0)
      expect(result.maxHomePrice).toBeGreaterThan(result.maxLoanAmount)
      expect(result.recommendedDownPayment).toBeGreaterThan(0)
    })

    it('should calculate with custom down payment percent', () => {
      const result20 = calculateAffordability(10000, 2000, 20, 28)
      const result10 = calculateAffordability(10000, 2000, 10, 28)

      // Higher down payment percent means higher max home price
      // (because you're putting more down, so the loan covers less of the price)
      // Formula: maxHomePrice = maxLoanAmount / (1 - downPaymentPercent / 100)
      // With 20% down: maxHomePrice = maxLoanAmount / 0.8 = maxLoanAmount * 1.25
      // With 10% down: maxHomePrice = maxLoanAmount / 0.9 = maxLoanAmount * 1.111...
      expect(result20.maxHomePrice).toBeGreaterThan(result10.maxHomePrice)
      expect(result20.maxHomePrice).toBeGreaterThan(0)
      expect(result10.maxHomePrice).toBeGreaterThan(0)
    })

    it('should calculate with custom debt-to-income ratio', () => {
      const result28 = calculateAffordability(10000, 2000, 20, 28)
      const result36 = calculateAffordability(10000, 2000, 20, 36)

      expect(result36.maxMonthlyPayment).toBeGreaterThan(result28.maxMonthlyPayment)
    })
  })

  describe('calculateAppreciation', () => {
    it('should calculate appreciation correctly', () => {
      const result = calculateAppreciation(200000, 250000, 5)

      expect(result.totalAppreciation).toBe(50000)
      expect(result.annualAppreciationAmount).toBe(10000)
      expect(result.annualAppreciationRate).toBeGreaterThan(0)
    })

    it('should handle zero years owned', () => {
      const result = calculateAppreciation(200000, 250000, 0)

      expect(result.annualAppreciationAmount).toBe(0)
      expect(result.annualAppreciationRate).toBe(0)
    })

    it('should handle negative appreciation', () => {
      const result = calculateAppreciation(250000, 200000, 5)

      expect(result.totalAppreciation).toBe(-50000)
      expect(result.annualAppreciationAmount).toBeLessThan(0)
    })
  })

  describe('calculateCapRate', () => {
    it('should calculate cap rate correctly', () => {
      const result = calculateCapRate(24000, 300000)

      expect(result).toBe(8) // (24000 / 300000) * 100
    })

    it('should return zero for zero property value', () => {
      const result = calculateCapRate(24000, 0)

      expect(result).toBe(0)
    })

    it('should handle negative NOI', () => {
      const result = calculateCapRate(-24000, 300000)

      expect(result).toBeLessThan(0)
    })
  })

  describe('calculateDebtToIncomeRatio', () => {
    it('should calculate debt-to-income ratio correctly', () => {
      const result = calculateDebtToIncomeRatio(2000, 10000)

      expect(result).toBe(20) // (2000 / 10000) * 100
    })

    it('should return zero for zero income', () => {
      const result = calculateDebtToIncomeRatio(2000, 0)

      expect(result).toBe(0)
    })

    it('should handle high debt-to-income ratio', () => {
      const result = calculateDebtToIncomeRatio(5000, 10000)

      expect(result).toBe(50)
    })
  })

  describe('calculateLoanToValueRatio', () => {
    it('should calculate loan-to-value ratio correctly', () => {
      const result = calculateLoanToValueRatio(200000, 250000)

      expect(result).toBe(80) // (200000 / 250000) * 100
    })

    it('should return zero for zero property value', () => {
      const result = calculateLoanToValueRatio(200000, 0)

      expect(result).toBe(0)
    })

    it('should handle loan greater than property value', () => {
      const result = calculateLoanToValueRatio(300000, 250000)

      expect(result).toBe(120)
    })
  })
})

