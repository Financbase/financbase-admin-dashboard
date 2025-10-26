"use client";

import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { MobileAppShell } from '@/components/mobile/mobile-app-shell'

interface ClientLayoutProps {
	children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
	return (
		<Providers>
			<MobileAppShell>
				{children}
			</MobileAppShell>
			<Toaster />
		</Providers>
	);
}
