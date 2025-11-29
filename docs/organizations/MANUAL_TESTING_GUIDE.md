# Manual Testing Guide for Multi-Organization Feature

## 🎯 Overview

This guide provides step-by-step instructions for manually testing the multi-organization feature before production deployment.

## ✅ Pre-Testing Checklist

- [ ] Development server is running (`pnpm dev`)
- [ ] Database migration completed (`0065_multi_organization_support.sql`)
- [ ] RLS policies updated (`0067_update_compliance_rls_policies.sql`)
- [ ] You have a test user account with Clerk authentication
- [ ] Browser developer tools open (to check cookies and network requests)

## 🧪 Test Scenarios

### 1. Organization Creation

**Steps:**

1. Navigate to `/organizations` in your browser
2. Click "Create Organization" or use the organization switcher dropdown
3. Fill in the form:
   - Name: "Test Organization 1"
   - Description: "This is a test organization"
   - (Optional) Slug: "test-org-1"
4. Click "Create" or "Save"

**Expected Results:**

- ✅ Organization is created successfully
- ✅ Success message appears
- ✅ Organization appears in the organization switcher dropdown
- ✅ You are automatically set as the owner
- ✅ Organization appears in the organizations list

**Verify in Database:**

```sql
SELECT id, name, slug, owner_id, is_active 
FROM organizations 
WHERE name = 'Test Organization 1';
```

**Verify in UI:**

- Organization switcher shows the new organization
- Organization card appears in the list
- You can click to view organization details

---

### 2. Organization Switching

**Steps:**

1. Create at least 2 organizations (or use existing ones)
2. Click the organization switcher in the header (top right)
3. Select a different organization from the dropdown
4. Observe the page behavior

**Expected Results:**

- ✅ Organization switches immediately
- ✅ Cookie `active_organization_id` is set (check in DevTools → Application → Cookies)
- ✅ Page refreshes or data reloads
- ✅ URL may update to reflect the active organization
- ✅ Data displayed changes based on active organization

**Verify Cookie:**

- Open DevTools → Application → Cookies
- Look for `active_organization_id`
- Value should be the UUID of the selected organization
- Expiry should be ~30 days

**Verify Data Isolation:**

- Create some data (e.g., a transaction, invoice) in Organization A
- Switch to Organization B
- Verify Organization A's data is NOT visible
- Switch back to Organization A
- Verify Organization A's data IS visible again

---

### 3. Member Invitation

**Steps:**

1. Navigate to an organization you own
2. Go to "Members" or "Settings" → "Members"
3. Click "Invite Member"
4. Fill in:
   - Email: `test-member@example.com`
   - Role: Select "Member" or "Admin"
   - (Optional) Message: "Welcome to our organization!"
5. Click "Send Invitation"

**Expected Results:**

- ✅ Invitation is created
- ✅ Success message appears
- ✅ Invitation appears in "Pending Invitations" list
- ✅ Email is sent (check email service logs or inbox)
- ✅ Invitation has status "pending"

**Verify in Database:**

```sql
SELECT id, email, role, status, expires_at 
FROM organization_invitations 
WHERE email = 'test-member@example.com';
```

**Verify Email:**

- Check email inbox for invitation
- Email should contain invitation link
- Link should be: `/invitations/[token]`

---

### 4. Accept Invitation

**Steps:**

1. Open the invitation email
2. Click the invitation link (or copy URL)
3. If not logged in, sign in/sign up
4. Review invitation details
5. Click "Accept Invitation"

**Expected Results:**

- ✅ Invitation is accepted
- ✅ Success message appears
- ✅ User is added to organization members
- ✅ User is redirected to dashboard or organization page
- ✅ Organization appears in user's organization list
- ✅ Invitation status changes to "accepted"

**Verify in Database:**

```sql
SELECT om.*, o.name as org_name
FROM organization_members om
JOIN organizations o ON om.organization_id = o.id
WHERE om.user_id = '[user_id]';
```

**Verify in UI:**

- New member appears in organization members list
- Member can switch to the organization
- Member has appropriate role permissions

---

### 5. Member Role Management

**Steps:**

1. Navigate to organization members list
2. Find a member (not yourself)
3. Click "Edit" or "Change Role"
4. Select a new role (e.g., "Admin" or "Viewer")
5. Click "Save"

**Expected Results:**

- ✅ Role is updated successfully
- ✅ Success message appears
- ✅ Member's role is updated in the list
- ✅ Member's permissions change accordingly

**Test Permission Changes:**

- As Owner: Can update any role
- As Admin: Can update member/viewer roles (not owner/admin)
- As Member/Viewer: Cannot update roles (should see error)

**Verify in Database:**

```sql
SELECT user_id, role, updated_at 
FROM organization_members 
WHERE organization_id = '[org_id]' AND user_id = '[member_id]';
```

---

### 6. Remove Member

**Steps:**

1. Navigate to organization members list
2. Find a member to remove
3. Click "Remove" or "Delete"
4. Confirm removal

**Expected Results:**

- ✅ Member is removed from organization
- ✅ Success message appears
- ✅ Member disappears from the list
- ✅ Member can no longer access organization data

**Verify in Database:**

```sql
SELECT COUNT(*) 
FROM organization_members 
WHERE organization_id = '[org_id]' AND user_id = '[member_id]';
-- Should return 0
```

---

### 7. Data Isolation (Critical Test)

**Steps:**

