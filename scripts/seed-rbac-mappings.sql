-- Seed Subscription RBAC Mappings
DO $$
DECLARE
    free_plan_id uuid;
    pro_plan_id uuid;
    enterprise_plan_id uuid;
BEGIN
    -- Get plan IDs
    SELECT id INTO free_plan_id FROM subscription_plans WHERE name = 'Free' LIMIT 1;
    SELECT id INTO pro_plan_id FROM subscription_plans WHERE name = 'Pro' LIMIT 1;
    SELECT id INTO enterprise_plan_id FROM subscription_plans WHERE name = 'Enterprise' LIMIT 1;

    -- Free Plan - Regular Mapping
    INSERT INTO subscription_plan_rbac_mappings (plan_id, role, permissions, is_trial_mapping, grace_period_days)
    SELECT free_plan_id, 'viewer', '["invoices:view", "expenses:view", "reports:view"]'::jsonb, false, 7
    WHERE NOT EXISTS (SELECT 1 FROM subscription_plan_rbac_mappings WHERE plan_id = free_plan_id AND is_trial_mapping = false);

    -- Free Plan - Trial Mapping (same as regular)
    INSERT INTO subscription_plan_rbac_mappings (plan_id, role, permissions, is_trial_mapping, grace_period_days)
    SELECT free_plan_id, 'viewer', '["invoices:view", "expenses:view", "reports:view"]'::jsonb, true, 7
    WHERE NOT EXISTS (SELECT 1 FROM subscription_plan_rbac_mappings WHERE plan_id = free_plan_id AND is_trial_mapping = true);

    -- Pro Plan - Regular Mapping
    INSERT INTO subscription_plan_rbac_mappings (plan_id, role, permissions, is_trial_mapping, grace_period_days)
    SELECT pro_plan_id, 'user', '["invoices:view", "invoices:create", "invoices:edit", "expenses:view", "expenses:create", "expenses:edit", "reports:view", "reports:create", "reports:export", "revenue:view"]'::jsonb, false, 7
    WHERE NOT EXISTS (SELECT 1 FROM subscription_plan_rbac_mappings WHERE plan_id = pro_plan_id AND is_trial_mapping = false);

    -- Pro Plan - Trial Mapping
    INSERT INTO subscription_plan_rbac_mappings (plan_id, role, permissions, is_trial_mapping, grace_period_days)
    SELECT pro_plan_id, 'user', '["invoices:view", "invoices:create", "expenses:view", "expenses:create", "reports:view", "revenue:view"]'::jsonb, true, 7
    WHERE NOT EXISTS (SELECT 1 FROM subscription_plan_rbac_mappings WHERE plan_id = pro_plan_id AND is_trial_mapping = true);

    -- Enterprise Plan - Regular Mapping
    INSERT INTO subscription_plan_rbac_mappings (plan_id, role, permissions, is_trial_mapping, grace_period_days)
    SELECT enterprise_plan_id, 'manager', '["invoices:view", "invoices:create", "invoices:edit", "invoices:delete", "expenses:view", "expenses:create", "expenses:edit", "expenses:approve", "reports:view", "reports:create", "reports:export", "revenue:view", "audit:view", "settings:manage"]'::jsonb, false, 7
    WHERE NOT EXISTS (SELECT 1 FROM subscription_plan_rbac_mappings WHERE plan_id = enterprise_plan_id AND is_trial_mapping = false);

    -- Enterprise Plan - Trial Mapping
    INSERT INTO subscription_plan_rbac_mappings (plan_id, role, permissions, is_trial_mapping, grace_period_days)
    SELECT enterprise_plan_id, 'manager', '["invoices:view", "invoices:create", "expenses:view", "expenses:create", "reports:view", "reports:create", "revenue:view", "audit:view"]'::jsonb, true, 7
    WHERE NOT EXISTS (SELECT 1 FROM subscription_plan_rbac_mappings WHERE plan_id = enterprise_plan_id AND is_trial_mapping = true);

    RAISE NOTICE 'RBAC mappings seeded successfully';
END $$;

