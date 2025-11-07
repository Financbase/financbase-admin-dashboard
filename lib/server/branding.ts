/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import 'server-only';

import { whiteLabelService } from '@/lib/services/white-label-service';
import type { WhiteLabelBranding } from '@/types/white-label';
import { DEFAULT_BRANDING } from '@/types/white-label';

/**
 * Server-side helper to get branding for a request
 * This can be used in server components and API routes
 */
export async function getBrandingForRequest(
	workspaceId?: string,
	organizationId?: string,
): Promise<WhiteLabelBranding> {
	try {
		return await whiteLabelService.getBranding(workspaceId, organizationId);
	} catch (error) {
		console.error('Error fetching branding for request:', error);
		return DEFAULT_BRANDING;
	}
}

