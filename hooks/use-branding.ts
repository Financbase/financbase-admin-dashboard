/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import type { WhiteLabelBranding } from '@/types/white-label';

async function fetchBranding(workspaceId?: string, organizationId?: string): Promise<WhiteLabelBranding> {
	const params = new URLSearchParams();
	if (workspaceId) params.set('workspaceId', workspaceId);
	if (organizationId) params.set('organizationId', organizationId);

	const response = await fetch(`/api/settings/white-label?${params.toString()}`);
	if (!response.ok) {
		throw new Error('Failed to fetch branding');
	}

	return response.json();
}

/**
 * Hook to get branding configuration for current workspace/organization
 */
export function useBranding(workspaceId?: string, organizationId?: string) {
	return useQuery({
		queryKey: ['branding', workspaceId, organizationId],
		queryFn: () => fetchBranding(workspaceId, organizationId),
		staleTime: 5 * 60 * 1000, // 5 minutes
		retry: 1,
	});
}

