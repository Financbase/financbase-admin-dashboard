/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect } from 'vitest'
import {
  parseApiError,
  extractValidationErrors,
  isValidationError,
  isServerError,
  getUserFriendlyMessage,
  createErrorFromFetch,
} from '@/lib/utils/api-error-handler'
import type { ParsedApiError } from '@/lib/utils/api-error-handler'

describe('api-error-handler', () => {
  describe('parseApiError', () => {
    it('should return null for successful response', async () => {
      const response = new Response(JSON.stringify({ data: 'success' }), {
        status: 200,
      })

      const result = await parseApiError(response)

      expect(result).toBeNull()
    })

    it('should parse ApiErrorHandler standardized format', async () => {
      const response = new Response(
        JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: [{ path: ['email'], message: 'Invalid email' }],
            timestamp: '2025-01-01T00:00:00Z',
            requestId: 'req-123',
          },
        }),
        { status: 400 }
      )

      const result = await parseApiError(response)

      expect(result).not.toBeNull()
      expect(result?.code).toBe('VALIDATION_ERROR')
      expect(result?.message).toBe('Validation failed')
      expect(result?.details).toBeDefined()
      expect(result?.timestamp).toBe('2025-01-01T00:00:00Z')
      expect(result?.requestId).toBe('req-123')
    })

    it('should parse legacy error format', async () => {
      const response = new Response(
        JSON.stringify({
          error: 'Invalid request',
          code: 'BAD_REQUEST',
          details: { field: 'email' },
        }),
        { status: 400 }
      )

      const result = await parseApiError(response)

      expect(result).not.toBeNull()
      // The implementation uses data.code if present, otherwise falls back to status-based code
      expect(result?.code).toBe('BAD_REQUEST') // data.code is present, so it should use it
      expect(result?.message).toBe('Invalid request')
    })

    it('should parse legacy error object format', async () => {
      const response = new Response(
        JSON.stringify({
          error: {
            message: 'Error message',
            code: 'BAD_REQUEST', // Add code to error object to match expected behavior
          },
        }),
        { status: 400 }
      )

      const result = await parseApiError(response)

      expect(result).not.toBeNull()
      // When error is an object, the implementation uses data.error.code if present
      expect(result?.code).toBe('BAD_REQUEST')
      expect(result?.message).toBe('Error message')
    })

    it('should return fallback error for unexpected format', async () => {
      const response = new Response(JSON.stringify({}), { status: 500 })

      const result = await parseApiError(response)

      expect(result).not.toBeNull()
      expect(result?.code).toBe('INTERNAL_SERVER_ERROR')
      expect(result?.message).toBe('An error occurred')
    })

    it('should handle JSON parse errors', async () => {
      const response = new Response('Invalid JSON', { status: 500 })

      const result = await parseApiError(response)

      expect(result).not.toBeNull()
      expect(result?.code).toBe('INTERNAL_SERVER_ERROR')
      expect(result?.message).toContain('Request failed with status 500')
    })

    it('should set BAD_REQUEST for 4xx status codes', async () => {
      const response = new Response(JSON.stringify({}), { status: 400 })

      const result = await parseApiError(response)

      expect(result?.code).toBe('BAD_REQUEST')
    })

    it('should set INTERNAL_SERVER_ERROR for 5xx status codes', async () => {
      const response = new Response(JSON.stringify({}), { status: 500 })

      const result = await parseApiError(response)

      expect(result?.code).toBe('INTERNAL_SERVER_ERROR')
    })
  })

  describe('extractValidationErrors', () => {
    it('should extract validation errors from VALIDATION_ERROR', () => {
      const error: ParsedApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [
          { path: ['email'], message: 'Invalid email' },
          { path: ['password'], message: 'Password too short' },
        ],
      }

      const result = extractValidationErrors(error)

      expect(result).toHaveLength(2)
      expect(result[0].path).toEqual(['email'])
      expect(result[0].message).toBe('Invalid email')
    })

    it('should extract validation errors from BAD_REQUEST', () => {
      const error: ParsedApiError = {
        code: 'BAD_REQUEST',
        message: 'Bad request',
        details: [{ path: ['name'], message: 'Name required' }],
      }

      const result = extractValidationErrors(error)

      expect(result).toHaveLength(1)
    })

    it('should return empty array for non-validation errors', () => {
      const error: ParsedApiError = {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Server error',
      }

      const result = extractValidationErrors(error)

      expect(result).toHaveLength(0)
    })

    it('should handle object format details', () => {
      const error: ParsedApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: {
          email: 'Invalid email',
          password: 'Password too short',
        },
      }

      const result = extractValidationErrors(error)

      expect(result).toHaveLength(2)
      expect(result[0].path).toEqual(['email'])
      expect(result[1].path).toEqual(['password'])
    })

    it('should return empty array when no details', () => {
      const error: ParsedApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      }

      const result = extractValidationErrors(error)

      expect(result).toHaveLength(0)
    })
  })

  describe('isValidationError', () => {
    it('should return true for VALIDATION_ERROR', () => {
      const error: ParsedApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      }

      expect(isValidationError(error)).toBe(true)
    })

    it('should return true for BAD_REQUEST', () => {
      const error: ParsedApiError = {
        code: 'BAD_REQUEST',
        message: 'Bad request',
      }

      expect(isValidationError(error)).toBe(true)
    })

    it('should return false for other error codes', () => {
      const error: ParsedApiError = {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Server error',
      }

      expect(isValidationError(error)).toBe(false)
    })
  })

  describe('isServerError', () => {
    it('should return true for INTERNAL_SERVER_ERROR', () => {
      const error: ParsedApiError = {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Server error',
      }

      expect(isServerError(error)).toBe(true)
    })

    it('should return true for DATABASE_ERROR', () => {
      const error: ParsedApiError = {
        code: 'DATABASE_ERROR',
        message: 'Database error',
      }

      expect(isServerError(error)).toBe(true)
    })

    it('should return true for 500+ status codes', () => {
      const error: ParsedApiError = {
        code: 'UNKNOWN_ERROR',
        message: 'Error',
      }

      expect(isServerError(error, 500)).toBe(true)
      expect(isServerError(error, 503)).toBe(true)
    })

    it('should return false for client errors', () => {
      const error: ParsedApiError = {
        code: 'BAD_REQUEST',
        message: 'Bad request',
      }

      expect(isServerError(error, 400)).toBe(false)
    })
  })

  describe('getUserFriendlyMessage', () => {
    it('should return user-friendly message for VALIDATION_ERROR', () => {
      const error: ParsedApiError = {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      }

      const result = getUserFriendlyMessage(error)

      expect(result).toBe('Please check your input and try again')
    })

    it('should return user-friendly message for UNAUTHORIZED', () => {
      const error: ParsedApiError = {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      }

      const result = getUserFriendlyMessage(error)

      expect(result).toBe('You need to sign in to continue')
    })

    it('should return user-friendly message for FORBIDDEN', () => {
      const error: ParsedApiError = {
        code: 'FORBIDDEN',
        message: 'Forbidden',
      }

      const result = getUserFriendlyMessage(error)

      expect(result).toBe("You don't have permission to perform this action")
    })

    it('should return user-friendly message for NOT_FOUND', () => {
      const error: ParsedApiError = {
        code: 'NOT_FOUND',
        message: 'Not found',
      }

      const result = getUserFriendlyMessage(error)

      expect(result).toBe('The requested resource was not found')
    })

    it('should return user-friendly message for RATE_LIMIT_EXCEEDED', () => {
      const error: ParsedApiError = {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Rate limit exceeded',
      }

      const result = getUserFriendlyMessage(error)

      expect(result).toBe('Too many requests. Please try again later')
    })

    it('should return error message for unknown codes', () => {
      const error: ParsedApiError = {
        code: 'UNKNOWN_ERROR',
        message: 'Custom error message',
      }

      const result = getUserFriendlyMessage(error)

      expect(result).toBe('Custom error message')
    })

    it('should return fallback message when no message', () => {
      const error: ParsedApiError = {
        code: 'UNKNOWN_ERROR',
        message: '',
      }

      const result = getUserFriendlyMessage(error)

      expect(result).toBe('An unexpected error occurred')
    })
  })

  describe('createErrorFromFetch', () => {
    it('should create NETWORK_ERROR for fetch errors', () => {
      const error = new Error('Failed to fetch')

      const result = createErrorFromFetch(error)

      expect(result.code).toBe('NETWORK_ERROR')
      expect(result.message).toContain('Network error')
    })

    it('should create NETWORK_ERROR for network-related errors', () => {
      // The implementation checks for 'fetch', 'network', or 'Failed to fetch' in the message
      const error = new Error('Network request failed')

      const result = createErrorFromFetch(error)

      // 'Network request failed' contains 'network', so it should return NETWORK_ERROR
      expect(result.code).toBe('NETWORK_ERROR')
    })

    it('should create UNKNOWN_ERROR for generic errors', () => {
      const error = new Error('Something went wrong')

      const result = createErrorFromFetch(error)

      expect(result.code).toBe('UNKNOWN_ERROR')
      expect(result.message).toBe('Something went wrong')
    })

    it('should handle non-Error objects', () => {
      const result = createErrorFromFetch('string error')

      expect(result.code).toBe('UNKNOWN_ERROR')
      expect(result.message).toBe('An unexpected error occurred')
    })

    it('should handle null/undefined', () => {
      const result = createErrorFromFetch(null)

      expect(result.code).toBe('UNKNOWN_ERROR')
      expect(result.message).toBe('An unexpected error occurred')
    })
  })
})

