#!/usr/bin/env tsx
/**
 * Security Verification Checklist Script
 * Verifies all items in the Phase 1 security audit checklist
 */

import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';
import { readdir } from 'fs/promises';

interface ChecklistItem {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  details: string;
}

const results: ChecklistItem[] = [];

async function checkSecurityReview(): Promise<void> {
  console.log('🔒 Running security review...');
  try {
    // Check for security documentation
    const securityDoc = join(process.cwd(), 'docs', 'security', 'IMPLEMENTATION.md');
    let securityDocExists = false;
    try {
      await stat(securityDoc);
      securityDocExists = true;
    } catch {}
    
    // Check for security headers in next.config
    const nextConfig = join(process.cwd(), 'next.config.mjs');
    let hasSecurityHeaders = false;
    if (await fileExists(nextConfig)) {
      const config = await readFile(nextConfig, 'utf-8');
      hasSecurityHeaders = config.includes('X-Frame-Options') || 
                          config.includes('Content-Security-Policy') ||
                          config.includes('securityHeaders');
    }
    
    results.push({
      name: 'Security review',
      status: securityDocExists && hasSecurityHeaders ? 'pass' : 'warning',
      details: `Security docs: ${securityDocExists ? '✓' : '✗'}, Security headers: ${hasSecurityHeaders ? '✓' : '✗'}`
    });
  } catch (error) {
    results.push({
      name: 'Security review',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function checkRateLimiting(): Promise<void> {
  console.log('⏱️ Checking rate limiting...');
  try {
    // Check for Arcjet/rate limiting service
    const arcjetService = join(process.cwd(), 'lib', 'security', 'arcjet-service.ts');
    let arcjetExists = false;
    try {
      await stat(arcjetService);
      arcjetExists = true;
    } catch {}
    
    // Check if rate limiting is used in API routes
    const apiDir = join(process.cwd(), 'app', 'api');
    let routesWithRateLimit = 0;
    let totalRoutes = 0;
    
    try {
      const routes = await scanForRateLimit(apiDir);
      routesWithRateLimit = routes.filter(r => r.hasRateLimit).length;
      totalRoutes = routes.length;
    } catch {}
    
    const coverage = totalRoutes > 0 ? (routesWithRateLimit / totalRoutes) * 100 : 0;
    
    results.push({
      name: 'Rate limiting verification',
      status: arcjetExists && coverage >= 50 ? 'pass' : coverage >= 25 ? 'warning' : 'fail',
      details: `Arcjet service: ${arcjetExists ? '✓' : '✗'}, Rate limiting coverage: ${coverage.toFixed(1)}% (${routesWithRateLimit}/${totalRoutes} routes)`
    });
  } catch (error) {
    results.push({
      name: 'Rate limiting verification',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function scanForRateLimit(dir: string): Promise<Array<{ path: string; hasRateLimit: boolean }>> {
  const routes: Array<{ path: string; hasRateLimit: boolean }> = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        const subRoutes = await scanForRateLimit(fullPath);
        routes.push(...subRoutes);
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        try {
          const content = await readFile(fullPath, 'utf-8');
          const hasRateLimit = content.includes('rateLimit') || 
                             content.includes('RateLimit') ||
                             content.includes('SecurityService') ||
                             content.includes('arcjet');
          routes.push({ path: fullPath, hasRateLimit });
        } catch {
          routes.push({ path: fullPath, hasRateLimit: false });
        }
      }
    }
  } catch {}
  return routes;
}

async function checkInputValidation(): Promise<void> {
  console.log('✅ Checking input validation...');
  try {
    // Check for validation schemas
    const validationSchemas = join(process.cwd(), 'lib', 'validation-schemas.ts');
    let schemasExist = false;
    try {
      await stat(validationSchemas);
      schemasExist = true;
    } catch {}
    
    // Check for Zod usage
    const packageJson = await readFile(join(process.cwd(), 'package.json'), 'utf-8');
    const hasZod = packageJson.includes('zod');
    
    // Check API routes for validation
    const apiDir = join(process.cwd(), 'app', 'api');
    let routesWithValidation = 0;
    let totalRoutes = 0;
    
    try {
      const routes = await scanForValidation(apiDir);
      routesWithValidation = routes.filter(r => r.hasValidation).length;
      totalRoutes = routes.length;
    } catch {}
    
    const coverage = totalRoutes > 0 ? (routesWithValidation / totalRoutes) * 100 : 0;
    
    results.push({
      name: 'Input validation audit',
      status: schemasExist && hasZod && coverage >= 70 ? 'pass' : coverage >= 50 ? 'warning' : 'fail',
      details: `Validation schemas: ${schemasExist ? '✓' : '✗'}, Zod: ${hasZod ? '✓' : '✗'}, Validation coverage: ${coverage.toFixed(1)}% (${routesWithValidation}/${totalRoutes} routes)`
    });
  } catch (error) {
    results.push({
      name: 'Input validation audit',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function scanForValidation(dir: string): Promise<Array<{ path: string; hasValidation: boolean }>> {
  const routes: Array<{ path: string; hasValidation: boolean }> = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        const subRoutes = await scanForValidation(fullPath);
        routes.push(...subRoutes);
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        try {
          const content = await readFile(fullPath, 'utf-8');
          const hasValidation = content.includes('safeParse') || 
                              content.includes('parse') ||
                              content.includes('Schema') ||
                              content.includes('validation') ||
                              content.includes('zod');
          routes.push({ path: fullPath, hasValidation });
        } catch {
          routes.push({ path: fullPath, hasValidation: false });
        }
      }
    }
  } catch {}
  return routes;
}

async function checkCORS(): Promise<void> {
  console.log('🌐 Checking CORS configuration...');
  try {
    const nextConfig = join(process.cwd(), 'next.config.mjs');
    let hasCORS = false;
    if (await fileExists(nextConfig)) {
      const config = await readFile(nextConfig, 'utf-8');
      hasCORS = config.includes('cors') || 
                config.includes('CORS') ||
                config.includes('Access-Control-Allow-Origin');
    }
    
    // Check for CORS in API routes
    const apiDir = join(process.cwd(), 'app', 'api');
    let routesWithCORS = 0;
    let totalRoutes = 0;
    
    try {
      const routes = await scanForCORS(apiDir);
      routesWithCORS = routes.filter(r => r.hasCORS).length;
      totalRoutes = routes.length;
    } catch {}
    
    results.push({
      name: 'CORS configuration review',
      status: hasCORS || routesWithCORS > 0 ? 'pass' : 'warning',
      details: `Next.js CORS: ${hasCORS ? '✓' : '✗'}, Routes with CORS: ${routesWithCORS}/${totalRoutes}`
    });
  } catch (error) {
    results.push({
      name: 'CORS configuration review',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function scanForCORS(dir: string): Promise<Array<{ path: string; hasCORS: boolean }>> {
  const routes: Array<{ path: string; hasCORS: boolean }> = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        const subRoutes = await scanForCORS(fullPath);
        routes.push(...subRoutes);
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        try {
          const content = await readFile(fullPath, 'utf-8');
          const hasCORS = content.includes('Access-Control-Allow-Origin') ||
                         content.includes('cors') ||
                         content.includes('CORS');
          routes.push({ path: fullPath, hasCORS });
        } catch {
          routes.push({ path: fullPath, hasCORS: false });
        }
      }
    }
  } catch {}
  return routes;
}

async function checkEnvironmentVariables(): Promise<void> {
  console.log('🔐 Checking environment variables...');
  try {
    // Check for .env.example
    const envExample = join(process.cwd(), '.env.example');
    let envExampleExists = false;
    try {
      await stat(envExample);
      envExampleExists = true;
    } catch {}
    
    // Check for .env.local in .gitignore
    const gitignore = join(process.cwd(), '.gitignore');
    let envInGitignore = false;
    if (await fileExists(gitignore)) {
      const content = await readFile(gitignore, 'utf-8');
      envInGitignore = content.includes('.env.local') || 
                      content.includes('.env') ||
                      content.includes('*.env');
    }
    
    // Check for hardcoded secrets (basic check)
    const apiDir = join(process.cwd(), 'app', 'api');
    let potentialSecrets = 0;
    try {
      const files = await getAllFiles(apiDir, ['.ts', '.tsx', '.js', '.jsx']);
      for (const file of files.slice(0, 20)) { // Sample first 20 files
        try {
          const content = await readFile(file, 'utf-8');
          // Basic checks for common secret patterns
          if (content.includes('sk_live_') || 
              content.includes('api_key') && content.includes('=') ||
              content.includes('password') && content.includes('=') && !content.includes('process.env')) {
            potentialSecrets++;
          }
        } catch {}
      }
    } catch {}
    
    results.push({
      name: 'Environment variables check',
      status: envExampleExists && envInGitignore && potentialSecrets === 0 ? 'pass' : potentialSecrets > 0 ? 'fail' : 'warning',
      details: `.env.example: ${envExampleExists ? '✓' : '✗'}, .gitignore: ${envInGitignore ? '✓' : '✗'}, Potential secrets: ${potentialSecrets}`
    });
  } catch (error) {
    results.push({
      name: 'Environment variables check',
      status: 'fail',
      details: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
}

async function getAllFiles(dir: string, extensions: string[]): Promise<string[]> {
  const files: string[] = [];
  try {
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

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔒 Starting Security Verification Checklist\n');
  
  await checkSecurityReview();
  await checkRateLimiting();
  await checkInputValidation();
  await checkCORS();
  await checkEnvironmentVariables();
  
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

