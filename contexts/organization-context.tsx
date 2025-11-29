/**
 * Organization Context
 * Provides active organization state management with session sync
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface Organization {
	id: string;
	name: string;
	slug?: string | null;
	description?: string | null;
	logo?: string | null;
	role?: 'owner' | 'admin' | 'member' | 'viewer';
	memberCount?: number;
}

interface OrganizationContextValue {
	activeOrganization: Organization | null;
	organizations: Organization[];
	loading: boolean;
	error: string | null;
	switchOrganization: (organizationId: string) => Promise<void>;
	refreshOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

interface OrganizationProviderProps {
	children: ReactNode;
	initialOrganizationId?: string | null;
}

export function OrganizationProvider({ children, initialOrganizationId }: OrganizationProviderProps) {
	const [activeOrganization, setActiveOrganization] = useState<Organization | null>(null);
	const [organizations, setOrganizations] = useState<Organization[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	// Fetch user's organizations
	const fetchOrganizations = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			// Read cookie first to get active organization preference
			const cookieValue = typeof document !== 'undefined' 
				? document.cookie
					.split('; ')
					.find((row) => row.startsWith('active_organization_id='))
					?.split('=')[1]
				: null;

			const response = await fetch('/api/organizations');
			if (!response.ok) {
				throw new Error('Failed to fetch organizations');
			}

			const data = await response.json();
			if (data.success && data.data) {
				const orgs = data.data.map((uo: { organization: Organization; role: string }) => ({
					...uo.organization,
					role: uo.role,
				}));
				setOrganizations(orgs);

				// Set active organization with priority: cookie > initialOrganizationId > first org
				if (orgs.length > 0) {
					let activeOrg = orgs[0];
					
					// Priority 1: Cookie value (session-based)
					if (cookieValue) {
						const found = orgs.find((o: Organization) => o.id === cookieValue);
						if (found) {
							activeOrg = found;
						}
					}
					// Priority 2: initialOrganizationId prop
					else if (initialOrganizationId) {
						const found = orgs.find((o: Organization) => o.id === initialOrganizationId);
						if (found) activeOrg = found;
					}
					// Priority 3: First organization (default)
					
					setActiveOrganization(activeOrg);
				}
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load organizations');
			console.error('[OrganizationContext] Error fetching organizations:', err);
		} finally {
			setLoading(false);
		}
	}, [initialOrganizationId]);

	// Switch active organization
	const switchOrganization = useCallback(async (organizationId: string) => {
		try {
			setError(null);

			const response = await fetch(`/api/organizations/${organizationId}/switch`, {
				method: 'POST',
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Failed to switch organization');
			}

			const data = await response.json();
			if (data.success && data.data) {
				const org = organizations.find((o) => o.id === organizationId);
				if (org) {
					setActiveOrganization(org);
					// Refresh the page to ensure all data is reloaded with new organization context
					router.refresh();
				}
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to switch organization');
			throw err;
		}
	}, [organizations, router]);

	// Initial load
	useEffect(() => {
		fetchOrganizations();
	}, [fetchOrganizations]);

	const value: OrganizationContextValue = {
		activeOrganization,
		organizations,
		loading,
		error,
		switchOrganization,
		refreshOrganizations: fetchOrganizations,
	};

	return (
		<OrganizationContext.Provider value={value}>
			{children}
		</OrganizationContext.Provider>
	);
}

/**
 * Hook to use organization context
 */
export function useOrganization() {
	const context = useContext(OrganizationContext);
	if (context === undefined) {
		throw new Error('useOrganization must be used within an OrganizationProvider');
	}
	return context;
}

/**
 * Hook to get active organization only
 */
export function useActiveOrganization() {
	const { activeOrganization } = useOrganization();
	return activeOrganization;
}

