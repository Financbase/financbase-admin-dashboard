/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sql } from '@/lib/neon';
import { PartnerIntegrationManager } from '@/lib/services/integrations/partner-integration.service';
import { StripeIntegration } from '@/lib/services/integrations/stripe.service';
import { GustoIntegration } from '@/lib/services/integrations/gusto.service';
import { QuickBooksIntegration } from '@/lib/services/integrations/quickbooks.service';
import { XeroIntegration } from '@/lib/services/integrations/xero.service';
import { PayPalIntegration } from '@/lib/services/integrations/paypal.service';

/**
 * POST /api/integrations/webhooks
 * Handle incoming webhooks from partner services
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const signature = request.headers.get('x-signature') ||
		                 request.headers.get('x-paypal-transmission-signature') ||
		                 request.headers.get('x-intuit-signature');

		const webhookSecret = request.headers.get('x-webhook-secret');
		const userId = request.headers.get('x-user-id') || 'user_12345'; // In production, get from webhook config

		// Determine service from payload or headers
		const service = determineService(body, request.headers);

		if (!service) {
			return NextResponse.json({ error: 'Unknown service' }, { status: 400 });
		}

		// Find active integration for this service and user
		const integrations = await PartnerIntegrationManager.getUserIntegrations(userId);
		const integration = integrations.find(
			(int) => int.partner === service && int.status === 'active'
		);

		if (!integration) {
			return NextResponse.json({ error: 'Integration not found or inactive' }, { status: 404 });
		}

		// Process webhook based on service
		let integrationService: any;

		switch (service) {
			case 'stripe':
				integrationService = new StripeIntegration(
					integration.id,
					integration.userId,
					integration.credentials
				);
				break;

			case 'gusto':
				integrationService = new GustoIntegration(
					integration.id,
					integration.userId,
					integration.credentials
				);
				break;

			case 'quickbooks':
				integrationService = new QuickBooksIntegration(
					integration.id,
					integration.userId,
					integration.credentials
				);
				break;

			case 'xero':
				integrationService = new XeroIntegration(
					integration.id,
					integration.userId,
					integration.credentials
				);
				break;

			case 'paypal':
				integrationService = new PayPalIntegration(
					integration.id,
					integration.userId,
					integration.credentials
				);
				break;

			default:
				return NextResponse.json({ error: 'Unsupported service' }, { status: 400 });
		}

		// Process the webhook
		await integrationService.processWebhook(body, signature);

		return NextResponse.json({
			received: true,
			service,
			processed: true
		});

	} catch (error) {
		console.error('Webhook processing error:', error);
		return NextResponse.json({
			error: 'Webhook processing failed',
			message: error.message
		}, { status: 500 });
	}
}

/**
 * GET /api/integrations/webhooks
 * Get webhook events for a user
 */
export async function GET(request: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const integrationId = searchParams.get('integrationId');
		const limit = parseInt(searchParams.get('limit') || '50');
		const offset = parseInt(searchParams.get('offset') || '0');

		let query = `
			SELECT we.*, pi.partner
			FROM integrations.webhook_events we
			JOIN integrations.partner_integrations pi ON we.integration_id = pi.id
			WHERE pi.user_id = $1
		`;
		const params: (string | number)[] = [userId];

		if (integrationId) {
			query += ` AND we.integration_id = $${params.length + 1}`;
			params.push(integrationId);
		}

		query += ` ORDER BY we.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
		params.push(limit, offset);

		const result = await sql.query(query, params);

		return NextResponse.json(result.rows);

	} catch (error) {
		console.error('Error fetching webhook events:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

/**
 * Determine service from webhook payload or headers
 */
function determineService(body: any, headers: Headers): string | null {
	// Check URL path or headers for service indicator
	const userAgent = headers.get('user-agent') || '';

	// Stripe
	if (body.type && body.data && body.livemode !== undefined) {
		return 'stripe';
	}

	// PayPal
	if (body.event_type && body.resource_type) {
		return 'paypal';
	}

	// Gusto
	if (body.event_type && body.company_id) {
		return 'gusto';
	}

	// QuickBooks
	if (body.eventNotifications && body.eventNotifications[0]?.dataChangeEvent) {
		return 'quickbooks';
	}

	// Xero
	if (body.Events && body.Events[0]?.EventType) {
		return 'xero';
	}

	// Check user agent
	if (userAgent.includes('Stripe')) return 'stripe';
	if (userAgent.includes('PayPal')) return 'paypal';
	if (userAgent.includes('Gusto')) return 'gusto';
	if (userAgent.includes('QuickBooks')) return 'quickbooks';
	if (userAgent.includes('Xero')) return 'xero';

	return null;
}
