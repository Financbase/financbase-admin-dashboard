/**
 * Standard API Response Format
 * 
 * Provides consistent response formatting across all API routes
 */

import { NextResponse } from 'next/server';

export interface StandardApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    timestamp: string;
    requestId?: string;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp?: string;
  requestId?: string;
}

/**
 * Create a standard success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  options?: {
    requestId?: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }
): NextResponse<StandardApiResponse<T>> {
  const response: StandardApiResponse<T> = {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };

  if (options?.requestId) {
    response.requestId = options.requestId;
  }

  if (options?.pagination) {
    response.pagination = options.pagination;
  }

  return NextResponse.json(response, { status });
}

/**
 * Create a standard error response
 * Note: For errors, prefer using ApiErrorHandler which already follows this format
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number = 400,
  requestId?: string
): NextResponse<StandardApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
        requestId,
      },
    },
    { status }
  );
}

/**
 * Helper to wrap existing responses in standard format
 * Useful for migrating existing routes
 */
export function wrapInStandardResponse<T>(
  data: T,
  status: number = 200
): NextResponse<StandardApiResponse<T>> {
  return createSuccessResponse(data, status);
}

