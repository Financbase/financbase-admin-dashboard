/**
 * Next.js Instrumentation
 * Explicitly disable all tracing and telemetry to prevent API compatibility issues
 */

export async function register() {
  // Disable all tracing and telemetry
  process.env.OTEL_SDK_DISABLED = 'true';
  process.env.NEXT_OTEL_VERBOSE = '0';
  process.env.NEXT_TELEMETRY_DISABLED = '1';

  // Disable OpenTelemetry completely
  if (typeof globalThis !== 'undefined' && typeof globalThis === 'object') {
    // @ts-expect-error - globalThis is not typed properly in Node.js
    globalThis.OTEL_SDK_DISABLED = true;
  }
}
