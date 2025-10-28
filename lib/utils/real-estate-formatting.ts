/**
 * Real estate formatting utilities
 */

/**
 * Format currency values
 */
export function formatCurrency(
  amount: number,
  options: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    currency?: string;
  } = {}
): string {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    currency = 'USD',
  } = options;

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
}

/**
 * Format large currency values with K/M/B suffixes
 */
export function formatCurrencyCompact(amount: number): string {
  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
}

/**
 * Format percentage values
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format square footage
 */
export function formatSquareFootage(sqft: number): string {
  return `${sqft.toLocaleString()} sq ft`;
}

/**
 * Format date for display
 */
export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat('en-US', defaultOptions).format(dateObj);
}

/**
 * Format date range
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = formatDate(startDate, { month: 'short', day: 'numeric' });
  const end = formatDate(endDate, { month: 'short', day: 'numeric', year: 'numeric' });
  return `${start} - ${end}`;
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
}

/**
 * Format property address
 */
export function formatAddress(
  address: string,
  city: string,
  state: string,
  zipCode: string
): string {
  return `${address}, ${city}, ${state} ${zipCode}`;
}

/**
 * Format property type for display
 */
export function formatPropertyType(type: string): string {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format status for display
 */
export function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format number with commas
 */
export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/**
 * Format price per square foot
 */
export function formatPricePerSqFt(price: number, sqft: number): string {
  if (sqft <= 0) return 'N/A';
  const pricePerSqFt = price / sqft;
  return formatCurrency(pricePerSqFt, { maximumFractionDigits: 0 });
}

/**
 * Format occupancy rate
 */
export function formatOccupancyRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

/**
 * Format ROI with color coding
 */
export function formatROI(roi: number): {
  value: string;
  color: string;
} {
  const value = formatPercentage(roi);
  let color = 'text-gray-600';
  
  if (roi > 10) color = 'text-green-600';
  else if (roi > 5) color = 'text-blue-600';
  else if (roi > 0) color = 'text-yellow-600';
  else if (roi < 0) color = 'text-red-600';
  
  return { value, color };
}

/**
 * Format cash flow with color coding
 */
export function formatCashFlow(cashFlow: number): {
  value: string;
  color: string;
} {
  const value = formatCurrency(cashFlow);
  let color = 'text-gray-600';
  
  if (cashFlow > 1000) color = 'text-green-600';
  else if (cashFlow > 0) color = 'text-blue-600';
  else if (cashFlow < 0) color = 'text-red-600';
  
  return { value, color };
}
