import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FreelanceHubService } from '@/lib/services/freelance-hub-service';
import { z } from 'zod';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

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
	const requestId = generateRequestId();
	try {
		const { userId } = await auth();
		if (!userId) {
			return ApiErrorHandler.unauthorized();
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
		return ApiErrorHandler.handle(error, requestId);
	}
}

export async function POST(request: NextRequest) {
	const requestId = generateRequestId();
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
		return ApiErrorHandler.handle(error, requestId);
	}
}
