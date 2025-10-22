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
				// Mock data - in real app this would be an API call
				const mockData: DashboardStats = {
					revenue: { value: '$45,231.89', change: 20.1, changeType: 'increase' },
					orders: { value: '2,350', change: 15.3, changeType: 'increase' },
					customers: { value: '1,234', change: -5.2, changeType: 'decrease' },
					products: { value: '89', change: 8.7, changeType: 'increase' },
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