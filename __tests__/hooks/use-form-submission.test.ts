/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useFormSubmission } from '@/hooks/use-form-submission'

// Mock Next.js router
const { mockPush, mockReplace, mockPrefetch } = vi.hoisted(() => {
  const push = vi.fn()
  const replace = vi.fn()
  const prefetch = vi.fn()
  return { mockPush: push, mockReplace: replace, mockPrefetch: prefetch }
})

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
  })),
}))

// Mock sonner toast
const { mockToastSuccess, mockToastError } = vi.hoisted(() => {
  const success = vi.fn()
  const error = vi.fn()
  return { mockToastSuccess: success, mockToastError: error }
})

vi.mock('sonner', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}))

// Mock error parser
vi.mock('@/lib/utils/error-parser', () => ({
  parseValidationErrors: vi.fn((error) => {
    if (error.details) {
      return error.details.reduce((acc: any, detail: any) => {
        const field = detail.path?.join('.') || 'root'
        acc[field] = [detail.message || 'Invalid value']
        return acc
      }, {})
    }
    return {}
  }),
  formatErrorForDisplay: vi.fn((error) => error.message || 'An error occurred'),
}))

describe('useFormSubmission', () => {
  const mockSubmitFn = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockPush.mockClear()
    mockReplace.mockClear()
    mockPrefetch.mockClear()
    mockToastSuccess.mockClear()
    mockToastError.mockClear()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useFormSubmission(mockSubmitFn))

    expect(result.current.isSubmitting).toBe(false)
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.errors).toEqual({})
    expect(result.current.generalError).toBe(null)
  })

  it('should handle successful form submission', async () => {
    const mockData = { name: 'Test', email: 'test@example.com' }
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      json: async () => ({ data: { id: '123' } }),
    }

    mockSubmitFn.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useFormSubmission(mockSubmitFn))

    let submitResult: any
    await act(async () => {
      submitResult = await result.current.submit(mockData)
    })

    await act(async () => {
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })

    expect(submitResult.success).toBe(true)
    expect(mockSubmitFn).toHaveBeenCalledWith(mockData)
  })

  it('should handle validation errors', async () => {
    const mockData = { name: '', email: 'invalid' }
    const mockResponse = {
      ok: false,
      status: 400,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      json: async () => ({
        error: {
          code: 'VALIDATION_ERROR',
          details: [
            { path: ['name'], message: 'Name is required' },
            { path: ['email'], message: 'Invalid email format' },
          ],
        },
      }),
    }

    mockSubmitFn.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useFormSubmission(mockSubmitFn))

    let submitPromise: Promise<any>
    await act(async () => {
      submitPromise = result.current.submit(mockData)
    })

    await act(async () => {
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })

    const submitResult = await submitPromise!

    expect(submitResult.success).toBe(false)
    expect(result.current.errors).toHaveProperty('name')
    expect(result.current.errors).toHaveProperty('email')
  })

  it('should handle general errors', async () => {
    const mockData = { name: 'Test' }
    const mockResponse = {
      ok: false,
      status: 500,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      json: async () => ({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Server error occurred',
        },
      }),
    }

    mockSubmitFn.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useFormSubmission(mockSubmitFn))

    let submitPromise: Promise<any>
    await act(async () => {
      submitPromise = result.current.submit(mockData)
    })

    await act(async () => {
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })

    const submitResult = await submitPromise!

    expect(submitResult.success).toBe(false)
    expect(result.current.generalError).toBeTruthy()
  })

  it('should handle network errors', async () => {
    const mockData = { name: 'Test' }
    const networkError = new Error('Network request failed')

    mockSubmitFn.mockRejectedValue(networkError)

    const { result } = renderHook(() => useFormSubmission(mockSubmitFn))

    let submitPromise: Promise<any>
    await act(async () => {
      submitPromise = result.current.submit(mockData)
    })

    await act(async () => {
      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })

    const submitResult = await submitPromise!

    expect(submitResult.success).toBe(false)
    expect(result.current.generalError).toBe('Network request failed')
  })

  it('should call onSuccess callback on success', async () => {
    const mockData = { name: 'Test' }
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      json: async () => ({ data: { id: '123' } }),
    }
    const onSuccess = vi.fn()

    mockSubmitFn.mockResolvedValue(mockResponse)

    const { result } = renderHook(() =>
      useFormSubmission(mockSubmitFn, { onSuccess })
    )

    await act(async () => {
      await result.current.submit(mockData)
    })

    await act(async () => {
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })
  })

  it('should call onError callback on error', async () => {
    const mockData = { name: 'Test' }
    const mockResponse = {
      ok: false,
      status: 500,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      json: async () => ({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Server error',
        },
      }),
    }
    const onError = vi.fn()

    mockSubmitFn.mockResolvedValue(mockResponse)

    const { result } = renderHook(() =>
      useFormSubmission(mockSubmitFn, { onError })
    )

    await act(async () => {
      await result.current.submit(mockData)
    })

    await act(async () => {
      await waitFor(() => {
        expect(onError).toHaveBeenCalled()
      })
    })
  })

  it('should redirect on success when redirectTo is provided', async () => {
    const mockData = { name: 'Test' }
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      json: async () => ({ data: { id: '123' } }),
    }

    mockPush.mockClear()
    mockSubmitFn.mockResolvedValue(mockResponse)

    const { result } = renderHook(() =>
      useFormSubmission(mockSubmitFn, { redirectTo: '/success' })
    )

    await act(async () => {
      await result.current.submit(mockData)
    })

    await act(async () => {
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/success')
      })
    })
  })

  it('should handle non-JSON responses', async () => {
    const mockData = { name: 'Test' }
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn(() => 'text/plain'),
      },
    }

    mockSubmitFn.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useFormSubmission(mockSubmitFn))

    const submitResult = await result.current.submit(mockData)

    expect(submitResult.success).toBe(true)
  })

  it('should set field error manually', () => {
    const { result } = renderHook(() => useFormSubmission(mockSubmitFn))

    act(() => {
      result.current.setFieldError('email', 'Invalid email')
    })

    expect(result.current.errors.email).toEqual(['Invalid email'])
  })

  it('should clear errors', () => {
    const { result } = renderHook(() => useFormSubmission(mockSubmitFn))

    act(() => {
      result.current.setFieldError('email', 'Invalid email')
      result.current.clearErrors()
    })

    expect(result.current.errors).toEqual({})
    expect(result.current.generalError).toBe(null)
  })

  it('should show success toast by default', async () => {
    const mockData = { name: 'Test' }
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      json: async () => ({ data: { id: '123' } }),
    }

    mockSubmitFn.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useFormSubmission(mockSubmitFn))

    await act(async () => {
      await result.current.submit(mockData)
    })

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('should not show success toast when showSuccessToast is false', async () => {
    const mockData = { name: 'Test' }
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      json: async () => ({ data: { id: '123' } }),
    }

    mockSubmitFn.mockResolvedValue(mockResponse)

    const { result } = renderHook(() =>
      useFormSubmission(mockSubmitFn, { showSuccessToast: false })
    )

    await act(async () => {
      await result.current.submit(mockData)
    })

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false)
    }, { timeout: 3000 })

    // Toast should not be called
    expect(mockToastSuccess).not.toHaveBeenCalled()
  })

  it('should show custom success message', async () => {
    const mockData = { name: 'Test' }
    const mockResponse = {
      ok: true,
      headers: {
        get: vi.fn(() => 'application/json'),
      },
      json: async () => ({ data: { id: '123' } }),
    }

    mockSubmitFn.mockResolvedValue(mockResponse)

    const { result } = renderHook(() =>
      useFormSubmission(mockSubmitFn, { successMessage: 'Custom success message' })
    )

    await act(async () => {
      await result.current.submit(mockData)
    })

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Custom success message')
    }, { timeout: 3000 })
  })

  it('should handle HTTP error status codes', async () => {
    const mockData = { name: 'Test' }
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: {
        get: vi.fn(() => 'text/plain'),
      },
    }

    mockSubmitFn.mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useFormSubmission(mockSubmitFn))

    let submitResult: any
    await act(async () => {
      submitResult = await result.current.submit(mockData)
    })

    await waitFor(() => {
      expect(result.current.isSubmitting).toBe(false)
    }, { timeout: 3000 })

    expect(submitResult.success).toBe(false)
    await waitFor(() => {
      expect(result.current.generalError).toBeTruthy()
      if (result.current.generalError) {
        expect(result.current.generalError).toContain('404')
      }
    }, { timeout: 3000 })
  })
})

