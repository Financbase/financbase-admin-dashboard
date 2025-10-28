/**
 * Real estate calculation utilities
 */

export interface MortgageCalculation {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  principal: number;
  interestRate: number;
  termMonths: number;
}

export interface ROICalculation {
  totalInvestment: number;
  currentValue: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  roi: number;
  cashFlow: number;
  capRate: number;
  cashOnCashReturn: number;
  appreciation: number;
}

export interface CashFlowCalculation {
  monthlyIncome: number;
  monthlyExpenses: number;
  netCashFlow: number;
  annualCashFlow: number;
}

/**
 * Calculate monthly mortgage payment using the standard formula
 */
export function calculateMortgagePayment(
  principal: number,
  annualRate: number,
  termYears: number
): MortgageCalculation {
  const monthlyRate = annualRate / 100 / 12;
  const termMonths = termYears * 12;
  
  const monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  const totalPayment = monthlyPayment * termMonths;
  const totalInterest = totalPayment - principal;
  
  return {
    monthlyPayment,
    totalInterest,
    totalPayment,
    principal,
    interestRate: annualRate,
    termMonths,
  };
}

/**
 * Calculate ROI and related metrics for a property
 */
export function calculateROI(
  totalInvestment: number,
  currentValue: number,
  totalIncome: number,
  totalExpenses: number,
  timePeriodYears: number = 1
): ROICalculation {
  const netIncome = totalIncome - totalExpenses;
  const appreciation = currentValue - totalInvestment;
  const totalReturn = netIncome + appreciation;
  
  const roi = totalInvestment > 0 ? (totalReturn / totalInvestment) * 100 : 0;
  const capRate = currentValue > 0 ? (netIncome / currentValue) * 100 : 0;
  const cashOnCashReturn = totalInvestment > 0 ? (netIncome / totalInvestment) * 100 : 0;
  
  return {
    totalInvestment,
    currentValue,
    totalIncome,
    totalExpenses,
    netIncome,
    roi,
    cashFlow: netIncome,
    capRate,
    cashOnCashReturn,
    appreciation,
  };
}

/**
 * Calculate monthly cash flow
 */
export function calculateCashFlow(
  monthlyIncome: number,
  monthlyExpenses: number
): CashFlowCalculation {
  const netCashFlow = monthlyIncome - monthlyExpenses;
  const annualCashFlow = netCashFlow * 12;
  
  return {
    monthlyIncome,
    monthlyExpenses,
    netCashFlow,
    annualCashFlow,
  };
}

/**
 * Calculate affordability based on income and debt
 */
export function calculateAffordability(
  monthlyIncome: number,
  monthlyDebt: number,
  downPaymentPercent: number = 20,
  maxDebtToIncomeRatio: number = 28
): {
  maxMonthlyPayment: number;
  maxLoanAmount: number;
  maxHomePrice: number;
  recommendedDownPayment: number;
} {
  const maxMonthlyPayment = (monthlyIncome * maxDebtToIncomeRatio / 100) - monthlyDebt;
  
  // Assuming 30-year loan at 7% interest rate for calculation
  const annualRate = 7;
  const monthlyRate = annualRate / 100 / 12;
  const termMonths = 30 * 12;
  
  const maxLoanAmount = maxMonthlyPayment * 
    (Math.pow(1 + monthlyRate, termMonths) - 1) /
    (monthlyRate * Math.pow(1 + monthlyRate, termMonths));
  
  const maxHomePrice = maxLoanAmount / (1 - downPaymentPercent / 100);
  const recommendedDownPayment = maxHomePrice * (downPaymentPercent / 100);
  
  return {
    maxMonthlyPayment,
    maxLoanAmount,
    maxHomePrice,
    recommendedDownPayment,
  };
}

/**
 * Calculate property appreciation over time
 */
export function calculateAppreciation(
  purchasePrice: number,
  currentValue: number,
  yearsOwned: number
): {
  totalAppreciation: number;
  annualAppreciationRate: number;
  annualAppreciationAmount: number;
} {
  const totalAppreciation = currentValue - purchasePrice;
  const annualAppreciationAmount = yearsOwned > 0 ? totalAppreciation / yearsOwned : 0;
  const annualAppreciationRate = purchasePrice > 0 ? 
    (Math.pow(currentValue / purchasePrice, 1 / yearsOwned) - 1) * 100 : 0;
  
  return {
    totalAppreciation,
    annualAppreciationRate,
    annualAppreciationAmount,
  };
}

/**
 * Calculate cap rate
 */
export function calculateCapRate(
  netOperatingIncome: number,
  propertyValue: number
): number {
  return propertyValue > 0 ? (netOperatingIncome / propertyValue) * 100 : 0;
}

/**
 * Calculate debt-to-income ratio
 */
export function calculateDebtToIncomeRatio(
  monthlyDebtPayments: number,
  monthlyIncome: number
): number {
  return monthlyIncome > 0 ? (monthlyDebtPayments / monthlyIncome) * 100 : 0;
}

/**
 * Calculate loan-to-value ratio
 */
export function calculateLoanToValueRatio(
  loanAmount: number,
  propertyValue: number
): number {
  return propertyValue > 0 ? (loanAmount / propertyValue) * 100 : 0;
}
