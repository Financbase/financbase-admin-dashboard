/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { ClerkProvider } from '@clerk/nextjs';
import { DashboardProvider } from '@/contexts/dashboard-context';
import { BrandingProvider } from '@/contexts/branding-context';
import { OrganizationProvider } from '@/contexts/organization-context';
import { setupChunkErrorHandler } from '@/lib/utils/chunk-error-handler';
import { setupWebpackChunkHandler } from '@/lib/utils/webpack-chunk-handler';
import { ChunkErrorBoundary } from '@/components/errors/chunk-error-boundary';
import { SafeReactQueryDevtools } from '@/components/devtools/react-query-devtools-wrapper';

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
	// Set up global chunk error handlers on mount
	useEffect(() => {
		const errorHandlerOptions = {
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
		};

		// Initialize chunk error handler with automatic recovery
		const cleanupChunkHandler = setupChunkErrorHandler(errorHandlerOptions);

		// Initialize webpack chunk handler for runtime chunk loading interception
		// This provides early detection and recovery at the webpack level
		const cleanupWebpackHandler = setupWebpackChunkHandler({
			...errorHandlerOptions,
			maxChunkRetries: 3,
			verbose: process.env.NODE_ENV === 'development',
		});

		// Cleanup on unmount
		return () => {
			cleanupChunkHandler();
			cleanupWebpackHandler();
		};
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
					// suppressHydrationWarning // Not supported by ThemeProvider
				>
					{/* Wrap with ChunkErrorBoundary to catch React-level chunk errors */}
					<ChunkErrorBoundary autoRecover={true}>
						<BrandingProvider>
							<OrganizationProvider>
								<DashboardProvider>
									{children}
								</DashboardProvider>
							</OrganizationProvider>
						</BrandingProvider>
					</ChunkErrorBoundary>
				</ThemeProvider>
				{/* 
					SafeReactQueryDevtools handles chunk loading errors gracefully.
					If DevTools fails to load, the app continues to work normally.
				*/}
				<SafeReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</ClerkProvider>
	);
}
