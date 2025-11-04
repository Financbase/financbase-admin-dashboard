"use client";

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { ThemeProvider } from 'next-themes';
import { ClerkProvider } from '@clerk/nextjs';
import { DashboardProvider } from '@/contexts/dashboard-context';
import { setupChunkErrorHandler } from '@/lib/utils/chunk-error-handler';
import { ChunkErrorBoundary } from '@/components/errors/chunk-error-boundary';

// Dynamically import ReactQueryDevtools to avoid SSR issues
const ReactQueryDevtoolsDevelopment = dynamic(
	() => import('@tanstack/react-query-devtools').then((d) => d.ReactQueryDevtools),
	{ ssr: false }
);

interface ProvidersProps {
	children: React.ReactNode;
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 3,
			retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
			staleTime: 5 * 60 * 1000, // 5 minutes
			gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
			refetchOnWindowFocus: false,
			refetchOnReconnect: true,
		},
		mutations: {
			retry: 1,
			retryDelay: 1000,
		},
	},
});

export function Providers({ children }: ProvidersProps) {
	// Set up global chunk error handler on mount
	useEffect(() => {
		// Initialize chunk error handler with automatic recovery
		const cleanup = setupChunkErrorHandler({
			maxRetries: 3,
			initialDelay: 1000,
			maxDelay: 10000,
			autoReload: true,
			onBeforeReload: () => {
				// Optional: Show a notification before reload
				if (typeof window !== 'undefined' && window.console) {
					console.info('[ChunkErrorHandler] Reloading page to recover from chunk load error...');
				}
			},
		});

		// Cleanup on unmount
		return cleanup;
	}, []);

	return (
		<ClerkProvider>
			<QueryClientProvider client={queryClient}>
				{/* 
					ThemeProvider from next-themes integrates with ThemeManager service.
					ThemeManager (via useThemeManager hook) automatically syncs with this provider
					and handles theme persistence, user preferences sync, and CSS variable management.
				*/}
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem={false}
					disableTransitionOnChange
					storageKey="financbase-theme"
					suppressHydrationWarning
				>
					{/* Wrap with ChunkErrorBoundary to catch React-level chunk errors */}
					<ChunkErrorBoundary autoRecover={true}>
						<DashboardProvider>
							{children}
						</DashboardProvider>
					</ChunkErrorBoundary>
				</ThemeProvider>
				{process.env.NODE_ENV === 'development' && (
					<ReactQueryDevtoolsDevelopment initialIsOpen={false} />
				)}
			</QueryClientProvider>
		</ClerkProvider>
	);
}
