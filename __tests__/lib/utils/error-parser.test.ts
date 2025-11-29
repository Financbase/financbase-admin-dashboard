import { describe, it, expect } from 'vitest'
import { ZodError, z } from 'zod'
import {
  parseApiError,
  parseValidationErrors,
  getFieldError,
  hasFieldErrors,
  getAllErrorMessages,
  formatErrorForDisplay,
  type ParsedErrors,
} from '@/lib/utils/error-parser'

describe('error-parser', () => {
  describe('parseApiError', () => {
    it('should parse Zod validation errors', () => {
      const schema = z.object({
        email: z.string(),
        password: z.string().min(3),
      })

      let zodError: ZodError | undefined
      try {
        schema.parse({ email: 123, password: 'ab' })
      } catch (error) {
        zodError = error as ZodError
      }

      expect(zodError).toBeDefined()
      const result = parseApiError(zodError!)

      expect(result.fieldErrors).toBeDefined()
      expect(Object.keys(result.fieldErrors).length).toBeGreaterThan(0)
      // Should have errors for both email and password
      const emailErrors = result.fieldErrors.email || result.fieldErrors['email']
      const passwordErrors = result.fieldErrors.password || result.fieldErrors['password']
      expect(emailErrors).toBeDefined()
      expect(passwordErrors).toBeDefined()
      expect(result.generalErrors).toEqual([])
    })

    it('should handle nested field paths in Zod errors', () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string(),
          }),
        }),
      })

      let zodError: ZodError | undefined
      try {
        schema.parse({ user: { profile: { name: 123 } } })
      } catch (error) {
        zodError = error as ZodError
      }

      expect(zodError).toBeDefined()
      const result = parseApiError(zodError!)

      expect(result.fieldErrors).toBeDefined()
      expect(Object.keys(result.fieldErrors).length).toBeGreaterThan(0)
      // Should contain nested path
      const hasNestedPath = Object.keys(result.fieldErrors).some(key => key.includes('user'))
      expect(hasNestedPath).toBe(true)
    })

    it('should parse API validation errors with details array', () => {
      const apiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: [
            {
              path: ['email'],
              message: 'Invalid email format',
            },
            {
              path: ['password'],
              message: 'Password too short',
            },
          ],
        },
      }

      const result = parseApiError(apiError)

      expect(result.fieldErrors).toEqual({
        email: ['Invalid email format'],
        password: ['Password too short'],
      })
      expect(result.generalErrors).toEqual([])
    })

    it('should handle validation errors with nested paths', () => {
      const apiError = {
        error: {
          code: 'VALIDATION_ERROR',
          details: [
            {
              path: ['user', 'email'],
              message: 'Invalid email',
            },
          ],
        },
      }

      const result = parseApiError(apiError)

      expect(result.fieldErrors).toEqual({
        'user.email': ['Invalid email'],
      })
    })

    it('should handle validation errors without path (root level)', () => {
      const apiError = {
        error: {
          code: 'VALIDATION_ERROR',
          details: [
            {
              message: 'Invalid request',
            },
          ],
        },
      }

      const result = parseApiError(apiError)

      expect(result.fieldErrors).toEqual({
        root: ['Invalid request'],
      })
    })

    it('should handle validation errors with missing message', () => {
      const apiError = {
        error: {
          code: 'VALIDATION_ERROR',
          details: [
            {
              path: ['email'],
            },
          ],
        },
      }

      const result = parseApiError(apiError)

      expect(result.fieldErrors).toEqual({
        email: ['Invalid value'],
      })
    })

    it('should parse general API error messages', () => {
      const apiError = {
        error: {
          message: 'Internal server error',
        },
      }

      const result = parseApiError(apiError)

      expect(result.fieldErrors).toEqual({})
      expect(result.generalErrors).toEqual(['Internal server error'])
    })

    it('should handle generic error objects with message', () => {
      const error = {
        message: 'Something went wrong',
      }

      const result = parseApiError(error)

      expect(result.fieldErrors).toEqual({})
      expect(result.generalErrors).toEqual(['Something went wrong'])
    })

    it('should handle Error instances', () => {
      const error = new Error('Network error')

      const result = parseApiError(error)

      expect(result.fieldErrors).toEqual({})
      expect(result.generalErrors).toEqual(['Network error'])
    })

    it('should handle empty or null errors', () => {
      const result1 = parseApiError(null)
      const result2 = parseApiError(undefined)
      const result3 = parseApiError({})

      expect(result1.fieldErrors).toEqual({})
      expect(result1.generalErrors).toEqual([])
      expect(result2.fieldErrors).toEqual({})
      expect(result2.generalErrors).toEqual([])
      expect(result3.fieldErrors).toEqual({})
      expect(result3.generalErrors).toEqual([])
    })

    it('should handle multiple errors for the same field', () => {
      const schema = z.object({
        email: z.string().email(),
      })

      let zodError: ZodError
      try {
        schema.parse({ email: 123 }) // Will trigger invalid_type error
      } catch (error) {
        zodError = error as ZodError
      }

      const result = parseApiError(zodError!)

      expect(result.fieldErrors).toBeDefined()
      expect(Object.keys(result.fieldErrors).length).toBeGreaterThan(0)
      // Check if email field has errors
      const emailErrors = result.fieldErrors.email || result.fieldErrors['email']
      expect(emailErrors).toBeDefined()
      expect(emailErrors!.length).toBeGreaterThan(0)
    })
  })

  describe('parseValidationErrors', () => {
    it('should return only field errors', () => {
      const apiError = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'General error',
          details: [
            {
              path: ['email'],
              message: 'Invalid email',
            },
          ],
        },
      }

      const result = parseValidationErrors(apiError)

      expect(result).toEqual({
        email: ['Invalid email'],
      })
    })

    it('should return empty object when no field errors', () => {
      const error = {
        message: 'General error only',
      }

      const result = parseValidationErrors(error)

      expect(result).toEqual({})
    })
  })

  describe('getFieldError', () => {
    it('should return first error message for a field', () => {
      const errors = {
        email: ['Invalid format', 'Must be unique'],
        password: ['Too short'],
      }

      expect(getFieldError(errors, 'email')).toBe('Invalid format')
      expect(getFieldError(errors, 'password')).toBe('Too short')
    })

    it('should return undefined for non-existent field', () => {
      const errors = {
        email: ['Invalid format'],
      }

      expect(getFieldError(errors, 'password')).toBeUndefined()
    })

    it('should return undefined for empty errors object', () => {
      const errors = {}

      expect(getFieldError(errors, 'email')).toBeUndefined()
    })

    it('should handle nested field paths', () => {
      const errors = {
        'user.email': ['Invalid email'],
        'user.profile.name': ['Name required'],
      }

      expect(getFieldError(errors, 'user.email')).toBe('Invalid email')
      expect(getFieldError(errors, 'user.profile.name')).toBe('Name required')
    })
  })

  describe('hasFieldErrors', () => {
    it('should return true when there are field errors', () => {
      const errors = {
        email: ['Invalid format'],
      }

      expect(hasFieldErrors(errors)).toBe(true)
    })

    it('should return false when there are no field errors', () => {
      const errors = {}

      expect(hasFieldErrors(errors)).toBe(false)
    })

    it('should return true even with empty error arrays', () => {
      const errors = {
        email: [],
      }

      expect(hasFieldErrors(errors)).toBe(true)
    })
  })

  describe('getAllErrorMessages', () => {
    it('should return all error messages from field and general errors', () => {
      const parsedErrors: ParsedErrors = {
        fieldErrors: {
          email: ['Invalid email', 'Must be unique'],
          password: ['Too short'],
        },
        generalErrors: ['Network error', 'Please try again'],
      }

      const messages = getAllErrorMessages(parsedErrors)

      expect(messages).toHaveLength(5)
      expect(messages).toContain('Invalid email')
      expect(messages).toContain('Must be unique')
      expect(messages).toContain('Too short')
      expect(messages).toContain('Network error')
      expect(messages).toContain('Please try again')
    })

    it('should return only general errors when no field errors', () => {
      const parsedErrors: ParsedErrors = {
        fieldErrors: {},
        generalErrors: ['General error'],
      }

      const messages = getAllErrorMessages(parsedErrors)

      expect(messages).toEqual(['General error'])
    })

    it('should return only field errors when no general errors', () => {
      const parsedErrors: ParsedErrors = {
        fieldErrors: {
          email: ['Invalid email'],
        },
        generalErrors: [],
      }

      const messages = getAllErrorMessages(parsedErrors)

      expect(messages).toEqual(['Invalid email'])
    })

    it('should return empty array when no errors', () => {
      const parsedErrors: ParsedErrors = {
        fieldErrors: {},
        generalErrors: [],
      }

      const messages = getAllErrorMessages(parsedErrors)

      expect(messages).toEqual([])
    })
  })

  describe('formatErrorForDisplay', () => {
    it('should return first field error when field errors exist', () => {
      const error = {
        error: {
          code: 'VALIDATION_ERROR',
          details: [
            {
              path: ['email'],
              message: 'Invalid email format',
            },
            {
              path: ['password'],
              message: 'Password too short',
            },
          ],
        },
      }

      const result = formatErrorForDisplay(error)

      expect(result).toBe('Invalid email format')
    })

    it('should return first general error when no field errors', () => {
      const error = {
        error: {
          message: 'Internal server error',
        },
      }

      const result = formatErrorForDisplay(error)

      expect(result).toBe('Internal server error')
    })

    it('should return fallback message when no errors', () => {
      const error = {}

      const result = formatErrorForDisplay(error)

      expect(result).toBe('An error occurred. Please try again.')
    })

    it('should handle generic error objects', () => {
      const error = {
        message: 'Network timeout',
      }

      const result = formatErrorForDisplay(error)

      expect(result).toBe('Network timeout')
    })

    it('should prioritize field errors over general errors', () => {
      const error = {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'General error',
          details: [
            {
              path: ['email'],
              message: 'Field error',
            },
          ],
        },
      }

      const result = formatErrorForDisplay(error)

      expect(result).toBe('Field error')
    })

    it('should handle Zod errors', () => {
      const schema = z.object({
        email: z.string(),
      })

      let zodError: ZodError | undefined
      try {
        schema.parse({ email: 123 })
      } catch (error) {
        zodError = error as ZodError
      }

      expect(zodError).toBeDefined()
      const result = formatErrorForDisplay(zodError!)

      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })
  })
})
