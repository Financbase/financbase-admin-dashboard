/**
 * Next.js Instrumentation File
 * Initializes OpenTelemetry tracing for distributed tracing
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 */

export async function register() {
  // Only initialize in production or when explicitly enabled
  if (
    process.env.NEXT_RUNTIME === 'nodejs' &&
    (process.env.NODE_ENV === 'production' || process.env.ENABLE_TRACING === 'true')
  ) {
    try {
      // Dynamic import to avoid loading in development unless needed
      const { initializeTracing } = await import('./lib/monitoring/tracing');
      initializeTracing();
    } catch (error) {
      console.error('Failed to initialize tracing:', error);
      // Don't throw - allow application to continue
    }
  }
}

