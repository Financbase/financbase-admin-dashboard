/**
 * Helper utilities for testing API error responses
 * 
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { expect } from 'vitest';

/**
 * Standard error response format from ApiErrorHandler
 */
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    timestamp: string;
    requestId?: string;
    details?: any;
  };
}

/**
 * Validates that a response follows the ApiErrorHandler error format
 * 
 * @param response - The Response object to validate
 * @param expectedStatus - Expected HTTP status code
 * @param expectedCode - Expected error code (optional)
 * @returns Promise that resolves to the parsed error response
 */
export async function validateErrorResponse(
  response: Response,
  expectedStatus: number,
  expectedCode?: string
): Promise<ApiErrorResponse> {
  expect(response.status).toBe(expectedStatus);
  
  const data = await response.json();
  
  // Validate structure
  expect(data).toHaveProperty('error');
  expect(data.error).toHaveProperty('code');
  expect(data.error).toHaveProperty('message');
  expect(data.error).toHaveProperty('timestamp');
  
  // Validate types
  expect(typeof data.error.code).toBe('string');
  expect(typeof data.error.message).toBe('string');
  expect(typeof data.error.timestamp).toBe('string');
  
  // Validate timestamp is ISO format
  expect(() => new Date(data.error.timestamp)).not.toThrow();
  
  // Validate expected code if provided
  if (expectedCode) {
    expect(data.error.code).toBe(expectedCode);
  }
  
  return data as ApiErrorResponse;
}

/**
 * Validates a 401 Unauthorized error response
 */
export async function validateUnauthorizedResponse(response: Response): Promise<ApiErrorResponse> {
  return validateErrorResponse(response, 401, 'UNAUTHORIZED');
}

/**
 * Validates a 400 Bad Request error response
 */
export async function validateBadRequestResponse(response: Response, expectedCode?: 'BAD_REQUEST' | 'VALIDATION_ERROR'): Promise<ApiErrorResponse> {
  return validateErrorResponse(response, 400, expectedCode);
}

/**
 * Validates a 403 Forbidden error response
 */
export async function validateForbiddenResponse(response: Response): Promise<ApiErrorResponse> {
  return validateErrorResponse(response, 403, 'FORBIDDEN');
}

/**
 * Validates a 404 Not Found error response
 */
export async function validateNotFoundResponse(response: Response): Promise<ApiErrorResponse> {
  return validateErrorResponse(response, 404, 'NOT_FOUND');
}

/**
 * Validates a 500 Internal Server Error response
 */
export async function validateServerErrorResponse(response: Response): Promise<ApiErrorResponse> {
  return validateErrorResponse(response, 500, 'INTERNAL_SERVER_ERROR');
}

/**
 * Validates a 409 Conflict error response
 */
export async function validateConflictResponse(response: Response): Promise<ApiErrorResponse> {
  return validateErrorResponse(response, 409, 'CONFLICT');
}

/**
 * Validates a 429 Rate Limit Exceeded error response
 */
export async function validateRateLimitResponse(response: Response): Promise<ApiErrorResponse> {
  return validateErrorResponse(response, 429, 'RATE_LIMIT_EXCEEDED');
}

