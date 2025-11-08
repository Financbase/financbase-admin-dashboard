# Direct File Exports API Testing Guide

## Overview

This guide covers testing the Direct File Exports API endpoints that were implemented to complete the 3 remaining TODOs.

## Endpoints

1. **GET** `/api/tax/direct-file/exports` - Fetch export history
2. **POST** `/api/tax/direct-file/exports` - Create new export metadata
3. **DELETE** `/api/tax/direct-file/exports/{id}` - Delete export metadata

## Prerequisites

1. Development server running: `pnpm dev`
2. Authenticated session with Clerk
3. Database table `direct_file_exports` exists (already verified)

## Quick Test Script

Run the automated test script:

```bash
# Without authentication (will show 401 errors)
./scripts/test/test-direct-file-exports.sh

# With authentication
export CLERK_SESSION_TOKEN='your-session-token'
./scripts/test/test-direct-file-exports.sh
```

## Manual Testing

### 1. Get Your Session Token

1. Start your dev server: `pnpm dev`
2. Open browser: `http://localhost:3000`
3. Login to your app
4. Open Developer Tools (F12)
5. Go to **Application** tab → **Cookies**
6. Copy the `__session` or `__clerk_session` cookie value

### 2. Test GET Endpoint

**Using curl:**
```bash
curl -X GET \
  -H "Cookie: __session=YOUR_SESSION_TOKEN" \
  http://localhost:3000/api/tax/direct-file/exports
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "export_1762599947_ce5d20b64",
      "userId": "user_33b1LkF5XgVE4yf2sw92VcYTJ8G",
      "filename": "tax-return-2024.mef-xml",
      "format": "mef-xml",
      "fileSize": 2048,
      "exportDate": "2025-11-08T11:05:47.234Z",
      "createdAt": "2025-11-08T11:05:47.234Z",
      "updatedAt": "2025-11-08T11:05:47.234Z"
    }
  ]
}
```

**Without authentication (401):**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Unauthorized access",
    "timestamp": "2025-11-08T11:00:00.000Z"
  }
}
```

### 3. Test POST Endpoint

**Using curl:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=YOUR_SESSION_TOKEN" \
  -d '{
    "filename": "my-export-2025.json",
    "format": "json",
    "fileSize": 2048
  }' \
  http://localhost:3000/api/tax/direct-file/exports
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Export metadata stored successfully",
  "data": {
    "id": "export_1762599999_abc123",
    "userId": "user_33b1LkF5XgVE4yf2sw92VcYTJ8G",
    "filename": "my-export-2025.json",
    "format": "json",
    "fileSize": 2048,
    "exportDate": "2025-11-08T11:10:00.000Z",
    "createdAt": "2025-11-08T11:10:00.000Z",
    "updatedAt": "2025-11-08T11:10:00.000Z"
  }
}
```

**Validation Error (400):**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=YOUR_SESSION_TOKEN" \
  -d '{
    "filename": "test.pdf",
    "format": "pdf",
    "fileSize": 512
  }' \
  http://localhost:3000/api/tax/direct-file/exports
```

**Expected Response (400):**
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid export metadata: filename and format (mef-xml or json) are required",
    "timestamp": "2025-11-08T11:00:00.000Z"
  }
}
```

### 4. Test DELETE Endpoint

**Using curl:**
```bash
# First, get an export ID from GET endpoint
EXPORT_ID="export_1762599947_ce5d20b64"

curl -X DELETE \
  -H "Cookie: __session=YOUR_SESSION_TOKEN" \
  http://localhost:3000/api/tax/direct-file/exports/$EXPORT_ID
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Export metadata deleted successfully"
}
```

**Not Found (404):**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Export record not found or you do not have permission to delete it",
    "timestamp": "2025-11-08T11:00:00.000Z"
  }
}
```

## Testing with Postman

### Import Collection

1. Create a new collection: "Direct File Exports"
2. Add environment variable: `base_url` = `http://localhost:3000`
3. Add environment variable: `session_token` = (your session token)

### Request 1: GET Exports

