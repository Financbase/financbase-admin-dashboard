"use client";

import { useState, useEffect } from 'react';

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
	const [data, setData] = useState<DashboardStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		// Simulate API call
		const fetchStats = async () => {
			try {
				setLoading(true);
				// Mock data that matches what the OverviewStats component expects
				const mockData: DashboardStats = {
					revenue: { value: '$45,231.89', change: 12.5, changeType: 'increase' },
					orders: { value: '8', change: 3, changeType: 'increase' }, // Invoices
					customers: { value: '12', change: 2, changeType: 'increase' }, // Active Clients
					products: { value: '$2,350.00', change: -5.2, changeType: 'decrease' }, // Monthly Expenses
				};

				setTimeout(() => {
					setData(mockData);
					setLoading(false);
				}, 100);
			} catch (err) {
				setError('Failed to fetch dashboard stats');
				setLoading(false);
			}
		};

		fetchStats();
	}, []);

	return { data, loading, error };
}