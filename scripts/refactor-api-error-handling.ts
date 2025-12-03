#!/usr/bin/env ts-node

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * API Error Handling Refactoring Helper Script
 * 
 * This script helps identify API routes that need error handling refactoring
 * and provides suggestions for using ApiErrorHandler.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface RouteAnalysis {
  file: string;
  usesApiErrorHandler: boolean;
  hasTryCatch: boolean;
  hasManualStatusCodes: boolean;
  hasZodError: boolean;
  manualStatusCodes: number[];
  errorPatterns: string[];
}

const API_ROUTES_DIR = join(process.cwd(), 'app', 'api');

function findRouteFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList);
    } else if (file === 'route.ts' || file === 'route.js') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function analyzeRoute(filePath: string): RouteAnalysis {
  const content = readFileSync(filePath, 'utf-8');
  const relativePath = filePath.replace(process.cwd(), '');

  const analysis: RouteAnalysis = {
    file: relativePath,
    usesApiErrorHandler: /ApiErrorHandler/.test(content),
    hasTryCatch: /try\s*\{/.test(content) && /catch\s*\(/.test(content),
    hasManualStatusCodes: /status:\s*(40[0-9]|50[0-9])/.test(content),
    hasZodError: /ZodError/.test(content) || /zod/.test(content.toLowerCase()),
    manualStatusCodes: [],
    errorPatterns: [],
  };

  // Extract status codes
  const statusMatches = content.matchAll(/status:\s*(\d{3})/g);
  for (const match of statusMatches) {
    const status = parseInt(match[1], 10);
    if (status >= 400 && status < 600) {
      analysis.manualStatusCodes.push(status);
    }
  }

  // Identify error patterns
  if (/NextResponse\.json.*error.*401/.test(content)) {
    analysis.errorPatterns.push('manual-401');
  }
  if (/NextResponse\.json.*error.*403/.test(content)) {
    analysis.errorPatterns.push('manual-403');
  }
  if (/NextResponse\.json.*error.*404/.test(content)) {
    analysis.errorPatterns.push('manual-404');
  }
  if (/NextResponse\.json.*error.*400/.test(content)) {
    analysis.errorPatterns.push('manual-400');
  }
  if (/NextResponse\.json.*error.*500/.test(content)) {
    analysis.errorPatterns.push('manual-500');
  }
  if (/console\.(error|log|warn)/.test(content)) {
    analysis.errorPatterns.push('console-statement');
  }

  return analysis;
}

function categorizeRoute(analysis: RouteAnalysis): string {
  if (analysis.usesApiErrorHandler) {
    return 'USING_API_ERROR_HANDLER';
  }

  if (analysis.hasZodError && !analysis.usesApiErrorHandler) {
    return 'CATEGORY_C_ZOD';
  }

  if (analysis.hasManualStatusCodes) {
    return 'CATEGORY_B_STATUS_CODES';
  }

  if (analysis.hasTryCatch) {
    return 'CATEGORY_A_SIMPLE_TRY_CATCH';
  }

  return 'NO_ERROR_HANDLING';
}

function main() {
  console.log('🔍 Analyzing API routes for error handling patterns...\n');

  const routeFiles = findRouteFiles(API_ROUTES_DIR);
  console.log(`Found ${routeFiles.length} API route files\n`);

  const analyses = routeFiles.map(analyzeRoute);
  const categorized: Record<string, RouteAnalysis[]> = {};

  analyses.forEach((analysis) => {
    const category = categorizeRoute(analysis);
    if (!categorized[category]) {
      categorized[category] = [];
    }
    categorized[category].push(analysis);
  });

  // Print summary
  console.log('📊 Summary:\n');
  Object.entries(categorized).forEach(([category, routes]) => {
    console.log(`${category}: ${routes.length} routes`);
  });

  console.log('\n📋 Detailed Breakdown:\n');

  // Routes using ApiErrorHandler
  if (categorized.USING_API_ERROR_HANDLER) {
    console.log(`✅ Using ApiErrorHandler (${categorized.USING_API_ERROR_HANDLER.length}):`);
    categorized.USING_API_ERROR_HANDLER.slice(0, 5).forEach((r) => {
      console.log(`   - ${r.file}`);
    });
    if (categorized.USING_API_ERROR_HANDLER.length > 5) {
      console.log(`   ... and ${categorized.USING_API_ERROR_HANDLER.length - 5} more`);
    }
    console.log();
  }

  // Category A: Simple try-catch
  if (categorized.CATEGORY_A_SIMPLE_TRY_CATCH) {
    console.log(`🔧 Category A - Simple Try-Catch (${categorized.CATEGORY_A_SIMPLE_TRY_CATCH.length}):`);
    categorized.CATEGORY_A_SIMPLE_TRY_CATCH.slice(0, 10).forEach((r) => {
      console.log(`   - ${r.file}`);
    });
    if (categorized.CATEGORY_A_SIMPLE_TRY_CATCH.length > 10) {
      console.log(`   ... and ${categorized.CATEGORY_A_SIMPLE_TRY_CATCH.length - 10} more`);
    }
    console.log();
  }

  // Category B: Manual status codes
  if (categorized.CATEGORY_B_STATUS_CODES) {
    console.log(`🔧 Category B - Manual Status Codes (${categorized.CATEGORY_B_STATUS_CODES.length}):`);
    categorized.CATEGORY_B_STATUS_CODES.slice(0, 10).forEach((r) => {
      const statuses = [...new Set(r.manualStatusCodes)].join(', ');
      console.log(`   - ${r.file} (status: ${statuses})`);
    });
    if (categorized.CATEGORY_B_STATUS_CODES.length > 10) {
      console.log(`   ... and ${categorized.CATEGORY_B_STATUS_CODES.length - 10} more`);
    }
    console.log();
  }

  // Category C: Zod errors
  if (categorized.CATEGORY_C_ZOD) {
    console.log(`🔧 Category C - Zod Validation (${categorized.CATEGORY_C_ZOD.length}):`);
    categorized.CATEGORY_C_ZOD.slice(0, 10).forEach((r) => {
      console.log(`   - ${r.file}`);
    });
    if (categorized.CATEGORY_C_ZOD.length > 10) {
      console.log(`   ... and ${categorized.CATEGORY_C_ZOD.length - 10} more`);
    }
    console.log();
  }

  // No error handling
  if (categorized.NO_ERROR_HANDLING) {
    console.log(`⚠️  No Error Handling (${categorized.NO_ERROR_HANDLING.length}):`);
    categorized.NO_ERROR_HANDLING.slice(0, 10).forEach((r) => {
      console.log(`   - ${r.file}`);
    });
    if (categorized.NO_ERROR_HANDLING.length > 10) {
      console.log(`   ... and ${categorized.NO_ERROR_HANDLING.length - 10} more`);
    }
    console.log();
  }

  // Save detailed report
  const reportPath = join(process.cwd(), 'api-error-handling-audit.json');
  const fs = require('fs');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(categorized, null, 2)
  );
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
}

