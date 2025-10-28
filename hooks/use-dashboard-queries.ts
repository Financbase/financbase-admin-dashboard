"use client";

import { useQuery } from '@tanstack/react-query';

// Types for API responses
export interface StatData {
	value: string | number;
	change: number;
	changeType: 'increase' | 'decrease';
}

export interface DashboardStats {
	revenue: StatData;
	orders: StatData;
	customers: StatData;
	products: StatData;
}

export interface ChartDataset {
	label: string;
	data: number[];
	borderColor: string;
	backgroundColor: string;
	fill?: boolean;
}

export interface ChartData {
	labels: string[];
	datasets: ChartDataset[];
}

export interface DashboardOverview {
	revenue: {
		total: number;
		thisMonth: number;
		lastMonth: number;
		growth: number;
	};
	clients: {
		total: number;
		active: number;
		newThisMonth: number;
	};
	invoices: {
		total: number;
		pending: number;
		overdue: number;
		totalAmount: number;
	};
	expenses: {
		total: number;
		thisMonth: number;
		lastMonth: number;
		growth: number;
	};
	netIncome: {
		thisMonth: number;
		lastMonth: number;
		growth: number;
	};
}

export interface RecentActivity {
	id: string;
	type: 'invoice' | 'expense' | 'payment' | 'client';
	description: string;
	amount?: number;
	status?: string;
	createdAt: string;
}

export interface AIInsight {
	type: 'success' | 'warning' | 'info';
	title: string;
	description: string;
	action?: string;
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
};

// Helper function to map API overview to component stats format
const mapOverviewToStats = (overview: DashboardOverview): DashboardStats => {
	return {
		revenue: {
			value: formatCurrency(overview.revenue.thisMonth),
			change: Math.abs(overview.revenue.growth),
			changeType: overview.revenue.growth >= 0 ? 'increase' : 'decrease',
		},
		orders: {
			value: overview.invoices.total.toString(),
			change: overview.clients.newThisMonth,
			changeType: overview.clients.newThisMonth >= 0 ? 'increase' : 'decrease',
		},
		customers: {
			value: overview.clients.active.toString(),
			change: overview.clients.newThisMonth,
			changeType: overview.clients.newThisMonth >= 0 ? 'increase' : 'decrease',
		},
		products: {
			value: formatCurrency(overview.expenses.thisMonth),
			change: Math.abs(overview.expenses.growth),
			changeType: overview.expenses.growth >= 0 ? 'increase' : 'decrease',
		},
	};
};

