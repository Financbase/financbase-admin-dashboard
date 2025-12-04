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

// Validation schema for support form
const supportFormSchema = z.object({
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
	subject: z
		.string()
		.min(1, 'Subject is required')
		.max(200, 'Subject must be less than 200 characters')
		.trim(),
	message: z
		.string()
		.min(10, 'Message must be at least 10 characters')
		.max(5000, 'Message must be less than 5000 characters')
		.trim(),
	category: z
		.enum(['technical', 'billing', 'feature_request', 'bug_report', 'general'])
		.default('general'),
	priority: z
		.enum(['low', 'medium', 'high', 'critical'])
		.default('medium'),
	// Honeypot field for spam protection
	website: z.string().max(0, 'Bot detected').optional().default(''),
});

// Email validation regex (RFC 5322 compliant subset)
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
	
	// NextRequest doesn't have .ip property, use 'unknown' as fallback
	return 'unknown';
}

function generateTicketNumber(): string {
	// Generate a ticket number: SUPPORT-YYYYMMDD-XXXX format
	const date = new Date();
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	const random = Math.floor(Math.random() * 10000)
		.toString()
		.padStart(4, '0');
	return `SUPPORT-${year}${month}${day}-${random}`;
}

export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		// Apply security checks (rate limiting, bot detection, threat protection)
		const securityCheck = await SecurityService.securityCheck(
			request,
			'/api/support/public'
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
			return ApiErrorHandler.badRequest('Invalid JSON in request body', requestId);
		}

		// Validate request body
		const validationResult = supportFormSchema.safeParse(body);

		if (!validationResult.success) {
			return ApiErrorHandler.validationError(validationResult.error, requestId);
		}

		const { name, email, subject, message, category, priority, website } =
			validationResult.data;

		// Additional honeypot check (should be empty)
		if (website && website.length > 0) {
			return ApiErrorHandler.badRequest('Spam detected', requestId);
		}

		// Additional email validation
		if (!validateEmail(email)) {
			return ApiErrorHandler.badRequest('Invalid email address format', requestId);
		}

		// Sanitize inputs
		const sanitizedName = sanitizeInput(name);
		const sanitizedEmail = email.toLowerCase().trim();
		const sanitizedSubject = sanitizeInput(subject);
		const sanitizedMessage = sanitizeInput(message);

		// Combine subject and message for contactSubmissions table
		const fullMessage = `Subject: ${sanitizedSubject}\n\n${sanitizedMessage}`;

		// Check for potential spam patterns in message
		const urlCount = (sanitizedMessage.match(/http[s]?:\/\//gi) || []).length;
		if (urlCount > 3) {
			return ApiErrorHandler.badRequest('Message contains too many links', requestId);
		}

		// Get client information
		const ipAddress = getClientIP(request);
		const userAgent = request.headers.get('user-agent') || 'unknown';
		const referrer = request.headers.get('referer') || 'unknown';

		// Generate ticket number
		const ticketNumber = generateTicketNumber();

		// Store submission in database
		const db = getDbOrThrow();

		const [submission] = await db
			.insert(contactSubmissions)
			.values({
				name: sanitizedName,
				email: sanitizedEmail,
				message: fullMessage,
				status: 'new',
				priority: priority === 'critical' ? 'urgent' : priority === 'high' ? 'high' : 'medium',
				ipAddress,
				userAgent,
				referrer,
				source: 'support_page',
				metadata: JSON.stringify({
					ticketNumber,
					category,
					subject: sanitizedSubject,
					originalPriority: priority,
				}),
			})
			.returning();

		// Send notification email (async - don't wait for it)
		EmailService.sendEmail({
			to: process.env.SUPPORT_NOTIFICATION_EMAIL || process.env.CONTACT_NOTIFICATION_EMAIL || 'support@financbase.com',
			subject: `[${ticketNumber}] Support Request: ${sanitizedSubject}`,
			html: `
				<h2>New Support Request - ${ticketNumber}</h2>
				<p><strong>Name:</strong> ${sanitizedName}</p>
				<p><strong>Email:</strong> ${sanitizedEmail}</p>
				<p><strong>Category:</strong> ${category}</p>
				<p><strong>Priority:</strong> ${priority}</p>
				<p><strong>Subject:</strong> ${sanitizedSubject}</p>
				<p><strong>Message:</strong></p>
				<p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
				<hr>
				<p><small>Submitted at: ${new Date().toISOString()}</small></p>
				<p><small>IP Address: ${ipAddress}</small></p>
			`,
			text: `
New Support Request - ${ticketNumber}

Name: ${sanitizedName}
Email: ${sanitizedEmail}
Category: ${category}
Priority: ${priority}
Subject: ${sanitizedSubject}

Message:
${sanitizedMessage}

---
Submitted at: ${new Date().toISOString()}
IP Address: ${ipAddress}
			`,
			replyTo: sanitizedEmail,
		}).catch((error) => {
			// Log email error but don't fail the request
			logger.error('Failed to send support notification email:', error);
		});

		// Return success response
		return NextResponse.json(
			{
				success: true,
				message:
					'Thank you for contacting support! We will respond within 24 hours.',
				submissionId: submission.id,
				ticketNumber,
				requestId,
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
