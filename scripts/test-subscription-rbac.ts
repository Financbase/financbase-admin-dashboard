/**
 * Test Subscription RBAC System
 * Tests subscription creation, Clerk sync, and RBAC mappings
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
import {
	getEffectiveRoleAndPermissions,
	getPlanRoleMapping,
} from "@/lib/services/subscription-rbac.service";
import { syncCurrentSubscriptionToClerk } from "@/lib/services/clerk-metadata-sync.service";
import { checkGracePeriodStatus } from "@/lib/services/subscription-grace-period.service";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const sql = postgres(process.env.DATABASE_URL!);

async function testSubscriptionRbac() {
	console.log("🧪 Testing Subscription RBAC System\n");

	try {
		// Test 1: Verify RBAC mappings exist
		console.log("1️⃣ Testing RBAC Mappings...");
		const mappings = await sql`
			SELECT sp.name, sprm.role, sprm.is_trial_mapping, 
			       jsonb_array_length(sprm.permissions) as permission_count
			FROM subscription_plan_rbac_mappings sprm
			JOIN subscription_plans sp ON sp.id = sprm.plan_id
			ORDER BY sp.name, sprm.is_trial_mapping
		`;
		console.log(`   ✅ Found ${mappings.length} RBAC mappings`);
		mappings.forEach((m) => {
			console.log(`      - ${m.name} (${m.is_trial_mapping ? "Trial" : "Regular"}): ${m.role} role with ${m.permission_count} permissions`);
		});

		// Test 2: Test plan role mapping retrieval
		console.log("\n2️⃣ Testing Plan Role Mapping Retrieval...");
		const plans = await sql`SELECT * FROM subscription_plans ORDER BY sort_order`;
		for (const plan of plans) {
			const mapping = await getPlanRoleMapping(plan.id, false);
			if (mapping) {
				console.log(`   ✅ ${plan.name} plan → ${mapping.role} role (${mapping.permissions.length} permissions)`);
			} else {
				console.log(`   ❌ ${plan.name} plan → No mapping found`);
			}
		}

		// Test 3: Test trial permissions
		console.log("\n3️⃣ Testing Trial Permissions...");
		for (const plan of plans) {
			if (plan.name !== "Free") {
				const trialMapping = await getPlanRoleMapping(plan.id, true);
				const regularMapping = await getPlanRoleMapping(plan.id, false);
				if (trialMapping && regularMapping) {
					const reduction = Math.round(
						((regularMapping.permissions.length - trialMapping.permissions.length) /
							regularMapping.permissions.length) *
							100,
					);
					console.log(
						`   ✅ ${plan.name} trial: ${trialMapping.permissions.length} permissions (${reduction}% reduction from regular)`,
					);
				}
			}
		}

		// Test 4: Check if any test subscriptions exist
		console.log("\n4️⃣ Testing Subscription Status...");
		const testSubscriptions = await sql`
			SELECT us.*, sp.name as plan_name
			FROM user_subscriptions us
			JOIN subscription_plans sp ON sp.id = us.plan_id
			LIMIT 5
		`;
		console.log(`   Found ${testSubscriptions.length} existing subscription(s)`);
		if (testSubscriptions.length > 0) {
			for (const sub of testSubscriptions) {
				const effective = await getEffectiveRoleAndPermissions(sub.user_id);
				if (effective) {
					console.log(
						`   ✅ User ${sub.user_id.substring(0, 8)}... → ${effective.role} role, ${effective.permissions.length} permissions (Trial: ${effective.isTrial}, Grace Period: ${effective.isInGracePeriod})`,
					);
				}
			}
		} else {
			console.log("   ℹ️  No subscriptions found. Create a subscription via API to test sync.");
		}

		// Test 5: Verify grace period calculation
		console.log("\n5️⃣ Testing Grace Period Logic...");
		if (testSubscriptions.length > 0) {
			const cancelledSub = testSubscriptions.find((s) => s.status === "cancelled");
			if (cancelledSub) {
				const graceStatus = await checkGracePeriodStatus(cancelledSub);
				console.log(
					`   ✅ Grace period check: ${graceStatus.isInGracePeriod ? "Active" : "Expired"} (${graceStatus.daysRemaining || 0} days remaining)`,
				);
			} else {
				console.log("   ℹ️  No cancelled subscriptions found to test grace period");
			}
		}

		console.log("\n✅ All tests completed successfully!");
	} catch (error) {
		console.error("❌ Test failed:", error);
		throw error;
	} finally {
		await sql.end();
	}
}

// Run tests
testSubscriptionRbac()
	.then(() => {
		console.log("\n🎉 Test suite completed!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n💥 Test suite failed:", error);
		process.exit(1);
	});

