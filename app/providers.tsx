"use client";

import { ClerkProvider } from '@clerk/nextjs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { CollaborationProvider } from '@/contexts/collaboration-context';

interface ProvidersProps {
	children: React.ReactNode;
}

const queryClient = new QueryClient();

export function Providers({ children }: ProvidersProps) {
	return (
		<ClerkProvider>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<CollaborationProvider>
						{children}
					</CollaborationProvider>
				</ThemeProvider>
			</QueryClientProvider>
		</ClerkProvider>
	);
}
