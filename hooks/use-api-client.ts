/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

import { useState, useCallback } from 'react';
import { parseApiError, createErrorFromFetch, type ParsedApiError, isValidationError, isServerError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface UseApiClientOptions {
  /**
   * Callback when request succeeds
   */
  onSuccess?: (data: any) => void;
  
  /**
   * Callback when request fails
   */
  onError?: (error: ParsedApiError, status?: number) => void;
  
  /**
   * Show toast notifications for errors
   */
  showToast?: boolean;
  
  /**
   * Redirect to error page for server errors (500+)
   */
  redirectOnServerError?: boolean;
  
  /**
   * Custom success message for toast
   */
  successMessage?: string;
  
  /**
   * Context for error logging
   */
  context?: string;
}

interface UseApiClientReturn<T> {
  /**
   * Make an API request
   */
  request: (url: string, init?: RequestInit) => Promise<T | null>;
  
  /**
   * Loading state
   */
  loading: boolean;
  
  /**
   * Current error if any
   */
  error: ParsedApiError | null;
  
  /**
   * Clear the current error
   */
  clearError: () => void;
  
  /**
   * Reset loading and error state
   */
  reset: () => void;
}

/**
 * Standardized API client hook with error handling
 * 
 * Provides consistent error handling, loading states, and error parsing
 * for all API requests across the application.
 * 
 * @example
 * ```tsx
 * const { request, loading, error } = useApiClient({
 *   onSuccess: (data) => router.push('/success'),
 *   showToast: true,
 * });
 * 
 * const handleSubmit = async () => {
 *   const data = await request('/api/resource', {
 *     method: 'POST',
 *     body: JSON.stringify(formData),
 *   });
 * };
 * ```
 */
export function useApiClient<T = any>(options: UseApiClientOptions = {}): UseApiClientReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ParsedApiError | null>(null);
  const router = useRouter();

  const {
    onSuccess,
    onError,
    showToast = true,
    redirectOnServerError = false,
    successMessage,
    context = 'api',
  } = options;

  const request = useCallback(async (
    url: string,
    init?: RequestInit
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...init?.headers,
        },
      });

      if (!response.ok) {
        const apiError = await parseApiError(response);
        
        if (apiError) {
          setError(apiError);
          
          // Call error callback
          if (onError) {
            onError(apiError, response.status);
          }
          
          // Show toast notification
          if (showToast) {
            if (isValidationError(apiError)) {
              toast.error('Validation failed', {
                description: apiError.message || 'Please check your input',
                duration: 5000,
              });
            } else if (isServerError(apiError, response.status)) {
              toast.error('Server error', {
                description: apiError.requestId 
                  ? `Error ID: ${apiError.requestId}` 
                  : 'Something went wrong on our end. Please try again later.',
                duration: 7000,
              });

              // Redirect to server error page if enabled
              if (redirectOnServerError) {
                const params = new URLSearchParams();
                if (apiError.requestId) {
                  params.set('requestId', apiError.requestId);
                }
                if (apiError.code) {
                  params.set('code', apiError.code);
                }
                router.push(`/errors/server-error?${params.toString()}`);
                return null;
              }
            } else if (response.status === 401) {
              toast.error('Session expired', {
                description: 'Please sign in again to continue',
                duration: 5000,
              });
            } else if (response.status === 403) {
              toast.error('Access denied', {
                description: 'You don\'t have permission to perform this action',
                duration: 5000,
              });
            } else {
              toast.error(apiError.message || 'An error occurred', {
                description: apiError.requestId ? `Request ID: ${apiError.requestId}` : undefined,
                duration: 5000,
              });
            }
          }
        }
        
        return null;
      }

      // Parse successful response
      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        // For non-JSON responses, return text or blob
        const text = await response.text();
        data = text as T;
      }

      // Call success callback
      if (onSuccess) {
        onSuccess(data);
      }

      // Show success toast if message provided
      if (successMessage && showToast) {
        toast.success(successMessage, {
          duration: 3000,
        });
      }

      return data;
    } catch (err) {
      // Handle network errors and other fetch failures
      const networkError = createErrorFromFetch(err);
      setError(networkError);

      if (onError) {
        onError(networkError);
      }

      if (showToast) {
        toast.error('Network error', {
          description: 'Please check your internet connection and try again',
          duration: 5000,
        });
      }

      // Log error for debugging
      console.error(`[${context}] API request failed:`, err);

      return null;
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError, showToast, redirectOnServerError, successMessage, context, router]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
  }, []);

  return {
    request,
    loading,
    error,
    clearError,
    reset,
  };
}

