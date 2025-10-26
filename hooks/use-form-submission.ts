import { useState, useCallback } from 'react';
import { toast } from '@/lib/toast';

interface UseFormSubmissionOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useFormSubmission<T = any>(
  submitFn: (data: T) => Promise<any>,
  options: UseFormSubmissionOptions = {}
) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: T) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await submitFn(data);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      if (options.successMessage) {
        toast.success(options.successMessage);
      }
      
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      
      if (options.onError) {
        options.onError(err);
      }
      
      if (options.errorMessage) {
        toast.error(options.errorMessage, errorMessage);
      } else {
        toast.error('Submission failed', errorMessage);
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [submitFn, options]);

  return {
    submit,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
