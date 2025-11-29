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
import { useApiClient } from '@/hooks/use-api-client'
import { parseApiError, isValidationError, isServerError } from '@/lib/utils/api-error-handler'

// Mock Next.js router
const { mockPush, mockReplace, mockPrefetch, mockToastSuccess, mockToastError } = vi.hoisted(() => {
  const push = vi.fn()
  const replace = vi.fn()
  const prefetch = vi.fn()
  const toastSuccess = vi.fn()
  const toastError = vi.fn()
  return { 
    mockPush: push, 
    mockReplace: replace, 
    mockPrefetch: prefetch,
    mockToastSuccess: toastSuccess,
    mockToastError: toastError,
  }
})

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: mockReplace,
    prefetch: mockPrefetch,
  })),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}))

// Mock API error handler
vi.mock('@/lib/utils/api-error-handler', () => {
  const mockParseApiError = vi.fn(async (response: Response) => {
    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      return {
        code: data.error?.code || 'UNKNOWN_ERROR',
        message: data.error?.message || 'An error occurred',
        requestId: data.error?.requestId,
      }
    }
    return null
  })

  const mockIsValidationError = vi.fn((error: any) => error?.code === 'VALIDATION_ERROR')
  const mockIsServerError = vi.fn((error: any, status?: number) => {
    if (status !== undefined) return status >= 500
    return error?.code === 'INTERNAL_SERVER_ERROR' || error?.code === 'DATABASE_ERROR'
  })

  return {
    parseApiError: mockParseApiError,
    createErrorFromFetch: vi.fn((error: any) => ({
      code: 'NETWORK_ERROR',
      message: error.message || 'Network error',
    })),
    isValidationError: mockIsValidationError,
    isServerError: mockIsServerError,
  }
})

// Mock fetch
global.fetch = vi.fn()

