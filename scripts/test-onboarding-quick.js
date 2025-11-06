#!/usr/bin/env node

/**
 * Quick Onboarding Test - Verifies structure and imports
 */

const fs = require('fs');
const path = require('path');

console.log('⚡ Quick Onboarding Test\n');

// Test component structure
const stepsDir = path.join(__dirname, '../components/onboarding/steps');
const newComponents = [
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

let allValid = true;

newComponents.forEach(file => {
  const filePath = path.join(stepsDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${file} - File missing`);
    allValid = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const checks = {
    'Copyright header': content.includes('Copyright'),
    'Export function': content.includes('export function'),
    'onComplete prop': content.includes('onComplete'),
    'TypeScript interface': content.includes('interface') && content.includes('Props'),
    'useState hook': content.includes('useState'),
    'Button component': content.includes('Button'),
  };
  
  const failed = Object.entries(checks).filter(([_, passed]) => !passed);
  if (failed.length > 0) {
    console.log(`❌ ${file}`);
    failed.forEach(([check]) => console.log(`   - Missing: ${check}`));
    allValid = false;
  } else {
    console.log(`✅ ${file}`);
  }
});

// Verify wizard integration
const wizardPath = path.join(__dirname, '../components/onboarding/onboarding-wizard.tsx');
const wizardContent = fs.readFileSync(wizardPath, 'utf8');

const stepIds = [
  'rental_details',
  'owner_statement',
  'portfolio_dashboard',
  'invite_stakeholders',
  'connect_stripe',
  'burn_rate_dashboard',
  'setup_workflows',
  'invite_advisors',
  'create_invoice',
  'expense_tracking',
  'business_health'
];

console.log('\n🔍 Verifying Step ID Mappings:');
stepIds.forEach(stepId => {
  if (wizardContent.includes(`'${stepId}':`)) {
    console.log(`  ✅ ${stepId}`);
  } else {
    console.log(`  ❌ ${stepId} - Missing mapping`);
    allValid = false;
  }
});

// Verify complete page
const completePath = path.join(__dirname, '../app/onboarding/complete/page.tsx');
const completeContent = fs.readFileSync(completePath, 'utf8');

console.log('\n🌐 Verifying Complete Page:');
if (completeContent.includes('fetch("/api/onboarding")')) {
  console.log('  ✅ Uses API');
} else {
  console.log('  ❌ Does not use API');
  allValid = false;
}

if (completeContent.includes('localStorage.getItem')) {
  console.log('  ⚠️  Still uses localStorage');
  allValid = false;
} else {
  console.log('  ✅ No localStorage usage');
}

console.log('\n' + '='.repeat(50));
if (allValid) {
  console.log('✅ All quick tests passed!');
  process.exit(0);
} else {
  console.log('❌ Some tests failed');
  process.exit(1);
}

