import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PartnerIntegrationManager } from '@/lib/services/integrations/partner-integration.service';
import { StripeIntegration } from '@/lib/services/integrations/stripe.service';
import { GustoIntegration } from '@/lib/services/integrations/gusto.service';
import { QuickBooksIntegration } from '@/lib/services/integrations/quickbooks.service';
import { XeroIntegration } from '@/lib/services/integrations/xero.service';
import { PayPalIntegration } from '@/lib/services/integrations/paypal.service';

/**
 * GET /api/integrations
 * Get all integrations for the current user
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const integrations = await PartnerIntegrationManager.getUserIntegrations(userId);

		return NextResponse.json(integrations);
	} catch (error) {
		console.error('Error fetching integrations:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * POST /api/integrations
 * Create a new integration
 */
export async function POST(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { partner, credentials, settings = {} } = body;

		if (!partner || !credentials) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Validate partner type
		const validPartners = ['stripe', 'gusto', 'quickbooks', 'xero', 'paypal'];
		if (!validPartners.includes(partner)) {
			return NextResponse.json({ error: 'Invalid partner type' }, { status: 400 });
		}

		// Create integration
		const integration = await PartnerIntegrationManager.createIntegration(
			userId,
			partner,
			credentials,
			settings
		);

		// Test connection
		const testResult = await PartnerIntegrationManager.testIntegration(integration.id);

		return NextResponse.json({
			integration,
			testResult
		}, { status: 201 });

	} catch (error) {
		console.error('Error creating integration:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * PATCH /api/integrations/[id]
 * Update integration credentials or settings
 */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const integrationId = params.id;
		const body = await request.json();
		const { credentials, settings, action } = body;

		// Get current integration to verify ownership
		const integration = await PartnerIntegrationManager.getIntegration(integrationId);
		if (!integration || integration.userId !== userId) {
			return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
		}

		let updatedIntegration = integration;

		if (credentials) {
			updatedIntegration = await PartnerIntegrationManager.updateIntegrationCredentials(
				integrationId,
				credentials
			);
		}

		if (settings) {
			updatedIntegration = await PartnerIntegrationManager.updateIntegrationSettings(
				integrationId,
				settings
			);
		}

		// If updating credentials, test connection
		if (credentials || action === 'test') {
			const testResult = await PartnerIntegrationManager.testIntegration(integrationId);
			return NextResponse.json({ integration: updatedIntegration, testResult });
		}

		return NextResponse.json({ integration: updatedIntegration });

	} catch (error) {
		console.error('Error updating integration:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * DELETE /api/integrations/[id]
 * Delete an integration
 */
export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const integrationId = params.id;

		// Verify ownership before deletion
		const integration = await PartnerIntegrationManager.getIntegration(integrationId);
		if (!integration || integration.userId !== userId) {
			return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
		}

		await PartnerIntegrationManager.deleteIntegration(integrationId);

		return NextResponse.json({ message: 'Integration deleted successfully' });

	} catch (error) {
		console.error('Error deleting integration:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
