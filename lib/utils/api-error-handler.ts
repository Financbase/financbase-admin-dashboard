/**
 * Client-side API Error Parser
 * 
 * Handles parsing of standardized API error responses from ApiErrorHandler
 * and provides utilities for displaying errors to users.
 */

/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */


/**
 * Represents a parsed API error response
 */
export interface ParsedApiError {
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
  requestId?: string;
}

/**
 * Validation error detail from Zod
 */
export interface ValidationErrorDetail {
  path: (string | number)[];
  message: string;
  code?: string;
}

/**
 * Parse an API error response into a standardized format
 * 
 * @param response - The fetch Response object
 * @returns Parsed error or null if response is not an error
 */
export async function parseApiError(response: Response): Promise<ParsedApiError | null> {
  // Only parse if response indicates an error
  if (response.ok) {
    return null;
  }

  try {
    const data = await response.json();

    // Handle ApiErrorHandler standardized format: { error: { code, message, ... } }
    if (data.error && typeof data.error === 'object') {
      return {
        code: data.error.code || 'UNKNOWN_ERROR',
        message: data.error.message || 'An error occurred',
        details: data.error.details,
        timestamp: data.error.timestamp,
        requestId: data.error.requestId,
      };
    }

    // Handle legacy formats: { error: string, code: string }
    if (data.error) {
      return {
        code: data.code || (response.status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST'),
        message: typeof data.error === 'string' 
          ? data.error 
          : data.error.message || 'An error occurred',
        details: data.details,
      };
    }

    // Fallback for unexpected formats
    return {
      code: response.status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST',
      message: 'An error occurred',
    };
  } catch {
    // Failed to parse JSON - return generic error
    return {
      code: response.status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'BAD_REQUEST',
      message: `Request failed with status ${response.status}`,
    };
  }
}

/**
 * Extract validation errors from a parsed API error
 * 
 * @param error - Parsed API error
 * @returns Array of validation error details if error is a validation error
 */
export function extractValidationErrors(error: ParsedApiError): ValidationErrorDetail[] {
  if (error.code !== 'VALIDATION_ERROR' && error.code !== 'BAD_REQUEST') {
    return [];
  }

  if (!error.details) {
    return [];
  }

  // Handle ZodError format: array of { path, message, code }
  if (Array.isArray(error.details)) {
    return error.details.map((detail: any) => ({
      path: detail.path || [],
      message: detail.message || 'Validation error',
      code: detail.code,
    }));
  }

  // Handle object format: { field: 'error message' }
  if (typeof error.details === 'object' && !Array.isArray(error.details)) {
    return Object.entries(error.details).map(([field, message]) => ({
      path: field.split('.'),
      message: typeof message === 'string' ? message : 'Validation error',
    }));
  }

  return [];
}

/**
 * Check if an error is a validation error
 */
export function isValidationError(error: ParsedApiError): boolean {
  return error.code === 'VALIDATION_ERROR' || error.code === 'BAD_REQUEST';
}

/**
 * Check if an error is a server error (500+)
 */
export function isServerError(error: ParsedApiError, status?: number): boolean {
  return error.code === 'INTERNAL_SERVER_ERROR' || 
         error.code === 'DATABASE_ERROR' ||
         (status !== undefined && status >= 500);
}

/**
 * Get user-friendly error message based on error code
 */
export function getUserFriendlyMessage(error: ParsedApiError): string {
  const messages: Record<string, string> = {
    VALIDATION_ERROR: 'Please check your input and try again',
    BAD_REQUEST: 'Invalid request. Please check your input',
    UNAUTHORIZED: 'You need to sign in to continue',
    FORBIDDEN: 'You don\'t have permission to perform this action',
    NOT_FOUND: 'The requested resource was not found',
    INTERNAL_SERVER_ERROR: 'Something went wrong on our end. Please try again later',
    DATABASE_ERROR: 'Unable to process your request. Please try again',
    NETWORK_ERROR: 'Network error. Please check your connection',
    RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later',
    CONFLICT: 'This resource already exists or has been modified',
  };

  return messages[error.code] || error.message || 'An unexpected error occurred';
}

/**
 * Create an error from a fetch error (network errors, etc.)
 */
export function createErrorFromFetch(error: unknown): ParsedApiError {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // Network errors - check case-insensitively
    if (message.includes('fetch') || message.includes('network') || message.includes('failed to fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your internet connection.',
      };
    }

    // Generic error
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
    };
  }

  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  };
}

