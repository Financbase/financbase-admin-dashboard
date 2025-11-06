#!/usr/bin/env node

/**
 * Test Onboarding Implementation
 * Verifies all components, mappings, and API routes
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Onboarding Implementation\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;
const errors = [];

// Test 1: Verify all step component files exist
console.log('\n📁 Test 1: Component Files');
const stepsDir = path.join(__dirname, '../components/onboarding/steps');
const requiredComponents = [
  'real-estate-rental-details-step.tsx',
  'real-estate-owner-statement-step.tsx',
  'real-estate-portfolio-dashboard-step.tsx',
  'invite-stakeholders-step.tsx',
  'connect-stripe-step.tsx',
  'burn-rate-dashboard-step.tsx',
  'setup-workflows-step.tsx',
  'invite-advisors-step.tsx',
  'create-invoice-step.tsx',
  'expense-tracking-step.tsx',
  'business-health-step.tsx'
];

requiredComponents.forEach(file => {
  const filePath = path.join(stepsDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
    passed++;
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    failed++;
    errors.push(`Missing file: ${file}`);
  }
});

// Test 2: Verify component exports
console.log('\n📦 Test 2: Component Exports');
requiredComponents.forEach(file => {
  const filePath = path.join(stepsDir, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const componentName = file.replace('.tsx', '').split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
    const exportName = componentName.replace('Step', '') + 'Step';
    
    if (content.includes(`export function ${exportName}`) || 
        content.includes(`export const ${exportName}`)) {
      console.log(`  ✅ ${exportName}`);
      passed++;
    } else {
      console.log(`  ❌ ${exportName} - Export not found`);
      failed++;
      errors.push(`Missing export: ${exportName}`);
    }
  }
});

// Test 3: Verify wizard imports
console.log('\n🔗 Test 3: Wizard Imports');
const wizardPath = path.join(__dirname, '../components/onboarding/onboarding-wizard.tsx');
const wizardContent = fs.readFileSync(wizardPath, 'utf8');

const requiredImports = [
  'RealEstateRentalDetailsStep',
  'RealEstateOwnerStatementStep',
  'RealEstatePortfolioDashboardStep',
  'InviteStakeholdersStep',
  'ConnectStripeStep',
  'BurnRateDashboardStep',
  'SetupWorkflowsStep',
  'InviteAdvisorsStep',
  'CreateInvoiceStep',
  'ExpenseTrackingStep',
  'BusinessHealthStep'
];

requiredImports.forEach(importName => {
  if (wizardContent.includes(importName)) {
    console.log(`  ✅ ${importName}`);
    passed++;
  } else {
    console.log(`  ❌ ${importName} - Import missing`);
    failed++;
    errors.push(`Missing import: ${importName}`);
  }
});

// Test 4: Verify step ID mappings
console.log('\n🗺️  Test 4: Step ID Mappings');
const flowsPath = path.join(__dirname, '../lib/data/onboarding-flows.ts');
const flowsContent = fs.readFileSync(flowsPath, 'utf8');

const requiredMappings = {
  'rental_details': 'RealEstateRentalDetailsStep',
  'owner_statement': 'RealEstateOwnerStatementStep',
  'portfolio_dashboard': 'RealEstatePortfolioDashboardStep',
  'invite_stakeholders': 'InviteStakeholdersStep',
  'connect_stripe': 'ConnectStripeStep',
  'burn_rate_dashboard': 'BurnRateDashboardStep',
  'setup_workflows': 'SetupWorkflowsStep',
  'invite_advisors': 'InviteAdvisorsStep',
  'create_invoice': 'CreateInvoiceStep',
  'expense_tracking': 'ExpenseTrackingStep',
  'business_health': 'BusinessHealthStep'
};

Object.entries(requiredMappings).forEach(([stepId, componentName]) => {
  // Check flow has the step ID
  const hasStepId = flowsContent.includes(`stepId: "${stepId}"`);
  // Check wizard has the mapping
  const hasMapping = wizardContent.includes(`'${stepId}': '${componentName}'`);
  
  if (hasStepId && hasMapping) {
    console.log(`  ✅ ${stepId} → ${componentName}`);
    passed++;
  } else {
    console.log(`  ❌ ${stepId} → ${componentName}`);
    if (!hasStepId) {
      console.log(`     - Step ID missing in flows`);
      errors.push(`Step ID missing in flows: ${stepId}`);
    }
    if (!hasMapping) {
      console.log(`     - Mapping missing in wizard`);
      errors.push(`Mapping missing in wizard: ${stepId}`);
    }
    failed++;
  }
});

// Test 5: Verify complete page uses API
console.log('\n🌐 Test 5: Complete Page API Integration');
const completePagePath = path.join(__dirname, '../app/onboarding/complete/page.tsx');
const completePageContent = fs.readFileSync(completePagePath, 'utf8');

const usesAPI = completePageContent.includes('fetch("/api/onboarding")');
const usesLocalStorage = completePageContent.includes('localStorage.getItem("onboarding-complete")');

if (usesAPI && !usesLocalStorage) {
  console.log(`  ✅ Uses API instead of localStorage`);
  passed++;
} else {
  console.log(`  ❌ API integration issue`);
  if (!usesAPI) {
    console.log(`     - API fetch not found`);
    errors.push('Complete page does not use API');
  }
  if (usesLocalStorage) {
    console.log(`     - Still uses localStorage`);
    errors.push('Complete page still uses localStorage');
  }
  failed++;
}

// Test 6: Verify API routes exist
console.log('\n🛣️  Test 6: API Routes');
const apiRoutes = [
  'app/api/onboarding/route.ts',
  'app/api/onboarding/steps/[stepId]/route.ts'
];

apiRoutes.forEach(route => {
  const routePath = path.join(__dirname, '..', route);
  if (fs.existsSync(routePath)) {
    console.log(`  ✅ ${route}`);
    passed++;
  } else {
    console.log(`  ❌ ${route} - MISSING`);
    failed++;
    errors.push(`Missing API route: ${route}`);
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log(`\n📊 Test Results:`);
console.log(`  ✅ Passed: ${passed}`);
console.log(`  ❌ Failed: ${failed}`);

if (failed > 0) {
  console.log(`\n❌ Errors:`);
  errors.forEach(error => console.log(`   - ${error}`));
  console.log('\n❌ Some tests failed. Please review the errors above.');
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed! Onboarding implementation is complete.');
  process.exit(0);
}

