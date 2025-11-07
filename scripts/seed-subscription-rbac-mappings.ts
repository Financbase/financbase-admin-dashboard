/**
 * Seed Subscription RBAC Mappings
 * Seeds default plan-to-role/permission mappings
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import postgres from "postgres";
import { config } from "dotenv";
import { resolve } from "path";
import { FINANCIAL_PERMISSIONS } from "@/types/auth";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

// Create direct database connection for script
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error("DATABASE_URL environment variable is required");
}

const sql = postgres(connectionString);

/**
 * Seed default RBAC mappings for subscription plans
 */
export async function seedSubscriptionRbacMappings(): Promise<{
	success: boolean;
	mappingsCreated: number;
	errors: string[];
}> {
	const errors: string[] = [];
	let mappingsCreated = 0;

	try {
		// Get all subscription plans using raw SQL
		const plans = await sql`SELECT * FROM subscription_plans ORDER BY sort_order`;

		for (const plan of plans) {
			try {
				// Define mappings based on plan name
				let regularMapping: {
					role: "admin" | "manager" | "user" | "viewer";
					permissions: string[];
				};
				let trialMapping: {
					role: "admin" | "manager" | "user" | "viewer";
					permissions: string[];
				};

				switch (plan.name.toLowerCase()) {
					case "free":
						regularMapping = {
							role: "viewer",
							permissions: [
								FINANCIAL_PERMISSIONS.INVOICES_VIEW,
								FINANCIAL_PERMISSIONS.EXPENSES_VIEW,
								FINANCIAL_PERMISSIONS.REPORTS_VIEW,
							],
						};
						trialMapping = {
							role: "viewer",
							permissions: [
								FINANCIAL_PERMISSIONS.INVOICES_VIEW,
								FINANCIAL_PERMISSIONS.EXPENSES_VIEW,
								FINANCIAL_PERMISSIONS.REPORTS_VIEW,
							],
						};
						break;

					case "pro":
						regularMapping = {
							role: "user",
							permissions: [
								FINANCIAL_PERMISSIONS.INVOICES_VIEW,
								FINANCIAL_PERMISSIONS.INVOICES_CREATE,
								FINANCIAL_PERMISSIONS.INVOICES_EDIT,
								FINANCIAL_PERMISSIONS.EXPENSES_VIEW,
								FINANCIAL_PERMISSIONS.EXPENSES_CREATE,
								FINANCIAL_PERMISSIONS.EXPENSES_EDIT,
								FINANCIAL_PERMISSIONS.REPORTS_VIEW,
								FINANCIAL_PERMISSIONS.REPORTS_CREATE,
								FINANCIAL_PERMISSIONS.REPORTS_EXPORT,
								FINANCIAL_PERMISSIONS.REVENUE_VIEW,
							],
						};
						// Trial gets limited permissions (view + limited create)
						trialMapping = {
							role: "user",
							permissions: [
								FINANCIAL_PERMISSIONS.INVOICES_VIEW,
								FINANCIAL_PERMISSIONS.INVOICES_CREATE,
								FINANCIAL_PERMISSIONS.EXPENSES_VIEW,
								FINANCIAL_PERMISSIONS.EXPENSES_CREATE,
								FINANCIAL_PERMISSIONS.REPORTS_VIEW,
								FINANCIAL_PERMISSIONS.REVENUE_VIEW,
							],
						};
						break;

					case "enterprise":
						regularMapping = {
							role: "manager",
							permissions: [
								FINANCIAL_PERMISSIONS.INVOICES_VIEW,
								FINANCIAL_PERMISSIONS.INVOICES_CREATE,
								FINANCIAL_PERMISSIONS.INVOICES_EDIT,
								FINANCIAL_PERMISSIONS.INVOICES_DELETE,
								FINANCIAL_PERMISSIONS.EXPENSES_VIEW,
								FINANCIAL_PERMISSIONS.EXPENSES_CREATE,
								FINANCIAL_PERMISSIONS.EXPENSES_EDIT,
								FINANCIAL_PERMISSIONS.EXPENSES_APPROVE,
								FINANCIAL_PERMISSIONS.REPORTS_VIEW,
								FINANCIAL_PERMISSIONS.REPORTS_CREATE,
								FINANCIAL_PERMISSIONS.REPORTS_EXPORT,
								FINANCIAL_PERMISSIONS.REVENUE_VIEW,
								FINANCIAL_PERMISSIONS.AUDIT_LOGS_VIEW,
								FINANCIAL_PERMISSIONS.SETTINGS_MANAGE,
							],
						};
						// Trial gets limited permissions
						trialMapping = {
							role: "manager",
							permissions: [
								FINANCIAL_PERMISSIONS.INVOICES_VIEW,
								FINANCIAL_PERMISSIONS.INVOICES_CREATE,
								FINANCIAL_PERMISSIONS.EXPENSES_VIEW,
								FINANCIAL_PERMISSIONS.EXPENSES_CREATE,
								FINANCIAL_PERMISSIONS.REPORTS_VIEW,
								FINANCIAL_PERMISSIONS.REPORTS_CREATE,
								FINANCIAL_PERMISSIONS.REVENUE_VIEW,
								FINANCIAL_PERMISSIONS.AUDIT_LOGS_VIEW,
							],
						};
						break;

					default:
						console.warn(`Unknown plan name: ${plan.name}, skipping`);
						continue;
				}

				// Check if regular mapping already exists
				const existingRegular = await sql`
					SELECT * FROM subscription_plan_rbac_mappings 
					WHERE plan_id = ${plan.id} AND is_trial_mapping = false 
					LIMIT 1
				`;

				if (existingRegular.length === 0) {
					// Create regular mapping
					await sql`
						INSERT INTO subscription_plan_rbac_mappings 
						(plan_id, role, permissions, is_trial_mapping, grace_period_days)
						VALUES (${plan.id}, ${regularMapping.role}, ${JSON.stringify(regularMapping.permissions)}::jsonb, false, 7)
					`;
					mappingsCreated++;
					console.log(
						`Created regular mapping for ${plan.name} plan`,
					);
				} else {
					console.log(
						`Regular mapping for ${plan.name} plan already exists`,
					);
				}

				// Check if trial mapping already exists
				const existingTrial = await sql`
					SELECT * FROM subscription_plan_rbac_mappings 
					WHERE plan_id = ${plan.id} AND is_trial_mapping = true 
					LIMIT 1
				`;

				if (existingTrial.length === 0) {
					// Create trial mapping
					await sql`
						INSERT INTO subscription_plan_rbac_mappings 
						(plan_id, role, permissions, is_trial_mapping, grace_period_days)
						VALUES (${plan.id}, ${trialMapping.role}, ${JSON.stringify(trialMapping.permissions)}::jsonb, true, 7)
					`;
					mappingsCreated++;
					console.log(
						`Created trial mapping for ${plan.name} plan`,
					);
				} else {
					console.log(
						`Trial mapping for ${plan.name} plan already exists`,
					);
				}
			} catch (error) {
				const errorMsg = `Error seeding mappings for ${plan.name}: ${
					error instanceof Error ? error.message : "Unknown error"
				}`;
				errors.push(errorMsg);
				console.error(errorMsg);
			}
		}

		return {
			success: errors.length === 0,
			mappingsCreated,
			errors,
		};
	} catch (error) {
		const errorMsg = `Error seeding RBAC mappings: ${
			error instanceof Error ? error.message : "Unknown error"
		}`;
		errors.push(errorMsg);
		console.error(errorMsg);
		return {
			success: false,
			mappingsCreated,
			errors,
		};
	}
}

// Run if called directly
if (require.main === module) {
	seedSubscriptionRbacMappings()
		.then((result) => {
			console.log("Seed result:", result);
			sql.end();
			process.exit(result.success ? 0 : 1);
		})
		.catch((error) => {
			console.error("Fatal error:", error);
			sql.end();
			process.exit(1);
		});
}

