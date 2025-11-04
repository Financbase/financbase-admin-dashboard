/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { LeadManagementService } from '@/lib/services/lead-management-service';
import { z } from 'zod';

const updateLeadSchema = z.object({
	firstName: z.string().min(1).optional(),
	lastName: z.string().min(1).optional(),
	email: z.string().email().optional(),
	phone: z.string().optional(),
	company: z.string().optional(),
	jobTitle: z.string().optional(),
	website: z.string().url().optional().or(z.literal('')),
	source: z.enum(['website', 'referral', 'social_media', 'email_campaign', 'cold_call', 'trade_show', 'advertisement', 'partner', 'other']).optional(),
	priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
	estimatedValue: z.number().min(0).optional(),
	probability: z.number().min(0).max(100).optional(),
	expectedCloseDate: z.string().datetime().optional(),
	assignedTo: z.string().optional(),
	tags: z.array(z.string()).optional(),
	notes: z.string().optional(),
	metadata: z.record(z.unknown()).optional(),
});

const updateStatusSchema = z.object({
	status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost', 'nurturing']),
	notes: z.string().optional(),
});

const convertToClientSchema = z.object({
	companyName: z.string().min(1, 'Company name is required'),
	contactName: z.string().optional(),
	email: z.string().email('Valid email is required'),
	phone: z.string().optional(),
	address: z.string().optional(),
	city: z.string().optional(),
	state: z.string().optional(),
	zipCode: z.string().optional(),
	country: z.string().optional(),
	currency: z.string().optional(),
	paymentTerms: z.string().optional(),
	notes: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const lead = await LeadManagementService.getLeadById(id, userId);

		if (!lead) {
			return ApiErrorHandler.notFound('Lead not found');
		}

		return NextResponse.json({ lead });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		let body;
		try {
			body = await request.json();
		} catch (error) {
			return ApiErrorHandler.badRequest('Invalid JSON in request body');
		}
		const action = body.action;

		if (action === 'update_status') {
			// Update lead status
			const validatedData = updateStatusSchema.parse(body);
			const lead = await LeadManagementService.updateLeadStatus(
				id,
				userId,
				validatedData.status,
				validatedData.notes
			);
			return NextResponse.json({ lead });
		} else if (action === 'convert_to_client') {
			// Convert lead to client
			const validatedData = convertToClientSchema.parse(body);
			const result = await LeadManagementService.convertLeadToClient(
				id,
				userId,
				validatedData
			);
			return NextResponse.json({ lead: result.lead, clientId: result.clientId });
		} else {
			// Update lead details
			const validatedData = updateLeadSchema.parse(body);
			
			// Convert date strings to Date objects
			const processedData = {
				...validatedData,
				expectedCloseDate: validatedData.expectedCloseDate ? new Date(validatedData.expectedCloseDate) : undefined,
			};

			const lead = await LeadManagementService.updateLead(id, userId, processedData);
			return NextResponse.json({ lead });
		}
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const requestId = generateRequestId();
	const { id } = await params;
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
		}

		const lead = await LeadManagementService.getLeadById(id, userId);

		if (!lead) {
			return ApiErrorHandler.notFound('Lead not found');
		}

		// For now, we'll update the lead to a deleted status rather than hard delete
		// In production, you might want to implement soft delete with a deleted_at field
		await LeadManagementService.updateLeadStatus(id, userId, 'closed_lost', 'Deleted by user');

		return NextResponse.json({
			message: 'Lead deleted successfully',
			leadId: id,
		});
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
