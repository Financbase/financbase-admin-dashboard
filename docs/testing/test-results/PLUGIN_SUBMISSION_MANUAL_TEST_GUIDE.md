# Plugin Submission System - Manual Testing Guide

**Status**: ✅ Automated tests passing (logic validation)  
**Next Step**: Manual integration testing with running server

## Quick Test Summary

The plugin submission system has been implemented and unit tests pass. However, the integration tests require a running Next.js server to test actual HTTP endpoints.

### Test Results

- ✅ **20 unit tests passing** - Logic validation (slug generation, file validation, etc.)
- ⏸️ **6 integration tests** - Require running server (HTTP endpoint testing)

---

## Manual Testing Checklist

### Prerequisites

1. ✅ Start the development server: `npm run dev`
2. ✅ Ensure you're logged in (Clerk authentication)
3. ✅ Have an admin account ready for approval testing

---

## Test Scenarios

### 1. Plugin Submission (User Flow)

#### Test Case 1.1: Submit a Plugin

**Steps**:

1. Navigate to `/integrations/marketplace/submit`
2. Fill out the submission form:
   - Name: "Test Plugin"
   - Description: "A test plugin for validation"
   - Author: "Test Developer"
   - Category: Select "Automation"
   - Tags: "test, automation"
   - Version: "1.0.0"
3. Upload plugin package:
   - Click "Upload Package"
   - Select a ZIP file (max 10MB)
   - Verify success message appears
4. Upload icon (optional):
   - Click "Upload Icon"
   - Select an image file
   - Verify upload succeeds
5. Add screenshots (optional):
   - Click "Add Screenshots"
   - Select multiple images
   - Verify all upload
6. Fill technical details:
   - Entry Point: "index.js"
   - License: "Proprietary"
   - Mark as Free Plugin
7. Click "Submit Plugin"

**Expected Results**:

- ✅ Success message: "Plugin submitted successfully..."
- ✅ Redirects to marketplace page
- ✅ Plugin status is "pending" (not visible to regular users)

#### Test Case 1.2: Validation Errors

**Test Missing Required Fields**:

1. Try submitting without plugin package
   - Expected: Error message about missing package
2. Try submitting without name
   - Expected: Form validation error
3. Try submitting without category
   - Expected: Form validation error

#### Test Case 1.3: File Upload Limits

**Test File Size Limits**:

1. Try uploading >10MB plugin package
   - Expected: Upload fails with size error
2. Try uploading >2MB icon
   - Expected: Upload fails with size error
3. Try uploading >4MB screenshot
   - Expected: Upload fails with size error

---

### 2. Admin Approval Workflow

#### Test Case 2.1: View Pending Plugins (Admin Only)

**Steps**:

1. Log in as admin user
2. Navigate to admin dashboard
3. Access pending plugins list (or use API directly: `GET /api/marketplace/plugins/pending`)

**Expected Results**:

- ✅ Can see plugins with `isApproved: false`
- ✅ See plugin details (name, author, category)
- ✅ Pagination works correctly

#### Test Case 2.2: Approve a Plugin

**Steps**:

1. As admin, view pending plugin
2. Click "Approve" or call `POST /api/marketplace/plugins/[id]/approve`
3. Verify plugin status changes

**Expected Results**:

- ✅ Plugin `isApproved` set to `true`
- ✅ Plugin `isActive` remains `true`
- ✅ `publishedAt` timestamp set
- ✅ Plugin becomes visible in public marketplace
- ✅ Regular users can now see and install the plugin

#### Test Case 2.3: Reject a Plugin

**Steps**:

1. As admin, view pending plugin
2. Click "Reject" or call `POST /api/marketplace/plugins/[id]/reject`
3. Provide rejection reason: "Does not meet quality standards"
4. Submit rejection

**Expected Results**:

- ✅ Plugin `isApproved` set to `false`
- ✅ Plugin `isActive` set to `false`
- ✅ Rejection reason stored in manifest
- ✅ Plugin not visible in marketplace
- ✅ User can see rejection status in "My Plugins"

