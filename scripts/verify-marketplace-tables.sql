-- Verification script for Marketplace and Integrations tables
-- Run this to check if all required tables exist

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'financbase' 
      AND table_name = 'financbase_marketplace_plugins'
    ) THEN '✓ financbase_marketplace_plugins exists'
    ELSE '✗ financbase_marketplace_plugins MISSING'
  END as marketplace_plugins_status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'financbase' 
      AND table_name = 'financbase_installed_plugins'
    ) THEN '✓ financbase_installed_plugins exists'
    ELSE '✗ financbase_installed_plugins MISSING'
  END as installed_plugins_status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'financbase' 
      AND table_name = 'financbase_integrations'
    ) THEN '✓ financbase_integrations exists'
    ELSE '✗ financbase_integrations MISSING'
  END as integrations_status;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'financbase' 
      AND table_name = 'financbase_integration_connections'
    ) THEN '✓ financbase_integration_connections exists'
    ELSE '✗ financbase_integration_connections MISSING'
  END as integration_connections_status;

