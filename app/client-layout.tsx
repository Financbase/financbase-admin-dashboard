/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client";

import { Providers } from './providers'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/core/ui/layout/sonner'
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
			<SonnerToaster />
		</Providers>
	);
}
