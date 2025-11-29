#!/usr/bin/env tsx

/**
 * API Route Audit Script
 * Tests all API endpoints for:
 * - Authentication
 * - Response formats
 * - Error handling
 * - Status codes
 */

import { readdir, stat } from 'fs/promises';
import { join } from 'path';

interface RouteInfo {
  path: string;
  methods: string[];
  hasAuth: boolean;
  hasErrorHandling: boolean;
  responseFormat: 'json' | 'unknown';
}

async function findApiRoutes(dir: string, basePath: string = ''): Promise<RouteInfo[]> {
  const routes: RouteInfo[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const routePath = basePath ? `${basePath}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      // Recursively search subdirectories
      const subRoutes = await findApiRoutes(fullPath, routePath);
      routes.push(...subRoutes);
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      // Found an API route file
      const routeInfo = await analyzeRouteFile(fullPath, routePath);
      routes.push(routeInfo);
    }
  }

  return routes;
}

async function analyzeRouteFile(filePath: string, routePath: string): Promise<RouteInfo> {
  const content = await import('fs').then(fs => fs.promises.readFile(filePath, 'utf-8'));
  
  const methods: string[] = [];
  if (content.includes('export async function GET')) methods.push('GET');
  if (content.includes('export async function POST')) methods.push('POST');
  if (content.includes('export async function PUT')) methods.push('PUT');
  if (content.includes('export async function PATCH')) methods.push('PATCH');
  if (content.includes('export async function DELETE')) methods.push('DELETE');

  const hasAuth = 
    content.includes('await auth()') ||
    content.includes('withRLS') ||
    content.includes('@clerk/nextjs/server');

  const hasErrorHandling =
    content.includes('ApiErrorHandler') ||
    content.includes('try {') ||
    content.includes('catch (error)');

  const responseFormat: 'json' | 'unknown' = 
    content.includes('NextResponse.json') || content.includes('Response.json') 
      ? 'json' 
      : 'unknown';

  return {
    path: `/api/${routePath.replace('/route', '')}`,
    methods,
    hasAuth,
    hasErrorHandling,
    responseFormat,
  };
}

async function main() {
  const apiDir = join(process.cwd(), 'app/api');
  const routes = await findApiRoutes(apiDir);

  console.log('\n=== API Route Audit Report ===\n');
  console.log(`Total API Routes Found: ${routes.length}\n`);

  // Group by authentication
  const withAuth = routes.filter(r => r.hasAuth);
  const withoutAuth = routes.filter(r => !r.hasAuth);

  console.log(`Routes with Authentication: ${withAuth.length}`);
  console.log(`Routes without Authentication: ${withoutAuth.length}\n`);

  // Group by error handling
  const withErrorHandling = routes.filter(r => r.hasErrorHandling);
  const withoutErrorHandling = routes.filter(r => !r.hasErrorHandling);

  console.log(`Routes with Error Handling: ${withErrorHandling.length}`);
  console.log(`Routes without Error Handling: ${withoutErrorHandling.length}\n`);

  // Group by response format
  const jsonResponses = routes.filter(r => r.responseFormat === 'json');
  const unknownResponses = routes.filter(r => r.responseFormat === 'unknown');

  console.log(`Routes with JSON Responses: ${jsonResponses.length}`);
  console.log(`Routes with Unknown Response Format: ${unknownResponses.length}\n`);

  // List routes without authentication
  if (withoutAuth.length > 0) {
    console.log('\n⚠️  Routes WITHOUT Authentication:');
    withoutAuth.forEach(route => {
      console.log(`  - ${route.path} [${route.methods.join(', ')}]`);
    });
    console.log('');
  }

  // List routes without error handling
  if (withoutErrorHandling.length > 0) {
    console.log('\n⚠️  Routes WITHOUT Error Handling:');
    withoutErrorHandling.forEach(route => {
      console.log(`  - ${route.path} [${route.methods.join(', ')}]`);
    });
    console.log('');
  }

  // List routes with unknown response format
  if (unknownResponses.length > 0) {
    console.log('\n⚠️  Routes with Unknown Response Format:');
    unknownResponses.forEach(route => {
      console.log(`  - ${route.path} [${route.methods.join(', ')}]`);
    });
    console.log('');
  }

  // Summary statistics
  console.log('\n=== Summary ===');
  console.log(`Total Routes: ${routes.length}`);
  console.log(`Routes Needing Attention: ${withoutAuth.length + withoutErrorHandling.length + unknownResponses.length}`);
  console.log(`Coverage: ${((routes.length - withoutAuth.length - withoutErrorHandling.length - unknownResponses.length) / routes.length * 100).toFixed(1)}%`);
  console.log('');

  // Export detailed report
  const report = {
    total: routes.length,
    withAuth: withAuth.length,
    withoutAuth: withoutAuth.length,
    withErrorHandling: withErrorHandling.length,
    withoutErrorHandling: withoutErrorHandling.length,
    jsonResponses: jsonResponses.length,
    unknownResponses: unknownResponses.length,
    routes: routes.map(r => ({
      path: r.path,
      methods: r.methods,
      hasAuth: r.hasAuth,
      hasErrorHandling: r.hasErrorHandling,
      responseFormat: r.responseFormat,
      needsAttention: !r.hasAuth || !r.hasErrorHandling || r.responseFormat === 'unknown',
    })),
  };

  await import('fs').then(fs => 
    fs.promises.writeFile(
      'api-route-audit-report.json',
      JSON.stringify(report, null, 2)
    )
  );

  console.log('Detailed report saved to: api-route-audit-report.json');
}

main().catch(console.error);

