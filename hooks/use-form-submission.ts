/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

'use client';

/**
 * Enhanced Form Submission Hook
 * 
 * Provides form submission with improved error handling, validation error display,
 * and loading states.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { parseValidationErrors, formatErrorForDisplay } from '@/lib/utils/error-parser';

interface UseFormSubmissionOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  redirectTo?: string;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  errorMessage?: string; // Added for compatibility
}

interface FormSubmissionState {
  isSubmitting: boolean;
  errors: Record<string, string[]>;
  generalError: string | null;
}

export function useFormSubmission<T = any>(
  submitFn: (data: T) => Promise<Response>,
  options: UseFormSubmissionOptions = {}
) {
  const router = useRouter();
  const [state, setState] = useState<FormSubmissionState>({
    isSubmitting: false,
    errors: {},
    generalError: null,
  });

  const {
    onSuccess,
    onError,
    successMessage = 'Operation completed successfully',
    redirectTo,
    showSuccessToast = true,
    showErrorToast = true,
  } = options;

  const submit = useCallback(
    async (data: T) => {
      setState({
        isSubmitting: true,
        errors: {},
        generalError: null,
      });

      try {
        const response = await submitFn(data);

        // Handle non-JSON responses
        if (!response.headers.get('content-type')?.includes('application/json')) {
          if (response.ok) {
            setState({ isSubmitting: false, errors: {}, generalError: null });
            if (showSuccessToast) {
              toast.success(successMessage);
            }
            if (onSuccess) {
              onSuccess(null);
            }
            if (redirectTo) {
              router.push(redirectTo);
            }
            return { success: true };
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        }

        const result = await response.json();

        // Handle error responses
        if (!response.ok) {
          const errorData = result.error || result;

          // Parse validation errors
          if (response.status === 400 && errorData.code === 'VALIDATION_ERROR') {
            const fieldErrors = parseValidationErrors(errorData);
            setState({
              isSubmitting: false,
              errors: fieldErrors,
              generalError: null,
            });

            if (showErrorToast) {
              toast.error('Validation failed', {
                description: 'Please check the form fields and try again.',
                duration: 6000,
              });
            }

            if (onError) {
              onError(errorData);
            }

            return { success: false, errors: fieldErrors };
          }

          // Handle other errors
          const errorMessage = formatErrorForDisplay(errorData);
          setState({
            isSubmitting: false,
            errors: {},
            generalError: errorMessage,
          });

          if (showErrorToast) {
            toast.error(errorMessage, {
              description: errorData.requestId
                ? `Request ID: ${errorData.requestId}`
                : undefined,
              duration: 5000,
            });
          }

          if (onError) {
            onError(errorData);
          }

          return { success: false, error: errorMessage };
        }

        // Success
        setState({ isSubmitting: false, errors: {}, generalError: null });

        if (showSuccessToast) {
          toast.success(successMessage);
        }

        if (onSuccess) {
          onSuccess(result.data || result);
        }

        if (redirectTo) {
          router.push(redirectTo);
        }

        return { success: true, data: result.data || result };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';

        setState({
          isSubmitting: false,
          errors: {},
          generalError: errorMessage,
        });

        if (showErrorToast) {
          toast.error('Network error', {
            description: 'Please check your connection and try again.',
            duration: 5000,
          });
        }

        if (onError) {
          onError(error);
        }

        return { success: false, error: errorMessage };
      }
    },
    [submitFn, onSuccess, onError, successMessage, redirectTo, showSuccessToast, showErrorToast, router]
  );

  const setFieldError = useCallback((field: string, message: string) => {
    setState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: [message],
      },
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState({
      isSubmitting: false,
      errors: {},
      generalError: null,
    });
  }, []);

  return {
    submit,
    isSubmitting: state.isSubmitting,
    isLoading: state.isSubmitting,
    error: state.generalError,
    errors: state.errors,
    generalError: state.generalError,
    setFieldError,
    clearErrors,
  };
}