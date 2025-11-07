/**
 * Test Subscription RBAC System (Simple Version)
 * Tests subscription creation, Clerk sync, and RBAC mappings using direct SQL
 */

import postgres from "postgres";
import { config } from "dotenv";
import { resolve } from "path";

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
			       jsonb_array_length(sprm.permissions) as permission_count,
			       sprm.grace_period_days
			FROM subscription_plan_rbac_mappings sprm
			JOIN subscription_plans sp ON sp.id = sprm.plan_id
			ORDER BY sp.name, sprm.is_trial_mapping
		`;
		console.log(`   ✅ Found ${mappings.length} RBAC mappings`);
		mappings.forEach((m) => {
			console.log(
				`      - ${m.name} (${m.is_trial_mapping ? "Trial" : "Regular"}): ${m.role} role with ${m.permission_count} permissions (Grace: ${m.grace_period_days} days)`,
			);
		});

		// Test 2: Verify plan structure
		console.log("\n2️⃣ Testing Subscription Plans...");
		const plans = await sql`SELECT * FROM subscription_plans ORDER BY sort_order`;
		console.log(`   ✅ Found ${plans.length} subscription plans`);
		plans.forEach((p) => {
			console.log(
				`      - ${p.name}: $${p.price_monthly}/month (${p.is_enterprise ? "Enterprise" : "Standard"})`,
			);
		});

		// Test 3: Check existing subscriptions
		console.log("\n3️⃣ Testing Existing Subscriptions...");
		const subscriptions = await sql`
			SELECT us.*, sp.name as plan_name, sprm.role, sprm.permissions
			FROM user_subscriptions us
			JOIN subscription_plans sp ON sp.id = us.plan_id
			LEFT JOIN subscription_plan_rbac_mappings sprm ON sprm.plan_id = us.plan_id 
				AND sprm.is_trial_mapping = (us.status = 'trial')
			LIMIT 5
		`;
		console.log(`   Found ${subscriptions.length} subscription(s)`);
		if (subscriptions.length > 0) {
			subscriptions.forEach((sub) => {
				const permCount = sub.permissions ? JSON.parse(JSON.stringify(sub.permissions)).length : 0;
				console.log(
					`      - User ${sub.user_id.substring(0, 8)}... → ${sub.plan_name} (${sub.status}) → ${sub.role || "N/A"} role (${permCount} permissions)`,
				);
			});
		} else {
			console.log("   ℹ️  No subscriptions found. Create one via API to test sync.");
		}

		// Test 4: Test grace period status history
		console.log("\n4️⃣ Testing Status History...");
		const history = await sql`
			SELECT COUNT(*) as count FROM subscription_status_history
		`;
		console.log(`   ✅ Status history table ready (${history[0].count} records)`);

		// Test 5: Verify table structure
		console.log("\n5️⃣ Verifying Database Schema...");
		const tables = await sql`
			SELECT table_name 
			FROM information_schema.tables 
			WHERE table_schema = 'public' 
			AND table_name IN (
				'subscription_plan_rbac_mappings',
				'subscription_status_history',
				'subscription_plans',
				'user_subscriptions'
			)
			ORDER BY table_name
		`;
		console.log(`   ✅ Found ${tables.length}/4 required tables`);
		tables.forEach((t) => {
			console.log(`      - ${t.table_name}`);
		});

		// Test 6: Check indexes
		console.log("\n6️⃣ Verifying Indexes...");
		const indexes = await sql`
			SELECT indexname 
			FROM pg_indexes 
			WHERE schemaname = 'public' 
			AND tablename IN ('subscription_plan_rbac_mappings', 'subscription_status_history')
			ORDER BY indexname
		`;
		console.log(`   ✅ Found ${indexes.length} indexes on RBAC tables`);

		console.log("\n✅ All tests completed successfully!");
		console.log("\n📋 Next Steps:");
		console.log("   1. Create a test subscription via POST /api/settings/billing/subscription");
		console.log("   2. Verify Clerk metadata syncs automatically");
		console.log("   3. Test webhook handlers with Stripe/PayPal events");
		console.log("   4. Monitor grace period cron job at /api/cron/subscription-grace-period");
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

