import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { BYOKService } from '@/lib/services/byok-service';

/**
 * POST /api/byok/validate
 * Validate an API key for a provider
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { provider, apiKey } = body;

		if (!provider || !apiKey) {
			return NextResponse.json(
				{ error: 'Provider and API key are required' },
				{ status: 400 }
			);
		}

		const byokService = new BYOKService();
		const validation = await byokService.validateApiKey(provider, apiKey);

		return NextResponse.json({ validation });

	} catch (error) {
		console.error('Error validating API key:', error);
		return NextResponse.json(
			{ error: 'Failed to validate API key' },
			{ status: 500 }
		);
	}
}

/**
 * GET /api/byok/providers
 * Get all supported AI providers and their models
 */
export async function GET() {
	try {
		const byokService = new BYOKService();
		const providers = byokService.getSupportedProviders();

		return NextResponse.json({ providers });

	} catch (error) {
		console.error('Error fetching providers:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch providers' },
			{ status: 500 }
		);
	}
}
