import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FreelanceHubService } from '@/lib/services/freelance-hub-service';
import { z } from 'zod';

const createTimeEntrySchema = z.object({
	projectId: z.string().min(1, 'Project ID is required'),
	description: z.string().min(1, 'Description is required'),
	startTime: z.string().datetime(),
	endTime: z.string().datetime().optional(),
	duration: z.number().min(0).optional(),
	isBillable: z.boolean().default(true),
	hourlyRate: z.number().min(0).optional(),
	requiresApproval: z.boolean().default(false),
	tags: z.array(z.string()).optional(),
	metadata: z.record(z.unknown()).optional(),
	notes: z.string().optional(),
});

const startTimeTrackingSchema = z.object({
	projectId: z.string().min(1, 'Project ID is required'),
	description: z.string().min(1, 'Description is required'),
});

export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const page = parseInt(searchParams.get('page') || '1');
		const limit = parseInt(searchParams.get('limit') || '20');
		const search = searchParams.get('search') || undefined;
		const status = searchParams.get('status') || undefined;
		const projectId = searchParams.get('projectId') || undefined;
		const startDate = searchParams.get('startDate') || undefined;
		const endDate = searchParams.get('endDate') || undefined;

		const result = await FreelanceHubService.getPaginatedTimeEntries(userId, {
			page,
			limit,
			search,
			status,
			projectId,
			startDate,
			endDate,
		});

		return NextResponse.json(result);
	} catch (error) {
		console.error('Error fetching time entries:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch time entries' },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const action = body.action;

		if (action === 'start') {
			// Start time tracking
			const validatedData = startTimeTrackingSchema.parse(body);
			const timeEntry = await FreelanceHubService.startTimeTracking(
				userId,
				validatedData.projectId,
				validatedData.description
			);
			return NextResponse.json({ timeEntry }, { status: 201 });
		} else {
			// Create time entry
			const validatedData = createTimeEntrySchema.parse(body);
			
			// Convert date strings to Date objects
			const processedData = {
				...validatedData,
				startTime: new Date(validatedData.startTime),
				endTime: validatedData.endTime ? new Date(validatedData.endTime) : undefined,
			};

			const timeEntry = await FreelanceHubService.createTimeEntry({
				...processedData,
				userId,
			});

			return NextResponse.json({ timeEntry }, { status: 201 });
		}
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.errors },
				{ status: 400 }
			);
		}

		console.error('Error creating time entry:', error);
		return NextResponse.json(
			{ error: 'Failed to create time entry' },
			{ status: 500 }
		);
	}
}
