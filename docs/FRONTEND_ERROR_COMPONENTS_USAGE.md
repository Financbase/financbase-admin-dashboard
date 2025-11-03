# Frontend Error Components - Usage Guide

## Overview

This guide shows how to use the new error handling components and utilities for improved user experience.

## Components

### InlineError Component

Display validation errors inline below form fields.

**Location**: `components/forms/inline-error.tsx`

#### Basic Usage

```tsx
import { InlineError } from '@/components/forms/inline-error';

function MyForm() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  return (
    <div>
      <input name="email" />
      <InlineError error={errors.email} field="email" />
    </div>
  );
}
```

#### With React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { InlineError } from '@/components/forms/inline-error';

function MyForm() {
  const { register, formState: { errors } } = useForm();

  return (
    <div>
      <input {...register('email')} />
      <InlineError error={errors.email?.message} field="email" />
    </div>
  );
}
```

#### Multiple Errors

```tsx
<InlineError 
  error={['Email is required', 'Email must be valid']} 
  field="email" 
/>
```

### FieldError Component

Simplified version for simple field errors.

```tsx
import { FieldError } from '@/components/forms/inline-error';

<FieldError error={errorMessage} field="email" />
```

## Utilities

### Error Parser

Parse API errors into field-level errors.

**Location**: `lib/utils/error-parser.ts`

```typescript
import { parseValidationErrors, getFieldError } from '@/lib/utils/error-parser';

// Parse API error response
const fieldErrors = parseValidationErrors(apiError);

// Get specific field error
const emailError = getFieldError(fieldErrors, 'email');
```

### Form Submission Hook

Enhanced form submission with error handling.

**Location**: `hooks/use-form-submission.ts`

```typescript
import { useFormSubmission } from '@/hooks/use-form-submission';

function MyForm() {
  const { submit, isSubmitting, errors, generalError } = useFormSubmission(
    async (data) => {
      return fetch('/api/my-endpoint', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    {
      successMessage: 'Form submitted successfully!',
      redirectTo: '/dashboard',
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const result = await submit(Object.fromEntries(formData));
    
    if (!result.success && result.errors) {
      // Errors are automatically set in the hook state
      // Access via: errors object
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" />
      <InlineError error={errors.email} field="email" />
      
      {generalError && (
        <div className="text-red-600">{generalError}</div>
      )}
      
      <button disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

## Error Pages

### API Error Page

Display detailed API errors with recovery options.

**Location**: `app/(dashboard)/errors/api-error/page.tsx`

**Usage**:

```typescript
// Redirect to error page with error details
router.push(`/errors/api-error?error=${encodeURIComponent(JSON.stringify({
  code: 'VALIDATION_ERROR',
  message: 'Invalid input',
  requestId: 'req_123',
}))}&returnUrl=/dashboard`);
```

Or store in session storage:

```typescript
sessionStorage.setItem('apiError', JSON.stringify(errorData));
router.push('/errors/api-error');
```

## Toast Notifications

Enhanced toast notifications with validation error support.

**Location**: `lib/utils/toast-notifications.ts`

```typescript
import { dashboardToasts } from '@/lib/utils/toast-notifications';

// Validation errors
dashboardToasts.error.validationError({
  email: ['Email is required'],
  password: ['Password must be at least 8 characters'],
});

// Bad request
dashboardToasts.error.badRequest('Invalid request format');
```

## Integration Example

Complete example of form with error handling:

```tsx
'use client';

import { useState } from 'react';
import { useFormSubmission } from '@/hooks/use-form-submission';
import { InlineError } from '@/components/forms/inline-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CreateAccountForm() {
  const { submit, isSubmitting, errors, generalError } = useFormSubmission(
    async (data) => {
      return fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    {
      successMessage: 'Account created successfully!',
      redirectTo: '/dashboard/accounts',
    }
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await submit({
      accountName: formData.get('accountName'),
      accountType: formData.get('accountType'),
      openingBalance: parseFloat(formData.get('openingBalance') as string),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="accountName">Account Name</label>
        <Input
          id="accountName"
          name="accountName"
          required
        />
        <InlineError error={errors.accountName} field="accountName" />
      </div>

      <div>
        <label htmlFor="accountType">Account Type</label>
        <select id="accountType" name="accountType" required>
          <option value="">Select type</option>
          <option value="checking">Checking</option>
          <option value="savings">Savings</option>
        </select>
        <InlineError error={errors.accountType} field="accountType" />
      </div>

      {generalError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {generalError}
        </div>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Account'}
      </Button>
    </form>
  );
}
```

## Best Practices

1. **Always show inline errors** for form fields
2. **Use the form submission hook** for consistent error handling
3. **Parse validation errors** from API responses
4. **Display general errors** separately from field errors
5. **Provide recovery actions** on error pages
6. **Use toast notifications** for non-critical errors
7. **Store request IDs** for support purposes

## Migration Guide

### Before

```tsx
const response = await fetch('/api/accounts', { ... });
if (!response.ok) {
  toast.error('Failed to create account');
}
```

### After

```tsx
const { submit, errors } = useFormSubmission(
  (data) => fetch('/api/accounts', {
    method: 'POST',
    body: JSON.stringify(data),
  })
);

// Errors automatically handled and displayed
```

## Related Documentation

- [Error Parser Utilities](../../lib/utils/error-parser.ts)
- [Form Submission Hook](../../hooks/use-form-submission.ts)
- [Frontend Error Improvements Plan](./FRONTEND_ERROR_IMPROVEMENTS_PLAN.md)
- [Error Handling Refactoring Plan](./ERROR_HANDLING_REFACTORING_PLAN.md)
