# Frontend Error Handling Audit - API Error Display

**Related to:** ERROR_AUDIT_REPORT.md (API routes with 400/500 status codes)  
**Scope:** Frontend handling of API errors (400/500 responses)  
**Date:** Generated after API error audit

---

## Current State Analysis

### Existing Error Pages

✅ **Next.js Error Pages Exist:**

- `app/error.tsx` - Handles React component runtime errors
- `app/(dashboard)/error.tsx` - Dashboard-specific error boundary
- `app/not-found.tsx` - Handles 404 page not found
- `app/global-error.tsx` - Handles global application errors

**Note:** These Next.js error pages handle **React component errors**, not **API response errors**.

---

## The Gap: API Error Display

### Current Frontend Error Handling

The codebase has **some** API error handling, but it's **inconsistent**:

1. **Toast Notifications** (`lib/utils/toast-notifications.ts`)
   - ✅ Handles API errors with toast messages
   - ✅ Distinguishes between 401, 500, and network errors
   - ❌ **Does NOT handle 400 errors specifically**
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

---

## The Problem

### API 400/500 Errors Are Not User-Friendly

When API routes return 400/500 errors:

1. **400 Errors (Bad Request / Validation):**
   - Currently: Toast notification with generic message
   - Missing:
     - Inline form validation error display
     - Detailed field-level error messages
     - Persistent error state in forms
     - User-friendly error pages for critical validation failures

2. **500 Errors (Server Errors):**
   - Currently: Generic "Server error" toast
   - Missing:
     - Retry mechanisms
     - Error reporting UI
     - Request ID display for support
     - Dedicated error pages for critical failures

3. **Inconsistent Error Display:**
   - Some components show toasts
   - Some components show inline errors
   - No standardized error UI patterns

---

## Recommendations

### Priority 1: Enhance API Error Handling

#### 1.1 Improve `handleApiError` to Handle 400 Errors

**Current Implementation:**

```typescript
export const handleApiError = (error: Error | unknown, context: string = 'dashboard') => {
  // ... only handles 401, 500, and generic errors
  // MISSING: 400 error handling
};
```

**Recommended Enhancement:**

```typescript
export const handleApiError = (error: Error | unknown, context: string = 'dashboard') => {
  // ... existing code ...
  
  if (apiError.response?.status === 400) {
    // Parse API error response
    const errorData = await apiError.response.json().catch(() => ({}));
    
    // Handle validation errors with details
    if (errorData.error?.code === 'VALIDATION_ERROR' && errorData.error?.details) {
      return {
        type: 'validation',
        errors: errorData.error.details,
        message: errorData.error.message || 'Validation failed'
      };
    }
    
    // Handle other 400 errors
    return {
      type: 'badRequest',
      message: errorData.error?.message || 'Invalid request'
    };
  }
};
```

#### 1.2 Create Standardized API Error Response Handler

Create a utility that:

- Parses standardized API error responses (`ApiErrorHandler` format)
- Extracts validation errors for form display
- Handles different error codes appropriately
- Shows appropriate UI based on error type

**File:** `lib/utils/api-error-handler.ts` (client-side)

```typescript
import { ApiError } from '@/lib/api-error-handler'; // Import type, not class

export interface ParsedApiError {
  code: string;
  message: string;
  details?: any;
  timestamp?: string;
  requestId?: string;
}

export async function parseApiError(response: Response): Promise<ParsedApiError | null> {
  try {
    const data = await response.json();
    
    // Handle ApiErrorHandler format
    if (data.error && typeof data.error === 'object') {
      return {
        code: data.error.code || 'UNKNOWN_ERROR',
        message: data.error.message || 'An error occurred',
        details: data.error.details,
        timestamp: data.error.timestamp,
        requestId: data.error.requestId,
      };
    }
    
    // Handle legacy formats
    if (data.error) {
      return {
        code: data.code || 'UNKNOWN_ERROR',
        message: typeof data.error === 'string' ? data.error : data.error.message || 'An error occurred',
        details: data.details,
      };
    }
    
    return null;
  } catch {
    return {
      code: 'PARSE_ERROR',
      message: 'Failed to parse error response',
    };
  }
}
```

#### 1.3 Create Form Error Display Component

**File:** `components/forms/form-error-display.tsx`

```typescript
'use client';

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ValidationError {
  path: (string | number)[];
  message: string;
}

interface FormErrorDisplayProps {
  errors?: ValidationError[];
  message?: string;
  className?: string;
}

export function FormErrorDisplay({ errors, message, className }: FormErrorDisplayProps) {
  if (!errors && !message) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{message || 'Validation Errors'}</AlertTitle>
      <AlertDescription>
        {errors && errors.length > 0 && (
          <ul className="list-disc list-inside mt-2 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>
                <strong>{error.path.join('.')}:</strong> {error.message}
              </li>
            ))}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}
```

---

### Priority 2: Create API Error Pages (Optional but Recommended)

#### 2.1 Critical Error Page for 500 Errors

**File:** `app/(dashboard)/errors/server-error/page.tsx`

