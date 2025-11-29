# Distributed Tracing with OpenTelemetry and Jaeger

**Status**: ✅ Implemented  
**Last Updated**: January 2025

## Overview

The Financbase Admin Dashboard implements distributed tracing using OpenTelemetry and Jaeger to provide end-to-end visibility into request flows across services, databases, and external APIs.

## Architecture

```
┌─────────────┐
│   Next.js   │
│ Application │
└──────┬──────┘
       │
       │ OpenTelemetry SDK
       │
       ▼
┌─────────────┐
│   Jaeger    │
│  Collector  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Jaeger    │
│   Storage   │
└─────────────┘
```

## Components

### OpenTelemetry SDK
- **Location**: `lib/monitoring/tracing.ts`
- **Purpose**: Instrumentation and trace collection
- **Features**:
  - Automatic instrumentation for HTTP, Express, PostgreSQL, Redis
  - Manual span creation for custom operations
  - Sampling configuration
  - Resource attributes

### Jaeger
- **Purpose**: Trace storage and visualization
- **Components**:
  - **Agent**: Receives traces via UDP
  - **Collector**: Receives traces via HTTP/gRPC
  - **Query**: UI for trace visualization
  - **Storage**: Backend storage (Elasticsearch, Cassandra, or in-memory)

## Setup

### 1. Install Dependencies

```bash
pnpm add @opentelemetry/sdk-node \
  @opentelemetry/auto-instrumentations-node \
  @opentelemetry/exporter-jaeger \
  @opentelemetry/exporter-otlp-http \
  @opentelemetry/resources \
  @opentelemetry/semantic-conventions
```

### 2. Environment Variables

Add to `.env.local` or production environment:

```env
# Enable tracing
ENABLE_TRACING=true
OTEL_SDK_DISABLED=false

# Service identification
OTEL_SERVICE_NAME=financbase-admin-dashboard
APP_VERSION=2.0.0

# Jaeger configuration
JAEGER_ENDPOINT=http://localhost:14268/api/traces
JAEGER_AGENT_HOST=localhost
JAEGER_AGENT_PORT=6831
JAEGER_USE_AGENT=false

# OTLP exporter (alternative to Jaeger)
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
OTEL_EXPORTER_OTLP_HEADERS={"Authorization":"Bearer token"}

# Sampling rate (0.0 to 1.0)
TRACE_SAMPLE_RATE=0.1  # 10% in production, 1.0 in development
```

### 3. Local Development with Docker

#### Start Jaeger

```bash
docker run -d \
  --name jaeger \
  -p 16686:16686 \
  -p 14268:14268 \
  -p 6831:6831/udp \
  jaegertracing/all-in-one:latest
```

#### Access Jaeger UI

Open http://localhost:16686 in your browser.

### 4. Production Deployment

#### Option A: Jaeger Cloud

Use managed Jaeger service (e.g., Grafana Cloud, Datadog, New Relic).

#### Option B: Self-Hosted Jaeger

Deploy Jaeger using Kubernetes, Docker Compose, or cloud services.

#### Option C: OTLP-Compatible Backend

Use any OTLP-compatible backend:
- Jaeger
- Tempo (Grafana)
- Datadog
- New Relic
- Honeycomb

## Usage

### Automatic Instrumentation

The SDK automatically instruments:
- **HTTP requests**: Incoming and outgoing
- **Express/Next.js**: Route handlers
- **PostgreSQL**: Database queries
- **Redis**: Cache operations
- **Fetch**: External API calls

### Manual Span Creation

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('my-service');

// Create a span
const span = tracer.startSpan('custom-operation');
try {
  // Your code here
  span.setAttribute('operation.type', 'custom');
  span.setAttribute('operation.id', operationId);
  
  // Add events
  span.addEvent('operation.started', { timestamp: Date.now() });
  
  // Your business logic
  await performOperation();
  
  span.addEvent('operation.completed');
  span.setStatus({ code: SpanStatusCode.OK });
} catch (error) {
  span.setStatus({ 
    code: SpanStatusCode.ERROR, 
    message: error.message 
  });
  span.recordException(error);
  throw error;
} finally {
  span.end();
}
```

### Adding Custom Attributes

```typescript
import { trace } from '@opentelemetry/api';

