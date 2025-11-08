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
import { newsletterSubscriptions } from '@/lib/db/schemas/newsletter.schema';
import { SecurityService } from '@/lib/security/arcjet-service';
import { EmailService } from '@/lib/email/service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';

// Validation schema for newsletter subscription
const newsletterSubscriptionSchema = z.object({
	email: z
		.string()
		.email('Please enter a valid email address')
		.max(255, 'Email must be less than 255 characters')
		.toLowerCase()
		.trim(),
	source: z
		.string()
		.max(50, 'Source must be less than 50 characters')
		.trim()
		.optional(),
	// Honeypot field for spam protection
	website: z.string().max(0, 'Bot detected').optional().default(''),
});

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

function validateEmail(email: string): boolean {
	return EMAIL_REGEX.test(email);
}

function sanitizeInput(input: string): string {
	return input.trim().replace(/[<>]/g, '');
}

function getClientIP(request: NextRequest): string {
	const forwarded = request.headers.get('x-forwarded-for');
	if (forwarded) {
		return forwarded.split(',')[0].trim();
	}
	const realIP = request.headers.get('x-real-ip');
	if (realIP) {
		return realIP;
	}
	return 'unknown';
}

function generateUnsubscribeToken(): string {
	return randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		// Apply security checks (rate limiting, bot detection, threat protection)
		const securityCheck = await SecurityService.securityCheck(
			request,
			'/api/newsletter/subscribe'
		);

		if (securityCheck.denied) {
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
		const validationResult = newsletterSubscriptionSchema.safeParse(body);

		if (!validationResult.success) {
			return ApiErrorHandler.validationError(validationResult.error, requestId);
		}

		const { email, source, website } = validationResult.data;

		// Additional honeypot check (should be empty)
		if (website && website.length > 0) {
			return ApiErrorHandler.badRequest('Spam detected');
		}

		// Additional email validation
		if (!validateEmail(email)) {
			return ApiErrorHandler.badRequest('Invalid email address format');
		}

		// Sanitize inputs
		const sanitizedEmail = email.toLowerCase().trim();

		const db = getDbOrThrow();

		// Check if email already exists
		const existing = await db
			.select()
			.from(newsletterSubscriptions)
			.where(eq(newsletterSubscriptions.email, sanitizedEmail))
			.limit(1);

		// If already subscribed, return success (don't reveal if email exists)
		if (existing.length > 0) {
			return NextResponse.json({
				success: true,
				message: 'Thank you for subscribing!',
				requestId,
			});
		}

		// Generate unsubscribe token
		const unsubscribeToken = generateUnsubscribeToken();

		// Get client information for metadata
		const clientIP = getClientIP(request);
		const userAgent = request.headers.get('user-agent') || 'unknown';

		// Create subscription
		const [subscription] = await db
			.insert(newsletterSubscriptions)
			.values({
				email: sanitizedEmail,
				status: 'subscribed',
				source: source || 'blog',
				unsubscribeToken,
				metadata: {
					ip: clientIP,
					userAgent,
					subscribedAt: new Date().toISOString(),
				},
			})
			.returning();

		// Send confirmation email
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3010';
		const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

		const emailResult = await EmailService.sendEmail({
			to: { email: sanitizedEmail },
			subject: 'Welcome to Financbase Newsletter!',
			html: `
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Welcome to Financbase Newsletter</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
	<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
		<h1 style="color: white; margin: 0; font-size: 28px;">🏦 Financbase</h1>
		<p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Professional Financial Management</p>
	</div>
	<div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
		<h2 style="color: #333; margin-top: 0;">Welcome to Our Newsletter!</h2>
		<p>Thank you for subscribing to the Financbase newsletter. You'll receive the latest insights, updates, and tips delivered directly to your inbox.</p>
		<p>We're excited to share:</p>
		<ul>
			<li>Latest financial management tips and best practices</li>
			<li>Product updates and new features</li>
			<li>Industry insights and trends</li>
			<li>Exclusive content and resources</li>
		</ul>
		<p>If you didn't subscribe to this newsletter, you can safely ignore this email.</p>
		<p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
			Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #667eea;">Unsubscribe here</a>
		</p>
	</div>
</body>
</html>
			`,
			text: `Welcome to Financbase Newsletter!

Thank you for subscribing to the Financbase newsletter. You'll receive the latest insights, updates, and tips delivered directly to your inbox.

If you didn't subscribe to this newsletter, you can safely ignore this email.

Unsubscribe: ${unsubscribeUrl}
			`,
		});

		// Don't fail the subscription if email fails - log but continue
		if (!emailResult.success) {
			console.error('Failed to send confirmation email:', emailResult.error);
		}

		return NextResponse.json({
			success: true,
			message: 'Thank you for subscribing! Please check your email for confirmation.',
			requestId,
		}, { status: 201 });

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
