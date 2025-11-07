/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

/**
 * Branding Context
 * 
 * Provides branding context throughout the application tree.
 * Fetches and provides white label branding configuration.
 */

'use client';

import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { useBranding } from '@/hooks/use-branding';
import { useWorkspaces } from '@/hooks/use-workspaces';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { WhiteLabelBranding } from '@/types/white-label';
import { DEFAULT_BRANDING } from '@/types/white-label';

/**
 * Branding context value type
 */
interface BrandingContextValue {
	branding: WhiteLabelBranding;
	isLoading: boolean;
	error: Error | null;
	// Helper methods
	getLogo: (dark?: boolean) => string;
	getCompanyName: () => string;
	getSupportEmail: () => string;
	getSupportUrl: () => string;
}

/**
 * Create branding context
 */
const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

/**
 * Branding context provider props
 */
interface BrandingProviderProps {
	children: ReactNode;
	/**
	 * Initial branding (for SSR)
	 */
	initialBranding?: WhiteLabelBranding;
	/**
	 * Workspace ID override
	 */
	workspaceId?: string;
	/**
	 * Organization ID override
	 */
	organizationId?: string;
}

/**
 * Branding context provider
 */
export function BrandingProvider({
	children,
	initialBranding,
	workspaceId: propWorkspaceId,
	organizationId: propOrganizationId,
}: BrandingProviderProps) {
	// Get workspace and organization from hooks
	// Hooks must be called unconditionally (React rules)
	const workspacesResult = useWorkspaces();
	const userResult = useCurrentUser();
	
	const selectedWorkspace = workspacesResult?.selectedWorkspace || null;
	const currentUser = userResult?.data || null;

	// Determine workspace and organization IDs
	const workspaceId = propWorkspaceId || selectedWorkspace?.workspaceId;
	const organizationId = propOrganizationId || currentUser?.organizationId || undefined;

	// Fetch branding
	const {
		data: brandingData,
		isLoading,
		error,
	} = useBranding(workspaceId, organizationId);

	// Use fetched branding or fallback to initial/default
	const branding: WhiteLabelBranding = brandingData || initialBranding || DEFAULT_BRANDING;

	// Inject CSS variables for colors
	useEffect(() => {
		if (typeof window === 'undefined') return;

		const root = document.documentElement;

		if (branding.primaryColor) {
			root.style.setProperty('--brand-primary', branding.primaryColor);
		}

		if (branding.secondaryColor) {
			root.style.setProperty('--brand-secondary', branding.secondaryColor);
		}

		// Inject custom CSS if provided
		if (branding.customCss) {
			const styleId = 'white-label-custom-css';
			let styleElement = document.getElementById(styleId) as HTMLStyleElement;

			if (!styleElement) {
				styleElement = document.createElement('style');
				styleElement.id = styleId;
				document.head.appendChild(styleElement);
			}

			// Sanitize CSS (basic check for dangerous patterns)
			const sanitizedCss = branding.customCss
				.replace(/javascript:/gi, '')
				.replace(/expression\(/gi, '')
				.replace(/@import/gi, '');

			styleElement.textContent = sanitizedCss;
		}

		// Cleanup on unmount
		return () => {
			if (branding.primaryColor) {
				root.style.removeProperty('--brand-primary');
			}
			if (branding.secondaryColor) {
				root.style.removeProperty('--brand-secondary');
			}
		};
	}, [branding]);

	// Helper methods
	const getLogo = (dark = false): string => {
		if (dark && branding.logoDark) {
			return branding.logoDark;
		}
		return branding.logo || DEFAULT_BRANDING.logo!;
	};

	const getCompanyName = (): string => {
		return branding.companyName || DEFAULT_BRANDING.companyName!;
	};

	const getSupportEmail = (): string => {
		return branding.supportEmail || DEFAULT_BRANDING.supportEmail!;
	};

	const getSupportUrl = (): string => {
		return branding.supportUrl || DEFAULT_BRANDING.supportUrl!;
	};

	const value: BrandingContextValue = {
		branding,
		isLoading,
		error: error as Error | null,
		getLogo,
		getCompanyName,
		getSupportEmail,
		getSupportUrl,
	};

	return (
		<BrandingContext.Provider value={value}>{children}</BrandingContext.Provider>
	);
}

/**
 * Hook to access branding context
 * @throws Error if used outside BrandingProvider
 */
export function useBrandingContext(): BrandingContextValue {
	const context = useContext(BrandingContext);

	if (context === undefined) {
		// Return default branding if context not available (graceful fallback)
		return {
			branding: DEFAULT_BRANDING,
			isLoading: false,
			error: null,
			getLogo: (dark = false) => (dark ? DEFAULT_BRANDING.logoDark! : DEFAULT_BRANDING.logo!),
			getCompanyName: () => DEFAULT_BRANDING.companyName!,
			getSupportEmail: () => DEFAULT_BRANDING.supportEmail!,
			getSupportUrl: () => DEFAULT_BRANDING.supportUrl!,
		};
	}

	return context;
}


