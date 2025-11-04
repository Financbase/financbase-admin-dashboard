/**
 * URL Sanitization Utilities
 * Provides safe URL validation and sanitization functions to prevent XSS and open redirect attacks
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


/**
 * Validates if a URL is safe for use in href attributes
 * @param url - The URL to validate
 * @param allowedProtocols - Array of allowed protocols (default: ['http:', 'https:'])
 * @returns true if URL is safe, false otherwise
 */
export function isSafeUrl(
	url: string,
	allowedProtocols: string[] = ['http:', 'https:']
): boolean {
	if (!url || typeof url !== 'string') {
		return false;
	}

	// Allow relative paths
	if (url.startsWith('/')) {
		return true;
	}

	try {
		const urlObj = new URL(url);
		
		// Check protocol is allowed
		if (!allowedProtocols.includes(urlObj.protocol)) {
			return false;
		}

		// Block javascript:, data:, and vbscript: protocols
		const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
		if (dangerousProtocols.some(proto => urlObj.protocol.toLowerCase().startsWith(proto))) {
			return false;
		}

		return true;
	} catch {
		// Invalid URL format
		return false;
	}
}

/**
 * Sanitizes a URL for use in href or src attributes
 * @param url - The URL to sanitize
 * @param fallback - Fallback URL if sanitization fails (default: '#')
 * @returns Sanitized URL or fallback
 */
export function sanitizeUrl(url: string | null | undefined, fallback: string = '#'): string {
	if (!url || typeof url !== 'string') {
		return fallback;
	}

	// Allow relative paths
	if (url.startsWith('/')) {
		return url;
	}

	if (isSafeUrl(url)) {
		return url;
	}

	return fallback;
}

/**
 * Validates if a URL is from the same origin
 * @param url - The URL to validate
 * @returns true if URL is same-origin, false otherwise
 */
export function isSameOrigin(url: string): boolean {
	if (!url || typeof url !== 'string') {
		return false;
	}

	try {
		const urlObj = new URL(url, window.location.origin);
		return urlObj.origin === window.location.origin;
	} catch {
		// Relative URLs are considered same-origin
		return url.startsWith('/');
	}
}

/**
 * Sanitizes image src URLs to prevent XSS
 * @param url - The image URL to sanitize
 * @param fallback - Fallback image (default: placeholder or empty)
 * @returns Sanitized URL
 */
export function sanitizeImageSrc(url: string | null | undefined, fallback: string = ''): string {
	if (!url || typeof url !== 'string') {
		return fallback;
	}

	// Allow data URLs for images (base64 encoded images)
	if (url.startsWith('data:image/')) {
		// Validate it's actually an image data URL
		if (/^data:image\/(png|jpg|jpeg|gif|webp|svg\+xml);base64,/.test(url)) {
			return url;
		}
		return fallback;
	}

	// Allow blob URLs (created by URL.createObjectURL)
	if (url.startsWith('blob:')) {
		return url;
	}

	// Sanitize regular URLs
	return sanitizeUrl(url, fallback);
}

