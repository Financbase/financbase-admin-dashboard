/**
 * API Versioning Utilities
 * 
 * Provides utilities for managing API versions and handling version-specific logic.
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { NextRequest, NextResponse } from 'next/server';

export type ApiVersion = 'v1' | 'v2' | 'latest';

/**
 * Extract API version from request path
 * @param pathname - Request pathname
 * @returns API version or null if not versioned
 */
export function extractApiVersion(pathname: string): ApiVersion | null {
  const versionMatch = pathname.match(/^\/api\/(v\d+)\//);
  if (versionMatch) {
    const version = versionMatch[1] as ApiVersion;
    return version;
  }
  return null;
}

/**
 * Get API version from request
 * @param request - Next.js request object
 * @returns API version (defaults to 'v1' for unversioned routes)
 */
export function getApiVersion(request: NextRequest): ApiVersion {
  const version = extractApiVersion(request.nextUrl.pathname);
  return version || 'v1'; // Default to v1 for backward compatibility
}

/**
 * Check if request is for a specific API version
 * @param request - Next.js request object
 * @param version - Version to check
 * @returns True if request is for the specified version
 */
export function isApiVersion(request: NextRequest, version: ApiVersion): boolean {
  return getApiVersion(request) === version;
}

/**
 * Create a versioned API path
 * @param version - API version
 * @param path - API path (without /api prefix)
 * @returns Versioned path
 */
export function createVersionedPath(version: ApiVersion, path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/api/${version}/${cleanPath}`;
}

/**
 * Rewrite request to versioned path
 * @param request - Next.js request object
 * @param targetVersion - Target API version
 * @returns NextResponse with rewritten URL or null if no rewrite needed
 */
export function rewriteToVersion(
  request: NextRequest,
  targetVersion: ApiVersion
): NextResponse | null {
  const { pathname } = request.nextUrl;

  // Don't rewrite if already versioned
  if (pathname.match(/^\/api\/v\d+\//)) {
    return null;
  }

  // Don't rewrite non-API paths
  if (!pathname.startsWith('/api/')) {
    return null;
  }

  // Don't rewrite health check or webhooks
  if (
    pathname === '/api/health' ||
    pathname.startsWith('/api/webhooks') ||
    pathname.startsWith('/api/v1/') ||
    pathname.startsWith('/api/v2/')
  ) {
    return null;
  }

  // Rewrite to versioned path
  const versionedPath = pathname.replace('/api/', `/api/${targetVersion}/`);
  const url = request.nextUrl.clone();
  url.pathname = versionedPath;

  return NextResponse.rewrite(url);
}

/**
 * Add version header to response
 * @param response - Next.js response
 * @param version - API version
 * @returns Response with version header
 */
export function addVersionHeader(response: NextResponse, version: ApiVersion): NextResponse {
  response.headers.set('X-API-Version', version);
  return response;
}

/**
 * Add deprecation warning for legacy (unversioned) API routes
 * @param response - Next.js response
 * @param deprecatedVersion - Version being deprecated
 * @param sunsetDate - Date when deprecated version will be removed
 * @returns Response with deprecation headers
 */
export function addDeprecationWarning(
  response: NextResponse,
  deprecatedVersion: ApiVersion | 'unversioned',
  sunsetDate: string
): NextResponse {
  response.headers.set('X-API-Deprecated', 'true');
  response.headers.set('X-API-Deprecated-Version', deprecatedVersion);
  response.headers.set('Sunset', sunsetDate);
  response.headers.set(
    'Link',
    `<${response.headers.get('X-API-Version') || 'v1'}>; rel="successor-version"`
  );
  // Add warning message in body or header
  response.headers.set(
    'Warning',
    `299 - "Using unversioned API endpoints is deprecated. Migrate to versioned endpoints (e.g., /api/v1/...) before ${sunsetDate}"`
  );
  return response;
}

/**
 * API Version Configuration
 */
export const API_VERSIONS = {
  v1: {
    version: 'v1' as ApiVersion,
    status: 'stable' as const,
    deprecationDate: null as string | null,
    sunsetDate: null as string | null,
    description: 'Stable API version - recommended for production use',
  },
  v2: {
    version: 'v2' as ApiVersion,
    status: 'beta' as const,
    deprecationDate: null as string | null,
    sunsetDate: null as string | null,
    description: 'Next-generation API with improved features and performance',
  },
} as const;

/**
 * Get API version information
 * @param version - API version
 * @returns Version information or null if version doesn't exist
 */
export function getVersionInfo(version: ApiVersion) {
  // Handle 'latest' by mapping to v2 (or v1 if v2 is not stable)
  if (version === 'latest') {
    return API_VERSIONS.v2; // Return latest version (v2)
  }
  
  // Type guard to ensure version is a valid key
  if (version in API_VERSIONS) {
    return API_VERSIONS[version as keyof typeof API_VERSIONS] || null;
  }
  
  return null;
}

/**
 * Middleware helper to handle API versioning
 * Adds version headers and deprecation warnings to responses
 * @param request - Next.js request object
 * @returns Response with version headers or null to continue
 */
export function handleApiVersioning(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;

  // Only handle API routes
  if (!pathname.startsWith('/api/')) {
    return null;
  }

  // Skip special routes that shouldn't be versioned
  const specialRoutes = [
    '/api/health',
    '/api/webhooks',
    '/api/docs',
    '/api/test-',
    '/api/contact',
    '/api/feature-flags/check',
  ];
  
  const isSpecialRoute = specialRoutes.some(route => pathname.startsWith(route));
  if (isSpecialRoute) {
    return null;
  }

  const extractedVersion = extractApiVersion(pathname);
  const response = NextResponse.next();

  // If versioned route (e.g., /api/v1/... or /api/v2/...)
  if (extractedVersion) {
    const versionInfo = getVersionInfo(extractedVersion);
    if (versionInfo) {
      addVersionHeader(response, extractedVersion);
      
      // Add deprecation warning if version is deprecated
      if (versionInfo.status === 'deprecated' && versionInfo.sunsetDate) {
        addDeprecationWarning(response, extractedVersion, versionInfo.sunsetDate);
      }
    }
    return response;
  }

  // For unversioned routes, add v1 header with deprecation warning
  // This encourages migration to versioned URLs without breaking existing functionality
  addVersionHeader(response, 'v1');
  // Warn that unversioned URLs are deprecated (but v1 itself is stable)
  response.headers.set('X-API-Deprecated', 'true');
  response.headers.set('X-API-Deprecated-Version', 'unversioned');
  response.headers.set('Sunset', '2025-12-31');
  response.headers.set('Link', '<v1>; rel="successor-version"');
  response.headers.set(
    'Warning',
    '299 - "Using unversioned API endpoints is deprecated. Migrate to /api/v1/... before 2025-12-31"'
  );

  return response;
}
