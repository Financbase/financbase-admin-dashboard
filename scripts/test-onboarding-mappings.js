/**
 * Test script to verify onboarding step ID mappings
 */

const fs = require('fs');
const path = require('path');

// Read the flow definitions
const flowsPath = path.join(__dirname, '../lib/data/onboarding-flows.ts');
const wizardPath = path.join(__dirname, '../components/onboarding/onboarding-wizard.tsx');

const flowsContent = fs.readFileSync(flowsPath, 'utf8');
const wizardContent = fs.readFileSync(wizardPath, 'utf8');

// Extract step IDs from flows
const stepIdMatches = flowsContent.matchAll(/stepId:\s*"([^"]+)"/g);
const flowStepIds = Array.from(stepIdMatches).map(m => m[1]);

// Extract step ID mappings from wizard
const mappingMatches = wizardContent.matchAll(/'([^']+)':\s*'([^']+)'/g);
const wizardMappings = {};
for (const match of mappingMatches) {
  wizardMappings[match[1]] = match[2];
}

// Extract component names from wizard
const componentsMatch = wizardContent.match(/const stepComponents[^=]*=\s*\{([^}]+)\}/s);
const componentsSection = componentsMatch?.[1] || '';
const componentNames = Array.from(componentsSection.matchAll(/(\w+Step),?/g)).map(m => m[1]);

console.log('🔍 Onboarding Step Mapping Verification\n');
console.log('='.repeat(60));

// Check each flow step ID has a mapping
console.log('\n📋 Flow Step IDs:');
flowStepIds.forEach(stepId => {
  const hasMapping = wizardMappings.hasOwnProperty(stepId);
  const status = hasMapping ? '✅' : '❌';
  const component = wizardMappings[stepId] || 'MISSING';
  console.log(`  ${status} ${stepId.padEnd(30)} → ${component}`);
});

// Check for orphaned mappings (mappings without corresponding flow steps)
console.log('\n📋 Wizard Mappings:');
const orphanedMappings = Object.keys(wizardMappings).filter(id => !flowStepIds.includes(id));
if (orphanedMappings.length > 0) {
  console.log('  ⚠️  Orphaned mappings (not in flows):');
  orphanedMappings.forEach(id => {
    console.log(`     ${id} → ${wizardMappings[id]}`);
  });
} else {
  console.log('  ✅ All mappings have corresponding flow steps');
}

// Check component exports
console.log('\n📦 Component Files:');
const stepsDir = path.join(__dirname, '../components/onboarding/steps');
const stepFiles = fs.readdirSync(stepsDir).filter(f => f.endsWith('.tsx'));
const exportedComponents = new Set();

stepFiles.forEach(file => {
  const filePath = path.join(stepsDir, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const exportMatch = content.match(/export\s+(?:function|const)\s+(\w+Step)/);
  if (exportMatch) {
    exportedComponents.add(exportMatch[1]);
  }
});

// Check all mapped components exist
console.log('\n🔗 Component Exports:');
Object.values(wizardMappings).forEach(componentName => {
  const exists = exportedComponents.has(componentName);
  const status = exists ? '✅' : '❌';
  console.log(`  ${status} ${componentName}`);
});

// Summary
console.log('\n' + '='.repeat(60));
const missingMappings = flowStepIds.filter(id => !wizardMappings.hasOwnProperty(id));
const missingComponents = Object.values(wizardMappings).filter(c => !exportedComponents.has(c));

if (missingMappings.length === 0 && missingComponents.length === 0 && orphanedMappings.length === 0) {
  console.log('✅ All step mappings are correct!');
  process.exit(0);
} else {
  console.log('❌ Issues found:');
  if (missingMappings.length > 0) {
    console.log(`   - ${missingMappings.length} flow step(s) missing mappings`);
  }
  if (missingComponents.length > 0) {
    console.log(`   - ${missingComponents.length} component(s) not exported`);
  }
  if (orphanedMappings.length > 0) {
    console.log(`   - ${orphanedMappings.length} orphaned mapping(s)`);
  }
  process.exit(1);
}

