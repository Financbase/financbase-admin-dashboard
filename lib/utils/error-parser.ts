/**
 * Error Parser Utilities
 * 
 * Utilities for parsing and formatting API errors for display in the frontend.
 */

import { ZodError } from 'zod';

export interface FieldError {
  field: string;
  message: string;
}

export interface ParsedErrors {
  fieldErrors: Record<string, string[]>;
  generalErrors: string[];
}

/**
 * Parse API error response into field-level errors
 */
export function parseApiError(error: any): ParsedErrors {
  const result: ParsedErrors = {
    fieldErrors: {},
    generalErrors: [],
  };

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    error.errors.forEach((err) => {
      const field = err.path.join('.');
      if (!result.fieldErrors[field]) {
        result.fieldErrors[field] = [];
      }
      result.fieldErrors[field].push(err.message);
    });
    return result;
  }

  // Handle API error response format
  if (error?.error) {
    const apiError = error.error;

    // Validation errors with details
    if (apiError.code === 'VALIDATION_ERROR' && apiError.details) {
      if (Array.isArray(apiError.details)) {
        apiError.details.forEach((detail: any) => {
          const field = detail.path?.join('.') || 'root';
          if (!result.fieldErrors[field]) {
            result.fieldErrors[field] = [];
          }
          result.fieldErrors[field].push(detail.message || 'Invalid value');
        });
      }
      return result;
    }

    // General error message
    if (apiError.message) {
      result.generalErrors.push(apiError.message);
    }
  }

  // Handle generic error objects
  if (error?.message) {
    result.generalErrors.push(error.message);
  }

  return result;
}

/**
 * Parse validation errors from API response
 */
export function parseValidationErrors(error: any): Record<string, string[]> {
  const parsed = parseApiError(error);
  return parsed.fieldErrors;
}

/**
 * Get first error message for a specific field
 */
export function getFieldError(
  errors: Record<string, string[]>,
  field: string
): string | undefined {
  return errors[field]?.[0];
}

/**
 * Check if there are any field errors
 */
export function hasFieldErrors(errors: Record<string, string[]>): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Get all error messages as a single array
 */
export function getAllErrorMessages(parsedErrors: ParsedErrors): string[] {
  const messages: string[] = [];

  // Add field errors
  Object.values(parsedErrors.fieldErrors).forEach((fieldErrors) => {
    messages.push(...fieldErrors);
  });

  // Add general errors
  messages.push(...parsedErrors.generalErrors);

  return messages;
}

/**
 * Format error for display in toast/alert
 */
export function formatErrorForDisplay(error: any): string {
  const parsed = parseApiError(error);

  // If there are specific field errors, show them
  if (hasFieldErrors(parsed.fieldErrors)) {
    const firstField = Object.keys(parsed.fieldErrors)[0];
    return parsed.fieldErrors[firstField][0];
  }

  // Otherwise show general error
  if (parsed.generalErrors.length > 0) {
    return parsed.generalErrors[0];
  }

  // Fallback
  return 'An error occurred. Please try again.';
}
