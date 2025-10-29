import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Simple database connection using neon directly
async function getDbConnection() {
	const { neon } = await import('@neondatabase/serverless');
	return neon(process.env.DATABASE_URL!);
}

// GET /api/real-estate/realtor/leads - Get realtor leads
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
			FROM leads
			WHERE user_id = ${userId} AND is_active = true
		`;
		const total = Number(countResult[0]?.total) || 0;

		// Get leads with pagination
		const leadsResult = await sql`
			SELECT *
			FROM leads
			WHERE user_id = ${userId} AND is_active = true
			ORDER BY created_at DESC
			LIMIT ${limit} OFFSET ${offset}
		`;

		const leadsList = leadsResult.map(row => ({
			id: row.id,
			name: row.name,
			email: row.email,
			phone: row.phone,
			status: row.status,
			propertyInterest: row.property_interest,
			budget: row.budget ? Number(row.budget) : undefined,
			lastContact: row.last_contact,
			source: row.source,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		}));

		return NextResponse.json({
			leads: leadsList,
			total,
			limit,
			offset,
			hasMore: offset + limit < total
		});

	} catch (error) {
		console.error('Failed to fetch leads:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch leads' },
			{ status: 500 }
		);
	}
}

// POST /api/real-estate/realtor/leads - Create a new lead
export async function POST(request: NextRequest) {
	try {
		// Temporarily disable auth for testing
		// const { userId } = await auth();
		// if (!userId) {
		// 	return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		// }
		
		const userId = 'test-user'; // Mock user ID for testing

		const body = await request.json();
		const { name, email, phone, propertyInterest, budget, source } = body;

		// Get database connection
		const sql = await getDbConnection();

		// Insert new lead
		const result = await sql`
			INSERT INTO leads (
				user_id, name, email, phone, status, 
				property_interest, budget, source, last_contact
			) VALUES (
				${userId}, ${name}, ${email}, ${phone}, 'new',
				${propertyInterest || null}, ${budget || null}, ${source || 'Unknown'}, 
				CURRENT_DATE
			) RETURNING *
		`;

		const newLead = result[0];
		return NextResponse.json({
			lead: {
				id: newLead.id,
				name: newLead.name,
				email: newLead.email,
				phone: newLead.phone,
				status: newLead.status,
				propertyInterest: newLead.property_interest,
				budget: newLead.budget ? Number(newLead.budget) : undefined,
				lastContact: newLead.last_contact,
				source: newLead.source,
				createdAt: newLead.created_at,
				updatedAt: newLead.updated_at,
			}
		}, { status: 201 });

	} catch (error) {
		console.error('Failed to create lead:', error);
		return NextResponse.json(
			{ error: 'Failed to create lead' },
			{ status: 500 }
		);
	}
}
