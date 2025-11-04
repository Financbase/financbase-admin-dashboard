#!/usr/bin/env node

/**
 * Verification Script for Responsive UI Implementation
 * 
 * Checks that all components and utilities are properly set up
 */

const fs = require('fs');
const path = require('path');

const checks = [];
let passed = 0;
let failed = 0;

function check(name, condition, message) {
  checks.push({ name, condition, message });
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}: ${message}`);
    failed++;
  }
}

console.log('🔍 Verifying Responsive UI Implementation...\n');

// Check style files exist
check(
  'Style files exist',
  fs.existsSync('lib/styles/colors.ts') &&
  fs.existsSync('lib/styles/breakpoints.ts') &&
  fs.existsSync('lib/styles/layout.tsx') &&
  fs.existsSync('lib/styles/sticky.tsx') &&
  fs.existsSync('lib/styles/index.ts'),
  'Missing style utility files'
);

// Check component files exist
check(
  'Native component files exist',
  fs.existsSync('components/ui/native-dialog.tsx') &&
  fs.existsSync('components/ui/details.tsx') &&
  fs.existsSync('components/ui/responsive-image.tsx') &&
  fs.existsSync('components/ui/editable.tsx'),
  'Missing native component files'
);

// Check test page exists
check(
  'Test page exists',
  fs.existsSync('app/(dashboard)/test/responsive-ui/page.tsx'),
  'Test page not found'
);

// Check documentation exists
check(
  'Documentation exists',
  fs.existsSync('docs/design/RESPONSIVE_UI_QUICK_START.md') &&
  fs.existsSync('docs/design/responsive-design.md') &&
  fs.existsSync('docs/design/color-system.md') &&
  fs.existsSync('docs/design/layout-patterns.md'),
  'Missing documentation files'
);

// Check globals.css has HSL colors
const globalsCss = fs.readFileSync('app/globals.css', 'utf8');
check(
  'HSL colors in globals.css',
  globalsCss.includes('--color-primary-hsl') &&
  globalsCss.includes('--color-secondary-hsl'),
  'HSL color variables not found in globals.css'
);

// Check tailwind config has HSL colors
const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');
check(
  'HSL colors in Tailwind config',
  tailwindConfig.includes('primary-hsl') || tailwindConfig.includes('primary-hsl'),
  'HSL colors not found in Tailwind config'
);

// Check npm scripts
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
check(
  'Image optimization scripts',
  packageJson.scripts['optimize:images'] && packageJson.scripts['optimize:images:public'],
  'Image optimization scripts not found in package.json'
);

// Check for sharp or imagemagick
const hasSharp = fs.existsSync('node_modules/sharp');
const hasImagemagick = require('child_process').execSync('which convert', { encoding: 'utf8', stdio: 'pipe' }).trim().length > 0;
check(
  'Image optimization tool available',
  hasSharp || hasImagemagick,
  'Neither sharp nor ImageMagick found. Install with: npm install sharp --save-dev'
);

console.log('\n📊 Summary:');
console.log(`   Passed: ${passed}/${checks.length}`);
console.log(`   Failed: ${failed}/${checks.length}`);

if (failed === 0) {
  console.log('\n✅ All checks passed! Responsive UI implementation is ready.');
  console.log('\n📝 Next steps:');
  console.log('   1. Run: npm run optimize:images:public (if you have images to optimize)');
  console.log('   2. Visit: http://localhost:3000/test/responsive-ui');
  console.log('   3. Start using the new components in your application');
  process.exit(0);
} else {
  console.log('\n⚠️  Some checks failed. Please review the errors above.');
  process.exit(1);
}

