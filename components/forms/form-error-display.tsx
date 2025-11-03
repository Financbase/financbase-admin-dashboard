'use client';

import { AlertCircle, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { extractValidationErrors, type ParsedApiError } from '@/lib/utils/api-error-handler';
import { cn } from '@/lib/utils';

interface FormErrorDisplayProps {
  /**
   * Parsed API error or raw error details
   */
  error?: ParsedApiError | { message?: string; details?: any; code?: string };
  
  /**
   * Custom error message to display
   */
  message?: string;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Show validation errors in a list format
   */
  showValidationList?: boolean;
  
  /**
   * Compact mode - smaller spacing and text
   */
  compact?: boolean;
}

/**
 * Display API errors in forms, especially validation errors
 * 
 * Automatically extracts and displays validation errors from API responses
 * in a user-friendly format.
 * 
 * @example
 * ```tsx
 * const { request, error } = useApiClient();
 * 
 * // In JSX
 * {error && <FormErrorDisplay error={error} />}
 * ```
 */
export function FormErrorDisplay({
  error,
  message,
  className,
  showValidationList = true,
  compact = false,
}: FormErrorDisplayProps) {
  if (!error && !message) {
    return null;
  }

  // Normalize error format
  let parsedError: ParsedApiError | null = null;
  
  if (error) {
    if ('code' in error && 'message' in error) {
      parsedError = error as ParsedApiError;
    } else {
      // Convert legacy format
      parsedError = {
        code: (error as any).code || 'UNKNOWN_ERROR',
        message: (error as any).message || 'An error occurred',
        details: (error as any).details,
      };
    }
  }

  const displayMessage = message || parsedError?.message || 'An error occurred';
  const validationErrors = parsedError ? extractValidationErrors(parsedError) : [];

  // Show validation errors in detail if available
  if (validationErrors.length > 0 && showValidationList) {
    return (
      <Alert variant="destructive" className={cn(compact && "py-2", className)}>
        <AlertCircle className={cn("h-4 w-4", compact && "h-3 w-3")} />
        <AlertTitle className={cn(compact && "text-sm")}>
          {displayMessage}
        </AlertTitle>
        <AlertDescription>
          <ul className={cn(
            "list-disc list-inside mt-2 space-y-1",
            compact && "text-xs space-y-0.5"
          )}>
            {validationErrors.map((err, index) => {
              const fieldName = err.path.length > 0 
                ? err.path[err.path.length - 1] 
                : 'Field';
              const displayFieldName = String(fieldName)
                .split(/(?=[A-Z])/)
                .join(' ')
                .toLowerCase()
                .replace(/^\w/, c => c.toUpperCase());
              
              return (
                <li key={index} className={cn(compact && "text-xs")}>
                  <strong>{displayFieldName}:</strong> {err.message}
                </li>
              );
            })}
          </ul>
        </AlertDescription>
      </Alert>
    );
  }

  // Show generic error message
  return (
    <Alert variant="destructive" className={cn(compact && "py-2", className)}>
      <AlertTriangle className={cn("h-4 w-4", compact && "h-3 w-3")} />
      <AlertTitle className={cn(compact && "text-sm")}>
        {displayMessage}
      </AlertTitle>
      {parsedError?.requestId && (
        <AlertDescription className={cn("text-xs mt-1", compact && "text-xs")}>
          Request ID: <code className="font-mono">{parsedError.requestId}</code>
        </AlertDescription>
      )}
    </Alert>
  );
}

/**
 * Inline field error display component
 * Use this for individual form fields
 */
interface FieldErrorDisplayProps {
  error?: string;
  className?: string;
}

export function FieldErrorDisplay({ error, className }: FieldErrorDisplayProps) {
  if (!error) return null;

  return (
    <p className={cn("text-sm text-destructive mt-1", className)}>
      {error}
    </p>
  );
}

