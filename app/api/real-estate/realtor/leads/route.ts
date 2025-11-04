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
		return Math.min(Math.max(num, 1), 100);
	}),
	offset: z.string().optional().transform((val) => {
		const num = parseInt(val || '0', 10);
		return Math.max(num, 0);
	}),
});

const createLeadSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	phone: z.string().optional(),
	propertyInterest: z.string().optional(),
	budget: z.number().positive().optional(),
	source: z.string().optional(),
});

// GET /api/real-estate/realtor/leads - Get realtor leads
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized('Authentication required');
		}

		const { searchParams } = new URL(request.url);
		const params = queryParamsSchema.parse({
			limit: searchParams.get('limit') || undefined,
			offset: searchParams.get('offset') || undefined,
		});
		const limit = params.limit || 50;
		const offset = params.offset || 0;

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
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.validationError(error, requestId);
		}
		console.error('Failed to fetch leads:', error);
		return ApiErrorHandler.databaseError(error, requestId);
	}
}

// POST /api/real-estate/realtor/leads - Create a new lead
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized('Authentication required');
		}

		const body = await request.json();
		const leadData = createLeadSchema.parse(body);

		// Get database connection
		const sql = await getDbConnection();

		// Insert new lead
		const result = await sql`
			INSERT INTO leads (
				user_id, name, email, phone, status, 
				property_interest, budget, source, last_contact
			) VALUES (
				${userId}, ${leadData.name}, ${leadData.email}, ${leadData.phone || null}, 'new',
				${leadData.propertyInterest || null}, ${leadData.budget || null}, ${leadData.source || 'Unknown'}, 
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
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.validationError(error, requestId);
		}
		console.error('Failed to create lead:', error);
		return ApiErrorHandler.databaseError(error, requestId);
	}
}
