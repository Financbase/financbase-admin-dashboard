import { sql } from "@/lib/neon";

/**
 * Revenue Sharing Types
 */
export interface RevenueShare {
	id: string;
	pluginId: string;
	developerId: string;
	platformPercentage: number;
	developerPercentage: number;
	minimumPayout: number;
	payoutFrequency: 'monthly' | 'quarterly' | 'annually';
	status: 'active' | 'inactive' | 'suspended';
	createdAt: Date;
	updatedAt: Date;
}

export interface PluginRevenue {
	id: string;
	pluginId: string;
	installationId: string;
	userId: string;
	amount: number;
	currency: string;
	transactionType: 'subscription' | 'one_time' | 'usage';
	platformFee: number;
	developerEarnings: number;
	status: 'pending' | 'paid' | 'failed';
	transactionDate: Date;
	payoutDate?: Date;
	createdAt: Date;
}

export interface DeveloperPayout {
	id: string;
	developerId: string;
	period: string; // YYYY-MM format
	totalEarnings: number;
	platformFees: number;
	netPayout: number;
	transactionCount: number;
	status: 'pending' | 'paid' | 'failed';
	payoutDate?: Date;
	createdAt: Date;
}

export interface MarketplaceAnalytics {
	pluginId: string;
	totalInstallations: number;
	activeInstallations: number;
	totalRevenue: number;
	monthlyRevenue: number;
	averageRating: number;
	reviewCount: number;
	conversionRate: number;
}

/**
 * Revenue Sharing Service
 * Manages revenue distribution between platform and developers
 */
export class RevenueSharingService {
	/**
	 * Create revenue share agreement for a plugin
	 */
	static async createRevenueShare(
		pluginId: string,
		developerId: string,
		platformPercentage: number = 30,
		minimumPayout: number = 50,
		payoutFrequency: 'monthly' | 'quarterly' | 'annually' = 'monthly'
	): Promise<RevenueShare> {
		const result = await sql.query(`
			INSERT INTO marketplace.revenue_shares
			(plugin_id, developer_id, platform_percentage, developer_percentage,
			 minimum_payout, payout_frequency, status, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
			RETURNING *
		`, [
			pluginId,
			developerId,
			platformPercentage,
			100 - platformPercentage,
			minimumPayout,
			payoutFrequency,
			'active'
		]);

		return result.rows[0];
	}

	/**
	 * Record plugin revenue transaction
	 */
	static async recordRevenue(
		pluginId: string,
		installationId: string,
		userId: string,
		amount: number,
		currency: string = 'USD',
		transactionType: 'subscription' | 'one_time' | 'usage' = 'subscription'
	): Promise<PluginRevenue> {
		// Get revenue share agreement
		const shareResult = await sql.query(`
			SELECT * FROM marketplace.revenue_shares
			WHERE plugin_id = $1 AND status = 'active'
		`, [pluginId]);

		if (shareResult.rows.length === 0) {
			throw new Error('No active revenue share agreement found for plugin');
		}

		const share = shareResult.rows[0];
		const platformFee = (amount * share.platform_percentage) / 100;
		const developerEarnings = amount - platformFee;

		// Record transaction
		const result = await sql.query(`
			INSERT INTO marketplace.plugin_revenue
			(plugin_id, installation_id, user_id, amount, currency, transaction_type,
			 platform_fee, developer_earnings, status, transaction_date, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
			RETURNING *
		`, [
			pluginId,
			installationId,
			userId,
			amount,
			currency,
			transactionType,
			platformFee,
			developerEarnings,
			'pending',
			new Date()
		]);

		return result.rows[0];
	}

	/**
	 * Process developer payouts for a specific period
	 */
	static async processPayouts(
		developerId: string,
		period: string // YYYY-MM format
	): Promise<DeveloperPayout> {
		// Calculate total earnings for the period
		const earningsResult = await sql.query(`
			SELECT
				SUM(pr.developer_earnings) as total_earnings,
				SUM(pr.platform_fee) as platform_fees,
				COUNT(*) as transaction_count
			FROM marketplace.plugin_revenue pr
			JOIN marketplace.revenue_shares rs ON pr.plugin_id = rs.plugin_id
			WHERE rs.developer_id = $1
				AND pr.status = 'pending'
				AND DATE_TRUNC('month', pr.transaction_date) = DATE_TRUNC('month', $2::date)
		`, [developerId, `${period}-01`]);

		const earnings = earningsResult.rows[0];
		const totalEarnings = parseFloat(earnings.total_earnings) || 0;
		const platformFees = parseFloat(earnings.platform_fees) || 0;
		const transactionCount = parseInt(earnings.transaction_count) || 0;

		// Check minimum payout threshold
		const shareResult = await sql.query(`
			SELECT minimum_payout FROM marketplace.revenue_shares
			WHERE developer_id = $1 AND status = 'active'
			LIMIT 1
		`, [developerId]);

		const minimumPayout = shareResult.rows.length > 0 ? shareResult.rows[0].minimum_payout : 50;

		if (totalEarnings < minimumPayout) {
			throw new Error(`Earnings below minimum payout threshold of $${minimumPayout}`);
		}

		// Create payout record
		const payoutResult = await sql.query(`
			INSERT INTO marketplace.developer_payouts
			(developer_id, period, total_earnings, platform_fees, net_payout,
			 transaction_count, status, created_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
			RETURNING *
		`, [
			developerId,
			period,
			totalEarnings,
			platformFees,
			totalEarnings,
			transactionCount,
			'pending'
		]);

		// Mark transactions as paid
		await sql.query(`
			UPDATE marketplace.plugin_revenue
			SET status = 'paid', payout_date = NOW()
			WHERE plugin_id IN (
				SELECT plugin_id FROM marketplace.revenue_shares WHERE developer_id = $1
			)
			AND status = 'pending'
			AND DATE_TRUNC('month', transaction_date) = DATE_TRUNC('month', $2::date)
		`, [developerId, `${period}-01`]);

		return payoutResult.rows[0];
	}

