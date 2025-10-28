import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// GET /api/real-estate/investor/maintenance - Get maintenance requests
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const status = searchParams.get('status');
		const priority = searchParams.get('priority');
		const limit = parseInt(searchParams.get('limit') || '20');

		// Build query conditions
		let whereConditions = `mr.user_id = '${userId}'`;

		if (status) {
			whereConditions += ` AND mr.status = '${status}'`;
		}

		if (priority) {
			whereConditions += ` AND mr.priority = '${priority}'`;
		}

		// Get maintenance requests with property details
		const maintenanceResult = await db.execute(`
			SELECT
				mr.*,
				p.name as property_name,
				p.address as property_address,
				p.city as property_city,
				p.state as property_state,
				t.first_name as tenant_first_name,
				t.last_name as tenant_last_name
			FROM maintenance_requests mr
			LEFT JOIN properties p ON mr.property_id = p.id
			LEFT JOIN tenants t ON mr.tenant_id = t.id
			WHERE ${whereConditions}
			ORDER BY 
				CASE mr.priority
					WHEN 'emergency' THEN 1
					WHEN 'high' THEN 2
					WHEN 'medium' THEN 3
					WHEN 'low' THEN 4
				END,
				mr.reported_date DESC
			LIMIT ${limit}
		`);

		const maintenanceRequests = maintenanceResult.rows.map(row => ({
			id: row.id,
			title: row.title,
			description: row.description,
			category: row.category,
			priority: row.priority,
			status: row.status,
			reportedDate: row.reported_date,
			scheduledDate: row.scheduled_date,
			completedDate: row.completed_date,
			assignedTo: row.assigned_to,
			estimatedCost: row.estimated_cost ? Number(row.estimated_cost) : null,
			actualCost: row.actual_cost ? Number(row.actual_cost) : null,
			notes: row.notes,
			photos: row.photos,
			property: {
				name: row.property_name,
				address: row.property_address,
				city: row.property_city,
				state: row.property_state,
			},
			tenant: row.tenant_first_name ? {
				firstName: row.tenant_first_name,
				lastName: row.tenant_last_name,
			} : null,
		}));

		// Get maintenance statistics
		const statsResult = await db.execute(`
			SELECT
				COUNT(*) as total_requests,
				COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
				COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_requests,
				COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
				COUNT(CASE WHEN priority = 'emergency' THEN 1 END) as emergency_requests,
				AVG(CASE WHEN actual_cost IS NOT NULL THEN actual_cost END) as average_cost
			FROM maintenance_requests
			WHERE user_id = '${userId}'
				AND reported_date >= CURRENT_DATE - INTERVAL '6 months'
		`);

		const stats = statsResult.rows[0] ? {
			totalRequests: Number(statsResult.rows[0].total_requests),
			pendingRequests: Number(statsResult.rows[0].pending_requests),
			inProgressRequests: Number(statsResult.rows[0].in_progress_requests),
			completedRequests: Number(statsResult.rows[0].completed_requests),
			emergencyRequests: Number(statsResult.rows[0].emergency_requests),
			averageCost: statsResult.rows[0].average_cost ? Number(statsResult.rows[0].average_cost) : 0,
		} : {
			totalRequests: 0,
			pendingRequests: 0,
			inProgressRequests: 0,
			completedRequests: 0,
			emergencyRequests: 0,
			averageCost: 0,
		};

		return NextResponse.json({
			maintenanceRequests,
			stats,
		});

	} catch (error) {
		console.error('Failed to fetch maintenance requests:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch maintenance requests' },
			{ status: 500 }
		);
	}
}
