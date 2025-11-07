-- Seed Guides Data
-- Run with: psql $DATABASE_URL -f scripts/seed-guides.sql

-- Get the first user's clerk_id as author
DO $$
DECLARE
    author_id text;
BEGIN
    SELECT clerk_id INTO author_id FROM financbase.users LIMIT 1;
    
    IF author_id IS NULL THEN
        RAISE EXCEPTION 'No users found in database. Please create a user first.';
    END IF;

    -- Insert guides
    INSERT INTO financbase.financbase_guides (
        title, slug, content, excerpt, description, category, type, difficulty,
        duration, estimated_read_time, author_id, status, tags, keywords,
        featured, priority, sort_order, published_at, created_at, updated_at
    ) VALUES
    (
        'Getting Started with Financbase',
        'getting-started-with-financbase',
        '# Getting Started with Financbase

Welcome to Financbase! This comprehensive guide will help you get up and running quickly.

## Overview

Financbase is a comprehensive financial management platform designed to help you take control of your finances. Whether you''re managing personal finances or running a business, Financbase provides the tools you need to stay organized and make informed decisions.

## Key Features

- **Dashboard Overview**: Get a real-time view of your financial health
- **Transaction Management**: Track and categorize all your transactions
- **Financial Reporting**: Generate detailed reports and insights
- **Budget Tracking**: Set budgets and monitor your spending
- **Invoice Management**: Create and manage invoices effortlessly
- **Expense Tracking**: Keep track of all your expenses

## Getting Started

### Step 1: Complete Your Profile

1. Navigate to your profile settings
2. Add your personal or business information
3. Configure your preferences

### Step 2: Connect Your Accounts

1. Go to the Accounts section
2. Add your bank accounts, credit cards, and other financial accounts
3. Enable automatic transaction syncing (if available)

### Step 3: Explore the Dashboard

1. Familiarize yourself with the main dashboard
2. Review the key metrics and charts
3. Customize your dashboard layout

## Next Steps

1. Set up your first budget
2. Create your first invoice
3. Record your first expense
4. Explore the reporting features

## Need Help?

If you have any questions, feel free to reach out to our support team through the support page.',
        'Learn the basics of setting up your account and navigating the platform',
        'Learn the basics of setting up your account and navigating the platform',
        'getting-started',
        'tutorial',
        'beginner',
        '15 min',
        15,
        author_id,
        'published',
        '["setup", "basics", "onboarding", "getting-started"]'::jsonb,
        '["getting started", "setup", "basics", "tutorial"]'::jsonb,
        true,
        10,
        0,
        NOW(),
        NOW(),
        NOW()
    ),
    (
        'Advanced Financial Analytics',
        'advanced-financial-analytics',
        '# Advanced Financial Analytics

Deep dive into Financbase''s powerful analytics features and learn how to create custom reports.

## Introduction

Financbase offers advanced analytics capabilities that help you understand your financial data at a deeper level. This guide will walk you through the most powerful features.

## Advanced Features

### Custom Report Builder

Create custom reports tailored to your specific needs:

1. Navigate to Reports > Custom Reports
2. Select your data sources
3. Choose your metrics and dimensions
4. Apply filters and date ranges
5. Generate and export your report

### Data Visualization

Transform your data into actionable insights:

- **Charts and Graphs**: Visualize trends and patterns
- **Interactive Dashboards**: Create dynamic dashboards
- **Custom Visualizations**: Build your own charts

### Trend Analysis

Identify patterns and trends in your financial data:

- Revenue trends over time
- Expense patterns by category
- Seasonal variations
- Growth metrics

### Forecasting

Predict future financial performance:

- Revenue forecasting
- Expense projections
- Cash flow predictions
- Budget planning

## Best Practices

1. **Regular Reviews**: Review your analytics regularly
2. **Set Goals**: Use analytics to set and track goals
3. **Compare Periods**: Compare current performance to historical data
4. **Export Data**: Export reports for external analysis

## Conclusion

Mastering advanced analytics will help you make better financial decisions and grow your business.',
        'Deep dive into advanced analytics features and custom reporting',
        'Deep dive into advanced analytics features and custom reporting',
        'advanced',
        'guide',
        'intermediate',
        '45 min',
        45,
        author_id,
        'published',
        '["analytics", "reporting", "data", "advanced"]'::jsonb,
        '["analytics", "reports", "data analysis", "custom reports"]'::jsonb,
        true,
        8,
        0,
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT (slug) DO NOTHING;
END $$;

