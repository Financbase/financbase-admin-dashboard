"use client";

import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';

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

interface CustomerAnalyticsData {
	totalCustomers: number;
	activeCustomers: number;
	newCustomers: number;
	retentionRate: number;
	satisfactionScore: number;
}

interface TopProduct {
	name: string;
	sales: number;
	revenue: number;
}

interface AccountBalance {
	balance: number;
	change: number;
}

interface AccountBalances {
	checking: AccountBalance;
	savings: AccountBalance;
	investment: AccountBalance;
	credit: AccountBalance;
}

interface ChartData {
	labels: string[];
	datasets: Array<{
		label: string;
		data: number[];
		borderColor: string;
		backgroundColor: string;
	}>;
}

interface RecentOrder {
	id: string;
	customer: string;
	amount: number;
	status: string;
	date: string;
}

interface ActivityItem {
	id: string;
	type: string;
	description: string;
	amount?: number;
	status?: string;
	createdAt: string;
}

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

export function useDashboardStats() {
	const { data: apiData, isLoading, error } = useQuery({
		queryKey: ['dashboard-overview'],
		queryFn: async () => {
			const response = await fetch('/api/dashboard/overview');
			if (!response.ok) {
				throw new Error('Failed to fetch dashboard data');
			}
			return response.json();
		},
	});

	// Transform API data to match the expected format
	const data = apiData ? {
		revenue: {
			value: `$${apiData.overview?.revenue?.thisMonth?.toLocaleString() || '0'}`,
			change: apiData.overview?.revenue?.growth || 0,
			changeType: (apiData.overview?.revenue?.growth || 0) >= 0 ? 'increase' : 'decrease' as 'increase' | 'decrease'
		},
		orders: {
			value: apiData.overview?.invoices?.total || 0,
			change: 0, // TODO: Calculate actual change
			changeType: 'increase' as 'increase' | 'decrease'
		},
		customers: {
			value: apiData.overview?.clients?.total || 0,
			change: apiData.overview?.clients?.newThisMonth || 0,
			changeType: 'increase' as 'increase' | 'decrease'
		},
		products: {
			value: `$${apiData.overview?.expenses?.thisMonth?.toLocaleString() || '0'}`,
			change: apiData.overview?.expenses?.growth || 0,
			changeType: (apiData.overview?.expenses?.growth || 0) >= 0 ? 'increase' : 'decrease' as 'increase' | 'decrease'
		},
	} : null;

	return { data, loading: isLoading, error };
}

export function useCustomerAnalytics() {
	const { data: apiData, isLoading, error } = useQuery({
		queryKey: ['customer-analytics'],
		queryFn: async () => {
			const response = await fetch('/api/analytics/clients');
			if (!response.ok) {
				throw new Error('Failed to fetch customer analytics');
			}
			return response.json();
		},
	});

	// Transform API data to match expected format
	const data = apiData ? {
		totalCustomers: apiData.totalClients || 0,
		newCustomers: apiData.newClientsThisMonth || 0,
		retentionRate: apiData.clientRetention || 0,
		satisfactionScore: 4.8 // TODO: Get from API
	} : null;

	return { data, loading: isLoading, error };
}

export function useTopProducts(sortBy: 'sales' | 'revenue' | 'growth' = 'sales', limit: number = 5) {
	const { data: topProducts, isLoading, error } = useQuery<{
		products: TopProduct[];
	}>({
		queryKey: ['dashboard-top-products', sortBy, limit],
		queryFn: async () => {
			const response = await fetch(`/api/dashboard/top-products?sortBy=${sortBy}&limit=${limit}`);
			if (!response.ok) throw new Error('Failed to fetch top products');
			return response.json();
		},
	});

	// Transform API data to component format
	const transformedProducts = topProducts?.products?.map((product, index) => ({
		id: `product-${index}`,
		name: product.name,
		category: 'Service', // Default category since API doesn't provide this
		sales: product.sales,
		revenue: product.revenue,
		growth: Math.random() * 20 - 10, // Mock growth data for now
		revenue_formatted: `$${product.revenue.toLocaleString()}`,
		growth_formatted: `${(Math.random() * 20 - 10).toFixed(1)}%`,
	})) || [];

	return {
		data: transformedProducts,
		loading: isLoading,
		error: error?.message || null
	};
}

export function useAccountBalances() {
	const { data: balances, isLoading, error } = useQuery<{
		balances: AccountBalances;
	}>({
		queryKey: ['account-balances'],
		queryFn: async () => {
			const response = await fetch('/api/accounts/balances');
			if (!response.ok) throw new Error('Failed to fetch account balances');
			return response.json();
		},
	});

	return {
		data: balances?.balances || {},
		loading: isLoading,
		error: error?.message || null
	};
}

export function useChartData(type: 'sales' | 'revenue' | 'expenses' = 'revenue', dateRange?: { start: Date; end: Date }, timeRange: 'day' | 'week' | 'month' = 'month') {
	const { data: chartData, isLoading, error } = useQuery<{
		analytics: {
			monthlyRevenue: Array<{ month: string; revenue: number }>;
		};
	}>({
		queryKey: ['dashboard-chart-data', type, timeRange],
		queryFn: async () => {
			// For now, always use revenue analytics regardless of chart type
			// In a full implementation, this would handle different chart types
			const period = timeRange === 'week' ? '3months' : timeRange === 'day' ? '1month' : '12months';
			const response = await fetch(`/api/analytics/revenue?period=${period}`);
			if (!response.ok) throw new Error('Failed to fetch chart data');
			return response.json();
		},
	});

	// Transform revenue analytics to chart format
	const transformedData: ChartData | null = chartData?.analytics ? {
		labels: chartData.analytics.monthlyRevenue.map((item) => item.month),
		datasets: [
			{
				label: type === 'revenue' ? 'Revenue' : 'Sales',
				data: chartData.analytics.monthlyRevenue.map((item) => item.revenue),
				borderColor: type === 'revenue' ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)',
				backgroundColor: type === 'revenue' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
			}
		]
	} : null;

	return {
		data: transformedData,
		loading: isLoading,
		error: error?.message || null
	};
}

export function useRecentOrders(limit: number = 10) {
	const { data: activities, isLoading, error } = useQuery<{
		activities: ActivityItem[];
	}>({
		queryKey: ['recent-activity', limit],
		queryFn: async () => {
			const response = await fetch(`/api/dashboard/recent-activity?limit=${limit}`);
			if (!response.ok) throw new Error('Failed to fetch recent activity');
			return response.json();
		},
	});

	// Transform activity data to orders format
	const orders: RecentOrder[] = activities?.activities
		?.filter((activity) => activity.type === 'invoice')
		?.map((activity) => ({
			id: activity.id,
			customer: 'Client', // Would need client name from invoice data
			amount: activity.amount || 0,
			status: activity.status || 'pending',
			date: formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true }),
		})) || [];

	return {
		data: orders,
		loading: isLoading,
		error: error?.message || null
	};
}

export function useActivityFeed() {
	const { data: activities, isLoading, error } = useQuery<{
		activities: ActivityItem[];
	}>({
		queryKey: ['recent-activity'],
		queryFn: async () => {
			const response = await fetch('/api/dashboard/recent-activity');
			if (!response.ok) throw new Error('Failed to fetch recent activity');
			return response.json();
		},
	});

	return {
		data: activities?.activities || [],
		loading: isLoading,
		error: error?.message || null
	};
}