	/**
	 * Get developer earnings summary
	 */
	static async getDeveloperEarnings(
		developerId: string,
		period?: string
	): Promise<{
		totalEarnings: number;
		pendingPayouts: number;
		paidPayouts: number;
		monthlyEarnings: number;
		transactions: number;
	}> {
		let whereClause = `WHERE rs.developer_id = $1`;
		const params = [developerId];

		if (period) {
			whereClause += ` AND DATE_TRUNC('month', pr.transaction_date) = DATE_TRUNC('month', $2::date)`;
			params.push(`${period}-01`);
		}

		const result = await sql.query(`
			SELECT
				COALESCE(SUM(pr.developer_earnings), 0) as total_earnings,
				COALESCE(SUM(CASE WHEN pr.status = 'pending' THEN pr.developer_earnings ELSE 0 END), 0) as pending_payouts,
				COALESCE(SUM(CASE WHEN pr.status = 'paid' THEN pr.developer_earnings ELSE 0 END), 0) as paid_payouts,
				COALESCE(SUM(CASE WHEN DATE_TRUNC('month', pr.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
					THEN pr.developer_earnings ELSE 0 END), 0) as monthly_earnings,
				COUNT(*) as transaction_count
			FROM marketplace.plugin_revenue pr
			JOIN marketplace.revenue_shares rs ON pr.plugin_id = rs.plugin_id
			${whereClause}
		`, params);

		return {
			totalEarnings: parseFloat(result.rows[0].total_earnings),
			pendingPayouts: parseFloat(result.rows[0].pending_payouts),
			paidPayouts: parseFloat(result.rows[0].paid_payouts),
			monthlyEarnings: parseFloat(result.rows[0].monthly_earnings),
			transactions: parseInt(result.rows[0].transaction_count),
		};
	}

	/**
	 * Get plugin analytics
	 */
	static async getPluginAnalytics(pluginId: string): Promise<MarketplaceAnalytics> {
		const result = await sql.query(`
			SELECT
				COUNT(*) as total_installations,
				COUNT(*) FILTER (WHERE status = 'active') as active_installations,
				COALESCE(SUM(pr.amount), 0) as total_revenue,
				COALESCE(SUM(CASE WHEN DATE_TRUNC('month', pr.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
					THEN pr.amount ELSE 0 END), 0) as monthly_revenue,
				COALESCE(AVG(r.rating), 0) as average_rating,
				COUNT(r.id) as review_count,
				(COUNT(*) FILTER (WHERE pr.amount > 0) * 100.0 / NULLIF(COUNT(*), 0)) as conversion_rate
			FROM marketplace.plugin_installations pi
			LEFT JOIN marketplace.plugin_revenue pr ON pi.id = pr.installation_id
			LEFT JOIN marketplace.plugin_reviews r ON pi.plugin_id = r.plugin_id
			WHERE pi.plugin_id = $1
		`, [pluginId]);

		return {
			pluginId,
			totalInstallations: parseInt(result.rows[0].total_installations),
			activeInstallations: parseInt(result.rows[0].active_installations),
			totalRevenue: parseFloat(result.rows[0].total_revenue),
			monthlyRevenue: parseFloat(result.rows[0].monthly_revenue),
			averageRating: parseFloat(result.rows[0].average_rating),
			reviewCount: parseInt(result.rows[0].review_count),
			conversionRate: parseFloat(result.rows[0].conversion_rate),
		};
	}