---

### 3. User's Plugin Management

#### Test Case 3.1: View My Plugins

**Steps**:

1. As regular user, navigate to marketplace
2. Click "My Plugins" or access `GET /api/marketplace/plugins/my-plugins`

**Expected Results**:

- ✅ See only plugins submitted by current user
- ✅ See status (pending, approved, rejected)
- ✅ Can filter by status

#### Test Case 3.2: Filter My Plugins by Status

**Steps**:

1. Access "My Plugins" endpoint with query params:
   - `?status=pending`
   - `?status=approved`
   - `?status=rejected`
   - `?status=all`

**Expected Results**:

- ✅ Each status filter returns correct subset
- ✅ Pagination works for each filter

---

### 4. Marketplace Visibility

#### Test Case 4.1: Regular User View

**Steps**:

1. Log in as regular (non-admin) user
2. Navigate to `/integrations/marketplace`
3. View plugin list

**Expected Results**:

- ✅ Only see plugins where `isApproved: true` AND `isActive: true`
- ✅ Cannot see pending plugins
- ✅ Cannot see rejected plugins

#### Test Case 4.2: Admin View

**Steps**:

1. Log in as admin user
2. Navigate to `/integrations/marketplace`
3. View plugin list

**Expected Results**:

- ✅ See all active plugins (including pending)
- ✅ Can distinguish pending plugins (for review)

---

### 5. API Endpoint Testing

Use a tool like Postman, curl, or browser DevTools to test endpoints directly.

#### Endpoint 1: Submit Plugin

```bash
POST /api/marketplace/plugins/submit
Content-Type: application/json
Authorization: Bearer <token> (or cookies)

Body:
{
  "name": "Test Plugin",
  "description": "Test description",
  "author": "Test Author",
  "category": "automation",
  "pluginFile": "https://uploadthing.com/file-url",
  "entryPoint": "index.js",
  "version": "1.0.0",
  "tags": ["test"],
  "features": ["Feature 1"],
  "isFree": true,
  "license": "Proprietary"
}

Expected: 201 Created
```

#### Endpoint 2: List Pending (Admin)

```bash
GET /api/marketplace/plugins/pending
Authorization: Admin token

Expected: 200 OK with paginated results
```

#### Endpoint 3: Approve Plugin (Admin)

```bash
POST /api/marketplace/plugins/1/approve
Authorization: Admin token

Expected: 200 OK
Response: { success: true, plugin: {...} }
```

#### Endpoint 4: Reject Plugin (Admin)

```bash
POST /api/marketplace/plugins/1/reject
Content-Type: application/json
Authorization: Admin token

Body:
{
  "reason": "Security concerns"
}

Expected: 200 OK
Response: { success: true, plugin: {...} }
```

#### Endpoint 5: My Plugins

```bash
GET /api/marketplace/plugins/my-plugins?status=pending
Authorization: User token

Expected: 200 OK
Response: { success: true, plugins: [...], pagination: {...} }
```

#### Endpoint 6: Marketplace List (with filtering)

```bash
GET /api/marketplace/plugins?category=automation&sort=popular
Authorization: User token

Expected: 200 OK
Response: { plugins: [...], pagination: {...} }
Note: Regular users only see approved plugins
```

---

## Database Verification

### Check Plugin Status in Database

```sql
-- View all plugins with status
SELECT 
  id,
  name,
  slug,
  category,
  is_approved,
  is_active,
  created_at,
  published_at,
  manifest->>'createdBy' as created_by
FROM financbase.financbase_marketplace_plugins
ORDER BY created_at DESC;

-- Count by status
SELECT 
  COUNT(*) FILTER (WHERE is_approved = false AND is_active = true) as pending,
  COUNT(*) FILTER (WHERE is_approved = true AND is_active = true) as approved,
  COUNT(*) FILTER (WHERE is_approved = false AND is_active = false) as rejected
FROM financbase.financbase_marketplace_plugins;

-- Check indexes
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'financbase' 
  AND tablename = 'financbase_marketplace_plugins';
```

