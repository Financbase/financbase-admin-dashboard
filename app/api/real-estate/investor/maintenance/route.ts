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

interface MaintenanceRow {
	id: string;
	title: string;
	description: string;
	category: string;
	priority: string;
	status: string;
	reported_date: Date | string;
	scheduled_date?: Date | string | null;
	completed_date?: Date | string | null;
	assigned_to?: string | null;
	estimated_cost?: string | number | null;
	actual_cost?: string | number | null;
	notes?: string | null;
	photos?: unknown;
	property_name?: string | null;
	property_address?: string | null;
	property_city?: string | null;
	property_state?: string | null;
	tenant_first_name?: string | null;
	tenant_last_name?: string | null;
}

// Simple database connection using neon directly
async function getDbConnection() {
	const { neon } = await import('@neondatabase/serverless');
	if (!process.env.DATABASE_URL) {
		throw new Error('DATABASE_URL is not configured');
	}
	return neon(process.env.DATABASE_URL);
}

const queryParamsSchema = z.object({
	status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
	priority: z.enum(['low', 'medium', 'high', 'emergency']).optional(),
	limit: z.string().optional().transform((val) => {
		const num = parseInt(val || '20', 10);
		return Math.min(Math.max(num, 1), 100); // Clamp between 1 and 100
	}),
});

