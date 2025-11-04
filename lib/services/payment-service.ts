/**
 * Payment Service
 * Business logic for payment processing and payment method management
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


import { db } from '@/lib/db';
import { paymentMethods, type PaymentMethod } from '@/lib/db/schemas/payment-methods.schema';
import { payments, type Payment } from '@/lib/db/schemas/payments.schema';
import { invoices } from '@/lib/db/schemas/invoices.schema';
import { eq, and, desc, ilike, or, sql, gte, lte } from 'drizzle-orm';
import { NotificationHelpers } from './notification-service';

interface CreatePaymentMethodInput {
	userId: string;
	accountId?: string;
	paymentMethodType: 'stripe' | 'paypal' | 'square' | 'bank_transfer' | 'check' | 'cash' | 'other';
	name: string;
	description?: string;
	
	// Stripe fields
	stripePaymentMethodId?: string;
	stripeCustomerId?: string;
	stripeAccountId?: string;
	
	// PayPal fields
	paypalMerchantId?: string;
	paypalEmail?: string;
	
	// Square fields
	squareApplicationId?: string;
	squareLocationId?: string;
	
	// Bank transfer fields
	bankName?: string;
	bankAccountNumber?: string;
	bankRoutingNumber?: string;
	
	// Configuration
	isDefault?: boolean;
	processingFee?: number;
	fixedFee?: number;
	currency?: string;
	isTestMode?: boolean;
	metadata?: Record<string, unknown>;
	notes?: string;
}

interface CreatePaymentInput {
	userId: string;
	paymentMethodId: string;
	invoiceId?: string;
	paymentType: 'invoice_payment' | 'refund' | 'chargeback' | 'adjustment' | 'transfer';
	amount: number;
	currency?: string;
	description?: string;
	reference?: string;
	metadata?: Record<string, unknown>;
	notes?: string;
}

interface PaymentStats {
	totalPayments: number;
	totalAmount: number;
	successfulPayments: number;
	failedPayments: number;
	averagePaymentAmount: number;
	paymentMethodsCount: number;
	recentPayments: Array<{
		id: string;
		amount: number;
		status: string;
		paymentMethodName: string;
		createdAt: string;
	}>;
	paymentsByMethod: Array<{
		paymentMethodType: string;
		count: number;
		totalAmount: number;
	}>;
	monthlyTrend: Array<{
		month: string;
		payments: number;
		amount: number;
	}>;
}

/**
 * Create a new payment method
 */
export async function createPaymentMethod(input: CreatePaymentMethodInput): Promise<PaymentMethod> {
	try {
		// If this is set as default, unset other defaults
		if (input.isDefault) {
			await db
				.update(paymentMethods)
				.set({ isDefault: false })
				.where(eq(paymentMethods.userId, input.userId));
		}

		const [paymentMethod] = await db.insert(paymentMethods).values({
			userId: input.userId,
			accountId: input.accountId,
			paymentMethodType: input.paymentMethodType,
			name: input.name,
			description: input.description,
			stripePaymentMethodId: input.stripePaymentMethodId,
			stripeCustomerId: input.stripeCustomerId,
			stripeAccountId: input.stripeAccountId,
			paypalMerchantId: input.paypalMerchantId,
			paypalEmail: input.paypalEmail,
			squareApplicationId: input.squareApplicationId,
			squareLocationId: input.squareLocationId,
			bankName: input.bankName,
			bankAccountNumber: input.bankAccountNumber,
			bankRoutingNumber: input.bankRoutingNumber,
			isDefault: input.isDefault || false,
			processingFee: input.processingFee?.toString(),
			fixedFee: input.fixedFee?.toString(),
			currency: input.currency || 'USD',
			isTestMode: input.isTestMode || false,
			metadata: input.metadata ? JSON.stringify(input.metadata) : null,
			notes: input.notes,
		}).returning();

		// Send notification
		await NotificationHelpers.sendPaymentMethodCreated(paymentMethod.id, input.userId);

		return paymentMethod;
	} catch (error) {
		console.error('Error creating payment method:', error);
		throw new Error('Failed to create payment method');
	}
}

/**
 * Get payment method by ID
 */