	/**
	 * Get marketplace statistics
	 */
	static async getMarketplaceStats(): Promise<{
		totalPlugins: number;
		totalDevelopers: number;
		totalRevenue: number;
		monthlyRevenue: number;
		activeInstallations: number;
		averageRating: number;
	}> {
		const result = await sql.query(`
			SELECT
				COUNT(DISTINCT p.id) as total_plugins,
				COUNT(DISTINCT rs.developer_id) as total_developers,
				COALESCE(SUM(pr.amount), 0) as total_revenue,
				COALESCE(SUM(CASE WHEN DATE_TRUNC('month', pr.transaction_date) = DATE_TRUNC('month', CURRENT_DATE)
					THEN pr.amount ELSE 0 END), 0) as monthly_revenue,
				COUNT(*) FILTER (WHERE pi.status = 'active') as active_installations,
				COALESCE(AVG(r.rating), 0) as average_rating
			FROM marketplace.plugins p
			LEFT JOIN marketplace.revenue_shares rs ON p.id = rs.plugin_id
			LEFT JOIN marketplace.plugin_installations pi ON p.id = pi.plugin_id
			LEFT JOIN marketplace.plugin_revenue pr ON pi.id = pr.installation_id
			LEFT JOIN marketplace.plugin_reviews r ON p.id = r.plugin_id
			WHERE p.status = 'active' AND rs.status = 'active'
		`);

		return {
			totalPlugins: parseInt(result.rows[0].total_plugins),
			totalDevelopers: parseInt(result.rows[0].total_developers),
			totalRevenue: parseFloat(result.rows[0].total_revenue),
			monthlyRevenue: parseFloat(result.rows[0].monthly_revenue),
			activeInstallations: parseInt(result.rows[0].active_installations),
			averageRating: parseFloat(result.rows[0].average_rating),
		};
	}

	/**
	 * Process subscription billing for plugins
	 */
	static async processSubscriptionBilling(): Promise<number> {
		// Get all active subscriptions
		const subscriptionsResult = await sql.query(`
			SELECT
				pi.*,
				p.price,
				p.billing_cycle,
				rs.platform_percentage
			FROM marketplace.plugin_installations pi
			JOIN marketplace.plugins p ON pi.plugin_id = p.id
			JOIN marketplace.revenue_shares rs ON p.id = rs.plugin_id
			WHERE pi.status = 'active'
				AND p.pricing_model = 'subscription'
				AND (pi.last_billed IS NULL OR pi.last_billed < CURRENT_DATE - INTERVAL '1 month')
		`);

		let processedCount = 0;

		for (const subscription of subscriptionsResult.rows) {
			try {
				// Calculate amount based on billing cycle
				let amount = subscription.price;
				if (subscription.billing_cycle === 'annually') {
					amount = subscription.price * 12; // Convert annual to monthly equivalent for processing
				}

				// Record revenue
				await this.recordRevenue(
					subscription.plugin_id,
					subscription.id,
					subscription.user_id,
					amount,
					'USD',
					'subscription'
				);

				// Update last billed date
				await sql.query(`
					UPDATE marketplace.plugin_installations
					SET last_billed = CURRENT_DATE
					WHERE id = $1
				`, [subscription.id]);

				processedCount++;
			} catch (error) {
				console.error(`Error processing subscription ${subscription.id}:`, error);
			}
		}

		return processedCount;
	}

	/**
	 * Get top performing plugins
	 */
	static async getTopPlugins(
		limit: number = 10,
		period: 'month' | 'quarter' | 'year' | 'all' = 'month'
	): Promise<Array<{
		pluginId: string;
		pluginName: string;
		developerId: string;
		revenue: number;
		installations: number;
		rating: number;
	}>> {
		let dateFilter = '';
		if (period !== 'all') {
			const interval = period === 'month' ? '1 month' : period === 'quarter' ? '3 months' : '1 year';
			dateFilter = `AND pr.transaction_date >= CURRENT_DATE - INTERVAL '${interval}'`;
		}

		const result = await sql.query(`
			SELECT
				p.id as plugin_id,
				p.name as plugin_name,
				rs.developer_id,
				COALESCE(SUM(pr.amount), 0) as revenue,
				COUNT(DISTINCT pi.id) as installations,
				COALESCE(AVG(r.rating), 0) as rating
			FROM marketplace.plugins p
			JOIN marketplace.revenue_shares rs ON p.id = rs.plugin_id
			LEFT JOIN marketplace.plugin_revenue pr ON p.id = pr.plugin_id ${dateFilter}
			LEFT JOIN marketplace.plugin_installations pi ON p.id = pi.plugin_id AND pi.status = 'active'
			LEFT JOIN marketplace.plugin_reviews r ON p.id = r.plugin_id
			WHERE p.status = 'active' AND rs.status = 'active'
			GROUP BY p.id, p.name, rs.developer_id
			ORDER BY revenue DESC, installations DESC
			LIMIT $1
		`, [limit]);

		return result.rows.map(row => ({
			pluginId: row.plugin_id,
			pluginName: row.plugin_name,
			developerId: row.developer_id,
			revenue: parseFloat(row.revenue),
			installations: parseInt(row.installations),
			rating: parseFloat(row.rating),
		}));
	}
}

// Export singleton instance
export const revenueSharingService = new RevenueSharingService();
