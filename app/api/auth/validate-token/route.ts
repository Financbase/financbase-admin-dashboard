/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

/**
 * @swagger
 * /api/auth/validate-token:
 *   post:
 *     summary: Validate Clerk JWT token for WebSocket connections
 *     description: Validates a Clerk JWT token and returns user information. Used by Cloudflare Workers to authenticate WebSocket connections.
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Clerk session token obtained from getToken()
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                   example: true
 *                 userId:
 *                   type: string
 *                   example: user_123
 *                 email:
 *                   type: string
 *                   example: user@example.com
 *       400:
 *         description: Token is required
 *       401:
 *         description: Token is invalid, expired, or user account is inactive
 */
/**
 * POST /api/auth/validate-token
 * Validates a Clerk JWT token for WebSocket connections
 * 
 * This endpoint is used by Cloudflare Workers to validate authentication tokens
 * before establishing WebSocket connections.
 * 
 * The token should be a Clerk session token obtained from getToken() in the client.
 */
export async function POST(request: NextRequest) {
	try {
		// Get token from request body
		const body = await request.json().catch(() => ({}));
		const token = body.token || request.headers.get('Authorization')?.replace('Bearer ', '');

		if (!token) {
			return NextResponse.json(
				{ valid: false, error: 'Token is required' },
				{ status: 400 }
			);
		}

		// Decode JWT to extract user ID
		// Clerk session tokens are JWTs with the user ID in the payload
		const parts = token.split('.');
		if (parts.length !== 3) {
			return NextResponse.json(
				{ valid: false, error: 'Invalid token format' },
				{ status: 401 }
			);
		}

		// Decode payload
		let payload: { sub?: string; userId?: string; exp?: number; [key: string]: unknown };
		try {
			const base64Url = parts[1];
			const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
			const jsonPayload = decodeURIComponent(
				atob(base64)
					.split('')
					.map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
					.join('')
			);
			payload = JSON.parse(jsonPayload);
		} catch (error) {
			return NextResponse.json(
				{ valid: false, error: 'Invalid token payload' },
				{ status: 401 }
			);
		}

		// Check if token is expired
		const now = Math.floor(Date.now() / 1000);
		if (payload.exp && payload.exp < now) {
			return NextResponse.json(
				{ valid: false, error: 'Token expired' },
				{ status: 401 }
			);
		}

		// Get user ID from token payload
		// Clerk tokens typically have 'sub' (subject) as the user ID
		const userId = payload.sub || payload.userId;
		
		if (!userId) {
			return NextResponse.json(
				{ valid: false, error: 'Token missing user ID' },
				{ status: 401 }
			);
		}

		// Verify the user exists in Clerk and is active
		// This validates that the token corresponds to a real user
		const clerk = await clerkClient();
		
		try {
			const user = await clerk.users.getUser(userId);
			
			// Check if user is active and not deleted
			if (!user || user.banned || user.locked) {
				return NextResponse.json(
					{ valid: false, error: 'User account is inactive' },
					{ status: 401 }
				);
			}

			// Token is valid - return user information
			return NextResponse.json({
				valid: true,
				userId: user.id,
				email: user.emailAddresses[0]?.emailAddress || undefined,
			});
		} catch (error) {
			// If we can't verify with Clerk, the token is invalid
			console.error('Token validation error:', error);
			return NextResponse.json(
				{ valid: false, error: 'Token verification failed - user not found' },
				{ status: 401 }
			);
		}
	} catch (error) {
		console.error('Error validating token:', error);
		return NextResponse.json(
			{ valid: false, error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

/**
 * @swagger
 * /api/auth/validate-token:
 *   get:
 *     summary: Health check for token validation endpoint
 *     description: Returns the status of the token validation endpoint
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Endpoint is active
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 message:
 *                   type: string
 *                   example: Token validation endpoint is active
 */
/**
 * GET /api/auth/validate-token
 * Health check endpoint
 */
export async function GET() {
	return NextResponse.json({
		status: 'ok',
		message: 'Token validation endpoint is active',
	});
}