export async function getPaymentMethodById(paymentMethodId: string, userId: string): Promise<PaymentMethod | null> {
	const paymentMethod = await db.query.paymentMethods.findFirst({
		where: and(
			eq(paymentMethods.id, paymentMethodId),
			eq(paymentMethods.userId, userId)
		),
	});

	return paymentMethod || null;
}

/**
 * Get all payment methods for a user
 */
export async function getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
	const methods = await db
		.select()
		.from(paymentMethods)
		.where(and(
			eq(paymentMethods.userId, userId),
			eq(paymentMethods.status, 'active')
		))
		.orderBy(desc(paymentMethods.createdAt));

	return methods;
}

/**
 * Update payment method
 */
export async function updatePaymentMethod(
	paymentMethodId: string,
	userId: string,
	updateData: Partial<CreatePaymentMethodInput>
): Promise<PaymentMethod> {
	try {
		// If this is set as default, unset other defaults
		if (updateData.isDefault) {
			await db
				.update(paymentMethods)
				.set({ isDefault: false })
				.where(eq(paymentMethods.userId, userId));
		}

		const [updatedMethod] = await db
			.update(paymentMethods)
			.set({
				name: updateData.name,
				description: updateData.description,
				processingFee: updateData.processingFee?.toString(),
				fixedFee: updateData.fixedFee?.toString(),
				isDefault: updateData.isDefault,
				metadata: updateData.metadata ? JSON.stringify(updateData.metadata) : undefined,
				notes: updateData.notes,
				updatedAt: new Date(),
			})
			.where(and(
				eq(paymentMethods.id, paymentMethodId),
				eq(paymentMethods.userId, userId)
			))
			.returning();

		if (!updatedMethod) {
			throw new Error('Payment method not found');
		}

		return updatedMethod;
	} catch (error) {
		console.error('Error updating payment method:', error);
		throw new Error('Failed to update payment method');
	}
}

/**
 * Delete payment method
 */
export async function deletePaymentMethod(paymentMethodId: string, userId: string): Promise<void> {
	try {
		// Check if payment method has payments
		const [paymentCount] = await db
			.select({ count: sql<number>`count(*)` })
			.from(payments)
			.where(eq(payments.paymentMethodId, paymentMethodId));

		if (paymentCount?.count > 0) {
			throw new Error('Cannot delete payment method with existing payments');
		}

		await db
			.update(paymentMethods)
			.set({ status: 'inactive' })
			.where(and(
				eq(paymentMethods.id, paymentMethodId),
				eq(paymentMethods.userId, userId)
			));

		// Send notification
		await NotificationHelpers.sendPaymentMethodDeleted(paymentMethodId, userId);
	} catch (error) {
		console.error('Error deleting payment method:', error);
		throw new Error('Failed to delete payment method');
	}
}

/**
 * Process a payment
 */
