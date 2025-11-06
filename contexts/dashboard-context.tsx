"use client";

import * as React from "react";

interface DateRange {
	from: Date;
	to: Date;
}

interface DashboardContextType {
	dateRange: DateRange;
	setDateRange: (range: DateRange) => void;
}

const DashboardContext = React.createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
	// Set default date range to current month
	const now = new Date();
	const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
	
	const [dateRange, setDateRange] = React.useState<DateRange>({
		from: startOfMonth,
		to: endOfMonth
	});

	return (
		<DashboardContext.Provider value={{ dateRange, setDateRange }}>
			{children}
		</DashboardContext.Provider>
	);
}

export function useDashboardDateRange() {
	const context = React.useContext(DashboardContext);
	if (context === undefined) {
		throw new Error('useDashboardDateRange must be used within a DashboardProvider');
	}
	return context;
}

export function useDashboard() {
	const context = React.useContext(DashboardContext);
	if (context === undefined) {
		throw new Error('useDashboard must be used within a DashboardProvider');
	}
	return context;
}

// Additional hooks for dashboard header
export function useDashboardRefresh() {
	const [autoRefresh, setAutoRefresh] = React.useState(false);
	const [refreshTrigger, setRefreshTrigger] = React.useState(0);

	const triggerRefresh = React.useCallback(() => {
		setRefreshTrigger(prev => prev + 1);
	}, []);

	return {
		triggerRefresh,
		autoRefresh,
		setAutoRefresh,
		refreshTrigger,
	};
}

export function useDashboardLastUpdated() {
	const [lastUpdated, setLastUpdated] = React.useState<Date | null>(new Date());

	React.useEffect(() => {
		const interval = setInterval(() => {
			setLastUpdated(new Date());
		}, 60000); // Update every minute

		return () => clearInterval(interval);
	}, []);

	return { lastUpdated };
}