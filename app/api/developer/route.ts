/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRawSqlConnection } from '@/lib/db';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * GET /api/developer/api-keys
 * Get all API keys for the current user
 */
export async function GET(_request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		// Get API keys with usage statistics
		const rawSql = getRawSqlConnection();
		const result = (await rawSql`
			SELECT
				ak.*,
				COALESCE(usage.monthly_requests, 0) as monthly_usage,
				ak.monthly_limit,
				MAX(usage.last_used) as last_used_at,
				COUNT(usage.id) as total_requests
			FROM developer.api_keys ak
			LEFT JOIN developer.api_usage usage ON ak.id = usage.api_key_id
				AND usage.created_at >= DATE_TRUNC('month', CURRENT_DATE)
			WHERE ak.user_id = ${userId} AND ak.status != 'deleted'
			GROUP BY ak.id, usage.monthly_requests, ak.monthly_limit
			ORDER BY ak.created_at DESC
		`) as any[];

		return NextResponse.json(result);
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/developer/api-keys
 * Create a new API key
 */
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const { name, permissions, monthlyLimit = 10000 } = body;

		if (!name || !permissions || !Array.isArray(permissions)) {
			return ApiErrorHandler.badRequest('Missing required fields: name and permissions are required');
		}

		// Generate API key
		const apiKey = `fb_${generateRandomString(32)}`;
		const keyId = generateRandomString(16);

		// Store API key
		const rawSql = getRawSqlConnection();
		await rawSql`
			INSERT INTO developer.api_keys
			(id, user_id, name, key, permissions, monthly_limit, status, created_at, updated_at)
			VALUES (${keyId}, ${userId}, ${name}, ${apiKey}, ${JSON.stringify(permissions)}, ${monthlyLimit}, ${'active'}, NOW(), NOW())
		`;

		return NextResponse.json({
			id: keyId,
			name,
			key: apiKey,
			permissions,
			monthlyLimit,
			status: 'active',
			createdAt: new Date().toISOString(),
		}, { status: 201 });

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * GET /api/developer/usage
 * Get API usage statistics
 */
export async function PATCH(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const { searchParams } = new URL(request.url);
		const days = parseInt(searchParams.get('days') || '30', 10);

		// Get usage data for the last N days
		const rawSql = getRawSqlConnection();
		const result = (await rawSql`
			SELECT
				DATE(usage.created_at) as date,
				COUNT(*) as requests,
				COUNT(*) FILTER (WHERE usage.status_code >= 400) as errors,
				AVG(EXTRACT(EPOCH FROM (usage.completed_at - usage.created_at)) * 1000) as avg_response_time
			FROM developer.api_usage usage
			JOIN developer.api_keys ak ON usage.api_key_id = ak.id
			WHERE ak.user_id = ${userId}
				AND usage.created_at >= CURRENT_DATE - INTERVAL '${days} days'
			GROUP BY DATE(usage.created_at)
			ORDER BY date DESC
		`) as any[];

		return NextResponse.json(result);

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/developer/usage
 * Record API usage (called by API middleware)
 */
export async function PUT(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}

		const { apiKey, endpoint, method, statusCode, responseTime, error: errorData } = body;

		if (!apiKey || !endpoint) {
			return ApiErrorHandler.badRequest('Missing required fields: apiKey and endpoint are required');
		}

		// Find API key
		const rawSql = getRawSqlConnection();
		const keyResult = (await rawSql`
			SELECT id, user_id FROM developer.api_keys
			WHERE key = ${apiKey} AND status = 'active'
		`) as Array<{ id: string; user_id: string }>;

		if (keyResult.length === 0) {
			return ApiErrorHandler.unauthorized('Invalid API key');
		}

		const keyId = keyResult[0].id;

		// Record usage
		await rawSql`
			INSERT INTO developer.api_usage
			(api_key_id, endpoint, method, status_code, response_time, error, created_at, completed_at)
			VALUES (${keyId}, ${endpoint}, ${method}, ${statusCode}, ${responseTime}, ${errorData || null}, NOW(), NOW())
		`;

		// Check rate limits (simplified)
		const today = new Date().toISOString().split('T')[0];
		const dailyUsage = (await rawSql`
			SELECT COUNT(*) as count FROM developer.api_usage
			WHERE api_key_id = ${keyId} AND DATE(created_at) = ${today}
		`) as Array<{ count: string }>;

		if (parseInt(dailyUsage[0].count, 10) > 1000) { // Example daily limit
			return ApiErrorHandler.rateLimitExceeded('Rate limit exceeded');
		}

		return NextResponse.json({ success: true });

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * Generate a random string for API keys
 */
function generateRandomString(length: number): string {
	const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}
