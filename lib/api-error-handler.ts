import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export class ApiErrorHandler {
  static handle(error: unknown): NextResponse {
    console.error('API Error:', error);

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
          }))
        },
        { status: 400 }
      );
    }

    // Handle custom API errors
    if (error instanceof Error && 'code' in error) {
      const apiError = error as Error & { code: string; statusCode?: number };
      return NextResponse.json(
        {
          error: apiError.message,
          code: apiError.code,
          message: apiError.message
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
          message: error.message
        },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }

  static createError(message: string, code: string, statusCode: number = 400): Error {
    const error = new Error(message) as Error & { code: string; statusCode: number };
    error.code = code;
    error.statusCode = statusCode;
    return error;
  }

  static unauthorized(message: string = 'Unauthorized'): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      },
      { status: 401 }
    );
  }

  static forbidden(message: string = 'Forbidden'): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: 'FORBIDDEN',
        message: 'Insufficient permissions'
      },
      { status: 403 }
    );
  }

  static notFound(message: string = 'Not Found'): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: 'NOT_FOUND',
        message: 'Resource not found'
      },
      { status: 404 }
    );
  }

  static badRequest(message: string = 'Bad Request'): NextResponse {
    return NextResponse.json(
      {
        error: message,
        code: 'BAD_REQUEST',
        message: 'Invalid request'
      },
      { status: 400 }
    );
  }
}