// GET /api/real-estate/investor/maintenance - Get maintenance requests
export async function GET(request: NextRequest) {
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized('Authentication required');
		}

		const { searchParams } = new URL(request.url);
		const params = queryParamsSchema.parse({
			status: searchParams.get('status'),
			priority: searchParams.get('priority'),
			limit: searchParams.get('limit'),
		});

		// Get database connection
		const sql = await getDbConnection();

		// Build parameterized query with conditional filters
		// Use COALESCE to handle optional filters safely
		let maintenanceResult: MaintenanceRow[];
		
		if (params.status && params.priority) {
			maintenanceResult = await sql`
				SELECT
					mr.id,
					mr.title,
					mr.description,
					mr.category,
					mr.priority,
					mr.status,
					mr.reported_date,
					mr.scheduled_date,
					mr.completed_date,
					mr.assigned_to,
					mr.estimated_cost,
					mr.actual_cost,
					mr.notes,
					mr.photos,
					p.name as property_name,
					p.address as property_address,
					p.city as property_city,
					p.state as property_state,
					t.first_name as tenant_first_name,
					t.last_name as tenant_last_name
				FROM maintenance_requests mr
				LEFT JOIN properties p ON mr.property_id = p.id
				LEFT JOIN tenants t ON mr.tenant_id = t.id
				WHERE mr.user_id = ${userId}
					AND mr.status = ${params.status}
					AND mr.priority = ${params.priority}
				ORDER BY 
					CASE mr.priority
						WHEN 'emergency' THEN 1
						WHEN 'high' THEN 2
						WHEN 'medium' THEN 3
						WHEN 'low' THEN 4
					END,
					mr.reported_date DESC
				LIMIT ${params.limit || 20}
			`;
		} else if (params.status) {
			maintenanceResult = await sql`
				SELECT
					mr.id,
					mr.title,
					mr.description,
					mr.category,
					mr.priority,
					mr.status,
					mr.reported_date,
					mr.scheduled_date,
					mr.completed_date,
					mr.assigned_to,
					mr.estimated_cost,
					mr.actual_cost,
					mr.notes,
					mr.photos,
					p.name as property_name,
					p.address as property_address,
					p.city as property_city,
					p.state as property_state,
					t.first_name as tenant_first_name,
					t.last_name as tenant_last_name
				FROM maintenance_requests mr
				LEFT JOIN properties p ON mr.property_id = p.id
				LEFT JOIN tenants t ON mr.tenant_id = t.id
				WHERE mr.user_id = ${userId}
					AND mr.status = ${params.status}
				ORDER BY 
					CASE mr.priority
						WHEN 'emergency' THEN 1
						WHEN 'high' THEN 2
						WHEN 'medium' THEN 3
						WHEN 'low' THEN 4
					END,
					mr.reported_date DESC
				LIMIT ${params.limit || 20}
			`;
		} else if (params.priority) {
			maintenanceResult = await sql`
				SELECT
					mr.id,
					mr.title,
					mr.description,
					mr.category,
					mr.priority,
					mr.status,
					mr.reported_date,
					mr.scheduled_date,
					mr.completed_date,
					mr.assigned_to,
					mr.estimated_cost,
					mr.actual_cost,
					mr.notes,
					mr.photos,
					p.name as property_name,
					p.address as property_address,
					p.city as property_city,
					p.state as property_state,
					t.first_name as tenant_first_name,
					t.last_name as tenant_last_name
				FROM maintenance_requests mr
				LEFT JOIN properties p ON mr.property_id = p.id
				LEFT JOIN tenants t ON mr.tenant_id = t.id
				WHERE mr.user_id = ${userId}
					AND mr.priority = ${params.priority}
				ORDER BY 
					CASE mr.priority
						WHEN 'emergency' THEN 1
						WHEN 'high' THEN 2
						WHEN 'medium' THEN 3
						WHEN 'low' THEN 4
					END,
					mr.reported_date DESC
				LIMIT ${params.limit || 20}
			`;
		} else {
			maintenanceResult = await sql`
				SELECT
					mr.id,
					mr.title,
					mr.description,
					mr.category,
					mr.priority,
					mr.status,
					mr.reported_date,
					mr.scheduled_date,
					mr.completed_date,
					mr.assigned_to,
					mr.estimated_cost,
					mr.actual_cost,
					mr.notes,
					mr.photos,
					p.name as property_name,
					p.address as property_address,
					p.city as property_city,
					p.state as property_state,
					t.first_name as tenant_first_name,
					t.last_name as tenant_last_name
				FROM maintenance_requests mr
				LEFT JOIN properties p ON mr.property_id = p.id
				LEFT JOIN tenants t ON mr.tenant_id = t.id
				WHERE mr.user_id = ${userId}
				ORDER BY 
					CASE mr.priority
						WHEN 'emergency' THEN 1
						WHEN 'high' THEN 2
						WHEN 'medium' THEN 3
						WHEN 'low' THEN 4
					END,
					mr.reported_date DESC
				LIMIT ${params.limit || 20}
			`;
		}

		const maintenanceRequests = maintenanceResult.map((row: MaintenanceRow) => ({
			id: row.id,
			title: row.title,
			description: row.description,
			category: row.category,
			priority: row.priority,
			status: row.status,
			reportedDate: row.reported_date instanceof Date ? row.reported_date.toISOString() : row.reported_date,
			scheduledDate: row.scheduled_date ? (row.scheduled_date instanceof Date ? row.scheduled_date.toISOString() : row.scheduled_date) : null,
			completedDate: row.completed_date ? (row.completed_date instanceof Date ? row.completed_date.toISOString() : row.completed_date) : null,
			assignedTo: row.assigned_to,
			estimatedCost: row.estimated_cost ? Number(row.estimated_cost) : null,
			actualCost: row.actual_cost ? Number(row.actual_cost) : null,
			notes: row.notes,
			photos: row.photos,
			property: row.property_name ? {
				name: row.property_name,
				address: row.property_address,
				city: row.property_city,
				state: row.property_state,
			} : null,
			tenant: row.tenant_first_name ? {
				firstName: row.tenant_first_name,
				lastName: row.tenant_last_name,
			} : null,
		}));

		// Get maintenance statistics with parameterized query
		const statsResult = await sql`
			SELECT
				COUNT(*)::int as total_requests,
				COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending_requests,
				COUNT(CASE WHEN status = 'in_progress' THEN 1 END)::int as in_progress_requests,
				COUNT(CASE WHEN status = 'completed' THEN 1 END)::int as completed_requests,
				COUNT(CASE WHEN priority = 'emergency' THEN 1 END)::int as emergency_requests,
				COALESCE(AVG(actual_cost), 0)::decimal as average_cost
			FROM maintenance_requests
			WHERE user_id = ${userId}
				AND reported_date >= CURRENT_DATE - INTERVAL '6 months'
		`;

		const statsRow = statsResult[0] || {};
		const stats = {
			totalRequests: Number(statsRow.total_requests || 0),
			pendingRequests: Number(statsRow.pending_requests || 0),
			inProgressRequests: Number(statsRow.in_progress_requests || 0),
			completedRequests: Number(statsRow.completed_requests || 0),
			emergencyRequests: Number(statsRow.emergency_requests || 0),
			averageCost: Number(statsRow.average_cost || 0),
		};

		return NextResponse.json({
			maintenanceRequests,
			stats,
		});

	} catch (error) {
		if (error instanceof z.ZodError) {
			return ApiErrorHandler.validationError(error, requestId);
		}
		console.error('Failed to fetch maintenance requests:', error);
		return ApiErrorHandler.databaseError(error, requestId);
	}
}
