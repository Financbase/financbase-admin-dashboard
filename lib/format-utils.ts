/**
 * Utility functions for formatting data
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
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

export function formatRelativeTime(date: Date | string): string {
	const now = new Date();
	const targetDate = typeof date === 'string' ? new Date(date) : date;
	const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);
	
	if (diffInSeconds < 60) {
		return 'just now';
	} else if (diffInSeconds < 3600) {
		const minutes = Math.floor(diffInSeconds / 60);
		return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
	} else if (diffInSeconds < 86400) {
		const hours = Math.floor(diffInSeconds / 3600);
		return `${hours} hour${hours > 1 ? 's' : ''} ago`;
	} else {
		const days = Math.floor(diffInSeconds / 86400);
		return `${days} day${days > 1 ? 's' : ''} ago`;
	}
}