1. **Setup:**
   - Create Organization A
   - Create Organization B
   - Ensure you're a member of both

2. **Test in Organization A:**
   - Switch to Organization A
   - Create some data (e.g., transaction, invoice, client)
   - Note the data IDs or names

3. **Switch to Organization B:**
   - Switch to Organization B
   - Verify Organization A's data is NOT visible
   - Create different data in Organization B

4. **Switch Back:**
   - Switch back to Organization A
   - Verify Organization A's data IS visible
   - Verify Organization B's data is NOT visible

**Expected Results:**

- ✅ Data is completely isolated between organizations
- ✅ No cross-organization data leakage
- ✅ RLS policies are working correctly
- ✅ Switching organizations changes visible data immediately

**Verify RLS:**

```sql
-- Set active organization context
SET app.current_org_id = '[org_a_id]';

-- Query should only return Org A data
SELECT * FROM financbase_security_incidents;

-- Switch context
SET app.current_org_id = '[org_b_id]';

-- Query should only return Org B data
SELECT * FROM financbase_security_incidents;
```

---

### 8. Permission System

**Test as Owner:**

- [ ] Can create organization
- [ ] Can update organization settings
- [ ] Can delete organization
- [ ] Can invite members
- [ ] Can update any member's role
- [ ] Can remove any member
- [ ] Can access all organization data

**Test as Admin:**

- [ ] Can update organization settings
- [ ] Can invite members
- [ ] Can update member/viewer roles (not owner/admin)
- [ ] Can remove members (not owners)
- [ ] Can access all organization data

**Test as Member:**

- [ ] Can view organization data
- [ ] Can create/edit data within organization
- [ ] Cannot update organization settings
- [ ] Cannot invite members
- [ ] Cannot manage members

**Test as Viewer:**

- [ ] Can view organization data (read-only)
- [ ] Cannot create/edit data
- [ ] Cannot update organization settings
- [ ] Cannot invite members
- [ ] Cannot manage members

---

### 9. Organization Settings

**Steps:**

1. Navigate to organization settings
2. Update various settings:
   - Organization name
   - Description
   - Logo
   - Billing email
   - Address
   - Phone
3. Save changes

**Expected Results:**

- ✅ Settings are saved successfully
- ✅ Changes are reflected immediately
- ✅ Settings persist after page refresh

**Verify in Database:**

```sql
SELECT name, description, logo, billing_email, address, phone 
FROM organizations 
WHERE id = '[org_id]';
```

---

### 10. Error Scenarios

**Test Invalid Operations:**

- [ ] Try to switch to organization you're not a member of (should fail)
- [ ] Try to update organization without permission (should fail)
- [ ] Try to accept expired invitation (should fail)
- [ ] Try to create organization with duplicate slug (should auto-generate unique slug)
- [ ] Try to remove yourself as owner (should fail or require transfer)

**Expected Results:**

- ✅ Appropriate error messages displayed
- ✅ No data corruption
- ✅ System remains stable

---

## 🔍 Verification Queries

### Check Organizations

```sql
SELECT id, name, slug, owner_id, is_active, created_at 
FROM organizations 
ORDER BY created_at DESC;
```

### Check Members

```sql
SELECT 
  o.name as org_name,
  u.email,
  om.role,
  om.joined_at
FROM organization_members om
JOIN organizations o ON om.organization_id = o.id
JOIN financbase.users u ON om.user_id = u.id
ORDER BY o.name, om.role;
```

### Check Invitations

```sql
SELECT 
  o.name as org_name,
  oi.email,
  oi.role,
  oi.status,
  oi.expires_at,
  oi.created_at
FROM organization_invitations oi
JOIN organizations o ON oi.organization_id = o.id
WHERE oi.status = 'pending'
ORDER BY oi.created_at DESC;
```

### Check RLS Policies

```sql
SELECT COUNT(*) as updated_policies
FROM pg_policies
WHERE (qual::text LIKE '%get_active_organization_id%' 
   OR with_check::text LIKE '%get_active_organization_id%')
   OR (qual::text LIKE '%app.current_org_id%' 
   OR with_check::text LIKE '%app.current_org_id%');
```

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

✅ Organization Creation: [ ] Pass [ ] Fail
✅ Organization Switching: [ ] Pass [ ] Fail
✅ Member Invitation: [ ] Pass [ ] Fail
✅ Accept Invitation: [ ] Pass [ ] Fail
✅ Member Role Management: [ ] Pass [ ] Fail
✅ Remove Member: [ ] Pass [ ] Fail
✅ Data Isolation: [ ] Pass [ ] Fail
✅ Permission System: [ ] Pass [ ] Fail
✅ Organization Settings: [ ] Pass [ ] Fail
✅ Error Scenarios: [ ] Pass [ ] Fail

Issues Found:
1. 
2. 
3. 

Notes:
```

---

## 🚨 Critical Issues to Watch For

1. **Data Leakage:** Data from one organization visible in another
2. **Permission Bypass:** Users accessing data they shouldn't
3. **Cookie Issues:** Active organization not persisting
4. **RLS Failures:** Policies not filtering correctly
5. **Invitation Issues:** Invitations not working or expiring incorrectly

---

## ✅ Sign-Off

After completing all tests:

- [ ] All critical tests passed
- [ ] No data leakage detected
- [ ] Permissions working correctly
- [ ] RLS policies verified
- [ ] Ready for production

**Tester Signature:** ___________
**Date:** ___________
