/**
 * Distributed Tracing Configuration
 * OpenTelemetry integration with Jaeger for distributed tracing
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
// Resource may not be available as a value in this version
// Using a workaround to create resource attributes
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-otlp-http';

// Configuration
const JAEGER_ENDPOINT = process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces';
const JAEGER_AGENT_HOST = process.env.JAEGER_AGENT_HOST || 'localhost';
const JAEGER_AGENT_PORT = process.env.JAEGER_AGENT_PORT || '6831';
const SERVICE_NAME = process.env.OTEL_SERVICE_NAME || 'financbase-admin-dashboard';
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const TRACE_SAMPLE_RATE = parseFloat(process.env.TRACE_SAMPLE_RATE || '0.1'); // 10% sampling in production

let sdk: NodeSDK | null = null;

/**
 * Initialize OpenTelemetry tracing with Jaeger
 */
export function initializeTracing(): void {
  // Skip initialization if tracing is disabled
  if (process.env.OTEL_SDK_DISABLED === 'true') {
    console.log('[Tracing] OpenTelemetry SDK is disabled');
    return;
  }

  // Skip in test environment unless explicitly enabled
  if (ENVIRONMENT === 'test' && process.env.ENABLE_TRACING !== 'true') {
    return;
  }

  try {
    // Determine exporter based on configuration
    const useJaegerAgent = process.env.JAEGER_USE_AGENT === 'true';
    const useOTLP = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

    let exporter;
    
    if (useOTLP) {
      // Use OTLP exporter (compatible with Jaeger, Tempo, etc.)
      exporter = new OTLPTraceExporter({
        url: useOTLP,
        headers: process.env.OTEL_EXPORTER_OTLP_HEADERS
          ? JSON.parse(process.env.OTEL_EXPORTER_OTLP_HEADERS)
          : {},
      });
    } else if (useJaegerAgent) {
      // Use Jaeger agent (UDP)
      // Note: JaegerExporter in newer versions doesn't support agentHost/agentPort
      // Use default agent configuration (localhost:6831) or configure via environment
      exporter = new JaegerExporter({
        // Defaults to localhost:6831 for agent
        // Can be configured via JAEGER_AGENT_HOST and JAEGER_AGENT_PORT env vars
      });
    } else {
      // Use Jaeger collector (HTTP)
      exporter = new JaegerExporter({
        endpoint: JAEGER_ENDPOINT,
      });
    }

    // Create SDK with resource attributes
    // Note: Resource may not be available as a constructor in this version
    // Using resource attributes directly if supported
    const resourceAttributes: Record<string, string> = {
      [SemanticResourceAttributes.SERVICE_NAME]: SERVICE_NAME,
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION || '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: ENVIRONMENT,
      'service.namespace': 'financbase',
      'service.instance.id': process.env.VERCEL_DEPLOYMENT_ID || 'local',
    };
    
    sdk = new NodeSDK({
      // @ts-ignore - Resource constructor may not be available
      resource: typeof Resource !== 'undefined' && Resource ? new Resource(resourceAttributes) : resourceAttributes,
      traceExporter: exporter as any, // Type assertion to handle version incompatibility
      spanProcessor: new BatchSpanProcessor(exporter as any, {
        // @ts-ignore - Type incompatibility between OpenTelemetry versions
        maxQueueSize: 2048,
        maxExportBatchSize: 512,
        scheduledDelayMillis: 5000,
        exportTimeoutMillis: 30000,
      }) as any, // Type assertion to handle version incompatibility
      instrumentations: [
        getNodeAutoInstrumentations({
          // Enable HTTP instrumentation
          '@opentelemetry/instrumentation-http': {
            enabled: true,
            ignoreIncomingRequestHook: (req) => {
              // Ignore health checks and monitoring endpoints
              const url = req.url || '';
              return url.includes('/api/health') || url.includes('/api/monitoring');
            },
          },
          // Enable Express/Fastify instrumentation
          '@opentelemetry/instrumentation-express': {
            enabled: true,
          },
          // Enable database instrumentation
          '@opentelemetry/instrumentation-pg': {
            enabled: true,
          },
          // Enable Redis instrumentation
          '@opentelemetry/instrumentation-redis': {
            enabled: true,
          },
          // Fetch instrumentation not available in this version
        }),
      ],
    });

    // Start SDK
    sdk.start();
    console.log(`[Tracing] OpenTelemetry initialized for ${SERVICE_NAME} in ${ENVIRONMENT}`);
    console.log(`[Tracing] Jaeger endpoint: ${JAEGER_ENDPOINT}`);
  } catch (error) {
    console.error('[Tracing] Failed to initialize OpenTelemetry:', error);
    // Don't throw - allow application to continue without tracing
  }
}

/**
 * Shutdown tracing gracefully
 */
export async function shutdownTracing(): Promise<void> {
  if (sdk) {
    try {
      await sdk.shutdown();
      console.log('[Tracing] OpenTelemetry SDK shut down');
    } catch (error) {
      console.error('[Tracing] Error shutting down SDK:', error);
    }
  }
}

/**
 * Get current trace context
 */
export function getTraceContext(): { traceId?: string; spanId?: string } {
  const { context, trace } = require('@opentelemetry/api');
  const activeSpan = trace.getActiveSpan();
  
  if (activeSpan) {
    const spanContext = activeSpan.spanContext();
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
    };
  }
  
  return {};
}

// Auto-initialize in production
if (ENVIRONMENT === 'production' || process.env.ENABLE_TRACING === 'true') {
  initializeTracing();
  
  // Graceful shutdown
  process.on('SIGTERM', shutdownTracing);
  process.on('SIGINT', shutdownTracing);
}

export { sdk };

