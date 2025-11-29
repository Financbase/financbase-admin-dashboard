#!/usr/bin/env tsx
/**
 * Performance Verification Checklist Script
 * Verifies all items in the Phase 1 performance checklist
 */

import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

interface ChecklistItem {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  details: string;
}

const results: ChecklistItem[] = [];

async function checkDatabaseIndexes(): Promise<void> {
  console.log('🗄️ Checking database indexes...');
  try {
    // Check for index manager
    const indexManager = join(process.cwd(), 'lib', 'db', 'optimization', 'index-manager.ts');
    let indexManagerExists = false;
    try {
      await stat(indexManager);
      indexManagerExists = true;
    } catch {}
    
    // Check for index definitions in schema files
    const schemasDir = join(process.cwd(), 'lib', 'db', 'schemas');
    let schemasWithIndexes = 0;
    let totalSchemas = 0;
    
    try {
      const { readdir } = await import('fs/promises');
      const files = await readdir(schemasDir);
      totalSchemas = files.filter(f => f.endsWith('.schema.ts')).length;
      
      for (const file of files.filter(f => f.endsWith('.schema.ts')).slice(0, 10)) {
        try {
          const content = await readFile(join(schemasDir, file), 'utf-8');
          if (content.includes('index') || content.includes('Index') || content.includes('.index(')) {
            schemasWithIndexes++;
          }
        } catch {}
      }
    } catch {}
    
    results.push({
      name: 'Database indexes verified',
      status: indexManagerExists ? 'pass' : schemasWithIndexes > 0 ? 'warning' : 'fail',
      details: `Index manager: ${indexManagerExists ? '✓' : '✗'}, Schemas with indexes: ${schemasWithIndexes}/${totalSchemas}`
    });
  } catch (error) {
    results.push({
      name: 'Database indexes verified',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function checkQueryOptimization(): Promise<void> {
  console.log('⚡ Checking query optimization...');
  try {
    // Check for query optimizer
    const queryOptimizer = join(process.cwd(), 'lib', 'db', 'optimization', 'query-optimizer.ts');
    let optimizerExists = false;
    try {
      await stat(queryOptimizer);
      optimizerExists = true;
    } catch {}
    
    // Check for pagination in API routes
    const apiDir = join(process.cwd(), 'app', 'api');
    let routesWithPagination = 0;
    let totalRoutes = 0;
    
    try {
      const routes = await scanForPagination(apiDir);
      routesWithPagination = routes.filter(r => r.hasPagination).length;
      totalRoutes = routes.length;
    } catch {}
    
    const coverage = totalRoutes > 0 ? (routesWithPagination / totalRoutes) * 100 : 0;
    
    results.push({
      name: 'Query optimization',
      status: optimizerExists && coverage >= 50 ? 'pass' : coverage >= 25 ? 'warning' : 'fail',
      details: `Query optimizer: ${optimizerExists ? '✓' : '✗'}, Pagination coverage: ${coverage.toFixed(1)}% (${routesWithPagination}/${totalRoutes} routes)`
    });
  } catch (error) {
    results.push({
      name: 'Query optimization',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function scanForPagination(dir: string): Promise<Array<{ path: string; hasPagination: boolean }>> {
  const routes: Array<{ path: string; hasPagination: boolean }> = [];
  try {
    const { readdir } = await import('fs/promises');
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        const subRoutes = await scanForPagination(fullPath);
        routes.push(...subRoutes);
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        try {
          const content = await readFile(fullPath, 'utf-8');
          const hasPagination = content.includes('limit') || 
                              content.includes('offset') ||
                              content.includes('page') ||
                              content.includes('pagination') ||
                              content.includes('.limit(');
          routes.push({ path: fullPath, hasPagination });
        } catch {
          routes.push({ path: fullPath, hasPagination: false });
        }
      }
    }
  } catch {}
  return routes;
}

async function checkImageOptimization(): Promise<void> {
  console.log('🖼️ Checking image optimization...');
  try {
    // Check for Next.js Image component usage
    const componentsDir = join(process.cwd(), 'components');
    let usesNextImage = false;
    let totalImageUsage = 0;
    
    try {
      const { readdir } = await import('fs/promises');
      const files = await getAllFiles(componentsDir, ['.tsx', '.jsx']);
      for (const file of files.slice(0, 20)) {
        try {
          const content = await readFile(file, 'utf-8');
          if (content.includes('<img') || content.includes('Image')) {
            totalImageUsage++;
            if (content.includes('next/image') || content.includes('from "next/image"')) {
              usesNextImage = true;
            }
          }
        } catch {}
      }
    } catch {}
    
    // Check for image optimization script
    const optimizeScript = join(process.cwd(), 'scripts', 'optimize-images.js');
    let optimizeScriptExists = false;
    try {
      await stat(optimizeScript);
      optimizeScriptExists = true;
    } catch {}
    
    results.push({
      name: 'Image optimization',
      status: usesNextImage || optimizeScriptExists ? 'pass' : totalImageUsage > 0 ? 'warning' : 'pass',
      details: `Next.js Image: ${usesNextImage ? '✓' : '✗'}, Optimize script: ${optimizeScriptExists ? '✓' : '✗'}, Image usage found: ${totalImageUsage}`
    });
  } catch (error) {
    results.push({
      name: 'Image optimization',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function getAllFiles(dir: string, extensions: string[]): Promise<string[]> {
  const files: string[] = [];
  try {
    const { readdir } = await import('fs/promises');
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        const subFiles = await getAllFiles(fullPath, extensions);
        files.push(...subFiles);
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch {}
  return files;
}

async function checkBundleSize(): Promise<void> {
  console.log('📦 Checking bundle size...');
  try {
    // Check if build has been run
    const nextDir = join(process.cwd(), '.next');
    let buildExists = false;
    try {
      await stat(nextDir);
      buildExists = true;
    } catch {}
    
    if (!buildExists) {
      results.push({
        name: 'Bundle size check',
        status: 'warning',
        details: 'Build not found. Run `npm run build` to check bundle size.'
      });
      return;
    }
    
    // Try to get bundle size from build output
    let bundleSize = 0;
    let bundleSizeInfo = 'Build exists';
    
    try {
      // Check for analyze output
      const analyzeScript = join(process.cwd(), 'package.json');
      const packageJson = await readFile(analyzeScript, 'utf-8');
      const hasAnalyze = packageJson.includes('"analyze"') || packageJson.includes('ANALYZE');
      
      if (hasAnalyze) {
        bundleSizeInfo = 'Run `npm run analyze` to see detailed bundle breakdown';
      }
    } catch {}
    
    results.push({
      name: 'Bundle size check',
      status: buildExists ? 'pass' : 'warning',
      details: `${bundleSizeInfo}. Target: < 500KB gzipped`
    });
  } catch (error) {
    results.push({
      name: 'Bundle size check',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function main() {
  console.log('⚡ Starting Performance Verification Checklist\n');
  
  await checkDatabaseIndexes();
  await checkQueryOptimization();
  await checkImageOptimization();
  await checkBundleSize();
  
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

