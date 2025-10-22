import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { FreelanceHubService } from '@/lib/services/freelance-hub-service';
import { z } from 'zod';

const updateProjectSchema = z.object({
	name: z.string().min(1).optional(),
	description: z.string().optional(),
	status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).optional(),
	priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
	startDate: z.string().datetime().optional(),
	dueDate: z.string().datetime().optional(),
	budget: z.number().min(0).optional(),
	hourlyRate: z.number().min(0).optional(),
	currency: z.string().optional(),
	isBillable: z.boolean().optional(),
	allowOvertime: z.boolean().optional(),
	requireApproval: z.boolean().optional(),
	estimatedHours: z.number().min(0).optional(),
	tags: z.array(z.string()).optional(),
	metadata: z.record(z.unknown()).optional(),
	notes: z.string().optional(),
});

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const project = await FreelanceHubService.getProjectById(params.id, userId);

		if (!project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 });
		}

		return NextResponse.json({ project });
	} catch (error) {
		console.error('Error fetching project:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch project' },
			{ status: 500 }
		);
	}
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const validatedData = updateProjectSchema.parse(body);

		// Convert date strings to Date objects
		const processedData = {
			...validatedData,
			startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
			dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
		};

		const project = await FreelanceHubService.updateProject(params.id, userId, processedData);

		return NextResponse.json({ project });
	} catch (error) {
		if (error instanceof z.ZodError) {
			return NextResponse.json(
				{ error: 'Validation error', details: error.errors },
				{ status: 400 }
			);
		}

		console.error('Error updating project:', error);
		return NextResponse.json(
			{ error: 'Failed to update project' },
			{ status: 500 }
		);
	}
}