export async function processPayment(input: CreatePaymentInput): Promise<Payment> {
	try {
		// Get payment method details
		const paymentMethod = await getPaymentMethodById(input.paymentMethodId, input.userId);
		if (!paymentMethod) {
			throw new Error('Payment method not found');
		}

		// Calculate processing fee
		const processingFee = calculateProcessingFee(
			input.amount,
			Number(paymentMethod.processingFee || 0),
			Number(paymentMethod.fixedFee || 0)
		);

		const netAmount = input.amount - processingFee;

		// Create payment record
		const [payment] = await db.insert(payments).values({
			userId: input.userId,
			paymentMethodId: input.paymentMethodId,
			invoiceId: input.invoiceId,
			paymentType: input.paymentType,
			amount: input.amount.toString(),
			currency: input.currency || 'USD',
			processingFee: processingFee.toString(),
			netAmount: netAmount.toString(),
			description: input.description,
			reference: input.reference,
			status: 'processing',
			metadata: input.metadata ? JSON.stringify(input.metadata) : null,
			notes: input.notes,
		}).returning();

		// Update payment method last used
		await db
			.update(paymentMethods)
			.set({ lastUsedAt: new Date() })
			.where(eq(paymentMethods.id, input.paymentMethodId));

		// If this is an invoice payment, update invoice status
		if (input.invoiceId && input.paymentType === 'invoice_payment') {
			await db
				.update(invoices)
				.set({ 
					status: 'paid',
					paidDate: new Date(),
					updatedAt: new Date()
				})
				.where(eq(invoices.id, input.invoiceId));
		}

		// Send notification
		await NotificationHelpers.sendPaymentProcessed(payment.id, input.userId);

		return payment;
	} catch (error) {
		console.error('Error processing payment:', error);
		throw new Error('Failed to process payment');
	}
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
	paymentId: string,
	userId: string,
	status: 'completed' | 'failed' | 'cancelled' | 'refunded',
	failureReason?: string,
	failureCode?: string
): Promise<Payment> {
	try {
		const updateData: any = {
			status,
			updatedAt: new Date(),
		};

		if (status === 'completed') {
			updateData.processedAt = new Date();
		} else if (status === 'failed') {
			updateData.failedAt = new Date();
			updateData.failureReason = failureReason;
			updateData.failureCode = failureCode;
		} else if (status === 'refunded') {
			updateData.refundedAt = new Date();
		}

		const [updatedPayment] = await db
			.update(payments)
			.set(updateData)
			.where(and(
				eq(payments.id, paymentId),
				eq(payments.userId, userId)
			))
			.returning();

		if (!updatedPayment) {
			throw new Error('Payment not found');
		}

		return updatedPayment;
	} catch (error) {
		console.error('Error updating payment status:', error);
		throw new Error('Failed to update payment status');
	}
}

/**
 * Get payments with pagination and filtering
 */
