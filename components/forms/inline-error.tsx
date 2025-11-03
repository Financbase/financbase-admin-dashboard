'use client';

import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InlineErrorProps {
  /**
   * Error message(s) to display
   * Can be a single string or array of strings
   */
  error?: string | string[];

  /**
   * Field name for accessibility
   */
  field?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Show icon
   */
  showIcon?: boolean;
}

/**
 * InlineError Component
 * 
 * Displays validation errors inline below form fields.
 * Supports single or multiple error messages.
 * 
 * @example
 * <InlineError error="Email is required" field="email" />
 * 
 * @example
 * <InlineError error={["Email is required", "Email must be valid"]} />
 */
export function InlineError({
  error,
  field,
  className,
  showIcon = true,
}: InlineErrorProps) {
  if (!error) {
    return null;
  }

  const errors = Array.isArray(error) ? error : [error];
  const fieldId = field ? `${field}-error` : undefined;

  return (
    <div
      id={fieldId}
      role="alert"
      aria-live="polite"
      className={cn('mt-1 flex items-start gap-1.5 text-sm text-red-600', className)}
    >
      {showIcon && (
        <AlertCircle
          className="h-4 w-4 shrink-0"
          aria-hidden="true"
        />
      )}
      <div className="flex-1">
        {errors.map((err, index) => (
          <div key={index} className="block">
            {err}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * FieldError Component
 * 
 * Simplified version for use with react-hook-form and other form libraries.
 */
export function FieldError({ error, field }: { error?: string; field?: string }) {
  return <InlineError error={error} field={field} />;
}