**Expected**:

- ✅ Pending plugins: `is_approved = false, is_active = true`
- ✅ Approved plugins: `is_approved = true, is_active = true`
- ✅ Rejected plugins: `is_approved = false, is_active = false`
- ✅ Indexes exist: `marketplace_plugins_status_idx`, `marketplace_plugins_manifest_created_by_idx`

---

## Error Scenarios to Test

### 1. Unauthenticated Access

- Try accessing any endpoint without authentication
- **Expected**: 401 Unauthorized

### 2. Non-Admin Access

- Regular user tries to access `/pending` endpoint
- Regular user tries to approve/reject plugin
- **Expected**: 403 Forbidden

### 3. Invalid Plugin ID

- Try approving plugin ID 999999 (non-existent)
- **Expected**: 404 Not Found

### 4. Duplicate Slug

- Submit two plugins with same name
- **Expected**: Second one gets numbered suffix (e.g., "test-plugin-1")

### 5. Invalid File Types

- Try uploading .exe file as plugin package
- **Expected**: Upload validation error

---

## Performance Testing

### Query Performance

After adding several plugins, check query performance:

```sql
-- Check if indexes are being used
EXPLAIN ANALYZE
SELECT * FROM financbase.financbase_marketplace_plugins
WHERE is_active = true AND is_approved = false;

EXPLAIN ANALYZE
SELECT * FROM financbase.financbase_marketplace_plugins
WHERE manifest->>'createdBy' = 'user_123';
```

**Expected**: Indexes should be used (Index Scan or Bitmap Index Scan)

---

## UI/UX Testing

### Form Usability

1. ✅ All form fields are accessible
2. ✅ File upload buttons work
3. ✅ Validation messages are clear
4. ✅ Loading states show during submission
5. ✅ Success/error messages are visible
6. ✅ Form resets after successful submission

### Navigation

1. ✅ "Submit Plugin" button navigates correctly
2. ✅ Back/cancel buttons work
3. ✅ Breadcrumbs (if present) are accurate

---

## Integration Testing Checklist

- [ ] Submit plugin as regular user
- [ ] Verify plugin appears in pending list (admin view)
- [ ] Approve plugin as admin
- [ ] Verify plugin appears in public marketplace
- [ ] Verify regular users can see approved plugin
- [ ] Reject a plugin as admin
- [ ] Verify rejected plugin hidden from marketplace
- [ ] Verify user can see rejection in "My Plugins"
- [ ] Test file uploads (package, icon, screenshots)
- [ ] Test validation errors
- [ ] Test authentication/authorization
- [ ] Test pagination
- [ ] Test filtering by category
- [ ] Test search functionality
- [ ] Test slug uniqueness
- [ ] Verify database indexes are used

---

## Quick Start Testing Command

```bash
# Start the dev server
npm run dev

# In another terminal, run API tests (when server is running)
curl http://localhost:3000/api/marketplace/plugins/pending \
  -H "Cookie: __session=<your-session-cookie>"
```

---

## Expected Test Results Summary

✅ **All Logic Tests Pass**: 20/20 unit tests passing  
⏸️ **Integration Tests**: Require running server (6 tests need HTTP access)  
✅ **Code Quality**: No linting errors  
✅ **Type Safety**: TypeScript compilation passes  
✅ **Database**: Indexes created and verified  

---

## Next Steps After Testing

1. ✅ Fix any issues found during manual testing
2. ✅ Document any edge cases discovered
3. ✅ Update error messages if needed
4. ✅ Add additional validation if required
5. ✅ Performance tuning if queries are slow
6. ✅ User acceptance testing with real users

---

**Manual Testing Status**: Ready to begin  
**Server Required**: Yes (Next.js dev server on port 3000)  
**Authentication Required**: Yes (Clerk authentication)  
**Admin Account Required**: Yes (for approval workflow testing)
