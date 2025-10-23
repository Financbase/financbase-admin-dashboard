import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/neon';

/**
 * GET /api/developer/api-keys/[id]
 * Get a specific API key
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const keyId = params.id;

		// Get API key with usage statistics
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
			WHERE ak.id = $1 AND ak.user_id = $2 AND ak.status != 'deleted'
			GROUP BY ak.id, usage.monthly_requests, ak.monthly_limit
		`, [keyId, userId]);

		if (result.rows.length === 0) {
			return NextResponse.json({ error: 'API key not found' }, { status: 404 });
		}

		return NextResponse.json(result.rows[0]);

	} catch (error) {
		console.error('Error fetching API key:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * PATCH /api/developer/api-keys/[id]
 * Update an API key
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const keyId = params.id;
		const body = await request.json();
		const { name, permissions, monthlyLimit, status } = body;

		// Verify ownership
		const keyResult = await sql.query(`
			SELECT * FROM developer.api_keys
			WHERE id = $1 AND user_id = $2 AND status != 'deleted'
		`, [keyId, userId]);

		if (keyResult.rows.length === 0) {
			return NextResponse.json({ error: 'API key not found' }, { status: 404 });
		}

		// Build update query
		const updates: string[] = [];
		const params: any[] = [];
		let paramCount = 0;

		if (name !== undefined) {
			paramCount++;
			updates.push(`name = $${paramCount}`);
			params.push(name);
		}

		if (permissions !== undefined) {
			paramCount++;
			updates.push(`permissions = $${paramCount}`);
			params.push(JSON.stringify(permissions));
		}

		if (monthlyLimit !== undefined) {
			paramCount++;
			updates.push(`monthly_limit = $${paramCount}`);
			params.push(monthlyLimit);
		}

		if (status !== undefined) {
			paramCount++;
			updates.push(`status = $${paramCount}`);
			params.push(status);
		}

		if (updates.length > 0) {
			// Always update updated_at
			paramCount++;
			updates.push(`updated_at = $${paramCount}`);
			params.push(new Date());

			// Add key ID
			params.push(keyId);

			await sql.query(`
				UPDATE developer.api_keys
				SET ${updates.join(', ')}
				WHERE id = $${paramCount + 1}
			`, params);
		}

		// Return updated key
		const updatedResult = await sql.query(`
			SELECT
				ak.*,
				COALESCE(usage.monthly_requests, 0) as monthly_usage,
				ak.monthly_limit,
				MAX(usage.last_used) as last_used_at,
				COUNT(usage.id) as total_requests
			FROM developer.api_keys ak
			LEFT JOIN developer.api_usage usage ON ak.id = usage.api_key_id
				AND usage.created_at >= DATE_TRUNC('month', CURRENT_DATE)
			WHERE ak.id = $1 AND ak.user_id = $2 AND ak.status != 'deleted'
			GROUP BY ak.id, usage.monthly_requests, ak.monthly_limit
		`, [keyId, userId]);

		return NextResponse.json(updatedResult.rows[0]);

	} catch (error) {
		console.error('Error updating API key:', error);
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
