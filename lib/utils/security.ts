/**
 * Security utilities for URL validation and path sanitization
 */

/**
 * Validates if a URL is safe for redirects
 * Only allows relative paths or same-origin URLs
 * @param url - The URL to validate
 * @param baseOrigin - The base origin to compare against (defaults to window.location.origin)
 * @returns true if the URL is safe, false otherwise
 */
export function isSafeRedirectUrl(url: string, baseOrigin?: string): boolean {
	if (!url || typeof url !== 'string') {
		return false;
	}

	// Allow relative paths (starting with /)
	if (url.startsWith('/')) {
		// Validate relative path doesn't contain dangerous patterns
		// Block protocols in relative paths (e.g., //evil.com)
		if (url.startsWith('//')) {
			return false;
		}
		// Block dangerous protocols: javascript:, data:, vbscript:
		const lowerUrl = url.toLowerCase();
		if (lowerUrl.startsWith('javascript:') || 
			lowerUrl.startsWith('data:') || 
			lowerUrl.startsWith('vbscript:')) {
			return false;
		}
		return true;
	}

	// For absolute URLs, validate against base origin
	if (typeof window === 'undefined') {
		// Server-side: use provided baseOrigin or reject
		if (!baseOrigin) {
			return false;
		}
		try {
			const urlObj = new URL(url);
			return urlObj.origin === baseOrigin;
		} catch {
			return false;
		}
	}

	// Client-side: validate against current origin
	try {
		const urlObj = new URL(url, window.location.origin);
		const currentOrigin = baseOrigin || window.location.origin;
		
		// Only allow same-origin URLs
		if (urlObj.origin !== currentOrigin) {
			return false;
		}

		// Block javascript: and data: protocols
		if (urlObj.protocol === 'javascript:' || urlObj.protocol === 'data:') {
			return false;
		}

		return true;
	} catch {
		return false;
	}
}

/**
 * Sanitizes a file path to prevent directory traversal
 * @param filePath - The file path to sanitize
 * @param baseDir - The base directory that paths must be within
 * @returns The normalized path if safe, null otherwise
 */
export function sanitizeFilePath(filePath: string, baseDir: string): string | null {
	if (!filePath || typeof filePath !== 'string') {
		return null;
	}

	const path = require('path');
	
	try {
		// Resolve both paths to absolute paths
		const resolvedBase = path.resolve(baseDir);
		const resolvedPath = path.resolve(baseDir, filePath);
		
		// Normalize paths to handle .. and . segments
		const normalizedBase = path.normalize(resolvedBase);
		const normalizedPath = path.normalize(resolvedPath);
		
		// Ensure the resolved path is within the base directory
		if (!normalizedPath.startsWith(normalizedBase + path.sep) && normalizedPath !== normalizedBase) {
			return null;
		}
		
		return normalizedPath;
	} catch {
		return null;
	}
}

/**
 * Validates a URL is safe and returns it, or returns null if unsafe
 * @param url - The URL to validate
 * @param baseOrigin - Optional base origin for validation
 * @returns The URL if safe, null otherwise
 */
export function validateSafeUrl(url: string, baseOrigin?: string): string | null {
	return isSafeRedirectUrl(url, baseOrigin) ? url : null;
}