describe('useApiClient', () => {
  beforeEach(() => {
    // Clear individual mocks instead of clearAllMocks to preserve router mock
    vi.clearAllMocks()
    global.fetch = vi.fn()
    mockPush.mockClear()
    mockReplace.mockClear()
    mockPrefetch.mockClear()
    mockToastSuccess.mockClear()
    mockToastError.mockClear()
    global.fetch = vi.fn()
    vi.mocked(fetch).mockClear()
  })

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useApiClient())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should make successful API request', async () => {
    const mockData = { id: '123', name: 'Test' }
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => mockData,
    } as Response)

    const { result } = renderHook(() => useApiClient())

    const data = await result.current.request('/api/test')

    expect(data).toEqual(mockData)
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should handle loading state during request', async () => {
    let resolvePromise: (value: any) => void
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })

    vi.mocked(fetch).mockReturnValue(promise as any)

    const { result } = renderHook(() => useApiClient())

    const requestPromise = result.current.request('/api/test')

    // Wait for loading state to update (React state updates are async)
    await waitFor(() => {
      expect(result.current.loading).toBe(true)
    }, { timeout: 3000 })

    resolvePromise!({
      ok: true,
      status: 200,
      headers: { get: () => 'application/json' },
      json: async () => ({ data: 'test' }),
    } as Response)

    await requestPromise

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 3000 })
  })

  it('should handle validation errors', async () => {
    const mockError = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: [],
      },
    }

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      headers: {
        get: () => 'application/json',
      },
      json: async () => mockError,
    } as Response)

    const { result } = renderHook(() => useApiClient())

    const data = await result.current.request('/api/test')

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    expect(data).toBe(null)
    expect(result.current.error?.code).toBe('VALIDATION_ERROR')
  })

  it('should handle server errors', async () => {
    const mockError = {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Server error',
        requestId: 'req-123',
      },
    }

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      headers: {
        get: () => 'application/json',
      },
      json: async () => mockError,
    } as Response)

    const { result } = renderHook(() => useApiClient())

    const data = await result.current.request('/api/test')

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    expect(data).toBe(null)
    expect(result.current.error?.code).toBe('INTERNAL_SERVER_ERROR')
  })

  it('should handle 401 unauthorized errors', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ error: { message: 'Unauthorized' } }),
    } as Response)

    const { result } = renderHook(() => useApiClient())

    await result.current.request('/api/test')

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Session expired', expect.objectContaining({
        description: expect.any(String),
        duration: expect.any(Number),
      }))
    }, { timeout: 3000 })
  })

  it('should handle 403 forbidden errors', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 403,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({ error: { message: 'Forbidden' } }),
    } as Response)

    const { result } = renderHook(() => useApiClient())

    await result.current.request('/api/test')

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Access denied', expect.objectContaining({
        description: expect.any(String),
        duration: expect.any(Number),
      }))
    }, { timeout: 3000 })
  })

  it('should handle network errors', async () => {
    const networkError = new Error('Network request failed')
    vi.mocked(fetch).mockRejectedValue(networkError)

    const { result } = renderHook(() => useApiClient())

    const data = await result.current.request('/api/test')

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    }, { timeout: 3000 })

    expect(data).toBe(null)
    expect(result.current.error?.code).toBe('NETWORK_ERROR')

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith('Network error', expect.objectContaining({
        description: expect.any(String),
        duration: expect.any(Number),
      }))
    }, { timeout: 3000 })
  })

  it('should call onSuccess callback', async () => {
    const mockData = { id: '123' }
    const onSuccess = vi.fn()

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => mockData,
    } as Response)

    const { result } = renderHook(() => useApiClient({ onSuccess }))

    await result.current.request('/api/test')

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(mockData)
    })
  })

  it('should call onError callback', async () => {
    const mockError = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
      },
    }
    const onError = vi.fn()

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      headers: {
        get: () => 'application/json',
      },
      json: async () => mockError,
    } as Response)

    const { result } = renderHook(() => useApiClient({ onError }))

    await result.current.request('/api/test')

    await waitFor(() => {
      expect(onError).toHaveBeenCalled()
    })
  })

  it('should show success toast when successMessage is provided', async () => {
    const mockData = { id: '123' }

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => mockData,
    } as Response)

    const { result } = renderHook(() =>
      useApiClient({ successMessage: 'Operation successful' })
    )

    await result.current.request('/api/test')

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith('Operation successful', expect.objectContaining({
        duration: expect.any(Number),
      }))
    }, { timeout: 3000 })
  })

  it('should not show toast when showToast is false', async () => {
    const mockData = { id: '123' }

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => mockData,
    } as Response)

    const { result } = renderHook(() => useApiClient({ showToast: false }))

    await result.current.request('/api/test')

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    }, { timeout: 3000 })

    expect(mockToastSuccess).not.toHaveBeenCalled()
    expect(mockToastError).not.toHaveBeenCalled()
  })

  it('should redirect on server error when redirectOnServerError is true', async () => {
    const mockError = {
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Server error',
        requestId: 'req-123',
      },
    }

    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      headers: {
        get: () => 'application/json',
      },
      json: async () => mockError,
    } as Response)

    const { result } = renderHook(() =>
      useApiClient({ redirectOnServerError: true })
    )

    await result.current.request('/api/test')

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('/errors/server-error')
      )
    })
  })

  it('should handle non-JSON responses', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'text/plain',
      },
      text: async () => 'Plain text response',
    } as Response)

    const { result } = renderHook(() => useApiClient())

    const data = await result.current.request('/api/test')

    expect(data).toBe('Plain text response')
  })

  it('should clear error', async () => {
    const { result } = renderHook(() => useApiClient())

    // Set an error first (by making a failed request)
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      headers: { get: () => 'application/json' },
      json: async () => ({ error: { message: 'Error' } }),
    } as Response)

    await act(async () => {
      await result.current.request('/api/test')
    })

    await waitFor(() => {
      expect(result.current.error).toBeTruthy()
    })

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBe(null)
  })

  it('should reset loading and error state', () => {
    const { result } = renderHook(() => useApiClient())

    act(() => {
      result.current.reset()
    })

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
  })

  it('should include default headers in request', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useApiClient())

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })

    await result.current.request('/api/test')

    const fetchCall = vi.mocked(fetch).mock.calls[0]
    expect(fetchCall[0]).toBe('/api/test')
    expect(fetchCall[1]?.headers).toBeDefined()
    expect(fetchCall[1]?.headers).toHaveProperty('Content-Type', 'application/json')
  })

  it('should merge custom headers with default headers', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      status: 200,
      headers: {
        get: () => 'application/json',
      },
      json: async () => ({}),
    } as Response)

    const { result } = renderHook(() => useApiClient())

    await waitFor(() => {
      expect(result.current).toBeDefined()
    })

    await result.current.request('/api/test', {
      headers: {
        'Authorization': 'Bearer token',
      },
    })

    const fetchCall = vi.mocked(fetch).mock.calls[0]
    expect(fetchCall[0]).toBe('/api/test')
    expect(fetchCall[1]?.headers).toBeDefined()
    expect(fetchCall[1]?.headers).toHaveProperty('Content-Type', 'application/json')
    expect(fetchCall[1]?.headers).toHaveProperty('Authorization', 'Bearer token')
  })
})

