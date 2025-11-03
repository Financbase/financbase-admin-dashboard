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