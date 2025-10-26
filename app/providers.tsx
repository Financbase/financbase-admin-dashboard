"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { ClerkProvider } from '@clerk/nextjs';
import { DashboardProvider } from '@/contexts/dashboard-context';

interface ProvidersProps {
	children: React.ReactNode;
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: false,
			refetchOnWindowFocus: false,
		},
	},
});

export function Providers({ children }: ProvidersProps) {
	return (
		<ClerkProvider>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem={false}
					disableTransitionOnChange
					storageKey="financbase-theme"
				>
					<DashboardProvider>
						{children}
					</DashboardProvider>
				</ThemeProvider>
			</QueryClientProvider>
		</ClerkProvider>
	);
}
