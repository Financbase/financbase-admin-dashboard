import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';
import { z } from 'zod';

// Simple database connection using neon directly
async function getDbConnection() {
	const { neon } = await import('@neondatabase/serverless');
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL is not configured');
	}
	return neon(process.env.DATABASE_URL);
}

const queryParamsSchema = z.object({
	limit: z.string().optional().transform((val) => {
		const num = parseInt(val || '50', 10);
		return Math.min(Math.max(num, 1), 100); // Clamp between 1 and 100
	}),
	offset: z.string().optional().transform((val) => {
		const num = parseInt(val || '0', 10);
		return Math.max(num, 0); // Ensure non-negative
	}),
});

// GET /api/real-estate/properties - Get user's properties
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized('Authentication required');
		}

		const { searchParams } = new URL(request.url);
		const params = queryParamsSchema.parse({
			limit: searchParams.get('limit'),
			offset: searchParams.get('offset'),
		});
		const limit = params.limit || 50;
		const offset = params.offset || 0;

		// Get database connection
		const sql = await getDbConnection();

		// Get total count
		const countResult = await sql`
			SELECT COUNT(*) as total
			FROM properties
			WHERE user_id = ${userId} AND is_active = true
		`;
		const total = Number(countResult[0]?.total) || 0;

		// Get properties with pagination
		const propertiesResult = await sql`
			SELECT *
			FROM properties
			WHERE user_id = ${userId} AND is_active = true
			ORDER BY updated_at DESC
			LIMIT ${limit} OFFSET ${offset}
		`;

		const propertiesList = propertiesResult.map(row => ({
			id: row.id,
			name: row.name,
			address: row.address,
			city: row.city,
			state: row.state,
			zipCode: row.zip_code,
			propertyType: row.property_type,
			purchasePrice: Number(row.purchase_price),
			currentValue: row.current_value ? Number(row.current_value) : undefined,
			squareFootage: row.square_footage ? Number(row.square_footage) : undefined,
			yearBuilt: row.year_built ? Number(row.year_built) : undefined,
			bedrooms: row.bedrooms ? Number(row.bedrooms) : undefined,
			bathrooms: row.bathrooms ? Number(row.bathrooms) : undefined,
			status: row.status,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		}));

		return NextResponse.json({
			properties: propertiesList,
			total,
			limit,
			offset,
			hasMore: offset + limit < total
		});

	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