const span = trace.getActiveSpan();
if (span) {
  span.setAttributes({
    'user.id': userId,
    'request.id': requestId,
    'operation.type': 'invoice.create',
  });
}
```

## Configuration

### Sampling

Control trace volume with sampling:

```typescript
// In tracing.ts
const TRACE_SAMPLE_RATE = parseFloat(
  process.env.TRACE_SAMPLE_RATE || '0.1'
); // 10% in production
```

**Recommendations**:
- **Development**: 100% (1.0) - See all traces
- **Staging**: 50% (0.5) - Balanced visibility
- **Production**: 10% (0.1) - Reduce overhead

### Filtering

Ignore health checks and monitoring endpoints:

```typescript
ignoreIncomingRequestHook: (req) => {
  const url = req.url || '';
  return url.includes('/api/health') || 
         url.includes('/api/monitoring');
}
```

## Viewing Traces

### Jaeger UI

1. Open Jaeger UI: http://localhost:16686
2. Select service: `financbase-admin-dashboard`
3. Search traces by:
   - Operation name
   - Tags (user.id, request.id, etc.)
   - Time range
   - Duration

### Trace Details

Each trace shows:
- **Timeline**: Visual representation of spans
- **Span Details**: Attributes, events, logs
- **Service Map**: Service dependencies
- **Performance Metrics**: Duration, errors

## Best Practices

### 1. Meaningful Span Names

```typescript
// Good
tracer.startSpan('invoice.create')
tracer.startSpan('payment.process')

// Bad
tracer.startSpan('operation')
tracer.startSpan('doStuff')
```

### 2. Add Contextual Attributes

```typescript
span.setAttributes({
  'user.id': userId,
  'invoice.id': invoiceId,
  'payment.method': 'stripe',
  'amount': 100.00,
});
```

### 3. Record Exceptions

```typescript
try {
  // code
} catch (error) {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR });
  throw error;
}
```

### 4. Use Semantic Conventions

```typescript
import { SemanticAttributes } from '@opentelemetry/semantic-conventions';

span.setAttribute(SemanticAttributes.HTTP_METHOD, 'POST');
span.setAttribute(SemanticAttributes.HTTP_URL, url);
span.setAttribute(SemanticAttributes.HTTP_STATUS_CODE, 200);
```

## Performance Considerations

### Overhead

- **CPU**: ~1-2% overhead with 10% sampling
- **Memory**: ~50-100MB for SDK
- **Network**: Minimal (batched exports)

### Optimization

1. **Sampling**: Reduce sample rate in production
2. **Batching**: Use BatchSpanProcessor (default)
3. **Filtering**: Ignore low-value traces
4. **Async Export**: Non-blocking trace export

## Troubleshooting

### Traces Not Appearing

1. **Check Configuration**:
   ```bash
   echo $ENABLE_TRACING
   echo $JAEGER_ENDPOINT
   ```

2. **Verify Jaeger is Running**:
   ```bash
   curl http://localhost:16686/api/services
   ```

3. **Check Logs**:
   Look for `[Tracing]` log messages

4. **Verify Instrumentation**:
   Ensure `instrumentation.ts` is in project root

### High Overhead

1. **Reduce Sampling**: Lower `TRACE_SAMPLE_RATE`
2. **Filter More**: Add more ignore patterns
3. **Check Batch Size**: Adjust `maxExportBatchSize`

## Integration with Monitoring

### Sentry Integration

Traces can be correlated with Sentry errors:

```typescript
import { getTraceContext } from '@/lib/monitoring/tracing';

const { traceId, spanId } = getTraceContext();
Sentry.setTag('trace_id', traceId);
```

### Metrics Correlation

Use trace IDs to correlate with metrics:
- Response time metrics
- Error rate metrics
- Business metrics

## Compliance

### SOC 2 Type II

- ✅ Distributed tracing implemented
- ✅ Request flow visibility
- ✅ Performance monitoring
- ✅ Error tracking

### Audit Logging

Traces complement audit logs:
- User actions
- API calls
- Database operations
- External service calls

## Next Steps

1. **Service Mesh Integration**: Add Istio/Linkerd for service-to-service tracing
2. **Custom Instrumentation**: Add tracing to critical business logic
3. **Alerting**: Set up alerts based on trace metrics
4. **Dashboards**: Create Grafana dashboards from trace data

## Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Jaeger Documentation](https://www.jaegertracing.io/docs/)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)

## Support

For issues or questions:
- Check logs for `[Tracing]` messages
- Review Jaeger UI for trace details
- Contact DevOps team

---

**Last Updated**: January 2025  
**Maintained By**: DevOps Team

