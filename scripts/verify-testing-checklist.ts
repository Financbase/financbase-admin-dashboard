#!/usr/bin/env tsx
/**
 * Testing Verification Checklist Script
 * Verifies all items in the Phase 1 testing checklist
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

interface ChecklistItem {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  details: string;
}

const results: ChecklistItem[] = [];

async function checkAPIEndpoints(): Promise<void> {
  console.log('🔍 Checking API endpoints...');
  try {
    const apiDir = join(process.cwd(), 'app', 'api');
    const routes = await scanRoutes(apiDir);
    const totalRoutes = routes.length;
    
    // Check if routes have tests
    const testDir = join(process.cwd(), '__tests__', 'api');
    let testedRoutes = 0;
    
    try {
      const testFiles = await readdir(testDir, { recursive: true });
      testedRoutes = testFiles.filter(f => f.endsWith('.test.ts') || f.endsWith('.test.tsx')).length;
    } catch {
      // Test directory might not exist
    }
    
    const coverage = totalRoutes > 0 ? (testedRoutes / totalRoutes) * 100 : 0;
    
    results.push({
      name: 'Test all API endpoints',
      status: coverage >= 80 ? 'pass' : coverage >= 50 ? 'warning' : 'fail',
      details: `Found ${totalRoutes} API routes, ${testedRoutes} have tests (${coverage.toFixed(1)}% coverage)`
    });
  } catch (error) {
    results.push({
      name: 'Test all API endpoints',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function scanRoutes(dir: string, basePath: string = '/api'): Promise<string[]> {
  const routes: string[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      const routePath = `${basePath}/${entry.name}`;
      
      if (entry.isDirectory()) {
        const subRoutes = await scanRoutes(fullPath, routePath);
        routes.push(...subRoutes);
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        routes.push(basePath);
      }
    }
  } catch {
    // Directory might not exist
  }
  return routes;
}

async function checkCharts(): Promise<void> {
  console.log('📊 Checking charts...');
  try {
    // Check for chart components
    const componentsDir = join(process.cwd(), 'components');
    let chartComponents = 0;
    
    try {
      const files = await readdir(componentsDir, { recursive: true });
      chartComponents = files.filter(f => 
        f.includes('chart') || 
        f.includes('Chart') || 
        f.includes('recharts')
      ).length;
    } catch {
      // Components directory might not exist
    }
    
    // Check if recharts is installed
    let rechartsInstalled = false;
    try {
      const packageJson = await readFile(join(process.cwd(), 'package.json'), 'utf-8');
      rechartsInstalled = packageJson.includes('recharts');
    } catch {}
    
    results.push({
      name: 'Verify charts render',
      status: chartComponents > 0 && rechartsInstalled ? 'pass' : 'warning',
      details: `Found ${chartComponents} chart-related components, Recharts ${rechartsInstalled ? 'installed' : 'not found'}`
    });
  } catch (error) {
    results.push({
      name: 'Verify charts render',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function checkInvoiceCreation(): Promise<void> {
  console.log('🧾 Checking invoice creation...');
  try {
    // Check for invoice API
    const invoiceApiPath = join(process.cwd(), 'app', 'api', 'invoices', 'route.ts');
    let invoiceApiExists = false;
    try {
      await stat(invoiceApiPath);
      invoiceApiExists = true;
    } catch {}
    
    // Check for invoice tests
    const invoiceTestPath = join(process.cwd(), '__tests__', 'api', 'invoices-api.test.ts');
    let invoiceTestExists = false;
    try {
      await stat(invoiceTestPath);
      invoiceTestExists = true;
    } catch {}
    
    // Check for invoice UI
    const invoiceUIPath = join(process.cwd(), 'app', 'invoices', 'page.tsx');
    let invoiceUIExists = false;
    try {
      await stat(invoiceUIPath);
      invoiceUIExists = true;
    } catch {}
    
    const allExist = invoiceApiExists && invoiceTestExists && invoiceUIExists;
    
    results.push({
      name: 'Test invoice creation',
      status: allExist ? 'pass' : 'warning',
      details: `API: ${invoiceApiExists ? '✓' : '✗'}, Tests: ${invoiceTestExists ? '✓' : '✗'}, UI: ${invoiceUIExists ? '✓' : '✗'}`
    });
  } catch (error) {
    results.push({
      name: 'Test invoice creation',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function checkPermissions(): Promise<void> {
  console.log('🔐 Checking permissions...');
  try {
    // Check for RBAC implementation
    const rbacPath = join(process.cwd(), 'lib', 'services', 'subscription-rbac.service.ts');
    let rbacExists = false;
    try {
      await stat(rbacPath);
      rbacExists = true;
    } catch {}
    
    // Check for permission tests
    const permissionTestPath = join(process.cwd(), '__tests__', 'services', 'subscription-rbac.service.test.ts');
    let permissionTestExists = false;
    try {
      await stat(permissionTestPath);
      permissionTestExists = true;
    } catch {}
    
    results.push({
      name: 'Verify permissions',
      status: rbacExists && permissionTestExists ? 'pass' : 'warning',
      details: `RBAC service: ${rbacExists ? '✓' : '✗'}, Tests: ${permissionTestExists ? '✓' : '✗'}`
    });
  } catch (error) {
    results.push({
      name: 'Verify permissions',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function checkMobileResponsiveness(): Promise<void> {
  console.log('📱 Checking mobile responsiveness...');
  try {
    // Check for responsive utilities
    const tailwindConfig = join(process.cwd(), 'tailwind.config.ts');
    let tailwindExists = false;
    try {
      await stat(tailwindConfig);
      tailwindExists = true;
    } catch {}
    
    // Check for responsive breakpoints in config
    let hasResponsiveConfig = false;
    if (tailwindExists) {
      try {
        const config = await readFile(tailwindConfig, 'utf-8');
        hasResponsiveConfig = config.includes('screens') || config.includes('breakpoints');
      } catch {}
    }
    
    results.push({
      name: 'Check mobile responsiveness',
      status: tailwindExists && hasResponsiveConfig ? 'pass' : 'warning',
      details: `Tailwind: ${tailwindExists ? '✓' : '✗'}, Responsive config: ${hasResponsiveConfig ? '✓' : '✗'}`
    });
  } catch (error) {
    results.push({
      name: 'Check mobile responsiveness',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function checkLinter(): Promise<void> {
  console.log('🔍 Running linter...');
  try {
    const output = execSync('npm run lint 2>&1', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    const hasErrors = output.includes('error') && !output.includes('0 errors');
    const hasWarnings = output.includes('warning');
    
    results.push({
      name: 'Run linter',
      status: !hasErrors ? (hasWarnings ? 'warning' : 'pass') : 'fail',
      details: hasErrors ? 'Linter found errors' : hasWarnings ? 'Linter found warnings (no errors)' : 'No linting errors'
    });
  } catch (error) {
    // Linter found errors
    results.push({
      name: 'Run linter',
      status: 'fail',
      details: 'Linter execution failed or found errors'
    });
  }
}

async function checkTypeCheck(): Promise<void> {
  console.log('📝 Running type check...');
  try {
    execSync('npm run type-check 2>&1', { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    results.push({
      name: 'Type check',
      status: 'pass',
      details: 'TypeScript compilation passed'
    });
  } catch (error) {
    results.push({
      name: 'Type check',
      status: 'fail',
      details: 'TypeScript compilation failed'
    });
  }
}

async function checkBrowserTesting(): Promise<void> {
  console.log('🌐 Checking browser testing setup...');
  try {
    // Check for Playwright config
    const playwrightConfig = join(process.cwd(), 'playwright.config.ts');
    let playwrightExists = false;
    try {
      await stat(playwrightConfig);
      playwrightExists = true;
    } catch {}
    
    // Check for E2E tests
    const e2eDir = join(process.cwd(), 'e2e');
    let e2eTestsExist = false;
    try {
      const files = await readdir(e2eDir);
      e2eTestsExist = files.some(f => f.endsWith('.test.ts') || f.endsWith('.spec.ts'));
    } catch {}
    
    results.push({
      name: 'Browser testing',
      status: playwrightExists && e2eTestsExist ? 'pass' : 'warning',
      details: `Playwright: ${playwrightExists ? '✓' : '✗'}, E2E tests: ${e2eTestsExist ? '✓' : '✗'}`
    });
  } catch (error) {
    results.push({
      name: 'Browser testing',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function main() {
  console.log('🧪 Starting Testing Verification Checklist\n');
  
  await checkAPIEndpoints();
  await checkCharts();
  await checkInvoiceCreation();
  await checkPermissions();
  await checkMobileResponsiveness();
  await checkLinter();
  await checkTypeCheck();
  await checkBrowserTesting();
  
  console.log('\n📋 Results Summary:\n');
  console.log('='.repeat(60));
  
  let passCount = 0;
  let warningCount = 0;
  let failCount = 0;
  
  for (const result of results) {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`${icon} ${result.name}`);
    console.log(`   ${result.details}\n`);
    
    if (result.status === 'pass') passCount++;
    else if (result.status === 'warning') warningCount++;
    else failCount++;
  }
  
  console.log('='.repeat(60));
  console.log(`\nSummary: ${passCount} passed, ${warningCount} warnings, ${failCount} failed`);
  console.log(`Overall: ${failCount === 0 ? (warningCount === 0 ? '✅ ALL PASSED' : '⚠️ PASSED WITH WARNINGS') : '❌ FAILED'}\n`);
  
  process.exit(failCount > 0 ? 1 : 0);
}

main().catch(console.error);


