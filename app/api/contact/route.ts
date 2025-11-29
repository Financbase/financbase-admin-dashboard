/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDbOrThrow } from '@/lib/db';
import { contactSubmissions } from '@/lib/db/schemas/marketing-analytics.schema';
import { SecurityService } from '@/lib/security/arcjet-service';
import { EmailService } from '@/lib/email/service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';

// Validation schema for contact form
const contactFormSchema = z.object({
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters')
		.trim(),
	email: z
		.string()
		.email('Please enter a valid email address')
		.max(255, 'Email must be less than 255 characters')
		.toLowerCase()
		.trim(),
	company: z
		.string()
		.max(100, 'Company name must be less than 100 characters')
		.trim()
		.optional(),
	message: z
		.string()
		.min(10, 'Message must be at least 10 characters')
		.max(5000, 'Message must be less than 5000 characters')
		.trim(),
	// Honeypot field for spam protection
	website: z.string().max(0, 'Bot detected').optional().default(''),
	// Optional fields for source tracking and metadata
	source: z
		.string()
		.max(50, 'Source must be less than 50 characters')
		.trim()
		.optional(),
	metadata: z
		.record(z.string(), z.unknown())
		.optional(),
});

// Email validation regex (more comprehensive than basic email check)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function sanitizeInput(input: string): string {
	// Remove potentially harmful characters and normalize whitespace
	return input
		.replace(/[<>]/g, '') // Remove angle brackets
		.replace(/\s+/g, ' ') // Normalize whitespace
		.trim();
}

function validateEmail(email: string): boolean {
	return EMAIL_REGEX.test(email) && email.length <= 255;
}

function getClientIP(request: NextRequest): string {
	// Try to get IP from various headers (in order of preference)
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) {
		return forwarded.split(',')[0].trim();
	}
	
	const realIP = request.headers.get('x-real-ip');
	if (realIP) {
		return realIP;
	}
	
	// NextRequest doesn't have .ip property directly
	// Return 'unknown' as fallback if headers don't have IP info
	return 'unknown';
}

