#!/usr/bin/env tsx

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

/**
 * Error Handling Audit Script
 * 
 * Scans all API routes and identifies which ones need to be updated
 * to use the centralized ApiErrorHandler.
 */

import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';

interface RouteAnalysis {
  path: string;
  usesApiErrorHandler: boolean;
  hasTryCatch: boolean;
  hasManualErrorHandling: boolean;
  errorPatterns: string[];
}

const API_ROUTES_DIR = join(process.cwd(), 'app', 'api');

async function getAllRouteFiles(dir: string, basePath: string = ''): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = join(basePath, entry.name);

    if (entry.isDirectory()) {
      const subFiles = await getAllRouteFiles(fullPath, relativePath);
      files.push(...subFiles);
    } else if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
      files.push(fullPath);
    }
  }

  return files;
}

async function analyzeRoute(filePath: string): Promise<RouteAnalysis> {
  const content = await readFile(filePath, 'utf-8');
  const relativePath = filePath.replace(process.cwd(), '').replace(/\\/g, '/');

  const usesApiErrorHandler = 
    content.includes("ApiErrorHandler") ||
    content.includes("from '@/lib/api-error-handler'") ||
    content.includes('from "@/lib/api-error-handler"');

  const hasTryCatch = content.includes('try {') && content.includes('catch');

  const errorPatterns: string[] = [];
  
  // Check for manual error handling patterns
  if (content.includes('NextResponse.json') && content.includes('error')) {
    errorPatterns.push('NextResponse.json with error');
  }
  if (content.includes('status: 400') || content.includes('status: 500') || 
      content.includes('status: 401') || content.includes('status: 403')) {
    errorPatterns.push('Manual status codes');
  }
  if (content.includes('ZodError') && !usesApiErrorHandler) {
    errorPatterns.push('Manual ZodError handling');
  }

  const hasManualErrorHandling = errorPatterns.length > 0 && !usesApiErrorHandler;

  return {
    path: relativePath,
    usesApiErrorHandler,
    hasTryCatch,
    hasManualErrorHandling,
    errorPatterns,
  };
}

async function main() {
  console.log('🔍 Scanning API routes for error handling patterns...\n');

  try {
    const routeFiles = await getAllRouteFiles(API_ROUTES_DIR);
    console.log(`Found ${routeFiles.length} API route files\n`);

    const analyses = await Promise.all(
      routeFiles.map(file => analyzeRoute(file))
    );

    const usingApiErrorHandler = analyses.filter(a => a.usesApiErrorHandler);
    const needsUpdate = analyses.filter(a => !a.usesApiErrorHandler);
    const withTryCatch = analyses.filter(a => a.hasTryCatch);
    const withManualHandling = analyses.filter(a => a.hasManualErrorHandling);

    console.log('📊 Summary:');
    console.log('='.repeat(60));
    console.log(`Total routes: ${analyses.length}`);
    console.log(`✅ Using ApiErrorHandler: ${usingApiErrorHandler.length} (${Math.round(usingApiErrorHandler.length / analyses.length * 100)}%)`);
    console.log(`❌ Needs update: ${needsUpdate.length} (${Math.round(needsUpdate.length / analyses.length * 100)}%)`);
    console.log(`🔧 Has try-catch: ${withTryCatch.length}`);
    console.log(`⚠️  Manual error handling: ${withManualHandling.length}`);
    console.log('');

    if (needsUpdate.length > 0) {
      console.log('❌ Routes that need ApiErrorHandler:');
      console.log('='.repeat(60));
      needsUpdate.slice(0, 20).forEach(analysis => {
        console.log(`  ${analysis.path}`);
        if (analysis.errorPatterns.length > 0) {
          console.log(`    Patterns: ${analysis.errorPatterns.join(', ')}`);
        }
      });
      if (needsUpdate.length > 20) {
        console.log(`  ... and ${needsUpdate.length - 20} more`);
      }
      console.log('');
    }

    // Generate report file
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        total: analyses.length,
        usingApiErrorHandler: usingApiErrorHandler.length,
        needsUpdate: needsUpdate.length,
        withTryCatch: withTryCatch.length,
        withManualHandling: withManualHandling.length,
      },
      routes: analyses,
      routesNeedingUpdate: needsUpdate.map(a => ({
        path: a.path,
        errorPatterns: a.errorPatterns,
        hasTryCatch: a.hasTryCatch,
      })),
    };

    const reportPath = join(process.cwd(), 'error-handling-audit-report.json');
    await import('fs').then(fs => 
      fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2))
    );

    console.log(`📄 Full report saved to: error-handling-audit-report.json`);
    console.log('');

    if (needsUpdate.length > 0) {
      console.log('💡 Next steps:');
      console.log('  1. Review the routes that need updating');
      console.log('  2. Update routes to use ApiErrorHandler.handle()');
      console.log('  3. Replace manual error responses with ApiErrorHandler methods');
      console.log('  4. Run this script again to verify progress');
      process.exit(1);
    } else {
      console.log('✅ All routes are using ApiErrorHandler!');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error scanning routes:', error);
    process.exit(1);
  }
}

main();

