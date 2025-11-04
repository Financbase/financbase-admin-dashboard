/**
 * API Version Context
 * Provides version information to route handlers
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { NextRequest } from 'next/server';
import { getApiVersion, extractApiVersion, type ApiVersion } from './versioning';

/**
 * Get API version context from request
 * Can be used in route handlers to access version information
 */
export function getApiVersionContext(request: NextRequest) {
	const pathname = request.nextUrl.pathname;
	const extractedVersion = extractApiVersion(pathname);
	const version = extractedVersion || 'v1'; // Default to v1
	const isVersioned = extractedVersion !== null;
	const isLegacy = !isVersioned && pathname.startsWith('/api/');

	return {
		version: version as ApiVersion,
		isVersioned,
		isLegacy,
		isV1: version === 'v1',
		isV2: version === 'v2',
	};
}

/**
 * Add version headers to response
 * Use this in route handlers to ensure version headers are set
 */
export function setVersionHeaders(response: Response, version: ApiVersion) {
	response.headers.set('X-API-Version', version);
	return response;
}

