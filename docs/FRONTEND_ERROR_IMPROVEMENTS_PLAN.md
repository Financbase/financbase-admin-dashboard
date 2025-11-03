# Frontend Error Handling Improvements Plan

**Status**: Pending  
**Priority**: Medium (P2)  
**Estimated Effort**: 1 week

## Overview

This document outlines improvements needed for frontend error handling, specifically addressing gaps identified in `FRONTEND_ERROR_HANDLING_AUDIT.md`.

## Current State

### Existing Error Handling

1. **Toast Notifications** (`lib/utils/toast-notifications.ts`)
   - ✅ Handles API errors with toast messages
   - ✅ Distinguishes between 401, 500, and network errors
   - ❌ Does NOT handle 400 validation errors specifically
   - ❌ Limited error detail display
   - ❌ No persistent error pages for critical failures

2. **Error Boundaries** (`components/core/error-boundary.tsx`)
   - ✅ Handles React component errors
   - ❌ Does NOT catch API fetch errors
   - ❌ Only catches rendering/component errors

3. **Form Error Handling** (`hooks/use-form-submission.ts`)
   - ✅ Shows toast notifications
   - ❌ No inline validation error display
   - ❌ Generic error messages only

## Required Improvements

### 1. Inline Form Validation Errors

**Component**: Create `components/forms/InlineError.tsx`

```typescript
interface InlineErrorProps {
  error?: string | string[];
  field?: string;
}

export function InlineError({ error, field }: InlineErrorProps) {
  if (!error) return null;
  
  const errors = Array.isArray(error) ? error : [error];
  
  return (
    <div className="mt-1 text-sm text-red-600">
      {errors.map((err, i) => (
        <div key={i}>{err}</div>
      ))}
    </div>
  );
}
```

**Integration**: Update all form components to use inline errors

### 2. Field-Level Validation Errors

**Enhancement**: Parse Zod validation errors and display per field

```typescript
// utils/error-parser.ts
export function parseValidationErrors(error: ApiError): Record<string, string[]> {
  if (error.code !== 'VALIDATION_ERROR' || !error.details) {
    return {};
  }
  
  const fieldErrors: Record<string, string[]> = {};
  
  // Parse Zod error format
  error.details.forEach((err: any) => {
    const field = err.path?.join('.') || 'root';
    if (!fieldErrors[field]) {
      fieldErrors[field] = [];
    }
    fieldErrors[field].push(err.message);
  });
  
  return fieldErrors;
}
```

### 3. Enhanced Error Pages

**Create**: `app/(dashboard)/errors/api-error/page.tsx`

```typescript
export default function ApiErrorPage() {
  // Display detailed API error information
  // Allow retry actions
  // Show error codes and request IDs
}
```

### 4. Form Error Integration

**Update**: All form hooks to use inline errors

**Example**:
```typescript
const { errors, setFieldError } = useForm<FormData>();

// Display errors inline
<Input
  {...register('email')}
  error={errors.email?.message}
/>

// Show validation errors from API
{validationErrors.email && (
  <InlineError error={validationErrors.email} field="email" />
)}
```

## Implementation Plan

### Phase 1: Core Components (Days 1-2)

1. **Create InlineError Component**
   - `components/forms/inline-error.tsx`
   - Support single and multiple errors
   - Styled with Tailwind

2. **Create Error Parser Utility**
   - `lib/utils/error-parser.ts`
   - Parse API error responses
   - Extract field-level errors
   - Handle different error formats

3. **Enhance Toast Notifications**
   - Add validation error handling
   - Show field-level errors in toast
   - Add dismissible error details

### Phase 2: Form Integration (Days 3-4)

1. **Update Form Hooks**
   - `hooks/use-form-submission.ts`
   - Parse and display validation errors
   - Set field-level errors

2. **Update Form Components**
   - Add InlineError to all input fields
   - Connect to form state
   - Show server-side validation errors

### Phase 3: Error Pages (Day 5)

1. **Create API Error Page**
   - `app/(dashboard)/errors/api-error/page.tsx`
   - Display detailed error information
   - Retry actions
   - Error reporting

2. **Enhance Error Boundaries**
   - Catch API errors in error boundaries
   - Display user-friendly error pages
   - Add recovery actions

### Phase 4: Testing and Refinement (Days 6-7)

1. **Test Error Scenarios**
   - Validation errors (400)
   - Authentication errors (401)
   - Server errors (500)
   - Network errors

2. **Update Documentation**
   - Error handling patterns
   - Component usage examples

## Components to Update

### Forms
- [ ] `components/forms/*` - All form components
- [ ] `hooks/use-form-submission.ts` - Form submission hook
- [ ] `lib/utils/toast-notifications.ts` - Toast utilities

### Error Display
- [ ] `components/core/error-boundary.tsx` - Error boundaries
- [ ] `app/error.tsx` - Global error page
- [ ] `app/(dashboard)/error.tsx` - Dashboard error page

### Utilities
- [ ] `lib/utils/error-parser.ts` - Error parsing (new)
- [ ] `components/forms/inline-error.tsx` - Inline errors (new)

## Success Criteria

- [ ] All forms display inline validation errors
- [ ] Field-level errors from API responses are shown
- [ ] Error pages provide actionable information
- [ ] Consistent error handling across the application
- [ ] User-friendly error messages
- [ ] Error recovery options available

## Related Documentation

- [Frontend Error Handling Audit](../../FRONTEND_ERROR_HANDLING_AUDIT.md)
- [Error Handling Refactoring Plan](./ERROR_HANDLING_REFACTORING_PLAN.md)
- [API Error Handler](../../lib/api-error-handler.ts)
