/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  requestId?: string;
}

export class ApiErrorHandler {
  static handle(error: unknown, requestId?: string): NextResponse {
    console.error('API Error:', error);

    if (error instanceof ZodError) {
      return this.validationError(error, requestId);
    }

    if (error instanceof Error) {
      return this.serverError(error.message, error.stack, requestId);
    }

    return this.serverError('An unexpected error occurred', undefined, requestId);
  }

  static unauthorized(message = 'Unauthorized access'): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: 'UNAUTHORIZED',
          message,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 401 }
    );
  }

  static forbidden(message = 'Forbidden access'): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: 'FORBIDDEN',
          message,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 403 }
    );
  }

  static notFound(message = 'Resource not found'): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: 'NOT_FOUND',
          message,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 404 }
    );
  }

  static validationError(error: ZodError, requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: error.errors,
          timestamp: new Date().toISOString(),
          requestId,
        }
      },
      { status: 400 }
    );
  }

  static serverError(message: string, stack?: string, requestId?: string): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message,
          timestamp: new Date().toISOString(),
          requestId,
          ...(process.env.NODE_ENV === 'development' && { stack }),
        }
      },
      { status: 500 }
    );
  }

  static databaseError(error: any, requestId?: string): NextResponse {
    console.error('Database Error:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'DATABASE_ERROR',
          message: 'Database operation failed',
          timestamp: new Date().toISOString(),
          requestId,
          ...(process.env.NODE_ENV === 'development' && { details: error.message }),
        }
      },
      { status: 500 }
    );
  }

  static rateLimitExceeded(message = 'Rate limit exceeded'): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 429 }
    );
  }

  static conflict(message = 'Resource conflict'): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: 'CONFLICT',
          message,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 409 }
    );
  }

  static badRequest(message = 'Bad request'): NextResponse {
    return NextResponse.json(
      {
        error: {
          code: 'BAD_REQUEST',
          message,
          timestamp: new Date().toISOString(),
        }
      },
      { status: 400 }
    );
  }
}

// Utility function for wrapping async API handlers with error handling
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      return ApiErrorHandler.handle(error);
    }
  };
}

// Utility function for validating request body
export function validateRequestBody<T>(
  body: unknown,
  schema: { parse: (data: unknown) => T }
): T {
  try {
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      throw error;
    }
    throw new Error('Invalid request body');
  }
}

// Utility function for generating request IDs
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}