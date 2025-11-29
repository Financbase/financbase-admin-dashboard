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
import { logger } from '@/lib/logger';

// Simple database connection using neon directly
async function getDbConnection() {
	const { neon } = await import('@neondatabase/serverless');
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL is not configured');
	}
	return neon(process.env.DATABASE_URL);
}

interface SavedPropertyRow {
	id?: number | string;
	property_id: string;
	name: string;
	address: string;
	city: string;
	state: string;
	zip_code: string;
	property_type: string;
	purchase_price: string | number;
	current_value?: string | number | null;
	square_footage?: number | null;
	bedrooms?: number | null;
	bathrooms?: number | null;
	status: string;
	saved_date: Date | string;
	notes?: string | null;
	rating?: number | null;
	created_at: Date | string;
}

interface CountResult {
	total: string | number;
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
	status: z.enum(['saved', 'viewed', 'offer_submitted', 'archived']).optional(),
});

const savePropertySchema = z.object({
	propertyId: z.string().min(1),
	name: z.string().min(1),
	address: z.string().min(1),
	city: z.string().min(1),
	state: z.string().length(2),
	zipCode: z.string().min(5),
	propertyType: z.string(),
	purchasePrice: z.number().positive(),
	currentValue: z.number().positive().optional(),
	squareFootage: z.number().int().positive().optional(),
	bedrooms: z.number().int().positive().optional(),
	bathrooms: z.number().positive().optional(),
	notes: z.string().optional(),
	rating: z.number().int().min(1).max(5).optional(),
	status: z.enum(['saved', 'viewed', 'offer_submitted']).default('saved'),
});

// GET /api/real-estate/buyer/saved-properties - Get saved properties for buyers
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
			status: searchParams.get('status') || undefined,
		});

		// Get database connection
		const sql = await getDbConnection();

		// Build parameterized query
		let savedPropertiesResult: SavedPropertyRow[];
		
		if (params.status) {
			savedPropertiesResult = await sql`
				SELECT *
				FROM saved_properties
				WHERE user_id = ${userId}
					AND is_active = true
					AND status = ${params.status}
				ORDER BY saved_date DESC, created_at DESC
				LIMIT ${params.limit || 50} OFFSET ${params.offset || 0}
			`;
		} else {
			savedPropertiesResult = await sql`
				SELECT *
				FROM saved_properties
				WHERE user_id = ${userId}
					AND is_active = true
				ORDER BY saved_date DESC, created_at DESC
				LIMIT ${params.limit || 50} OFFSET ${params.offset || 0}
			`;
		}

		// Get total count
		let countResult: CountResult[];
		if (params.status) {
			countResult = await sql`
				SELECT COUNT(*)::int as total
				FROM saved_properties
				WHERE user_id = ${userId}
					AND is_active = true
					AND status = ${params.status}
			`;
		} else {
			countResult = await sql`
				SELECT COUNT(*)::int as total
				FROM saved_properties
				WHERE user_id = ${userId}
					AND is_active = true
			`;
		}

		const total = Number(countResult[0]?.total || 0);

		const savedProperties = savedPropertiesResult.map((row: SavedPropertyRow) => ({
			id: row.id || row.property_id,
			propertyId: row.property_id,
			name: row.name,
			address: row.address,
			city: row.city,
			state: row.state,
			zipCode: row.zip_code,
			propertyType: row.property_type,
			purchasePrice: Number(row.purchase_price || 0),
			currentValue: row.current_value ? Number(row.current_value) : undefined,
			squareFootage: row.square_footage ? Number(row.square_footage) : undefined,
			bedrooms: row.bedrooms ? Number(row.bedrooms) : undefined,
			bathrooms: row.bathrooms ? Number(row.bathrooms) : undefined,
			status: row.status || 'saved',
			savedDate: row.saved_date instanceof Date ? row.saved_date.toISOString().split('T')[0] : row.saved_date,
			notes: row.notes || null,
			rating: row.rating ? Number(row.rating) : null,
			createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
		}));

		return NextResponse.json({
			savedProperties,
			total,
			limit: params.limit || 50,
			offset: params.offset || 0,
			hasMore: (params.offset || 0) + (params.limit || 50) < total,
		});

	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.validationError(error, requestId);
		}
		logger.error('Failed to fetch saved properties:', error);
		return ApiErrorHandler.databaseError(error, requestId);
	}
}

