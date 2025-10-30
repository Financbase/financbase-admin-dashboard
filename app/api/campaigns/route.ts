import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AdboardService } from '@/lib/services/adboard-service';
import { z } from 'zod';

const createCampaignSchema = z.object({
	name: z.string().min(1, 'Campaign name is required'),
	description: z.string().optional(),
	type: z.enum(['search', 'display', 'social', 'video', 'email', 'retargeting', 'affiliate']),
	platform: z.string().min(1, 'Platform is required'),
	audience: z.string().optional(),
	keywords: z.array(z.string()).optional(),
	demographics: z.record(z.unknown()).optional(),
	budget: z.number().min(0, 'Budget must be positive'),
	dailyBudget: z.number().min(0).optional(),
	bidStrategy: z.string().optional(),
	maxBid: z.number().min(0).optional(),
	startDate: z.string().datetime(),
	endDate: z.string().datetime().optional(),
	tags: z.array(z.string()).optional(),
	metadata: z.record(z.unknown()).optional(),
	notes: z.string().optional(),
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
		const type = searchParams.get('type') || undefined;
		const platform = searchParams.get('platform') || undefined;

		const result = await AdboardService.getPaginatedCampaigns(userId, {
			page,
			limit,
			search,
			status,
			type,
			platform,
		});

		return NextResponse.json(result);
	} catch (error) {
		console.error('Error fetching campaigns:', error);
		return NextResponse.json(
			{
				error: 'Failed to fetch campaigns',
				details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
				code: 'DATABASE_ERROR',
			},
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
		const validatedData = createCampaignSchema.parse(body);

		// Convert date strings to Date objects
		const processedData = {
			...validatedData,
			startDate: new Date(validatedData.startDate),
			endDate: validatedData.endDate ? new Date(validatedData.endDate) : undefined,
		};

		const campaign = await AdboardService.createCampaign({
			...processedData,
			userId,
		});

		return NextResponse.json({ campaign }, { status: 201 });
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

		console.error('Error creating campaign:', error);
		return NextResponse.json(
			{
				error: 'Failed to create campaign',
				details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
				code: 'DATABASE_ERROR',
			},
			{ status: 500 }
		);
	}
}
