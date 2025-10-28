import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { properties } from '@/lib/db/schemas/real-estate.schema';

// GET /api/real-estate/properties - Get user's properties
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const limit = parseInt(searchParams.get('limit') || '50');
		const offset = parseInt(searchParams.get('offset') || '0');
		const status = searchParams.get('status');
		const type = searchParams.get('type');

		// Build query conditions
		let whereConditions = `user_id = '${userId}' AND is_active = true`;

		if (status) {
			whereConditions += ` AND status = '${status}'`;
		}

		if (type) {
			whereConditions += ` AND property_type = '${type}'`;
		}

		// Get total count
		const countResult = await db.execute(`
			SELECT COUNT(*) as total
			FROM properties
			WHERE ${whereConditions}
		`);
		const total = Number(countResult.rows[0].total);

		// Get properties with related data
		const propertiesResult = await db.execute(`
			SELECT
				p.*,
				COALESCE(SUM(pi.amount), 0) as monthly_rent,
				COUNT(t.id) as tenant_count,
				CASE
					WHEN p.purchase_price > 0 THEN
						((COALESCE(p.current_value, p.purchase_price) - p.purchase_price) / p.purchase_price) * 100
					ELSE 0
				END as roi,
				CASE
					WHEN COUNT(t.id) > 0 THEN 100
					ELSE 0
				END as occupancy_rate
			FROM properties p
			LEFT JOIN property_income pi ON p.id = pi.property_id
				AND pi.income_type = 'rent'
				AND pi.date >= date_trunc('month', CURRENT_DATE)
				AND pi.date < date_trunc('month', CURRENT_DATE + INTERVAL '1 month')
				AND pi.payment_status = 'received'
			LEFT JOIN tenants t ON p.id = t.property_id AND t.status = 'active'
			WHERE ${whereConditions}
			GROUP BY p.id, p.user_id, p.name, p.address, p.city, p.state, p.zip_code,
				p.property_type, p.purchase_price, p.current_value, p.square_footage,
				p.year_built, p.bedrooms, p.bathrooms, p.status, p.created_at, p.updated_at
			ORDER BY p.updated_at DESC
			LIMIT ${limit} OFFSET ${offset}
		`);

		const properties = propertiesResult.rows.map(row => ({
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
			monthlyRent: row.monthly_rent ? Number(row.monthly_rent) : undefined,
			occupancyRate: row.occupancy_rate ? Number(row.occupancy_rate) : undefined,
			roi: row.roi ? Number(row.roi) : undefined,
			tenantCount: Number(row.tenant_count),
		}));

		return NextResponse.json({
			properties,
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
