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
	status: z.string().optional(),
	propertyId: z.string().optional(),
});

const createTenantSchema = z.object({
	propertyId: z.string().optional(),
	unitId: z.string().uuid().optional(),
	firstName: z.string().min(1),
	lastName: z.string().min(1),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	dateOfBirth: z.string().optional(),
	emergencyContact: z.object({
		name: z.string(),
		phone: z.string(),
		relationship: z.string(),
	}).optional(),
	currentAddress: z.string().optional(),
	employmentInfo: z.object({
		employer: z.string(),
		position: z.string(),
		income: z.number(),
	}).optional(),
	creditScore: z.number().int().min(300).max(850).optional(),
	notes: z.string().optional(),
});

// GET /api/real-estate/investor/tenants - Get tenants
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
			status: searchParams.get('status'),
			propertyId: searchParams.get('propertyId'),
		});

		const sql = await getDbConnection();

		const limit = params.limit || 50;
		const offset = params.offset || 0;

		// Get total count with filters
		let countQuery = sql`
			SELECT COUNT(*) as total 
			FROM tenants t 
			WHERE t.user_id = ${userId} AND t.is_active = true
		`;
		
		if (params.status) {
			countQuery = sql`
				SELECT COUNT(*) as total 
				FROM tenants t 
				WHERE t.user_id = ${userId} AND t.is_active = true AND t.status = ${params.status}
			`;
		}
		
		if (params.propertyId) {
			countQuery = sql`
				SELECT COUNT(*) as total 
				FROM tenants t 
				WHERE t.user_id = ${userId} AND t.is_active = true 
					${params.status ? sql`AND t.status = ${params.status}` : sql``}
					AND t.property_id = ${params.propertyId}
			`;
		}
		
		const countResult = await countQuery;
		const total = Number(countResult[0]?.total) || 0;

		// Get tenants with pagination
		let tenantsQuery;
		if (params.status && params.propertyId) {
			tenantsQuery = sql`
				SELECT 
					t.*,
					p.name as property_name,
					p.address as property_address,
					pu.unit_number,
					pu.monthly_rent,
					l.lease_start_date,
					l.lease_end_date,
					l.status as lease_status
				FROM tenants t
				LEFT JOIN properties p ON t.property_id = p.id
				LEFT JOIN property_units pu ON t.unit_id = pu.id
				LEFT JOIN leases l ON t.id = l.tenant_id AND l.status = 'active'
				WHERE t.user_id = ${userId} AND t.is_active = true 
					AND t.status = ${params.status}
					AND t.property_id = ${params.propertyId}
				ORDER BY t.created_at DESC
				LIMIT ${limit} OFFSET ${offset}
			`;
		} else if (params.status) {
			tenantsQuery = sql`
				SELECT 
					t.*,
					p.name as property_name,
					p.address as property_address,
					pu.unit_number,
					pu.monthly_rent,
					l.lease_start_date,
					l.lease_end_date,
					l.status as lease_status
				FROM tenants t
				LEFT JOIN properties p ON t.property_id = p.id
				LEFT JOIN property_units pu ON t.unit_id = pu.id
				LEFT JOIN leases l ON t.id = l.tenant_id AND l.status = 'active'
				WHERE t.user_id = ${userId} AND t.is_active = true 
					AND t.status = ${params.status}
				ORDER BY t.created_at DESC
				LIMIT ${limit} OFFSET ${offset}
			`;
		} else if (params.propertyId) {
			tenantsQuery = sql`
				SELECT 
					t.*,
					p.name as property_name,
					p.address as property_address,
					pu.unit_number,
					pu.monthly_rent,
					l.lease_start_date,
					l.lease_end_date,
					l.status as lease_status
				FROM tenants t
				LEFT JOIN properties p ON t.property_id = p.id
				LEFT JOIN property_units pu ON t.unit_id = pu.id
				LEFT JOIN leases l ON t.id = l.tenant_id AND l.status = 'active'
				WHERE t.user_id = ${userId} AND t.is_active = true 
					AND t.property_id = ${params.propertyId}
				ORDER BY t.created_at DESC
				LIMIT ${limit} OFFSET ${offset}
			`;
		} else {
			tenantsQuery = sql`
				SELECT 
					t.*,
					p.name as property_name,
					p.address as property_address,
					pu.unit_number,
					pu.monthly_rent,
					l.lease_start_date,
					l.lease_end_date,
					l.status as lease_status
				FROM tenants t
				LEFT JOIN properties p ON t.property_id = p.id
				LEFT JOIN property_units pu ON t.unit_id = pu.id
				LEFT JOIN leases l ON t.id = l.tenant_id AND l.status = 'active'
				WHERE t.user_id = ${userId} AND t.is_active = true
				ORDER BY t.created_at DESC
				LIMIT ${limit} OFFSET ${offset}
			`;
		}
		
		const tenantsResult = await tenantsQuery;

		const tenants = tenantsResult.map((row: any) => ({
			id: row.id,
			propertyId: row.property_id,
			unitId: row.unit_id,
			firstName: row.first_name,
			lastName: row.last_name,
			email: row.email,
			phone: row.phone,
			dateOfBirth: row.date_of_birth,
			emergencyContact: row.emergency_contact,
			employmentInfo: row.employment_info,
			creditScore: row.credit_score,
			backgroundCheckStatus: row.background_check_status,
			status: row.status,
			notes: row.notes,
			property: row.property_name ? {
				name: row.property_name,
				address: row.property_address,
			} : null,
			unit: row.unit_number ? {
				unitNumber: row.unit_number,
				monthlyRent: row.monthly_rent ? Number(row.monthly_rent) : null,
			} : null,
			lease: row.lease_start_date ? {
				startDate: row.lease_start_date,
				endDate: row.lease_end_date,
				status: row.lease_status,
			} : null,
			createdAt: row.created_at,
			updatedAt: row.updated_at,
		}));

		return NextResponse.json({
			tenants,
			total,
			limit,
			offset,
			hasMore: offset + limit < total,
		});

	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.validationError(error, requestId);
		}
		console.error('Failed to fetch tenants:', error);
		return ApiErrorHandler.databaseError(error, requestId);
	}
}

