# Edge Runtime Response Standards

## Overview

Routes using Edge runtime (`export const runtime = 'edge'`) must use the Web API `Response` object instead of Next.js `NextResponse` because Edge runtime doesn't support all Node.js APIs.

## Standard Response Format

### For Edge Runtime Routes

```typescript
export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const data = { /* ... */ };
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: { 
        message: error instanceof Error ? error.message : 'Internal server error' 
      } 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
```

### For Node.js Runtime Routes

```typescript
// No runtime export (defaults to Node.js)

export async function GET(req: NextRequest) {
  try {
    const data = { /* ... */ };
    
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return ApiErrorHandler.handle(error);
  }
}
```

## Current Status

### Routes Using Edge Runtime
- `/api/ai/financbase-gpt` - ✅ Correctly using `new Response()`

### Routes Using Standard Response Helpers
- `/api/invoices` - Uses `createSuccessResponse()` which internally uses `NextResponse.json()` ✅
- `/api/blog/*` - Uses `NextResponse.json()` directly ✅
- `/api/tax/*` - Uses `NextResponse.json()` directly ✅

## Notes

1. **Edge Runtime Routes**: Must use `new Response()` with `JSON.stringify()` and proper headers
2. **Node.js Runtime Routes**: Should use `NextResponse.json()` or `createSuccessResponse()` helper
3. **Error Handling**: Edge runtime routes should return JSON error responses with proper status codes
4. **Consistency**: All responses should include proper `Content-Type` headers

## Migration Guide

If you need to convert a route to Edge runtime:

1. Add `export const runtime = 'edge';`
2. Replace `NextResponse.json()` with `new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })`
3. Update error handling to use `new Response()` instead of `ApiErrorHandler` (or create an Edge-compatible error handler)
4. Ensure all dependencies are Edge-compatible (no Node.js-only APIs)

