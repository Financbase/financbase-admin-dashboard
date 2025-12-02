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
 * @swagger
 * /api/developer/api-keys/{id}:
 *   get:
 *     summary: Get API key by ID
 *     description: Retrieves a specific API key with usage statistics
 *     tags:
 *       - Developer
 *       - API Keys
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: API key not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Update API key
 *     description: Updates an API key's name, permissions, or status
 *     tags:
 *       - Developer
 *       - API Keys
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive, revoked]
 *     responses:
 *       200:
 *         description: API key updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: API key not found
 *       500:
 *         description: Internal server error
 *   delete:
 *     summary: Delete API key
 *     description: Soft deletes an API key by setting its status to deleted
 *     tags:
 *       - Developer
 *       - API Keys
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     responses:
 *       200:
 *         description: API key deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: API key not found
 *       500:
 *         description: Internal server error
 */
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
		` as any[];

		if (!Array.isArray(result) || result.length === 0) {
			return ApiErrorHandler.notFound('API key not found');
		}

		const response = NextResponse.json(result[0]);
		// Cache for 1 minute - API key details don't change frequently
		response.headers.set('Cache-Control', 'private, s-maxage=60, stale-while-revalidate=120');
		return response;

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

		const keyResultArray = Array.isArray(keyResult) ? keyResult : [];
		if (keyResultArray.length === 0) {
			return ApiErrorHandler.notFound('API key not found');
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

		const updatedResultArray = Array.isArray(updatedResult) ? updatedResult : [];
		return NextResponse.json(updatedResultArray[0] || null);

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

		const keyResultArray = Array.isArray(keyResult) ? keyResult : [];
		if (keyResultArray.length === 0) {
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

		const keyResultArray = Array.isArray(keyResult) ? keyResult : [];
		if (keyResultArray.length === 0) {
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
