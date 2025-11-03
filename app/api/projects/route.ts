import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FreelanceHubService } from '@/lib/services/freelance-hub-service';
import { z } from 'zod';
import { ApiErrorHandler, generateRequestId } from '@/lib/api-error-handler';

const createProjectSchema = z.object({
	clientId: z.string().optional(),
	name: z.string().min(1, 'Project name is required'),
	description: z.string().optional(),
	status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
	priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
	startDate: z.string().datetime().optional(),
	dueDate: z.string().datetime().optional(),
	budget: z.number().min(0).optional(),
	hourlyRate: z.number().min(0).optional(),
	currency: z.string().default('USD'),
	isBillable: z.boolean().default(true),
	allowOvertime: z.boolean().default(false),
	requireApproval: z.boolean().default(false),
	estimatedHours: z.number().min(0).optional(),
	tags: z.array(z.string()).optional(),
	metadata: z.record(z.unknown()).optional(),
	notes: z.string().optional(),
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
		const priority = searchParams.get('priority') || undefined;
		const clientId = searchParams.get('clientId') || undefined;

		const result = await FreelanceHubService.getPaginatedProjects(userId, {
			page,
			limit,
			search,
			status,
			priority,
			clientId,
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

		const validatedData = createProjectSchema.parse(body);

		// Convert date strings to Date objects
		const processedData = {
			...validatedData,
			startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
			dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
		};

		const project = await FreelanceHubService.createProject({
			...processedData,
			userId,
		});

		return NextResponse.json({ project }, { status: 201 });
	} catch (error) {
		return ApiErrorHandler.handle(error, requestId);
	}
}