// POST /api/real-estate/buyer/saved-properties - Save a property
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized('Authentication required');
		}

		const body = await request.json();
		const propertyData = savePropertySchema.parse(body);

		// Get database connection
		const sql = await getDbConnection();

		// Check if property is already saved
		const existingResult = await sql`
			SELECT id
			FROM saved_properties
			WHERE user_id = ${userId}
				AND property_id = ${propertyData.propertyId}
				AND is_active = true
			LIMIT 1
		`;

		if (existingResult.length > 0) {
			return ApiErrorHandler.conflict('Property is already saved');
		}

		// Insert new saved property
		const result = await sql`
			INSERT INTO saved_properties (
				user_id, property_id, name, address, city, state, zip_code,
				property_type, purchase_price, current_value, square_footage,
				bedrooms, bathrooms, status, saved_date, notes, rating
			) VALUES (
				${userId}, ${propertyData.propertyId}, ${propertyData.name}, 
				${propertyData.address}, ${propertyData.city}, ${propertyData.state}, 
				${propertyData.zipCode}, ${propertyData.propertyType}, 
				${propertyData.purchasePrice}, ${propertyData.currentValue || null}, 
				${propertyData.squareFootage || null}, ${propertyData.bedrooms || null}, 
				${propertyData.bathrooms || null}, ${propertyData.status}, 
				CURRENT_DATE, ${propertyData.notes || null}, ${propertyData.rating || null}
			) RETURNING *
		`;

		const newSavedProperty = result[0];
		return NextResponse.json({
			success: true,
			property: {
				id: newSavedProperty.id || newSavedProperty.property_id,
				propertyId: newSavedProperty.property_id,
				name: newSavedProperty.name,
				address: newSavedProperty.address,
				city: newSavedProperty.city,
				state: newSavedProperty.state,
				zipCode: newSavedProperty.zip_code,
				status: newSavedProperty.status,
				savedDate: newSavedProperty.saved_date instanceof Date ? newSavedProperty.saved_date.toISOString().split('T')[0] : newSavedProperty.saved_date,
				notes: newSavedProperty.notes,
				rating: newSavedProperty.rating ? Number(newSavedProperty.rating) : null,
			},
			message: 'Property saved successfully',
		}, { status: 201 });

	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.validationError(error, requestId);
		}
		logger.error('Failed to save property:', error);
		return ApiErrorHandler.databaseError(error, requestId);
	}
}

// DELETE /api/real-estate/buyer/saved-properties - Remove a saved property
export async function DELETE(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized('Authentication required');
		}

		const { searchParams } = new URL(request.url);
		const propertyId = searchParams.get('propertyId');

		if (!propertyId) {
			return ApiErrorHandler.badRequest('Property ID is required');
		}

		// Get database connection
		const sql = await getDbConnection();

		// Soft delete by setting is_active to false
		const result = await sql`
			UPDATE saved_properties
			SET is_active = false, updated_at = CURRENT_TIMESTAMP
			WHERE user_id = ${userId}
				AND property_id = ${propertyId}
				AND is_active = true
			RETURNING id, property_id
		`;

		if (result.length === 0) {
			return ApiErrorHandler.notFound('Saved property not found');
		}

		return NextResponse.json({
			success: true,
			message: 'Property removed from saved list',
		});

	} catch (error) {
		logger.error('Failed to remove saved property:', error);
		return ApiErrorHandler.databaseError(error, requestId);
	}
}
