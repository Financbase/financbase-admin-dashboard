/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getRawSqlConnection } from '@/lib/db';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

/**
 * Helper function to execute parameterized SQL queries
 * Converts PostgreSQL-style parameterized queries ($1, $2, etc.) to Neon's template literal format
 */
async function executeQuery<T = any>(sqlQuery: string, params: any[] = []): Promise<T[]> {
	const rawSql = getRawSqlConnection();
	
	// Convert $1, $2, etc. format to template literal format
	const parts: string[] = [];
	const values: any[] = [];
	
	let currentIndex = 0;
	const paramRegex = /\$(\d+)/g;
	let match;
	
	while ((match = paramRegex.exec(sqlQuery)) !== null) {
		parts.push(sqlQuery.substring(currentIndex, match.index));
		const paramIndex = parseInt(match[1], 10) - 1;
		if (paramIndex >= 0 && paramIndex < params.length) {
			values.push(params[paramIndex]);
		} else {
			values.push(null);
		}
		currentIndex = match.index + match[0].length;
	}
	
	parts.push(sqlQuery.substring(currentIndex));
	const result = await (rawSql as any)(parts as any, ...values);
	return result as T[];
}

/**
 * GET /api/developer/api-keys/[id]
 * Get a specific API key
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const keyId = id;

		// Get API key with usage statistics
		const rawSql = getRawSqlConnection();
		const result = await rawSql`
			SELECT
				ak.*,
				COALESCE(usage.monthly_requests, 0) as monthly_usage,
				ak.monthly_limit,
				MAX(usage.last_used) as last_used_at,
				COUNT(usage.id) as total_requests
			FROM developer.api_keys ak
			LEFT JOIN developer.api_usage usage ON ak.id = usage.api_key_id
				AND usage.created_at >= DATE_TRUNC('month', CURRENT_DATE)
			WHERE ak.id = ${keyId} AND ak.user_id = ${userId} AND ak.status != 'deleted'
			GROUP BY ak.id, usage.monthly_requests, ak.monthly_limit
		`;

		if (result.length === 0) {
			return ApiErrorHandler.notFound('API key not found');
		}

		return NextResponse.json(result[0]);

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * PATCH /api/developer/api-keys/[id]
 * Update an API key
 */
export async function PATCH(
  request: NextRequest,
  { params: routeParams }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await routeParams;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const keyId = id;
		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}
		const { name, permissions, monthlyLimit, status } = body;

		// Verify ownership
		const rawSql = getRawSqlConnection();
		const keyResult = await rawSql`
			SELECT * FROM developer.api_keys
			WHERE id = ${keyId} AND user_id = ${userId} AND status != 'deleted'
		`;

		if (keyResult.length === 0) {
			return NextResponse.json({ error: 'API key not found' }, { status: 404 });
		}

		// Build update query dynamically
		const updates: string[] = [];
		const updateValues: any[] = [];
		
		if (name !== undefined) {
			updates.push(`name = $${updates.length + 1}`);
			updateValues.push(name);
		}

		if (permissions !== undefined) {
			updates.push(`permissions = $${updates.length + 1}`);
			updateValues.push(JSON.stringify(permissions));
		}

		if (monthlyLimit !== undefined) {
			updates.push(`monthly_limit = $${updates.length + 1}`);
			updateValues.push(monthlyLimit);
		}

		if (status !== undefined) {
			updates.push(`status = $${updates.length + 1}`);
			updateValues.push(status);
		}

		if (updates.length > 0) {
			updates.push(`updated_at = $${updates.length + 1}`);
			updateValues.push(new Date());
			updateValues.push(keyId);

			await executeQuery(`
				UPDATE developer.api_keys
				SET ${updates.join(', ')}
				WHERE id = $${updates.length}
			`, updateValues);
		}

		// Return updated key
		const updatedResult = await rawSql`
			SELECT
				ak.*,
				COALESCE(usage.monthly_requests, 0) as monthly_usage,
				ak.monthly_limit,
				MAX(usage.last_used) as last_used_at,
				COUNT(usage.id) as total_requests
			FROM developer.api_keys ak
			LEFT JOIN developer.api_usage usage ON ak.id = usage.api_key_id
				AND usage.created_at >= DATE_TRUNC('month', CURRENT_DATE)
			WHERE ak.id = ${keyId} AND ak.user_id = ${userId} AND ak.status != 'deleted'
			GROUP BY ak.id, usage.monthly_requests, ak.monthly_limit
		`;

		return NextResponse.json(updatedResult[0]);

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * DELETE /api/developer/api-keys/[id]
 * Delete an API key
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const keyId = id;

		// Verify ownership
		const rawSql = getRawSqlConnection();
		const keyResult = await rawSql`
			SELECT * FROM developer.api_keys
			WHERE id = ${keyId} AND user_id = ${userId} AND status != 'deleted'
		`;

		if (keyResult.length === 0) {
			return ApiErrorHandler.notFound('API key not found');
		}

		// Soft delete
		await rawSql`
			UPDATE developer.api_keys
			SET status = 'deleted', updated_at = NOW()
			WHERE id = ${keyId}
		`;

		return NextResponse.json({ message: 'API key deleted successfully' });

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

/**
 * POST /api/developer/api-keys/[id]/revoke
 * Revoke an API key
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const keyId = id;

		// Verify ownership
		const rawSql = getRawSqlConnection();
		const keyResult = await rawSql`
			SELECT * FROM developer.api_keys
			WHERE id = ${keyId} AND user_id = ${userId} AND status = 'active'
		`;

		if (keyResult.length === 0) {
			return ApiErrorHandler.notFound('API key not found or already revoked');
		}

		// Revoke key
		await rawSql`
			UPDATE developer.api_keys
			SET status = 'revoked', updated_at = NOW()
			WHERE id = ${keyId}
		`;

		return NextResponse.json({ message: 'API key revoked successfully' });

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
