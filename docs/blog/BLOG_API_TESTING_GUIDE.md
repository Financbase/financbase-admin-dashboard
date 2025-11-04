# Blog API Testing Guide

## Overview

This guide explains how to test the blog API endpoints with proper authentication using Clerk.

## Prerequisites

1. Development server running on `http://localhost:3000`
2. Clerk authentication configured in `.env.local`
3. Admin user account with proper permissions

## Authentication Setup

Clerk uses **session cookies** for authentication, not Bearer tokens. To test authenticated endpoints:

### Option 1: Browser-Based Testing (Recommended)

1. **Login to your app:**
   ```
   http://localhost:3000
   ```

2. **Open Developer Tools (F12)**

3. **Get your session cookie:**
   - Go to **Application** tab → **Cookies** → `http://localhost:3000`
   - Find `__session` or `__clerk_session` cookie
   - Copy the full cookie value

4. **Use in curl:**
   ```bash
   curl -X POST http://localhost:3000/api/blog \
     -H "Content-Type: application/json" \
     -H "Cookie: __session=your-cookie-value-here" \
     -d '{"title":"Test Post","content":"Test content"}'
   ```

### Option 2: Browser DevTools Console

Test directly in the browser console:

```javascript
// Test GET endpoint
fetch('/api/blog/categories')
  .then(r => r.json())
  .then(console.log);

// Test POST endpoint (requires admin)
fetch('/api/blog', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Test Post',
    content: 'Test content',
    status: 'draft'
  })
})
  .then(r => r.json())
  .then(console.log);
```

## Testing Error Handling (400 Errors)

### Test 1: Malformed JSON

**Expected:** 400 Bad Request with message "Invalid JSON in request body"

```bash
# POST /api/blog
curl -X POST http://localhost:3000/api/blog \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=your-cookie" \
  -d 'invalid json{'

# PUT /api/blog/[id]
curl -X PUT http://localhost:3000/api/blog/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=your-cookie" \
  -d 'invalid json{'

# POST /api/blog/categories
curl -X POST http://localhost:3000/api/blog/categories \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=your-cookie" \
  -d 'invalid json{'
```

**Expected Response:**
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid JSON in request body",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```
**Status:** 400

### Test 2: Invalid ID Format

**Expected:** 400 Bad Request with message "Invalid blog post ID"

```bash
# PUT /api/blog/[id] with non-numeric ID
curl -X PUT http://localhost:3000/api/blog/abc \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=your-cookie" \
  -d '{"title":"Test"}'

# DELETE /api/blog/[id] with non-numeric ID
curl -X DELETE http://localhost:3000/api/blog/xyz \
  -H "Cookie: __session=your-cookie"

# POST /api/blog/[id]/publish with non-numeric ID
curl -X POST http://localhost:3000/api/blog/not-a-number/publish \
  -H "Cookie: __session=your-cookie"
```

**Expected Response:**
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid blog post ID",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```
**Status:** 400

### Test 3: Validation Errors

**Expected:** 400 Bad Request with validation details

```bash
# POST /api/blog with missing required fields
curl -X POST http://localhost:3000/api/blog \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=your-cookie" \
  -d '{"content":"Test"}'  # Missing 'title'
```

**Expected Response:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "path": ["title"],
        "message": "Required"
      }
    ],
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```
**Status:** 400

## Testing Public Endpoints (No Auth Required)

### GET /api/blog/categories

```bash
curl http://localhost:3000/api/blog/categories
```

**Expected:** 200 OK with array of categories

### GET /api/blog?status=published

```bash
curl "http://localhost:3000/api/blog?status=published"
```

**Expected:** 200 OK with array of published posts

### GET /api/blog/[slug]

```bash
curl http://localhost:3000/api/blog/my-blog-post-slug
```

**Expected:** 200 OK with post data (if published)

## Testing Authenticated Endpoints (Admin Required)

All POST, PUT, DELETE operations require admin authentication.

### Create Blog Post

```bash
curl -X POST http://localhost:3000/api/blog \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=your-cookie" \
  -d '{
    "title": "My New Blog Post",
    "slug": "my-new-blog-post",
    "content": "This is the content of my blog post.",
    "excerpt": "Short description",
    "status": "draft",
    "categoryId": 1
  }'
```

### Update Blog Post

```bash
curl -X PUT http://localhost:3000/api/blog/1 \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=your-cookie" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content"
  }'
```

### Delete Blog Post

```bash
curl -X DELETE http://localhost:3000/api/blog/1 \
  -H "Cookie: __session=your-cookie"
```

## Error Response Codes Reference

| Code | Meaning | Example |
|------|---------|---------|
| 400 | Bad Request | Malformed JSON, invalid ID format, validation errors |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not admin |
| 404 | Not Found | Blog post doesn't exist |
| 500 | Internal Server Error | Server-side error (should not occur for client errors) |

## Verification Checklist

- [x] JSON parse errors return 400 (not 500)
- [x] Invalid ID formats return 400 (not 500)
- [x] Validation errors return 400 with details
- [x] All error responses include proper structure
- [x] Public endpoints work without authentication
- [x] Admin endpoints require authentication
- [x] Error messages are user-friendly

## Quick Test Script

Save this as `quick-test.sh`:

```bash
#!/bin/bash
COOKIE="__session=your-cookie-value"

echo "Testing malformed JSON..."
curl -s -w "\nStatus: %{http_code}\n" -X POST http://localhost:3000/api/blog \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d 'invalid{' | jq .

echo -e "\nTesting invalid ID..."
curl -s -w "\nStatus: %{http_code}\n" -X PUT http://localhost:3000/api/blog/abc \
  -H "Content-Type: application/json" \
  -H "Cookie: $COOKIE" \
  -d '{"title":"Test"}' | jq .
```

## Notes

- All error handling is implemented and verified in code
- The implementation ensures 400 errors are returned for client-side errors
- Server-side errors (500) should only occur for unexpected issues
- Authentication is required for all write operations (POST, PUT, DELETE)
- Public read operations (GET) work without authentication for published content

---

**Status:** ✅ All error handling fixes implemented and ready for testing

