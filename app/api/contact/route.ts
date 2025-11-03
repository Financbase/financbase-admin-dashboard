import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDbOrThrow } from '@/lib/db';
import { contactSubmissions } from '@/lib/db/schemas/marketing-analytics.schema';
import { SecurityService } from '@/lib/security/arcjet-service';
import { EmailService } from '@/lib/email/service';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

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
	
	return request.ip || 'unknown';
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
			return ApiErrorHandler.badRequest('Invalid JSON in request body', requestId);
		}

		// Validate request body
		const validationResult = contactFormSchema.safeParse(body);

		if (!validationResult.success) {
			return ApiErrorHandler.validationError(validationResult.error, requestId);
		}

		const { name, email, company, message, website } = validationResult.data;

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
			return ApiErrorHandler.badRequest('Message contains too many links', requestId);
		}

		// Get client information
		const ipAddress = getClientIP(request);
		const userAgent = request.headers.get('user-agent') || 'unknown';
		const referrer = request.headers.get('referer') || 'unknown';

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
				source: 'contact_page',
			})
			.returning();

		// Send notification email (async - don't wait for it)
		EmailService.sendEmail({
			to: process.env.CONTACT_NOTIFICATION_EMAIL || 'hello@financbase.com',
			subject: `New Contact Form Submission from ${sanitizedName}`,
			html: `
				<h2>New Contact Form Submission</h2>
				<p><strong>Name:</strong> ${sanitizedName}</p>
				<p><strong>Email:</strong> ${sanitizedEmail}</p>
				${sanitizedCompany ? `<p><strong>Company:</strong> ${sanitizedCompany}</p>` : ''}
				<p><strong>Message:</strong></p>
				<p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
				<hr>
				<p><small>Submitted at: ${new Date().toISOString()}</small></p>
				<p><small>IP Address: ${ipAddress}</small></p>
			`,
			text: `
New Contact Form Submission

Name: ${sanitizedName}
Email: ${sanitizedEmail}
${sanitizedCompany ? `Company: ${sanitizedCompany}` : ''}

Message:
${sanitizedMessage}

---
Submitted at: ${new Date().toISOString()}
IP Address: ${ipAddress}
			`,
			replyTo: sanitizedEmail,
		}).catch((error) => {
			// Log email error but don't fail the request
			console.error('Failed to send contact notification email:', error);
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
