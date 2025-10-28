import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Simple database connection using neon directly
async function getDbConnection() {
	const { neon } = await import('@neondatabase/serverless');
	return neon(process.env.DATABASE_URL!);
}

// GET /api/real-estate/properties - Get user's properties
export async function GET(request: NextRequest) {
	try {
		// Temporarily disable auth for testing
		// const { userId } = await auth();
		// if (!userId) {
		// 	return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		// }
		
		const userId = 'test-user'; // Mock user ID for testing

		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '50');
		const offset = parseInt(searchParams.get('offset') || '0');

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
		console.error('Failed to fetch properties:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch properties' },
			{ status: 500 }
		);
	}
}