export async function getPaginatedPayments(
	userId: string,
	options: {
		page?: number;
		limit?: number;
		search?: string;
		status?: string;
		paymentMethodId?: string;
		startDate?: string;
		endDate?: string;
	} = {}
): Promise<{
	payments: Payment[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}> {
	const {
		page = 1,
		limit = 20,
		search,
		status,
		paymentMethodId,
		startDate,
		endDate
	} = options;

	const offset = (page - 1) * limit;

	// Build where conditions
	const whereConditions = [eq(payments.userId, userId)];
	
	if (search) {
		whereConditions.push(
			or(
				ilike(payments.description, `%${search}%`),
				ilike(payments.reference, `%${search}%`)
			)!
		);
	}
	
	if (status) {
		whereConditions.push(eq(payments.status, status as any));
	}
	
	if (paymentMethodId) {
		whereConditions.push(eq(payments.paymentMethodId, paymentMethodId));
	}
	
	if (startDate) {
		whereConditions.push(gte(payments.createdAt, new Date(startDate)));
	}
	
	if (endDate) {
		whereConditions.push(lte(payments.createdAt, new Date(endDate)));
	}

	// Get payments
	const paymentsList = await db
		.select()
		.from(payments)
		.where(and(...whereConditions))
		.orderBy(desc(payments.createdAt))
		.limit(limit)
		.offset(offset);

	// Get total count
	const [totalResult] = await db
		.select({ count: sql<number>`count(*)` })
		.from(payments)
		.where(and(...whereConditions));

	const total = totalResult?.count || 0;
	const totalPages = Math.ceil(total / limit);

	return {
		payments: paymentsList,
		total,
		page,
		limit,
		totalPages,
	};
}

/**
 * Get payment statistics
 */
export async function getPaymentStats(userId: string): Promise<PaymentStats> {
	// Get basic stats
	const [basicStats] = await db
		.select({
			totalPayments: sql<number>`count(*)`,
			totalAmount: sql<number>`sum(${payments.amount}::numeric)`,
			successfulPayments: sql<number>`count(case when ${payments.status} = 'completed' then 1 end)`,
			failedPayments: sql<number>`count(case when ${payments.status} = 'failed' then 1 end)`,
		})
		.from(payments)
		.where(eq(payments.userId, userId));

	// Get payment methods count
	const [paymentMethodsCount] = await db
		.select({ count: sql<number>`count(*)` })
		.from(paymentMethods)
		.where(and(
			eq(paymentMethods.userId, userId),
			eq(paymentMethods.status, 'active')
		));

	// Get recent payments
	const recentPayments = await db
		.select({
			id: payments.id,
			amount: payments.amount,
			status: payments.status,
			createdAt: payments.createdAt,
			paymentMethodName: paymentMethods.name,
		})
		.from(payments)
		.innerJoin(paymentMethods, eq(payments.paymentMethodId, paymentMethods.id))
		.where(eq(payments.userId, userId))
		.orderBy(desc(payments.createdAt))
		.limit(10);

	// Get payments by method
	const paymentsByMethod = await db
		.select({
			paymentMethodType: paymentMethods.paymentMethodType,
			count: sql<number>`count(*)`,
			totalAmount: sql<number>`sum(${payments.amount}::numeric)`,
		})
		.from(payments)
		.innerJoin(paymentMethods, eq(payments.paymentMethodId, paymentMethods.id))
		.where(and(
			eq(payments.userId, userId),
			eq(payments.status, 'completed')
		))
		.groupBy(paymentMethods.paymentMethodType);

	// Get monthly trend
	const monthlyTrend = await db
		.select({
			month: sql<string>`to_char(${payments.createdAt}, 'YYYY-MM')`,
			payments: sql<number>`count(*)`,
			amount: sql<number>`sum(${payments.amount}::numeric)`,
		})
		.from(payments)
		.where(and(
			eq(payments.userId, userId),
			eq(payments.status, 'completed'),
			gte(payments.createdAt, new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000))
		))
		.groupBy(sql`to_char(${payments.createdAt}, 'YYYY-MM')`)
		.orderBy(sql`to_char(${payments.createdAt}, 'YYYY-MM')`);

	const totalAmount = Number(basicStats?.totalAmount || 0);
	const totalPayments = basicStats?.totalPayments || 0;

	return {
		totalPayments,
		totalAmount,
		successfulPayments: basicStats?.successfulPayments || 0,
		failedPayments: basicStats?.failedPayments || 0,
		averagePaymentAmount: totalPayments > 0 ? totalAmount / totalPayments : 0,
		paymentMethodsCount: paymentMethodsCount?.count || 0,
		recentPayments: recentPayments.map(payment => ({
			id: payment.id,
			amount: Number(payment.amount),
			status: payment.status,
			paymentMethodName: payment.paymentMethodName,
			createdAt: payment.createdAt.toISOString(),
		})),
		paymentsByMethod: paymentsByMethod.map(method => ({
			paymentMethodType: method.paymentMethodType,
			count: method.count,
			totalAmount: Number(method.totalAmount),
		})),
		monthlyTrend: monthlyTrend.map(trend => ({
			month: trend.month,
			payments: trend.payments,
			amount: Number(trend.amount),
		})),
	};
}

/**
 * Calculate processing fee
 */
function calculateProcessingFee(amount: number, percentage: number, fixedFee: number): number {
	const percentageFee = (amount * percentage) / 100;
	return percentageFee + fixedFee;
}

/**
 * Set default payment method
 */
export async function setDefaultPaymentMethod(paymentMethodId: string, userId: string): Promise<PaymentMethod> {
	try {
		// First, unset all other default payment methods
		await db
			.update(paymentMethods)
			.set({ isDefault: false })
			.where(eq(paymentMethods.userId, userId));

		// Set the new default payment method
		const [defaultMethod] = await db
			.update(paymentMethods)
			.set({
				isDefault: true,
				updatedAt: new Date(),
			})
			.where(and(
				eq(paymentMethods.id, paymentMethodId),
				eq(paymentMethods.userId, userId)
			))
			.returning();

		if (!defaultMethod) {
			throw new Error('Payment method not found');
		}

		return defaultMethod;
	} catch (error) {
		console.error('Error setting default payment method:', error);
		throw new Error('Failed to set default payment method');
	}
}

// Export all payment service functions
export const PaymentService = {
	createPaymentMethod,
	getPaymentMethodById,
	getPaymentMethods,
	updatePaymentMethod,
	deletePaymentMethod,
	processPayment,
	updatePaymentStatus,
	getPaginatedPayments,
	getPaymentStats,
	setDefaultPaymentMethod,
};
