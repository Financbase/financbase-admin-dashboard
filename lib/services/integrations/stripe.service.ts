/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { BasePartnerIntegration } from './partner-integration.service';
import { sql } from "@/lib/neon";

/**
 * Stripe Integration Service
 */
export class StripeIntegration extends BasePartnerIntegration {
	async testConnection(): Promise<{ success: boolean; message: string }> {
		try {
			// Test Stripe API connection
			const response = await fetch('https://api.stripe.com/v1/charges', {
				headers: {
					'Authorization': `Bearer ${this.credentials.apiKey}`,
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			});

			if (response.ok) {
				return { success: true, message: 'Stripe connection successful' };
			} else {
				return { success: false, message: `Stripe API error: ${response.status}` };
			}
		} catch (error: any) {
			return { success: false, message: `Connection failed: ${error.message}` };
		}
	}

	getWebhookEvents(): string[] {
		return [
			'payment_intent.succeeded',
			'payment_intent.payment_failed',
			'charge.succeeded',
			'charge.failed',
			'invoice.payment_succeeded',
			'invoice.payment_failed',
			'customer.created',
			'customer.updated',
			'customer.subscription.created',
			'customer.subscription.updated',
			'customer.subscription.deleted',
		];
	}

	async processWebhook(payload: Record<string, any>, signature?: string): Promise<void> {
		try {
			// Verify webhook signature if provided
			if (signature && this.credentials.webhookSecret) {
				// In production, verify the signature using Stripe's webhook verification
				// const isValid = await this.verifyStripeSignature(payload, signature);
				// if (!isValid) throw new Error('Invalid webhook signature');
			}

			const eventType = payload.type;
			const eventData = payload.data?.object;

			// Store webhook event
			await this.storeWebhookEvent(eventType, payload);

			// Process based on event type
			switch (eventType) {
				case 'payment_intent.succeeded':
					await this.handlePaymentSuccess(eventData);
					break;
				case 'payment_intent.payment_failed':
					await this.handlePaymentFailure(eventData);
					break;
				case 'invoice.payment_succeeded':
					await this.handleInvoicePayment(eventData);
					// Ensure subscription is synced after successful payment
					if (eventData.subscription) {
						await this.handleSubscriptionUpdate(eventData.subscription);
					}
					break;
				case 'invoice.payment_failed':
					await this.handleInvoicePaymentFailed(eventData);
					break;
				case 'customer.subscription.created':
					await this.handleSubscriptionCreated(eventData);
					break;
				case 'customer.subscription.updated':
					await this.handleSubscriptionUpdate(eventData);
					break;
				case 'customer.subscription.deleted':
					await this.handleSubscriptionDeleted(eventData);
					break;
			}

		} catch (error: any) {
			await this.storeWebhookError(payload, error.message);
			throw error;
		}
	}

	async syncData(): Promise<{ success: boolean; recordsProcessed: number }> {
		try {
			let totalProcessed = 0;

			// Sync payments
			const paymentsProcessed = await this.syncPayments();
			totalProcessed += paymentsProcessed;

			// Sync customers
			const customersProcessed = await this.syncCustomers();
			totalProcessed += customersProcessed;

			// Sync invoices
			const invoicesProcessed = await this.syncInvoices();
			totalProcessed += invoicesProcessed;

			return { success: true, recordsProcessed: totalProcessed };
		} catch (error: any) {
			return { success: false, recordsProcessed: 0 };
		}
	}

	getSettingsSchema(): Record<string, any> {
		return {
			apiKey: {
				type: 'string',
				required: true,
				label: 'Stripe Secret Key',
				description: 'Your Stripe secret API key',
			},
			webhookSecret: {
				type: 'string',
				required: false,
				label: 'Webhook Secret',
				description: 'Webhook endpoint secret for signature verification',
			},
			testMode: {
				type: 'boolean',
				required: false,
				label: 'Test Mode',
				description: 'Use Stripe test mode',
				default: true,
			},
		};
	}

	private async syncPayments(): Promise<number> {
		// Implementation for syncing Stripe payments
		return 0;
	}

	private async syncCustomers(): Promise<number> {
		// Implementation for syncing Stripe customers
		return 0;
	}

	private async syncInvoices(): Promise<number> {
		// Implementation for syncing Stripe invoices
		return 0;
	}

	private async handlePaymentSuccess(paymentData: any): Promise<void> {
		// Create payment record in database
		await sql.query(`
			INSERT INTO integrations.stripe_payments
			(payment_intent_id, amount, currency, status, customer_id, created_at)
			VALUES ($1, $2, $3, $4, $5, NOW())
		`, [
			paymentData.id,
			paymentData.amount,
			paymentData.currency,
			'succeeded',
			paymentData.customer,
		]);
	}

	private async handlePaymentFailure(paymentData: any): Promise<void> {
		// Handle failed payment
		await sql.query(`
			INSERT INTO integrations.stripe_payments
			(payment_intent_id, amount, currency, status, customer_id, error_message, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, NOW())
		`, [
			paymentData.id,
			paymentData.amount,
			paymentData.currency,
			'failed',
			paymentData.customer,
			paymentData.last_payment_error?.message,
		]);
	}

	private async handleInvoicePayment(invoiceData: any): Promise<void> {
		// Handle successful invoice payment
		await sql.query(`
			UPDATE invoices
			SET status = 'paid', paid_at = NOW()
			WHERE stripe_invoice_id = $1
		`, [invoiceData.id]);
	}

	private async handleInvoicePaymentFailed(invoiceData: any): Promise<void> {
		// Handle failed invoice payment - may trigger grace period
		console.log('Invoice payment failed:', invoiceData.id);
		// Grace period handling is done in subscription-grace-period.service.ts
	}

	private async handleSubscriptionCreated(subscriptionData: any): Promise<void> {
		try {
			// Import here to avoid circular dependencies
			const { syncSubscriptionToClerk } = await import('@/lib/services/clerk-metadata-sync.service');
			const { db } = await import('@/lib/db');
			const { userSubscriptions, subscriptionPlans } = await import('@/lib/db/schemas');
			const { eq } = await import('drizzle-orm');

			// Find user subscription by Stripe subscription ID
			const subscription = await db
				.select()
				.from(userSubscriptions)
				.where(eq(userSubscriptions.stripeSubscriptionId, subscriptionData.id))
				.limit(1);

			if (subscription.length > 0) {
				const sub = subscription[0];
				const plan = await db
					.select()
					.from(subscriptionPlans)
					.where(eq(subscriptionPlans.id, sub.planId))
					.limit(1);

				if (plan.length > 0) {
					await syncSubscriptionToClerk(sub.userId, sub, plan[0]);
				}
			}
		} catch (error) {
			console.error('Error handling subscription created:', error);
		}
	}

	private async handleSubscriptionUpdate(subscriptionData: any): Promise<void> {
		try {
			// Import here to avoid circular dependencies
			const { syncSubscriptionToClerk } = await import('@/lib/services/clerk-metadata-sync.service');
			const { db } = await import('@/lib/db');
			const { userSubscriptions, subscriptionPlans } = await import('@/lib/db/schemas');
			const { eq } = await import('drizzle-orm');

			// Find user subscription by Stripe subscription ID
			const subscription = await db
				.select()
				.from(userSubscriptions)
				.where(eq(userSubscriptions.stripeSubscriptionId, subscriptionData.id))
				.limit(1);

			if (subscription.length > 0) {
				const sub = subscription[0];
				
				// Update subscription status if changed
				const stripeStatus = subscriptionData.status;
				const statusMap: Record<string, string> = {
					active: 'active',
					trialing: 'trial',
					past_due: 'suspended',
					canceled: 'cancelled',
					unpaid: 'expired',
				};

				if (statusMap[stripeStatus] && statusMap[stripeStatus] !== sub.status) {
					await db
						.update(userSubscriptions)
						.set({
							status: statusMap[stripeStatus] as any,
							updatedAt: new Date(),
						})
						.where(eq(userSubscriptions.id, sub.id));
					
					// Update sub object for sync
					sub.status = statusMap[stripeStatus] as any;
				}

				const plan = await db
					.select()
					.from(subscriptionPlans)
					.where(eq(subscriptionPlans.id, sub.planId))
					.limit(1);

				if (plan.length > 0) {
					await syncSubscriptionToClerk(sub.userId, sub, plan[0]);
				}
			}
		} catch (error) {
			console.error('Error handling subscription update:', error);
		}
	}

	private async handleSubscriptionDeleted(subscriptionData: any): Promise<void> {
		try {
			// Import here to avoid circular dependencies
			const { revertToFreePlan } = await import('@/lib/services/clerk-metadata-sync.service');
			const { startGracePeriod } = await import('@/lib/services/subscription-grace-period.service');
			const { db } = await import('@/lib/db');
			const { userSubscriptions } = await import('@/lib/db/schemas');
			const { eq } = await import('drizzle-orm');

			// Find user subscription by Stripe subscription ID
			const subscription = await db
				.select()
				.from(userSubscriptions)
				.where(eq(userSubscriptions.stripeSubscriptionId, subscriptionData.id))
				.limit(1);

			if (subscription.length > 0) {
				const sub = subscription[0];
				
				// Update subscription status to cancelled
				await db
					.update(userSubscriptions)
					.set({
						status: 'cancelled',
						cancelledAt: new Date(),
						updatedAt: new Date(),
					})
					.where(eq(userSubscriptions.id, sub.id));

				// Start grace period
				await startGracePeriod(sub.userId, sub.id);

				// After grace period, revertToFreePlan will be called by cron job
			}
		} catch (error) {
			console.error('Error handling subscription deleted:', error);
		}
	}
}
