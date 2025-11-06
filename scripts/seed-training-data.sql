-- Seed Training Data
-- Run with: psql $DATABASE_URL -f scripts/seed-training-data.sql

-- Insert training programs (only if they don't exist)
INSERT INTO training_programs (title, description, duration, difficulty, icon, href, topics, "order", is_active)
SELECT * FROM (VALUES 
  ('Getting Started', 'Quick introduction to Financbase for new users', '15 minutes', 'Beginner'::training_difficulty, 'Zap', '/docs/help/getting-started', '["Account setup", "Basic navigation", "First steps"]'::jsonb, 1, true),
  ('Dashboard Training', 'Learn to navigate and use your financial dashboard', '20 minutes', 'Beginner'::training_difficulty, 'Target', '/docs/help/dashboard', '["Dashboard overview", "Key metrics", "Charts and visualizations"]'::jsonb, 2, true),
  ('Invoice Management', 'Master invoice creation, management, and workflows', '20 minutes', 'Intermediate'::training_difficulty, 'BookOpen', '/docs', '["Creating invoices", "Managing invoices", "Invoice workflows"]'::jsonb, 3, true),
  ('Expense Tracking', 'Learn to track and manage expenses effectively', '20 minutes', 'Intermediate'::training_difficulty, 'Users', '/docs', '["Recording expenses", "Expense categories", "Expense reports"]'::jsonb, 4, true),
  ('Advanced Features', 'Explore workflows, automation, and integrations', '25 minutes', 'Advanced'::training_difficulty, 'GraduationCap', '/docs/help/workflows', '["Workflows and automation", "Integrations", "Custom dashboards"]'::jsonb, 5, true),
  ('AI Assistant', 'Leverage AI-powered financial insights and recommendations', '15 minutes', 'Intermediate'::training_difficulty, 'Video', '/financbase-gpt', '["Using Financbase GPT", "Financial insights", "Recommendations"]'::jsonb, 6, true)
) AS v(title, description, duration, difficulty, icon, href, topics, "order", is_active)
WHERE NOT EXISTS (SELECT 1 FROM training_programs WHERE training_programs.title = v.title);

-- Get program IDs for learning paths
WITH program_ids AS (
  SELECT id, title, ROW_NUMBER() OVER (ORDER BY "order") as rn
  FROM training_programs
  WHERE is_active = true
  ORDER BY "order"
),
business_owner_programs AS (
  SELECT jsonb_agg(id) as ids FROM program_ids WHERE rn <= 4
),
all_programs AS (
  SELECT jsonb_agg(id) as ids FROM program_ids
),
team_member_programs AS (
  SELECT jsonb_agg(id) as ids FROM program_ids WHERE rn IN (1, 2, 4)
)
INSERT INTO learning_paths (title, description, duration, icon, program_ids, is_active)
SELECT 
  'Business Owner',
  'Focus on dashboard, invoices, and reports',
  '1.5 hours',
  'Users',
  (SELECT ids FROM business_owner_programs),
  true
WHERE NOT EXISTS (SELECT 1 FROM learning_paths WHERE title = 'Business Owner')

UNION ALL

SELECT 
  'Accountant',
  'Complete training for all features',
  '3 hours',
  'GraduationCap',
  (SELECT ids FROM all_programs),
  true
WHERE NOT EXISTS (SELECT 1 FROM learning_paths WHERE title = 'Accountant')

UNION ALL

SELECT 
  'Team Member',
  'Basic features and collaboration',
  '1 hour',
  'Target',
  (SELECT ids FROM team_member_programs),
  true
WHERE NOT EXISTS (SELECT 1 FROM learning_paths WHERE title = 'Team Member');

