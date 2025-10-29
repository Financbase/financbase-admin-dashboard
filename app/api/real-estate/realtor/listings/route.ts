import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Simple database connection using neon directly
async function getDbConnection() {
	const { neon } = await import('@neondatabase/serverless');
	return neon(process.env.DATABASE_URL!);
}

// GET /api/real-estate/realtor/listings - Get realtor listings
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
			FROM listings
			WHERE user_id = ${userId} AND is_active = true
		`;
		const total = Number(countResult[0]?.total) || 0;

		// Get listings with pagination
		const listingsResult = await sql`
			SELECT *
			FROM listings
			WHERE user_id = ${userId} AND is_active = true
			ORDER BY created_at DESC
			LIMIT ${limit} OFFSET ${offset}
		`;

		const listingsList = listingsResult.map(row => ({
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
			commissionAmount: row.commission_amount ? Number(row.commission_amount) : undefined,
			listedDate: row.listed_date,
			soldDate: row.sold_date,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		}));

		return NextResponse.json({
			listings: listingsList,
			total,
			limit,
			offset,
			hasMore: offset + limit < total
		});

	} catch (error) {
		console.error('Failed to fetch listings:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch listings' },
			{ status: 500 }
		);
	}
}

// POST /api/real-estate/realtor/listings - Create a new listing
export async function POST(request: NextRequest) {
	try {
		// Temporarily disable auth for testing
		// const { userId } = await auth();
		// if (!userId) {
		// 	return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		// }
		
		const userId = 'test-user'; // Mock user ID for testing

		const body = await request.json();
		const { 
			name, address, city, state, zipCode, propertyType, 
			purchasePrice, currentValue, squareFootage, yearBuilt, 
			bedrooms, bathrooms, monthlyRent, commissionAmount 
		} = body;

		// Get database connection
		const sql = await getDbConnection();

		// Insert new listing
		const result = await sql`
			INSERT INTO listings (
				user_id, name, address, city, state, zip_code, property_type,
				purchase_price, current_value, square_footage, year_built,
				bedrooms, bathrooms, monthly_rent, commission_amount, status,
				listed_date
			) VALUES (
				${userId}, ${name}, ${address}, ${city}, ${state}, ${zipCode}, ${propertyType},
				${purchasePrice}, ${currentValue || null}, ${squareFootage || null}, ${yearBuilt || null},
				${bedrooms || null}, ${bathrooms || null}, ${monthlyRent || null}, ${commissionAmount || null},
				'active', CURRENT_DATE
			) RETURNING *
		`;

		const newListing = result[0];
		return NextResponse.json({
			listing: {
				id: newListing.id,
				name: newListing.name,
				address: newListing.address,
				city: newListing.city,
				state: newListing.state,
				zipCode: newListing.zip_code,
				propertyType: newListing.property_type,
				purchasePrice: Number(newListing.purchase_price),
				currentValue: newListing.current_value ? Number(newListing.current_value) : undefined,
				squareFootage: newListing.square_footage ? Number(newListing.square_footage) : undefined,
				yearBuilt: newListing.year_built ? Number(newListing.year_built) : undefined,
				bedrooms: newListing.bedrooms ? Number(newListing.bedrooms) : undefined,
				bathrooms: newListing.bathrooms ? Number(newListing.bathrooms) : undefined,
				status: newListing.status,
				monthlyRent: newListing.monthly_rent ? Number(newListing.monthly_rent) : undefined,
				commissionAmount: newListing.commission_amount ? Number(newListing.commission_amount) : undefined,
				listedDate: newListing.listed_date,
				soldDate: newListing.sold_date,
				createdAt: newListing.created_at,
				updatedAt: newListing.updated_at,
			}
		}, { status: 201 });

	} catch (error) {
		console.error('Failed to create listing:', error);
		return NextResponse.json(
			{ error: 'Failed to create listing' },
			{ status: 500 }
		);
	}
}
