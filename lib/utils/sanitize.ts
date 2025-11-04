/**
 * HTML sanitization utilities using DOMPurify
 * Provides safe HTML sanitization for preventing XSS attacks
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
 * Sanitizes HTML content to prevent XSS attacks
 * Uses DOMPurify when available, falls back to basic sanitization on server-side
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(html: string): string {
	if (!html || typeof html !== 'string') {
		return '';
	}

	// Server-side: basic sanitization (remove script tags and dangerous attributes)
	if (typeof window === 'undefined') {
		return sanitizeHtmlBasic(html);
	}

	// Client-side: use DOMPurify for comprehensive sanitization
	try {
		// Dynamic import to avoid SSR issues
		const DOMPurify = require('dompurify');
		return DOMPurify.sanitize(html, {
			ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'],
			ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
			ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
		});
	} catch (error) {
		console.warn('DOMPurify not available, using basic sanitization:', error);
		return sanitizeHtmlBasic(html);
	}
}

/**
 * Basic HTML sanitization for server-side use
 * Removes script tags and dangerous attributes
 * @param html - The HTML content to sanitize
 * @returns Sanitized HTML string
 */
function sanitizeHtmlBasic(html: string): string {
	if (typeof html !== 'string') {
		return '';
	}

	// Remove script tags and their content
	let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
	
	// Remove event handlers (onclick, onerror, etc.)
	sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
	sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');
	
	// Remove javascript: and data: URLs
	sanitized = sanitized.replace(/javascript:/gi, '');
	sanitized = sanitized.replace(/data:text\/html/gi, '');
	
	return sanitized;
}

/**
 * Sanitizes plain text by escaping HTML entities
 * @param text - The text to sanitize
 * @returns Escaped HTML string
 */
export function sanitizeText(text: string): string {
	if (typeof text !== 'string') {
		return '';
	}

	const entityMap: Record<string, string> = {
		'&': '&amp;',
		'<': '&lt;',
		'>': '&gt;',
		'"': '&quot;',
		"'": '&#39;',
		'/': '&#x2F;',
	};

	return text.replace(/[&<>"'/]/g, (s) => entityMap[s]);
}

/**
 * Sanitizes content based on type (html or text)
 * @param content - The content to sanitize
 * @param contentType - 'html' or 'text'
 * @returns Sanitized content
 */
export function sanitizeContent(content: string, contentType: 'html' | 'text' = 'html'): string {
	if (contentType === 'html') {
		return sanitizeHtml(content);
	}
	return sanitizeText(content);
}

