import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/neon';

/**
 * GET /api/developer/api-keys
 * Get all API keys for the current user
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Get API keys with usage statistics
		const result = await sql.query(`
			SELECT
				ak.*,
				COALESCE(usage.monthly_requests, 0) as monthly_usage,
				ak.monthly_limit,
				MAX(usage.last_used) as last_used_at,
				COUNT(usage.id) as total_requests
			FROM developer.api_keys ak
			LEFT JOIN developer.api_usage usage ON ak.id = usage.api_key_id
				AND usage.created_at >= DATE_TRUNC('month', CURRENT_DATE)
			WHERE ak.user_id = $1 AND ak.status != 'deleted'
			GROUP BY ak.id, usage.monthly_requests, ak.monthly_limit
			ORDER BY ak.created_at DESC
		`, [userId]);

		return NextResponse.json(result.rows);
	} catch (error) {
		console.error('Error fetching API keys:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * POST /api/developer/api-keys
 * Create a new API key
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { name, permissions, monthlyLimit = 10000 } = body;

		if (!name || !permissions || !Array.isArray(permissions)) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Generate API key
		const apiKey = `fb_${generateRandomString(32)}`;
		const keyId = generateRandomString(16);

		// Store API key
		await sql.query(`
			INSERT INTO developer.api_keys
			(id, user_id, name, key, permissions, monthly_limit, status, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
		`, [keyId, userId, name, apiKey, JSON.stringify(permissions), monthlyLimit, 'active']);

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
		console.error('Error creating API key:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * DELETE /api/developer/api-keys/[id]
 * Delete an API key
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const keyId = params.id;

		// Verify ownership
		const keyResult = await sql.query(`
			SELECT * FROM developer.api_keys
			WHERE id = $1 AND user_id = $2 AND status != 'deleted'
		`, [keyId, userId]);

		if (keyResult.rows.length === 0) {
			return NextResponse.json({ error: 'API key not found' }, { status: 404 });
		}

		// Soft delete
		await sql.query(`
			UPDATE developer.api_keys
			SET status = 'deleted', updated_at = NOW()
			WHERE id = $1
		`, [keyId]);

		return NextResponse.json({ message: 'API key deleted successfully' });

	} catch (error) {
		console.error('Error deleting API key:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * POST /api/developer/api-keys/[id]/revoke
 * Revoke an API key
 */
export async function revokeAPIKey(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const keyId = params.id;

		// Verify ownership
		const keyResult = await sql.query(`
			SELECT * FROM developer.api_keys
			WHERE id = $1 AND user_id = $2 AND status = 'active'
		`, [keyId, userId]);

		if (keyResult.rows.length === 0) {
			return NextResponse.json({ error: 'API key not found or already revoked' }, { status: 404 });
		}

		// Revoke key
		await sql.query(`
			UPDATE developer.api_keys
			SET status = 'revoked', updated_at = NOW()
			WHERE id = $1
		`, [keyId]);

		return NextResponse.json({ message: 'API key revoked successfully' });

	} catch (error) {
		console.error('Error revoking API key:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * GET /api/developer/usage
 * Get API usage statistics
 */
export async function getUsage(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const days = parseInt(searchParams.get('days') || '30');

		// Get usage data for the last N days
		const result = await sql.query(`
			SELECT
				DATE(usage.created_at) as date,
				COUNT(*) as requests,
				COUNT(*) FILTER (WHERE usage.status_code >= 400) as errors,
				AVG(EXTRACT(EPOCH FROM (usage.completed_at - usage.created_at)) * 1000) as avg_response_time
			FROM developer.api_usage usage
			JOIN developer.api_keys ak ON usage.api_key_id = ak.id
			WHERE ak.user_id = $1
				AND usage.created_at >= CURRENT_DATE - INTERVAL '${days} days'
			GROUP BY DATE(usage.created_at)
			ORDER BY date DESC
		`, [userId]);

		return NextResponse.json(result.rows);

	} catch (error) {
		console.error('Error fetching usage data:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * POST /api/developer/usage
 * Record API usage (called by API middleware)
 */
export async function recordUsage(request: NextRequest) {
	try {
		const body = await request.json();
		const { apiKey, endpoint, method, statusCode, responseTime, error } = body;

		if (!apiKey || !endpoint) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Find API key
		const keyResult = await sql.query(`
			SELECT id, user_id FROM developer.api_keys
			WHERE key = $1 AND status = 'active'
		`, [apiKey]);

		if (keyResult.rows.length === 0) {
			return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
		}

		const keyId = keyResult.rows[0].id;

		// Record usage
		await sql.query(`
			INSERT INTO developer.api_usage
			(api_key_id, endpoint, method, status_code, response_time, error, created_at, completed_at)
			VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		`, [keyId, endpoint, method, statusCode, responseTime, error || null]);

		// Check rate limits (simplified)
		const today = new Date().toISOString().split('T')[0];
		const dailyUsage = await sql.query(`
			SELECT COUNT(*) as count FROM developer.api_usage
			WHERE api_key_id = $1 AND DATE(created_at) = $2
		`, [keyId, today]);

		if (parseInt(dailyUsage.rows[0].count) > 1000) { // Example daily limit
			return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
		}

		return NextResponse.json({ success: true });

	} catch (error) {
		console.error('Error recording usage:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
