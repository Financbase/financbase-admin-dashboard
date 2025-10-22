/**
 * Utility functions for formatting data
 */

export function formatPercentage(value: number): string {
	return `${value > 0 ? '+' : ''}${value}%`;
}

export function formatCurrency(value: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
	}).format(value);
}

export function formatNumber(value: number): string {
	return new Intl.NumberFormat('en-US').format(value);
}