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
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized', code: 'UNAUTHORIZED' },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const lead = await LeadManagementService.getLeadById(id, userId);

		if (!lead) {
			return NextResponse.json(
				{ error: 'Lead not found', code: 'NOT_FOUND' },
				{ status: 404 }
			);
		}

		return NextResponse.json({ lead });
	} catch (error) {
		 
    // eslint-disable-next-line no-console
    console.error('Error fetching lead:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch lead' },
			{ status: 500 }
		);
	}
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized', code: 'UNAUTHORIZED' },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const body = await request.json();
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
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{
					error: 'Validation error',
					details: error.issues,
					code: 'VALIDATION_ERROR',
				},
				{ status: 400 }
			);
		}

		 
		console.error('Error updating lead:', error);
		return NextResponse.json(
			{
				error: 'Failed to update lead',
				details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
				code: 'DATABASE_ERROR',
			},
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json(
				{ error: 'Unauthorized', code: 'UNAUTHORIZED' },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const lead = await LeadManagementService.getLeadById(id, userId);

		if (!lead) {
			return NextResponse.json(
				{ error: 'Lead not found', code: 'NOT_FOUND' },
				{ status: 404 }
			);
		}

		// For now, we'll update the lead to a deleted status rather than hard delete
		// In production, you might want to implement soft delete with a deleted_at field
		await LeadManagementService.updateLeadStatus(id, userId, 'closed_lost', 'Deleted by user');

		return NextResponse.json({
			message: 'Lead deleted successfully',
			leadId: id,
		});
	} catch (error) {
		console.error('Error deleting lead:', error);

		if (error instanceof Error) {
			return NextResponse.json(
				{
					error: 'Failed to delete lead',
					details: process.env.NODE_ENV === 'development' ? error.message : undefined,
					code: 'DATABASE_ERROR',
				},
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{
				error: 'Failed to delete lead',
				code: 'INTERNAL_ERROR',
			},
			{ status: 500 }
		);
	}
}
