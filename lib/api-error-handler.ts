import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { db } from '@/lib/db';
import { platformServiceLogs } from '@/lib/db/schemas';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
  requestId?: string;
}

export interface ErrorContext {
  userId?: string;
  organizationId?: string;
  serviceId?: number;
  endpoint?: string;
  method?: string;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export class ApiErrorHandler {
  static async handle(error: unknown, context?: ErrorContext): Promise<NextResponse> {
    const requestId = context?.requestId || ApiErrorHandler.generateRequestId();
    const timestamp = new Date().toISOString();
    
    console.error('API Error:', {
      error,
      context,
      requestId,
      timestamp
    });

    // Log error to platform service logs if context is provided
    if (context?.serviceId) {
      await ApiErrorHandler.logError(error, context, requestId);
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          })),
          timestamp,
          requestId
        },
        { status: 400 }
      );
    }

    // Handle database connection errors
    if (error instanceof Error && error.message.includes('connection')) {
      return NextResponse.json(
        {
          error: 'Database Connection Error',
          code: 'DATABASE_CONNECTION_ERROR',
          message: 'Unable to connect to database',
          timestamp,
          requestId
        },
        { status: 503 }
      );
    }

    // Handle timeout errors
    if (error instanceof Error && error.message.includes('timeout')) {
      return NextResponse.json(
        {
          error: 'Request Timeout',
          code: 'REQUEST_TIMEOUT',
          message: 'Request timed out',
          timestamp,
          requestId
        },
        { status: 408 }
      );
    }

    // Handle rate limit errors
    if (error instanceof Error && error.message.includes('rate limit')) {
      return NextResponse.json(
        {
          error: 'Rate Limit Exceeded',
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests',
          timestamp,
          requestId
        },
        { status: 429 }
      );
    }

    // Handle custom API errors
    if (error instanceof Error && 'code' in error) {
      const apiError = error as Error & { code: string; statusCode?: number };
      return NextResponse.json(
        {
          error: apiError.message,
          code: apiError.code,
          message: apiError.message,
          timestamp,
          requestId
        },
        { status: apiError.statusCode || 500 }
      );
    }

    // Handle generic errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          code: 'INTERNAL_ERROR',
          message: error.message,
          timestamp,
          requestId
        },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        timestamp,
        requestId
      },
      { status: 500 }
    );
  }

  private static async logError(error: unknown, context: ErrorContext, requestId: string): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorDetails = {
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        context,
        requestId
      };

      await db.insert(platformServiceLogs).values({
        serviceId: context.serviceId,
        userId: context.userId,
        organizationId: context.organizationId,
        level: 'error',
        message: errorMessage,
        details: errorDetails,
        requestId,
        userAgent: context.userAgent,
        ipAddress: context.ipAddress,
        labels: {
          endpoint: context.endpoint,
          method: context.method,
          errorType: error instanceof Error ? error.constructor.name : 'Unknown'
        }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  private static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static createError(message: string, code: string, statusCode: number = 400): Error {
    const error = new Error(message) as Error & { code: string; statusCode: number };
    error.code = code;
    error.statusCode = statusCode;
    return error;
  }

  static unauthorized(message: string = 'Unauthorized', requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
        requestId
      },
      { status: 401 }
    );
  }

  static forbidden(message: string = 'Forbidden', requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
        timestamp: new Date().toISOString(),
        requestId
      },
      { status: 403 }
    );
  }

  static notFound(message: string = 'Not Found', requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: 'NOT_FOUND',
        message: 'Resource not found',
        timestamp: new Date().toISOString(),
        requestId
      },
      { status: 404 }
    );
  }

  static badRequest(message: string = 'Bad Request', requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: 'BAD_REQUEST',
        message: 'Invalid request',
        timestamp: new Date().toISOString(),
        requestId
      },
      { status: 400 }
    );
  }

  static conflict(message: string = 'Conflict', requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: 'CONFLICT',
        message: 'Resource conflict',
        timestamp: new Date().toISOString(),
        requestId
      },
      { status: 409 }
    );
  }

  static serviceUnavailable(message: string = 'Service Unavailable', requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Service temporarily unavailable',
        timestamp: new Date().toISOString(),
        requestId
      },
      { status: 503 }
    );
  }

  static tooManyRequests(message: string = 'Too Many Requests', requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: 'TOO_MANY_REQUESTS',
        message: 'Rate limit exceeded',
        timestamp: new Date().toISOString(),
        requestId
      },
      { status: 429 }
    );
  }

  // Platform Services specific errors
  static serviceNotFound(serviceName: string, requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: `Service '${serviceName}' not found`,
        code: 'SERVICE_NOT_FOUND',
        message: 'Platform service not found',
        timestamp: new Date().toISOString(),
        requestId
      },
      { status: 404 }
    );
  }

  static serviceUnhealthy(serviceName: string, requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: `Service '${serviceName}' is unhealthy`,
        code: 'SERVICE_UNHEALTHY',
        message: 'Platform service is not responding properly',
        timestamp: new Date().toISOString(),
        requestId
      },
      { status: 503 }
    );
  }

  static workflowExecutionFailed(workflowId: string, reason: string, requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: `Workflow execution failed: ${reason}`,
        code: 'WORKFLOW_EXECUTION_FAILED',
        message: 'Workflow execution failed',
        details: { workflowId, reason },
        timestamp: new Date().toISOString(),
        requestId
      },
      { status: 500 }
    );
  }

  static webhookDeliveryFailed(webhookId: string, reason: string, requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: `Webhook delivery failed: ${reason}`,
        code: 'WEBHOOK_DELIVERY_FAILED',
        message: 'Webhook delivery failed',
        details: { webhookId, reason },
        timestamp: new Date().toISOString(),
        requestId
      },
      { status: 500 }
    );
  }

  static integrationConnectionFailed(integrationName: string, reason: string, requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: `Integration connection failed: ${reason}`,
        code: 'INTEGRATION_CONNECTION_FAILED',
        message: 'Integration connection failed',
        details: { integrationName, reason },
        timestamp: new Date().toISOString(),
        requestId
      },
      { status: 500 }
    );
  }
}