// POST /api/real-estate/investor/tenants - Create a new tenant
export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized('Authentication required');
		}

		const body = await request.json();
		const tenantData = createTenantSchema.parse(body);

		const sql = await getDbConnection();

		// Insert new tenant
		const result = await sql`
			INSERT INTO tenants (
				user_id, property_id, unit_id, first_name, last_name, email, phone,
				date_of_birth, emergency_contact, current_address, employment_info,
				credit_score, notes, status
			) VALUES (
				${userId}, ${tenantData.propertyId || null}, ${tenantData.unitId || null},
				${tenantData.firstName}, ${tenantData.lastName}, ${tenantData.email || null},
				${tenantData.phone || null}, ${tenantData.dateOfBirth ? new Date(tenantData.dateOfBirth) : null},
				${tenantData.emergencyContact ? JSON.stringify(tenantData.emergencyContact) : null},
				${tenantData.currentAddress || null}, ${tenantData.employmentInfo ? JSON.stringify(tenantData.employmentInfo) : null},
				${tenantData.creditScore || null}, ${tenantData.notes || null}, 'active'
			) RETURNING *
		`;

		const newTenant = result[0];
		return NextResponse.json({
			tenant: {
				id: newTenant.id,
				propertyId: newTenant.property_id,
				unitId: newTenant.unit_id,
				firstName: newTenant.first_name,
				lastName: newTenant.last_name,
				email: newTenant.email,
				phone: newTenant.phone,
				status: newTenant.status,
				createdAt: newTenant.created_at,
				updatedAt: newTenant.updated_at,
			}
		}, { status: 201 });

	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.validationError(error, requestId);
		}
		console.error('Failed to create tenant:', error);
		return ApiErrorHandler.databaseError(error, requestId);
	}
}