// React Query hooks
export function useDashboardStats(dateRange?: { start: Date; end: Date }) {
	return useQuery({
		queryKey: ['dashboard', 'stats', dateRange],
		queryFn: async (): Promise<DashboardStats> => {
			const response = await fetch('/api/dashboard/overview');
			if (!response.ok) {
				throw new Error('Failed to fetch dashboard stats');
			}
			const data = await response.json();
			return mapOverviewToStats(data.overview);
		},
		staleTime: 2 * 60 * 1000, // 2 minutes
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useChartData(
	type: 'sales' | 'revenue' | 'expenses',
	dateRange?: { start: Date; end: Date },
	timeRange: 'day' | 'week' | 'month' = 'month'
) {
	return useQuery({
		queryKey: ['dashboard', 'chart', type, dateRange, timeRange],
		queryFn: async (): Promise<ChartData> => {
			const params = new URLSearchParams({
				chartType: type,
				timeRange,
			});
			
			const response = await fetch(`/api/dashboard/overview?${params}`);
			if (!response.ok) {
				throw new Error('Failed to fetch chart data');
			}
			const data = await response.json();
			
			if (!data.chartData) {
				// Return empty chart data if not available
				return {
					labels: [],
					datasets: [{
						label: type === 'sales' ? 'Sales Count' : type === 'revenue' ? 'Revenue' : 'Expenses',
						data: [],
						borderColor: type === 'sales' ? 'rgb(59, 130, 246)' : type === 'revenue' ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
						backgroundColor: type === 'sales' ? 'rgba(59, 130, 246, 0.1)' : type === 'revenue' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
						fill: true,
					}],
				};
			}
			
			return data.chartData;
		},
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 10 * 60 * 1000, // 10 minutes
	});
}

export function useRecentActivity(limit: number = 10) {
	return useQuery({
		queryKey: ['dashboard', 'recent-activity', limit],
		queryFn: async (): Promise<RecentActivity[]> => {
			const response = await fetch(`/api/dashboard/recent-activity?limit=${limit}`);
			if (!response.ok) {
				throw new Error('Failed to fetch recent activity');
			}
			const data = await response.json();
			return data.activities || [];
		},
		staleTime: 1 * 60 * 1000, // 1 minute
		gcTime: 5 * 60 * 1000, // 5 minutes
	});
}

export function useAIInsights() {
	return useQuery({
		queryKey: ['dashboard', 'ai-insights'],
		queryFn: async (): Promise<AIInsight[]> => {
			const response = await fetch('/api/dashboard/ai-insights');
			if (!response.ok) {
				throw new Error('Failed to fetch AI insights');
			}
			const data = await response.json();
			return data.insights || [];
		},
		staleTime: 10 * 60 * 1000, // 10 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
	});
}

// Legacy hooks for backward compatibility
export function useCustomerAnalytics() {
	return useQuery({
		queryKey: ['dashboard', 'customer-analytics'],
		queryFn: async () => {
			const response = await fetch('/api/dashboard/overview');
			if (!response.ok) {
				throw new Error('Failed to fetch customer analytics');
			}
			const data = await response.json();
			const overview = data.overview;
			
			return {
				totalCustomers: overview.clients.total,
				newCustomers: overview.clients.newThisMonth,
				retentionRate: overview.clients.active > 0 ? (overview.clients.active / overview.clients.total) * 100 : 0,
				satisfactionScore: 4.8, // This would come from a separate service
			};
		},
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
}

export function useTopProducts() {
	return useQuery({
		queryKey: ['dashboard', 'top-products'],
		queryFn: async () => {
			// This would typically come from a separate products/analytics endpoint
			// For now, return mock data until we have product tracking
			return [
				{ name: 'Premium Plan', sales: 45, revenue: 22500 },
				{ name: 'Basic Plan', sales: 32, revenue: 9600 },
				{ name: 'Enterprise Plan', sales: 12, revenue: 36000 }
			];
		},
		staleTime: 10 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
	});
}

export function useAccountBalances() {
	return useQuery({
		queryKey: ['dashboard', 'account-balances'],
		queryFn: async () => {
			const response = await fetch('/api/dashboard/overview');
			if (!response.ok) {
				throw new Error('Failed to fetch account balances');
			}
			const data = await response.json();
			const overview = data.overview;
			
			return {
				checking: { balance: overview.revenue.thisMonth, change: overview.revenue.growth },
				savings: { balance: overview.revenue.total, change: 1.8 },
				investment: { balance: overview.netIncome.thisMonth, change: overview.netIncome.growth },
				credit: { balance: -overview.expenses.thisMonth, change: -overview.expenses.growth }
			};
		},
		staleTime: 2 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	});
}

export function useRecentOrders(limit: number = 10) {
	return useQuery({
		queryKey: ['dashboard', 'recent-orders', limit],
		queryFn: async () => {
			const response = await fetch(`/api/dashboard/recent-activity?limit=${limit}`);
			if (!response.ok) {
				throw new Error('Failed to fetch recent orders');
			}
			const data = await response.json();
			const activities = data.activities || [];
			
			// Transform activities to order format for backward compatibility
			return activities
				.filter(activity => activity.type === 'invoice')
				.map(activity => ({
					id: activity.id,
					orderNumber: `INV-${activity.id.slice(-6)}`,
					customerName: 'Client', // Would need to join with client data
					customerEmail: 'client@example.com',
					total: activity.amount || 0,
					status: activity.status === 'paid' ? 'delivered' : 'pending',
					createdAt: activity.createdAt,
					items: [{ name: 'Service', quantity: 1, price: activity.amount || 0 }]
				}));
		},
		staleTime: 1 * 60 * 1000,
		gcTime: 5 * 60 * 1000,
	});
}

export function useActivityFeed() {
	return useQuery({
		queryKey: ['dashboard', 'activity-feed'],
		queryFn: async () => {
			const response = await fetch('/api/dashboard/recent-activity?limit=20');
			if (!response.ok) {
				throw new Error('Failed to fetch activity feed');
			}
			const data = await response.json();
			const activities = data.activities || [];
			
			// Transform activities to feed format
			return activities.map(activity => ({
				id: activity.id,
				type: activity.type,
				message: activity.description,
				time: new Date(activity.createdAt).toLocaleString(),
			}));
		},
		staleTime: 30 * 1000, // 30 seconds
		gcTime: 2 * 60 * 1000, // 2 minutes
	});
}
