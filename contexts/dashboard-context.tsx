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
	const [dateRange, setDateRange] = React.useState<DateRange>({
		from: new Date('2024-01-01'),
		to: new Date('2024-01-31')
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