- **Method:** GET
- **URL:** `{{base_url}}/api/tax/direct-file/exports`
- **Headers:**
  - `Cookie: __session={{session_token}}`

### Request 2: POST Export

- **Method:** POST
- **URL:** `{{base_url}}/api/tax/direct-file/exports`
- **Headers:**
  - `Content-Type: application/json`
  - `Cookie: __session={{session_token}}`
- **Body (raw JSON):**
```json
{
  "filename": "test-export.json",
  "format": "json",
  "fileSize": 1024
}
```

### Request 3: DELETE Export

- **Method:** DELETE
- **URL:** `{{base_url}}/api/tax/direct-file/exports/{{export_id}}`
- **Headers:**
  - `Cookie: __session={{session_token}}`
- **Note:** Set `export_id` from POST response

## Testing with Browser DevTools

1. Open your app in browser: `http://localhost:3000`
2. Login and open DevTools (F12)
3. Go to **Console** tab
4. Run these commands:

```javascript
// GET exports
fetch('/api/tax/direct-file/exports')
  .then(r => r.json())
  .then(console.log);

// POST new export
fetch('/api/tax/direct-file/exports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filename: 'test-export.json',
    format: 'json',
    fileSize: 1024
  })
})
  .then(r => r.json())
  .then(console.log);

// DELETE export (replace ID)
fetch('/api/tax/direct-file/exports/export_1762599947_ce5d20b64', {
  method: 'DELETE'
})
  .then(r => r.json())
  .then(console.log);
```

## Test Cases

### ✅ Success Cases

1. **GET with auth** - Returns user's export history
2. **POST with valid data** - Creates new export record
3. **POST with mef-xml format** - Creates export with mef-xml format
4. **POST with json format** - Creates export with json format
5. **DELETE own export** - Deletes user's own export
6. **GET orders by date** - Results ordered by export_date DESC

### ❌ Error Cases

1. **GET without auth** - Returns 401 Unauthorized
2. **POST without auth** - Returns 401 Unauthorized
3. **DELETE without auth** - Returns 401 Unauthorized
4. **POST invalid format** - Returns 400 Bad Request
5. **POST missing filename** - Returns 400 Bad Request
6. **POST missing format** - Returns 400 Bad Request
7. **DELETE non-existent ID** - Returns 404 Not Found
8. **DELETE other user's export** - Returns 404 Not Found

## Database Verification

You can verify the data directly in the database:

```sql
-- View all exports
SELECT * FROM direct_file_exports ORDER BY export_date DESC;

-- View exports for specific user
SELECT * FROM direct_file_exports 
WHERE user_id = 'user_33b1LkF5XgVE4yf2sw92VcYTJ8G' 
ORDER BY export_date DESC;

-- Count exports
SELECT COUNT(*) FROM direct_file_exports;
```

## Service Layer Testing

The service functions can be tested directly:

```typescript
import { 
  storeExportMetadata, 
  getExportHistory, 
  deleteExportMetadata 
} from '@/lib/services/direct-file-service';

// Store export
const exportData = await storeExportMetadata({
  userId: 'user_123',
  filename: 'test.json',
  format: 'json',
  fileSize: 1024
});

// Get history
const history = await getExportHistory('user_123');

// Delete export
await deleteExportMetadata(exportData.id);
```

## Troubleshooting

### 401 Unauthorized
- **Cause:** Missing or invalid session token
- **Solution:** Login to app and get fresh session token

### 400 Bad Request
- **Cause:** Invalid request body or validation failure
- **Solution:** Check that format is 'mef-xml' or 'json', and filename is provided

### 404 Not Found (DELETE)
- **Cause:** Export ID doesn't exist or belongs to another user
- **Solution:** Verify the export ID exists and belongs to current user

### 500 Internal Server Error
- **Cause:** Database connection issue or server error
- **Solution:** Check server logs and database connection

## Success Criteria

All tests pass when:
- ✅ GET returns 200 with export history
- ✅ POST returns 201 with created export
- ✅ DELETE returns 200 after deletion
- ✅ Validation rejects invalid formats
- ✅ Authorization prevents unauthorized access
- ✅ Users can only see/delete their own exports