For critical 500 errors that prevent page functionality:

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ServerErrorPage() {
  const searchParams = useSearchParams();
  const requestId = searchParams.get('requestId');
  const errorCode = searchParams.get('code') || 'INTERNAL_SERVER_ERROR';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Server Error</CardTitle>
          <CardDescription>
            We encountered an error while processing your request.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requestId && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs font-mono text-muted-foreground">
                Request ID: {requestId}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Please include this ID when contacting support.
              </p>
            </div>
          
          <div className="flex flex-col gap-2">
            <Button onClick={() => window.location.reload()} className="w-full">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/help-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Support
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

#### 2.2 Bad Request Error Page for 400 Errors (Optional)

**File:** `app/(dashboard)/errors/bad-request/page.tsx`

For critical 400 errors (usually handled inline in forms, but useful for direct API access):

```typescript
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function BadRequestPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Invalid request';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
            <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl">Invalid Request</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button variant="outline" onClick={() => window.history.back()} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
            <Button variant="outline" asChild className="w-full">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

### Priority 3: Standardize Error Handling Across Components

#### 3.1 Create Enhanced API Client Hook

**File:** `hooks/use-api-client.ts`

```typescript
import { useState, useCallback } from 'react';
import { parseApiError, ParsedApiError } from '@/lib/utils/api-error-handler';
import { toast } from 'sonner';

interface UseApiClientOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ParsedApiError) => void;
  showToast?: boolean;
}

export function useApiClient<T = any>(options: UseApiClientOptions = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ParsedApiError | null>(null);

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
          
          if (options.onError) {
            options.onError(apiError);
          }
          
          if (options.showToast !== false) {
            // Show appropriate toast based on error type
            if (apiError.code === 'VALIDATION_ERROR') {
              toast.error('Validation failed', {
                description: apiError.message,
              });
            } else if (response.status >= 500) {
              toast.error('Server error', {
                description: apiError.requestId 
                  ? `Request ID: ${apiError.requestId}` 
                  : apiError.message,
              });
            } else {
              toast.error(apiError.message || 'An error occurred');
            }
          }
        }
        
        return null;
      }

      const data = await response.json();
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
      
      return data;
    } catch (err) {
      const networkError: ParsedApiError = {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
      };
      
      setError(networkError);
      
      if (options.showToast !== false) {
        toast.error('Network error', {
          description: 'Please check your internet connection.',
        });
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [options]);

  return { request, loading, error, clearError: () => setError(null) };
}
```

---

## Implementation Plan

### Phase 1: Enhance Current Error Handling (Week 1)

1. ✅ Update `handleApiError` to handle 400 errors
2. ✅ Create `parseApiError` utility function
3. ✅ Create `FormErrorDisplay` component
4. ✅ Update `use-form-submission.ts` to use new error handling

### Phase 2: Create Error Pages (Week 1-2)

1. ✅ Create `/errors/server-error` page
2. ⚠️ Create `/errors/bad-request` page (optional, low priority)
3. ✅ Add redirect logic for critical API failures

### Phase 3: Standardize Components (Week 2-3)

1. ✅ Create `use-api-client` hook
2. ✅ Migrate components to use standardized error handling
3. ✅ Add error boundary improvements

---

## Key Points

### What We DON'T Need

- ❌ **HTTP status code pages** (like `/400`, `/500`) - These are not user-facing
- ❌ **Separate pages for every API route** - Forms handle errors inline
- ❌ **Duplicate Next.js error pages** - Existing error.tsx handles component errors

### What We DO Need

- ✅ **Enhanced API error parsing** - Handle standardized error responses
- ✅ **Better form error display** - Show validation errors inline
- ✅ **Critical error pages** - For 500 errors that prevent functionality
- ✅ **Standardized error handling hooks** - Consistent error UI across components

---

## Migration Strategy

### For Existing Components

1. **Forms with API calls:**

   ```typescript
   // Before
   catch (error) {
     toast.error('Failed to save');
   }
   
   // After
   const { request, error, loading } = useApiClient({
     onSuccess: () => router.push('/success'),
     showToast: true,
   });
   
   // In JSX
   {error && error.code === 'VALIDATION_ERROR' && (
     <FormErrorDisplay errors={error.details} message={error.message} />
   )}
   ```

2. **Components fetching data:**

   ```typescript
   // Before
   const response = await fetch('/api/data');
   if (!response.ok) {
     // Generic error handling
   }
   
   // After
   const { request, error, loading } = useApiClient();
   const data = await request('/api/data');
   ```

---

## Conclusion

**The 174 API routes with 400/500 status codes don't need "missing pages"** - they need:

1. ✅ **Better frontend error handling** to parse and display these errors
2. ✅ **Standardized error UI components** for consistent user experience  
3. ✅ **Critical error pages** only for server errors that prevent functionality
4. ✅ **Enhanced form validation display** for 400 validation errors

The error pages (error.tsx, not-found.tsx) already exist and handle React component errors appropriately. The gap is in **how API errors are displayed to users**, not in missing page routes.

---

**Recommendation:** Focus on enhancing frontend error handling utilities and components rather than creating status code pages.
