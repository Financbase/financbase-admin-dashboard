import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { LeadManagementService } from '@/lib/services/lead-management-service';
import { z } from 'zod';

const createActivitySchema = z.object({
	leadId: z.string().min(1, 'Lead ID is required'),
	type: z.enum(['call', 'email', 'meeting', 'proposal', 'follow_up', 'note', 'task', 'conversion', 'status_change']),
	subject: z.string().min(1, 'Subject is required'),
	description: z.string().optional(),
	scheduledDate: z.string().datetime().optional(),
	duration: z.number().min(0).optional(),
	outcome: z.string().optional(),
	nextSteps: z.string().optional(),
	notes: z.string().optional(),
	requiresFollowUp: z.boolean().optional(),
	followUpDate: z.string().datetime().optional(),
	metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = createActivitySchema.parse(body);

		// Convert date strings to Date objects
		const processedData = {
			...validatedData,
			scheduledDate: validatedData.scheduledDate ? new Date(validatedData.scheduledDate) : undefined,
			followUpDate: validatedData.followUpDate ? new Date(validatedData.followUpDate) : undefined,
		};

		const activity = await LeadManagementService.createLeadActivity({
			...processedData,
			userId,
		});

		return NextResponse.json({ activity }, { status: 201 });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.errors },
				{ status: 400 }
			);
		}

		console.error('Error creating lead activity:', error);
		return NextResponse.json(
			{ error: 'Failed to create lead activity' },
			{ status: 500 }
		);
	}
}
