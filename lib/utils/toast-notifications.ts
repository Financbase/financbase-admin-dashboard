"use client";

import { toast } from 'sonner';

// Toast notification helpers for dashboard errors and success messages
export const dashboardToasts = {
	// Error notifications
	error: {
		failedToLoadStats: () => {
			toast.error('Failed to load dashboard statistics', {
				description: 'Unable to fetch dashboard data. Please try refreshing the page.',
				duration: 5000,
			});
		},
		failedToLoadChart: (chartType: string) => {
			toast.error(`Failed to load ${chartType} chart`, {
				description: 'Unable to fetch chart data. Please try refreshing the page.',
				duration: 5000,
			});
		},
		failedToLoadActivity: () => {
			toast.error('Failed to load recent activity', {
				description: 'Unable to fetch activity data. Please try refreshing the page.',
				duration: 5000,
			});
		},
		failedToLoadInsights: () => {
			toast.error('Failed to load AI insights', {
				description: 'Unable to fetch AI insights. Please try refreshing the page.',
				duration: 5000,
			});
		},
		networkError: () => {
			toast.error('Network error', {
				description: 'Please check your internet connection and try again.',
				duration: 5000,
			});
		},
		unauthorized: () => {
			toast.error('Session expired', {
				description: 'Please sign in again to continue.',
				duration: 5000,
			});
		},
		serverError: () => {
			toast.error('Server error', {
				description: 'Something went wrong on our end. Please try again later.',
				duration: 5000,
			});
		},
	},

	// Success notifications
	success: {
		dataRefreshed: () => {
			toast.success('Data refreshed', {
				description: 'Dashboard data has been updated successfully.',
				duration: 3000,
			});
		},
		settingsUpdated: () => {
			toast.success('Settings updated', {
				description: 'Your dashboard settings have been saved.',
				duration: 3000,
			});
		},
	},

	// Warning notifications
	warning: {
		slowConnection: () => {
			toast.warning('Slow connection detected', {
				description: 'Data may take longer to load. Please be patient.',
				duration: 4000,
			});
		},
		partialData: () => {
			toast.warning('Partial data loaded', {
				description: 'Some dashboard components may not display complete information.',
				duration: 4000,
			});
		},
	},

	// Info notifications
	info: {
		loadingData: () => {
			toast.info('Loading dashboard data', {
				description: 'Please wait while we fetch your latest information.',
				duration: 2000,
			});
		},
		dateRangeChanged: (range: string) => {
			toast.info(`Date range updated`, {
				description: `Dashboard now shows data for ${range}.`,
				duration: 3000,
			});
		},
	},
};

// Generic error handler for API responses
export const handleApiError = (error: Error | unknown, context: string = 'dashboard') => {
	console.error(`API Error in ${context}:`, error);

	if (error && typeof error === 'object' && 'response' in error) {
		const apiError = error as { response?: { status?: number } };
		if (apiError.response?.status === 401) {
			dashboardToasts.error.unauthorized();
		} else if (apiError.response?.status && apiError.response.status >= 500) {
			dashboardToasts.error.serverError();
		} else {
			dashboardToasts.error.networkError();
		}
	} else if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
		dashboardToasts.error.networkError();
	} else {
		// Generic error for unknown cases
		toast.error('Something went wrong', {
			description: 'An unexpected error occurred. Please try again.',
			duration: 5000,
		});
	}
};

// Success handler for API responses
export const handleApiSuccess = (message: string, description?: string) => {
	toast.success(message, {
		description,
		duration: 3000,
	});
};

// Loading state handler
export const showLoadingToast = (message: string) => {
	return toast.loading(message, {
		description: 'Please wait...',
	});
};

// Update loading toast to success/error
export const updateLoadingToast = (toastId: string, type: 'success' | 'error', message: string, description?: string) => {
	toast.dismiss(toastId);
	if (type === 'success') {
		toast.success(message, { description, duration: 3000 });
	} else {
		toast.error(message, { description, duration: 5000 });
	}
};