export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		// Apply security checks (rate limiting, bot detection, threat protection)
		const securityCheck = await SecurityService.securityCheck(
			request,
			'/api/contact'
		);

		if (securityCheck.denied) {
			// Keep security-specific response format for rate limiting
			if (securityCheck.status === 429) {
				return ApiErrorHandler.rateLimitExceeded(
					securityCheck.reasons?.join(', ') || 'Too many requests'
				);
			}
			return NextResponse.json(
				{
					error: 'Request denied for security reasons',
					details: securityCheck.reasons,
					requestId,
				},
				{
					status: securityCheck.status || 403,
					headers: {
						'X-RateLimit-Remaining': securityCheck.rateLimitRemaining
							? String(securityCheck.rateLimitRemaining)
							: '0',
					},
				}
			);
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		// Validate request body
		const validationResult = contactFormSchema.safeParse(body);

		if (!validationResult.success) {
			return ApiErrorHandler.validationError(validationResult.error, requestId);
		}

		const { name, email, company, message, website, source, metadata } = validationResult.data;

		// Additional honeypot check (should be empty)
		if (website && website.length > 0) {
			return ApiErrorHandler.badRequest('Spam detected');
		}

		// Additional email validation
		if (!validateEmail(email)) {
			return ApiErrorHandler.badRequest('Invalid email address format');
		}

		// Sanitize inputs
		const sanitizedName = sanitizeInput(name);
		const sanitizedEmail = email.toLowerCase().trim();
		const sanitizedCompany = company ? sanitizeInput(company) : null;
		const sanitizedMessage = sanitizeInput(message);

		// Check for potential spam patterns in message
		const spamPatterns = [
			/http[s]?:\/\//gi, // URLs (allow some URLs, but flag excessive)
			/(.)\1{4,}/gi, // Repeated characters (like "aaaaaaa")
			/\b(viagra|casino|lottery|winner|prize|click here|buy now)\b/gi, // Common spam words
		];

		const urlCount = (sanitizedMessage.match(/http[s]?:\/\//gi) || []).length;
		if (urlCount > 3) {
			return ApiErrorHandler.badRequest('Message contains too many links');
		}

		// Get client information
		const ipAddress = getClientIP(request);
		const userAgent = request.headers.get('user-agent') || 'unknown';
		const referrer = request.headers.get('referer') || 'unknown';

		// Determine source - use provided source, detect from referrer, or default to 'contact_page'
		let submissionSource = source || 'contact_page';
		if (!source && referrer !== 'unknown') {
			try {
				const referrerUrl = new URL(referrer);
				if (referrerUrl.pathname.includes('/consulting')) {
					submissionSource = 'consulting_page';
				} else if (referrerUrl.pathname.includes('/enterprise')) {
					submissionSource = 'enterprise_page';
				} else if (referrerUrl.pathname.includes('/support')) {
					submissionSource = 'support_page';
				}
			} catch {
				// If referrer is not a valid URL, check if it contains the path
				if (referrer.includes('/consulting')) {
					submissionSource = 'consulting_page';
				} else if (referrer.includes('/enterprise')) {
					submissionSource = 'enterprise_page';
				} else if (referrer.includes('/support')) {
					submissionSource = 'support_page';
				}
			}
		}

		// Prepare metadata JSON string if provided
		const metadataJson = metadata ? JSON.stringify(metadata) : null;

		// Store submission in database
		const db = getDbOrThrow();
		
		const [submission] = await db
			.insert(contactSubmissions)
			.values({
				name: sanitizedName,
				email: sanitizedEmail,
				company: sanitizedCompany,
				message: sanitizedMessage,
				status: 'new',
				priority: 'medium',
				ipAddress,
				userAgent,
				referrer,
				source: submissionSource,
				metadata: metadataJson,
			})
			.returning();

		// Prepare email content with metadata if available
		let emailSubject = `New Contact Form Submission from ${sanitizedName}`;
		if (submissionSource === 'consulting_page') {
			emailSubject = `New Consulting Inquiry from ${sanitizedName}`;
		} else if (submissionSource === 'enterprise_page') {
			emailSubject = `New Enterprise Inquiry from ${sanitizedName}`;
		}

		let metadataHtml = '';
		let metadataText = '';
		if (metadata) {
			const metadataEntries = Object.entries(metadata)
				.filter(([key]) => key !== 'website') // Exclude honeypot
				.map(([key, value]) => {
					const displayKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
					return { key: displayKey, value: String(value) };
				});

			if (metadataEntries.length > 0) {
				metadataHtml = '<p><strong>Additional Information:</strong></p><ul>';
				metadataText = '\n\nAdditional Information:\n';
				metadataEntries.forEach(({ key, value }) => {
					metadataHtml += `<li><strong>${key}:</strong> ${value}</li>`;
					metadataText += `${key}: ${value}\n`;
				});
				metadataHtml += '</ul>';
			}
		}

		// Send notification email (async - don't wait for it)
		EmailService.sendEmail({
			to: { email: process.env.CONTACT_NOTIFICATION_EMAIL || 'hello@financbase.com' },
			subject: emailSubject,
			html: `
				<h2>New ${submissionSource === 'consulting_page' ? 'Consulting' : submissionSource === 'enterprise_page' ? 'Enterprise' : 'Contact'} Form Submission</h2>
				<p><strong>Name:</strong> ${sanitizedName}</p>
				<p><strong>Email:</strong> ${sanitizedEmail}</p>
				${sanitizedCompany ? `<p><strong>Company:</strong> ${sanitizedCompany}</p>` : ''}
				${metadataHtml}
				<p><strong>Message:</strong></p>
				<p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
				<hr>
				<p><small>Source: ${submissionSource}</small></p>
				<p><small>Submitted at: ${new Date().toISOString()}</small></p>
				<p><small>IP Address: ${ipAddress}</small></p>
			`,
			text: `
New ${submissionSource === 'consulting_page' ? 'Consulting' : submissionSource === 'enterprise_page' ? 'Enterprise' : 'Contact'} Form Submission

Name: ${sanitizedName}
Email: ${sanitizedEmail}
${sanitizedCompany ? `Company: ${sanitizedCompany}` : ''}${metadataText}

Message:
${sanitizedMessage}

---
Source: ${submissionSource}
Submitted at: ${new Date().toISOString()}
IP Address: ${ipAddress}
			`,
			replyTo: sanitizedEmail,
		}).catch((error) => {
			// Log email error but don't fail the request
			logger.error('Failed to send contact notification email:', error);
		});

		// Return success response
		return NextResponse.json(
			{
				success: true,
				message:
					'Thank you for contacting us! We will get back to you within 24 hours.',
				submissionId: submission.id,
			},
			{
				status: 200,
				headers: {
					'X-RateLimit-Remaining': securityCheck.rateLimitRemaining
						? String(securityCheck.rateLimitRemaining)
						: '0',
				},
			}
		);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
